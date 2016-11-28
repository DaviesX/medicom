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
import {ErrorMessages} from "../../api/error";
import {AccountInfo} from "../../api/accountinfo";
import {Result} from "../../api/result";
import {SessionParams, SessionParamObject} from "./sessionparams";


function make_option_ui(text: string): string
{
        return '<option value="' + text + '">' + text + "</option>";
}

Template["tmplreg"].onRendered(function () {
        console.log("reg template rendered");

        $(".emo_central").fadeOut(0);
        $(".emo_central").fadeIn(800);

        $("#sel-reg-as").append(make_option_ui("patient"));
        $("#sel-reg-as").append(make_option_ui("provider"));
        $("#sel-reg-as").append(make_option_ui("assistant"));
});


Template["tmplreg"].events({"submit"(event) {
        event.preventDefault();

        var regerror = new ErrorMessages();
        if ($("#txb-password").val() != $("#txb-retype-password").val()) {
                console.log("password doesn't match");
                regerror.log("password doesn't match");
        }
        if ($("#txb-password").val().length < 5) {
                console.log("password too short");
                regerror.log("password too short");
        }
        SessionParams.get_params().store(SessionParamObject.ErrorMessage, regerror);
        if (!regerror.is_empty()) {
                Router.go("/regresult");
                return;
        }
        var form_content = {
                user_name:      $("#txb-user-name").val(),
                email:          $("#txb-email").val(),
                password:       $("#txb-password").val(),
                phone:          $("#txb-phone-number").val(),
                user_group:     $("#sel-reg-as").val()
        };

        console.log(form_content);
        Meteor.call("register_and_activate", form_content, function(error, pod) {
                var result = <Result<AccountInfo>> Result.recover(pod);
                if (result.get_result == null) {
                        console.log(result.get_error().toString());
                        regerror.log(result.get_error().toString());
                        SessionParams.get_params().store(SessionParamObject.ErrorMessage, result.get_error());
                } else {
                        alert("Account has been created successfully! You may remember your account ID if you wish.");
                }
                SessionParams.get_params().store(SessionParamObject.User, result.get_result());
                Router.go("/regresult");
        });
        return;
}});

Template["tmplregresult"].onRendered(function () {
        console.log("regresult template rendered");
        var regerror = SessionParams.get_params().obtain(SessionParamObject.ErrorMessage);
        if (!regerror.is_empty()) {
                $("#h-reg-info").css("color", "red");
                $("#h-reg-info").html("Failed to register: " + regerror.toString());
                console.log("user input error: " + regerror.toString());
        } else {
                var reginfo: AccountInfo = SessionParams.get_params().obtain(SessionParamObject.User);
                console.log(reginfo);
                $("#h-reg-info").css("color", "green");
                $("#h-reg-info").html("Registration is successful, your account ID is: " + reginfo.get_account_id());
        }
});
