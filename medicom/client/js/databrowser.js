import {Template} from "meteor/templating";
import {BPTable} from "../../api/bptable.js";


function LocalBloodPressureDisplay() {
        this.__bptable = new BPTable();
        this.__file = null;

        this.__update_data_from_file_stream = function() {
                var fr = new FileReader();
                var clazz = this;

                fr.onload = function (e) {
                        var parts = clazz.__file.name.split(".");
                        var suffix = parts[parts.length - 1];
                        var stream = e.target.result;

                        console.log("file content: " + stream.toString());
                        clazz.__bptable.construct_from_stream(suffix, stream);
                }
                fr.readAsText(this.__file);
        }
        
        this.set_data_from_bp_file_stream = function(file) {
                this.__file = file;
                this.__update_data_from_file_stream();
        }

        this.update = function(start_date, end_date, target) {
                var x = ['x'];
                var y = ['blood pressure'];

                var dates = this.__bptable.get_dates();
                var values = this.__bptable.get_bp_values();

                for (var i = 1; i < values.length + 1; i ++) {
                        x[i] = dates[i - 1];
                        y[i] = values[i - 1];
                }
                
                var chart = c3.generate({
                        bindto: target,
                        data: {
                                x: 'x',
                                columns: [x, y]
                        },
                        axis: {
                                x: {
                                        type: 'timeseries',
                                        tick: {
                                                format: '%Y-%m-%d'
                                        }
                                }
                        }
                });
        
//                this.autorun(function (tracker) {
//                        chart.load();
//                });
        }
}

function RemoteBloodPressureDisplay() {

        this.__update = function(start_date, end_date) {
        }
}

function SymptomsDisplay() {

        this.update = function(start_date, end_date) {
        }
}

export function DataBrowser() {
        this.__browsing_user = null;
        this.__session = null;
        this.__display_types = ["Smart Display Mode",
                                "Blood Pressure Data", 
                                "Symptoms Data", 
                                "Pill Bottle Cap", 
                                "Fitbit Data", 
                                "Blood Pressure[Local Data]"];

        this.__curr_display_mode = this.__display_types[0];
        this.__display_type_holder = null;
        this.__file_select_holder = null;
        this.__charting_area = null;

        this.__start_date = null;
        this.__end_date = null;
        
        this.__local_bp_display = new LocalBloodPressureDisplay();
        this.__remote_bp_display = new RemoteBloodPressureDisplay();
        this.__symp_display = new SymptomsDisplay();

        this.set_target_session = function(session, user_info) {
                this.__session = session;
                this.__browsing_user = user_info;
        }
        
        this.get_target_session = function() {
                return this.__session;
        }

        this.get_browsing_user = function() {
                return this.__browsing_user;
        }

        this.set_file_select_holder = function(holder) {
                this.__file_select_holder = holder;
                var clazz = this;

                holder.on("change", function (event) {
                        var file = clazz.connect_to_bp_file();
                        if (file == null) 
                                return;
                        clazz.__local_bp_display.set_data_from_bp_file_stream(file);
                        clazz.update_display();
                });
        }
        
        this.set_display_type_holder = function(holder) {
                var clazz = this;

                this.__display_type_holder = holder;
                var types = this.__display_types;
                holder.empty();
                for (var i = 0; i < types.length; i ++) {
                        holder.append('<option value="' + types[i] + '">' + types[i] + '</option>');
                }
        } 

        this.set_charting_area = function(holder) {
                this.__charting_area = holder;
        }
        
        this.set_display_mode = function(display_mode) {
                this.__curr_display_mode = display_mode;
        }

        this.get_current_display_mode = function() {
                return this.__curr_display_mode;
        }

        this.get_data_displays = function() {
                return this.__display_types;
        }

        this.connect_to_bp_file = function() {
                var files = this.__file_select_holder.prop("files");
                if (files == null || files.length == 0) 
                        return null;
                else
                        return files[0];
        }

        this.update_display = function(display_mode) {
                if (display_mode == null) display_mode = this.get_current_display_mode();
                else this.set_display_mode(display_mode);

                switch (display_mode) {
                case "Smart Display Mode":
                        break;
                case "Blood Pressure Data": 
                        this.__remote_bp_display.update(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Symptoms Data": 
                        this.__symp_display.update(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                case "Pill Bottle Cap": 
                        break;
                case "Fitbit Data": 
                        break;
                case "Blood Pressure[Local Data]":
                        this.__local_bp_display.update(this.__start_date, this.__end_date, this.__charting_area);
                        break;
                default:
                        throw "unkown display mode: " + display_mode;
                }
        }
}

export var G_DataBrowser = new DataBrowser();

Template.tmpldatabrowser.onRendered(function () {        
        G_DataBrowser.set_display_type_holder($("#sel-chart-types"));
        G_DataBrowser.set_charting_area(this.find("#charting-area"));
        G_DataBrowser.set_file_select_holder($("#ipt-file-select"));
});

Template.tmpldatabrowser.helpers({
        session_id() {
                var selected = G_DataBrowser.get_target_session();
                var user = G_DataBrowser.get_browsing_user();
                return user.get_name() + ", " + user.get_account_id() + " - " + selected.get_start_date() + " - " + selected.get_session_id();
        }
});

Template.tmpldatabrowser.events({"click #sel-chart-types"(event) {
        G_DataBrowser.update_display($(event.target).val());
}});
