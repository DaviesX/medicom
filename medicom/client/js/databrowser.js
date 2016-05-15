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
import {BPTable, BPTable_create_from_POD} from "../../api/bptable.js";


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

function chart_update_blood_pressure(bptable, start_date, end_date, num_samples, methods, target) {
        var x = ["x"];
        var y = ["blood pressure"];
        
        bptable.sort_data(false);
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
                x[j] = pairs[valid_indices[Math.floor(i)]].date;
                y[j] = pairs[valid_indices[Math.floor(i)]].value;
        }
        
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

function LocalBloodPressureDisplay() {
        this.__bptable = new BPTable();
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

        this.get_bptable = function() {
                return this.__bptable;
        }

        this.update_target = function(start_date, end_date, target) {
                chart_update_blood_pressure(this.__bptable, start_date, end_date, null, "average", target);
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

        this.update_target = function(start_date, end_date, target) {
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        start_date: start_date,
                        end_date: end_date,
                        num_samples: null,
                        method: "average"
                };
                Meteor.call("user_get_patient_bp_table", params, function(error, result) {
                        if (result.error != "") {
                                console.log("failed to obtain bptable from patient: " + JSON.stringify(params));
                        } else {
                                var bptable = result.bptable;
                                bptable = BPTable_create_from_POD(bptable);
                                chart_update_blood_pressure(bptable, start_date, end_date, null, "plain", target); 
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

function SmartDisplay() {

        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }

        this.update_target = function(start_date, end_date, target) {
                chart_clear(target);
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
        this.__sample_count = 10;
        
        this.__smart_display = new SmartDisplay();
        this.__local_bp_display = new LocalBloodPressureDisplay();
        this.__remote_bp_display = new RemoteBloodPressureDisplay();
        this.__symp_display = new SymptomsDisplay();

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

        this.set_file_select_holder = function(holder) {
                this.__file_select_holder = holder;
                var clazz = this;

                holder.on("change", function (event) {
                        var file = clazz.connect_to_bp_file();
                        if (file == null) 
                                return;
                        clazz.__local_bp_display.set_data_from_bp_file_stream(file);
                        clazz.update_display();
                });
        }
        
        this.set_date_holder = function(start, end) {
                var clazz = this;
                
                start.datepicker().on("change", function (e) {
                        this.__start_date = new Date(e.target.value);
                        clazz.update_display();
                });
                end.datepicker().on("change", function(e) {
                        this.__end_date = new Date(e.target.value);
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
        
        this.set_display_mode = function(display_mode) {
                this.__curr_display_mode = display_mode;
        }

        this.get_current_display_mode = function() {
                return this.__curr_display_mode;
        }

        this.get_data_displays = function() {
                return this.__display_types;
        }

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
               
                // Update charting area.
                switch (display_mode) {
                case "Smart Display Mode":
                        this.__smart_display.update_target(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Blood Pressure Data": 
                        this.__remote_bp_display.update_target(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Symptoms Data": 
                        this.__symp_display.update_target(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Pill Bottle Cap": 
                        break;
                case "Fitbit Data": 
                        break;
                case "Blood Pressure[Local Data]":
                        this.__local_bp_display.update_target(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                default:
                        throw "unkown display mode: " + display_mode;
                }
        }
        
        this.save_changes = function() {
                this.__remote_bp_display.upload_to_remote_server(this.__local_bp_display.get_bptable());
                this.update_display();
                alert("Everything has been saved");
        }
}

export var G_DataBrowser = new DataBrowser();

Template.tmpldatabrowser.onRendered(function () {
        G_DataBrowser.set_display_type_holder($("#sel-chart-types"));
        G_DataBrowser.set_charting_area(this.find("#charting-area"));
        G_DataBrowser.set_file_select_holder($("#ipt-file-select"));
        G_DataBrowser.set_date_holder($("#ipt-start-date"), $("#ipt-end-date"));

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
