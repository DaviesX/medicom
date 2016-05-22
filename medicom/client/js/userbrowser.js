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
import {Template} from "meteor/templating";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import {SequentialEffect} from "./effects.js";
import {G_Session} from "./session.js";


export function UserBrowser() {
        this.__identity = null;
        this.__on_update = null;
        this.__on_select = null;
        this.__on_add_user = null;
        this.__user_list_holder = null;
        this.__add_user_button = null;
        this.__add_user_dialog = null;
        
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

        this.__animate_effect = function() {
                var elms = document.getElementsByName("user-list");
                var seq_effect = new SequentialEffect("fade");
                for (var i = 0; i < elms.length; i ++) {
                        seq_effect.add_elm($(elms[i]));
                }
                seq_effect.finalize();
                seq_effect.animate();
        }

        this.__make_user_ui = function(user_id, user_name) {
                return '<div><button class="simp_classic-user-button" name="user-list" id="' + user_id + '">' + 
                        user_id + '. ' + user_name + '</button></div>';
        }
        
        this.register_on_update = function(call, params) {
                this.__on_update = {call: call, params: params};
        }
        
        this.register_on_add_user = function(call, params) {
                this.__on_add_user = {call: call, params: params};
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
        
        this.set_add_user_button = function(holder) {
                this.__add_user_button = holder;
        }
        
        this.set_add_user_dialog = function(holder) {
                this.__add_user_dialog = holder;
                var submit_btn = this.__add_user_dialog.find("button[name='submit']");
                var input_field = this.__add_user_dialog.find("input[name='input-field']");
                if (submit_btn == null) throw "The dialog doesn't contain a submit button";
                if (input_field == null) throw "The dialog doesn't contain an input field";
                
                var clazz = this;
                submit_btn.click(function() {
                        clazz.__add_user_dialog.dialog("close");
                        var account_id = parseInt(input_field.val(), 10);
                        var email = input_field.val();
                        
                        clazz.__on_add_user.params.identity = clazz.__identity;
                        clazz.__on_add_user.params.id = account_id;
                        clazz.__on_add_user.params.email = email;

                        Meteor.call(clazz.__on_add_user.call, clazz.__on_add_user.params, function(error, result) {
                                if (result.error != "") {
                                        alert("Failed to add user: " + result.error);             
                                } else {
                                        clazz.update_user_list();
                                        alert("User has been added");
                                }
                        }); 
                });
        }
        
        this.enable_add_user = function(to_enable, prompt) {
                if (!to_enable) {
                        this.__add_user_button.css("display", "none");
                } else {
                        var clazz = this;
                        this.__add_user_button.css("display", "inline");
                        this.__add_user_button.html(prompt);
                        this.__add_user_button.click(function () {
                                clazz.__add_user_dialog.dialog();
                                clazz.__add_user_dialog.css("display", "inline");
                        });
                }
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
                                clazz.__animate_effect();
                        }
                });
        }
        
        this.get_selected_user = function() {
                return this.__users[this.__selected_user_id];
        }
}

export var G_UserBrowser = new UserBrowser();


// Main
Template.tmpluserbrowser.onRendered(function () {
        console.log("user browser template rendered");

        $("#user-panel").fadeOut(0);
        $("#user-panel").fadeIn(800);
        
        G_UserBrowser.set_user_list_holder($("#div-user-holder"));
        G_UserBrowser.set_add_user_button($("#btn-add-user"));
        G_UserBrowser.set_add_user_dialog($("#div-add-user-dlg"));
});
