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

import {IDataProcessor} from "./idataprocessor.ts";
import {IDataTransaction} from "../../api/idatatransaction.ts";
import {Identity} from "../../api/identity.ts";
import {AccountInfo} from "../../api/accountinfo.ts";
import {MedicalSession} from "../../api/medicalsession.ts";
import {ValueTable} from "../../api/valuetable.ts";
import {RowValueObject} from "../../api/irowvalue.ts";
import {Symptom} from "../../api/symptom.ts";

import {DataParams} from "./dataparams.ts";
import {DataBrowserUI} from "./databrowserui.ts";
import {C3ChartRenderer, TemperalChart} from "./chartrenderer.ts";


/*
 * <DataProcSymptom> Data processor implementation to handle Symptoms.
 */
export class DataProcSymptom extends IDataProcessor
{
        constructor(identity: Identity, user: AccountInfo, session: MedicalSession)
        {
                super(identity, user, session);
        }

        // @override
        public id(): string
        {
                return "data_proc_symptom";
        }

        // @overrdie
        public name(): string
        {
                return "Symptom Data";
        }

        // @override
        public upload_calls(data: Array<IDataTransaction>, params: DataParams): Array<[string, any]>
        {
                return new Array<[string, any]>();
        }

        // @override
        public download_calls(params: DataParams): Array<[string, any]>
        {
                var call_params = {
                        identity:       this.identity,
                        session_id:     this.session.get_session_id(),
                        start_date:     params.start_date,
                        end_date:       params.end_date,
                        num_items:      null,
                };
                return [["get_measure_symptom", call_params]];
        }

        // @overrdie
        public load(stream: string, suffix: string): Array<IDataTransaction>
        {
                return new Array<IDataTransaction>();
        }

        public generate_chart(data: ValueTable, params: DataParams): TemperalChart
        {
                var chart = new TemperalChart();
                if (data == null) {
                        chart.set_x(new Array<Date>());
                        chart.add_y("Nothing to Display", new Array<number>(), null);
                } else {
                        var sym_table = data;
                        var rows = sym_table.all_rows();

                        // Fill in x axis.
                        var x = new Array<Date>();
                        for (var i = 0; i < sym_table.num_rows(); i ++)
                                x.push(rows[i].get_date());

                        // Find the union of all symptoms.
                        var categories = new Map<string, number>();
                        var slot_alloc = 0;
                        for (var i = 0; i < sym_table.num_rows(); i ++) {
                                var val = <Symptom> rows[j].get_value(RowValueObject.RowValueSymptom);
                                val.symptoms.forEach(function (scale: number, sym_name: string, map: Map<string, number>) {
                                        if (!categories.has(sym_name))
                                                categories.set(sym_name, slot_alloc ++);
                                });
                        }

                        // Generate y values for all symptoms.
                        var ys = new Array<Array<number>>();
                        for (var j = 0; j < sym_table.num_rows(); j ++) {
                                var val = <Symptom> rows[j].get_value(RowValueObject.RowValueSymptom);

                                // Initialize all slots to null
                                // because not every row has value for all categories of symptom
                                // hence some of them don't get filled in the next step.
                                for (var i = 0; i < 0; i ++)
                                        ys[i][j] = null;

                                // Expand every row of symptom into y values.
                                val.symptoms.forEach(function (scale: number, sym_name: string, map: Map<string, number>) {
                                        var slot = categories.get(sym_name);
                                        ys[slot][j] = scale;
                                });
                        }

                        // Put in chart.
                        categories.forEach(function(slot: number, sym_name: string, map: Map<string, number>) {
                                chart.add_y(sym_name, ys[slot], null);
                        });
                }
                return chart;
        }

        // @override
        public render(data: Array<IDataTransaction>,
                      params: DataParams,
                      target: DataBrowserUI): boolean
        {
                var renderer = new C3ChartRenderer(target.chart());
                renderer.render(this.generate_chart(<ValueTable> data[0], params));
                return true;
        }
};
