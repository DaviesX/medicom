import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "../api/common.js"

export function PhysicalCondition() {
}

export function Patient(account_id) {
        this.__account_id = account_id;
        this.__curr_provider_id = null;
        this.__sessions_id = [];
        this.__curr_session = 0;
        this.__phys_cond = new PhysicalCondition();

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
        
        this.get_account_id = function() { return this.__account_id; }
}

export function Patient_Create_From_POD(pod) {
        var obj = new Patient(0);
        this.__account_id = pod.__account_id;
        this.__curr_provider_id = pod.__curr_provider_id;
        this.__sessions_id = pod.__sessions_id;
        this.__curr_session = pod.__curr_session;
        this.__phys_cond = pod.__phys_cond;
        return obj;
}
