import {Meteor} from "meteor/meteor";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {SessionUtils} from "./sessionutils.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {c_Account_Type_Provider} from "../api/accounttype.js";


export function ProviderControl() {
        this.__session_utils = new SessionUtils();
        
        this.__has_provider_identity = function(identity) {
                return (G_DataModelContext.get_identity_manager().verify_identity(identity)) &&
                       (identity.get_account_record().get_account_type() == c_Account_Type_Provider);
        }
        
        this.__get_provider_from_identity = function(identity) {
                return G_DataModelContext.get_provider_manager().
                                get_provider_by_id(identity.get_account_record().get_account_id);
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
}
