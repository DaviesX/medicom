import { Template } from "meteor/templating";
import {SessionManager} from "./session.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import "../html/reg.html";
import "../html/regresult.html";

var G_Session = new SessionManager();

function option_make(value, text) {
        return '<option value="' + value + '">' + text + "</option>";
}

Template.tmplreg.onRendered(function () {
        console.log("reg template rendered");
        
        // inject acccount types.
        Meteor.call("user_account_types", null, function(error, result) {
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
                account_type:   $("#sel-reg-as").val()
        };
        
        console.log(form_content);
        Meteor.call("user_register_and_activate", form_content, function(error, result) {
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
