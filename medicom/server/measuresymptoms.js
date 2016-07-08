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
import {Measure, c_Measure_Type_Symptoms, Measure_Parent_Create_From_POD} from "./measure.js";


export function MeasureSymptoms() {
        this.__parent = new Measure(c_Measure_Type_Symptoms);
        this.__patients_feel;
	this.__description;

        this.set_patients_feel = function(feel) { this.__patients_feel = feel; }
        this.get_patients_feel = function() { return this.__patients_feel; }
        this.set_description = function(description) { this.__description = description; }
        this.get_description = function() { return this.__description; }
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
}

export function MeasureSymptoms_Create_From_POD(pod) {
        var obj = new MeasureSymptoms();
        obj.__parent = Measure_Parent_Create_From_POD(pod.__parent);
        obj.__patients_feel = pod.__patients_feel;
        obj.__description = pod.__description;
        return obj;
}
