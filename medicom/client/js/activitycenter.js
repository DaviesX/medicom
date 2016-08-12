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
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";

export function ActivityCenter() {
        this.__identity = null;
        this.__welcome_holder = null;
        this.__logout_holder = null;
        this.__redir_path = null;
}

ActivityCenter.prototype.set_welcome_text_holder = function(holder)
{
        this.__welcome_holder = holder;
}

ActivityCenter.prototype.set_logout_text_holder = function(holder)
{
        this.__logout_holder = holder;
        var clazz = this;

        holder.click(function (event) {
                        Meteor.call("logout", {identity: clazz.__identity},
                                        function(error, result) {
                                        if (result.error != "") {
                                        alert(result.error);
                                        }
                                        clazz.__welcome_holder.attr("href", "");
                                        document.location.reload(true);
                                        });
                        });
}

ActivityCenter.prototype.set_identity = function(identity)
{
        this.__identity = identity;
}

ActivityCenter.prototype.set_redirection_path = function(path)
{
        this.__redir_path = path;
}

ActivityCenter.prototype.update_welcome_text = function()
{
        if (this.__identity == null) {
                this.__welcome_holder.html("You haven't login yet");
                return;
        }

        var account_id = this.__identity.get_account_record().get_account_id();
        var clazz = this;

        Meteor.call("get_account_info_by_id",
                        {identity: this.__identity, id: account_id}, function(error, result) {
                        if (result.error != "") {
                        clazz.__welcome_holder.html("error: " + result.error);
                        } else {
                        if (result.account_info == null) {
                        clazz.__welcome_holder.html("Failed to obtain your account info");
                        } else {
                        var account_info = AccountInfo_Create_From_POD(result.account_info);
                        clazz.__welcome_holder.html("Welcome, " + account_info.get_name());
                        clazz.__welcome_holder.attr("href", clazz.__redir_path);
                        clazz.__logout_holder.css("display", "inline");
                        }
                        }
                        });
}

ActivityCenter.prototype.print_error_text = function(error_text)
{
        this.__welcome_holder.html(error_text);
}

export var G_ActivityCenter = new ActivityCenter();


Template.tmplactivitycenter.onRendered(function () {
        console.log("activity center template rendered");
        G_ActivityCenter.set_welcome_text_holder($("#a-welcome-holder"));
        G_ActivityCenter.set_logout_text_holder($("#a-logout"));
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
