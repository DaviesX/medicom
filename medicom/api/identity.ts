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

export class Identity
{
        public m_session_id:    number;
        public m_elev_stack:    Array<AdminRecord>;
        public m_record:        AdminRecord;
        public m_date:          Date;

        constructor(session_id: number, record: AdminRecord)
        {
                this.m_elev_stack.push(record);
                this.m_date = new Date();
        }

        public elevate(record: AdminRecord): void
        {
                this.m_elev_stack.push(record);
                this.m_record = record;
        }
        
        public descend(): void
        {
                if (this.m_elev_stack.length > 1)
                        this.m_record = this.m_elev_stack.pop();
        }
        
        public get_account_record(): AdminRecord
        {
                return this.m_record;
        }
        
        public get_session_id(): number
        {
                return this.m_session_id;
        }
        
        public get_last_date(): Date
        {
                return this.m_date;
        }
        
        public update_date(): Date
        {
                return this.m_date = new Date();
        }
};

export function identity_copy(pod) 
{
        var obj = new Identity(null, null);
        obj.m_session_id = pod.m_session_id;
        obj.m_elev_stack = pod.m_elev_stack;
        for (var i = 0; i < obj.m_elev_stack.length; i ++)
                obj.m_elev_stack[i] = admin_record_copy(obj.m_elev_stack[i]);
        obj.m_record = admin_record_copy(pod.m_record);
        obj.m_date = pod.m_date;
        return obj;
}
