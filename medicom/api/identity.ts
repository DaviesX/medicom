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
import {AdminRecord, admin_record_copy} from "./adminrecord.ts";

export class Identity implements IDataTransaction
{
        public session_id:      string;
        public elev_stack:      Array<AdminRecord>;
        public record:          AdminRecord;
        public date:            Date;

        constructor(session_id: string, record: AdminRecord)
        {
                this.elev_stack = new Array<AdminRecord>();
                this.elev_stack.push(record);
                this.date = new Date();
        }

        public elevate(record: AdminRecord): void
        {
                this.elev_stack.push(record);
                this.record = record;
        }
        
        public descend(): void
        {
                if (this.elev_stack.length > 1)
                        this.record = this.elev_stack.pop();
        }
        
        public get_account_record(): AdminRecord
        {
                return this.record;
        }
        
        public get_session_id(): string
        {
                return this.session_id;
        }
        
        public get_last_date(): Date
        {
                return this.date;
        }
        
        public update_date(): Date
        {
                return this.date = new Date();
        }
};

export function identity_copy(pod): Identity
{
        var obj = new Identity(null, null);
        obj.session_id = pod.session_id;
        obj.elev_stack = pod.elev_stack;
        for (var i = 0; i < obj.elev_stack.length; i ++)
                obj.elev_stack[i] = admin_record_copy(obj.elev_stack[i]);
        obj.record = admin_record_copy(pod.record);
        obj.date = pod.date;
        return obj;
}
