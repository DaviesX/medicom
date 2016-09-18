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

import {AccountManager} from "./accountmanager.ts";
import {IdentityModel} from "./identitymodel.ts";
import {ProfileModel} from "./profilemodel.ts";
import {PrivilegeNetwork} from "./privilegenetwork.ts";
import {DataModelContext} from "./datamodelcontext.ts";
import {Profile} from "../api/profile.ts";
import {Identity} from "../api/identity.ts";
import {ErrorMessages} from "../api/error.ts";
import {MongoUtil} from "../api/mongoutil.ts";
import {AdminRecord} from "../api/adminrecord.ts";
import {AccountInfo} from "../api/accountinfo.ts";
import {ROOT_ACTIONS, 
        ADMIN_ACTIONS,
        TEMPORARY_ACTIONS,
        PROVIDER_ACTIONS,
        ASSISTANT_ACTIONS,
        PATIENT_ACTIONS} from "../api/privilege.ts";
import {UserGroup, 
        UserGroupConst,
        user_group_get_registerable} from "../api/usergroup.ts";


/*
 * <AccountControl>
 */
export class AccountControl
{
        private accounts:       AccountManager;
        private profiles:       ProfileModel;
        private identities:     IdentityModel;
        private privileges:     PrivilegeNetwork;

        constructor()
        {
                this.accounts = DataModelContext.get_account_manager();
                this.profiles = DataModelContext.get_profile_model();
                this.identities = DataModelContext.get_identity_model();
                this.privileges = DataModelContext.get_privilege_network();
        }

        public system_init(): void
        {
                this.accounts.system_init();
                // Inject root actions.
                for (var i = 0; i < ROOT_ACTIONS.length; i ++)
                        this.privileges.add_root_action(ROOT_ACTIONS[i].action);
        }

        public register(user_group_str: string, email: string, 
                        name: string, phone: string, password: string, 
                        err: ErrorMessages): AccountInfo
        {
                return this.create_account(
                                this.get_temporary_identity(),
                                user_group_str, email, name, phone, password, err);
        }

        public create_account(identity: Identity, user_group_str: string, 
                              email: string, name: string, phone: string, password: string, 
                              err: ErrorMessages): AccountInfo
        {
                var user_group: UserGroup;
                try {
                        user_group = new UserGroup(1);
                        user_group.from_string(user_group_str);
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }

                // Check permission.
                if (user_group.is(UserGroupConst.Admin) &&
                    !this.privileges.has_action(
                                identity.get_account_record().get_privilege_ref(),
                                "create account", [])) {
                        err.log("You don't have the permission to create an admin account");
                        return null;
                }

                // Create admin record.
                var record: AdminRecord;
                try {
                        record = this.accounts.create_account(user_group.what(), password, email);
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }

                // Update profile.
                var profile = this.profiles.get_profile_by_id(record.get_account_id());
                profile.set_name(name);
                profile.set_phone(phone);
                this.profiles.update_profile(profile);

                // Update privilege settings.
                var user_group_actions;
                switch (user_group.what()) {
                        case UserGroupConst.Admin: {
                                user_group_actions = ADMIN_ACTIONS;
                                break;
                        }
                        case UserGroupConst.Assistant: {
                                user_group_actions = ASSISTANT_ACTIONS;
                                break;
                        }
                        case UserGroupConst.Provider: {
                                user_group_actions = PROVIDER_ACTIONS;
                                break;
                        }
                        case UserGroupConst.Patient: {
                                user_group_actions = PATIENT_ACTIONS;
                                break;
                        }
                        case UserGroupConst.Temporary:
                        default: {
                                user_group_actions = TEMPORARY_ACTIONS;
                                break;
                        }
                }
                var root_record = this.accounts.get_root_account_record();
                for (var i = 0; i < user_group_actions.length; i ++) {
                        if (!this.privileges.derive_action_from(root_record.get_privilege_ref(),
                                                                    record.get_privilege_ref(),
                                                                    user_group_actions[i].action,
                                                                    user_group_actions[i].scope,
                                                                    user_group_actions[i].grant_option)) {
                                throw new Error("Logic error: failed to add action for: " +
                                                JSON.stringify(record) +
                                                " from: " + JSON.stringify(root_record));
                        }
                }

                // Extract account info.
                var account_info = new AccountInfo(record,
                                                   record.get_account_id(),
                                                   profile.get_name(),
                                                   profile.get_email());
                return account_info;
        }

        public get_root_identity(): Identity
        {
                return this.identities.create_identity(this.accounts.get_root_account_record());
        }
        
        public get_temporary_identity(): Identity
        {
                return this.identities.create_identity(this.accounts.get_temporary_account_record());
        }
        
        public get_all_account_infos(identity: Identity): Array<AccountInfo>
        {
                return new Array<AccountInfo>();
        }

        private remove_account(identity: Identity, record: AdminRecord, err: ErrorMessages): boolean
        {
                if (!this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                     "remove account",
                                                     [record.get_privilege_ref()]) &&
                     !this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                     "remove account",
                                                     [record.user_group()])) {
                        err.log("You don't have the permission to remove this account.");
                        return false;
                }
                this.accounts.remove_account_by_id(record.get_account_id());
                return true;
        }

        public remove_account_by_id(identity: Identity, account_id: number, err: ErrorMessages): boolean
        {
                if (account_id == null) {
                        err.log("Account ID given is invalid");
                        return false;
                }
                if (!this.identities.verify_identity(identity)) {
                        err.log("Your identity is invalid");
                        return false;
                }
                var record = this.accounts.get_account_record_by_id(account_id);
                if (record == null) {
                        err.log("No such account id " + account_id + " exists")
                        return false;
                }
                return this.remove_account(identity, record, err);
        }

        public remove_account_by_email(identity: Identity, email: string, err: ErrorMessages): boolean
        {
                if (email == null) {
                        err.log("Email given is invalid");
                        return false;
                }
                if (!this.identities.verify_identity(identity)) {
                        err.log("Your identity is invalid");
                        return false;
                }
                var record = this.accounts.get_account_record_by_email(email);
                if (record == null) {
                        err.log("No such account " + email + " exists")
                        return false;
                }
                return this.remove_account(identity, record, err);
        }

        public get_account_infos_by_ids(identity: Identity, account_ids: Array<number>, err: ErrorMessages): Array<AccountInfo>
        {
                if (account_ids == null) {
                        err.log("Account IDs given are invalid");
                        return null;
                }
                if (!this.identities.verify_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var self_record = identity.get_account_record();
                var infos = [];
                for (var i = 0; i < account_ids.length; i ++) {
                        var record = this.accounts.get_account_record_by_id(account_ids[i]);
                        if (record == null ||
                            (!this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                    "search account",
                                                    [record.get_privilege_ref()]) &&
                            !this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                    "search account",
                                                    [record.user_group()]))) {
                                // Don't have the permission to search this account.
                                continue;
                        }
                        var profile = this.profiles.get_profile_by_id(account_ids[i]);
                        infos.push(new AccountInfo(record, account_ids[i],
                                                   profile.get_name(), profile.get_email()));
                }
                return infos;
        }

        public get_account_info_by_id(identity: Identity, account_id: number, err: ErrorMessages): AccountInfo
        {
                if (account_id == null) {
                        err.log("Account ID given is invalid");
                        return null;
                }
                var infos = this.get_account_infos_by_ids(identity, [account_id], err);
                return infos != null ? infos[0] : null;
        }
        
        public search_account_infos(identity: Identity, key_word: string, cap: number, err: ErrorMessages): Array<AccountInfo>
        {
                if (!this.identities.verify_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var profiles = this.accounts.search_account_profiles(key_word, null);
                var infos = [];
                for (var i = 0; i < profiles.length; i ++) {
                        var record = this.accounts.get_account_record_by_id(profiles[i].get_account_id());
                        if (record.is_active() &&
                            this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                           "search account", [record.user_group()])) {
                                infos.push(new AccountInfo(record, record.get_account_id(),
                                                           profiles[i].get_name(),
                                                           profiles[i].get_email()));
                        }
                        if (cap != null && infos.length >= cap)
                                break;
                }
                return infos;
        }
        
        public login_by_email(email: string, password: string, err: ErrorMessages): Identity
        {
                var record = this.accounts.get_account_record_by_email(email);
                if (record == null) {
                        err.log("Account with email: " + email + " doesn't exist");
                        return null;
                }
                var identity = this.get_temporary_identity();
                try {
                        identity = this.identities.elevate_by_user_password(identity, record, password);
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }
                return identity;
        }
        
        public login_by_account_id(account_id: number, password: string, err: ErrorMessages): Identity
        {
                var record = this.accounts.get_account_record_by_id(account_id);
                var identity = this.get_temporary_identity();
                try {
                        identity = this.identities.elevate_by_user_password(identity, record, password);
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }
                return identity;
        }
        
        public logout(identity: Identity, err: ErrorMessages): void 
        {
                if (!this.identities.verify_identity(identity))
                        err.log("The identity is invalid");
                this.identities.logout(identity);
        }
        
        private __activate(identity: Identity, record: AdminRecord, err: ErrorMessages): void
        {
                if (!this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                    "activate account",
                                                    [record.get_privilege_ref()]))
                        throw Error("You don't have the permission to force activate the account: " + record.get_account_id());
                this.accounts.activate_account(record);
        }
        
        public activate(auth_code: string, err: ErrorMessages): boolean
        {
                // Retrieve record.
                var record = this.accounts.get_account_record_by_auth_code(auth_code);
                if (record == null) {
                        err.log("Failed to find your account, possbily due to an invalid authorization code: " + auth_code);
                        return false;
                }

                // Elevate to root.
                var identity = this.identities.create_identity(record);
                var root_record = this.accounts.get_root_account_record();
                try {
                        identity = this.identities.elevate_by_identity_auth_code(identity, auth_code, root_record);
                } catch (error) {
                        err.log(error.toString());
                        return false;
                }

                // Update auth code and activate.
                try {
                        this.__activate(identity, record, err);
                } catch (error) {
                        err.log(error.toString());
                        return false;
                } finally {
                        // Log out from root.
                        this.identities.logout(identity);
                }
                this.accounts.update_account_auth_code(record);
                this.identities.logout(identity);
                return true;
        }
        
        public force_activate(identity: Identity, account_id: number, err: ErrorMessages): boolean
        {
                try {
                        this.identities.verify_identity(identity);
                } catch (error) {
                        err.log(error.toString());
                }
                var record = this.accounts.get_account_record_by_id(account_id);
                if (record == null) {
                        err.log("Your account is invalid");
                        return false;
                }
                try {
                        this.__activate(identity, record, err);
                } catch (error) {
                        err.log(error.toString());
                        return false;
                }
                return true;
        }
};

