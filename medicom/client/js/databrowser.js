import {Template} from "meteor/templating";

export function DataBrowser() {
        this.__session = null;
        
        this.set_target_session = function(session) {
                this.__session = session;
        }
        
        this.get_target_session = function() {
                return this.__session;
        }
}

export var G_DataBrowser = new DataBrowser();

Template.tmpldatabrowser.helpers({
        session_id() {
                var selected = G_DataBrowser.get_target_session();
                return selected.get_start_date() + " - " + selected.get_session_id();
        }
});
