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

export function FitbitDisplay()
{
        this.__charting_area = null;
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;

        this.__start_date = null;
        this.__end_date = null;
        this.__sample_count = null;
        this.__filtering = "plain";
        this.__file = null;

        this.__local_fbtable = null;
}

FitbitDisplay.prototype.set_access_info = function(identity, browsing_user, session)
{
        this.__identity = identity
        this.__browsing_user = browsing_user;
        this.__session = session;
}

FitbitDisplay.prototype.__get_file_from_file_select = function(holder)
{
        var files = holder.prop("files");
        return files == null || files.length == 0 ? null : files[0];
}

FitbitDisplay.prototype.set_holders = function(template)
{
        var clazz = this;

        this.__charting_area = template.find("#charting-area");

        var file_holder = $("#ipt-file-select");
        var filepath_holder = $("#div-filepath");
        var disconnector = $("#lb-disconnect");
        filepath_holder.html("No file is connected");
        file_holder.on("change", function (event) {
                var file = clazz.__get_file_from_file_select(file_holder);
                if (file == null)
                        return;
                filepath_holder.html(file.name);
                clazz.__file = file;
                clazz.update();
        });
        disconnector.on("click", function(event) {
                filepath_holder.html("No file is connected");
                file_holder.replaceWith(file_holder = file_holder.clone(true));
                clazz.__file = null;
                clazz.update();
        });

        var start_date_holder = $("#ipt-start-date");
        var end_date_holder = $("#ipt-end-date")

        start_date_holder.datepicker().on("change", function (e) {
                clazz.__start_date = new Date(e.target.value);
                clazz.update();
        });
        end_date_holder.datepicker().on("change", function(e) {
                clazz.__end_date = new Date(e.target.value);
                clazz.update();
        });

        var filter_holder = $("#sel-filter-method");
        filter_holder.on("change", function(e) {
                clazz.__filtering = e.target.value;
                clazz.update();
        });

        var sample_num_holder = $("#ipt-num-samples")
        sample_num_holder.on("change", function(e) {
                clazz.__sample_count = e.target.value == "" ? null : parseInt(e.target.value);
                clazz.update();
        });
}

// Data.
FitbitDisplay.prototype.get_processed_table = function(start_date, end_date, num_samples, filter)
{
        if (this.__local_fbtable == null)
                return null;
        var fbtable = this.__local_fbtable;

        fbtable = fbtable.sort_data(false);

        // merge the data from the same day.
        fbtable = fbtable.merge_adjacent_data(
                {
                        name: filter,
                        scalar: function(v) { return v.mins_asleep/v.time_in_bed; },
                        add: function(r, s) {
                                                var v;
                                                for (var prop in r)
                                                        v.prop = r.prop + s.prop;
                                                return v;
                                        },
                        scale: function(k, v) {
                                                var s;
                                                for (var prop in v)
                                                        s.prop = k*v.prop;
                                                return s;
                                        },
                },
                function (a, b) {
                        return a.getYear() == b.getYear() &&
                               a.getMonth() == b.getMonth() &&
                               a.getDate() == b.getDate();
                }
        );
        fbtable = fbtable.sample(start_date, end_date, num_samples);
        return fbtable;
}

FitbitDisplay.prototype.generate_bp_renderable = function(fbtable, target)
{
        var x = ["x"];
        var y = ["Minutes Aslept/Time in Bed"];
        var pairs = fbtable.get_pairs();
        for (var i = 0; i < pairs.length; i ++) {
                x[i + 1] = pairs[i].date;
                y[i + 1] = (pairs[i].value.mins_asleep/pairs[i].value.time_in_bed).toFixed(2);
        }
        console.log(y);

        return {
                bindto: target,
                data: {
                        x: "x",
                        columns: [x, y]
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

FitbitDisplay.prototype.set_local_data_from_file_stream = function(file, f_On_Complete)
{
        var fr = new FileReader();
        var clazz = this;
        this.clear_local_data();

        fr.onload = function (e) {
                var parts = file.name.split(".");
                var suffix = parts[parts.length - 1];
                var stream = e.target.result;

                var fbtable = new ValueTable();
                fbtable.construct_from_stream(suffix, stream);
                clazz.__local_fbtable = fbtable;

                if(f_On_Complete != null)
                        f_On_Complete(clazz);
        }
        fr.readAsText(file);
}

FitbitDisplay.prototype.set_local_data_from_remote_server = function(start_date, end_date, num_samples, f_On_Complete)
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
        Meteor.call("get_measure_fitbit_table", params, function(error, result) {
                if (result.error != "") {
                        console.log("failed to obtain fbtable from patient: " + JSON.stringify(params));
                } else {
                        clazz.__local_fbtable = ValueTable_create_from_POD(result.fbtable);
                        if (f_On_Complete != null)
                                f_On_Complete(clazz);
                }
        });
}

FitbitDisplay.prototype.clear_local_data = function()
{
        this.__local_fbtable = null;
}

FitbitDisplay.prototype.render_local_data = function(start_date, end_date, filter, num_samples, target)
{
        if (this.__local_fbtable) {
                var fbtable = this.get_processed_table(start_date, end_date, num_samples, filter);
                c3.generate(this.generate_bp_renderable(fbtable, target));
        }
}

FitbitDisplay.prototype.update = function()
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

FitbitDisplay.prototype.upload_to_remote_server = function()
{
        if (this.__local_fbtable == null) return false;

        var params = {
                identity: this.__identity,
                session_id: this.__session.get_session_id(),
                fbtable: this.__local_fbtable,
        };
        Meteor.call("update_measure_fitbit_from_table", params, function(error, result) {
                if (result.error != "") {
                        alert(result.error);
                        console.log("failed to upload fitbit data: " + JSON.stringify(params));
                } else {
                        console.log("remote fitbit data has been updated");
                }
        });
        return true;
}

FitbitDisplay.prototype.save_local_to_file_stream = function(file)
{
}

export var G_FitbitDisplay = new FitbitDisplay();


Template.tmplfitbitbrowser.onRendered(function() {
        console.log("fitbit browser rendered");
        G_FitbitDisplay.set_holders(this);
});
