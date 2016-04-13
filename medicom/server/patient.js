import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'

export function PhysicalCondition() {
}

export function ParticipatedSession() {

        this.add_measurement = function(measure) {
        }
}

export function Patient() {
        this.__phys_cond = null;

        this.start_participation = function() {
        }

        this.quit_participation = function() {
        }

        this.set_physical_condition = function(phys_cond) {
                this.__phys_cond = phys_cond;
        }
}
