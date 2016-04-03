import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

function MongoDB(db_location) {
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
        this.__private_flag = 0;
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
                } 
        }
        this.is_activated = function() { return this.__activator === "-1"; }
}

function AdminRecordsManager(mongo) {
        this.c_Collection_Name = "AdminRecords";
        this.__mongo = mongo;

        // handle the collection
        this.c_Admin_Records_Collection= "AdminRecordsCollection";
        this.__admin_records= new Mongo.Collection(this.c_Admin_Records_Collection);

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

        this.put_record = function(record) {
                this.__admin_records.update({__account_id : record.get_account_id()}, record);
        }
}

// singletons
var g_mongo = new MongoDB("mongodb://localhost:27017/medicom-db");
var g_admin_mgr = new AdminRecordsManager(g_mongo);

// constants
var c_Account_Type_Provider = 1;
var c_Account_Type_Patience = 2;


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

Meteor.startup(() => {
                // code to run on server at startup
                console.log("Meteor - starting up medicom server...");
                TestAdminRecordsManager();
                });
