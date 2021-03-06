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

export function SymptomsDisplay()
{
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;

        this.__i_page = 1;
        this.__num_items = 5;
        this.__sym_table = null;
        this.__start_date = null;
        this.__end_date = null;

        this.__sym_selector_holder = null;
        this.__sym_record_holder = null;
        this.__charting_area = null;
}

SymptomsDisplay.prototype.set_access_info = function(identity, browsing_user, session)
{
        this.__identity = identity
        this.__browsing_user = browsing_user;
        this.__session = session;
}

SymptomsDisplay.prototype.set_holders = function(template)
{
        this.__charting_area = template.find("#charting-area");
        this.__sym_record_holder = $("#div-sym-record-holder");
        this.__sym_selector_holder = $("#symptom-selector-holder");
        var clazz = this;
        var page_num = $("#div-page-num-holder");
        var num_items = $("#ipt-num-items");
        $("#btn-next-page").on("click", function(e) {
                var max_page_num = clazz.__sym_table != null ?
                                   Math.ceil(clazz.__sym_table.get_pairs().length/clazz.__num_items) :
                                   1;
                clazz.__i_page = Math.min(clazz.__i_page + 1, max_page_num);
                page_num.html(clazz.__i_page);
                clazz.update();
        });
        $("#btn-prev-page").on("click", function(e) {
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
        $("#ipt-start-date").datepicker().on("change", function (e) {
                clazz.__start_date = new Date(e.target.value);
                clazz.update();
        });
        $("#ipt-end-date").datepicker().on("change", function(e) {
                clazz.__end_date = new Date(e.target.value);
                clazz.update();
        });
}

SymptomsDisplay.prototype.__make_symptom_ui = function(date, description)
{
        const max_len = 100;
        var desc_str;
        if (description.length > max_len) {
                desc_str = description.slice(0, max_len);
                desc_str += "...";
        } else
                desc_str = description;
        return "<div style='width: 100%;\
                            text-align: center;\
                            padding-top: 15px;\
                            padding-bottom: 15px;\
                            margin-top: 5px;\
                            margin-bottom: 5px;' class='simp_classic-flat' id='"
                        + date.getTime() + "'>"
                        + date.toDateString() + ': ' + desc_str + '</div>';
}

SymptomsDisplay.prototype.get_processed_table = function(start_date, end_date)
{
        if (this.__sym_table == null)
                return null;

        var sym_table = this.__sym_table;
        sym_table = sym_table.sort_data(true);
        sym_table = sym_table.sample(start_date, end_date, null);
        return sym_table;
}

SymptomsDisplay.prototype.get_symptoms = function(table, s)
{
        var pairs = table.get_pairs();

        var imap = new Map();
        var n = s;
        for (var i = 0; i < pairs.length; i ++) {
                var syms = pairs[i].value.symp_pairs;
                for (var j = 0; j < syms.length; j ++) {
                        if (!imap.has(syms[j].symp_name))
                                imap.set(syms[j].symp_name, n ++);
                }
        }
        return imap;
}

SymptomsDisplay.prototype.get_lifestyles = function(table, s)
{
        var pairs = table.get_pairs();

        var imap = new Map();
        var n = s;
        for (var i = 0; i < pairs.length; i ++) {
                var styles = pairs[i].value.lifestyle_pairs;
                if (styles == undefined)
                        continue;
                for (var j = 0; j < styles.length; j ++) {
                        if (!imap.has(styles[j].factor_name))
                                imap.set(styles[j].factor_name, n ++);
                }
        }
        return imap;
}

SymptomsDisplay.prototype.render_local_data = function(start_date, end_date, i_page, num_items, target)
{
        var table = this.get_processed_table(start_date, end_date);
        if (table == null || table.get_pairs().length == 0) {
                // Render empty chart.
                c3.generate({
                        bindto: target,
                        data: {
                                x: "x",
                                columns: [["x"], ["Nothing to display"]]
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
                // Render empty records.
                this.__sym_record_holder.html("<div style='text-align: center;\
                                                           padding-top: 10%;\
                                                           padding-bottom: 10%'>\
                                                No Symptom Records Are Found</div>");
        } else {
                var pairs = table.get_pairs();

                // Render chart.
                var map = this.get_symptoms(table, 0);
                var map2 = this.get_lifestyles(table, map.size);
                var x = ["x"];
                var y = [];
                var types = new Map();

                map.forEach(function(v, k, m) {
                        y.push([k]);
                        types.set(k, "line");
                });

                map2.forEach(function(v, k, m) {
                        y.push([k]);
                        types.set(k, "line");
                });

                for (var i = 0; i < pairs.length; i ++) {
                        x[i + 1] = pairs[i].date;

                        for (var k = 0; k < map.size; k ++) {
                                y[k][i + 1] = null;
                        }

                        for (var k = map.size; k < map2.size; k ++) {
                                y[k][i + 1] = null;
                        }

                        var syms = pairs[i].value.symp_pairs;
                        if (syms != undefined) {
                                for (var k = 0; k < syms.length; k ++) {
                                        var p = map.get(syms[k].symp_name);
                                        y[p][i + 1] = syms[k].scale;
                                }
                        }

                        var factors = pairs[i].value.lifestyle_pairs;
                        if (factors != undefined) {
                                for (var k = 0; k < factors.length; k ++) {
                                        var p = map2.get(factors[k].factor_name);
                                        y[p][i + 1] = factors[k].answer*2;
                                }
                        }
                }

                var columns = [x].concat(y);

                c3.generate({
                        bindto: target,
                        data: {
                                x: "x",
                                columns: columns,
                                types: types,
                        },
                        axis: {
                                x: {
                                        type: "timeseries",
                                        tick: {
                                                format: "%Y-%m-%d"
                                        }
                                },
                        }
                });
                // Render records.
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

SymptomsDisplay.prototype.clear_local_data = function()
{
        this.__sym_table = null;
}

SymptomsDisplay.prototype.set_local_data_from_remote_server = function(start_date, end_date, f_On_Complete)
{
        this.clear_local_data();

        var params = {
                identity: this.__identity,
                session_id: this.__session.get_session_id(),
                start_date: start_date,
                end_date: end_date,
                num_items: null,
        };
        var clazz = this;
        Meteor.call("get_measure_symptom", params, function(error, result) {
                if (result.error != "") {
                        console.log("failed to obtain symptom records from patient: " + JSON.stringify(params));
                } else {
                        clazz.__sym_table = ValueTable_create_from_POD(result.sym_table);
                        if (f_On_Complete != null)
                                f_On_Complete(clazz);
                }
        });
}

SymptomsDisplay.prototype.update = function()
{
        var clazz = this;
        this.set_local_data_from_remote_server(this.__start_date, this.__end_date, function(obj) {
                clazz.render_local_data(clazz.__start_date,
                                        clazz.__end_date,
                                        clazz.__i_page,
                                        clazz.__num_items,
                                        clazz.__charting_area);
        });
}

export var G_SymptomsDisplay = new SymptomsDisplay();

Template.tmplsymptombrowser.onRendered(function() {
        console.log("symptom browser rendered");
        G_SymptomsDisplay.set_holders(this);
        G_SymptomsDisplay.update();
});
