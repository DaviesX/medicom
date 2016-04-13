import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'

export function PatientManager(mongodb) {
        this.__mongodb = mongodb;
}
