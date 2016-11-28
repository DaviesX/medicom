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
import {Identity} from "../../api/identity";
import {AccountInfo} from "../../api/accountinfo";
import {UserGroupConst} from "../../api/usergroup";
import {Result} from "../../api/result";
import {ErrorMessages} from "../../api/error";
import {SequentialEffect} from "./effects";
import {SessionParams, SessionParamObject} from "./sessionparams";

export type OnUserSelected = (info: AccountInfo) => void;

export class UserBrowser
{
        // Client storage.
        private identity:               Identity = null;
        private users:                  Map<number, AccountInfo> = new Map<number, AccountInfo>();
        private on_user_selected:       OnUserSelected;

        // UIs.
        private juser_panel:            JQuery = $("#user-panel");
        private jadd_user_button:       JQuery = $("#btn-add-user");
        private jadd_user_dialog:       JQuery = $("#div-add-user-dlg");
        private juser_list:             JQuery = $("#div-user-holder");

        // "Add User" dialog.
        private bind_add_user_dialog(): void
        {
                var submit_btn: JQuery = this.jadd_user_dialog.find("button[name='submit']");
                var input_field: JQuery = this.jadd_user_dialog.find("input[name='input-field']");

                if (submit_btn == null) 
                        throw new Error("The dialog doesn't contain a submit button");

                if (input_field == null) 
                        throw new Error("The dialog doesn't contain an input field");


                var clazz: UserBrowser = this;
                var menu_holder: JQuery = $("#ul-search-menu-holder");

                input_field.on("input", function(e: Event) {
                        var input: string = (<HTMLInputElement> (e.target)).value;

                        var params = {
                                identity: clazz.identity,
                                key_word: input,
                                cap: 7,
                        };
                        Meteor.call("search_account_infos", params, function(error, pod) {
                                var result = <Result<Array<AccountInfo>>> Result.recover(pod);
                                if (result.get_result() == null) {
                                        console.log("Failed to search account info");
                                        console.log(result.get_error().toString());
                                } else {
                                        var infos: Array<AccountInfo> = result.get_result();
                                        var html_menu = "";
                                        if (infos.length == 0) {
                                                html_menu += "<div class='emo_central-text'>Nothing matches your input. Please try something else.</div>";
                                        } else {
                                                for (var i = 0; i < infos.length; i ++) {
                                                        html_menu += "<div class='emo_central-text' id='" + infos[i].get_account_id() + "'>" 
                                                        + infos[i].get_account_id() + "(" 
                                                        + infos[i].get_name() + "), " 
                                                        + infos[i].get_email() + "</div>\n";
                                                }
                                        }
                                        // Construct a dropdown menu.
                                        menu_holder.html(html_menu);
                                }
                        });
                });

                submit_btn.click(function() {
                        clazz.jadd_user_dialog.dialog("close");
                        var account_id: number = parseInt(input_field.val(), 10);
                        var email: string = input_field.val();

                        var params = {
                                identity: clazz.identity,
                                id: account_id,
                                email: email
                        };

                        Meteor.call("create_user_association", params, function(error, pod) {
                                var result = <Result<boolean>> Result.recover(pod);
                                if (result.get_result() == true) {
                                        clazz.update_user_list();
                                        alert("User has been added");
                                } else {
                                        alert("Failed to add user: " + result.error);
                                }
                        });
                });
        }

        // Bind "User" on clicked event.
        private bind_on_click(): void
        {
                var clazz: UserBrowser = this;
                var elms: NodeListOf<HTMLElement> = document.getElementsByName("user-list");

                for (var i = 0; i < elms.length; i ++) {
                        elms[i].addEventListener(
                                "click", 
                                function(event: Event) {
                                        var account_id: number = parseInt(event.srcElement.id, 10);
                                        clazz.on_user_selected(clazz.users.get(account_id));
                                }, 
                                false
                        );
                }
        }

        private animate(): void
        {
                var elms: NodeListOf<HTMLElement> = document.getElementsByName("user-list");
                var seq_effect: SequentialEffect = new SequentialEffect("fade", null);

                for (var i = 0; i < elms.length; i ++)
                        seq_effect.add_elm($(elms[i]));

                seq_effect.finalize();
                seq_effect.animate();
        }

        private make_user_button(user_id: number, user_name: string): string
        {
                return '<div><button class="simp_classic-user-button" name="user-list" id="' + user_id + '">' +
                        user_id + '. ' + user_name + '</button></div>';
        }

        private update_user_list(): void
        {
                var clazz: UserBrowser = this;

                var params = {
                        identity: this.identity,
                };

                Meteor.call("get_associated_user_info", params, function(error, pod) {
                        var result = <Result<Array<AccountInfo>>> Result.recover(pod);
                        if (result.get_result() == null) {
                                console.log(result.get_error().toString());
                        } else {
                                var infos: Array<AccountInfo> = result.get_result();

                                clazz.juser_list.empty();
                                for (var i = 0; i < infos.length; i ++) {
                                        var user_id: number = infos[i].get_account_id();
                                        var button_ui: string = clazz.make_user_button(user_id, infos[i].get_name());
                                        clazz.juser_list.append(button_ui);
                                        clazz.users.set(user_id, infos[i]);
                                }
                                clazz.bind_on_click();
                                clazz.animate();
                        }
                });
        }

        private bind_add_user_button(is_enabled: boolean, label: string): void
        {
                if (!is_enabled) {
                        this.jadd_user_button.css("display", "none");
                } else {
                        var clazz: UserBrowser = this;
                        this.jadd_user_button.css("display", "inline");
                        this.jadd_user_button.html(label);
                        this.jadd_user_button.on("click", function () {
                                clazz.jadd_user_dialog.dialog({
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

        constructor(identity: Identity, on_user_selected: OnUserSelected)
        {
                this.juser_panel.fadeOut(0);
                this.juser_panel.fadeIn(800);

                this.identity = identity;
                this.on_user_selected = on_user_selected;

                this.bind_add_user_dialog();

                var user_group: number = identity.get_account_record().user_group();
                if (user_group == UserGroupConst.Provider ||
                    user_group == UserGroupConst.Assistant)
                        this.bind_add_user_button(true, "Add Patient");
                else
                        this.bind_add_user_button(false, null);

                this.update_user_list();
        }
};

export declare var on_user_selected: OnUserSelected;

// Main
Template["tmpluserbrowser"].onRendered(function () {
        console.log("user browser template rendered");

        var identity = <Identity> SessionParams.get_params().obtain(SessionParamObject.Identity);
        new UserBrowser(identity, on_user_selected);
});
