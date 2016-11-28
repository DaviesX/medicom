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

import {IRowValue, RowValueObject} from "./irowvalue";

export class SleepQuality implements IRowValue
{
        public mins_asleep:             number;
        public mins_awake:              number;
        public number_awakenings:       number;
        public time_in_bed:             number;

        constructor(mins_asleep: number, mins_awake: number, number_awakenings: number, time_in_bed: number)
        {
                this.mins_asleep = mins_asleep;
                this.mins_awake = mins_awake;
                this.number_awakenings = number_awakenings;
                this.time_in_bed = time_in_bed;
        }

        // @override
        public object(): RowValueObject
        {
                return RowValueObject.RowValueSleepQuality;
        }

        // @override
        public add(_rhs: IRowValue): IRowValue
        {
                var rhs: SleepQuality = <SleepQuality> _rhs;
                return new SleepQuality(this.mins_asleep + rhs.mins_asleep,
                                        this.mins_awake + rhs.mins_awake,
                                        this.number_awakenings + rhs.number_awakenings,
                                        this.time_in_bed + rhs.time_in_bed);
        }

        // @override
        public scale(k: number): IRowValue
        {
                return new SleepQuality(k*this.mins_asleep,
                                        k*this.mins_awake,
                                        k*this.number_awakenings,
                                        k*this.time_in_bed);
        }

        // @override
        public lt(_rhs: IRowValue): boolean
        {
                var rhs: SleepQuality = <SleepQuality> _rhs;
                return this.mins_asleep/this.time_in_bed < rhs.mins_asleep/rhs.mins_asleep;
        }

        // @override
        public gt(_rhs: IRowValue): boolean
        {
                var rhs: SleepQuality = <SleepQuality> _rhs;
                return this.mins_asleep/this.time_in_bed > rhs.mins_asleep/rhs.mins_asleep;
        }

        // @override
        public eq(_rhs: IRowValue): boolean
        {
                var rhs: SleepQuality = <SleepQuality> _rhs;
                return this.mins_asleep == rhs.mins_asleep &&
                       this.mins_awake == rhs.mins_awake &&
                       this.number_awakenings == rhs.number_awakenings &&
                       this.time_in_bed == rhs.time_in_bed;
        }
        
        // @override
        public to_string(): string
        {
                return "SleepQuality = [" + this.mins_asleep + "," 
                                          + this.mins_awake + ","
                                          + this.number_awakenings + ","
                                          + this.time_in_bed + "]";
        }
};
