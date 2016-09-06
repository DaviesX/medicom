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

import {AdminRecord, admin_record_copy} from "./adminrecord.ts";

export class AccountInfo
{
        public m_record:       AdminRecord; 
        public m_account_id:   number;
        public m_name:         string;
        public m_email:        string;

        public constructor(record: AdminRecord, account_id: number, name: string, email: string)
        {
                this.m_record = record;
                this.m_account_id = account_id;
                this.m_name = name;
                this.m_email = email;
        }

        public is_equal(other: AccountInfo): boolean
        {
                return this.m_record.is_equal(other.m_record) &&
                       this.m_account_id == other.m_account_id &&
                       this.m_name == other.m_name &&
                       this.m_email == other.m_email;
        }
        
        public get_admin_record(): AdminRecord
        {
                return this.m_record;
        }
        
        public get_account_id(): number
        {
                return this.m_account_id;
        }
        
        public get_name(): string
        {
                return this.m_name;
        }
        
        public get_email(): string
        {
                return this.m_email;
        }
};

export function account_info_copy(pod: AccountInfo): AccountInfo
{
        var obj = new AccountInfo(null, null, null, null);
        obj.m_record            = admin_record_copy(pod.m_record);
        obj.m_account_id        = pod.m_account_id;
        obj.m_name              = pod.m_name;
        obj.m_email             = pod.m_email;
        return obj;
}
