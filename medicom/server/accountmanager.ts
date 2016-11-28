/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Chifeng Wen.
 * MediCom is free software; you can redistribute it and/or modify it under the terms of
 * the GNU General Public License, version 2, as published by the Free Software Foundation.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import {AdminRecordModel} from "./adminrecordmodel";
import {ProfileModel} from "./profilemodel";
import {IdentityModel} from "./identitymodel";
import {PrivilegeNetwork} from "./privilegenetwork";
import {MongoUtil} from "../api/mongoutil";
import {AdminRecord} from "../api/adminrecord";
import {Profile} from "../api/profile";
import {UserGroup, UserGroupConst} from "../api/usergroup";


/*
 * <AccountManager>
 */
export class AccountManager
{
        private util:                   MongoUtil;
        private records:                AdminRecordModel;
        private profiles:               ProfileModel;
        private identities:             IdentityModel;
        private privileges:             PrivilegeNetwork;

        private ROOT_ACCOUNT_ID:        number = -1;
        private ROOT_PASSWORD:          string = "42f2d30a";

        private TEMP_ACCOUNT_ID:        number = -2;
        private TEMP_PASSWORD:          string = "";

        private root:                   AdminRecord = null;
        private temp:                   AdminRecord = null;

        constructor(util: MongoUtil, 
                    records: AdminRecordModel, 
                    profiles: ProfileModel, 
                    identities: IdentityModel, 
                    priv_network: PrivilegeNetwork)
        {
                this.util = util;
                this.records = records;
                this.profiles = profiles
                this.identities = identities;
                this.privileges = priv_network;
        }

        public system_init(): void
        {
                // Create a root and default identity.
                try {
                        this.root = this.create_account_with_id(UserGroupConst.Root,
                                                                this.ROOT_ACCOUNT_ID,
                                                                this.ROOT_PASSWORD, "##root##");
                        this.activate_account(this.root);
                } catch (error) {
                        console.log(error.toString());
                        this.root = this.get_account_record_by_id(this.ROOT_ACCOUNT_ID);
                }
        
                try {
                        this.temp = this.create_account_with_id(UserGroupConst.Temporary,
                                                                this.TEMP_ACCOUNT_ID,
                                                                this.TEMP_PASSWORD, "##temp##");
                        this.activate_account(this.temp);
                } catch (error) {
                        console.log(error.toString());
                        this.temp = this.get_account_record_by_id(this.TEMP_ACCOUNT_ID);
                }
        }

        private make_account_derivatives(registered: AdminRecord, email: string, privi_ref: number): AdminRecord
        {
                // Create profile.
                if (registered === null) 
                        return null;
                if (this.profiles.create_new_profile(registered.get_account_id(), email) == null) {
                        // failed to create the profile, need to remove the record_fetched.
                        this.records.remove_record_by_id(registered.get_account_id());
                        this.privileges.free(registered.get_privilege_ref());
                        throw Error("Profile with email " + email + " exists");
                }
                return registered;
        }

        // Return an AdminRecord if successful, or otherwise null.
        public create_account_with_id(user_group: number, account_id: number, password: string, email: string): AdminRecord
        {
                if (this.records.has_record(account_id))
                        throw Error("Account with ID " + account_id + " exists");
                var privi_ref = user_group == UserGroupConst.Root ?
                                        this.privileges.allocate_root() :
                                        this.privileges.allocate();
                var registered = this.records.create_new_record_with_id(user_group, account_id, password, privi_ref);
                return this.make_account_derivatives(registered, email, privi_ref);
        }

        // Return an AdminRecord if successful, or otherwise null.
        public create_account(user_group: number, password: string, email: string): AdminRecord
        {
                var privi_ref = this.privileges.allocate();
                var registered = this.records.create_new_record(
                                        user_group, password, privi_ref);
                return this.make_account_derivatives(registered, email, privi_ref);
        }

        // Return an AdminRecord if successful, or otherwise null.
        public get_account_record_by_id(account_id: number): AdminRecord
        {
                return this.records.get_record_by_id(account_id);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        public get_account_record_by_auth_code(auth_code: string): AdminRecord
        {
                return this.records.get_record_by_auth_code(auth_code);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        public get_account_record_by_email(email: string): AdminRecord
        {
                var profile = this.profiles.get_profile_by_email(email);
                if (profile === null) return null;
                return this.records.get_record_by_id(profile.get_account_id());
        }
        
        // Return true if the activation is successful, false when the record doesn't exist or the activator is invalid.
        public activate_account(record: AdminRecord): boolean
        {
                if (record === null)
                        return false;
                record.activate();
                this.records.update_record(record);
                return true;
        }
        
        public update_account_auth_code(record): boolean
        {
                if (record === null)
                        return false;
                record.set_auth_code(this.util.get_string_uuid());
                this.records.update_record(record);
                return true;
        }
        
        public remove_account_by_id(account_id: number): boolean
        {
                var record = this.records.get_record_by_id(account_id);
                if (record == null) 
                        return false;
                var user_group = record.user_group();
        
                this.profiles.remove_profile_by_id(account_id);
                this.identities.remove_identities_by_account_id(account_id);
                this.privileges.free(record.get_privilege_ref());
                this.records.remove_record_by_id(account_id);
                return true;
        }
        
        public search_account_profiles(key_word: string, cap: number): Array<Profile>
        {
                var all_profiles = this.profiles.get_all_profiles();
                var qualified = new Array<Profile>();
                var lower_key = key_word.toLowerCase();

                for (var i = 0; i < all_profiles.length; i ++) {
                        if ((all_profiles[i].get_name() != null &&
                             -1 != all_profiles[i].get_name().toLowerCase().indexOf(lower_key)) ||
                            (all_profiles[i].get_email() != null &&
                             -1 != all_profiles[i].get_email().toLowerCase().indexOf(lower_key)) ||
                             -1 != all_profiles[i].get_account_id().toString().toLowerCase().indexOf(lower_key)) {
                                qualified.push(all_profiles[i]);
                        }
                        if (cap != null && qualified.length >= cap)
                                break;
                }
                return qualified;
        }
        
        public get_temporary_account_record(): AdminRecord
        {
                if (this.temp == null)
                        throw Error("Logic error: temporary account record doesn't exist. It should be set up properly during system init");
                return this.temp;
        }
        
        public get_root_account_record(): AdminRecord
        {
                if (this.root == null)
                        throw Error("Logic error: root account record doesn't exist. It should be set up properly during system init");
        
                return this.root;
        }
        
        // Reset all the account information.
        public reset(): number
        {
                return this.records.reset() + this.profiles.reset();
        }
};

