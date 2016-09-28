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

export enum MeasureObject
{
        BloodPressure,
        Symptoms,
        Fitbit,
        PillBottleCap,
};

export class Measure
{
        private measure_id:     string = "-1";
        private session_id:     number = -1;
        private object:         MeasureObject;
        private date:           number;

        constructor(obj: MeasureObject, date: Date) 
        {
                this.object = obj;
                this.date = date != null ? date.getTime() : new Date().getTime();
        }

        public set_session_id(session_id: number): void
        {
                this.session_id = session_id;
        }

        public set_measure_id(measure_id: string): void
        {
                this.measure_id = measure_id;
        }

        public get_session_id(): number
        { 
                return this.session_id;
        }

        public get_measure_id(): string 
        { 
                return this.measure_id;
        }

        public get_type(): MeasureObject
        {
                return this.object;
        }

        public set_date(date: Date): void
        { 
                 this.date = date.getTime();
        }

        public get_date(): Date
        {
                var date = new Date();
                date.setTime(this.date);
                return date;
        }
        
        public get_internal_date(): number 
        { 
                return this.date;
        }

        public static recover(obj: Measure, pod: any): Measure
        {
                obj.measure_id = pod.measure_id;
                obj.session_id = pod.session_id;
                obj.object = pod.object;
                obj.date = pod.date;
                return obj;
        }
};
