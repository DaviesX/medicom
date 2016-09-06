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
        protected file:                 File;
        protected start_date:           Date;
        protected end_date:             Date;
        protected sample_count:         number;
        protected expected_dose:        number;
        protected filter:               string; 
        protected chart_select:         string[];
        protected chart:                any;

        constructor(file: File, 
                    start_date: Date, end_date: Date, 
                    sample_count: number, expected_dose: number, filter: string,
                    chart_select: string[],
                    chart: any)
        {
                this.file = file;
                this.start_date = start_date;
                this.end_date = end_date;
                this.sample_count = sample_count;
                this.expected_dose = expected_dose;
                this.filter = filter;
                this.chart_select = chart_select;
                this.chart = chart;
        }
};
