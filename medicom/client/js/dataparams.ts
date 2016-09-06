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

export class DataParams
{
        public file:                 File;
        public filepath:             string;
        public start_date:           Date;
        public end_date:             Date;
        public sample_count:         number;
        public expected_dose:        number;
        public filter:               string; 
        public chart_select:         string[];
        public chart:                any;

        constructor(file: File, filepath: string,
                    start_date: Date, end_date: Date, 
                    sample_count: number, expected_dose: number, filter: string,
                    chart_select: string[],
                    chart: any)
        {
                this.file = file;
                this.filepath = filepath;
                this.start_date = start_date;
                this.end_date = end_date;
                this.sample_count = sample_count;
                this.expected_dose = expected_dose;
                this.filter = filter;
                this.chart_select = chart_select;
                this.chart = chart;
        }
};
