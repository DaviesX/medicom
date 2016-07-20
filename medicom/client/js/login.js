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
import { Template } from "meteor/templating";
import {SessionModel} from "./session.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {Identity_create_from_POD} from "../../api/identity.js";
import {UserGroup} from "../../api/usergroup.js";


var G_Session = new SessionModel();

Template.tmpllogin.onRendered(function () {
        console.log("login template rendered");
        $(".emo_central").fadeOut(0);
        $(".emo_central").fadeIn(800);
});

function redirect_page_on(result) {
        var identity = Identity_create_from_POD(result.identity);
        console.log(identity);
        G_Session.set_identity_info(identity);

        // redirect according to account type.
        var record = identity.get_account_record();
        var user_group = new UserGroup().get_string_from_user_group(record.user_group());

        switch (user_group) {
        case "admin":
                Router.go("/admin");
                break;
        case "provider":
                Router.go("/provider");
                break;
        case "patient":
                Router.go("/patient");
                break;
        case "super indendant":
                Router.go("/super indendant");
                break;
        }
}

Template.tmpllogin.events({"submit"(event) {
        event.preventDefault();

        var regerror = new ErrorMessageQueue();
        var email_id = $("#txb-email-id").val();
        var password = $("#txb-password").val();
        var form_content = {
                id: parseInt(email_id, 10),
                email: email_id,
                password: password
        };
        console.log("logging in...");
        Meteor.call("user_login_by_email", form_content, function(error, result) {
                if (result.error != "") {
                        Meteor.call("user_login_by_id", form_content, function(error, result) {
                                if (result.error != "") {
                                        console.log(result.error);
                                        regerror.log(result.error);
                                        Router.go("/autherror");
                                } else {
                                        redirect_page_on(result);
                                }
                        });
                } else {
                        redirect_page_on(result);
                }
        });
}});

