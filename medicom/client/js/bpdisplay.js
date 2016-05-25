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
import {Chart} from "./charts.js";
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";

export function BloodPressureDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__charting_area = null;

        this.__start_date = null;
        this.__end_date = null;
        this.__sample_count = null;
        this.__filtering = "plain";
        this.__file = null;
        
        this.__chart = new Chart();
        this.__local_bptable = null;

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
        
        this.set_filter_holder = function(holder) {
                var clazz = this;
                
                holder.on("change", function(e) {
                        clazz.__filtering = e.target.value;
                        clazz.update();
                });
        }
        
        this.set_sample_count_holder = function(holder) {
                var clazz = this;
                
                holder.on("change", function(e) {
                        clazz.__sample_count = e.target.value == "" ? null : parseInt(e.target.value);
                        clazz.update();
                });
        }

        this.set_local_data_from_file_stream = function(file, f_On_Complete) {
                var fr = new FileReader();
                var clazz = this;

                fr.onload = function (e) {
                        var parts = file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        var bptable = new ValueTable();
                        bptable.construct_from_stream(suffix, stream);
                        clazz.__local_bptable = bptable;

                        f_On_Complete(clazz);
                }
                fr.readAsText(file);
        }
        
        // Data
        this.set_local_data_from_remote_server = function(start_date, end_date, num_samples, f_On_Complete) {
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        start_date: start_date,
                        end_date: end_date,
                        num_samples: num_samples, 
                };
                var clazz = this;
                Meteor.call("user_get_patient_bp_table", params, function(error, result) {
                        if (result.error != "") {
                                console.log("failed to obtain bptable from patient: " + JSON.stringify(params));
                        } else {
                                clazz.__local_bptable = ValueTable_create_from_POD(result.bptable);
                                f_On_Complete(clazz);
                        }
                });
        }

        this.clear_local_data = function() {
                this.__local_bptable = null;
        }

        this.render_local_data = function(start_date, end_date, filter, num_samples, target) {
                if (this.__local_bptable)
                        c3.generate(this.__chart.render_blood_pressure(this.__local_bptable, start_date, end_date, num_samples, filter, target));
        }
        
        this.update = function() {
                var clazz = this;
                if (this.__file != null) {
                        this.set_local_data_from_file_stream(this.__file, function(obj) {
                                clazz.render_local_data(clazz.__start_date, this.__end_date, 
                                                        clazz.__filtering, this.__sample_count, 
                                                        clazz.__charting_area);
                        });
                } else {
                        this.set_local_data_from_remote_server(this.__start_date, this.__end_date, 
                                                               this.__sample_count, function(obj) {
                                clazz.render_local_data(clazz.__start_date, this.__end_date, 
                                                        clazz.__filtering, this.__sample_count, 
                                                        clazz.__charting_area);
                        });
                }
                
        }

        this.upload_to_remote_server = function(bptable) {
                if (this.__local_bptable == null) return false;
                
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        bptable: this.__local_bptable,
                };
                Meteor.call("patient_super_update_bp_from_table", params, function(error, result) {
                        if (result.error != "") {
                                alert(result.error);
                                console.log("failed to upload bp table: " + JSON.stringify(params));
                        } else {
                                console.log("remote blood pressure data has been updated");
                        }
                });
                return true;
        }

        this.save_local_to_file_stream = function(file) {
        }
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
