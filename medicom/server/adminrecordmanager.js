import {Meteor} from 'meteor/meteor';
import {AdminRecord, AdminRecord_create_from_POD} from "../api/adminrecord.js"

export function AdminRecordManager(mongodb) {
        this.__mongodb = mongodb;
        
        // handle the collection.
        this.c_Admin_Records_Coll_Name = "AdminRecordsCollection";
        this.__admin_records = new Mongo.Collection(this.c_Admin_Records_Coll_Name);
        
        this.has_record = function(account_id) {
                return this.__admin_records.find({__account_id : account_id}).count() > 0;
        }
        
        this.create_new_record_with_id = function(account_type, account_id, password) {
                var record = new AdminRecord(account_type, password);
                record.set_account_id(account_id);
                record.set_activator(this.__mongodb.get_string_uuid());
                this.__admin_records.insert(record);
                return record;
        }
        
        this.create_new_record = function(account_type, password) {
                return this.create_new_record_with_id(account_type, this.__mongodb.get_uuid(), password);
        }

        this.get_record_by_id = function(account_id) {
                var result = this.__admin_records.find({__account_id : account_id});
                if (result.count() > 0) {
                        return AdminRecord_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.get_record_by_activator = function(activator) {
                var result = this.__admin_records.find({__activator : activator});
                if (result.count() > 0) {
                        return AdminRecord_create_from_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }

        this.update_record = function(record) {
                this.__admin_records.update({__account_id : record.get_account_id()}, record);
        }
        
        this.remove_record_by_id = function(account_id) {
                this.__admin_records.remove({__account_id : account_id});
        }
        
        this.reset = function() {
                this.__admin_records.remove({});
        }
}
