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
import {Chart} from "./charts.js";
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";
import {G_DataBrowser} from "./databrowser.js";

export function BloodPressureDisplay() {
        this.__identity = null;
        this.__browsing_user = null;
        this.__session = null;

        this.__chart = new Chart();
        this.__local_bptable = null;

        this.set_access_info = function(identity, browsing_user, session) {
                this.__identity = identity
                this.__browsing_user = browsing_user;
                this.__session = session;
        }

        this.set_local_data_from_file_stream = function(file, f_On_Complete) {
                var fr = new FileReader();
                var clazz = this;

                fr.onload = function (e) {
                        var parts = file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        var bptable = new ValueTable();
                        bptable.construct_from_stream(suffix, stream);
                        this.__local_bptable = bptable;

                        f_On_Complete(clazz);
                }
                fr.readAsText(file);
        }

        this.set_local_data_from_remote_server = function(start_date, end_date, num_samples, f_On_Complete) {
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        start_date: start_date,
                        end_date: end_date,
                        num_samples: num_samples, 
                };
                var clazz = this;
                Meteor.call("user_get_patient_bp_table", params, function(error, result) {
                        if (result.error != "") {
                                console.log("failed to obtain bptable from patient: " + JSON.stringify(params));
                        } else {
                                clazz.__local_bptable = ValueTable_create_from_POD(result.bptable);
                                f_On_Complete(clazz);
                        }
                });
        }

        this.clear_local_data = function() {
                this.__local_bptable = null;
        }

        this.render_local_data = function(start_date, end_date, filter, num_samples, target) {
                if (this.__local_bptable)
                        c3.generate(this.__chart.render_blood_pressure(this.__local_bptable, start_date, end_date, num_samples, filter, target));
        }

        this.__upload_to_remote_server = function(bptable) {
                if (bptable == null) return;
                var params = {
                        identity: this.__identity, 
                        session_id: this.__session.get_session_id(), 
                        bptable: bptable
                };
                Meteor.call("patient_super_update_bp_from_table", params, function(error, result) {
                        if (result.error != "") {
                                alert(result.error);
                                console.log("failed to upload bp table: " + JSON.stringify(params));
                        } else {
                                console.log("remote blood pressure data has been updated");
                        }
                });
        }

        this.upload_local_to_remote_server = function() {
                if (this.__local_bptable)
                        this.__upload_to_remote_server(this.__local_bptable);
        }

        this.save_local_to_file_stream = function(file) {
        }
}

Template.tmplbpbrowser.onRendered(function() {
        console.log("bp browser rendered");
        G_DataBrowser.set_charting_area(this.find("#charting-area"));
        G_DataBrowser.update_display();
});
