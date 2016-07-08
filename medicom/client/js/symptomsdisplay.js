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
import {ValueTable_create_from_POD} from "../../api/valuetable.js";

export function SymptomsDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;
        
        this.__i_page = 1;
        this.__num_items = 5;     
        this.__sym_table = null;
        this.__start_date = null;
        this.__end_date = null;
        
        this.__sym_record_holder = null;
        this.__charting_area = null;
        
        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }
        
        this.set_charting_area = function(charting_area) {
                this.__charting_area = charting_area;
        }
        
        this.set_holders = function(sym_record_area, next_page, prev_page, page_num, num_items, start_date, end_date) {
                this.__sym_record_holder = sym_record_area;
                var clazz = this;
                next_page.on("click", function(e) {
                        var max_page_num = clazz.__sym_table != null ? 
                                           Math.ceil(clazz.__sym_table.get_pairs().length/clazz.__num_items) :
                                           1;
                        clazz.__i_page = Math.min(clazz.__i_page + 1, max_page_num);
                        page_num.html(clazz.__i_page);
                        clazz.update();
                });
                prev_page.on("click", function(e) {
                        clazz.__i_page = Math.max(clazz.__i_page - 1, 1);
                        page_num.html(clazz.__i_page);
                        clazz.update();
                });
                page_num.html(this.__i_page);
                num_items.val(this.__num_items);
                num_items.on("change", function(e) {
                        clazz.__num_items = parseInt(e.target.value);
                        clazz.update();
                });
                start_date.datepicker().on("change", function (e) {
                        clazz.__start_date = new Date(e.target.value);
                        clazz.update();
                });
                end_date.datepicker().on("change", function(e) {
                        clazz.__end_date = new Date(e.target.value);
                        clazz.update();
                });
        }
        
        this.__make_symptom_ui = function(date, description) {
                return '<button class="simp_classic-list-item" name="session-list" id="' + date.getTime() + '">' + 
                        date + ': ' + description + '</button>';
        }
        
        this.render_local_data = function(sym_table, i_page, num_items, target) {
                var pairs = this.__sym_table.get_pairs();
                if (pairs == null || pairs.length == 0)
                        this.__sym_record_holder.html("<div style='text-align: center;\
                                                                   padding-top: 10%;\
                                                                   padding-bottom: 10%'>\
                                                        No Symptom Records Are Found</div>");
                else {
                        this.__sym_record_holder.empty();
                        var start = (this.__i_page - 1)*this.__num_items;
                        var end = start + this.__num_items;
                        start = Math.min(Math.max(0, start), pairs.length);
                        end = Math.min(Math.max(start, end), pairs.length);
                        for (var i = start; i < end; i ++) {
                                this.__sym_record_holder.append(
                                        this.__make_symptom_ui(pairs[i].date, pairs[i].value.description));
                        }
                }
        }
        
        this.clear_local_data = function() {
                this.__sym_table = null;
        }
        
        this.set_local_data_from_remote_server = function(f_On_Complete) {
                this.clear_local_data();
                
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        start_date: this.__start_date,
                        end_date: this.__end_date,
                        num_items: null, 
                };
                var clazz = this;
                Meteor.call("user_get_sypmtom", params, function(error, result) {
                        if (result.error != "") {
                                console.log("failed to obtain symptom records from patient: " + JSON.stringify(params));
                        } else {
                                clazz.__sym_table = ValueTable_create_from_POD(result.sym_table);
                                clazz.__sym_table.sort_data(true);
                                if (f_On_Complete != null)
                                        f_On_Complete(clazz);
                        }
                });
        }
        
        this.update = function() {
                var clazz = this;
                this.set_local_data_from_remote_server(function(obj) {
                        clazz.render_local_data(clazz.__sym_table, 
                                                clazz.__i_page,
                                                clazz.__num_items, 
                                                clazz.__charting_area);
                });
        }
}

export var G_SymptomsDisplay = new SymptomsDisplay();

Template.tmplsymptombrowser.onRendered(function() {
        console.log("symptom browser rendered");
        G_SymptomsDisplay.set_charting_area(this.find("#charting-area"));
        G_SymptomsDisplay.set_holders($("#div-sym-record-holder"),
                                      $("#btn-next-page"),
                                      $("#btn-prev-page"),
                                      $("#div-page-num-holder"),
                                      $("#ipt-num-items"),
                                      $("#ipt-start-date"),
                                      $("#ipt-end-date"));
        G_SymptomsDisplay.update();
});
