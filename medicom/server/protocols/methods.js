// Web APIs go here
import {Meteor} from 'meteor/meteor';
import {Profile} from "../../api/profile.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {Identity_create_from_POD} from "../../api/identity.js";
import {AccountControl} from "../accountcontrol.js";
import {ProviderControl} from "../providercontrol.js";

var g_account_ctrl = new AccountControl();
var g_provider_ctrl = new ProviderControl();


function server_print(arg) {
        console.log(arg);
}

function user_account_types() {
        return g_account_ctrl.get_registerable_account_types();
}

function user_login_by_email(email, password) {
        var err = new ErrorMessageQueue();
        var identity = g_account_ctrl.login_by_email(email, password, err);
        return { identity: identity, error: err.fetch_all() };
}

function user_login_by_id(id, password) {
        var err = new ErrorMessageQueue();
        var identity = g_account_ctrl.login_by_account_id(id, password, err);
        return { identity: identity, error: err.fetch_all() };
}

function user_register(account_type, email, name, phone, password) {
        var err = new ErrorMessageQueue();
        var info = g_account_ctrl.register(account_type, email, name, phone, password, err);
        return { account_info: info, error: err.fetch_all() };
}

function user_activate(activator) {
        var err = new ErrorMessageQueue();
        var info = g_account_ctrl.activate(activator);
        return { account_info: info, error: err.fetch_all() };
}

function user_register_and_activate(account_type, email, name, phone, password) {
        var err = new ErrorMessageQueue();
        var info = g_account_ctrl.register(account_type, email, name, phone, password, err);
        if (info != null) {
                g_account_ctrl.activate(info.get_record().get_activator(), err);
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

function provider_get_patient_set(identity) {
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        identity = Identity_create_from_POD(identity);
        var err = new ErrorMessageQueue();
        var patients = g_provider_ctrl.get_participated_patients(identity, err);
        var account_infos = null;
        if (patients != null) {
                var account_ids = [];
                for (var i = 0; i < patients.length; i ++) {
                        account_ids[i] = patients[i].get_account_id();
                }
                account_infos = get_account_infos_by_ids(identity, account_ids, err);
        } else {
                err.log("failed to find patients");
        }
        
        return { patients: patients, account_infos: account_infos, error: err.fetch_all() };
}

function user_get_patient_bp_graph(identity, patient_id, start_date, end_date, interval, method) {
}

function user_get_patient_symptoms(identity, patient_id, start_date, end_date, interval, method) {
}

function patient_super_update_bp_from_file(identity, patient_id, format, blob) {
}

function super_update_symptom(identity, patient_id, date, json) {
}

export var c_Meteor_Methods = {
/**
 * Print a message on server side.
 * @param {String} the message string
 * @return {null}
 */
server_print: function(arg) {
                        server_print(arg.str);
                },

user_account_types: function(arg) {
                        return user_account_types();
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
                        return user_register(arg.account_type, 
                                             arg.email, 
                                             arg.user_name, 
                                             arg.phone, 
                                             arg.password);
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
                        return user_register_and_activate(arg.account_type, 
                                                          arg.email, 
                                                          arg.user_name, 
                                                          arg.phone, 
                                                          arg.password);
                },

/**
 * Activate an account.
 * @param {String} An activator string
 * @return {Boolean, String} return a {Boolean, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_activate: function(arg) {
                        return user_activate(arg.activator);
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
 * @param {Date} start date.
 * @param {Date} end date.
 * @param {Interval} sampling interval.
 * @param {String} sampling method, including, "uniform average", "uniform max", "uniform min." 
 * @return {BPTable, String} return a {BPTable, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_get_patient_bp_graph: function(arg) {
                        return user_get_patient_bp_graph(arg.identity, 
                                                         arg.id,
                                                         arg.start_date, 
                                                         arg.end_date,
                                                         arg.interval,
                                                         arg.method);
                },

/**
 * Get a patient's symptom data.
 * @param {Identity} Identity of the provider/patient.
 * @param {Integer} Account ID of the patient.
 * @param {Date} start date.
 * @param {Date} end date.
 * @param {Interval} sampling interval.
 * @param {String} method(Unused).
 * @return {SymptomsTable, String} return a {SymptomsTable, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_get_patient_symptoms: function(arg) {
                        return user_get_patient_symptoms(arg.identity, 
                                                         arg.id,
                                                         arg.start_date, 
                                                         arg.end_date,
                                                         arg.interval,
                                                         arg.method);
                },

/**
 * Update blood pressure data from file.
 * @param {Identity} Identity of the provider/patient/super intendant.
 * @param {Integer} Account ID of the patient.
 * @param {String} Format of the file blob.
 * @param {String} Text blob of the file.
 * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
 */
patient_super_update_bp_from_file: function(arg) {
                        return patient_super_update_bp_from_file(arg.identity, 
                                                                 arg.id, 
                                                                 arg.format,
                                                                 arg.blob);
                },
                
/**
 * Update symptom of a patient.
 * @param {Identity} Identity of the provider/patient/super intendant.
 * @param {Integer} Account ID of the patient.
 * @param {Date} date of the blob.
 * @param {String} JSON blob of the symptom object.
 * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
 */
super_update_symptom: function(arg) {
                        return super_update_symptom(arg.identity, arg.id, arg.date, arg.blob);
                },
// note: fitbit has development js library on its website.
};
