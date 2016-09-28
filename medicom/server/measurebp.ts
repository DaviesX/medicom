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

import {BloodPressure} from "../api/bloodpressure.ts";
import {Measure, MeasureObject} from "./measure.ts";

export class MeasureBP extends Measure
{
        private value:          BloodPressure;
        
        constructor(date: Date, value: BloodPressure)
        {
                super(MeasureObject.BloodPressure, date);
                this.value = value;
        }

        public set_bp_value(value: BloodPressure): void
        { 
                this.value = value;
        }

        public get_bp_value(): BloodPressure
        { 
                return this.value;
        }

        public static recover(pod: any): MeasureBP
        {
                var obj = new MeasureBP(null, null);
                obj.value = pod.value;
                return obj;
        }
};

