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

import {G_DataModelContext} from "./datamodelcontext.js";
import {c_UserGroup_Provider,
        c_UserGroup_Patient} from "../api/usergroup.js";

export function SessionControl()
{
        this.__admin_model = G_DataModelContext.get_admin_record_model();
        this.__session_mgr = G_DataModelContext.get_session_manager();
        this.__identity_model = G_DataModelContext.get_identity_model();
        this.__session_model = G_DataModelContext.get_session_model();
        this.__priv_network = G_DataModelContext.get_privilege_network();

        this.__root_ref = null;
}

SessionControl.prototype.system_init = function()
{
        this.__root_ref = G_DataModelContext.get_account_manager().get_root_account_record().get_privilege_ref();
}

SessionControl.prototype.__check_identity = function(identity, err)
{
        try {
                if (!this.__identity_model.verify_identity(identity))
                        throw Error("Your Identity is invalid");
        } catch (error) {
                err.log(error.toString());
                return false;
        }
        return true;
}

SessionControl.prototype.__make_assocation_pair = function(identity, user_id, err)
{
        if (identity == null) {
                err.log("Empty identity");
                return null;
        }
        var user_record;
        if (user_id == null || null == (user_record = this.__admin_model.get_record_by_id(user_id))) {
                err.log("User ID " + user_id + " to be associated is invalid");
                return null;
        }
        if (identity.get_account_record().user_group() == c_UserGroup_Provider &&
            user_record.user_group() == c_UserGroup_Patient)
                return [identity.get_account_record().get_account_id(), user_id];
        else if (user_record.user_group() == c_UserGroup_Provider &&
                   identity.get_account_record().user_group() == c_UserGroup_Patient)
                return [user_id, identity.get_account_record().get_account_id()];
        else {
                err.log("Couldn't match association pattern from user_group pair " +
                        [identity.get_account_record().user_group(), user_record.user_group()]);
                return null;
        }
}

SessionControl.prototype.__make_assignment_pair = function(identity, user_id, err)
{
        if (identity == null) {
                err.log("Empty identity");
                return null;
        }
        var user_record;
        if (user_id == null || null == (user_record = this.__admin_model.get_record_by_id(user_id))) {
                err.log("User ID " + user_id + " to be assigned is invalid");
                return null;
        }
        if (identity.get_account_record().user_group() == c_UserGroup_Provider &&
            user_record.user_group() == c_UserGroup_Provider)
                return [identity.get_account_record().get_account_id(), user_id, user_record];
        else {
                err.log("Couldn't match assignment pattern from user_group pair " +
                        [identity.get_account_record().user_group(), user_record.user_group()]);
                return null;
        }
}

SessionControl.prototype.__add_scope_for = function(priv_ref, session_id, action_desc)
{
        var action = this.__priv_network.get_action_from(this.__root_ref, priv_ref, action_desc);
        if (action == null)
                throw Error("You don't have the permission to " + action_desc)
        action.add_scope(session_id);
        if (!this.__priv_network.modify_scope_on(this.__root_ref, priv_ref,
                                                 action.get_action(),
                                                 action.get_scope_set(),
                                                 action.has_grant_option()))
                throw Error("Failed to add scope " + session_id + " for " + priv_ref);
}

SessionControl.prototype.__add_action_for = function(src_ref, dst_ref, session_id, action_desc)
{
        if (!this.__priv_network.derive_action_from(src_ref, dst_ref, action_desc, [session_id], false))
                throw Error("Failed to add action for " + dst_ref + " with " + action_desc +
                            " scope: " + session_id +
                            " to " + dst_ref);
}

SessionControl.prototype.create_association = function(identity, user_id, err)
{
        var pair = this.__make_assocation_pair(identity, user_id, err);
        if (pair == null)
                return false;
        var priv_ref = identity.get_account_record().get_privilege_ref();
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(priv_ref, "create association", [pair[2].user_group()])) {
                if (null == this.__session_mgr.create_association(pair)) {
                        err.log("The association exists already");
                        return false;
                } else
                        return true;
                err.log("Your don't have the permission to create an association");
                return false;
        }
}

SessionControl.prototype.get_associated_users = function(identity, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(priv_ref, "search association", [])) {
                var record = identity.get_account_record();
                var priv_ref = record.get_privilege_ref();
                var assocs;
                var which_user;
                if (record.user_group == c_UserGroup_Patient) {
                        assocs = this.__assoc_model.get_associations_by_second(record.get_account_id(), err);
                        which_user = 0;
                } else {
                        assocs = this.__assoc_model.get_associations_by_first(record.get_account_id(), err);
                        which_user = 1;
                }
                if (assocs == null) {
                        err.log("Association doesn't exists");
                        return null;
                }
                var user_infos = [];
                for (var i = 0; i < assocs.length; i ++) {
                        var record = this.__admin_model.get_record_by_id(assocs.get_pair()[which_user]);
                        var info = new AccountInfo(record,
                                                   record.get_account_id(),
                                                   record.get_name(),
                                                   record.get_email());
                        user_infos.push(info);
                }
                return user_infos;
        } else {
                err.log("Your don't have the permission to search association");
                return null;
        }
}

SessionControl.prototype.remove_association = function(identity, user_id, err)
{
        var pair = this.__make_assocation_pair(identity, user_id, err);
        if (pair == null)
                return null;
        var priv_ref = identity.get_account_record().get_privilege_ref();
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "remove association", [])) {
                this.__session_mgr.remove_associations(pair);
                return true;
        } else {
                err.log("You don't have the permission to remove an association");
                return false;
        }
}

SessionControl.prototype.create_session = function(identity, user_id, err)
{
        var pair = this.__make_assignment_pair(identity, user_id, err);
        if (pair == null)
                return false;
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "create session", [])) {
                var result = this.__session_mgr.create_new_session(pair);
                if (result == null) {
                        err.log("Failed to create session: " + pair);
                        return null;
                } else {
                        var priv_ref = identity.get_account_record().get_privilege_ref();
                        var session_id = result.session.get_session_id();
                        try {
                                this.__add_scope_for(priv_ref, session_id, "share session");
                                this.__add_scope_for(priv_ref, session_id, "add session");
                                this.__add_scope_for(priv_ref, session_id, "activate session");
                                this.__add_scope_for(priv_ref, session_id, "deactivate session");
                        } catch (error) {
                                err.log(error.toString());
                                this.__session_mgr.remove_session(pair, session_id);
                                return null;
                        }
                        return result.session;
                }
        } else {
                err.log("You don't have the permission to create a session");
                return null;
        }
}

SessionControl.prototype.add_session = function(identity, user_id, session_id, err)
{
        var pair = this.__make_assignment_pair(identity, user_id, err);
        if (pair == null)
                return false;
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "add session", [session_id])) {
                var result = this.__session_mgr.add_session(pair, session_id);
                if (result == null) {
                        err.log("Failed to create session: " + pair + ", " + session_id);
                        return null;
                } else
                        return result.session;
        } else {
                err.log("You don't have the permission to add session " + session_id);
                return null;
        }
}

SessionControl.prototype.remove_session = function(identity, uesr_id, session_id, err)
{
        var pair = this.__make_assignment_pair(identity, user_id, err);
        if (pair == null)
                return false;
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "remove session", [])) {
                var result = this.__session_mgr.remove_session(pair, session_id);
                if (result == false) {
                        err.log("Failed to remove session: " + pair + " Such association doesn't exist");
                        return null;
                } else
                        return result.session;
        } else {
                err.log("You don't have the permission to remove a session");
                return null;
        }
}

SessionControl.prototype.share_session = function(identity, user_id, session_id, err)
{
        var pair = this.__make_assignment_pair(identity, user_id, err);
        if (pair == null)
                return false;
        var priv_ref = identity.get_account_record().get_privilege_ref();
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(priv_ref, "share session", [session_id])) {
                var target_ref = pair[2].get_privilege_ref();
                try {
                        this.__add_action_for(priv_ref, target_ref, session.get_session_id(), "add session");
                } catch (error) {
                        err.log(error.toString())
                        return false;
                }
                return true;
        } else {
                err.log("You don't have the permission to share session " + session_id);
                return null;
        }
}

SessionControl.prototype.activate_association = function(identity, session_id, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "activate session", [session_id]))
                if (!this.__session_mgr.activate_session(session_id)) {
                        err.log("Session " + session_id + " doesn't exists");
                        return false;
                } else
                        return true;
        else {
                err.log("You don't have the permission to activate an association");
                return null;
        }
}

SessionControl.prototype.deactivate_association = function(identity, session_id, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "deactivate association", [session_id]))
                if (!this.__session_mgr.deactivate_session(session_id)) {
                        err.log("Session " + session_id + " doesn't exist");
                        return false;
                } else
                        return true;
        else {
                err.log("You don't have the permission to deactivate an association");
                return null;
        }
}

SessionControl.prototype.set_session_notes = function(identity, session_id, notes, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "update session", [])) {
                var session = this.__session_model.get_session(session_id);
                if (session == null) {
                        err.log("No such session " + session_id + " exists");
                        return false;
                }
                session.set_notes(notes);
                this.__session_model.update_session(session);
                return true;
        } else {
                err.log("You don't have the permission to change session notes");
                return false;
        }
}

SessionControl.prototype.get_session_notes = function(identity, session_id, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "view session", [])) {
                var session = this.__session_model.get_session(session_id);
                if (session == null)
                        return null;
                return session.get_notes();
        } else {
                err.log("You don't have the permission to read session notes");
                return null;
        }
}
