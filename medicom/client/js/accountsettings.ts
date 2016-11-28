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
import {SessionParams, SessionParamObject} from "./sessionparams";

enum ProfileState
{
        ProfileSettings,
        SessionSettings
};

export class AccountSettings
{
        private jprofile_button:        JQuery = $("#btn-profile");
        private jsession_button:        JQuery = $("#btn-session");

        constructor()
        {
                this.jprofile_button.on("click", function(e: Event) {
                        SessionParams.get_params().store(SessionParamObject.ProfileState, ProfileState.ProfileSettings);
                });
                this.jsession_button.on("click", function(e: Event) {
                        SessionParams.get_params().store(SessionParamObject.ProfileState, ProfileState.SessionSettings);
                });
        }
};


Template["tmplaccountsettings"].onRendered(function () {
        console.log("Account settings rendered");
        SessionParams.get_params().store(SessionParamObject.ProfileState, ProfileState.ProfileSettings);
        new AccountSettings();
});

Template["tmplaccountsettings"].helpers({
        show_profile_settings() {
                return SessionParams.get_params().obtain(SessionParamObject.ProfileState) == ProfileState.ProfileSettings;
        },

        show_session_settings() {
                return SessionParams.get_params().obtain(SessionParamObject.ProfileState) == ProfileState.SessionSettings;
        },
});
