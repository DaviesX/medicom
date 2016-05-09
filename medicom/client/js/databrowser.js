import {Template} from "meteor/templating";

export function DataBrowser() {
        this.__session = null;
        this.__display_types = ["Smart Display Mode",
                                "Blood Pressure Data", 
                                "Symptoms Data", 
                                "Pill Bottle Cap", 
                                "Fitbit Data", 
                                "Blood Pressure[Local Data]"];
        this.__display_type_holder = null;
        
        this.set_target_session = function(session) {
                this.__session = session;
        }
        
        this.get_target_session = function() {
                return this.__session;
        }
        
        this.set_display_type_holder = function(holder) {
                this.__display_type_holder = holder;
                
                var types = this.__display_types;
                holder.empty();
                for (var i = 0; i < types.length; i ++) {
                        holder.append('<option value="' + types[i] + '">' + types[i] + '</option>');
                }
        } 
        
        this.set_data_display = function(display_type) {
        }
        
        this.get_data_displays = function() {
                return this.__display_types;
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
