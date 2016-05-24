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
import {BloodPressureDisplay} from "./bpdisplay.js";
import {PillBottleCapDisplay} from "./pbcdisplay.js";
import {SymptomsDisplay} from "./symptomsdisplay.js";
import {FitbitDisplay} from "./fitbitdisplay.js";
import {SmartDisplay} from "./smartdisplay.js";
import {SessionNotesDisplay} from "./notesdisplay.js";
import {G_Session} from "./session.js";


export function DataBrowser() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__display_types = ["Smart Display Mode",
                                "Blood Pressure Data", 
                                "Symptoms Data", 
                                "Pill Bottle Cap", 
                                "Fitbit Data"];

        this.__curr_display_mode = this.__display_types[0];
        
        this.__display_type_holder = null;
        this.__file_select_holder = null;
        this.__charting_area = null;

        this.__start_date = null;
        this.__end_date = null;
        this.__sample_count = null;
        this.__filtering = "plain";
        
        this.__smart_display = new SmartDisplay();
        this.__bp_display = new BloodPressureDisplay();
        this.__pbc_display = new PillBottleCapDisplay();
        this.__symp_display = new SymptomsDisplay();
        this.__fitbit_display = new FitbitDisplay();
        this.__notes_display = new SessionNotesDisplay();
        
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
                        clazz.__bp_display.set_local_data_from_file_stream(file, function(obj) {
                                clazz.update_display();
                        });
                        clazz.__pbc_display.set_data_from_pbc_file_stream(file);
                        clazz.update_display();
                });

                disconnector.on("click", function(event) {
                        filepath_holder.html("No file is connected");
                        holder.replaceWith(holder = holder.clone(true));
                        this.__file_select_holder = holder;
                        clazz.__bp_display.set_local_data_from_remote_server(clazz.__start_date, clazz.__end_date, 
                                                clazz.__sample_count, function(obj) {
                                clazz.update_display();
                        });
                        clazz.__pbc_display.clear_local_data();
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
                this.__bp_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__smart_display.set_access_info(this.__identity, this.__browsing_user, this.__session);
                this.__notes_display.set_access_info(this.__identity, this.__session);
                
                // Update notes
                this.__notes_display.update_notes();
               
                // Update charting area.
                switch (display_mode) {
                case "Smart Display Mode":
                        this.__smart_display.render_local_data(this.__start_date, this.__end_date,
                                                               this.__filtering,
                                                               this.__sample_count,
                                                               this.__charting_area);
                        break;
                case "Blood Pressure Data": 
                        this.__bp_display.render_local_data(this.__start_date, this.__end_date, 
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
        
        G_Session.set_data_display_mode(G_DataBrowser.get_current_display_mode());
});

Template.tmpldatabrowser.helpers({
        session_id() {
                var selected = G_DataBrowser.get_target_session();
                var user = G_DataBrowser.get_browsing_user();
                return user.get_name() + ", " + user.get_account_id() + " - " + selected.get_start_date() + " - " + selected.get_session_id();
        },

        use_smartbrowser() {
                return G_Session.get_data_display_mode() == "Smart Display Mode";
        },
        
        use_bpbrowser() {
                return G_Session.get_data_display_mode() == "Blood Pressure Data";
        },
        
        use_pbcbrowser() {
                return G_Session.get_data_display_mode() == "Pill Bottle Cap";
        },

        use_symptombrowser() {
                return G_Session.get_data_display_mode() == "Symptoms Data";
        },
        
        use_fitbitbrowser() {
                return G_Session.get_data_display_mode() == "Fitbit Data";
        },
});

Template.tmpldatabrowser.events({"click #sel-chart-types"(event) {
        G_DataBrowser.update_display($(event.target).val());
        G_Session.set_data_display_mode(G_DataBrowser.get_current_display_mode());
}});

Template.tmpldatabrowser.events({"click #btn-save-change"(event) {
        G_DataBrowser.save_changes();
}});
