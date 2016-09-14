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

export class MedicalSession implements IDataTransaction
{
        public session_id:    number;
        public isactive:     boolean = false;

        public start_time:    number;
        public end_time:      number = null;

        public notes:         string;

        constructor(session_id: number)
        {
                this.start_time = new Date().getTime();
                this.session_id = session_id;
        }

        public get_session_id(): number
        {
                return this.session_id;
        }
        
        public activate(): void
        {
                this.isactive = true;
                this.end_time = null;
        }
        
        public deactivate(): void
        {
                this.isactive = false;
                this.end_time = new Date().getTime();
        }
        
        public is_active(): boolean
        {
                return this.isactive;
        }
        
        public set_notes(notes: string): void
        {
                this.notes = notes;
        }
        
        public get_notes(): string
        {
                return this.notes;
        }
        
        public get_start_date(): Date
        {
                return new Date(this.start_time);
        }
        
        public get_end_date(): Date
        {
                return new Date(this.end_time);
        }
}

export function medical_session_copy(pod): MedicalSession
{
        var obj = new MedicalSession(null);
        obj.session_id = pod.session_id;
        obj.isactive = pod.isactive;
        obj.notes = pod.notes;
        obj.start_time = pod.start_time;
        obj.end_time = pod.end_time;
        return obj;
}
