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

import {IRowValue, RowValueObject} from "./irowvalue.ts";

export class BloodPressure implements IRowValue
{
        public sys:     number;
        public dia:     number;
        public bpm:     number;

        constructor(sys: number, dia: number, bpm: number)
        {
                this.sys = sys;
                this.dia = dia;
                this.bpm = bpm;
        }

        // @override
        public object(): RowValueObject
        {
                return RowValueObject.RowValueBloodPressure;
        }

        // @override
        public add(_rhs: IRowValue): IRowValue
        {
                var rhs: BloodPressure = <BloodPressure> _rhs;
                return new BloodPressure(this.sys + rhs.sys,
                                         this.dia + rhs.dia,
                                         this.bpm + rhs.bpm);
        }

        // @override
        public scale(k: number): IRowValue
        {
                return new BloodPressure(k*this.sys,
                                         k*this.dia,
                                         k*this.bpm);
        }

        // @override
        public lt(_rhs: IRowValue): boolean
        {
                var rhs: BloodPressure = <BloodPressure> _rhs;
                return this.sys < rhs.sys;
        }

        // @override
        public gt(_rhs: IRowValue): boolean
        {
                var rhs: BloodPressure = <BloodPressure> _rhs;
                return this.sys > rhs.sys;
        }

        // @override
        public eq(_rhs: IRowValue): boolean
        {
                var rhs: BloodPressure = <BloodPressure> _rhs;
                return this.sys == rhs.sys &&
                       this.dia == rhs.dia &&
                       this.bpm == rhs.bpm;
        }

        // @override
        public to_string(): string
        {
                return "BloodPressure = [" + this.sys + ", " + this.dia + ", " + this.bpm + "]";
        }
}
