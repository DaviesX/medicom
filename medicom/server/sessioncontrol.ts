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

import {DataModelContext} from "./datamodelcontext.ts";
import {AdminRecordModel} from "./adminrecordmodel.ts";
import {ProfileModel} from "./profilemodel.ts";
import {SessionManager} from "./sessionmanager.ts";
import {IdentityModel} from "./identitymodel.ts";
import {AssociationModel} from "./associationmodel.ts";
import {SessionModel} from "./sessionmodel.ts";
import {PrivilegeNetwork} from "./privilegenetwork";
import {AccountInfo} from "../api/accountinfo.ts";
import {MedicalSession} from "../api/medicalsession.ts";
import {Association} from "../api/association.ts";
import {Identity} from "../api/identity.ts";
import {AdminRecord} from "../api/adminrecord.ts";
import {ErrorMessages} from "../api/error.ts";
import {UserGroupConst} from "../api/usergroup.js";

export class SessionControl
{
        private records:        AdminRecordModel;
        private profiles:       ProfileModel;
        private sess_asso:      SessionManager;
        private identities:     IdentityModel;
        private associations:   AssociationModel;
        private sessions:       SessionModel;
        private privileges:     PrivilegeNetwork;
        private root_ref:       number;

        constructor()
        {
                this.records = DataModelContext.get_admin_record_model();
                this.profiles = DataModelContext.get_profile_model();
                this.sess_asso = DataModelContext.get_session_manager();
                this.identities = DataModelContext.get_identity_model();
                this.associations = DataModelContext.get_association_model();
                this.sessions = DataModelContext.get_session_model();
                this.privileges = DataModelContext.get_privilege_network();

                this.root_ref = null;
        }

        public system_init(): void
        {
                this.root_ref = DataModelContext.get_account_manager().get_root_account_record().get_privilege_ref();
        }

        private check_identity(identity: Identity, err: ErrorMessages): boolean
        {
                try {
                        this.identities.verify_identity(identity);
                } catch (error) {
                        err.log(error.toString());
                        return false;
                }
                return true;
        }

        private make_association_pair(identity: Identity, user_id: number, err: ErrorMessages): [number, number, AdminRecord]
        {
                if (identity == null) {
                        err.log("Empty identity");
                        return null;
                }
                var user_record;
                if (user_id == null || null == (user_record = this.records.get_record_by_id(user_id))) {
                        err.log("User ID " + user_id + " to be associated is invalid");
                        return null;
                }
                if ((identity.get_account_record().user_group() == UserGroupConst.Provider ||
                     identity.get_account_record().user_group() == UserGroupConst.Assistant) &&
                    user_record.user_group() == UserGroupConst.Patient)
                        return [identity.get_account_record().get_account_id(), user_id, user_record];
                else if ((user_record.user_group() == UserGroupConst.Provider ||
                          user_record.user_group() == UserGroupConst.Assistant) &&
                           identity.get_account_record().user_group() == UserGroupConst.Patient)
                        return [user_id, identity.get_account_record().get_account_id(), user_record];
                else {
                        err.log("Couldn't match association pattern from user_group pair " +
                                [identity.get_account_record().user_group(), user_record.user_group()]);
                        return null;
                }
        }

        private make_assignment_pair(identity: Identity, user_id: number, err: ErrorMessages): [number, number]
        {
                if (identity == null) {
                        err.log("Empty identity");
                        return null;
                }
                var user_record;
                if (user_id == null || null == (user_record = this.records.get_record_by_id(user_id))) {
                        err.log("User ID " + user_id + " to be assigned is invalid");
                        return null;
                }
                if ((identity.get_account_record().user_group() == UserGroupConst.Provider &&
                     user_record.user_group() == UserGroupConst.Provider) ||
                    (identity.get_account_record().user_group() == UserGroupConst.Provider &&
                     user_record.user_group() == UserGroupConst.Assistant))
                        return [identity.get_account_record().get_account_id(), user_id, user_record];
                else {
                        err.log("Couldn't match assignment pattern from user_group pair " +
                                [identity.get_account_record().user_group(), user_record.user_group()]);
                        return null;
                }
        }

        private add_scope_for(priv_ref: number, session_id: number, action_desc: string): void
        {
                var action = this.privileges.get_action_from(this.root_ref, priv_ref, action_desc, []);
                if (action == null)
                        throw Error("You don't have the permission to add scope - " + action_desc)
                action.add_scope(session_id, priv_ref);
                if (!this.privileges.modify_scope_on(this.root_ref, priv_ref,
                                                     action.get_action(),
                                                     action.get_scope_set(),
                                                     action.has_grant_option()))
                        throw Error("Failed to add scope " + session_id + " for " + priv_ref);
        }

        private add_action_for(src_ref: number, dst_ref: number, session_id: number, action_desc: string): void
        {
                if (!this.privileges.derive_action_from(src_ref, dst_ref, action_desc, [session_id], false))
                        throw Error("Failed to add action for " + dst_ref + " with " + action_desc +
                                    " scope: " + session_id +
                                    " to " + dst_ref);
        }

        public create_association(identity: Identity, user_id: number, err: ErrorMessages): boolean
        {
                var pair = this.make_association_pair(identity, user_id, err);
                if (pair == null)
                        return false;
        
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "create association",
                                                   [pair[2].user_group()])) {
                        if (null == this.sess_asso.create_association([pair[0], pair[1]])) {
                                err.log("The association exists already");
                                return false;
                        } else
                                return true;
                } else {
                        err.log("Your don't have the permission to create an association");
                        return false;
                }
        }

        public get_associated_users(identity: Identity, err: ErrorMessages): Array<AccountInfo>
        {
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "search association", [])) {
                        var record = identity.get_account_record();
                        var assocs;
                        var which_user;
                        if (record.user_group() == UserGroupConst.Patient) {
                                assocs = this.associations.get_associations_by_second(record.get_account_id());
                                which_user = 0;
                        } else {
                                assocs = this.associations.get_associations_by_first(record.get_account_id());
                                which_user = 1;
                        }
                        if (assocs == null)
                                return [];
                        var user_infos = new Array<AccountInfo>(); 
                        for (var i = 0; i < assocs.length; i ++) {
                                var record = this.records.get_record_by_id(assocs[i].get_user_pair()[which_user]);
                                var profile = this.profiles.get_profile_by_id(assocs[i].get_user_pair()[which_user]);
                                var info = new AccountInfo(record,
                                                           record.get_account_id(),
                                                           profile.get_name(),
                                                           profile.get_email());
                                user_infos.push(info);
                        }
                        return user_infos;
                } else {
                        err.log("You don't have the permission to search association. ");
                        return null;
                }
        }

        public remove_association(identity: Identity, user_id: number, err: ErrorMessages): boolean
        {
                var pair = this.make_association_pair(identity, user_id, err);
                if (pair == null)
                        return null;
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                               "remove association", [])) {
                        this.sess_asso.remove_association([pair[0], pair[1]]);
                        return true;
                } else {
                        err.log("You don't have the permission to remove an association");
                        return false;
                }
        }

        public create_session(identity: Identity, user_id: number, err: ErrorMessages): MedicalSession 
        {
                var pair = this.make_association_pair(identity, user_id, err);
                if (pair == null)
                        return null;

                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "create session", [])) {
                        var result: [MedicalSession, Association] = this.sess_asso.create_new_session([pair[0], pair[1]]);
                        if (result == null) {
                                err.log("Failed to create session: " + pair);
                                return null;
                        } else {
                                var priv_ref = identity.get_account_record().get_privilege_ref();
                                var session_id = result[0].get_session_id();
                                try {
                                        this.add_scope_for(priv_ref, session_id, "share session");
                                        this.add_scope_for(priv_ref, session_id, "add session");
                                        this.add_scope_for(priv_ref, session_id, "activate session");
                                        this.add_scope_for(priv_ref, session_id, "deactivate session");
                                } catch (error) {
                                        err.log(error.toString());
                                        this.sess_asso.remove_session([pair[0], pair[1]], session_id);
                                        return null;
                                }
                                return result[0];
                        }
                } else {
                        err.log("You don't have the permission to create a session");
                        return null;
                }
        }

        public add_session(identity: Identity, user_id: number, session_id: number, err: ErrorMessages): MedicalSession
        {
                var pair = this.make_association_pair(identity, user_id, err);
                if (pair == null)
                        return null;
        
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "add session", [session_id])) {
                        var result: [MedicalSession, Association] = this.sess_asso.add_session([pair[0], pair[1]], session_id);
                        if (result == null) {
                                err.log("Failed to create session: " + pair + ", " + session_id);
                                return null;
                        } else
                                return result[0];
                } else {
                        err.log("You don't have the permission to add session " + session_id);
                        return null;
                }
        }

        public get_associated_sessions(identity: Identity, user_id: number, err: ErrorMessages): Array<MedicalSession>
        {
                var pair = this.make_association_pair(identity, user_id, err);
                if (pair == null)
                        return null;

                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "search session", [])) {
                        var sessions;
                        try {
                                sessions = this.sess_asso.get_associated_sessions([pair[0], pair[1]]);
                        } catch (error) {
                                err.log(error.toString());
                                return null;
                        }
                        return sessions;
                } else {
                        err.log("You don't have the permission to get associated session with " + user_id);
                        return null;
                }
        }

        public remove_session(identity: Identity, user_id: number, session_id: number, err: ErrorMessages): boolean
        {
                var pair = this.make_association_pair(identity, user_id, err);
                if (pair == null)
                        return false;

                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "remove session", [])) {
                        var result = this.sess_asso.remove_session([pair[0], pair[1]], session_id);
                        if (result == false) {
                                err.log("Failed to remove session: " + pair + " Such association doesn't exist");
                                return false;
                        } else
                                return true;
                } else {
                        err.log("You don't have the permission to remove a session");
                        return false;
                }
        }
        
        public share_session(identity: Identity, user_id: number, session_id: number, err: ErrorMessages): boolean
        {
                if (null == this.make_assignment_pair(identity, user_id, err))
                        return false;
                var user_record = this.records.get_record_by_id(user_id);
                if (user_record == null) {
                        err.log("User " + user_id + " doesn't exist");
                        return false;
                }
                if (!this.sessions.has_session(session_id)) {
                        err.log("Session " + session_id + " doesn't exist");
                        return false;
                }
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "share session",
                                                   [session_id])) {
                        var priv_ref = identity.get_account_record().get_privilege_ref();
                        var target_ref = user_record.get_privilege_ref();
                        try {
                                this.add_action_for(priv_ref, target_ref, session_id, "add session");
                        } catch (error) {
                                err.log(error.toString())
                                return false;
                        }
                        return true;
                } else {
                        err.log("You don't have the permission to share a session " + session_id);
                        return false;
                }
        }
        
        public activate_session(identity: Identity, session_id: number, err: ErrorMessages): boolean
        {
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "activate session", [session_id]))
                        if (!this.sess_asso.activate_session(session_id)) {
                                err.log("Session " + session_id + " doesn't exists");
                                return false;
                        } else
                                return true;
                else {
                        err.log("You don't have the permission to activate a session");
                        return false;
                }
        }
        
        public deactivate_session(identity: Identity, session_id: number, err: ErrorMessages): boolean
        {
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "deactivate session", [session_id]))
                        if (!this.sess_asso.deactivate_session(session_id)) {
                                err.log("Session " + session_id + " doesn't exist");
                                return false;
                        } else
                                return true;
                else {
                        err.log("You don't have the permission to deactivate a session");
                        return false;
                }
        }
        
        public set_session_notes(identity: Identity, session_id: number, notes: string, err: ErrorMessages): boolean
        {
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "update session", [])) {
                        var session = this.sessions.get_session(session_id);
                        if (session == null) {
                                err.log("No such session " + session_id + " exists");
                                return false;
                        }
                        session.set_notes(notes);
                        this.sessions.update_session(session);
                        return true;
                } else {
                        err.log("You don't have the permission to change session notes");
                        return false;
                }
        }
        
        public get_session_notes(identity: Identity, session_id: number, err: ErrorMessages): string
        {
                if (this.check_identity(identity, err) &&
                    this.privileges.has_action(identity.get_account_record().get_privilege_ref(),
                                                   "view session", [])) {
                        var session = this.sessions.get_session(session_id);
                        if (session == null)
                                return null;
                        return session.get_notes();
                } else {
                        err.log("You don't have the permission to read session notes");
                        return null;
                }
        }
};

