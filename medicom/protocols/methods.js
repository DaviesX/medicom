// Web APIs go here
import {Meteor} from 'meteor/meteor';
import {Profile} from "../server/profile.js"
import {ErrorMessageQueue} from "../server/common.js"
import {AccountControl} from "../server/accountcontrol.js"
import {ProviderControl} from "../server/providercontrol.js"


var g_acc_ctrl = new AccountControl();
var g_provider_ctrl = new ProviderControl();

function server_print(arg) {
        console.log(arg);
}

function user_login_by_email(email, password) {
        var err = new ErrorMessageQueue();
        var identity = acc_ctrl.login_by_id(email, password, err);
        return { identity: identity, error: err.fetch_all() };
}

function user_login_by_id(id, password) {
        var err = new ErrorMessageQueue();
        var identity = acc_ctrl.login_by_id(id, password);
        return { identity: identity, error: err.fetch_all() };
}

function user_register(account_type, email, name, phone, password) {
        var err = new ErrorMessageQueue();
        var info = acc_ctrl.register(account_type, email, name, phone, password, err);
        return { account_info: info, error: err.fetch_all() };
}

function user_register_and_activate(account_type, email, name, phone, password) {
        var err = new ErrorMessageQueue();
        var info = acc_ctrl.register(account_type, email, name, phone, password, err);
        if (info != null) {
                acc_ctrl.activate(info.get_account_record().get_activator(), err);
        }
        return { account_info: info, error: err.fetch_all() };
}

function provider_add_patient_by_id(identity, patient_id) {
        var err = new ErrorMessageQueue();
        patients = g_provider_ctrl.add_patient(identity, patient_id, err);
        return { patients: patients, error: err.fetch_all() };
}

function provider_remove_patient_by_id(identity, patient_id) {
        var err = new ErrorMessageQueue();
        patients = g_provider_ctrl.remove_patient(identity, patient_id, err);
        return { patients: patients, error: err.fetch_all() };
}

function provider_get_patient_set(identity, identity) {
        var err = new ErrorMessageQueue();
        patients = g_provider_ctrl.get_participated_patients(identity, err);
        return { patients: patients, error: err.fetch_all() };
}

function user_get_patient_bp_graph(identity, patient_id) {
}

function user_get_patient_sleep_quality(identity, patient_id) {
}

function patient_super_update_bp_from_file(identity, patient_id) {
}

export var c_Meteor_Methods = {
/**
 * Print a message on server side.
 * @param {String} the message string
 * @return {null}
 */
server_print: function(arg) {
                       server_print(arg.test_string);
               },

/**
 * Login a user using email.
 * @param {String} Email address.
 * @param {String} Password.
 * @return {Identity, String} return a {Identity, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_login_by_email: function(arg) {
                       return user_login_by_email(arg.email, arg.password);
                },

/**
 * Login a user using account ID.
 * @param {Integer} Account ID.
 * @param {String} Password.
 * @return {Identity, String} return a {Identity, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_login_by_id: function(arg) {
                        return user_login_by_id(arg.id, arg.password);
                },

/**
 * Register a new account which will require activation later on.
 * @param {String} Account type in string, "admin", "provider", "patient", "super intendant".
 * @param {String} Email address.
 * @param {String} User name.
 * @param {String} Phone number.
 * @param {String} Password.
 * @return {AccountInfo, String} return a {AccountInfo, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_register: function(arg) {
                        return user_register(arg.account_type, email, name, phone, password);
                },

/**
 * Register a new activated account.
 * @param {String} Account type in string, "admin", "provider", "patient", "super intendant".
 * @param {String} Email address.
 * @param {String} User name.
 * @param {String} Phone number.
 * @param {String} Password.
 * @return {AccountInfo, String} return a {AccountInfo, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_register_and_activate: function(arg) {
                        return user_register_and_activate(arg.account_type, email, name, phone, password);
                },

/**
 * Add a patient to the provider's account.
 * @param {Identity} Identity of the provider.
 * @param {Integer} Account ID of the patient.
 * @return {Boolean, String} return a {true, ""} object if sucessful, or otherwise, {false, "..."}.
 */
provider_add_patient: function(arg) {
                        return provider_add_patient(arg.identity, arg.id);
                },

/**
 * Remove a patient to the provider's account.
 * @param {Identity} Identity of the provider.
 * @param {Integer} Account ID of the patient.
 * @return {Boolean, String} return a {true, ""} object if sucessful, or otherwise, {false, "..."}.
 */
provider_remove_patient: function(arg) {
                        return provider_remove_patient_by_id(arg.identity, arg.id);
                },

/**
 * Get provider's patients.
 * @param {Identity} Identity of the provider.
 * @return {Patient[], String} return a {Patient[], ""} object if sucessful, or otherwise, {null, "..."}.
 */
provider_get_patient_set: function(arg) {
                        return provider_get_patient_set(arg.identity);
                },

/**
 * Get a patient's blood pressure graph data.
 * @param {Identity} Identity of the provider/patient.
 * @param {Integer} Account ID of the patient.
 * @return {BPTable, String} return a {BPTable, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_get_patient_bp_graph: function(arg) {
                        return user_get_patient_bp_graph(arg.identity, arg.id)
                },

/**
 * Get a patient's sleep quality data.
 * @param {Identity} Identity of the provider/patient.
 * @param {Integer} Account ID of the patient.
 * @return {SleepQltyTable, String} return a {SleepQltyTable, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_get_patient_sleep_quality: function(arg) {
                        return user_get_patient_sleep_quality(arg.identity, arg.id);
                },

/**
 * Update blood pressure data from file.
 * @param {Identity} Identity of the provider/patient/super intendant.
 * @param {Integer} Account ID of the patient.
 * @param {String} Text blob of the file.
 * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
 */
patient_super_update_bp_from_file: function(arg) {
                        return patient_super_update_bp_from_file(arg.identity, arg.id, arg.blob);
                },
};
