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
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {SessionUtils} from "./sessionutils.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {c_Account_Type_Provider} from "../api/accounttype.js";


export function ProviderControl() {
        this.__session_utils = new SessionUtils();
        this.__identity_model = G_DataModelContext.get_identity_model();
        this.__session_model = G_DataModelContext.get_session_model();
        this.__provider_model = G_DataModelContext.get_provider_model();

        this.__has_provider_identity = function(identity) {
                return (this.__identity_model.verify_identity(identity)) &&
                       (identity.get_account_record().get_account_type() == c_Account_Type_Provider);
        }

        this.__get_provider_from_identity = function(identity) {
                return this.__provider_model.get_provider_by_id(identity.get_account_record().get_account_id);
        }

        this.__get_provider_id_from_identity = function(identity, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                return identity.get_account_record().get_account_id();
        }

        this.add_patient = function(identity, patient_id, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return null;
                else                     return this.__session_utils.add_relation(provider_id, patient_id, err);
        }

        this.start_new_session_with = function(identity, patient_id, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return null;
                else                     return this.__session_utils.start_new_session_with(provider_id, patient_id, err);
        }

        this.end_session = function(identity, session_id, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return null;
                else                     return this.__session_utils.end_session(session_id, err);
        }

        this.recover_session = function(identity, session_id, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return null;
                else                     return this.__session_utils.recover_session(session_id, err);
        }

        this.remove_patient = function(identity, patient_id, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return false;
                else {
                        this.__session_utils.remove_relation(provider_id, patient_id, err);
                        return true;
                }
        }

        this.get_participated_patient_ids = function(identity, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return null;
                else                     return this.__session_utils.get_participated_patient_ids(
                                                        provider_id, err);
        }

        this.get_sessions_by_patient_id = function(identity, patient_id, err) {
                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return null;
                else                     return this.__session_utils.get_sessions(provider_id, patient_id, err);
        }

        this.__get_session_by_id = function(provider_id, session_id, err) {
                var session = this.__session_model.get_session_by_id(session_id);
                if (session == null) {
                        err.log("Session: " + session_id + " doesn't exists");
                        return null;
                }
                if (session.get_provider_id() != provider_id) {
                        err.log("Your are not in this session");
                        return null;
                }
                return session;
        }

        this.set_session_notes = function(identity, session_id, notes, err) {

                var provider_id = this.__get_provider_id_from_identity(identity, err);
                if (provider_id == null) return false;
                else {
                        var session = this.__get_session_by_id(provider_id, session_id, err);
                        if (session == null) return false;
                        session.set_notes(notes);
                        this.__session_model.update_session(session);
                }
                return true;
        }
}
