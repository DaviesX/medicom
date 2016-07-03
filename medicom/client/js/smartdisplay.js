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
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";
import {G_BPDisplay} from "./bpdisplay.js";
import {G_PBCDisplay} from "./pbcdisplay.js";

// Nasty hacks to allow c3 chart to read the data.
var g_does_amount = [];
var g_expected_amount = null;


export function SmartDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__start_date = null;
        this.__end_date = null;
        this.__filter = "plain";
        this.__expected_dose = 2;
        this.__options = {
                "use_bp": true,
                "use_pbc": true,
        };
        
        this.__charting_area = null;
        
        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }
        
        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }
        
        this.set_holders = function(start_date, end_date, filter, expected_dose) {
                var clazz = this;
                
                start_date.on("change", function(e) {
                        clazz.__start_date = new Date(e.target.value);
                        clazz.update();
                });
                end_date.on("change", function(e) {
                        clazz.__end_date = new Date(e.target.value);
                        clazz.update();
                });
                filter.on("change", function(e) {
                        clazz.__filter = e.target.value;
                        clazz.update();
                });
                expected_dose.val(clazz.__expected_dose);
                expected_dose.on("change", function(e) {
                        clazz.__expected_dose = parseInt(e.target.value);
                        clazz.update();
                });
        }
        
        this.prepare_local_data = function(start_date, end_date, filter, options, f_On_Display_Complete) {
                for (var prop in options) {
                        if (options[prop] == true) {
                                switch (prop) {
                                case "use_bp":
                                        G_BPDisplay.set_local_data_from_remote_server(
                                                        start_date, end_date, null, f_On_Display_Complete);
                                        break;
                                case "use_pbc":
                                        G_PBCDisplay.set_local_data_from_remote_server(
                                                        start_date, end_date, f_On_Display_Complete);
                                        break;
                                }
                        }
                }
        }

        this.__compile_data = function(start_date, end_date, filter, options) {
                var merged_result = null;
                
                for (var prop in options) {
                        if (options[prop] == true) {
                                var curr_table = null;
                                
                                switch (prop) {
                                case "use_bp":
                                        curr_table = G_BPDisplay.get_processed_table(start_date, 
                                                                                     end_date, 
                                                                                     null, 
                                                                                     filter);
                                        break;
                                case "use_pbc":
                                        curr_table = G_PBCDisplay.get_processed_table(start_date, end_date);
                                        break;
                                }
                                if (curr_table == null) {
                                        // Logical error: none of the display should ever return a null value table.
                                        console.log(prop + " failed");
                                        return null;
                                }
                                if (merged_result == null)
                                        merged_result = curr_table;
                                else
                                        merged_result = merged_result.intersect_with(
                                                                curr_table, 
                                                                function (a, b) {
                                                                        return a.getYear() === b.getYear() &&
                                                                               a.getMonth() === b.getMonth() &&
                                                                               a.getDate() === b.getDate();
                                                                }, false);
                        }
                }
                return merged_result;
        }
        
        this.generate_smart_renderable = function(merged, options, expected_dose, charting_area) {
                if (merged == null) {
                        // Empty chart.
                        console.log("Returned empty chart");
                        return {
                                bindto: charting_area,
                                data: {
                                        x: "x",
                                        columns: [["x"], ["Nothing to display"]]
                                },
                                axis: {
                                        x: {
                                                type: "timeseries",
                                                tick: {
                                                        format: "%Y-%m-%d"
                                                }
                                        }
                                }
                        };
                } else {
                        // Generate a chart that represents the merged table.
                        var x = ["x"];
                        var y = ["pill bottle cap"];
                        var z = ["systolic blood pressure"];
                        var w = ["diastolic blood pressure"];
                        
                        var columns = [x];
                        var pairs = merged.get_pairs();
                        var max_height = 1;
                        // Fill in x.
                        for (var i = 0; i < pairs.length; i ++)
                                x[i + 1] = pairs[i].date;
                        // Fill in blood pressures.
                        if (options.use_bp === true) {
                                for (var i = 0; i < pairs.length; i ++) {
                                        z[i + 1] = pairs[i].value.systolic.toFixed(1);
                                        w[i + 1] = pairs[i].value.diastolic.toFixed(1);
                                        max_height = Math.max(max_height, z[i + 1]);
                                        max_height = Math.max(max_height, w[i + 1]);
                                }
                                columns.push(z);
                                columns.push(w);
                        }
                        // Fill in pill bottle cap records.
                        if (options.use_pbc === true) {
                                for (var i = 0; i < pairs.length; i ++) {
                                        x[i + 1] = pairs[i].date;
                                        y[i + 1] = max_height;
                                        g_does_amount[i] = pairs[i].num_insts;
                                }
                                columns.push(y);
                                g_expected_amount = expected_dose;
                        }
                        
                        return {
                                bindto: charting_area,
                                data: {
                                        x: "x",
                                        columns: columns,
                                        types: {
                                                "pill bottle cap": "bar",
                                                "systolic blood pressure": "line",
                                                "diastolic blood pressure": "line",
                                        },
                                        color: function(color, d) {
                                                if (d.id === "pill bottle cap") {
                                                        var level = Math.min(Math.max(
                                                                114 + (g_does_amount[d.index] - g_expected_amount)*50, 0), 360);
                                                        return d3.hsl(level, 0.5, 0.5);
                                                } else if (d.id === "systolic blood pressure") {
                                                        return d3.rgb(255, 0, 0);
                                                } else if (d.id === "diastolic blood pressure") {
                                                        return d3.rgb(0, 0, 255);
                                                } else {
                                                        return d3.rgb(0, 0, 0);
                                                }
                                        },
                                },
                                bar: {
                                        width: {
                                                ratio: 1.0
                                        }
                                },
                                axis: {
                                        x: {
                                                type: "timeseries",
                                                tick: {
                                                        format: "%Y-%m-%d"
                                                }
                                        },
                                        y: {
                                                max: max_height,
                                                min: 0,
                                                padding: {top: 0, bottom: 0}
                                        }
                                }
                        };
                }
        }
        
        this.update = function() {
                var clazz = this;
                
                this.prepare_local_data(this.__start_date, this.__end_date, this.__filtering, this.__options,
                        function(obj) {
                                var merged_result = clazz.__compile_data(clazz.__start_date, 
                                                                         clazz.__end_date, 
                                                                         clazz.__filter, 
                                                                         clazz.__options);
                                c3.generate(clazz.generate_smart_renderable(merged_result, 
                                                                            clazz.__options, 
                                                                            clazz.__expected_dose, 
                                                                            clazz.__charting_area));
                        });
        }
}

export var G_SmartDisplay = new SmartDisplay();

Template.tmplsmartbrowser.onRendered(function() {
        console.log("smart browser rendered");
        G_SmartDisplay.set_charting_area(this.find("#charting-area"));
        G_SmartDisplay.set_holders($("#ipt-start-date"), 
                                   $("#ipt-end-date"), 
                                   $("#sel-filter-method"), 
                                   $("#ipt-expected-doses"));
        G_SmartDisplay.update();
});
