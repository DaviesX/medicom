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
import {Identity} from "../../api/identity";
import {UserGroupConst} from "../../api/usergroup";
import {AdminRecord} from "../../api/adminrecord";
import {AccountInfo} from "../../api/accountinfo";
import {Result} from "../../api/result";
import {ErrorMessages} from "../../api/error";


Template["tmpllogin"].onRendered(function () {
        console.log("login template rendered");
        $(".emo_central").fadeOut(0);
        $(".emo_central").fadeIn(800);
});

function redirect_page_on(result: Result<Identity>) 
{
        var identity = Identity.recover(result.get_result());
        SessionParams.get_params().store(SessionParamObject.Identity, identity);

        // redirect according to account type.
        var record: AdminRecord = identity.get_account_record();
        var user_group: number = record.user_group();

        switch (user_group) {
        case UserGroupConst.Admin:
                Router.go("/admin");
                break;
        case UserGroupConst.Provider:
                Router.go("/provider");
                break;
        case UserGroupConst.Patient:
                Router.go("/patient");
                break;
        case UserGroupConst.Assistant:
                Router.go("/assistant");
                break;
        }
}

Template["tmpllogin"].events({"submit"(event) {
        event.preventDefault();

        var regerror = new ErrorMessages();
        var email_id = $("#txb-email-id").val();
        var password = $("#txb-password").val();
        var form_content = {
                id: parseInt(email_id, 10),
                email: email_id,
                password: password
        };
        console.log("logging in...");
        Meteor.call("login_by_email", form_content, function(error, pod) {
                var result = <Result<Identity>> Result.recover(pod);
                if (result.get_result() == null){
                        Meteor.call("login_by_id", form_content, function(error, pod) {
                                var result = <Result<Identity>> Result.recover(pod);
                                if (result.get_result() == null) {
                                        console.log(result.get_error().toString());
                                        regerror.log(result.get_error().toString());
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

