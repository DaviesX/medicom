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
import {Meteor} from 'meteor/meteor';


export function ValueTable() {
        this.__pairs = [];
        this.__c_Delimiter = ",";
        this.__c_LineDelim = "\r";
        
        this.__parse_bpcsv_date = function(date_str) {
                var parts = date_str.split(" ");
                var ymd = parts[1].toString(); 
                var hms = parts[2].toString();

                var ymd_parts = ymd.split("-");
                var year = ymd_parts[0].toString();
                var month = ymd_parts[1].toString();
                var day = ymd_parts[2].toString();

                var hms_parts = hms.split(":");
                var hour = hms_parts[0].toString();
                var minute = hms_parts[1].toString();
                var second = hms_parts[2].toString();
                
                var date = new Date(year, month, day, hour, minute, second);
                return date;
        }

        this.construct_from_pairs = function(pairs) {
                this.__pairs = pairs;
        }

        this.construct_from_bpcsv_stream = function(stream) {
                stream = stream.toString();
                var lines = stream.split(this.__c_LineDelim);

                for (var i = 0; i < lines.length; i ++) {
                        var parts = lines[i].split(this.__c_Delimiter);
                        if (parts.length != 2)
                                continue;

                        var timestamp = parts[0];
                        var bpvalue = parts[1];
                        
                        this.add_row(this.__parse_bpcsv_date(timestamp),
                                     {systolic: parseFloat(bpvalue, 10), diastolic: 0, bpm: 0});
                }
        }

        this.__parse_bp2csv_sys = function(s) {
                var parts = s.split("/");
                var systolic = parts[0].slice(1, -1);
                return parseFloat(systolic);
        }

        this.__parse_bp2csv_dia = function(s) {
                var parts = s.split("/");
                var diastolic = parts[1].slice(1, -6);
                return parseFloat(diastolic);
        }

        this.__parse_bp2csv_date = function(s) {
                var parts = s.slice(1, -1).split(" ");
                var s_month = parts[0];
                var s_day = parts[1];
                var s_year = parts[2];
                var s_time = parts[4];
                var s_am = parts[5];
                var month;
                switch(s_month.slice(1, s_month.length)) {
                case "Jan":
                        month = 1;
                        break;
                case "Feb":
                        month = 2;
                        break;
                case "Mar":
                        month = 3;
                        break;
                case "Apr":
                        month = 4;
                        break;
                case "May":
                        month = 5;
                        break;
                case "Jun":
                        month = 6;
                        break;
                case "Jul":
                        month = 7;
                        break;
                case "Aug":
                        month = 8;
                        break;
                case "Sep":
                        month = 9;
                        break;
                case "Oct":
                        month = 10;
                        break;
                case "Nov":
                        month = 11;
                        break;
                case "Dec":
                        month = 12;
                        break;
                }
                var day = parseInt(s_day);  
                var year = parseInt(s_year);
                var hour = parseInt(s_time.split(":")[0]);
                var min = parseInt(s_time.split(":")[1]);
                if (s_am == "PM") hour += 12;
                return new Date(year, month - 1, day, hour, min);
        }

        this.__parse_bp2csv_bpm = function(s) {
                var bpm = s.slice(1, -5);
                return parseInt(bpm);
        }
        
        this.construct_from_bp2csv_stream = function(stream) {
                stream = stream.toString();
                var lines = stream.split(this.__c_LineDelim);
                var bps_values = [];
                var bpm_values = [];
                for (var i = 0, j = 0, k = 0; i < lines.length; i ++) {
                        if (lines[i].startsWith("\nBlood Pressure")) {
                                var parts = lines[i].split(this.__c_Delimiter);
                                bps_values[j] = {timestamp: parts[1].concat(parts[2]),
                                                 bp_values: parts[3]};
                                j ++;
                        } else if (lines[i].startsWith("\nPulse")) {
                                var parts = lines[i].split(this.__c_Delimiter);
                                bpm_values[k] = {timestamp: parts[1].concat(parts[2]),
                                                 bpm: parts[3]};
                                k ++;
                        }
                }
                for (var i = 0; i < bps_values.length; i ++) {
                        this.add_row(this.__parse_bp2csv_date(bps_values[i].timestamp),
                                     {systolic: this.__parse_bp2csv_sys(bps_values[i].bp_values), 
                                      diastolic:this.__parse_bp2csv_dia(bps_values[i].bp_values),
                                      bpm: this.__parse_bp2csv_bpm(bpm_values[i].bpm)});
                }
        }
        
        this.construct_from_pbccsv_stream = function(stream) {
                stream = stream.toString();
                var lines = stream.split(this.__c_LineDelim);
                for (var i = 0; i < lines.length; i ++) {
                        var parts = lines[i].split(this.__c_Delimiter);
                        var action = parts[3];
                        var date = parts[4];
                        if (action == "Cap off") {
                                this.add_row(new Date(date), {action: true});
                        }
                }
        }

        this.construct_from_stream = function(format, stream) {
                switch(format.toString().toLowerCase()) {
                case "bp":
                        this.construct_from_bpcsv_stream(stream);
                        break;
                case "bp2":
                        this.construct_from_bp2csv_stream(stream);
                        break;
                case "pbc":
                        this.construct_from_pbccsv_stream(stream);
                        break;
                default:
                        throw "Unkown file format: " + format;
                }
        }

        this.add_row = function(date, value) {
                var i = this.__pairs.length;
                this.__pairs[i] = {date: date, value: value, num_insts: 1};
        }

        this.get_row = function(date) {
                var target_time = date.getTime();
                for (var i = 0; i < this.__pairs.length; i ++) {
                        if (this.__pairs[i].date.getTime() == target_time) {
                                return this.__pairs[i];
                        }
                }
                return null;
        }

        this.get_pairs = function() {
                return this.__pairs;
        }
        
        this.__min_pair = function(i, j, method) {
                var m = this.__pairs[i];
                for (var k = i + 1; k <= j; k ++) {
                        if (method.scalar(this.__pairs[k].value) < method.scalar(m.value))
                                m = this.__pairs[k];
                }
                return m;
        }
        
        this.__max_pair = function(i, j, method) {
                var m = this.__pairs[i];
                for (var k = i + 1; k <= j; k ++) {
                        if (method.scalar(this.__pairs[k].value) > method.scalar(m.value))
                                m = this.__pairs[k];
                }
                return m;
        }
        
        this.__avg_pair = function(i, j, method) {
                var sum = this.__pairs[i].value;
                for (var k = i + 1; k <= j; k ++) {
                        sum = method.add(sum, this.__pairs[k].value);
                }
                return {date: this.__pairs[i].date, value: method.scale(1/(j - i + 1), sum)};
        }
        
        this.merge_adjacent_data = function(method, f_Time_Eval) {
                var new_table = new ValueTable();
                new_table.construct_from_pairs(this.__pairs.slice(0));

                if (this.__pairs.length == 0 || method.name == "plain") return new_table;
                
                var last = 0;
                for (var i = 0; i < this.__pairs.length; i ++) {
                        if (i + 1 == this.__pairs.length || 
                            !f_Time_Eval(this.__pairs[i].date, this.__pairs[i + 1].date)) {
                                switch (method.name) {
                                case "uniform min":
                                        new_table.__pairs[new_table.__pairs.length] = this.__min_pair(last, i, method);
                                        break;
                                case "uniform max":
                                        new_table.__pairs[new_table.__pairs.length] = this.__max_pair(last, i, method);
                                        break;
                                case "uniform average":
                                        new_table.__pairs[new_table.__pairs.length] = this.__avg_pair(last, i, method);
                                        break;
                                case "first":
                                        new_table.__pairs[new_table.__pairs.length] = this.__pairs[last];
                                        break;                                        
                                }
                                new_table.__pairs[new_table.__pairs.length - 1].num_insts = i - last + 1;
                                last = i + 1;
                        }
                }
                return new_table;
        }
        
        this.sort_data = function(desc) {
                var new_pairs = this.__pairs.slice(0);         
                if (desc) {
                        new_pairs.sort(function (x, y) {
                                return x.date.getTime() > y.date.getTime() ? -1 : 
                                      (x.date.getTime() < y.date.getTime() ? 1 : 0);
                        });
                } else {
                        new_pairs.sort(function (x, y) {
                                return x.date.getTime() < y.date.getTime() ? -1 : 
                                      (x.date.getTime() > y.date.getTime() ? 1 : 0);
                        });
                }
                var new_table = new ValueTable();
                new_table.construct_from_pairs(new_pairs);
                return new_table;
        }

        this.sample = function(start_date, end_date, num_samples) {
                var pairs = this.__pairs;
        
                var s = start_date == null ? Number.MIN_VALUE : start_date.getTime();
                var e = end_date == null ? Number.MAX_VALUE : end_date.getTime();
                
                var valid_indices = [];
                for (var i = 0, j = 0; j < pairs.length; j ++) {
                        var millidate = pairs[j].date.getTime();
                        if (millidate < s || millidate > e)
                                continue;
                        valid_indices[i ++] = j;
                }
        
                var new_pairs = [];
                num_samples = num_samples != null ? 
                        Math.min(valid_indices.length, Math.max(1, num_samples)) : valid_indices.length;   
                var interval = valid_indices.length/num_samples;
                for (var i = 0, j = 0; j < num_samples; i += interval, j ++) {
                        new_pairs[j] = pairs[valid_indices[Math.floor(i)]];
                }

                var new_table = new ValueTable();
                new_table.construct_from_pairs(new_pairs);
                return new_table;
        }
}

export function ValueTable_create_from_POD(pod) {
        var obj = new ValueTable();
        obj.__pairs = pod.__pairs;
        obj.__c_Delimiter = pod.__c_Delimiter; 
        obj.__c_LineDelim = pod.__c_LineDelim;
        return obj;
}
