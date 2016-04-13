import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'


export function ProviderControl(identity) {
        this.__identity = identity;

        this.add_patient = function(patient) {
        }

        this.remove_patient = function(patient) {
        }

        this.get_participated_patients = function() {
        }
}
