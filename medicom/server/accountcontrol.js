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
import {Meteor} from "meteor/meteor";
import {AccountManager} from "./accountmanager.js";
import {IdentityModel} from "./identitymodel.js";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {Profile} from "../api/profile.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {AdminRecord} from "../api/adminrecord.js";
import {AccountInfo} from "../api/accountinfo.js";
import * as M_Privilege from "../api/privilege.js";
import * as M_UserGroup from "../api/usergroup.js";

var c_Account_Privilege = [];
c_Account_Privilege[M_UserGroup.c_UserGroup_Admin] = 100;
c_Account_Privilege[M_UserGroup.c_UserGroup_Assistant] = 50;
c_Account_Privilege[M_UserGroup.c_UserGroup_Provider] = 50;
c_Account_Privilege[M_UserGroup.c_UserGroup_Patient] = 20;

export function AccountControl()
{
        const c_Root_Account_ID = -1;
        const c_Root_Password = "42f2d30a-f9fc-11e5-86aa-5e5517507c66";

        this.__account_mgr = G_DataModelContext.get_account_manager();
        this.__profile_model = G_DataModelContext.get_profile_model();
        this.__identity_model = G_DataModelContext.get_identity_model();

        // Create a root and default identity.
        var root_record, default_record;
        try {
                root_record = this.__account_mgr.create_account_with_id(M_UserGroup.c_UserGroup_Root,
                                                                        c_Root_Account_ID,
                                                                        c_Root_Password);
        } catch (error) {
                console.log(error.toString());
                root_record = this.__account_mgr.get_account_record_by_id(c_Root_Account_ID);
        }
}

// Public APIs
AccountControl.prototype.get_registerable_user_group_strings = function()
{
        return M_UserGroup.get_registerable_user_group_strings;
}

AccountControl.prototype.get_user_groups = function()
{
        return M_UserGroup.c_UserGroup_Strings;
}

// Return account info if successful, or otherwise null.
AccountControl.prototype.register = function(s_user_group, email, name, phone, password, err)
{
        var user_group = new M_UserGroup.UserGroup().get_user_group_from_string(s_user_group);
        switch (user_group) {
        case M_UserGroup.c_UserGroup_Admin:
                err.log("Cannot register an admin account");
                return null;
        case M_UserGroup.c_UserGroup_Assistant:
                err.log("Cannot register a super intendant, but it can be made");
                return null;
        default:
                // Create admin record.
                var record;
                try {
                        record = this.__account_mgr.create_account(user_group, password, email);
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }
                // Update profile.
                var profile = this.__profile_model.get_profile_by_id(record.get_account_id());
                profile.set_name(name);
                profile.set_phone(phone);
                this.__profile_model.update_profile(profile);
                // Extract account info.
                var account_info = new AccountInfo(record,
                                                   record.get_account_id(),
                                                   profile.get_name(),
                                                   profile.get_email());
                return account_info;
        }
}

AccountControl.prototype.make_account = function(identity, s_user_group, email, name, phone, password, err)
{
        var user_group = new M_UserGroup.UserGroup().get_user_group_from_string(s_user_group);
        // Create admin record.
        var record;
        try {
                record = this.__account_mgr.create_account(user_group, password, email);
        } catch (error) {
                err.log(error.toString());
                return null;
        }
        // Update profile.
        var profile = this.__profile_model.get_profile_by_id(record.get_account_id());
        profile.set_name(name);
        profile.set_phone(phone);
        this.__profile_model.update_profile(profile);
        // Extract account info.
        var account_info = new AccountInfo(record,
                                           record.get_account_id(),
                                           profile.get_name(),
                                           profile.get_email());
        return account_info;
}

AccountControl.prototype.get_all_account_infos = function(identity)
{
}

AccountControl.prototype.remove_account = function(identity, account_id, err)
{
}

AccountControl.prototype.get_account_infos_by_ids = function(identity, account_ids, err)
{
        if (account_ids == null) {
                err.log("Account IDs given are invalid");
                return null;
        }
        if (!this.__identity_model.verify_identity(identity)) {
                err.log("Your identity is invalid");
                return null;
        }
        var self_record = identity.get_account_record();
        var infos = [];
        for (var i = 0; i < account_ids.length; i ++) {
                if (self_record.get_account_id() != account_ids[i]) {
                        // Trying to obtain others information:
                        var record = this.__account_mgr.
                                     get_account_record_by_id(account_ids[i]);
                        if (record == null) {
                                err.log("Account ID: " + account_ids[i] + " is invalid");
                                continue;
                        }
                        if (c_Account_Privilege[self_record.user_group()] <=
                            c_Account_Privilege[record.user_group()]) {
                                err.log("You don't have the privilege to obtain such account");
                                continue;
                        }
                }
                var profile = this.__profile_model.
                              get_profile_by_id(account_ids[i]);
                infos[i] = new AccountInfo(record, account_ids[i],
                                           profile.get_name(), profile.get_email());
        }
        return infos;
}

AccountControl.prototype.get_account_info_by_id = function(identity, account_id, err)
{
        if (account_id == null) {
                err.log("Account ID given is invalid");
                return null;
        }
        var infos = this.get_account_infos_by_ids(identity, [account_id], err);
        return infos != null ? infos[0] : null;
}

// Return an identity if successful, or otherwise null.
AccountControl.prototype.login_by_email = function(email, password, err)
{
        var record = this.__account_mgr.get_account_record_by_email(email);
        if (record == null) {
                err.log("Account with email: " + email + " doesn't exist");
                return null;
        }
        var identity;
        try {
                identity = this.__identity_model.login(record, password);
        } catch (error) {
                err.log(error.toString());
                return null;
        }
        return identity;
}

// Return an identity if successful, or otherwise null.
AccountControl.prototype.login_by_account_id = function(account_id, password, err)
{
        var record = this.__account_mgr.get_account_record_by_id(account_id);
        var identity = this.__identity_model.login(record, password);
        if (identity === null) {
                err.log("Invalid user name/password");
                return null;
        }
        return identity;
}

AccountControl.prototype.logout = function(identity, err)
{
        if (!this.__identity_model.verify_identity(identity))
                err.log("The identity is invalid");
        this.__identity_model.logout(identity);
}

// Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
AccountControl.prototype.activate = function(activator, err)
{
        var record = this.__account_mgr.get_account_record_by_activator(activator);
        if (!this.__account_mgr.activate_account(record, activator)) {
                err.log("Failed to activate, possbily due to an invalid activator: " + activator);
                return false;
        }
        return true;
}

// Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
AccountControl.prototype.force_activate = function(identity, account_id, err)
{
        if (!this.__identity_model.verify(identity)) {
                err.log("Your identity is invalid, please try to login");
        }
        var record = identity.get_account_record();
        if (!record) {
                err.log("Your account is invalid");
                return false;
        }
        if (record.user_group() !== M_UserGroup.c_UserGroup_Admin) {
                err.log("It needs to be the administrator to force activate an account");
                return false;
        }
        if (!this.__account_mgr.force_activate_account(record)) {
                err.log("No such account to activate");
                return false;
        }
        return true;
}
