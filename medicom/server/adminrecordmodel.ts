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

import {Mongo} from "meteor/mongo";
import {MongoUtil} from "../api/mongoutil";
import {AdminRecord} from "../api/adminrecord";

/*
 * <AdminRecordModel> AdminRecord storage model.
 */
export class AdminRecordModel
{
        private m_util:                 MongoUtil;
        private m_admin_records:        Mongo.Collection<AdminRecord>;

        constructor(util: MongoUtil)
        {
                this.m_util = util;
                this.m_admin_records = new Mongo.Collection<AdminRecord>("AdminRecordsCollection");
        }

        public has_record(account_id: number): boolean
        {
                return null != this.m_admin_records.findOne({account_id: account_id});
        }

        public create_new_record_with_id(user_group: number, 
                                         account_id: number, 
                                         password: string, 
                                         privi_ref: number): AdminRecord
        {
                if (this.has_record(account_id))
                        throw new Error("Account ID: " + account_id + " exists");
                var record = new AdminRecord(account_id, user_group, password,
                                             this.m_util.get_string_uuid(), 
                                             privi_ref);
                this.m_admin_records.insert(record);
                return record;
        }

        public create_new_record(user_group: number, password: string, privi_ref: number): AdminRecord
        {
                return this.create_new_record_with_id(user_group, this.m_util.get_uuid(), password, privi_ref);
        }

        public get_record_by_id(account_id: number): AdminRecord
        {
                var record = this.m_admin_records.findOne({account_id: account_id});
                return record != null ? AdminRecord.recover(record) : null;
        }

        public get_record_by_auth_code(auth_code: string): AdminRecord
        {
                var record = this.m_admin_records.findOne({authcode: auth_code});
                return record != null ? AdminRecord.recover(record) : null;
        }

        public update_record(record: AdminRecord): void
        {
                this.m_admin_records.update({account_id: record.get_account_id()}, record);
        }

        public remove_record_by_id(account_id: number): number
        {
                return this.m_admin_records.remove({account_id: account_id});
        }

        public reset(): number 
        {
                return this.m_admin_records.remove({});
        }
};
