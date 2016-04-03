import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// models
function ErrorMessageQueue() {
        this.__queue = new Array();
        
        this.log = function(message) {
                this.__queue.push(message);
        }
        
        this.fetch_all = function() {
                return this.__queue;
        }
}

function MongoDB() {
        // maintain a unique id collection
        this.c_Unique_Id_Collection = "UniqueIDCollection";
        this.__uuid_coll = null;
        
        this.__init = function() {
                if (this.__uuid_coll == null) {
                        this.__uuid_coll = new Mongo.Collection(this.c_Unique_Id_Collection);
                }
                if (this.__uuid_coll.find().count() === 0) {
                        console.log("MongoDB - It must be the first time loading the DB? Initializing Unique ID Collection");
                        this.__uuid_coll.insert({uuid : 0});
                } else {
                        console.log("MongoDB - The Unique ID Collection exists, reusing the information");
                }
        }
        
        this.__init();

        this.get_uuid = function() {
                var entry = this.__uuid_coll.find().fetch()[0];
                var uuid = entry.uuid;
                this.__uuid_coll.update({}, {uuid : ++ entry.uuid});
                return uuid;
        }
        
        this.get_string_uuid = function() {
                var holder = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
                var hex = '0123456789abcdef';
                var r = 0;
                var guid = "";
                for (var i = 0; i < 36; i++) {
                        if (holder[i] !== '-' && holder[i] !== '4') {
                                // each x and y needs to be random
                                r = Math.random() * 16 | 0;
                        }

                        if (holder[i] === 'x') {
                                guid += hex[r];
                        } else if (holder[i] === 'y') {
                                // clock-seq-and-reserved first hex is filtered and remaining hex values are random
                                r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??
                                r |= 0x8; // set pos 3 to 1 as 1???
                                guid += hex[r];
                        } else {
                                guid += holder[i];
                        }
                }
                return guid;
        }
        
        this.reset = function() {
                this.__uuid_coll.remove({});
                this.__init();
        }
}

function AdminRecord(account_type, password) {
        this.__account_id = "";
        this.__account_type = account_type;
        this.__password = password;
        this.__activator = "";

        this.set_account_id = function(account_id) { this.__account_id = account_id; }
        this.set_activator = function(activator) { this.__activator = activator; }
        
        this.get_account_id = function() { return this.__account_id; }
        this.get_account_type = function() { return this.__account_type; }
        this.verify_password = function(password) { return this.__password === password; }
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

function Profile(email, name, phone, avatar, description) {
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

function AccountManager(mongo) {
        this.__mongo = mongo

        // handle the collection.
        this.c_Admin_Records_Coll_Name = "AdminRecordsCollection";
        this.c_Profile_Coll_Name = "ProfileCollection";
        
        this.__admin_records = new Mongo.Collection(this.c_Admin_Records_Coll_Name);
        this.__profiles = new Mongo.Collection(this.c_Profile_Coll_Name);
        
        // private functions
        this.__has_record = function(account_id) {
                return this.__admin_records.find({__account_id : account_id}).count() > 0;
        }
        
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
        
        this.__get_record_by_id = function(account_id) {
                var result = this.__profiles.find({__account_id : account_id});
                if (result.count() > 0) {
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }
        
        this.__remove_record_by_id = function(account_id) {
                this.__admin_records.remove({__account_id : account_id});
        }

        this.__get_profile_by_email = function(email) {
                var result = this.__profiles.find({__email : email});
                if (result.count() > 0) {
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }

        this.__update_profile = function(profile) {
                this.__profiles.update({__account_id : profile.get_account_id()}, profile);
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
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }
        
        this.__get_record_by_activator = function(activator) {
                var result = this.__admin_records.find({__activator : activator});
                if (result.count() > 0) {
                        return result.fetch()[0];
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
                if (registered == null) return registered;
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
                if (!profile) return null;
                return this.__get_record_by_id(profile.get_account_id());
        }
        
        // Return true if the activation is successful, false when the record doesn't exist or the activator is invalid.
        this.actviate_account = function(record, activator) {
                if (!record || !record.activate(activator)) return false;
                this.__update_record(record);
                return true;
        }
        
        // Return true if the activation is successful, false when the record doesn't exist
        this.force_activate_account = function(record) {
                if (!record) return false;
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

function Identity() {
}

function IdentityManager(mongo) {
}



// singletons
var g_mongo = new MongoDB();
var g_account_mgr = new AccountManager(g_mongo);
var g_identity_mgr = new IdentityManager(g_mongo);

// Controllers


// constants
var c_Account_Type_Admin = 0;
var c_Account_Type_Provider = 1;
var c_Account_Type_Patient = 2;

var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";

function AccountControl() {
        // Public APIs
        // Return an AdminRecord if successful, or otherwise null.
        this.register = function(account_type, password, profile, err) {
                switch (account_type) {
                case c_Account_Type_Admin:
                        err.log("can't register an admin account");
                        return null;
                default:
                        var record = g_account_mgr.create_account(account_type, password, profile);
                        if (!record) {
                                err.log("account has existed");
                                return null;
                        }
                        return record;
                }
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.activate = function(record, activator, err) {
                if (!g_account_mgr.activate_account(record, activator)) {
                        err.log("Failed to activate, possbily due to an invalid activator: " + activator);
                        return false;
                }
                return true;
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.force_activate = function(record, account_id, err) {
                // verify that the record is valid.
//                var record = g_account_mgr.get_record_by_id(user.get_account_id());
                if (!record) {
                        err.log("Your account is invalid");
                        return false;
                }
                if (record.get_account_type() !== c_Account_Type_Admin) {
                        err.log("It needs to be the administrator to force activate an account");
                        return false;
                }
                if (!g_account_mgr.force_activate_account(record)) {
                        err.log("No such account to activate");
                        return false;
                }
                return true;
        }
}


// Web APIs
// test cases
function TestAccountControl() {
        console.log("TestAccountControl - begins");
        console.log("TestAccountControl - reset database");
        g_mongo.reset();
        g_account_mgr.reset();
        
        console.log("TestAccountControl - creating account");
        var acc_ctrl = new AccountControl();
        var profile = new Profile("example@mail.org", "Chifeng Wen", "424-299-7492", null, "Hello World!");
        var err = new ErrorMessageQueue();
        var record = acc_ctrl.register(c_Account_Type_Provider, "12345abcde", profile, err);
        console.log("created record: ");
        console.log(record);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - creating the same account(error expected).");
        record = acc_ctrl.register(c_Account_Type_Provider, "12345abcde", profile, err);
        console.log("created record: ");
        console.log(record);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - ends");
}

Meteor.startup(() => {
                // code to run on server at startup
                console.log("Meteor - starting up medicom server...");
                TestAccountControl();
                });
