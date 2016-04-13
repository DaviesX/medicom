import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'


export function Provider(provider_id) {
        this.__provider_id = provider_id;
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
        
        this.get_provider_id = function() { return this.__provider_id; }
        this.get_patient_ids = function() { return this.__patient_ids; }
}

