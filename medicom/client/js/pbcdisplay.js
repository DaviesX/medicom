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
        this.__file = null;
        this.__chart = new Chart();
        this.__pbctable = new ValueTable();
        
        this.__charting_area = null;
        
        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }
        
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

        this.clear_local_data = function() {
                this.__pbctable = new ValueTable();
        }

        this.update_target = function(start_date, end_date, target) {
                var chart = this.__chart.render_pill_bottle_cap(this.__pbctable, start_date, end_date, target);
                c3.generate(chart);
        }
}

export var G_PBCDisplay = new PillBottleCapDisplay();

Template.tmplpbcbrowser.onRendered(function() {
        console.log("pbc browser rendered");
        G_PBCDisplay.set_charting_area(this.find("#charting-area"));
});
