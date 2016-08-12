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
import {Measure, 
        Measure_Parent_Create_From_POD,
        c_Measure_Type_Fitbit} from "./measure.js";


export function MeasureFitbit(measure_id)
{
        this.__parent = new Measure(c_Measure_Type_Fitbit);
        this.__mins_asleep = null;
        this.__mins_awake = null;
        this.__num_awakenings = null;
        this.__time_in_bed = null;
}

MeasureFitbit.prototype.set_sleep_info = function(value)
{
        this.__mins_asleep = value.__mins_asleep;
        this.__mins_awake = value.__mins_awake;
        this.__num_awakenings = value.__num_awakenings;
        this.__time_in_bed = value.__time_in_bed;
}

MeasureFitbit.prototype.get_measure_id = function() 
{ 
        return this.__parent.get_measure_id(); 
}

MeasureFitbit.prototype.get_mins_asleep = function()
{
        return this.__mins_asleep;
}

MeasureFitbit.prototype.get_mins_awake = function()
{
        return this.__mins_awake;
}

MeasureFitbit.prototype.get_num_awakenings = function()
{
        return this.__num_awakenings;
}

MeasureFitbit.prototype.get_time_in_bed = function()
{
        return this.__time_in_bed;
}

export function MeasureFitbit_create_from_POD(pod)
{
        var obj = new MeasureFitbit();
        obj.__parent = Measure_Parent_Create_From_POD(pod.__parent); 
        obj.__mins_asleep = pod.__mins_asleep;
        obj.__mins_awake = pod.__mins_awake;
        obj.__num_awakenings = pod.__num_awakenings;
        obj.__time_in_bed = pod.__time_in_bed;
        return obj;
}
