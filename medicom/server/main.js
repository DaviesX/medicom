import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// models
function MongoDB() {
        // connect to the database
//        this.__mongo_client = require('mongodb').MongoClient;
//        this.__mongo_client.connect(db_location, function(err, db) {
//                if(!err) {
//                        console.log("MongoDB - have been connected to: " + db_location);
//                } else {
//                        console.log("MongoDB - failed to connect to: " + db_location);
//                        console.log("MongoDB - error: " + err);
//                }
//        });

        // maintain a unique id collection
        this.c_Unique_Id_Collection = "UniqueIDCollection2";
        this.__uuid_coll = new Mongo.Collection(this.c_Unique_Id_Collection);
        if (this.__uuid_coll.find().count() === 0) {
                console.log("MongoDB - It must be the first time loading the DB? Initializing Unique ID Collection");
                this.__uuid_coll.insert({uuid : 0});
        } else {
                console.log("MongoDB - The Unique ID Collection exists, reusing the information");
        }

//        this.get_mongo_connection = function() { return this.__mongo_client; }
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

function AdminRecordsManager() {
        // handle the collection
        this.c_Collection_Name = "AdminRecordsCollection";
        this.__admin_records= new Mongo.Collection(this.c_Collection_Name);
        
        this.has_record(account_id) {
                return this.__admin_records.find({__account_id : account_id}).count() > 0;
        }

        this.create_new_record = function(account_type, password) {
                var record = new AdminRecord(account_type, password);
                record.set_account_id(this.__mongo.get_uuid());
                record.set_activator(this.__mongo.get_string_uuid());
                this.__admin_records.insert(record);
                return record;
        }

        this.get_record_by_id = function(account_id) {
                var result = this.__admin_records.find({__account_id : account_id});
                if (result.count() > 0) {
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }
        
        this.get_record_by_activator = function(activator) {
                var result = this.__admin_records.find({__activator : activator});
                if (result.count() > 0) {
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }

        this.update_record = function(record) {
                this.__admin_records.update({__account_id : record.get_account_id()}, record);
        }
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

function ProfileManager() {
        this.c_Collection_Name = "Profile";

        // handle the collection
        this.__profiles = new Mongo.Collection(this.c_Collection_Name);
        
        this.has_profile(profile) {
                return this.__profiles.find({__account_id : profile.get_account_id()}).count() > 0 ||
                       this.__profiles.find({__email : profile.get_email()}).count() > 0;
        }
        
        this.create_new_profile = function(account_id, profile) {
                profile.set_account_id(account_id);
                if (has_profile(profile)) {
                        // profile has already existed
                        return null;
                }
                this.__profiles.insert(profile);
                return profile;
        }

        this.get_record_by_id = function(account_id) {
                var result = this.__profiles.find({__account_id : account_id});
                if (result.count() > 0) {
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }
        
        this.get_record_by_email = function(email) {
                var result = this.__profiles.find({__email : email});
                if (result.count() > 0) {
                        return result.fetch()[0];
                } else {
                        return null;
                }
        }

        this.put_record = function(profile) {
                this.__profiles.update({__account_id : profile.get_account_id()}, profile);
        }
}

// singletons
var g_mongo = new MongoDB();
var g_admin_mgr = new AdminRecordsManager();
var g_profile_mgr = new ProfileManager();

function account_register_user(account_type, password, profile)
{
        var registered = g_admin_mgr.create_new_record(account_type, password);
        if (registered == null) return false;
        return g_profile_mgr.create_new_profile(registered.get_account_id(), profile) != null;
}

function account_activate_user(activator)
{
        var record = g_admin_mgr.get_record_by_activator(activator);
        if (!record || !record.activate(activator)) return false;
        g_admin_mgr.update_record(record);
        return true;
}

function account_force_activate_user(account_id)
{
        var record = g_admin_mgr.get_record_by_id(account_id);
        if (!record) return false;
        record.force_activate();
        g_admin_mgr.update_record(record);
        return true;
}


// Controllers
function ErrorMessageQueue() {
        this.__queue = new Array();
        
        this.log(message) {
                queue.push(message);
        }
        
        this.fetch_all() {
                return this.__queue;
        }
}

// constants
var c_Account_Type_Admin = 0;
var c_Account_Type_Provider = 1;
var c_Account_Type_Patient = 2;

var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";

function AccountControl() {
        this.register = function(account_type, password, profile, err) {
                switch (admin_record.get_account_type()) {
                case c_Account_Type_Admin:
                        err.log("can't register an admin account");
                        return false;
                default:
                        if (!account_register_user(account_type, password, profile)) {
                                err.log("account has been existed");
                                return false;
                        }
                        return true;
                }
        }
        this.activate = function(activator, user, err) {
                if (!account_activate_user(activator)) {
                        err.log("Failed to activate, possbily due to an invalid activator: " + activator);
                        return false;
                }
                return true;
        }
        this.force_activate = function(account_id, user, err) {
                var record = g_admin_mgr.get_record_by_id(user.get_account_id());
                if (!record) return false;
                if (record.get_account_type() !== c_Account_Type_Admin) {
                        err.log("It needs to be the administrator to force activate an account");
                        return false;
                }
                if (!account_force_activate_user(account_id)) {
                        err.log("No such account to activate");
                        return false;
                }
                return true;
        }
}


// Web APIs
// test cases
function TestAdminRecordsManager() {
        console.log("TestAdminRecordsManager - begins");
        var record = g_admin_mgr.create_new_record(c_Account_Type_Provider, "12345abcde");
        console.log("created record: ");
        console.log(record);
        var record_fetched = g_admin_mgr.get_record_by_id(record.get_account_id());
        console.log("fetched record: ");
        console.log(record_fetched);
        console.log("TestAdminRecordsManager - ends");
}

function TestAccountControl() {
        console.log("TestAccountControl - begins");
        console.log("TestAccountControl - ends");
}

Meteor.startup(() => {
                // code to run on server at startup
                console.log("Meteor - starting up medicom server...");
                // TestAdminRecordsManager();
                });
