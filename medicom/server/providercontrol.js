import {Meteor} from "meteor/meteor";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js"
import {c_Account_Type_Provider} from "../api/accounttype.js"


export function ProviderControl() {
        
        this.__has_provider_identity = function(identity) {
                if (!G_DataModelContext.get_identity_manager().verify_identity(identity) ||
                     identity.get_account_record().get_account_type() != c_Account_Type_Provider) {
                        return false;
                } else {
                        return true;
                }
        }
        
        this.__get_provider_from_identity = function(identity) {
                var prov_mgr = G_DataModelContext.get_provider_manager();
                var provider = prov_mgr.get_provider_by_id(identity.get_account_record().get_account_id);
                return provider;
        }
        
        this.add_patient = function(identity, patient_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider_id = identity.get_account_record().get_account_id();
                if (G_DataModelContext.get_session_manager().has_session(provider_id, patient_id)) {
                        err.log("The patient has been in your session list already.");
                        return null;
                }
                var session = G_DataModelContext.get_session_manager().
                                        create_session(provider_id, patient_id);
                if (session == null) {
                        err.log("Failed to create session. The ID provided: " + patient_id + " may be invalid");
                        return null;
                }
                session.activate();
                G_DataModelContext.get_session_manager().update_session(session);
                return session;
        }
        
        this.start_new_session_with = function(identity, patient_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider_id = identity.get_account_record().get_account_id();
                if (!G_DataModelContext.get_session_manager().has_session(provider_id, patient_id)) {
                        err.log("The patient isn't in your list, please add the patient first.");
                        return null;
                }
                var session = G_DataModelContext.get_session_manager().
                                        create_session(provider_id, patient_id);
                if (session == null) {
                        err.log("Failed to create session. The ID provided: " + patient_id + " may be invalid");
                        return null;
                }
                // Deactivate old sessions.
                var old_sessions = G_DataModelContext.get_session_manager().
                                        get_sessions_by_ids(provider_id, patient_id, true);
                if (old_sessions != null) {
                        for (var i = 0; i < old_sessions.length; i ++) {
                                old_sessions[i].deactivate();
                                G_DataModelContext.get_session_manager().update_session(old_sessions[i]);
                        }
                }
                // Update new session.
                session.activate();
                G_DataModelContext.get_session_manager().update_session(session);
                return session;
        }
        
        this.end_session = function(identity, session_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var session = G_DataModelContext.get_session_manager().get_session_by_id(session_id);
                if (session == null) {
                        err.log("Failed to end session. The ID provided: " + patient_id + " may be invalid");
                        return null;
                }
                session.deactivate();
                G_DataModelContext.get_session_manager().update_session(session);
                return session;
        }
        
        this.recover_session = function(identity, session_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider_id = identity.get_account_record().get_account_id();
                var session = G_DataModelContext.get_session_manager().get_session_by_id(session_id);
                if (session == null) {
                        err.log("Failed to recover session. The ID provided: " + patient_id + " may be invalid");
                        return null;
                }
                // Deactivate old sessions.
                var old_sessions = G_DataModelContext.get_session_manager().
                                        get_sessions_by_ids(provider_id, session.get_patient_id());
                if (old_sessions != null) {
                        for (var i = 0; i < old_sessions.length; i ++) {
                                old_sessions[i].deactivate();
                                G_DataModelContext.get_session_manager().update_session(old_sessions[i]);
                        }
                }
                session.activate();
                G_DataModelContext.get_session_manager().update_session(session);
                return session;
        }

        this.remove_patient = function(identity, patient_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return false;
                }
                var provider_id = identity.get_account_record().get_account_id();
                var sessions = G_DataModelContext.get_session_manager().get_sessions_by_ids(
                                        provider_id, patient_id, true);
                if (sessions == null) {
                        err.log("Such session:(" + provider_id + "," + patient_id + ") does not exists");
                        return false;
                }
                for (var i = 0; i < sessions.length; i ++) {
                        sessions[i].deactivate();
                        G_DataModelContext.get_session_manager().update_session(sessions[i]);
                }
                return true;
        }

        this.get_participated_patient_ids = function(identity, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider_id = identity.get_account_record().get_account_id();
                var sessions = G_DataModelContext.get_session_manager().get_sessions_by_provider_id(
                                        provider_id, false);
                if (sessions == null) {
                        return null;
                }
                var patient_ids = [];
                for (var i = 0; i < sessions.length; i ++) {
                        patient_ids[i] = sessions[i].get_patient_id();
                }
                return patient_ids;
        }
        
        this.get_sessions_by_patient_id = function(identity, patient_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider_id = identity.get_account_record().get_account_id();
                var sessions = G_DataModelContext.get_session_manager().get_sessions_by_ids(
                                        provider_id, patient_id, false);
                return sessions;
        }
}
