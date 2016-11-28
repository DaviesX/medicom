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
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable";

// Nasty hacks to allow c3 chart to read the data.
var g_does_amount = [];
var g_expected_amount = null;

export function PillBottleCapDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;

        this.__start_date = null;
        this.__end_date = null;
        this.__expected_dose = null;
        this.__file = null;
        this.__charting_area = null;

        this.__pbctable = new ValueTable();

        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }

        this.__get_file_from_file_select = function(holder) {
                var files = holder.prop("files");
                if (files == null || files.length == 0)
                        return null;
                else
                        return files[0];
        }

        // Holders
        this.set_file_select_holder = function(holder, disconnector, filepath_holder) {
                filepath_holder.html("No file is connected");

                var clazz = this;

                holder.on("change", function (event) {
                        var file = clazz.__get_file_from_file_select(holder);
                        if (file == null)
                                return;
                        filepath_holder.html(file.name);
                        clazz.__file = file;
                        clazz.update();
                });

                disconnector.on("click", function(event) {
                        filepath_holder.html("No file is connected");
                        holder.replaceWith(holder = holder.clone(true));
                        clazz.__file = null;
                        clazz.update();
                });
        }

        this.set_date_holder = function(start, end) {
                var clazz = this;

                start.datepicker().on("change", function (e) {
                        clazz.__start_date = new Date(e.target.value);
                        clazz.update();
                });
                end.datepicker().on("change", function(e) {
                        clazz.__end_date = new Date(e.target.value);
                        clazz.update();
                });
        }

        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }

        this.set_expected_dose_holder = function(holder) {
                this.__expected_dose = holder;
                var clazz = this;
                holder.on("change", function(e) {
                        clazz.update();
                });
        }

        // Data.
        this.get_processed_table = function(start_date, end_date) {
                if (this.__pbctable == null)
                        return null;

                var pbctable = this.__pbctable;
                pbctable = pbctable.sort_data(false);
                pbctable = pbctable.sample(start_date, end_date, null);
                return pbctable.merge_adjacent_data({name: "first"},
                        function (a, b) {
                                return a.getYear() == b.getYear() &&
                                       a.getMonth() == b.getMonth() &&
                                       a.getDate() == b.getDate();
                        }
                );
        }

        this.generate_pbc_renderable = function(pbctable, expected_dose, height, target) {
                console.log("pbc table");

                var x = ["x"];
                var y = ["pill bottle cap"];
                var pairs = pbctable.get_pairs();
                for (var i = 0; i < pairs.length; i ++) {
                        x[i + 1] = pairs[i].date;
                        y[i + 1] = height;
                        g_does_amount[i] = pairs[i].num_insts;
                }
                g_expected_amount = expected_dose;

                return {
                        bindto: target,
                        data: {
                                x: "x",
                                columns: [x, y],
                                type: "bar",
                                color: function(color, d) {
                                        if (d.id == "pill bottle cap") {
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
                                        max: height,
                                        min: 0,
                                        padding: {top: 0, bottom: 0}
                                }
                        }
                };
        }

        this.set_local_data_from_file_stream = function(file, f_On_Complete) {
                var fr = new FileReader();
                var clazz = this;
                this.clear_local_data();

                fr.onload = function (e) {
                        var parts = file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        clazz.__pbctable.construct_from_stream(suffix, stream);
                        if (f_On_Complete != null)
                                f_On_Complete(clazz);
                }
                fr.readAsText(file);
        }

        this.set_local_data_from_remote_server = function(start_date, end_date, f_On_Complete) {
                this.clear_local_data();

                var params = {
                        identity: this.__identity,
                        session_id: this.__session.get_session_id(),
                        start_date: start_date,
                        end_date: end_date,
                        num_samples: null,
                };
                var clazz = this;
                Meteor.call("get_measure_pbc_table", params, function(error, result) {
                        if (result.error != "") {
                                console.log("failed to obtain pbctable from patient: " + JSON.stringify(params));
                        } else {
                                clazz.__pbctable = ValueTable_create_from_POD(result.pbctable);
                                if (f_On_Complete != null)
                                        f_On_Complete(clazz);
                        }
                });
        }

        this.clear_local_data = function() {
                this.__pbctable = new ValueTable();
        }

        this.render_local_data = function(start_date, end_date, target) {
                c3.generate(this.generate_pbc_renderable(this.get_processed_table(start_date, end_date),
                                                         parseInt(this.__expected_dose.val()),
                                                         1.0,
                                                         target));
        }

        this.upload_to_remote_server = function() {
                if (this.__pbctable == null) return false;

                var params = {
                        identity: this.__identity,
                        session_id: this.__session.get_session_id(),
                        pbctable: this.__pbctable,
                        num_samples: null
                };
                Meteor.call("update_measure_pbc_from_table", params, function(error, result) {
                        if (result.error != "") {
                                alert(result.error);
                                console.log("failed to upload pbc table: " + JSON.stringify(params));
                        } else {
                                console.log("remote pill bottle cap data has been updated");
                        }
                });
                return true;
        }

        this.update = function() {
                var clazz = this;
                if (this.__file != null) {
                        this.set_local_data_from_file_stream(this.__file, function(obj) {
                                clazz.render_local_data(clazz.__start_date, clazz.__end_date,
                                                        clazz.__charting_area);
                        });
                } else {
                        this.set_local_data_from_remote_server(this.__start_date, this.__end_date,
                                                               function(obj) {
                                clazz.render_local_data(clazz.__start_date, clazz.__end_date,
                                                        clazz.__charting_area);
                        });
                }
        }
}

export var G_PBCDisplay = new PillBottleCapDisplay();

Template.tmplpbcbrowser.onRendered(function() {
        console.log("pbc browser rendered");
        G_PBCDisplay.set_charting_area(this.find("#charting-area"));
        G_PBCDisplay.set_file_select_holder($("#ipt-file-select"), $("#lb-disconnect"), $("#div-filepath"));
        G_PBCDisplay.set_date_holder($("#ipt-start-date"), $("#ipt-end-date"));
        G_PBCDisplay.set_expected_dose_holder($("#ipt-expected-doses"));
});
