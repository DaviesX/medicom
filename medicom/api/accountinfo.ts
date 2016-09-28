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

import {IDataTransaction} from "./idatatransaction.ts";
import {AdminRecord} from "./adminrecord.ts";


export class AccountInfo implements IDataTransaction
{
        private record:       AdminRecord; 
        private account_id:   number;
        private name:         string;
        private email:        string;

        public constructor(record: AdminRecord, account_id: number, name: string, email: string)
        {
                this.record = record;
                this.account_id = account_id;
                this.name = name;
                this.email = email;
        }

        public is_equal(other: AccountInfo): boolean
        {
                return this.record.is_equal(other.record) &&
                       this.account_id == other.account_id &&
                       this.name == other.name &&
                       this.email == other.email;
        }
        
        public get_admin_record(): AdminRecord
        {
                return this.record;
        }
        
        public get_account_id(): number
        {
                return this.account_id;
        }
        
        public get_name(): string
        {
                return this.name;
        }
        
        public get_email(): string
        {
                return this.email;
        }

        public static recover(pod: any): AccountInfo
        {
                var obj = new AccountInfo(null, null, null, null);
                obj.record              = AdminRecord.recover(pod.record);
                obj.account_id          = pod.account_id;
                obj.name                = pod.name;
                obj.email               = pod.email;
                return obj;
        }
};

