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
// Web APIs go here
import {Meteor} from 'meteor/meteor';
import {Profile} from "../../api/profile.js";
import {BPTable, BPTable_create_from_POD} from "../../api/bptable.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {Identity_create_from_POD} from "../../api/identity.js";
import {AccountControl} from "../accountcontrol.js";
import {ProviderControl} from "../providercontrol.js";
import {PatientControl} from "../patientcontrol.js";
import {SuperIndendantControl} from "../superintendantcontrol.js";

var g_account_ctrl = new AccountControl();
var g_provider_ctrl = new ProviderControl();
var g_patient_ctrl = new PatientControl();
var g_superinten_ctrl = new SuperIndendantControl();


function server_print(arg) {
        console.log(arg);
}

function user_account_types() {
        return g_account_ctrl.get_registerable_account_types();
}

function user_account_info_by_id(identity, account_id) {
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        identity = Identity_create_from_POD(identity);
        var account_info = g_account_ctrl.get_account_info_by_id(identity, account_id, err);
        return { account_info: account_info, error: err.fetch_all() };
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

function user_logout(identity) {
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        identity = Identity_create_from_POD(identity);
        g_account_ctrl.logout(identity, err);
        return { error: err.fetch_all() };
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
        identity = Identity_create_from_POD(identity);
        patients = g_provider_ctrl.add_patient(identity, patient_id, err);
        return { patients: patients, error: err.fetch_all() };
}

function provider_remove_patient_by_id(identity, patient_id) {
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        patients = g_provider_ctrl.remove_patient(identity, patient_id, err);
        return { patients: patients, error: err.fetch_all() };
}

function provider_start_new_session_with(identity, patient_id) {
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var session = g_provider_ctrl.start_new_session_with(identity, patient_id, err);
        return { session: session, error: err.fetch_all() };
}

function provider_end_session(identity, session_id) {
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var session = g_provider_ctrl.end_session(identity, session_id, err);
        return { session: session, error: err.fetch_all() };
}

function provider_recover_session(identity, session_id) {
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var session = g_provider_ctrl.recover_session(identity, session_id, err);
        return { session: session, error: err.fetch_all() };
}

function provider_get_patient_ids(identity) {
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        identity = Identity_create_from_POD(identity);        
        var patient_ids = g_provider_ctrl.get_participated_patient_ids(identity, err);
        var account_infos = null;
        if (patient_ids != null) {
                account_infos = g_account_ctrl.get_account_infos_by_ids(identity, patient_ids, err);
        } else {
                err.log("failed to find patients");
        }
        return { patient_ids: patient_ids, account_infos: account_infos, error: err.fetch_all() };
}

function provider_get_sessions_by_patient_id(identity, patient_id) {
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity); 
        var sessions = g_provider_ctrl.get_sessions_by_patient_id(identity, patient_id, err);
        if (sessions == null) {
                err.log("failed to find sessions");
        }
        return { sessions: sessions, error: err.fetch_all() };
}

function user_get_patient_bp_table(identity, session_id, start_date, end_date, num_samples, method) {
        identity = Identity_create_from_POD(identity);
        var err = new ErrorMessageQueue();
        var measures = g_superinten_ctrl.get_bp_measures(identity, start_date, end_date, session_id, err);
        var bptable = new BPTable();
        if (measures != null) {
                var interval = Math.min(1, measures.length/num_samples);
                for (var i = 0; i < measures.length; i += interval) {
                        bptable.add_row(measures[i].__parent.get_date(), measures[i].get_bp_value());
                }
        }
        return {bptable: bptable, error: err.fetch_all()};
}

function user_get_patient_symptoms(identity, session_id, start_date, end_date, num_samples, method) {
        identity = Identity_create_from_POD(identity);
}

function patient_super_update_bp_from_table(identity, session_id, table) {
        var err = new ErrorMessageQueue();
        if (table == null) {
                err.log("invalid blood pressure table");
                return {error: err.fetch_all()};
        }
        table = BPTable_create_from_POD(table);
        identity = Identity_create_from_POD(identity);
        if (!g_superinten_ctrl.update_bp_measures(identity, session_id, table, err)) {
                err.log("failed to update bp data");
        }
        return {error: err.fetch_all()};
}

function patient_super_update_bp_from_file(identity, session_id, format, blob) {
        var err = new ErrorMessageQueue();
        if (format == null || blob == null) {
                err.log("invalid format or data blob");
                return {error: err.fetch_all()};
        }
        var bptable = new BPTable();
        bptable.construct_from_stream(format, blob);
        return patient_super_update_bp_from_table(identity, session_id, bptable);
}

function super_update_symptom(identity, patient_id, date, json) {
        identity = Identity_create_from_POD(identity);
}

export var c_Meteor_Methods = {
/**
 * Print a message on server side.
 * @param {String} The message string.
 * @return {null}
 */
server_print: function(arg) {
                        server_print(arg.str);
                },
/**
 * Get a list of registerable account types.
 * @return An array of account types as strings.
 */
user_account_types: function(arg) {
                        return user_account_types();
                },
                
/**
 * Get account info by id.
 * @param {Identity} The user identity.
 * @param {Integer} The account ID.
 * @return {AccountInfo, String} return a {AccountInfo, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_account_info_by_id: function(arg) {
                        return user_account_info_by_id(arg.identity, arg.id);
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
 * Logout a user.
 * @param {Identity} Identity of the user.
 * @return {String} return a {""} object if sucessful, or otherwise, {"..."}.
 */
user_logout: function(arg) {
                        return user_logout(arg.identity);
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
provider_add_patient_by_id: function(arg) {
                        return provider_add_patient_by_id(arg.identity, arg.id);
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
 * Get provider's patients' ids.
 * @param {Identity} Identity of the provider.
 * @return {Integer[], String} return a {Integer[], ""} object if sucessful, or otherwise, {null, "..."}.
 */
provider_get_patient_ids: function(arg) {
                        return provider_get_patient_ids(arg.identity);
                },
        
/**
 * Get sessions between the provider and patient.
 * @param {Identity} Identity of the provider.
 * @param {Integer} Account ID of the patient.
 * @return {Integer[], String} return a {Integer[], ""} object if sucessful, or otherwise, {null, "..."}.
 */
provider_get_sessions_by_patient_id: function(arg) {
                        return provider_get_sessions_by_patient_id(arg.identity, arg.id);
                },
                
/**
 * Start a new session with a patient.
 * @param {Identity} Identity of the provider.
 * @param {Integer} Account ID of the patient.
 * @return {Session, String} return a {Session, ""} object if sucessful, or otherwise, {null, "..."}.
 */
provider_start_new_session_with: function(arg) {
                        return provider_start_new_session_with(arg.identity, arg.id);
                },

/**
 * End a session with a patient.
 * @param {Identity} Identity of the provider.
 * @param {Integer} Session ID to be ended.
 * @return {Session, String} return a {Session, ""} object if sucessful, or otherwise, {null, "..."}.
 */
provider_end_session: function(arg) {
                        return provider_end_session(arg.identity, arg.session_id);
                },

/**
 * Recover a session with a patient.
 * @param {Identity} Identity of the provider.
 * @param {Integer} Session ID to be ended.
 * @return {Session, String} return a {Session, ""} object if sucessful, or otherwise, {null, "..."}.
 */
provider_recover_session: function(arg) {
                        return provider_recover_session(arg.identity, arg.session_id);
                },
                
/**
 * Get a patient's blood pressure graph data.
 * @param {Identity} Identity of the provider/patient.
 * @param {Integer} Target Session ID.
 * @param {Date} start date.
 * @param {Date} end date.
 * @param {Integer} number of samples.
 * @param {String} sampling method, including, "plain" "uniform average", "uniform max", "uniform min." 
 * @return {BPTable, String} return a {BPTable, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_get_patient_bp_table: function(arg) {
                        return user_get_patient_bp_table(arg.identity, 
                                                         arg.session_id,
                                                         arg.start_date, 
                                                         arg.end_date,
                                                         arg.num_samples,
                                                         arg.method);
                },

/**
 * Get a patient's symptom data.
 * @param {Identity} Identity of the provider/patient.
 * @param {Integer} Target Session ID.
 * @param {Date} start date.
 * @param {Date} end date.
 * @param {Integer} number of samples.
 * @param {String} method(Unused).
 * @return {SymptomsTable, String} return a {SymptomsTable, ""} object if sucessful, or otherwise, {null, "..."}.
 */
user_get_patient_symptoms: function(arg) {
                        return user_get_patient_symptoms(arg.identity, 
                                                         arg.session_id,
                                                         arg.start_date, 
                                                         arg.end_date,
                                                         arg.num_samples,
                                                         arg.method);
                },

/**
 * Update blood pressure data from file.
 * @param {Identity} Identity of the provider/patient/super intendant.
 * @param {Integer} Target Session ID.
 * @param {String} Format of the file blob.
 * @param {String} Text blob of the file.
 * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
 */
patient_super_update_bp_from_file: function(arg) {
                        return patient_super_update_bp_from_file(arg.identity, 
                                                                 arg.session_id, 
                                                                 arg.format,
                                                                 arg.blob);
                },
                
/**
 * Update blood pressure data from bptable.
 * @param {Identity} Identity of the provider/patient/super intendant.
 * @param {Integer} Target Session ID.
 * @param {BPTable} bptable to be updated.
 * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
 */
patient_super_update_bp_from_table: function(arg) {
                        return patient_super_update_bp_from_table(arg.identity, 
                                                                  arg.session_id, 
                                                                  arg.bptable);
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
