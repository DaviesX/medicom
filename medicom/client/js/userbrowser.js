import {Template} from "meteor/templating";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import {G_Session} from "./session.js";


export function UserBrowser() {
        this.__identity = null;
        this.__on_update = null;
        this.__on_select = null;
        this.__user_list_holder = null;
        
        this.__users = [];
        this.__selected_user_id = -1;
        
        this.__register_on_click = function() {
                var elms = document.getElementsByName("user-list");
                for (var i = 0; i < elms.length; i ++) {
                        var clazz = this;
                        elms[i].addEventListener("click", function(event) {
                                var account_id = parseInt((event.target || event.srcElement).id, 10);
                                clazz.__selected_user_id = account_id;
                                clazz.__on_select(clazz);
                        }, false);
                }
        }

        this.__make_user_ui = function(user_id, user_name) {
                return '<div><button class="simp_classic-fill-width" name="user-list" id="' + user_id + '">' + 
                        user_id + '. ' + user_name + '</button></div>';
        }
        
        this.register_on_update = function(call, params) {
                this.__on_update = {call: call, params: params};
        }
        
        this.set_browser_on_select = function(callback) {
                this.__on_select = callback;
        }
        
        this.set_identity = function(identity) {
                this.__identity = identity;
        }
        
        this.set_user_list_holder = function(holder) {
                this.__user_list_holder = holder;
        }

        this.update_user_list = function() {
                var clazz = this;
                this.__on_update.params.identity = this.__identity;
                this.__on_update.params.id = this.__selected_user_id;
                
                Meteor.call(this.__on_update.call, this.__on_update.params, function(error, result) {
                        if (result.error != "") {
                                console.log(result.error);
                        } else {
                                clazz.__user_list_holder.empty();
                                for (var i = 0; i < result.patient_ids.length; i ++) {
                                        var user_id = result.patient_ids[i];
                                        var account_info = AccountInfo_Create_From_POD(result.account_infos[i]);
                                        var ui = clazz.__make_user_ui(user_id, account_info.get_name());
                                        clazz.__user_list_holder.append(ui);
                                        clazz.__users[user_id] = account_info;
                                }
                                clazz.__register_on_click();
                        }
                });
        }
        
        this.get_selected_user = function() {
                return this.__users[this.__selected_user_id];
        }
}

export var G_UserBrowser = new UserBrowser();


// Add user button
Template.tmpluserbrowser.events({"click #btn-add-user"(event) {
        $("#div-add-user-dlg").dialog();
        $("#div-add-user-dlg").css("visibility", "visible");
}});

// Add user form
Template.tmpladduser2browser.events({"click #btn_confirm-add-user"(event) {
        $("#div-add-patient-dlg").dialog("close");
        var identity = G_Session.get_identity_info();
        var account_id = parseInt($("#txb-id-email").val(), 10);
        var form_content = {
                identity: identity,
                id: account_id,
                email: $("#txb-id-email").val()
        };
        console.log(form_content);
        Meteor.call("provider_add_patient_by_id", form_content, function(error, result) {
                if (result.error != "") {
                        alert("Failed to add patient: " + result.error);             
                } else {
                        ui_refresh_patient_list($("#div-user-holder"), identity);
                        alert("User has been added");
                }
        });        
}});

// Main
Template.tmpluserbrowser.onRendered(function () {
        console.log("user browser template rendered");
        
        G_UserBrowser.set_user_list_holder($("#div-user-holder"));
});
