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

import {IRowValue} from "./irowvalue.ts";
import {BloodPressure} from "./bloodpressure.ts";
import {PillCapAction} from "./pillcapaction.ts";
import {SleepQuality} from "./sleepquality.ts";


export type DateComp = (a: Date, b: Date) => boolean;

export class Row
{
        public date:            Date;
        public value:           IRowValue;
        public num_insts:       number;

        constructor(date: Date, value: IRowValue, num_insts: number)
        {
                this.date = date;
                this.value = value;
                this.num_insts = num_insts;
        }
};

interface RowValueOp
{
        scalar(v: IRowValue):                   number;
        add(v0: IRowValue, v1: IRowValue):      IRowValue;
        scale(k: number, v: IRowValue):         IRowValue;
        merge(v0: IRowValue, v1: IRowValue):    IRowValue;
};


/*
 * <ValueTable> Representing a list IRowValue referenced by Date.
 */
export class ValueTable
{
        public Delimiter:      string = ",";           // CSV delimiter and line break.
        public LineDelimiter:  string = "\n";

        public m_pairs:        Array<Row>;             // m_pairs: array of {date, value, num_insts}.
        public m_is_sorted:    boolean = true;         // A dirty flag to show whether the data set is sorted or not.

        constructor() 
        {
                this.m_pairs = new Array<Row>();
        }
        
        public construct_from_pairs(pairs: Array<Row>): void
        {
                this.m_pairs = pairs;
                this.m_is_sorted = false;
        }
        
        private parse_bpcsv_date(date_str: string): Date
        {
                var parts = date_str.split(" ");
                var ymd = parts[1].toString();
                var hms = parts[2].toString();
        
                var ymd_parts = ymd.split("-");
                var year = parseInt(ymd_parts[0]);
                var month = parseInt(ymd_parts[1]);
                var day = parseInt(ymd_parts[2]);
        
                var hms_parts = hms.split(":");
                var hour = parseInt(hms_parts[0]);
                var minute = parseInt(hms_parts[1]);
                var second = parseInt(hms_parts[2]);
        
                var date = new Date(year, month, day, hour, minute, second);
                return date;
        }

        public construct_from_bpcsv_stream(stream: string): void
        {
                stream = stream.toString();
                var lines = stream.split("\r");
        
                for (var i = 0; i < lines.length; i ++) {
                        var parts = lines[i].split(this.Delimiter);
                        if (parts.length != 2)
                                continue;
        
                        var timestamp = parts[0];
                        var bpvalue = parts[1];
                        
                        this.add_row(this.parse_bpcsv_date(timestamp), 
                                     new BloodPressure(parseFloat(bpvalue), 0, 0));
                }
        }
        
        // Systolic blood pressure element lexing
        private parse_bp2csv_sys(s: string): number
        {
                var parts = s.split("/");
                var systolic = parts[0].slice(1, -1);
                return parseFloat(systolic);
        }
        
        // Diastolic blood pressure element lexing
        private parse_bp2csv_dia(s: string): number
        {
                var parts = s.split("/");
                var diastolic = parts[1].slice(1, -6);
                return parseFloat(diastolic);
        }
        
        // Date element lexing
        private parse_bp2csv_date(s: string): Date
        {
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
        
        private parse_bp2csv_bpm(s: string): number
        {
                var bpm = s.slice(1, -5);
                return parseInt(bpm);
        }
        
        public construct_from_bp2csv_stream(stream: string): void
        {
                stream = stream.toString();
                var lines = stream.split("\r");
                var bps_values = [];
                var bpm_values = [];

                for (var i = 0, j = 0, k = 0; i < lines.length; i ++) {
                        if (lines[i].startsWith("\nBlood Pressure")) {
                                var parts = lines[i].split(this.Delimiter);
                                bps_values[j] = {timestamp: parts[1].concat(parts[2]),
                                                 bp_values: parts[3]};
                                j ++;
                        } else if (lines[i].startsWith("\nPulse")) {
                                var parts = lines[i].split(this.Delimiter);
                                bpm_values[k] = {timestamp: parts[1].concat(parts[2]),
                                                 bpm: parts[3]};
                                k ++;
                        }
                } 

                for (var i = 0; i < bps_values.length; i ++) {
                        this.add_row(this.parse_bp2csv_date(bps_values[i].timestamp),
                                     new BloodPressure(this.parse_bp2csv_sys(bps_values[i].bp_values),
                                                       this.parse_bp2csv_dia(bps_values[i].bp_values),
                                                       this.parse_bp2csv_bpm(bpm_values[i].bpm)));
                }
        }
        
        public construct_from_pbccsv_stream(stream: string): void
        {
                stream = stream.toString();
                var lines = stream.split("\n");
                for (var i = 0; i < lines.length; i ++) {
                        var parts = lines[i].split(this.Delimiter);
                        var action = parts[3];
                        var date = parts[4];
                        if (action == "Cap off")
                                this.add_row(new Date(date), new PillCapAction(true));
                }
        }
        
        public construct_from_fitbitcsv_stream(stream: string): void
        {
                stream = stream.toString();
                var lines = stream.split("\n");
                var i = 0;
                while (i < lines.length) {
                        if (-1 != lines[i].indexOf("Sleep")) {
                                i += 2;
                                while (i < lines.length) {
                                        // Capture sleep quality.
                                        lines[i] = lines[i].split('"').join("");
                                        var parts = lines[i].split(this.Delimiter);
                                        if (parts.length <= 1)
                                                break;

                                        var date = new Date(parts[0]);
                                        var mins_asleep = parseInt(parts[1], 10);
                                        var mins_awake = parseInt(parts[2], 10);
                                        var num_awakenings = parseInt(parts[3], 10);
                                        var time_in_bed = parseInt(parts[4], 10);
                                        var r = this.add_row(date, 
                                                             new SleepQuality(mins_asleep, 
                                                                              mins_awake, 
                                                                              num_awakenings, 
                                                                              time_in_bed));
                                        i ++;
                                }
                        }
                        i ++;
                }
        }
        
        public construct_from_stream(format: string, stream: string): void
        {
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
                        case "fitbit":
                                this.construct_from_fitbitcsv_stream(stream);
                                break;
                        default:
                                throw Error("Unkown file format: " + format);
                }
        }
        
        public add_row(date: Date, value: IRowValue)
        {
                this.m_pairs.push(new Row(date, value, 1));
                this.m_is_sorted = false;
                return this.m_pairs[this.m_pairs.length - 1];
        }


        
        private find_pairs(pairs: Array<Row>, pair: Row, date_cmp: DateComp): Row
        {
                var l = 0, h = pairs.length - 1;
                while (l <= h) {
                        var m = l + h >> 1;
                        if (date_cmp(pair.date, pairs[m].date))
                                return pairs[m];
                        else if (pair.date.getTime() < pairs[m].date.getTime())
                                h = m - 1;
                        else
                                l = m + 1;
                }
                return null;
        }
        
        public get_row(date: Date): Row
        {
                if (!this.m_is_sorted) {
                        var target_time = date.getTime();
                        for (var i = 0; i < this.m_pairs.length; i ++) {
                                if (this.m_pairs[i].date.getTime() === target_time) {
                                        return this.m_pairs[i];
                                }
                        }
                        return null;
                } else {
                        return this.find_pairs(this.m_pairs, new Row(date, null, 0),
                                                 function(a: Date, b: Date) {
                                                        return a.getTime() === b.getTime();
                                                 });
                }
        }
        
        public get_pairs(): Array<Row>
        {
                return this.m_pairs;
        }
        
        private min_pair(i: number, j: number, op: RowValueOp): Row
        {
                var m = this.m_pairs[i];
                for (var k = i + 1; k <= j; k ++) {
                        if (op.scalar(this.m_pairs[k].value) < op.scalar(m.value))
                                m = this.m_pairs[k];
                }
                return m;
        }
        
        private max_pair(i: number, j: number, op: RowValueOp): Row
        {
                var m = this.m_pairs[i];
                for (var k = i + 1; k <= j; k ++) {
                        if (op.scalar(this.m_pairs[k].value) > op.scalar(m.value))
                                m = this.m_pairs[k];
                }
                return m;
        }
        
        private avg_pair(i: number, j: number, op: RowValueOp): Row
        {
                var sum = this.m_pairs[i].value;
                for (var k = i + 1; k <= j; k ++) {
                        sum = op.add(sum, this.m_pairs[k].value);
                }
                return new Row(this.m_pairs[i].date, op.scale(1/(j - i + 1), sum), 1);
        }
        
        public merge_adjacent_data(strategy: string, date_cmp: DateComp, op: RowValueOp): ValueTable
        {
                var new_table = new ValueTable();
                if (this.m_pairs.length == 0 || strategy == "plain") {
                        new_table.construct_from_pairs(this.m_pairs.slice(0));
                        return new_table;
                }
        
                var last = 0;
                for (var i = 0; i < this.m_pairs.length; i ++) {
                        if (i + 1 == this.m_pairs.length ||
                            !date_cmp(this.m_pairs[i].date, this.m_pairs[i + 1].date)) {
                                var new_spot = new_table.m_pairs.length;
                                switch (strategy) {
                                case "uniform min":
                                        new_table.m_pairs[new_spot] = this.min_pair(last, i, op);
                                        break;
                                case "uniform max":
                                        new_table.m_pairs[new_spot] = this.max_pair(last, i, op);
                                        break;
                                case "uniform average":
                                        new_table.m_pairs[new_spot] = this.avg_pair(last, i, op);
                                        break;
                                case "first":
                                        new_table.m_pairs[new_spot] = this.m_pairs[last];
                                        break;
                                }
                                new_table.m_pairs[new_spot].num_insts = i - last + 1;
                                last = i + 1;
                        }
                }
                new_table.m_is_sorted = this.m_is_sorted;
                return new_table;
        }
        
        public intersect_with(value_table: ValueTable, date_cmp: DateComp, op: RowValueOp, is_return_new: boolean): ValueTable
        {
                var new_table = new ValueTable();
        
                // Find intersection on date. Sort the data first, then apply a series of binary search.
                // O(nlogn) + O(mlogm) + O(MIN(m, n)*log(MAX(m, n))) = O(nlogn).
                if (this.m_is_sorted == false)
                        this.sort_pairs(false, this.m_pairs);
                if (value_table.m_is_sorted == false)
                        value_table.sort_pairs(false, value_table.m_pairs);
        
                if (this.m_pairs.length < value_table.m_pairs.length) {
                        for (var i = 0; i < this.m_pairs.length; i ++) {
                                var other = this.find_pairs(value_table.m_pairs, this.m_pairs[i], date_cmp);
                                if (other !== null) {
                                        var v = op.merge(this.m_pairs[i].value, other.value);
                                        var new_pair = new_table.add_row(other.date, v);
                                        new_pair.num_insts = Math.max(this.m_pairs[i].num_insts, other.num_insts);
                                }
                        }
                } else {
                        for (var i = 0; i < value_table.m_pairs.length; i ++) {
                                var other = this.find_pairs(this.m_pairs, value_table.m_pairs[i], date_cmp);
                                if (other !== null) {
                                        var v = op.merge(value_table.m_pairs[i].value, other.value);
                                        var new_pair = new_table.add_row(other.date, v);
                                        new_pair.num_insts = Math.max(value_table.m_pairs[i].num_insts, other.num_insts);
                                }
                        }
                }
        
                if (is_return_new)
                        return new_table;
                else {
                        this.construct_from_pairs(new_table.get_pairs());
                        new_table = null;
                        return this;
                }
        }

        private sort_pairs(desc: boolean, pairs: Array<Row>): Array<Row>
        {
                if (desc) {
                        pairs.sort(function (x, y) {
                                return y.date.getTime() - x.date.getTime();
                        });
                } else {
                        pairs.sort(function (x, y) {
                                return x.date.getTime() - y.date.getTime();
                        });
                }
                return pairs;
        }
        
        public sort_data(desc: boolean): ValueTable
        {
                var new_pairs = this.sort_pairs(desc, this.m_pairs.slice(0));
        
                var new_table = new ValueTable();
                new_table.construct_from_pairs(new_pairs);
                if (desc === false)
                        new_table.m_is_sorted = true;
                else
                        new_table.m_is_sorted = false;
                return new_table;
        }
        
        public sample(start_date: Date, end_date: Date, num_samples: number): ValueTable
        {
                var pairs = this.m_pairs;
        
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
                new_table.m_is_sorted = this.m_is_sorted;
                return new_table;
        }

        public static recover(pod): ValueTable
        {
                var obj = new ValueTable();
                obj.m_pairs = pod.m_pairs;
                obj.m_is_sorted = pod.m_is_sorted;
                obj.Delimiter = pod.Delimiter;
                obj.LineDelimiter = pod.LineDelimiter;
                return obj;
        }
}

export function value_table_copy(pod): ValueTable
{
        var obj = new ValueTable();
        obj.m_pairs = pod.m_pairs;
        obj.m_is_sorted = pod.m_is_sorted;
        obj.Delimiter = pod.Delimiter;
        obj.LineDelimiter = pod.LineDelimiter;
        return obj;
}
