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

 export function Chart() {

        this.clear = function(target) {
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

        this.__add_bp = function(r, s) {
                return {systolic: r.systolic + s.systolic,
                        diastolic: r.diastolic + s.diastolic};
        }

        this.__scale_bp = function(k, v) {
                return {systolic: k*v.systolic,
                        diastolic: k*v.diastolic};
        }

        this.__scalar_bp = function(v) {
                return (v.systolic + v.diastolic)/2;
        }

        this.render_blood_pressure = function(bptable, start_date, end_date, num_samples, method_name, target) {
                var x = ["x"];
                var y = ["systolic blood pressure"];
                var z = ["diastolic blood pressure"];
                
                bptable.sort_data(false);
                // merge the data from the same day.
                bptable.merge_adjacent_data({
                                name: method_name, 
                                scalar: this.__scalar_bp,
                                add: this.__add_bp,
                                scale: this.__scale_bp
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

        this.render_pill_bottle_cap = function(pbctable, start_date, end_date, target) {
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
                                        "pill bottle cap": "rgba(0, 255, 0, 0.2)"
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
 }
