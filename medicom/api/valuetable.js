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

        this.construct_from_bpcsv_stream = function(stream) {
                stream = stream.toString();
                var lines = stream.split(this.__c_LineDelim);

                for (var i = 0; i < lines.length; i ++) {
                        var parts = lines[i].split(this.__c_Delimiter);
                        if (parts.length != 2)
                                continue;

                        var timestamp = parts[0];
                        var bpvalue = parts[1];
                        
                        this.__pairs[i] = {date: this.__parse_bpcsv_date(timestamp),
                                           value: {systolic: parseFloat(bpvalue, 10), diastolic: 0}};
                }
        }
        
        this.construct_from_bp2csv_stream = function(stream) {
                stream = stream.toString();
                var lines = stream.split(this.__c_LineDelim);
        }
        
        this.construct_from_pbccsv_stream = function(stream) {
        }

        this.construct_from_stream = function(format, stream) {
                switch(format.toString().toLowerCase()) {
                case "bp":
                        this.construct_from_bpcsv_stream(stream);
                        break;
                case "bp2":
                        this.construct_from_bpcsv_stream(stream);
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
                this.__pairs[i] = {date: date, value: value};
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
                if (this.__pairs.length == 0 || method.name == "plain") return;
                
                var last = 0;
                var new_pairs = [];
                for (var i = 0; i < this.__pairs.length; i ++) {
                        if (i + 1 == this.__pairs.length || 
                            !f_Time_Eval(this.__pairs[i].date, this.__pairs[i + 1].date)) {
                                switch (method.name) {
                                case "uniform min":
                                        new_pairs[new_pairs.length] = this.__min_pair(last, i, method);
                                        break;
                                case "uniform max":
                                        new_pairs[new_pairs.length] = this.__max_pair(last, i, method);
                                        break;
                                case "uniform average":
                                        new_pairs[new_pairs.length] = this.__avg_pair(last, i, method);
                                        break;
                                }
                                last = i + 1;
                        }
                }
                this.__pairs = new_pairs;
        }
        
        this.sort_data = function(desc) {
                if (desc) {
                        this.__pairs.sort(function (x, y) {
                                return x.date.getTime() > y.date.getTime() ? -1 : 
                                      (x.date.getTime() < y.date.getTime() ? 1 : 0);
                        });
                } else {
                        this.__pairs.sort(function (x, y) {
                                return x.date.getTime() < y.date.getTime() ? -1 : 
                                      (x.date.getTime() > y.date.getTime() ? 1 : 0);
                        });
                }
        }
}

export function ValueTable_create_from_POD(pod) {
        var obj = new ValueTable();
        obj.__pairs = pod.__pairs;
        obj.__c_Delimiter = pod.__c_Delimiter; 
        obj.__c_LineDelim = pod.__c_LineDelim;
        return obj;
}
