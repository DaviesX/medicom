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
import {G_Session} from "./session.js";

export function AccountSettings()
{
}

AccountSettings.prototype.init_holders = function()
{
        $("#btn-profile").on("click", function(e) {
                G_Session.set_account_settings_mode("show profile settings");
        });

        $("#btn-session").on("click", function(e) {
                G_Session.set_account_settings_mode("show session settings");
        });
}

export const G_AccountSettings = new AccountSettings();


Template.tmplaccountsettings.onRendered(function () {
        console.log("Account settings rendered");
        G_AccountSettings.init_holders();
        G_Session.set_account_settings_mode("show profile settings");
});

Template.tmplaccountsettings.helpers({
        show_profile_settings() {
                return G_Session.get_account_settings_mode() == "show profile settings";
        },

        show_session_settings() {
                return G_Session.get_account_settings_mode() == "show session settings";
        },
});
