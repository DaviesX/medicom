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
import {ErrorMessageQueue} from "../../api/common.js";
import {UserGroup} from "../../api/usergroup.js";
import {Patient_Create_From_POD} from "../../api/patient.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import {MedicalSession_Create_From_POD} from "../../api/medicalsession.js";
import {G_Session} from "./session.js";
import {G_SessionBrowser} from "./sessionbrowser.js";
import {G_UserBrowser} from "./userbrowser.js";
import {G_DataBrowser} from "./databrowser.js";
import {G_ActivityCenter} from "./activitycenter.js";

var G_AccountType = new UserGroup();


function user_browser_on_select(obj) {
        var account_id = obj.get_selected_user().get_account_id();
        G_SessionBrowser.set_browsing_account_id(account_id);
        G_SessionBrowser.update_user();
        G_SessionBrowser.update_session_list();
        G_Session.set_browsing_mode("session browser");
}

function session_browser_on_quit(obj) {
        G_DataBrowser.set_target_session(obj.get_selected_session(), obj.get_browsing_account_info(), G_Session.get_identity_info());
        G_Session.set_browsing_mode("data browser");
}

// Main
Template.tmplprovider.onRendered(function () {
        console.log("provider template rendered");

        var identity = G_Session.get_identity_info();
        var user_group = G_AccountType.get_string_from_user_group(identity.get_account_record().user_group());
        if (identity == null || user_group != "provider") {
                G_ActivityCenter.print_error_text("You don't have the permission to visit this page");
        } else {
                // Set up activity center.
                G_ActivityCenter.set_redirection_path("/account-settings");
                G_ActivityCenter.set_identity(identity);
                G_ActivityCenter.update_welcome_text();
                // Set up user browser.
                G_UserBrowser.enable_add_user(true, "Add Patient");
                G_UserBrowser.register_on_update("provider_get_patient_ids", {});
                G_UserBrowser.register_on_add_user("provider_add_patient_by_id", {});
                G_UserBrowser.set_browser_on_select(user_browser_on_select);
                G_UserBrowser.set_identity(identity);
                G_UserBrowser.update_user_list();
                // Set up session browser.
                G_SessionBrowser.register_on_update_session("provider_get_sessions_by_patient_id", {});
                G_SessionBrowser.register_on_start_new_session("provider_start_new_session_with", {});
                G_SessionBrowser.register_on_end_session("provider_end_session", {});
                G_SessionBrowser.register_on_recover_session("provider_recover_session", {});
                G_SessionBrowser.set_browser_on_quit(session_browser_on_quit);
                G_SessionBrowser.set_identity(identity);
                // Set up data browser.
        }
        G_Session.set_browsing_mode("default browser");
});

