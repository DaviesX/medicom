import { Template } from "meteor/templating";
import {SessionManager} from "./session.js";
import {Identity_create_from_POD} from "../../api/identity.js";
import {AccountType} from "../../api/accounttype.js";
import "../html/login.html";


var G_Session = new SessionManager();

Template.tmpllogin.onRendered(function () {
        console.log("login template rendered");
});

function redirect_page_on(result) {
        var identity = Identity_create_from_POD(result.identity);
        console.log(identity);
        G_Session.set_identity_info(identity);
        
        // redirect according to account type.
        var record = identity.get_account_record();
        var acc_type = new AccountType().get_string_from_account_type(record.get_account_type());
        
        switch (acc_type) {
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

Template.tmpllogin.events({"click #btn-login"(event) {
        var regerror = "";
        var email = $("#txb-email").val();
        var password = $("#txb-password").val();
        var form_content = {
                id: email,
                email: email,
                password: password
        };
        console.log("logging in...");
        Meteor.call("user_login_by_email", form_content, function(error, result) {
                console.log("responded");
                console.log(result);
                if (result.error != "") {
                        Meteor.call("user_login_by_id", form_content, function(error, result) {
                                if (result.error != "") {
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
