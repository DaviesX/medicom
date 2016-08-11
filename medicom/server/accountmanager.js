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
// Data models go here
import {Meteor} from "meteor/meteor";
import {AdminRecordModel} from "./adminrecordmodel.js";
import {ProfileModel} from "./profilemodel.js";
import {ProviderModel} from "./providermodel.js";
import {PrivilegeNetwork} from "./privilegenetwork.js";
import * as M_UserGroup from "../api/usergroup.js";


export function AccountManager(mongo,
                               admin_record_model,
                               profile_model,
                               provider_model,
                               patient_model,
                               identity_model,
                               priv_network)
{
        this.__mongo = mongo;
        this.__admin_record_model = admin_record_model;
        this.__profile_model = profile_model;
        this.__provider_model = provider_model;
        this.__patient_model = patient_model;
        this.__identity_model = identity_model;
        this.__priv_network = priv_network;

        this.__c_Root_Account_ID = -1;
        this.__c_Root_Password = "42f2d30a";

        this.__c_Temp_Account_ID = -2;
        this.__c_Temp_Password = "";

        this.__root_record = null;
        this.__temp_record = null;

}

AccountManager.prototype.system_init = function()
{
        // Create a root and default identity.
        try {
                this.__root_record = this.create_account_with_id(M_UserGroup.c_UserGroup_Root,
                                                                 this.__c_Root_Account_ID,
                                                                 this.__c_Root_Password, "##root##");
                this.activate_account(this.__root_record);
        } catch (error) {
                console.log(error.toString());
                this.__root_record = this.get_account_record_by_id(this.__c_Root_Account_ID);
        }

        try {
                this.__temp_record = this.create_account_with_id(M_UserGroup.c_UserGroup_Temporary,
                                                                 this.__c_Temp_Account_ID,
                                                                 this.__c_Temp_Password, "##temp##");
                this.activate_account(this.__temp_record);
        } catch (error) {
                console.log(error.toString());
                this.__temp_record = this.get_account_record_by_id(this.__c_Temp_Account_ID);
        }
}

// Public functions
AccountManager.prototype.__make_account_derivatives = function(registered, email, privi_ref)
{
        // Create profile.
        if (registered === null) return null;
        if (this.__profile_model.create_new_profile(registered.get_account_id(), email) == null) {
                // failed to create the profile, need to remove the record_fetched.
                this.__admin_record_model.remove_record_by_id(registered.get_account_id());
                this.__priv_network.free(registered.get_privilege_ref());
                throw Error("Profile with email " + email + " exists");
        }
        // Create a user group specific record and set up default user group privileges for it..
        switch (registered.user_group()) {
        case M_UserGroup.c_UserGroup_Admin: {
                break;
        }
        case M_UserGroup.c_UserGroup_Provider: {
                this.__provider_model.create_provider(registered.get_account_id());
                break;
        }
        case M_UserGroup.c_UserGroup_Patient: {
                this.__patient_model.create_patient(registered.get_account_id());
                break;
        }
        case M_UserGroup.c_UserGroup_Assistant: {
                break;
        }
        case M_UserGroup.c_UserGroup_Root: {
                break;
        }
        default:
        case M_UserGroup.c_UserGroup_Temporary: {
                break;
        }
        }
        return registered;
}

// Return an AdminRecord if successful, or otherwise null.
AccountManager.prototype.create_account_with_id = function(user_group, account_id, password, email)
{
        if (this.__admin_record_model.has_record(account_id))
                throw Error("Account with ID " + account_id + " exists");
        var privi_ref = user_group == M_UserGroup.c_UserGroup_Root ?
                                this.__priv_network.allocate_root() :
                                this.__priv_network.allocate();
        var registered = this.__admin_record_model.create_new_record_with_id(
                                        user_group, account_id, password, privi_ref);
        return this.__make_account_derivatives(registered, email, privi_ref);
}

// Return an AdminRecord if successful, or otherwise null.
AccountManager.prototype.create_account = function(user_group, password, email)
{
        var privi_ref = this.__priv_network.allocate();
        var registered = this.__admin_record_model.create_new_record(
                                user_group, password, privi_ref);
        return this.__make_account_derivatives(registered, email, privi_ref);
}

// Return an AdminRecord if successful, or otherwise null.
AccountManager.prototype.get_account_record_by_id = function(account_id)
{
        return this.__admin_record_model.get_record_by_id(account_id);
}

// Return an AdminRecord if successful, or otherwise null.
AccountManager.prototype.get_account_record_by_auth_code = function(auth_code)
{
        return this.__admin_record_model.get_record_by_auth_code(auth_code);
}

// Return an AdminRecord if successful, or otherwise null.
AccountManager.prototype.get_account_record_by_email = function(email)
{
        var profile = this.__profile_model.get_profile_by_email(email);
        if (profile === null) return null;
        return this.__admin_record_model.get_record_by_id(profile.get_account_id());
}

// Return true if the activation is successful, false when the record doesn't exist or the activator is invalid.
AccountManager.prototype.activate_account = function(record)
{
        if (record === null)
                return false;
        record.activate();
        this.__admin_record_model.update_record(record);
        return true;
}

AccountManager.prototype.update_account_auth_code = function(record)
{
        if (record === null)
                return false;
        record.set_auth_code(this.__mongo.get_string_uuid());
        this.__admin_record_model.update_record(record);
        return true;
}

AccountManager.prototype.remove_account_by_id = function(account_id)
{
        var record = this.__admin_record_model.get_record_by_id(account_id);
        if (record == null) return false;
        var user_group = record.user_group();

        switch (user_group) {
        case M_UserGroup.c_UserGroup_Provider: {
                this.__provider_model.remove_provider_by_id(account_id);
                break;
        }
        case M_UserGroup.c_UserGroup_Patient: {
                this.__patient_model.remove_patient_by_id(account_id);
                break;
        }
        }

        this.__profile_model.remove_profile_by_id(account_id);
        this.__identity_model.remove_identities_by_account_id(account_id);
        this.__priv_network.free(record.get_privilege_ref());
        this.__admin_record_model.remove_record_by_id(account_id);
        return true;
}

AccountManager.prototype.search_account_profiles = function(key_word, cap)
{
        var all_profiles = this.__profile_model.get_all_profiles();
        var qualified = [];
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

AccountManager.prototype.get_temporary_account_record = function()
{
        if (this.__temp_record == null)
                throw Error("Logic error: temporary account record doesn't exist. It should be set up properly during system init");
        return this.__temp_record;
}

AccountManager.prototype.get_root_account_record = function()
{
        if (this.__root_record == null)
                throw Error("Logic error: root account record doesn't exist. It should be set up properly during system init");

        return this.__root_record;
}

// Reset all the account information.
AccountManager.prototype.reset = function()
{
        this.__admin_record_model.reset();
        this.__profile_model.reset();
}
