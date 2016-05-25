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
import {Chart} from "./charts.js";

export function PillBottleCapDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;        
        
        this.__start_date = null;
        this.__end_date = null;
        this.__file = null;
        this.__charting_area = null;
        
        this.__chart = new Chart();
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
        
        // Data.
        this.set_local_data_from_file_stream = function(file, f_On_Complete) {
                var fr = new FileReader();
                var clazz = this;
                this.clear_local_data();

                fr.onload = function (e) {
                        var parts = file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        clazz.__pbctable.construct_from_stream(suffix, stream);
                        f_On_Complete(clazz);
                }
                fr.readAsText(file);
        }
        
        this.set_local_data_from_remote_server = function(start_date, end_date, f_On_Complete) {
        }

        this.clear_local_data = function() {
                this.__pbctable = new ValueTable();
        }

        this.render_local_data = function(start_date, end_date, target) {
                c3.generate(this.__chart.render_pill_bottle_cap(this.__pbctable, start_date, end_date, target));
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
});
