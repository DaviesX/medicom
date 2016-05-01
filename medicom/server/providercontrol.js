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
                        return false;
                }
                var provider = this.__get_provider_from_identity(identity);
                provider.add_patient(patient_id);
                return true;
        }

        this.remove_patient = function(identity, patient_id, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return false;
                }
                var provider = this.__get_provider_from_identity(identity);
                provider.remove_patient(patient_id);
                return true;
        }

        this.get_participated_patients = function(identity, err) {
                if (!this.__has_provider_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                var provider = this.__get_provider_from_identity(identity);
                return provider.get_patient_ids();
        }
}
