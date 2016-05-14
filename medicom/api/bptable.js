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


export function BPTable() {
        this.__dates = [];
        this.__values = [];
        this.__c_Delimiter = ",";
        this.__c_LineDelim = "\r";
        
        this.__parse_csv_date = function(date_str) {
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

        this.construct_from_csv_stream = function(stream) {
                stream = stream.toString();
                var lines = stream.split(this.__c_LineDelim);

                for (var i = 0; i < lines.length; i ++) {
                        var parts = lines[i].split(this.__c_Delimiter);
                        if (parts.length != 2)
                                continue;

                        var timestamp = parts[0];
                        var bpvalue = parts[1];
                        
                        this.__dates[i] = this.__parse_csv_date(timestamp);
                        this.__values[i] = parseFloat(bpvalue, 10);
                }
        }

        this.construct_from_stream = function(format, stream) {
                switch(format) {
                case "csv":
                        this.construct_from_csv_stream(stream);
                        break;
                default:
                        throw "Unkown file format: " + format;
                }
        }

        this.add_row = function(date, value) {
                var i = this.__dates.length;
                this.__dates[i] = date;
                this.__values[i] = value;
        }

        this.get_dates = function() {
                return this.__dates;
        }

        this.get_bp_values = function() {
                return this.__values;
        }
}

export function BPTable_create_from_POD(pod) {
        var obj = new BPTable();
        obj.__dates = pod.__dates;
        obj.__values = pod.__values;
        obj.__c_Delimiter = pod.__c_Delimiter; 
        obj.__c_LineDelim = pod.__c_LineDelim;
        return obj;
}
