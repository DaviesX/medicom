import { Template } from "meteor/templating";
import {SessionManager} from "./session.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {AccountType} from "../../api/accounttype.js";
import {Patient_Create_From_POD} from "../../api/patient.js";
import {AccountInfo_Create_From_POD} from "../../api/accountinfo.js";
import "../html/login.html";

var G_Session = new SessionManager();
var G_AccountType = new AccountType();
var G_KeyBrowsingMode = "browsingmode";
const c_ValueBrowsingDefault = "browsingdefault";
const c_ValueBrowsingSession = "browsingsession";
const c_ValueBrowsingPresent = "browsingpresent";

function ui_make_patient(patient_id, patient_name) {
        return '<div><button class="simp_classic-fill-width" id="' + patient_id + '">' + 
                patient_id + ', ' + patient_name + '</button></div>';
}

function ui_refresh_patient_list(holder, identity) {
        Meteor.call("provider_get_patient_ids", {identity: identity}, function(error, result) {
                if (result.error != "") {
                        console.log(result.error);
                } else {
                        holder.empty();
                        for (var i = 0; i < result.patient_ids.length; i ++) {
                                var patient_id = result.patient_ids[i];
                                var account_info = AccountInfo_Create_From_POD(result.account_infos[i]);
                                holder.append(ui_make_patient(patient_id, account_info.get_name()));
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
        // Data browser.
        Session.set(G_KeyBrowsingMode, c_ValueBrowsingSession);
});

// Add patient button
Template.tmplprovider.events({"click #btn-add-patient"(event) {
        $("#div-add-patient-dlg").dialog();
        $("#div-add-patient-dlg").css("visibility", "visible");
}});

// Add patient form
Template.tmplprovideraddpatient.events({"click #btn_confirm-add-patient"(event) {
        $("#div-add-patient-dlg").dialog("close");
        var identity = G_Session.get_identity_info();
        var account_id = parseInt($("#txb-id-email").val(), 10);
        var form_content = {
                identity: identity,
                id: account_id,
                email: $("#txb-id-email").val()
        };
        console.log(form_content);
        Meteor.call("provider_add_patient_by_id", form_content, function(error, result) {
                if (result.error != "") {
                        alert("Failed to add patient: " + result.error);             
                } else {
                        ui_refresh_patient_list($("#div-patient-holder"), identity);
                        alert("Patient has been added");
                }
        });        
}});

// handling browsing mode state
Template.tmplprovider.helpers({ 
        use_default() {
                return Session.get(G_KeyBrowsingMode) == c_ValueBrowsingDefault;
        },
        
        use_session_browser() {
                return Session.get(G_KeyBrowsingMode) == c_ValueBrowsingSession;
        },
        
        use_present() {
                return Session.get(G_KeyBrowsingMode) == c_ValueBrowsingPresent;
        }
});
