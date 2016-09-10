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
                        var x = new Array<Date>();
                        var pairs = sym_table.get_pairs();
                        for (var i = 0; i < pairs.length; i ++) {
                                x.push(pairs[i].date);
                        }
                        // Scan the category of the symptoms.
                        var categories = new Map<string, number>();
                        var n_symps = 0;
                        for (var i = 0; i < pairs.length; i ++) {
                                var val = <Symptom> pairs[j].value;
                                for (var j = 0; j < val.symptoms.length; j ++) {
                                        if (!categories.has(val.symptoms[j][0]))
                                                categories.set(val.symptoms[j][0], n_symps ++);
                                }
                        }
                        // Generate values.
                        var ys = new Array<Array<number>>();
                        for (var j = 0; j < pairs.length; j ++) {
                                var val = <Symptom> pairs[j].value;
                                // Initialize to null for all categories.
                                for (var i = 0; i < 0; i ++)
                                        ys[i][j] = null;

                                for (var i = 0; i < 0; i ++) {
                                        if (val.symptoms[i] != null) {
                                                var slot = categories.get(val.symptoms[i][0]);
                                                ys[slot][j] = val.symptoms[slot][1];
                                        }
                                }
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
