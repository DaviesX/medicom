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
import {G_SymptomsDisplay} from "./symptomsdisplay.js";
import {G_FitbitDisplay} from "./fitbitdisplay.js";

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
                "use_sym_feeling": false,
                "use_fb_qsleep": false,
        };

        this.__active_symps = null;

        this.__charting_area = null;


}

SmartDisplay.prototype.set_charting_area = function(holder)
{
        this.__charting_area = holder;
}

SmartDisplay.prototype.set_access_info = function(identity, browsing_user, session)
{
        this.__identity = identity
        this.__browsing_user = browsing_user;
        this.__session = session;
}

SmartDisplay.prototype.set_holders = function(start_date, end_date, filter, expected_dose,
                                    use_bp, use_pbc, use_fb_qsleep)
{
        var clazz = this;

        start_date.datepicker().on("change", function(e) {
                clazz.__start_date = new Date(e.target.value);
                clazz.update();
        });
        end_date.datepicker().on("change", function(e) {
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
        use_bp.prop("checked", this.__options["use_bp"]);
        use_pbc.prop("checked", this.__options["use_pbc"]);
        use_fb_qsleep.prop("checked", this.__options["use_fb_qsleep"]);
        use_bp.on("change", function(e) {
                clazz.__options["use_bp"] = use_bp.is(':checked');
                clazz.update();
        });
        use_pbc.on("change", function(e) {
                clazz.__options["use_pbc"] = use_pbc.is(':checked');
                clazz.update();
        });
        use_fb_qsleep.on("change", function(e) {
                clazz.__options["use_fb_qsleep"] = use_fb_qsleep.is(':checked');
                clazz.update();
        });

        $("#rb-corr-pbc").on("click", function(e) {
                clazz.update();
        });

        $("#rb-corr-temporal").on("click", function(e) {
                clazz.update();
        });
}

SmartDisplay.prototype.make_symptom_checkbox_ui = function(symp_name)
{
        symp_name = symp_name.replace(" ", "-");
        return '<input type="checkbox" id="' + symp_name + '"> ' + symp_name + '<br>';
}

SmartDisplay.prototype.prepare_local_data = function(start_date, end_date, filter, options, f_On_Display_Complete)
{
        const NUM_TASKS = 4;
        var n_complete = 0;

        G_BPDisplay.set_local_data_from_remote_server(start_date, end_date, null, function() {
                if (++ n_complete == NUM_TASKS)
                        f_On_Display_Complete();
        });
        G_PBCDisplay.set_local_data_from_remote_server(start_date, end_date, function () {
                if (++ n_complete == NUM_TASKS)
                        f_On_Display_Complete();
        });
        G_SymptomsDisplay.set_local_data_from_remote_server(start_date, end_date, function () {
                if (++ n_complete == NUM_TASKS)
                        f_On_Display_Complete();
        });
        G_FitbitDisplay.set_local_data_from_remote_server(start_date, end_date, null, function () {
                if (++ n_complete == NUM_TASKS)
                        f_On_Display_Complete();
        });


        f_On_Display_Complete();
}

SmartDisplay.prototype.__compile_data = function(start_date, end_date, filter, options)
{
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
                        case "use_sym_feeling":
                                curr_table = G_SymptomsDisplay.get_processed_table(start_date, end_date);
                                break;
                        case "use_fb_qsleep":
                                curr_table = G_FitbitDisplay.get_processed_table(start_date, end_date,
                                                null,
                                                filter);
                                break;
                        }
                        if (curr_table == null)
                                return null;
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

SmartDisplay.prototype.generate_smart_temporal = function(merged, options, expected_dose, charting_area)
{
        var clazz = this;

        // Generate a chart that represents the merged table.
        var x = ["x"];
        var y = ["pill bottle cap"];
        var z = ["systolic blood pressure"];
        var w = ["diastolic blood pressure"];
        var b = ["sleep quality"];
        var symptoms = [];

        var types = [];
        var colors = [];
        var columns = [x];
        var pairs = merged.get_pairs();
        var max_height = 1;
        // Fill in x.
        for (var i = 0; i < pairs.length; i ++)
                x[i + 1] = pairs[i].date;
        // Fill in blood pressures.
        if (options.use_bp === true) {
                types["systolic blood pressure"] = "line";
                types["diastolic blood pressure"] ="line";

                colors["systolic blood pressure"] = d3.rgb(255, 118, 50).toString();
                colors["diastolic blood pressure"] = d3.rgb(62, 65, 255).toString();

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
                types["pill bottle cap"] ="bar";
                colors["pill bottle cap"] = d3.rgb(0, 255, 0).toString();

                for (var i = 0; i < pairs.length; i ++) {
                        x[i + 1] = pairs[i].date;
                        y[i + 1] = max_height;
                        g_does_amount[i] = pairs[i].num_insts;
                }
                columns.push(y);
                g_expected_amount = expected_dose;
        }
        // Fill in symptoms 
        if (options.use_sym_feeling === true) {
                const scale = 50;
                var symp_map = G_SymptomsDisplay.get_symptoms(merged);
                var adjusted_map = new Map();
                var n = 0;
                symp_map.forEach(function(v, k, m) {
                        if (clazz.__active_symps.has(k)) {
                                adjusted_map.set(k, n ++);
                        }
                });

                // Set title.
                adjusted_map.forEach(function(v, k, m) {
                        symptoms.push([k]);
                        types[k] ="line";
                });

                for (var i = 0; i < pairs.length; i ++) {
                        adjusted_map.forEach(function(v, k, m) {
                                symptoms[v][i + 1] = null;
                        });

                        var symps = pairs[i].value.symp_pairs;
                        for (var l = 0; l < symps.length; l ++) {
                                var v = adjusted_map.get(symps[l].symp_name);
                                if (v == null)
                                        continue;
                                symptoms[v][i + 1] = Math.ceil(parseInt(symps[l].scale)/5*scale);
                        }
                }
                for (var i = 0; i < symptoms.length; i ++)
                        columns.push(symptoms[i]);
        }

        if (options.use_fb_qsleep === true) {
                types["sleep quality"] = "line";
                colors["sleep quality"] = d3.rgb(0, 40, 255).toString();

                const scale = 50;
                for (var i = 0; i < pairs.length; i ++) {
                        b[i + 1] = Math.ceil(pairs[i].value.mins_asleep/pairs[i].value.time_in_bed*scale);
                }
                columns.push(b);
        }

        return {
                bindto: charting_area,
                data: {
                        x: "x",
                        columns: columns,
                        types: types,
                        colors: colors,
                        color: function(color, d) {
                                if (d.id === "pill bottle cap") {
                                        var level = Math.min(Math.max(
                                                                114 + (g_does_amount[d.index] - g_expected_amount)*50, 0), 360);
                                        return d3.hsl(level, 0.4, 0.7);
                                } else {
                                        return color;
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

SmartDisplay.prototype.generate_smart_correlation = function(merged, axis, options, expected_dose, charting_area)
{
        return this.generate_empty(charting_area);
}

SmartDisplay.prototype.generate_empty = function(charting_area)
{
         return {
                 bindto: charting_area,
                 data:{
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
}

SmartDisplay.prototype.generate_smart_renderable = function(merged, options, expected_dose, charting_area)
{
        if (merged == null) {
                // Empty chart.
                console.log("Returned empty chart");
                return this.generate_empty(charting_area);
        } else {
                if ($("#rb-corr-temporal").is(":checked")) {
                        return this.generate_smart_temporal(merged, options, expected_dose, charting_area);
                } else if ($("#rb-corr-pbc").is(":checked")) {
                        return this.generate_smart_correlation(merged, "pbc", options, expected_dose, charting_area);
                }
        }
}

SmartDisplay.prototype.update = function()
{
        var clazz = this;
        
        // Adjust symptom UI accordingly.
        if (this.__active_symps == null) {
                this.__active_symps = new Map();

                G_SymptomsDisplay.set_local_data_from_remote_server(this.__start_date, this.__end_date, function () {
                        var symp_table = G_SymptomsDisplay.get_processed_table(clazz.__start_date, clazz.__end_date);
                        var symp_map = G_SymptomsDisplay.get_symptoms(symp_table);

                        $("#div-symptoms").empty();
                        symp_map.forEach(function(v, k, m) {
                                $("#div-symptoms").append(clazz.make_symptom_checkbox_ui(k));
                        });

                        symp_map.forEach(function(v, k, m) {
                                var id = "#" + k.replace(" ", "-");
                                $(id).on("change", {symp_name: k}, function(e) {
                                        if (e.target.checked)
                                                clazz.__active_symps.set(e.data.symp_name, true);
                                        else
                                                clazz.__active_symps.delete(e.data.symp_name);

                                        clazz.__options["use_sym_feeling"] = clazz.__active_symps.size != 0;
                                        clazz.update();
                                });
                        });
                });
        }

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

export var G_SmartDisplay = new SmartDisplay();

Template.tmplsmartbrowser.onRendered(function() {
        console.log("smart browser rendered");
        G_SmartDisplay.__active_symps = null;
        G_SmartDisplay.set_charting_area(this.find("#charting-area"));
        G_SmartDisplay.set_holders($("#ipt-start-date"),
                                   $("#ipt-end-date"),
                                   $("#sel-filter-method"),
                                   $("#ipt-expected-doses"),
                                   $("#cb-bp"),
                                   $("#cb-pbc"),
                                   $("#cb-sym-feeling"),
                                   $("#cb-fb-qsleep"));
        G_SmartDisplay.update();
});
