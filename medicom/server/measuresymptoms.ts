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

import {Symptom} from "../api/symptom.ts";
import {Measure, MeasureObject} from "./measure.ts";


export class MeasureSymptoms extends Measure
{
        private value:  Symptom;

        constructor(date: Date, value: Symptom)
        {
                super(MeasureObject.Symptoms, date);

                this.value = value != null ?
                             value = value : 
                             new Symptom(new Array<[string, number]>(),
                                         new Array<[string, boolean]>(),
                                         "");
        }

        public add_symptom(symp_name: string, scale: number): void
        {
                this.value.symptoms.push([symp_name, scale]);
        }
        
        public add_lifestyle(lifestyle: string, ans: boolean): void
        {
                this.value.lifestyles.push([lifestyle, ans]);
        }

        public set_description(description: string): void
        {
                this.value.free_text = description;
        }

        public set_symptoms(value: Symptom): void
        {
                this.value = value;
        }

        public get_symptoms(): Symptom
        {
                return this.value;
        }

        public static recover(pod: any): MeasureSymptoms
        {
                var obj = new MeasureSymptoms(null, null);
                obj.value = pod.value;
                return obj;
        }
};

