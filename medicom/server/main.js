import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// Models
function ErrorMessageQueue() {
        this.__queue = new Array();
        
        this.log = function(message) {
                this.__queue.push(message);
        }
        
        this.fetch_all = function() {
                var answer = [];
                for (var i = 0; i < this.__queue.length; i ++) {
                        answer[i] = this.__queue[i];
                }
                this.__queue = [];
                return answer;
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

function AccountManager(mongo) {
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

function Identity(session_id, record) {
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

function IdentityManager(mongo, account_mgr, session_out_intv) {
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

function AccountInfo(account_id, name, email) {
        this.__account_id = account_id;
        this.__name = name;
        this.__email = email;
        this.get_account_id = function() { return this.__account_id; }
        this.get_name = function() { return this.__name; }
        this.get_email = function() { return this.__email; }
}

function AccountControl() {
        // Public APIs
        // Return account info if successful, or otherwise null.
        this.register = function(account_type, password, profile, err) {
                switch (account_type) {
                case c_Account_Type_Admin:
                        err.log("Cannot register an admin account");
                        return null;
                default:
                        var record = g_account_mgr.create_account(account_type, password, profile);
                        if (!record) {
                                err.log("Cannot register, account existed");
                                return null;
                        }
                        var account_info = new AccountInfo(record.get_account_id(),
                                                           profile.get_name(),
                                                           profile.get_email());
                        return account_info;
                }
        }
        
        this.get_all_account_infos = function(identity) {
        }
        
        this.remove_account = function(identity, account_id, err) {
        }
        
        // Return an identity if successful, or otherwise null.
        this.login_by_email = function(email, password, err) {
                var record = g_account_mgr.get_account_record_by_email(email);
                var identity = g_identity_mgr.login(record, password);
                if (identity === null) {
                        err.log("Invalid user name/password");
                        return null;
                }
                return identity;
        }
        
        // Return an identity if successful, or otherwise null.
        this.login_by_account_id = function(account_id, password, err) {
                var record = g_account_mgr.get_account_record_by_id(account_id);
                var identity = g_identity_mgr.login(record, password);
                if (identity === null) {
                        err.log("Invalid user name/password");
                        return null;
                }
                return identity;       
        }
        
        this.logout = function(identity, err) {
                if (!g_account_mgr.verify_identity(identity))
                        err.log("The identity is invalid");
                g_account_mgr.logout(identity);
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.activate = function(activator, err) {
                var record = g_account_mgr.get_account_record_by_activator(activator);
                if (!g_account_mgr.activate_account(record, activator)) {
                        err.log("Failed to activate, possbily due to an invalid activator: " + activator);
                        return false;
                }
                return true;
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.force_activate = function(identity, account_id, err) {
                if (!g_identity_mgr.verify(identity)) {
                        err.log("Your identity is invalid, please try to login");
                }
                var record = identity.get_account_record();
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
        var account_info = acc_ctrl.register(c_Account_Type_Provider, "12345abcde", profile, err);
        console.log("created record: ");
        console.log(account_info);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - creating the same account(error expected).");
        var account_info2 = acc_ctrl.register(c_Account_Type_Provider, "12345abcde", profile, err);
        console.log("created record: ");
        console.log(account_info2);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - try to activate the account");
        var record = g_account_mgr.get_account_record_by_id(account_info.get_account_id());
        if (!acc_ctrl.activate(record.__activator, err)) {
                console.log("TestAccountControl - Failed to activate the account when it should, error: " + err.fetch_all());
        }
        
        console.log("TestAccountControl - try to login the account");
        var identity = acc_ctrl.login_by_email("example@mail.org", "12345abcde", err);
        console.log("identity retrieved: ");
        console.log(identity);
        console.log("error: " + err.fetch_all());
        console.log("TestAccountControl - ends");
}


Meteor.startup(() => {
                // code to run on server at startup
                console.log("Meteor - starting up medicom server...");
                TestAccountControl();
                });
