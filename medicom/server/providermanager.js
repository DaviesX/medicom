import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'

export function ProviderManager(mongodb) {
        this.__mongodb = mongodb;
        
        this.create_provider = function(account_id) {
        }
        
        this.remove_provider = function(account_id) {
        }
        
        this.get_provider = function(account_id) {
        }
        
        this.update_provider = function(provider) {
        }
}
