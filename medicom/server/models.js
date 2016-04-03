// Data models go here
import { Meteor } from 'meteor/meteor';


export function AdminRecord(account_type, password) {        
        this.__hash33 = function(s) {
                var h = 5381;
                for (var i = 0; i < s.length; i ++) {
                        var c = s.charCodeAt(i);
                        h = ((h << 5) + h) + c;
                }
                return h >>> 0;
        }
        
        this.__account_id = 0;
        this.__account_type = account_type;
        this.__internal_pass = this.__hash33(password);
        this.__activator = "";

        this.set_account_id = function(account_id) { this.__account_id = account_id; }
        this.set_activator = function(activator) { this.__activator = activator; }
        
        this.get_account_id = function() { return this.__account_id; }
        this.get_account_type = function() { return this.__account_type; }
        this.verify_password = function(password) { return this.__internal_pass === this.__hash33(password); }
        this.verify_internal_pass = function(pass) { return this.__internal_pass === pass; }
        this.get_internal_pass = function() { return this.__internal_pass; }
        this.activate = function(activator) { 
                if (this.__activator === activator) { 
                        this.__activator = "-1";
                        return true;
                } else {
                        return false;
                }
        }
        this.deactivate = function(activator) { this.__activator = activator; }
        this.force_activate = function() { this.__activator = "-1"; }
        this.is_activated = function() { return this.__activator === "-1"; }
}

function AdminRecord_create_from_POD(pod) {
        var obj = new AdminRecord(0, "");
        obj.__account_id = pod.__account_id;
        obj.__account_type = pod.__account_type;
        obj.__internal_pass = pod.__internal_pass;
        obj.__activator = pod.__activator;
        return obj;
}

export function Profile(email, name, phone, avatar, description) {
        this.__account_id = "";
        this.__email = email; 
        this.__name = name; 
        this.__phone = phone; 
        this.__avatar = avatar;
        this.__description = description;

        this.set_account_id = function(account_id) { this.__account_id = account_id; }
        this.set_email = function(email) { this.__email = email; }
        this.set_name = function(name) { this.__name = name; }
        this.set_phone = function(phone) { this.__phone = phone; }
        this.set_description = function(description) { this.__description = description; }
        this.set_avatar = function(avatar) { this.__avatar = avatar; }

        this.get_account_id = function() { return this.__account_id; }
        this.get_email = function() { return this.__email; }
        this.get_name = function() { return this.__name; }
        this.get_phone = function() { return this.__phone; }
        this.get_description = function() { return this.__description; }
        this.get_avatar = function() { return this.__avatar; }
}

function Profile_create_from_POD(pod) {
        var obj = new Profile("", "", "", null, "");
        obj.__account_id = pod.__account_id;
        obj.__email = pod.__email; 
        obj.__name = pod.__name; 
        obj.__phone = pod.__phone; 
        obj.__avatar = pod.__avatar;
        obj.__description = pod.__description;
        return obj;
}

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
        
        this.__has_record = function(account_id) {
                return this.__admin_records.find({__account_id : account_id}).count() > 0;
        }
        
        this.__remove_record_by_id = function(account_id) {
                this.__admin_records.remove({__account_id : account_id});
        }

        this.__create_new_record = function(account_type, password) {
                var record = new AdminRecord(account_type, password);
                record.set_account_id(this.__mongo.get_uuid());
                record.set_activator(this.__mongo.get_string_uuid());
                this.__admin_records.insert(record);
                return record;
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
        
        // Reset all the account information.
        this.reset = function() {
                this.__admin_records.remove({});
                this.__profiles.remove({});
        }
}

export function Identity(session_id, record) {
        this.__session_id = session_id;
        this.__record = record;
        this.__date = new Date();
        this.get_account_record = function() { return this.__record; }
        this.get_session_id = function() { return this.__session_id; }
        this.get_last_date = function() { return this.__date; }
        this.update_date = function() { return this.__date = new Date(); }
}

function Identity_create_from_POD(pod) {
        var obj = new Identity("", null);
        this.__session_id = pod.__session_id;
        this.__record = AdminRecord_create_from_POD(pod.__record);
        this.__date = pod.__date;
        return obj;
}

export function IdentityManager(mongo, account_mgr, session_out_intv) {
        this.__minute2milli = function(min) { return min*60*1000; }
        this.__mongo = mongo;
        this.__account_mgr = account_mgr;
        this.__session_out_intv = this.__minute2milli(session_out_intv);
        
        // handle the collection
        this.c_Identity_Coll_Name = "IdentityCollection";
        this.__identities = new Mongo.Collection(this.c_Identity_Coll_Name);
        
        this.verify_identity = function(identity) {
                if (identity === null) return false;
                var result = this.__identities.find({__session_id : identity.get_session_id()});
                if (result.count() == 0) return false;
                
                var db_iden = Identity_create_from_POD(result.fetch()[0]);
                var db_account = db_iden.get_account_record();
                var param_account = identity.get_account_record();
                if (db_account.get_account_id() !== param_account.get_account_id() ||
                    db_account.verify_internal_pass(param_account.get_internal_pass() ||
                    !db_account.is_activated())) {
                        return false;
                }
                
                var curr_time = new Date();
                var inactive_intv = curr_time.getTime() - db_iden.get_last_date().getTime();
                if (inactive_intv < 0 || inactive_intv > this.__session_out_intv) {
                        // Time out, needs to remove this identity.
                        this.__identities.remove({__session_id : identity.get_session_id()});
                        return false;
                }
                db_iden.update_date();
                return true;
        }
        
        this.login = function(record, password) {
                if (record === null || !record.verify_password(password)) return null;
                var iden = new Identity(this.__mongo.get_string_uuid(), record);
                this.__identities.insert(iden);
                return iden;
        }
        
        this.logout = function(identity) {
                this.__identities.remove({__session_id : identity.get_session_id()});
        }
        
        this.get_identity_by_session_id = function(session_id) {
                var result = this.__identities.find({__session_id : session_id});
                if (result.count() > 0) {
                        return Identity_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        // Reset all the identity records.
        this.reset = function() {
                this.__identities.remove({});
        }
}
