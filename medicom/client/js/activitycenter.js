import {Template} from "meteor/templating";
import {G_Session} from "./session.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";

export function ActivityCenter() {
        this.__identity = null;
        this.__welcome_holder = null;
        this.__redir_path = null;
        
        this.set_welcome_text_holder = function(holder) {
                this.__welcome_holder = holder;
        }
        
        this.set_identity = function(identity) {
                this.__identity = identity;
        }
        
        this.set_redirection_path = function(path) {
                this.__redir_path = path;
                this.__welcome_holder.attr("href", path);
        }
        
        this.update_welcome_text = function() {
                if (this.__identity == null) {
                        this.__welcome_holder.html("You haven't login yet");
                        return;
                }
        
                var account_id = this.__identity.get_account_record().get_account_id();
                var clazz = this;
                
                Meteor.call("user_account_info_by_id", 
                            {identity: this.__identity, id: account_id}, function(error, result) {
                        if (result.error != "") {
                                clazz.__welcome_holder.html("error: " + result.error);
                        } else {
                                var account_info = AccountInfo_Create_From_POD(result.account_info);
                                clazz.__welcome_holder.html("Welcome, " + account_info.get_name());
                        }
                });
        }
        
        this.print_error_text = function(error_text) {
                this.__welcome_holder.html(error_text);
        }
}

export var G_ActivityCenter = new ActivityCenter();


Template.tmplactivitycenter.onRendered(function () {
        console.log("activity center template rendered");
        G_ActivityCenter.set_welcome_text_holder($("#a-welcome-holder"));
});

Template.tmplactivitycenter.helpers({ 
        use_default() {
                return G_Session.get_browsing_mode() == "default browser";
        },
        
        use_session_browser() {
                return G_Session.get_browsing_mode() == "session browser";
        },
        
        use_data_browser() {
                return G_Session.get_browsing_mode() == "data browser";
        }
});
