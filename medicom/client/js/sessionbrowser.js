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
import {MedicalSession_Create_From_POD} from "../../api/medicalsession.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import {SequentialEffect} from "./effects.js";
import {G_Session} from "./session.js";


export var G_SessionBrowser = new SessionBrowser();

export function SessionBrowser()
{
        this.__identity = null;
        this.__account_id = null;
        this.__acount_info = null;
        this.__sessions = [];
        this.__selected_session_id = -1;
        this.__session_holder = null;
        this.__username_holder = null;
        this.__on_start_new = null;
        this.__on_end = null;
        this.__on_recover = null;
        this.__on_update_session = null;
        this.__on_quit_callback = null;
}

SessionBrowser.prototype.__register_on_click = function()
{
        var elms = document.getElementsByName("session-list");
        for (var i = 0; i < elms.length; i ++) {
                var clazz = this;
                elms[i].addEventListener("click", function(event) {
                        clazz.__selected_session_id = parseInt((event.target || event.srcElement).id, 10);
                }, false);
        }
}

SessionBrowser.prototype.__animate_effect = function()
{
        var elms = document.getElementsByName("session-list");
        var seq_effect = new SequentialEffect("fade");
        for (var i = 0; i < elms.length; i ++) {
                seq_effect.add_elm($(elms[i]));
        }
        seq_effect.finalize();
        seq_effect.animate();
}

SessionBrowser.prototype.__make_session_ui = function(session_id, start_date, end_date, desc, is_active)
{
        const c_Desc_Length = 50;
        if (desc.length > c_Desc_Length)
                desc = desc.slice(0, c_Desc_Length) + "...";
        if (is_active) {
                return '<button class="simp_classic-list-item" name="session-list" id="' + session_id + '">'
                       + start_date.toDateString()
                       + '. (' + session_id + ') '
                       + desc
                       + ' (ongoing)</button>';
        } else {
                return '<button class="simp_classic-list-item" name="session-list" id="' + session_id + '">'
                       + start_date.toDateString() + " - " + end_date.toDateString()
                       + '. (' + session_id + ') '
                       + desc
                       + ' (ended)</button>';
        }
}

SessionBrowser.prototype.set_session_holder = function(holder)
{
        this.__session_holder = holder;
}

SessionBrowser.prototype.set_username_holder = function(holder)
{
        this.__username_holder = holder;
}

SessionBrowser.prototype.register_on_start_new_session = function(call, params)
{
        this.__on_start_new = {call: call, params: params};
}

SessionBrowser.prototype.register_on_end_session = function(call, params)
{
        this.__on_end = {call: call, params: params};
}

SessionBrowser.prototype.register_on_recover_session = function(call, params)
{
        this.__on_recover = {call: call, params: params};
}

SessionBrowser.prototype.register_on_update_session = function(call, params)
{
        this.__on_update_session = {call: call, params: params};
}

SessionBrowser.prototype.set_identity = function(identity)
{
        this.__identity = identity;
}

SessionBrowser.prototype.set_browsing_account_id = function(account_id)
{
        this.__account_id = account_id;
}

SessionBrowser.prototype.get_browsing_account_id = function(account_id)
{
        return this.__account_id;
}

SessionBrowser.prototype.get_browsing_account_info = function(account_id)
{
        return this.__account_info;
}

SessionBrowser.prototype.set_browser_on_quit = function(callback)
{
        this.__on_quit_callback = callback;
}

SessionBrowser.prototype.__update_params = function(on_params)
{
        on_params.id = this.__account_id;
        on_params.identity = this.__identity;
        on_params.session_id = this.__selected_session_id;
}

SessionBrowser.prototype.update_session_list = function()
{
        var clazz = this;
        this.__update_params(this.__on_update_session.params);

        Meteor.call(this.__on_update_session.call,
        this.__on_update_session.params, function(error, result) {
                console.log(result);

                if (result.error != "") {
                        console.log(result.error);
                } else {
                        clazz.__session_holder.empty();
                        for (var i = 0; i < result.sessions.length; i ++) {
                                var session = MedicalSession_Create_From_POD(result.sessions[i]);
                                var ui = clazz.__make_session_ui(session.get_session_id(),
                                                                 session.get_start_date(),
                                                                 session.get_end_date(),
                                                                 session.get_comments(),
                                                                 session.is_active());
                                clazz.__sessions[session.get_session_id()] = session;
                                clazz.__session_holder.append(ui);
                        }
                        clazz.__register_on_click();
                        clazz.__animate_effect();
                }
        });
}

SessionBrowser.prototype.update_user = function()
{
        var clazz = this;

        Meteor.call("get_account_info_by_id",
        {identity: clazz.__identity, id: clazz.__account_id}, function(error, result) {
                if (result.error != "") {
                        console.log(result.error);
                } else {
                        clazz.__username_holder.empty();
                        var account_info = AccountInfo_Create_From_POD(result.account_info);
                        clazz.__account_info = account_info;
                        clazz.__username_holder.html("Available Sessions for " + account_info.get_name());
                }
        });
}

SessionBrowser.prototype.start_new_session = function()
{
        var clazz = this;
        this.__update_params(this.__on_start_new.params);

        Meteor.call(this.__on_start_new.call, this.__on_start_new.params, function(error, result) {
                if (result.error != "") {
                        alert(result.error);
                } else {
                        clazz.update_session_list();
                }
        });
}

SessionBrowser.prototype.end_session = function()
{
        var clazz = this;
        this.__update_params(this.__on_end.params);

        Meteor.call(this.__on_end.call, this.__on_end.params, function(error, result) {
                if (result.error != "") {
                        alert(result.error);
                } else {
                        clazz.update_session_list();
                }
        });
}

SessionBrowser.prototype.recover_session = function()
{
        var clazz = this;
        this.__update_params(this.__on_recover.params);

        Meteor.call(this.__on_recover.call, this.__on_recover.params, function(error, result) {
                if (result.error != "") {
                        alert(result.error);
                } else {
                        clazz.update_session_list();
                }
        });
}

SessionBrowser.prototype.get_selected_session = function()
{
        return this.__sessions[this.__selected_session_id];
}

SessionBrowser.prototype.quit_browser = function()
{
        this.__on_quit_callback(this);
}

export function SessionBrowser_Create_From_POD(pod)
{
        var obj = new SessionBrowser(null);
        obj.__holder = pod.__holder;
        obj.__sessions = pod.__sessions;
        obj.__sessions.forEach(function (element, i, arr) {
                element = MedicalSession_Create_From_POD(element);
                arr[i] = element;
        });
        obj.__selected_session_id = pod.__selected_session_id;
        return obj;
}

// Main
Template.tmplsessionbrowser.onRendered(function ()
{
        console.log("session browser template rendered");
        $("#session-panel").fadeOut(0);
        $("#session-panel").fadeIn(800);

        G_SessionBrowser.set_session_holder($("#div-session-holder"));
        G_SessionBrowser.set_username_holder($("#div-patient-name"));
        G_SessionBrowser.update_user();
        G_SessionBrowser.update_session_list();
});

// Enter/Start/End/Recover Session Events
Template.tmplsessionbrowser.events({"click #btn-enter-session"(event) {
                if (null != G_SessionBrowser.get_selected_session()) {
                        G_SessionBrowser.quit_browser();
                } else {
                        alert("Please select a session first");
                }
        }
});

Template.tmplsessionbrowser.events({"click #btn-start-new-session"(event) {
                G_SessionBrowser.start_new_session();
        }
});

Template.tmplsessionbrowser.events({"click #btn-end-session"(event) {
                G_SessionBrowser.end_session();
        }
});

Template.tmplsessionbrowser.events({"click #btn-recover-session"(event) {
                G_SessionBrowser.recover_session();
        }
});
