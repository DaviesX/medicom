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
import {Meteor} from "meteor/meteor";
import {Measure, Measure_Parent_Create_From_POD, c_Measure_Type_BP} from "./measure.js";

export function MeasureBP() {
        this.__parent = new Measure(c_Measure_Type_BP);
        this.__systolic = 0;
        this.__diastolic = 0;
        
        this.set_bp_value = function(value) { 
                this.__systolic = value.systolic; 
                this.__diastolic = value.diastolic; 
        }
        
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
        this.get_bp_value = function() { return {systolic: this.__systolic, diastolic: this.__diastolic}; }
}

export function MeasureBP_Create_From_POD(pod) {
        var obj = new MeasureBP();
        obj.__parent = Measure_Parent_Create_From_POD(pod.__parent);
        obj.__date = pod.__date;
        obj.__systolic = pod.__systolic;
        obj.__diastolic = pod.__diastolic;
        return obj;
}
