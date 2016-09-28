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

import {PillCapAction} from "../api/pillcapaction.ts";
import {Measure, MeasureObject} from "./measure.ts";


export class MeasurePBC extends Measure 
{
        private value:  PillCapAction; 

        constructor(date: Date, value: PillCapAction)
        {
                super(MeasureObject.PillBottleCap, date);
                this.value = value;
        }

        public set_action(value: PillCapAction): void
        {
                this.value = value; 
        }

        public get_action(): PillCapAction 
        { 
                return this.value;
        }

        public static recover(pod): MeasurePBC
        {
                var obj = new MeasurePBC(null, null);
                obj.value = pod.value;
                return obj;
        }
};

