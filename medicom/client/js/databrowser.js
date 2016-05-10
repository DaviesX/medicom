import {Template} from "meteor/templating";


function LocalBloodPressureDisplay() {
        this.__bptable = new BPTable();

        this.__set_bp_file_stream = function(file) {
                var suffix = file.name.split(".");
                this.__bptable.construct_from_stream(suffix, file);
        }

        this.__update = function(start_date, end_date, target) {
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
        
        this.autorun(function (tracker) {
                chart.load();
        });
                c3.
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
        this.__session = null;
        this.__display_types = ["Smart Display Mode",
                                "Blood Pressure Data", 
                                "Symptoms Data", 
                                "Pill Bottle Cap", 
                                "Fitbit Data", 
                                "Blood Pressure[Local Data]"];

        this.__display_type_holder = null;
        this.__curr_display = null;
        this.__start_date = null;
        this.__end_date = null;
        
        this.__local_bp_display = new LocalBloodPressureDisplay();
        this.__remote_bp_display = new RemoteBloodPressureDisplay();
        this.__symp_display = new SymptomsDisplay();

        this.set_target_session = function(session) {
                this.__session = session;
        }
        
        this.get_target_session = function() {
                return this.__session;
        }
        
        this.set_display_type_holder = function(holder) {
                var clazz = this;

                this.__display_type_holder = holder;
                var types = this.__display_types;
                holder.empty();
                for (var i = 0; i < types.length; i ++) {
                        holder.append('<option value="' + types[i] + '">' + types[i] + '</option>');
                }
                holder.click(function () {
                        clazz.set_display_mode(holder.val());
                });
        } 
        
        this.set_display_mode = function(mode) {
                this.__curr_display = mode;
        }
        
        this.get_data_displays = function() {
                return this.__display_types;
        }

        this.update_display = function() {
                switch (this.__curr_display) {
                case "Smart Display Mode":
                        break;
                case "Blood Pressure Data": 
                        this.__remote_bp_display.update(
                                        this.__start_date, this.__end_date);
                        break;
                case "Symptoms Data": 
                        this.__symp_display.update(
                                        this.__start_date, this.__end_date);
                        break;
                case "Pill Bottle Cap": 
                        break;
                case "Fitbit Data": 
                        break;
                case "Blood Pressure[Local Data]":
                        this.__local_bp_display.update(
                                        this.__start_date, this.__end_date);
                        break;
                default:
                        throw "unkown display type: " + this.__curr_display;
                }
        }
}

export var G_DataBrowser = new DataBrowser();

Template.tmpldatabrowser.onRendered(function () {        
        G_DataBrowser.set_display_type_holder($("#sel-chart-types"));

        var chart = c3.generate({
                bindto: this.find("#charting-area"),
                data: {
                        x: 'x',
                        columns: [
                                ['x', "2014-10-13", "2014-10-14", "2014-10-15", "2014-10-16", "2014-10-17", "2014-10-18", "2014-10-19"],
                                ['blood pressure', 120, 100, 98, 100, 130, 100]
                        ]
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
        
        this.autorun(function (tracker) {
                chart.load();
        });
});

Template.tmpldatabrowser.helpers({
        session_id() {
                var selected = G_DataBrowser.get_target_session();
                return selected.get_start_date() + " - " + selected.get_session_id();
        }
});
