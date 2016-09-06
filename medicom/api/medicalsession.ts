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
        public m_session_id:    number;
        public m_is_active:     boolean = false;

        public m_start_time:    number;
        public m_end_time:      number = null;

        public m_notes:         string;

        constructor(session_id: number)
        {
                this.m_start_time = new Date().getTime();
                this.m_session_id = session_id;
        }

        public get_session_id(): number
        {
                return this.m_session_id;
        }
        
        public activate(): void
        {
                this.m_is_active = true;
                this.m_end_time = null;
        }
        
        public deactivate(): void
        {
                this.m_is_active = false;
                this.m_end_time = new Date().getTime();
        }
        
        public is_active(): boolean
        {
                return this.m_is_active;
        }
        
        public set_notes(notes: string): void
        {
                this.m_notes = notes;
        }
        
        public get_notes(): string
        {
                return this.m_notes;
        }
        
        public get_start_date(): Date
        {
                return new Date(this.m_start_time);
        }
        
        public get_end_date(): Date
        {
                return new Date(this.m_end_time);
        }
}

export function medical_session_copy(pod): MedicalSession
{
        var obj = new MedicalSession(null);
        obj.m_session_id = pod.m_session_id;
        obj.m_is_active = pod.m_is_active;
        obj.m_notes = pod.m_notes;
        obj.m_start_time = pod.m_start_time;
        obj.m_end_time = pod.m_end_time;
        return obj;
}
