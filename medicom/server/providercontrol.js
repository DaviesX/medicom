import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "../api/common.js"


export function ProviderControl(identity) {
        this.__identity = identity;

        this.add_patient = function(identity, patient_id, err) {
        }

        this.remove_patient = function(identity, patient_id, err) {
        }

        this.get_participated_patients = function(identity, err) {
        }
}
