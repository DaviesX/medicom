/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Chifeng Wen.
 * MediCom is free software; you can redistribute it and/or modify it under the terms of
 * the GNU General Public License, version 2, as published by the Free Software Foundation.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import {Meteor} from 'meteor/meteor';
import {AdminRecord, AdminRecord_create_from_POD} from "../api/adminrecord.js"


export function AdminRecordModel(mongodb)
{
        this.__mongodb = mongodb;

        // handle the collection.
        this.c_Admin_Records_Coll_Name = "AdminRecordsCollection";
        this.__admin_records = new Mongo.Collection(this.c_Admin_Records_Coll_Name);
}

AdminRecordModel.prototype.has_record = function(account_id)
{
        return this.__admin_records.find({__account_id : account_id}).count() > 0;
}

AdminRecordModel.prototype.create_new_record_with_id = function(user_group, account_id, password, privi_ref)
{
        var record = new AdminRecord(account_id, user_group, password,
                                     this.__mongodb.get_string_uuid(), privi_ref);
        this.__admin_records.insert(record);
        return record;
}

AdminRecordModel.prototype.create_new_record = function(user_group, password, privi_ref)
{
        return this.create_new_record_with_id(user_group, this.__mongodb.get_uuid(), password, privi_ref);
}

AdminRecordModel.prototype.get_record_by_id = function(account_id)
{
        var result = this.__admin_records.find({__account_id : account_id});
        return result.count() > 0 ? AdminRecord_create_from_POD(result.fetch()[0]) : null;
}

AdminRecordModel.prototype.get_record_by_auth_code = function(auth_code)
{
        var result = this.__admin_records.find({__auth_code : auth_code});
        return result.count() > 0 ? AdminRecord_create_from_POD(result.fetch()[0]) : null;
}

AdminRecordModel.prototype.update_record = function(record)
{
        this.__admin_records.update({__account_id : record.get_account_id()}, record);
}

AdminRecordModel.prototype.remove_record_by_id = function(account_id)
{
        this.__admin_records.remove({__account_id : account_id});
}

AdminRecordModel.prototype.reset = function()
{
        this.__admin_records.remove({});
}
