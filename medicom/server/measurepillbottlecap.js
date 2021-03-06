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
import {Measure, c_Measure_Type_PillBottleCap, Measure_Parent_Create_From_POD} from "./measure.js";


export function MeasurePillBottleCap() {
        this.__parent = new Measure(c_Measure_Type_PillBottleCap);
        this.__action = "";
        
        this.set_action = function(action) { this.__action = action; }
        this.get_measure_id = function() { return this.__parent.get_measure_id(); }
        this.get_action = function() { return this.__action; }
}

export function MeasurePillBottleCap_Create_From_POD(pod) {
        var obj = new MeasurePillBottleCap();
        obj.__parent = Measure_Parent_Create_From_POD(pod.__parent);
        obj.__action = pod.__action;
        return obj;
}
