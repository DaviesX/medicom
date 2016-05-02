import { Template } from "meteor/templating";
import {SessionManager} from "./session.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {AccountType} from "../../api/accounttype.js";
import {Patient_Create_From_POD} from "../../api/patient.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import "../html/login.html";

var G_Session = new SessionManager();
var G_AccountType = new AccountType();

function ui_make_patient(patient_id, patient_name) {
        return '<div><button class="simp_classic-fill-width" id="' + patient_id + '">' + 
                patient_id + ' - ' + patient_name + '</button></div>';
}

function ui_refresh_patient_list(holder, identity) {
        Meteor.call("provider_get_patient_set", {identity: identity}, function(error, result) {
                if (result.error != "") {
                        console.log(result.error);
                } else {
                        for (var i = 0; i < result.patients.length; i ++) {
                                var patient = Patient_Create_From_POD(result.patients[i]);
                                var account_info = AccountInfo_Create_From_POD(result.account_infos[i]);
                                holder.append(ui_make_patient(patient.get_account_id(), 
                                                              account_info.get_name()));
                        }
                }
        });
}

Template.tmplprovider.onRendered(function () {
        console.log("provider template rendered");
        var identity = G_Session.get_identity_info();
        if (identity == null || 
            "provider" != G_AccountType.get_string_from_account_type(
                                identity.get_account_record().get_account_type())) {
                console.log("You don't have the permission to visit this page");
                $("#div-welcome-holder").html("You haven't login yet");
        } else {
                // The welcome text.
                var account_id = identity.get_account_record().get_account_id();
                Meteor.call("user_account_info_by_id", 
                            {identity: identity, id: account_id}, function(error, result) {
                        if (result.error != "") {
                                $("#div-welcome-holder").html("error: " + result.error);
                        } else {
                                var account_info = AccountInfo_Create_From_POD(result.account_info);
                                $("#div-welcome-holder").html("Welcome, " + account_info.get_name());
                        }
                });
                // List of patients.
                ui_refresh_patient_list($("#div-patient-holder"), identity);
        }
});
