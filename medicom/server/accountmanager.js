// Data models go here
import {Meteor} from 'meteor/meteor';
import {AdminRecordManager} from './adminrecordmanager.js'
import {ProfileManager} from './profilemanager.js'


export function AccountManager(mongo, admin_record_mgr, profile_mgr, provider_mgr, patient_mgr) {
        this.__mongo = mongo;
        this.__admin_record_mgr = admin_record_mgr;
        this.__profile_mgr = profile_mgr;
        this.__provider_mgr = provider_mgr;
        this.__patient_mgr = patient_mgr;
        
        // Public functions
        // Return an AdminRecord if successful, or otherwise null.
        this.create_account = function(account_type, password, profile) {
                var registered = this.__admin_record_mgr.create_new_record(account_type, password);
                if (registered === null) return registered;
                if (this.__profile_mgr.create_new_profile(registered.get_account_id(), profile) != null) {
                        return registered;
                } else {
                        // failed to create the profile, need to remove the record_fetched.
                        this.__admin_record_mgr.remove_record_by_id(registered.get_account_id());
                        return null;
                }
        }
        
        this.create_account_with_id = function(account_type, account_id, password, profile) {
                if (this.__admin_record_mgr.has_record(account_id)) return null;
                var registered = this.__admin_record_mgr.create_new_record_with_id(account_type, account_id, password);
                if (registered === null) return registered;
                if (this.__profile_mgr.create_new_profile(registered.get_account_id(), profile) != null) {
                        return registered;
                } else {
                        // failed to create the profile, need to remove the record_fetched.
                        this.__admin_record_mgr.remove_record_by_id(registered.get_account_id());
                        return null;
                }
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_id = function(account_id) {
                return this.__admin_record_mgr.get_record_by_id(account_id);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_activator = function(activator) {
                return this.__admin_record_mgr.get_record_by_activator(activator);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_email = function(email) {
                var profile = this.__profile_mgr.get_profile_by_email(email);
                if (profile === null) return null;
                return this.__admin_record_mgr.get_record_by_id(profile.get_account_id());
        }
        
        // Return true if the activation is successful, false when the record doesn't exist or the activator is invalid.
        this.activate_account = function(record, activator) {
                if (record === null || !record.activate(activator)) return false;
                this.__admin_record_mgr.update_record(record);
                return true;
        }
        
        // Return true if the activation is successful, false when the record doesn't exist
        this.force_activate_account = function(record) {
                if (record === null) return false;
                record.force_activate();
                this.__admin_record_mgr.update_record(record);
                return true;
        }
        
        this.remove_account_by_id = function(account_id) {
                this.__admin_record_mgr.remove_record_by_id(account_id);
                this.__profile_mgr.remove_profile_by_id(account_id);
        }
        
        // Reset all the account information.
        this.reset = function() {
                this.__admin_record_mgr.reset();
                this.__profile_mgr.reset();
        }
}

