// Data models go here
import {Meteor} from 'meteor/meteor';
import {AdminRecord, AdminRecord_create_from_POD} from './adminrecord.js'
import {Profile, Profile_create_from_POD} from './profile.js'


export function AccountManager(mongo) {
        this.__mongo = mongo

        // handle the collection.
        this.c_Admin_Records_Coll_Name = "AdminRecordsCollection";
        this.c_Profile_Coll_Name = "ProfileCollection";
        
        this.__admin_records = new Mongo.Collection(this.c_Admin_Records_Coll_Name);
        this.__profiles = new Mongo.Collection(this.c_Profile_Coll_Name);
        
        // private functions
        this.__has_profile = function(profile) {
                return this.__profiles.find({__account_id : profile.get_account_id()}).count() > 0 ||
                       this.__profiles.find({__email : profile.get_email()}).count() > 0;
        }
        
        this.__create_new_profile = function(account_id, profile) {
                profile.set_account_id(account_id);
                if (this.__has_profile(profile)) {
                        // profile has already existed.
                        return null;
                }
                this.__profiles.insert(profile);
                return profile;
        }
        
        this.__get_profile_by_id = function(account_id) {
                var result = this.__profiles.find({__account_id : account_id});
                if (result.count() > 0) {
                        return Profile_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.__get_profile_by_email = function(email) {
                var result = this.__profiles.find({__email : email});
                if (result.count() > 0) {
                        return Profile_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.__update_profile = function(profile) {
                this.__profiles.update({__account_id : profile.get_account_id()}, profile);
        }
        
        this.__remove_profile_by_id = function(id) {
                this.__profiles.remove({__account_id : id});
        }
        
        this.__has_record = function(account_id) {
                return this.__admin_records.find({__account_id : account_id}).count() > 0;
        }
        
        this.__remove_record_by_id = function(account_id) {
                this.__admin_records.remove({__account_id : account_id});
        }
        
        this.__create_new_record_with_id = function(account_type, account_id, password) {
                var record = new AdminRecord(account_type, password);
                record.set_account_id(account_id);
                record.set_activator(this.__mongo.get_string_uuid());
                this.__admin_records.insert(record);
                return record;
        }
        
        this.__create_new_record = function(account_type, password) {
                return this.__create_new_record_with_id(account_type, this.__mongo.get_uuid(), password);
        }

        this.__get_record_by_id = function(account_id) {
                var result = this.__admin_records.find({__account_id : account_id});
                if (result.count() > 0) {
                        return AdminRecord_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.__get_record_by_activator = function(activator) {
                var result = this.__admin_records.find({__activator : activator});
                if (result.count() > 0) {
                        return AdminRecord_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }

        this.__update_record = function(record) {
                this.__admin_records.update({__account_id : record.get_account_id()}, record);
        }
        
        // Public functions
        // Return an AdminRecord if successful, or otherwise null.
        this.create_account = function(account_type, password, profile) {
                var registered = this.__create_new_record(account_type, password);
                if (registered === null) return registered;
                if (this.__create_new_profile(registered.get_account_id(), profile) != null) {
                        return registered;
                } else {
                        // failed to create the profile, need to remove the record_fetched.
                        this.__remove_record_by_id(registered.get_account_id());
                        return null;
                }
        }
        
        this.create_account_with_id = function(account_type, account_id, password, profile) {
                if (this.__has_record(account_id)) return null;
                var registered = this.__create_new_record_with_id(account_type, account_id, password);
                if (registered === null) return registered;
                if (this.__create_new_profile(registered.get_account_id(), profile) != null) {
                        return registered;
                } else {
                        // failed to create the profile, need to remove the record_fetched.
                        this.__remove_record_by_id(registered.get_account_id());
                        return null;
                }
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_id = function(account_id) {
                return this.__get_record_by_id(account_id);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_activator = function(activator) {
                return this.__get_record_by_activator(activator);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_email = function(email) {
                var profile = this.__get_profile_by_email(email);
                if (profile === null) return null;
                return this.__get_record_by_id(profile.get_account_id());
        }
        
        // Return true if the activation is successful, false when the record doesn't exist or the activator is invalid.
        this.activate_account = function(record, activator) {
                if (record === null || !record.activate(activator)) return false;
                this.__update_record(record);
                return true;
        }
        
        // Return true if the activation is successful, false when the record doesn't exist
        this.force_activate_account = function(record) {
                if (record === null) return false;
                record.force_activate();
                this.__update_record(record);
                return true;
        }
        
        this.remove_account_by_id = function(account_id) {
                this.__remove_record_by_id(account_id);
                this.__remove_profile_by_id(account_id);
        }
        
        // Reset all the account information.
        this.reset = function() {
                this.__admin_records.remove({});
                this.__profiles.remove({});
        }
}

