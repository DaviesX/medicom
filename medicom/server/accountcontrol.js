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
        this.__account_mgr = G_DataModelContext.get_account_manager();
        this.__profile_model = G_DataModelContext.get_profile_model();
        this.__identity_model = G_DataModelContext.get_identity_model();
        this.__priv_network = G_DataModelContext.get_privilege_network();
}

AccountControl.prototype.system_init = function()
{
        this.__account_mgr.system_init();
        // Inject root actions.
        for (var i = 0; i < M_Privilege.c_Root_Actions.length; i ++)
                this.__priv_network.add_root_action(M_Privilege.c_Root_Actions[i].action);
}

// Public APIs
AccountControl.prototype.get_registerable_user_group_strings = function()
{
        return new M_UserGroup.UserGroup().get_registerable_user_group_strings();
}

AccountControl.prototype.get_user_groups = function()
{
        return new M_UserGroup.UserGroup().get_user_group_strings();
}

// Return account info if successful, or otherwise null.
AccountControl.prototype.register = function(s_user_group, email, name, phone, password, err)
{
        return this.create_account(
                        this.__identity_model.create_identity(
                                        this.__account_mgr.get_temporary_account_record()),
                        s_user_group, email, name, phone, password, err);
}

AccountControl.prototype.create_account = function(identity, s_user_group, email, name, phone, password, err)
{
        var user_group = new M_UserGroup.UserGroup().get_user_group_from_string(s_user_group);
        // Check permission.
        if (s_user_group == M_Privilege.c_UserGroup_Admin &&
            !this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                            "create account", [])) {
                err.log("You don't have the permission to create an admin account");
                return null;
        }
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
        // Update privilege settings.
        var user_group_actions;
        switch (user_group) {
        case M_UserGroup.c_UserGroup_Admin: {
                user_group_actions = M_Privilege.c_Admin_Actions;
                break;
        }
        case M_UserGroup.c_UserGroup_Assistant: {
                user_group_actions = M_Privilege.c_Assistant_Actions;
                break;
        }
        case M_UserGroup.c_UserGroup_Provider: {
                user_group_actions = M_Privilege.c_Provider_Actions;
                break;
        }
        case M_UserGroup.c_UserGroup_Patient: {
                user_group_actions = M_Privilege.c_Patient_Actions;
                break;
        }
        case M_UserGroup.c_UserGroup_Temporary:
        default: {
                user_group_actions = M_Privilege.c_Temporary_Actions;
                break;
        }
        }
        var root_record = this.__account_mgr.get_root_account_record();
        for (var i = 0; i < user_group_actions.length; i ++) {
                if (!this.__priv_network.derive_action_from(root_record.get_privilege_ref(),
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

AccountControl.prototype.get_all_account_infos = function(identity)
{
}

AccountControl.prototype.remove_account = function(identity, account_id, err)
{
        if (account_id == null) {
                err.log("Account ID given is invalid");
                return false;
        }
        if (!this.__identity_model.verify_identity(identity)) {
                err.log("Your identity is invalid");
                return false;
        }
        var record = this.__account_mgr.get_account_record_by_id(account_id);
        if (record == null) {
                err.log("No such account id " + account_id + " exists")
                return false;
        }
        if (!this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                             "remove account",
                                             [record.get_privilege_ref()]) &&
             !this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                             "remove account",
                                             [record.user_group()])) {
                err.log("You don't have the permission to remove this account.");
                return false;
        }
        this.__account_mgr.remove_account_by_id(record.get_account_id());
        return true;
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
                var record = this.__account_mgr.get_account_record_by_id(account_ids[i]);
                if (record == null ||
                    (!this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                            "search account",
                                            [record.get_privilege_ref()]) &&
                    !this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                            "search account",
                                            [record.user_group()]))) {
                        // Don't have the permission to search this account.
                        continue;
                }
                var profile = this.__profile_model.get_profile_by_id(account_ids[i]);
                infos.push(new AccountInfo(record, account_ids[i],
                                           profile.get_name(), profile.get_email()));
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
        var identity = this.__identity_model.create_identity(this.__account_mgr.get_temporary_account_record());
        try {
                identity = this.__identity_model.elevate_by_user_password(identity, record, password);
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
        var identity = this.__identity_model.create_identity(this.__account_mgr.get_temporary_account_record());
        try {
                identity = this.__identity_model.elevate_by_user_password(identity, record, password);
        } catch (error) {
                err.log(error.toString());
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

AccountControl.prototype.__activate = function(identity, record, err)
{
        if (!this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                            "activate account",
                                            [record.get_privilege_ref()]))
                throw Error("You don't have the permission to force activate the account: " + record.get_account_id());
        this.__account_mgr.activate_account(record);
}

// Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
AccountControl.prototype.activate = function(auth_code, err)
{
        // Retrieve record.
        var record = this.__account_mgr.get_account_record_by_auth_code(auth_code);
        if (record == null) {
                err.log("Failed to find your account, possbily due to an invalid authorization code: " + auth_code);
                return false;
        }
        // Elevate to root.
        var identity = this.__identity_model.create_identity(record);
        var root_record = this.__account_mgr.get_root_account_record();
        try {
                identity = this.__identity_model.elevate_by_identity_auth_code(identity, auth_code, root_record);
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
                this.__identity_model.logout(identity);
        }
        this.__account_mgr.update_account_auth_code(record);
        this.__identity_model.logout(identity);
        return true;
}

// Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
AccountControl.prototype.force_activate = function(identity, account_id, err)
{
        if (!this.__identity_model.verify(identity)) {
                err.log("Your identity is invalid, please try to login");
        }
        var record = this.__account_mgr.get_account_record_by_id(account_id);
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
