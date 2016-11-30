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

export function BloodPressureDisplay() 
{
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;

        this.__charting_area = null;
        this.__start_date = null;
        this.__end_date = null;
        this.__sample_count = null;
        this.__filtering = "plain";
        this.__file = null;

        this.__local_bptable = null;
}

BloodPressureDisplay.prototype.set_access_info = function(identity, browsing_user, session)
{
        this.__identity = identity
        this.__browsing_user = browsing_user;
        this.__session = session;
}

BloodPressureDisplay.prototype.__get_file_from_file_select = function(holder)
{
        var files = holder.prop("files");
        if (files == null || files.length == 0)
                return null;
        else
                return files[0];
}

// Holders
BloodPressureDisplay.prototype.set_file_select_holder = function(holder, disconnector, filepath_holder)
{
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

BloodPressureDisplay.prototype.set_date_holder = function(start, end)
{
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

BloodPressureDisplay.prototype.set_charting_area = function(holder)
{
        this.__charting_area = holder;
}

BloodPressureDisplay.prototype.set_filter_holder = function(holder)
{
        var clazz = this;

        holder.on("change", function(e) {
                clazz.__filtering = e.target.value;
                clazz.update();
        });
}

BloodPressureDisplay.prototype.set_sample_count_holder = function(holder)
{
        var clazz = this;

        holder.on("change", function(e) {
                clazz.__sample_count = e.target.value == "" ? null : parseInt(e.target.value);
                clazz.update();
        });
}

// Data.
BloodPressureDisplay.prototype.get_processed_table = function(start_date, end_date, num_samples, filter)
{
        if (this.__local_bptable == null)
                return null;
        var bptable = this.__local_bptable;

        bptable = bptable.sort_data(false);

        // merge the data from the same day.
        bptable = bptable.merge_adjacent_data(
                {
                        name: filter,
                        scalar: function(v) { return (v.systolic + v.diastolic)/2; },
                        add: function(r, s) { return {systolic: r.systolic + s.systolic,
                                                      diastolic: r.diastolic + s.diastolic}; },
                        scale: function(k, v) { return {systolic: k*v.systolic,
                                                        diastolic: k*v.diastolic}; },
                },
                function (a, b) {
                        return a.getYear() == b.getYear() &&
                               a.getMonth() == b.getMonth() &&
                               a.getDate() == b.getDate();
                }
        );
        bptable = bptable.sample(start_date, end_date, num_samples);
        return bptable;
}

BloodPressureDisplay.prototype.generate_bp_renderable = function(bptable, target)
{
        var x = ["x"];
        var y = ["systolic blood pressure"];
        var z = ["diastolic blood pressure"];
        var pairs = bptable.get_pairs();
        for (var i = 0; i < pairs.length; i ++) {
                x[i + 1] = pairs[i].date;
                y[i + 1] = pairs[i].value.systolic.toFixed(1);
                z[i + 1] = pairs[i].value.diastolic.toFixed(1);
        }

        return {
                bindto: target,
                data: {
                        x: "x",
                        columns: [x, y, z]
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

BloodPressureDisplay.prototype.set_local_data_from_file_stream = function(file, f_On_Complete)
{
        var fr = new FileReader();
        var clazz = this;
        this.clear_local_data();

        fr.onload = function (e) {
                var parts = file.name.split(".");
                var suffix = parts[parts.length - 1];
                var stream = e.target.result;

                var bptable = new ValueTable();
                bptable.construct_from_stream(suffix, stream);
                clazz.__local_bptable = bptable;

                if(f_On_Complete != null)
                        f_On_Complete(clazz);
        }
        fr.readAsText(file);
}

BloodPressureDisplay.prototype.set_local_data_from_remote_server = function(start_date, end_date, num_samples, f_On_Complete)
{
        this.clear_local_data();

        var params = {
                identity: this.__identity,
                session_id: this.__session.get_session_id(),
                start_date: start_date,
                end_date: end_date,
                num_samples: null,
        };
        var clazz = this;
        Meteor.call("get_measure_bp_table", params, function(error, result) {
                if (result.error != "") {
                        console.log("failed to obtain bptable from patient: " + JSON.stringify(params));
                } else {
                        clazz.__local_bptable = ValueTable_create_from_POD(result.bptable);
                        if (f_On_Complete != null)
                                f_On_Complete(clazz);
                }
        });
}

BloodPressureDisplay.prototype.clear_local_data = function()
{
        this.__local_bptable = null;
}

BloodPressureDisplay.prototype.render_local_data = function(start_date, end_date, filter, num_samples, target)
{
        if (this.__local_bptable) {
                var bptable = this.get_processed_table(start_date, end_date, num_samples, filter);
                c3.generate(this.generate_bp_renderable(bptable, target));
        }
}

BloodPressureDisplay.prototype.update = function()
{
        var clazz = this;
        if (this.__file != null) {
                this.set_local_data_from_file_stream(this.__file, function(obj) {
                        clazz.render_local_data(clazz.__start_date, clazz.__end_date,
                                                clazz.__filtering, clazz.__sample_count,
                                                clazz.__charting_area);
                });
        } else {
                this.set_local_data_from_remote_server(this.__start_date, this.__end_date,
                                                       this.__sample_count, function(obj) {
                        clazz.render_local_data(clazz.__start_date, clazz.__end_date,
                                                clazz.__filtering, clazz.__sample_count,
                                                clazz.__charting_area);
                });
        }
}

BloodPressureDisplay.prototype.upload_to_remote_server = function()
{
        if (this.__local_bptable == null) return false;

        var params = {
                identity: this.__identity,
                session_id: this.__session.get_session_id(),
                bptable: this.__local_bptable,
        };
        Meteor.call("update_measure_bp_from_table", params, function(error, result) {
                if (result.error != "") {
                        alert(result.error);
                        console.log("failed to upload bp table: " + JSON.stringify(params));
                } else {
                        console.log("remote blood pressure data has been updated");
                }
        });
        return true;
}

BloodPressureDisplay.prototype.save_local_to_file_stream = function(file)
{
}

export var G_BPDisplay = new BloodPressureDisplay();

Template.tmplbpbrowser.onRendered(function() {
        console.log("bp browser rendered");

        G_BPDisplay.set_charting_area(this.find("#charting-area"));
        G_BPDisplay.set_file_select_holder($("#ipt-file-select"), $("#lb-disconnect"), $("#div-filepath"));
        G_BPDisplay.set_date_holder($("#ipt-start-date"), $("#ipt-end-date"));
        G_BPDisplay.set_filter_holder($("#sel-filter-method"));
        G_BPDisplay.set_sample_count_holder($("#ipt-num-samples"));
});
