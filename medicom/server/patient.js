import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'

export function PhysicalCondition() {
}

export function Patient(patient_id) {
        this.__patient_id = patient_id;
        this.__curr_provider_id = null;
        this.__sessions_id = [];
        this.__curr_session = 0;
        this.__phys_cond = null;

        this.start_participation_with = function(provider_id) {
                this.__curr_provider_id = provider_id;
        }

        this.quit_participation = function() {
                this.__curr_provider_id = null;
        }
        
        this.is_participating = function() { 
                return this.__curr_provider_id != null; 
        }   
             
        this.current_provider_id = function() { 
                return this.__curr_provider_id; 
        }
        
        this.current_session_id = function() {
                if (this.is_participating()) {
                        return this.__sessions_id[this.__curr_session - 1];
                } else {
                        return null;
                }
        }

        this.set_physical_condition = function(phys_cond) {
                this.__phys_cond = phys_cond;
        }
        
        this.get_physical_condition = function() {
                return this.__phys_cond;
        }
}
