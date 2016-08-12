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
import {Measure_Create_From_POD} from "./measure.js"


export function MeasureModel(mongodb)
{
        this.__mongodb = mongodb;
        this.c_Measure_Coll_Name = "MeasurementCollection";
        
        this.__measures = new Mongo.Collection(this.c_Measure_Coll_Name);
}

MeasureModel.prototype.__retain_measure = function(session_id, measure)
{
        var result = this.__measures.find({"__parent.__session_id": session_id,
                                           "__parent.__date": measure.__parent.get_internal_date()});
        return result.count() > 0 ? Measure_Create_From_POD(result.fetch()[0]) : null;
}

MeasureModel.prototype.update_measure = function(session_id, measure)
{
        var old_measure = this.__retain_measure(session_id, measure);
        if (old_measure != null) {
                measure.__parent.set_session_id(old_measure.__parent.get_session_id());
                measure.__parent.set_measure_id(old_measure.__parent.get_measure_id());
                this.__measures.update({"__parent.__session_id": session_id,
                                        "__parent.__date": measure.__parent.get_internal_date()}, measure);
        } else {
                measure.__parent.set_session_id(session_id);
                measure.__parent.set_measure_id(this.__mongodb.get_string_uuid());
                this.__measures.insert(measure);
        }
        return measure;
}

MeasureModel.prototype.__generate_result = function(result)
{
        if (result.count() > 0) {
                return Measure_Create_From_POD(result.fetch()[0]);
        } else {
                return null;
        }
}

MeasureModel.prototype.__generate_results = function(result)
{
        if (result.count() > 0) {
                var measures = [];
                var blob = result.fetch();
                for (var i = 0; i < result.count(); i ++) {
                        measures[i] = Measure_Create_From_POD(blob[i]);
                }
                return measures;
        } else {
                return null;
        }
}

MeasureModel.prototype.get_measure_by_id = function(measure_id)
{
        return this.__generate_result(
               this.__measures.find({"__parent.__measure_id" : measure_id}));
}

MeasureModel.prototype.get_measures_by_session_and_type = function(session_id, type, order)
{
        order = order == null ? -1 : order;
        return this.__generate_results(
               this.__measures.find({"__parent.__session_id": session_id, 
                                     "__parent.__type": type},
                                     {sort: {"__parent.__date": -1}}));
}

MeasureModel.prototype.get_measures_by_date_session_and_type = function(start_date, end_date, session_id, type, order)
{
        order = order == null ? -1 : order;
        start_date = start_date.getTime();
        end_date = end_date.getTime();
        return this.__generate_results(
               this.__measures.find({"__parent.__session_id": session_id, 
                                     "__parent.__type": type,
                                     "__parent.__date": {$gte: start_date},
                                     "__parent.__date": {$lte: end_date}},
                                     {sort: {"__parent.__date": order}}));
}

MeasureModel.prototype.reset = function()
{
        this.__measures.remove({});
}
