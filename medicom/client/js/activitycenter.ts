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
import {Result} from "../../api/result";
import {SessionParams, SessionParamObject} from "./sessionparams";


export enum BrowsingState
{
        Default,
        SessionBrowser,
        DataBrowser
};


export class ActivityCenter
{
        // Client storage.
        private identity:               Identity;

        // UIs.
        private jwelcome_label:         JQuery = $("#a-welcome-holder");
        private jlogout_link:           JQuery = $("#a-logout");
        private redirect_path:          string;

        private bind_logout_handler(): void
        {
                var clazz = this;

                this.jlogout_link.on("click", 
                        function (event: Event) {
                                Meteor.call("logout", {identity: clazz.identity},
                                        function(error, pod) {
                                                var result = <Result<boolean>> Result.recover(pod);
                                                if (result.get_result() == true) {
                                                        clazz.jwelcome_label.attr("href", "");
                                                        document.location.reload(true);
                                                } else {
                                                        alert(result.get_error().toString());
                                                }
                                        }
                                );
                        }
                );
        }

        private print_error_text(error_text: string): void
        {
                this.jwelcome_label.html(error_text);
        }

        public update_welcome_text(): void
        {
                if (this.identity == null) {
                        this.print_error_text("You haven't login yet");
                        return;
                }

                var account_id: number = this.identity.get_account_record().get_account_id();
                var clazz: ActivityCenter = this;

                var params = {
                        identity: this.identity, 
                        id: account_id
                };

                Meteor.call("get_account_info_by_id", params, function(error, pod) {
                        var result = <Result<AccountInfo>> Result.recover(pod);
                        if (result.get_result() == null) {
                                clazz.jwelcome_label.html("error: " + result.get_error().toString());
                        } else {
                                var info: AccountInfo = result.get_result();
                                clazz.jwelcome_label.html("Welcome, " + info.get_name());
                                clazz.jwelcome_label.attr("href", clazz.redirect_path);
                                clazz.jlogout_link.css("display", "inline");
                        }
                });
        }

        constructor(identity: Identity)
        {
                this.identity = identity;

                this.bind_logout_handler();
                this.update_welcome_text();
        }

        public set_redirection_path(path: string): void
        {
                this.redirect_path = path;
        }

        public static open(state: BrowsingState): void
        {
                SessionParams.get_params().store(SessionParamObject.BrowsingState, state);
        }
};


Template["tmplactivitycenter"].onRendered(function () {
        console.log("activity center template rendered");

        var identity = <Identity> SessionParams.get_params().obtain(SessionParamObject.Identity);
        new ActivityCenter(identity);
});

Template["tmplactivitycenter"].helpers({
        use_default() {
                return SessionParams.get_params().obtain(SessionParamObject.BrowsingState) == BrowsingState.Default
        },

        use_session_browser() {
                return SessionParams.get_params().obtain(SessionParamObject.BrowsingState) == BrowsingState.SessionBrowser
        },

        use_data_browser() {
                return SessionParams.get_params().obtain(SessionParamObject.BrowsingState) == BrowsingState.DataBrowser
        }
});
