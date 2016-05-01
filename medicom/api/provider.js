import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "../api/common.js"


export function Provider(account_id) {
        this.__account_id = account_id;
        this.__patient_ids = new Set();
        
        this.add_patient = function(patient_id) {
                this.__patient_ids.add(patient_id);
        }
        
        this.remove_patient = function(patient_id) {
                this.__patient_ids.delete(patient_id);
        }
        
        this.has_patient = function(patient_id) {
                return this.__patient_ids.has(patient_id);
        }
        
        this.get_account_id = function() { return this.__account_id; }
        this.get_patient_ids = function() { return this.__patient_ids; }
}

export function Provider_Create_From_POD(pod) {
        var obj = new Provider(0);
        this.__account_id = pod.__account_id;
        this.__patient_ids = pod.__patient_ids;
        return obj;
}
