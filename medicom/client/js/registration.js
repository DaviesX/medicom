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
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";

var G_Session = new SessionModel();

function option_make(value, text) {
        return '<option value="' + value + '">' + text + "</option>";
}

Template.tmplreg.onRendered(function () {
        console.log("reg template rendered");

        $(".emo_central").fadeOut(0);
        $(".emo_central").fadeIn(800);

        // inject acccount types.
        Meteor.call("get_registerable_user_groups", null, function(error, result) {
                for (var i = 0; i < result.length; i ++) {
                        $("#sel-reg-as").append(option_make(result[i], result[i]));
                }
        });
});


Template.tmplreg.events({"submit"(event) {
        event.preventDefault();

        var regerror = new ErrorMessageQueue();
        if ($("#txb-password").val() != $("#txb-retype-password").val()) {
                console.log("password doesn't match");
                regerror.log("password doesn't match");
        }
        if ($("#txb-password").val().length < 5) {
                console.log("password too short");
                regerror.log("password too short");
        }
        G_Session.set_error_message(regerror);
        if (!regerror.is_empty()) {
                Router.go("/regresult");
                return;
        }
        var form_content = {
                user_name:      $("#txb-user-name").val(),
                email:          $("#txb-email").val(),
                password:       $("#txb-password").val(),
                phone:          $("#txb-phone-number").val(),
                user_group:   $("#sel-reg-as").val()
        };

        console.log(form_content);
        Meteor.call("register_and_activate", form_content, function(error, result) {
                console.log(result.account_info);
                console.log(result.error);
                if (result.error != "") {
                        console.log(result.error);
                        regerror.log(result.error);
                        G_Session.set_error_message(regerror);
                }
                G_Session.set_account_info(result.account_info);
                Router.go("/regresult");
        });
        return;
}});

Template.tmplregresult.onRendered(function () {
        console.log("regresult template rendered");
        var regerror = G_Session.get_error_message();
        console.log(regerror);
        if (!regerror.is_empty()) {
                $("#h-reg-info").css("color", "red");
                $("#h-reg-info").html("Failed to register: " + regerror.fetch_all());
                console.log("user input error: " + regerror.fetch_all());
        } else {
                var reginfo = G_Session.get_account_info();
                console.log(reginfo);
                $("#h-reg-info").css("color", "green");
                $("#h-reg-info").html("Registration is successful, your account ID is: " +
                        reginfo.get_account_id());
        }
});
