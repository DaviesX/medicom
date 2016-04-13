import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'

export function ProviderManager(mongodb) {
        this.__mongodb = mongodb;
}
