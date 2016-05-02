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
                return G_DataModelContext.get_session_manager().create_session(provider_id, patient_id);
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
                }
                return true;
        }

        this.get_participated_patients = function(identity, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider_id = identity.get_account_record().get_account_id();
                var sessions = G_DataModelContext.get_session_manager().get_sessions_by_provider_id(
                                        provider_id, true);
                if (sessions == null) {
                        return null;
                }
                var patient_ids = [];
                for (var i = 0; i < sessions.length; i ++) {
                        patient_ids[i] = sessions[i].get_patient_id();
                }
                return patient_ids;
        }
}
