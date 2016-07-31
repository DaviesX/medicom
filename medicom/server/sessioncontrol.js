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
import {SessionUtils} from "./sessionutils.js";

export function SessionControl()
{
        this.__session_utils = new SessionUtils();
        this.__admin_model = G_DataModelContext.get_admin_record_model();
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
                return null;
        var priv_ref = identity.get_account_record().get_privilege_ref();
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action_from(this.__root_ref, priv_ref, "create association", [user_id])) {
                var session;
                if (null == (session = this.__session_model.add_relation(pair[0], pair[1], err)))
                        return null;
                else {
                        // Change identity's action scope.
                        try {
                                this.__add_scope_for(priv_ref, session.get_session_id(), "assign association");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "activate association");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "deactivate association");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "view association");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "update association");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "update measure");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "remove measure");
                                this.__add_scope_for(priv_ref, session.get_session_id(), "view measure");
                        } catch (error) {
                                err.log(error.toString());
                                return null;
                        }
                        return session;
                }
        } else {
                err.log("Your don't have the permission to create an association");
                return null;
        }
}

SessionControl.prototype.assign_association = function(identity, user_id, session_id, err)
{
        var pair = this.__make_assignment_pair(identity, user_id, err);
        if (pair == null)
                return false;
        var priv_ref = identity.get_account_record().get_privilege_ref();
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action_from(this.__root_ref, priv_ref, "assign association", [session_id])) {
                var target_ref = pair[2].get_privilege_ref();
                try {
                        this.__add_action_for(priv_ref, target_ref, session.get_session_id(), "view association");
                        this.__add_action_for(priv_ref, target_ref, session.get_session_id(), "search association");
                        this.__add_action_for(priv_ref, target_ref, session.get_session_id(), "update measure");
                        this.__add_action_for(priv_ref, target_ref, session.get_session_id(), "remove measure");
                        this.__add_action_for(priv_ref, target_ref, session.get_session_id(), "view measure");
                } catch (error) {
                        err.log(error.toString())
                        return false;
                }
                return true;
        } else {
                err.log("You don't have the permission to assign an association");
                return null;
        }
}

SessionControl.prototype.activate_association = function(identity, session_id, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "activate association", [session_id]))
                return this.__session_utils.recover_session(session_id, err);
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
                return this.__session_utils.end_session_with(session_id, err);
        else {
                err.log("You don't have the permission to deactivate an association");
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
                                           "remove association", [user_id])) {
                this.__session_utils.remove_relation(pair[0], pair[1], err);
                return true;
        } else {
                err.log("You don't have the permission to remove an association");
                return false;
        }
}

SessionControl.prototype.get_participated_user_ids = function(identity, err)
{
        if (this.__check_identity(identity, err))
                return null;
        var ids = [];
        var record = identity.get_account_record();
        if (record.user_group() == c_UserGroup_Provider)
                ids = this.__session_utils.get_participated_patient_ids(record.get_account_id(), err);
        else if (record.user_group() == c_UserGroup_Patient)
                ids = this.__session_utils.get_participated_provider_ids(record.get_account_id(), err);
        // @fixme: lack an AssociationModel..
        return ids;
}

SessionControl.prototype.get_associations = function(identity, user_id, err)
{
        var pair = this.__make_assocation_pair(identity, user_id, err);
        if (pair == null)
                return null;
        var priv_ref = identity.get_account_record().get_privilege_ref();
        if (this.__check_identity(identity, err)) {
                obtained = this.__session_utils.get_sessions(pair[0], pair[1], err);
                for (var i = 0; i < obtained.length; i ++)
                        if (!this.__priv_network.has_action(priv_ref,
                                                            "view association",
                                                            [obtained[i].get_session_id()])) {
                                err.log("Your don't have the permission to search association");
                                return false;
                        }
                        return obtained;
        } else {
                err.log("Your don't have the permission to search association");
                return false;
        }
}

SessionControl.prototype.set_session_notes = function(identity, session_id, notes, err)
{
        if (this.__check_identity(identity, err) &&
            this.__priv_network.has_action(identity.get_account_record().get_privilege_ref(),
                                           "update association", [session_id])) {
                var session = this.__session_model.__get_session_by_id(session_id);
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
