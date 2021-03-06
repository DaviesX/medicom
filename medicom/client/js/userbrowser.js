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


export function UserBrowser()
{
        this.__identity = null;
        this.__on_update = null;
        this.__on_select = null;
        this.__on_add_user = null;
        this.__user_list_holder = null;
        this.__add_user_button = null;
        this.__add_user_dialog = null;

        this.__users = [];
        this.__selected_user_id = -1;
}


UserBrowser.prototype.__register_on_click = function()
{
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

UserBrowser.prototype.__animate_effect = function()
{
        var elms = document.getElementsByName("user-list");
        var seq_effect = new SequentialEffect("fade");
        for (var i = 0; i < elms.length; i ++) {
                seq_effect.add_elm($(elms[i]));
        }
        seq_effect.finalize();
        seq_effect.animate();
}

UserBrowser.prototype.__make_user_ui = function(user_id, user_name)
{
        return '<div><button class="simp_classic-user-button" name="user-list" id="' + user_id + '">' +
               user_id + '. ' + user_name + '</button></div>';
}

UserBrowser.prototype.register_on_update = function(call, params)
{
        this.__on_update = {call: call, params: params};
}

UserBrowser.prototype.register_on_add_user = function(call, params)
{
        this.__on_add_user = {call: call, params: params};
}

UserBrowser.prototype.set_browser_on_select = function(callback)
{
        this.__on_select = callback;
}

UserBrowser.prototype.set_identity = function(identity)
{
        this.__identity = identity;
}

UserBrowser.prototype.set_user_list_holder = function(holder)
{
        this.__user_list_holder = holder;
}

UserBrowser.prototype.set_add_user_button = function(holder)
{
        this.__add_user_button = holder;
}

UserBrowser.prototype.set_add_user_dialog = function(holder)
{
        this.__add_user_dialog = holder;
        var submit_btn = this.__add_user_dialog.find("button[name='submit']");
        var input_field = this.__add_user_dialog.find("input[name='input-field']");
        if (submit_btn == null) throw new Error("The dialog doesn't contain a submit button");
        if (input_field == null) throw new Error("The dialog doesn't contain an input field");

        var clazz = this;
        var menu_holder = $("#ul-search-menu-holder");

        input_field.on("input", function(e) {
                var input = e.target.value;

                var params = {
                        identity: clazz.__identity,
                        key_word: input,
                        cap: 7,
                };
                Meteor.call("search_account_infos", params, function(error, result) {
                        if (result.error != "") {
                                console.log("Failed to search account info");
                                console.log(result.error);
                        } else {
                                var infos = result.account_infos;
                                var html_menu = "";
                                if (infos.length == 0) {
                                        html_menu += "<div class='emo_central-text'>Nothing matches your input. Please try something else.</div>";
                                } else {
                                        for (var i = 0; i < infos.length; i ++) {
                                                var info = AccountInfo_Create_From_POD(infos[i]);
                                                html_menu += "<div class='emo_central-text' id='" + info.get_account_id() + "'>" 
                                                          + info.get_account_id() + "(" 
                                                          + info.get_name() + "), " 
                                                          + info.get_email() + "</div>\n";
                                        }
                                }
                                // Construct a dropdown menu.
                                menu_holder.html(html_menu);
                        }
                });
        });

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

UserBrowser.prototype.enable_add_user = function(to_enable, prompt)
{
        if (!to_enable) {
                this.__add_user_button.css("display", "none");
        } else {
                var clazz = this;
                this.__add_user_button.css("display", "inline");
                this.__add_user_button.html(prompt);
                this.__add_user_button.click(function () {
                        clazz.__add_user_dialog.dialog({
                                autoOpen: true,
                                modal: true,
                                width: 600,
                                open: function()
                                {
                                        $(".ui-widget-overlay").addClass("simp_dialog_overlay");
                                        $(".ui-dialog-titlebar").css("display", "none");
                                },
                                show: {
                                        effect: "fade",
                                        duration: 1000,
                                },
                                hide: {
                                        effect: "fade",
                                        duration: 1000,
                                },
                                close: function()
                                {
                                },
                        });
                });
        }
}

UserBrowser.prototype.update_user_list = function()
{
        var clazz = this;
        this.__on_update.params.identity = this.__identity;
        this.__on_update.params.id = this.__selected_user_id;

        Meteor.call(this.__on_update.call, this.__on_update.params, function(error, result) {
                if (result.error != "") {
                        console.log(result.error);
                } else {
                        clazz.__user_list_holder.empty();
                        for (var i = 0; i < result.account_infos.length; i ++) {
                                var account_info = AccountInfo_Create_From_POD(result.account_infos[i]);
                                var user_id = account_info.get_account_id();
                                var ui = clazz.__make_user_ui(user_id, account_info.get_name());
                                clazz.__user_list_holder.append(ui);
                                clazz.__users[user_id] = account_info;
                        }
                        clazz.__register_on_click();
                        clazz.__animate_effect();
                }
        });
}

UserBrowser.prototype.get_selected_user = function()
{
        return this.__users[this.__selected_user_id];
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
