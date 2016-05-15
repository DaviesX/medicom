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
import {Meteor} from 'meteor/meteor';
import {MeasureBP, MeasureBP_Create_From_POD} from "./measurebp.js";
import {MeasureSymptoms} from "./measuresymptoms.js";
import {MeasureFitbit} from "./measurefitbit.js";
import {MeasurePillBottleCap} from "./measurepillbottlecap.js";

export var c_Measure_Type_BP = "MeasureBP";
export var c_Measure_Type_Symptoms = "MeasureSymptoms";
export var c_Measure_Type_Fitbit = "MeasureFitbit";
export var c_Measure_Type_PillBottleCap = "MeasurePillBottleCap";

export function Measure(type) {
        this.__measure_id = "-1";
        this.__session_id = -1;
        this.__type = type;
        this.__date = new Date().getTime();
        
        this.set_session_id = function(session_id) { this.__session_id = session_id; }
        this.set_measure_id = function(measure_id) { this.__measure_id = measure_id; }
        this.get_session_id = function() { return this.__session_id; }
        this.set_date = function(date) { this.__date = date.getTime(); }
        this.get_date = function() {
                var date = new Date();
                date.setTime(this.__date);
                return date;
        }
        this.get_internal_date = function() { return this.__date; }
}

export function Measure_Parent_Create_From_POD(pod) {
        var obj = new Measure("", -1);
        obj.__measure_id = pod.__measure_id;
        obj.__session_id = pod.__session_id;
        obj.__type = pod.__type;
        obj.__date = pod.__date;
        return obj;
}

export function Measure_Create_From_POD(pod) {
        switch (pod.__parent.__type) {
        case c_Measure_Type_BP:
                return MeasureBP_Create_From_POD(pod);
        default:
                throw "Unknown measure type";
        }
}
