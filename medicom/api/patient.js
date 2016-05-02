import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "../api/common.js"

export function PhysicalCondition() {
}

export function Patient(account_id) {
        this.__account_id = account_id;
        this.__phys_cond = new PhysicalCondition();

        this.set_physical_condition = function(phys_cond) { this.__phys_cond = phys_cond; } 
        this.get_physical_condition = function() { return this.__phys_cond; }
        this.get_account_id = function() { return this.__account_id; }
}

export function Patient_Create_From_POD(pod) {
        var obj = new Patient(0);
        this.__account_id = pod.__account_id;
        this.__phys_cond = pod.__phys_cond;
        return obj;
}
