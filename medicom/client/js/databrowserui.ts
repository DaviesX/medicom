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

/// <reference path="../../tslib/jquery.d.ts" />
/// <reference path="../../tslib/jqueryui.d.ts" />
/// <reference path="../../tslib/lib.es6.d.ts" />

import {DataParams} from "./dataparams.ts";

class UIElement
{
        public label:           string;
        public id:              string;
        public jobject:         JQuery;

        constructor(label: string, id: string)
        {
                this.label = label;
                this.id = id;
        }
};

class SelectGroup
{
        private m_elms:         Array<UIElement>;

        constructor() {}

        public update(holder: JQuery): void
        {
                holder.empty();
                for (var i = 0; i < this.m_elms.length; i ++) {
                        var cur_elm = this.m_elms[i];
                        cur_elm.jobject = holder.append(
                                '<input type="checkbox" id="' + cur_elm.id 
                                + '" value="' + cur_elm.id + '">' 
                                + cur_elm.label + '<br>');
                }
        }

        public add(holder: JQuery, label: string, id: string): void
        {
                this.m_elms.push(new UIElement(label, id));
                this.update(holder);
        }

        public selected(): string[]
        {
                var b = new Array<string>();
                for (var i = 0; i < this.m_elms.length; i ++) {
                        if (this.m_elms[i].jobject.is(":checked"))
                                b.push(this.m_elms[i].label);
                }
                return b;
        }

        public reset(): void
        {
                this.m_elms = [];
        }
};

class DisplayMode
{
        private m_elms:         Array<UIElement>;
        private m_selected:     number;

        constructor() {}

        public update(holder: JQuery): void
        {
                holder.empty();
                for (var i = 0; i < this.m_elms.length; i ++) {
                        var cur_elm = this.m_elms[i];
                        cur_elm.jobject = holder.append('<option id = "' + cur_elm.id 
                                                        + '" value="' + cur_elm.id + '">' 
                                                        + cur_elm.label + '</option>');
                }
        }

        public add(holder: JQuery, label: string, id: string): void
        {
                this.m_elms.push(new UIElement(label, id));
                this.update(holder);
        }

        public current(): string
        {
                for (var i = 0; i < this.m_elms.length; i ++) {
                        if (this.m_elms[i].jobject.is(":selected")) {
                                return this.m_elms[i].label;
                        }
                }
                return null; 
        }

        public reset(): void
        {
                this.m_elms = [];
        }
};

export type OnUIComponentUpdate = (ui: DataBrowserUI, component: string) => void;

/*
 * <UI> Handling DataBrowser UI components.
 */
export class DataBrowserUI 
{
        // On update callback.
        private m_on_update:            OnUIComponentUpdate;
        
        // UI values.
        private m_file:                 File = null;
        private m_start_date:           Date;
        private m_end_date:             Date;
        private m_sample_count:         number;
        private m_expected_dose:        number;
        private m_filter:               string = "plain";

        // UI JQuery Objects.
        private m_jfile_connect:        JQuery = $("#ipt-file-select");
        private m_jfile_disconn:        JQuery = $("#lb-disconnect");
        private m_jfile_path:           JQuery = $("#div-filepath");
        private m_jupload:              JQuery = $("#btn-save-change");
        private m_jstart_date:          JQuery = $("#ipt-start-date");
        private m_jend_date:            JQuery = $("#ipt-end-date");
        private m_jsample_count:        JQuery = $("#ipt-num-samples");
        private m_jexpected_count:      JQuery = $("#ipt-expected-doses");
        private m_jfilter:              JQuery = $("#sel-filter-method");
        private m_jselect_section:      JQuery = $("#div-chart-select");
        private m_jdisplay_modes:       JQuery = $("#sel-chart-types");

        // Dynamic UIs.
        private m_select_groups:        Map<string, SelectGroup>;
        private m_display_modes:        DisplayMode;

        constructor(on_update: OnUIComponentUpdate)
        {
                this.m_on_update = on_update;
                var clazz = this;

                this.m_jfile_path.html("No file is connected");

                this.m_jfile_connect.on("change", function (e: Event) {
                        var files = <Array<File>> clazz.m_jfile_connect.prop("files");
                        if (files == null || files.length == 0)
                                return;
                        var file = files[0];
                        if (file == null)
                                return;
                        clazz.m_jfile_path.html(file.name);
                        clazz.m_file = file;
                        clazz.m_on_update(clazz, "File Select");
                });

                this.m_jfile_disconn.on("click", function(e: Event) {
                        clazz.m_jfile_path.html("No file is connected");
                        clazz.m_jfile_connect.replaceWith(
                                clazz.m_jfile_connect = clazz.m_jfile_connect.clone(true));
                        clazz.m_file = null;
                        clazz.m_on_update(clazz, "File Disconnect");
                });

                this.m_jstart_date.datepicker().on("change", function (e: Event) {
                        clazz.m_start_date = new Date((<HTMLInputElement> e.target).value);
                        clazz.m_on_update(clazz, "Start Date");
                });

                this.m_jend_date.datepicker().on("change", function(e: Event) {
                        clazz.m_end_date = new Date((<HTMLInputElement> e.target).value);
                        clazz.m_on_update(clazz, "End Date");
                });

                this.m_jfilter.on("change", function(e: Event) {
                        clazz.m_filter = (<HTMLInputElement> e.target).value;
                        clazz.m_on_update(clazz, "Filter Type");
                });

                this.m_jsample_count.on("change", function(e: Event) {
                        var val = (<HTMLInputElement> e.target).value;
                        clazz.m_sample_count = val == "" ? null : parseInt(val, 10);
                        clazz.m_on_update(clazz, "Sample Count");
                });

                this.m_expected_dose = parseInt(this.m_jexpected_count.val(), 10);
                this.m_jexpected_count.on("change", function(e: Event) {
                        clazz.m_expected_dose = parseInt((<HTMLInputElement> e.target).value, 10);
                        clazz.m_on_update(clazz, "Expected Dose");
                });
        }

        // The following functions modify UI dynamically.

        public add_to_select_section(group: string, label: string, id: string): void
        {
                var v = this.m_select_groups.get(group);
                if (v == undefined)
                        v = new SelectGroup();
                v.add(this.m_jselect_section, label, id);
                this.m_select_groups.set(group, v);
        }

        public add_display_mode(label: string, id: string): void
        {
                this.m_display_modes.add(this.m_jdisplay_modes, label, id);
        }

        public reset_select_section(): void
        {
                for (var group in this.m_select_groups)
                        this.m_select_groups.get(group).reset();
        }

        public reset_display_mode(): void
        {
                this.m_display_modes.reset();
        }

        // The following functions are used to obtain UI values.

        public selected_options(group: string): string[]
        {
                if (group == null) {
                        var r = new Array<string>();
                        for (var group in this.m_select_groups)
                                r = r.concat(this.m_select_groups.get(group).selected());
                        return r;
                } else {
                        return this.m_select_groups.get(group).selected();
                }
        }

        public display_mode(): string
        {
                return this.m_display_modes.current();
        }

        public file(): File
        {
                return this.m_file;
        }

        public start_date(): Date
        {
                return this.m_start_date;
        }

        public end_date(): Date
        {
                return this.m_end_date;
        }

        public sample_count(): number
        {
                return this.m_sample_count;
        }

        public expected_dose(): number
        {
                return this.m_expected_dose;
        }

        public filter(): string
        {
                return this.m_filter;
        }

        public generate_data_params(): DataParams
        {
                return new DataParams(this.file(), 
                                      this.start_date(), this.end_date(), 
                                      this.sample_count(), this.expected_dose(), this.filter(),
                                      this.selected_options(null));
        }
};

