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
import {Template} from "meteor/templating";
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";
import {SequentialEffect, BatchedEffect} from "./effects.js";


function chart_clear(target) {
        var x = ["x"];
        var y = [""];

        var chart = c3.generate({
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
        });
}

function add_bp(r, s) {
        return {systolic: r.systolic + s.systolic,
                diastolic: r.diastolic + s.diastolic};
}

function scale_bp(k, v) {
        return {systolic: k*v.systolic,
                diastolic: k*v.diastolic};
}

function scalar_bp(v) {
        return (v.systolic + v.diastolic)/2;
}

function chart_update_blood_pressure(bptable, start_date, end_date, num_samples, method_name, target) {
        var x = ["x"];
        var y = ["systolic blood pressure"];
        var z = ["diastolic blood pressure"];
        
        bptable.sort_data(false);
        // merge the data from the same day.
        bptable.merge_adjacent_data({
                        name: method_name, 
                        scalar: scalar_bp,
                        add: add_bp,
                        scale: scale_bp
                },
        function (a, b) {
                return a.getYear() == b.getYear() && a.getMonth() == b.getMonth() && a.getDay() == b.getDay();
        });
        var pairs = bptable.get_pairs();

        var s = start_date == null ? Number.MIN_VALUE : start_date.getTime();
        var e = end_date == null ? Number.MAX_VALUE : end_date.getTime();
        
        var valid_indices = [];
        for (var i = 0, j = 0; j < pairs.length; j ++) {
                var millidate = pairs[j].date.getTime();
                if (millidate < s || millidate > e)
                        continue;
                valid_indices[i ++] = j;
        }

        num_samples = num_samples != null ? 
                Math.min(valid_indices.length, Math.max(1, num_samples)) : valid_indices.length;   
        var interval = valid_indices.length/num_samples;
        for (var i = 0, j = 1; j - 1 < num_samples; i += interval, j ++) {
                var obj = pairs[valid_indices[Math.floor(i)]];
                x[j] = obj.date;
                y[j] = obj.value.systolic.toFixed(1);
                z[j] = obj.value.diastolic.toFixed(1);
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

function chart_update_pill_bottle_cap(pbctable, start_date, end_date, target) {
        var x = ["x"];
        var y = ["pill bottle cap"];
        
        pbctable.sort_data(false);
        var pairs = pbctable.get_pairs();

        var s = start_date == null ? Number.MIN_VALUE : start_date.getTime();
        var e = end_date == null ? Number.MAX_VALUE : end_date.getTime();
        
        var valid_indices = [];
        for (var i = 0, j = 0; j < pairs.length; j ++) {
                var millidate = pairs[j].date.getTime();
                if (millidate < s || millidate > e)
                        continue;
                valid_indices[i ++] = j;
        }

        this.find_pair_on = function(date) {
                var doses = [];
                for (var i = 0; i < valid_indices.length; i ++) {
                        var curr_date = pairs[valid_indices[i]].date;
                        if (date.getDate() == curr_date.getDate() && 
                            date.getMonth() == curr_date.getMonth() && 
                            date.getYear() == curr_date.getYear()) {
                                doses[doses.length] = pairs[valid_indices[i]];
                        }
                }
                return doses;
        }

        s = pairs[0].date.getTime();
        e = pairs[valid_indices[valid_indices.length - 1]].date.getTime();

        const a_day = 1000*60*60*24;

        for (var d = s, i = 1; d <= e; d += a_day) {
                var today = new Date(d);
                var doses = this.find_pair_on(today, 2);

                x[i] = doses.length > 0 ? doses[0].date : today;
                y[i] = doses.length;
                i ++;
        }
        
        return {
                bindto: target,
                data: {
                        x: "x",
                        columns: [x, y],
                        type: "bar",
                        colors: {
                                "pill bottle cap": "#00ff00"
                        }
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
                        }
                }
        };
}

function LocalBloodPressureDisplay() {
        this.__bptable = new ValueTable();
        this.__file = null;

        this.__update_data_from_file_stream = function() {
                var fr = new FileReader();
                var clazz = this;

                fr.onload = function (e) {
                        var parts = clazz.__file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        console.log("file content: " + stream.toString());
                        clazz.__bptable.construct_from_stream(suffix, stream);
                }
                fr.readAsText(this.__file);
        }
        
        this.set_data_from_bp_file_stream = function(file) {
                this.__file = file;
                this.__update_data_from_file_stream();
        }

        this.clear_data = function() {
                this.__bptable = new ValueTable();
        }

        this.get_bptable = function() {
                return this.__bptable;
        }

        this.update_target = function(start_date, end_date, filter, num_samples, target) {
                var chart = chart_update_blood_pressure(this.__bptable, start_date, end_date, num_samples, filter, target);
                c3.generate(chart);
        }

        this.save_to_file_stream = function(file) {
        }
}

function RemoteBloodPressureDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }

        this.update_target = function(start_date, end_date, filter, num_samples, target) {
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        start_date: start_date,
                        end_date: end_date,
                        num_samples: null
                };
                Meteor.call("user_get_patient_bp_table", params, function(error, result) {
                        if (result.error != "") {
                                console.log("failed to obtain bptable from patient: " + JSON.stringify(params));
                        } else {
                                var bptable = result.bptable;
                                bptable = ValueTable_create_from_POD(bptable);
                                var chart = chart_update_blood_pressure(
                                        bptable, start_date, end_date, num_samples, filter, target); 
                                c3.generate(chart);
                        }
                });
        }

        this.upload_to_remote_server = function(bptable) {
                if (bptable == null) return;
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        bptable: bptable
                };
                Meteor.call("patient_super_update_bp_from_table", params, function(error, result) {
                        if (result.error != "") {
                                alert(result.error);
                                console.log("failed to upload bp table: " + JSON.stringify(params));
                        } else {
                                console.log("remote blood pressure data has been updated");
                        }
                });
        }
}

function SymptomsDisplay() {

        this.update_target = function(start_date, end_date, target) {
        }
}

function LocalPillBottleCapDisplay() {
        this.__file = null;
        this.__pbctable = new ValueTable();

        this.__update_data_from_file_stream = function() {
                var fr = new FileReader();
                var clazz = this;

                fr.onload = function (e) {
                        var parts = clazz.__file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        console.log("file content: " + stream.toString());
                        clazz.__pbctable.construct_from_stream(suffix, stream);
                }
                fr.readAsText(this.__file);
        }
        
        this.set_data_from_pbc_file_stream = function(file) {
                this.__file = file;
                this.__update_data_from_file_stream();
        }

        this.clear_data = function() {
                this.__pbctable = new ValueTable();
        }

        this.update_target = function(start_date, end_date, target) {
                var chart = chart_update_pill_bottle_cap(this.__pbctable, start_date, end_date, target);
                c3.generate(chart);
        }
}

function SmartDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }

        this.update_target = function(start_date, end_date, filter, num_samples, target) {
                chart_clear(target);
        }
}

function SessionNotesDisplay() {
        this.__identity = null;
        this.__session = null;
        this.__notes_holder = null;
        
        this.set_access_info = function(identity, session) {
                this.__identity = identity;
                this.__session = session;
        }
        
        this.set_notes_holder = function(holder) {
                this.__notes_holder = holder;
        }
        
        this.update_notes = function() {
                var clazz = this;
                
                Meteor.call("user_get_session_notes", 
                            {identity: this.__identity, 
                             session_id: this.__session.get_session_id()}, function(error, result) {
                        if (result.error != "") {
                                console.log(result.error);
                        } else {
                                clazz.__notes_holder.html(result.notes);
                        }
                });
        }
        
        this.save_notes = function() {
                Meteor.call("provider_set_session_notes", 
                            {identity: this.__identity, 
                             session_id: this.__session.get_session_id(),
                             notes: this.__notes_holder.val()}, function(error, result) {
                        if (result.error != "") {
                                console.log(result.error);
                        } else {
                                console.log("Notes are saved");
                        }
                });
        }
}

export function DataBrowser() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__display_types = ["Smart Display Mode",
                                "Blood Pressure Data", 
                                "Symptoms Data", 
                                "Pill Bottle Cap", 
                                "Fitbit Data", 
                                "Blood Pressure[Local Data]"];

        this.__curr_display_mode = this.__display_types[0];
        
        this.__display_type_holder = null;
        this.__file_select_holder = null;
        this.__charting_area = null;

        this.__start_date = null;
        this.__end_date = null;
        this.__sample_count = null;
        this.__filtering = "plain";
        
        this.__smart_display = new SmartDisplay();
        this.__local_bp_display = new LocalBloodPressureDisplay();
        this.__remote_bp_display = new RemoteBloodPressureDisplay();
        this.__symp_display = new SymptomsDisplay();
        this.__notes_display = new SessionNotesDisplay();
        this.__pbc_display = new LocalPillBottleCapDisplay();
        
        // Access infos.
        this.set_target_session = function(session, user_info, identity) {
                this.__session = session;
                this.__browsing_user = user_info;
                this.__identity = identity;
        }
        
        this.get_target_session = function() {
                return this.__session;
        }

        this.get_browsing_user = function() {
                return this.__browsing_user;
        }
        
        // Holders.
        this.set_file_select_holder = function(holder, disconnector, filepath_holder) {
                filepath_holder.html("No file is connected");

                this.__file_select_holder = holder;
                var clazz = this;

                holder.on("change", function (event) {
                        var file = clazz.connect_to_bp_file();
                        if (file == null) 
                                return;
                        filepath_holder.html(file.name);
                        clazz.__local_bp_display.set_data_from_bp_file_stream(file);
                        clazz.__pbc_display.set_data_from_pbc_file_stream(file);
                        clazz.update_display();
                });

                disconnector.on("click", function(event) {
                        filepath_holder.html("No file is connected");
                        holder.replaceWith(holder = holder.clone(true));
                        this.__file_select_holder = holder;
                        clazz.__local_bp_display.clear_data();
                        clazz.__pbc_display.clear_data();
                        clazz.update_display();
                });
        }
        
        this.set_date_holder = function(start, end) {
                var clazz = this;
                
                start.datepicker().on("change", function (e) {
                        clazz.__start_date = new Date(e.target.value);
                        clazz.update_display();
                });
                end.datepicker().on("change", function(e) {
                        clazz.__end_date = new Date(e.target.value);
                        clazz.update_display();
                });
        }
        
        this.set_display_type_holder = function(holder) {
                var clazz = this;

                this.__display_type_holder = holder;
                var types = this.__display_types;
                holder.empty();
                for (var i = 0; i < types.length; i ++) {
                        holder.append('<option value="' + types[i] + '">' + types[i] + '</option>');
                }
        } 

        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }
        
        this.set_filter_holder = function(holder) {
                var clazz = this;
                
                holder.on("change", function(e) {
                        clazz.__filtering = e.target.value;
                        clazz.update_display();
                });
        }
        
        this.set_sample_count_holder = function(holder) {
                var clazz = this;
                
                holder.on("change", function(e) {
                        clazz.__sample_count = e.target.value == "" ? null : parseInt(e.target.value);
                        clazz.update_display();
                });
        }
        
        this.set_notes_holder = function(holder) {
                this.__notes_display.set_notes_holder(holder);
                
                var clazz = this;
                holder.on("change", function(e) {
                        clazz.__notes_display.save_notes();
                });
        }
        
        // Browser states.
        this.set_display_mode = function(display_mode) {
                this.__curr_display_mode = display_mode;
        }

        this.get_current_display_mode = function() {
                return this.__curr_display_mode;
        }

        this.get_data_displays = function() {
                return this.__display_types;
        }

        // Functional operations.
        this.connect_to_bp_file = function() {
                var files = this.__file_select_holder.prop("files");
                if (files == null || files.length == 0) 
                        return null;
                else
                        return files[0];
        }

        this.update_display = function(display_mode) {
                if (display_mode == null) display_mode = this.get_current_display_mode();
                else this.set_display_mode(display_mode);
                
                // Handle access info.
                this.__remote_bp_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__smart_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__notes_display.set_access_info(this.__identity, this.__session);
                
                // Update notes
                this.__notes_display.update_notes();
               
                // Update charting area.
                switch (display_mode) {
                case "Smart Display Mode":
                        this.__smart_display.update_target(this.__start_date, this.__end_date,
                                                           this.__filtering,
                                                           this.__sample_count,
                                                           this.__charting_area);
                        break;
                case "Blood Pressure Data": 
                        this.__remote_bp_display.update_target(this.__start_date, this.__end_date, 
                                                               this.__filtering,
                                                               this.__sample_count,
                                                               this.__charting_area);
                        break;
                case "Symptoms Data": 
                        this.__symp_display.update_target(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Pill Bottle Cap": 
                        this.__pbc_display.update_target(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Fitbit Data": 
                        break;
                case "Blood Pressure[Local Data]":
                        this.__local_bp_display.update_target(this.__start_date, this.__end_date, 
                                                              this.__filtering,
                                                              this.__sample_count,
                                                              this.__charting_area);
                        break;
                default:
                        throw "unkown display mode: " + display_mode;
                }
        }
        
        this.save_changes = function() {
                this.__remote_bp_display.upload_to_remote_server(this.__local_bp_display.get_bptable());
                this.__notes_display.save_notes();
                this.update_display();
                alert("Everything has been saved");
        }
}

export var G_DataBrowser = new DataBrowser();

Template.tmpldatabrowser.onRendered(function () {
        console.log("data browser rendered");

        var effect = new BatchedEffect("fade", 500);
        effect.add_elm($("#data-panel"));
        effect.finalize();
        effect.animate();

        G_DataBrowser.set_display_type_holder($("#sel-chart-types"));
        G_DataBrowser.set_charting_area(this.find("#charting-area"));
        G_DataBrowser.set_file_select_holder($("#ipt-file-select"), $("#lb-disconnect"), $("#div-filepath"));
        G_DataBrowser.set_date_holder($("#ipt-start-date"), $("#ipt-end-date"));
        G_DataBrowser.set_filter_holder($("#sel-filter-method"));
        G_DataBrowser.set_sample_count_holder($("#ipt-num-samples"));
        G_DataBrowser.set_notes_holder($("#txt-notes"));
        
        G_DataBrowser.update_display();
});

Template.tmpldatabrowser.helpers({
        session_id() {
                var selected = G_DataBrowser.get_target_session();
                var user = G_DataBrowser.get_browsing_user();
                return user.get_name() + ", " + user.get_account_id() + " - " + selected.get_start_date() + " - " + selected.get_session_id();
        }
});

Template.tmpldatabrowser.events({"click #sel-chart-types"(event) {
        G_DataBrowser.update_display($(event.target).val());
}});

Template.tmpldatabrowser.events({"click #btn-save-change"(event) {
        G_DataBrowser.save_changes();
}});
