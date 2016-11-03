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

/// <reference path="../tslib/lib.es6.d.ts" />

import {IRowValue, RowValueObject} from "./irowvalue.ts";


export class Symptom implements IRowValue
{
        public symptoms:        Map<string, number>;
        public lifestyles:      Map<string, boolean>;
        public free_text:       string;

        constructor(symptoms: Array<[string, number]>, 
                    lifestyles: Array<[string, boolean]>, 
                    free_text: string)
        {
                for (var i = 0; i < symptoms.length; i ++)
                        this.symptoms.set(symptoms[i][0], symptoms[i][1]);
                for (var i = 0; i < lifestyles.length; i ++)
                        this.lifestyles.set(lifestyles[i][0], lifestyles[i][1]);
                this.free_text = free_text;
        }

        // @override
        public object(): RowValueObject
        {
                return RowValueObject.RowValueSymptom;
        }

        // @override
        public add(_rhs: IRowValue): IRowValue
        {
                var rhs: Symptom = <Symptom> _rhs;

                var symptoms = new Array<[string, number]>();
                var lifestyles = new Array<[string, boolean]>();

                this.symptoms.forEach(function (v: number, key: string, map: Map<string, number>) {
                        var rv: number = rhs.symptoms.get(key);
                        if (rv != null)
                                symptoms.push([key, v + rv]);
                });

                this.lifestyles.forEach(function (v: boolean, key: string, map: Map<string, boolean>) {
                        var rv: boolean = rhs.lifestyles.get(key);
                        if (rv != null)
                                lifestyles.push([key, v || rv]);
                });
                return new Symptom(symptoms, lifestyles, this.free_text);
        }

        // @override
        public scale(k: number): IRowValue
        {
                var symptoms = new Array<[string, number]>();
                var lifestyles = new Array<[string, boolean]>();

                this.symptoms.forEach(function (v: number, key: string, map: Map<string, number>) {
                        symptoms.push([key, k*v]);
                });

                this.lifestyles.forEach(function (v: boolean, key: string, map: Map<string, boolean>) {
                        lifestyles.push([key, k == 0 ? false : v]);
                });

                return new Symptom(symptoms, lifestyles, this.free_text);
        }

        // @override
        public lt(rhs: IRowValue): boolean
        {
                return false;
        }

        // @override
        public gt(rhs: IRowValue): boolean
        {
                return false;
        }

        // @override
        public eq(_rhs: IRowValue): boolean
        {
                var rhs: Symptom = <Symptom> _rhs;
                var lhs: Symptom = this;

                var subset_of_rhs: boolean = true;
                var superset_of_rhs: boolean = true;

                lhs.symptoms.forEach(function (v: number, key: string, map: Map<string, number>) {
                        var lv: number = rhs.symptoms.get(key);
                        if (lv == null || lv != v)
                                subset_of_rhs = false;
                });
                rhs.symptoms.forEach(function (v: number, key: string, map: Map<string, number>) {
                        var lv: number = lhs.symptoms.get(key);
                        if (lv == null || lv != v)
                                superset_of_rhs = false;
                });

                lhs.lifestyles.forEach(function (v: boolean, key: string, map: Map<string, boolean>) {
                        var lv: boolean = rhs.lifestyles.get(key);
                        if (lv == null || lv != v)
                                subset_of_rhs = false;
                });
                rhs.lifestyles.forEach(function (v: boolean, key: string, map: Map<string, boolean>) {
                        var lv: boolean = lhs.lifestyles.get(key);
                        if (lv == null || lv != v)
                                superset_of_rhs = false;
                });

                return subset_of_rhs && superset_of_rhs;
        }

        // @override
        public to_string(): string
        {
                return "Symptom = [\n\t" + JSON.stringify(this.symptoms) + ",\n\t"
                                         + JSON.stringify(this.lifestyles) + ",\n\t"
                                         + this.free_text + "]";
        }
};
