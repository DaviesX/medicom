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

import {Mongo} from "meteor/mongo";
import {MongoUtil} from "../api/mongoutil";
import {Measure, MeasureObject} from "./measure";
import {measure_copy} from "./measurefactory";


export class MeasureModel
{
        private util:           MongoUtil;
        private measures:       Mongo.Collection<Measure>;

        constructor(util: MongoUtil)
        {
                this.util = util;
                this.measures = new Mongo.Collection<Measure>("Measures");
        }

        private retain_measure(session_id: number, measure: Measure): Measure
        {
                var result = this.measures.findOne({measure: session_id,
                                                    date: measure.get_internal_date(),
                                                    object: measure.get_type()});
                return result != null ? measure_copy(result) : null;
        }

        public update_measure(session_id: number, measure: Measure): Measure
        {
                var old_measure = this.retain_measure(session_id, measure);
                if (old_measure != null) {
                        measure.set_session_id(old_measure.get_session_id());
                        measure.set_measure_id(old_measure.get_measure_id());
                        this.measures.update({session_id: measure.get_session_id(),
                                              date: measure.get_internal_date(),
                                              object: measure.get_type()}, measure);
                } else {
                        measure.set_session_id(session_id);
                        measure.set_measure_id(this.util.get_string_uuid());
                        this.measures.insert(measure);
                }
                return measure;
        }

        private generate_results(result: Mongo.Cursor<Measure>): Array<Measure>
        {
                if (result.count() > 0) {
                        var measures = new Array<Measure>();
                        var blob = result.fetch();
                        for (var i = 0; i < result.count(); i ++)
                                measures[i] = measure_copy(blob[i]);
                        return measures;
                } else
                        return null;
        }

        public get_measure_by_id(measure_id: string): Measure
        {
                var result = this.measures.findOne({measure_id: measure_id});
                return result != null ? measure_copy(result) : null;
        }

        public get_measures_by_session_and_type(session_id: number, object: MeasureObject, order: number): Array<Measure>
        {
                order = order == null ? -1 : order;
                return this.generate_results(
                       this.measures.find({session_id: session_id, 
                                           object: object},
                                           {sort: {date: order}}));
        }

        public get_measures_by_date_session_and_type(start_date: Date, end_date: Date, 
                                                     session_id: number, object: MeasureObject, order: number): Array<Measure>
        {
                order = order == null ? -1 : order;
                var start_time = start_date.getTime();
                var end_time = end_date.getTime();
                return this.generate_results(
                       this.measures.find({session_id: session_id, 
                                           object: object,
                                           date: {$gte: start_time, $lte: end_time}},
                                          {sort: {date: order}}));
        }

        public reset(): number
        {
                return this.measures.remove({});
        }
};

