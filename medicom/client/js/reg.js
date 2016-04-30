import { Template } from 'meteor/templating';
import "../html/reg.html";
import "../html/regresult.html";

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


Template.tmplreg.events({"click #btn-signup"(event) {
        var regerror = "";
        
        if ($("#txb-password").val() != $("#txb-retype-password").val()) {
                console.log("password doesn't match");
                regerror += "password doesn't match\n";
        }
        if ($("#txb-password").val().length < 5) {
                console.log("password too short");
                regerror += "password too short\n";
        }
        if (regerror != "") {
                Session.set("regerror", regerror);
                Router.go("/regresult");
                return;
        } else {
                Session.set("regerror", "");
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
                Session.set("reginfo", result);
                Router.go("/regresult");
        });
        return;
}});

Template.tmplregresult.onRendered(function () {
        console.log("regresult template rendered");
        var regerror = Session.get("regerror");
        var reginfo = Session.get("reginfo");
        if ((regerror != null && regerror != "") || reginfo == null) {
                $("#h-reg-info").css("color", "red");
                $("#h-reg-info").html("Failed to register: " + regerror);
                console.log("user input error: " + regerror);
        } else if (reginfo.account_info == null) {
                $("#h-reg-info").css("color", "red");
                $("#h-reg-info").html("Failed to register: " + reginfo.error);
                console.log("Registration error: " + regerror);
        } else {
                console.log(reginfo.account_info);
                $("#h-reg-info").css("color", "green");
                $("#h-reg-info").html("Registration is successful, your account ID is: " + 
                        reginfo.account_info.__account_id);
        }
});
