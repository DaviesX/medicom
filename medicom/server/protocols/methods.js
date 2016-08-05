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
import {ValueTable, ValueTable_create_from_POD} from "../../api/valuetable.js";
import {ErrorMessageQueue} from "../../api/common.js";
import {Identity_create_from_POD} from "../../api/identity.js";
import {AccountControl} from "../accountcontrol.js";
import {ProviderControl} from "../providercontrol.js";
import {PatientControl} from "../patientcontrol.js";
import {MeasureControl} from "../measurecontrol.js";
import {SessionControl} from "../sessioncontrol.js";
import {PrivilegeControl} from "../privilegecontrol.js";
import {DataModelContext, G_DataModelContext} from "../datamodelcontext.js";
import * as TestData from "../testdata.js";
import * as TestCase from "../testcase.js";

var g_account_ctrl = new AccountControl();
var g_priv_ctrl = new PrivilegeControl();
var g_provider_ctrl = new ProviderControl();
var g_patient_ctrl = new PatientControl();
var g_session_ctrl = new SessionControl();
var g_measure_ctrl = new MeasureControl();

export function system_init()
{
        g_account_ctrl.system_init();
        g_session_ctrl.system_init();
}

export function system_reset()
{
        console.log("Performing system reset...");
        console.log("Reset database");
        G_DataModelContext.reset_all();
        console.log("Reinitialize the system");
        system_init();
        console.log("All set and ready to go");
}

function server_print(arg)
{
        console.log(arg);
}

function get_registerable_user_groups()
{
        return g_account_ctrl.get_registerable_user_group_strings();
}

function get_account_info_by_id(identity, account_id)
{
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        identity = Identity_create_from_POD(identity);
        var account_info = g_account_ctrl.get_account_info_by_id(identity, account_id, err);
        return { account_info: account_info, error: err.fetch_all() };
}

function login_by_email(email, password)
{
        var err = new ErrorMessageQueue();
        var identity = g_account_ctrl.login_by_email(email, password, err);
        return { identity: identity, error: err.fetch_all() };
}

function login_by_id(id, password)
{
        var err = new ErrorMessageQueue();
        var identity = g_account_ctrl.login_by_account_id(id, password, err);
        return { identity: identity, error: err.fetch_all() };
}

function logout(identity)
{
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        identity = Identity_create_from_POD(identity);
        g_account_ctrl.logout(identity, err);
        return { error: err.fetch_all() };
}

function register(user_group, email, name, phone, password)
{
        var err = new ErrorMessageQueue();
        var info = g_account_ctrl.register(user_group, email, name, phone, password, err);
        return { account_info: info, error: err.fetch_all() };
}

function activate_account(auth_code)
{
        var err = new ErrorMessageQueue();
        var info = g_account_ctrl.activate(auth_code, err);
        return { account_info: info, error: err.fetch_all() };
}

function register_and_activate(user_group, email, name, phone, password)
{
        var err = new ErrorMessageQueue();
        var info = g_account_ctrl.register(user_group, email, name, phone, password, err);
        if (info != null) {
                g_account_ctrl.activate(info.get_record().get_auth_code(), err);
        }
        return { account_info: info, error: err.fetch_all() };
}

function create_user_association(identity, patient_id)
{
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        patients = g_provider_ctrl.add_patient(identity, patient_id, err);
        return { patients: patients, error: err.fetch_all() };
}

function provider_remove_patient_by_id(identity, patient_id)
{
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        patients = g_provider_ctrl.remove_patient(identity, patient_id, err);
        return { patients: patients, error: err.fetch_all() };
}

function create_medical_session(identity, patient_id)
{
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var session = g_provider_ctrl.start_new_session_with(identity, patient_id, err);
        return { session: session, error: err.fetch_all() };
}

function deactivate_medical_session(identity, session_id)
{
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var session = g_provider_ctrl.end_session(identity, session_id, err);
        return { session: session, error: err.fetch_all() };
}

function activate_medical_session(identity, session_id)
{
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var session = g_provider_ctrl.recover_session(identity, session_id, err);
        return { session: session, error: err.fetch_all() };
}

function get_associated_user_info(identity)
{
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

function get_associated_session(identity, patient_id)
{
        var err = new ErrorMessageQueue();
        identity = Identity_create_from_POD(identity);
        var sessions = g_provider_ctrl.get_sessions_by_patient_id(identity, patient_id, err);
        if (sessions == null) {
                err.log("failed to find sessions");
        }
        return { sessions: sessions, error: err.fetch_all() };
}

function get_measure_bp_table(identity, session_id, start_date, end_date, num_samples)
{
        identity = Identity_create_from_POD(identity);
        var err = new ErrorMessageQueue();
        var measures = g_measure_ctrl.get_bp_measures(
                               identity, start_date, end_date, num_samples, session_id, err);
        var bptable = new ValueTable();
        if (measures != null) {
                for (var i = 0; i < measures.length; i ++) {
                        bptable.add_row(measures[i].__parent.get_date(), measures[i].get_bp_value());
                }
        }
        return {bptable: bptable, error: err.fetch_all()};
}

function user_get_patient_symptoms(identity, session_id, start_date, end_date, num_samples, method)
{
        identity = Identity_create_from_POD(identity);
}

function update_measure_bp_from_table(identity, session_id, table)
{
        var err = new ErrorMessageQueue();
        if (table == null) {
                err.log("invalid blood pressure table");
                return {error: err.fetch_all()};
        }
        table = ValueTable_create_from_POD(table);
        identity = Identity_create_from_POD(identity);
        if (!g_measure_ctrl.update_bp_measures(identity, session_id, table, err)) {
                err.log("failed to update bp data");
        }
        return {error: err.fetch_all()};
}

function update_measure_bp_from_file(identity, session_id, format, blob)
{
        var err = new ErrorMessageQueue();
        if (format == null || blob == null) {
                err.log("invalid format or data blob");
                return {error: err.fetch_all()};
        }
        var bptable = new ValueTable();
        bptable.construct_from_stream(format, blob);
        return update_measure_bp_from_table(identity, session_id, bptable);
}

function update_pbc_record(identity, session_id, pbctable)
{
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return { patients: null, account_infos: null, error: err.fetch_all() };
        }
        pbctable = ValueTable_create_from_POD(pbctable);
        identity = Identity_create_from_POD(identity);
        g_measure_ctrl.update_pbc_measures(identity, session_id, pbctable, err);
        return {error: err.fetch_all()};
}

function get_pbc_record(identity, session_id, start_date, end_date, num_samples)
{
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return {pbctable: null, error: err.fetch_all()};
        }
        identity = Identity_create_from_POD(identity);
        var measures = g_measure_ctrl.get_pbc_measures(identity, start_date, end_date, num_samples, session_id, err);
        var pbctable = new ValueTable();
        if (measures != null) {
                for (var i = 0; i < measures.length; i ++) {
                        pbctable.add_row(measures[i].__parent.get_date(), measures[i].get_action());
                }
        }
        return {pbctable: pbctable, error: err.fetch_all()};
}

function user_get_symptom(identity, session_id, start_date, end_date, num_items)
{
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return {sym_table: null, error: err.fetch_all()};
        }
        identity = Identity_create_from_POD(identity);
        var measures = g_measure_ctrl.get_symptom_measures(identity, start_date, end_date, session_id, err);
        var sym_table = new ValueTable();
        if (measures != null) {
                var n = Math.min(measures.length, num_items == null ? measures.length : num_items);
                for (var i = 0; i < n; i ++) {
                        sym_table.add_row(measures[i].__parent.get_date(), {
patients_feel: measures[i].get_patients_feel(),
description: measures[i].get_description(),
                        });
                }
        }
        return {sym_table: sym_table, error: err.fetch_all()};
}

function update_measure_symptom(identity, session_id, sym_table)
{
        var err = new ErrorMessageQueue();
        if (identity == null) {
                err.log("identity is required, but it's absent");
                return {result: false, error: err.fetch_all()};
        }
        identity = Identity_create_from_POD(identity);
        sym_table = ValueTable_create_from_POD(sym_table);
        if (!g_measure_ctrl.update_symptom_measures(identity, session_id, sym_table, err)) {
                err.log("failed to update symptom measures");
                return {result: false, error: err.fetch_all()};
        }
        return {result: true, error: err.fetch_all()};
}

function get_session_notes(identity, session_id)
{
        identity = Identity_create_from_POD(identity);
        var err = new ErrorMessageQueue();
        var notes = g_measure_ctrl.get_session_notes(identity, session_id, err);
        return {notes: notes, error: err.fetch_all()};
}

function set_session_notes(identity, session_id, notes)
{
        identity = Identity_create_from_POD(identity);
        var err = new ErrorMessageQueue();
        g_provider_ctrl.set_session_notes(identity, session_id, notes, err);
        return {error: err.fetch_all()};
}


export var c_Meteor_Methods = {
        /**
         * Inject test data into the database.
         * @return {null}
         */
inject_test_data:
        function(arg)
        {
                TestData.PrepareTestData(true);
        },

        /**
         * Unit test on the AdminRecordModel.
         * @return {null}
         */
test_admin_record_model:
        function(arg)
        {
            TestCase.test_admin_record_model();
        },

        /**
         * Unit test on the PrivilegeNetwork.
         * @return {null}
         */
test_privilege_network:
        function(arg)
        {
                TestCase.test_privilege_network();
        },

        /**
         * Test the usability of the mongo database.
         * @return {null}
         */
test_mongodb:
        function(arg)
        {
                TestCase.test_MongoDB();
        },

        /**
         * Unit test on the Measure.
         * @return {null}
         */
test_measure:
        function(arg)
        {
                TestCase.test_measure();
        },

        /**
         * Unit test on the AccountControl.
         * @return {null}
         */
test_account_control:
        function(arg)
        {
                TestCase.test_account_control();
        },
        /**
         * Unit test on the SessionControl.
         * @return {null}
         */
test_session_control:
        function(arg)
        {
                TestCase.test_session_control();
        },
        /**
         * Print a message on server side.
         * @param {String} The message string.
         * @return {null}
         */
server_print:
        function(arg)
        {
                server_print(arg.str);
        },
        /**
         * Get a list of registerable account types.
         * @return An array of account types as strings.
         */
get_registerable_user_groups:
        function(arg)
        {
                return get_registerable_user_groups();
        },

        /**
         * Get account info by id.
         * @param {Identity} The user identity.
         * @param {Integer} The account ID.
         * @return {AccountInfo, String} return a {AccountInfo, ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_account_info_by_id:
        function(arg)
        {
                return get_account_info_by_id(arg.identity, arg.id);
        },
        /**
         * Login a user using email.
         * @param {String} Email address.
         * @param {String} Password.
         * @return {Identity, String} return a {Identity, ""} object if sucessful, or otherwise, {null, "..."}.
         */
login_by_email:
        function(arg)
        {
                return login_by_email(arg.email, arg.password);
        },

        /**
         * Login a user using account ID.
         * @param {Integer} Account ID.
         * @param {String} Password.
         * @return {Identity, String} return a {Identity, ""} object if sucessful, or otherwise, {null, "..."}.
         */
login_by_id:
        function(arg)
        {
                return login_by_id(arg.id, arg.password);
        },
        /**
         * Logout a user.
         * @param {Identity} Identity of the user.
         * @return {String} return a {""} object if sucessful, or otherwise, {"..."}.
         */
logout:
        function(arg)
        {
                return logout(arg.identity);
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
register:
        function(arg)
        {
                return register(arg.user_group,
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
register_and_activate:
        function(arg)
        {
                return register_and_activate(arg.user_group,
                arg.email,
                arg.user_name,
                arg.phone,
                arg.password);
        },

        /**
         * Activate an account.
         * @param {String} An authorization code in string.
         * @return {Boolean, String} return a {Boolean, ""} object if sucessful, or otherwise, {null, "..."}.
         */
activate_account:
        function(arg)
        {
                return activate_account(arg.auth_code);
        },

        /**
         * Add a patient to the provider's account.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Account ID of the patient.
         * @return {Boolean, String} return a {true, ""} object if sucessful, or otherwise, {false, "..."}.
         */
create_user_association:
        function(arg)
        {
                return create_user_association(arg.identity, arg.id);
        },

        /**
         * Remove a patient to the provider's account.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Account ID of the patient.
         * @return {Boolean, String} return a {true, ""} object if sucessful, or otherwise, {false, "..."}.
         */
remove_user_association:
        function(arg)
        {
                return provider_remove_patient_by_id(arg.identity, arg.id);
        },

        /**
         * Get provider's patients' ids.
         * @param {Identity} Identity of the provider.
         * @return {Integer[], String} return a {Integer[], ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_associated_user_info:
        function(arg)
        {
                return get_associated_user_info(arg.identity);
        },

        /**
         * Get sessions between the provider and patient.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Account ID of the patient.
         * @return {Integer[], String} return a {Integer[], ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_associated_session:
        function(arg)
        {
                return get_associated_session(arg.identity, arg.id);
        },

        /**
         * Start a new session with a patient.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Account ID of the patient.
         * @return {Session, String} return a {Session, ""} object if sucessful, or otherwise, {null, "..."}.
         */
create_medical_session:
        function(arg)
        {
                return create_medical_session(arg.identity, arg.id);
        },

        /**
         * End a session with a patient.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Session ID to be ended.
         * @return {Session, String} return a {Session, ""} object if sucessful, or otherwise, {null, "..."}.
         */
deactivate_medical_session:
        function(arg)
        {
                return deactivate_medical_session(arg.identity, arg.session_id);
        },

        /**
         * Recover a session with a patient.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Session ID to be ended.
         * @return {Session, String} return a {Session, ""} object if sucessful, or otherwise, {null, "..."}.
         */
activate_medical_session:
        function(arg)
        {
                return activate_medical_session(arg.identity, arg.session_id);
        },

        /**
         * Get a patient's blood pressure graph data.
         * @param {Identity} Identity of the provider/patient.
         * @param {Integer} Target Session ID.
         * @param {Date} start date.
         * @param {Date} end date.
         * @param {Integer} number of samples.
         * @return {ValueTable, String} return a {ValueTable, ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_measure_bp_table:
        function(arg)
        {
                return get_measure_bp_table(arg.identity,
                arg.session_id,
                arg.start_date,
                arg.end_date,
                arg.num_samples);
        },

        /**
         * Update blood pressure data from file.
         * @param {Identity} Identity of the provider/patient/super intendant.
         * @param {Integer} Target Session ID.
         * @param {String} Format of the file blob.
         * @param {String} Text blob of the file.
         * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
         */
update_measure_bp_from_file:
        function(arg)
        {
                return update_measure_bp_from_file(arg.identity,
                arg.session_id,
                arg.format,
                arg.blob);
        },

        /**
         * Update blood pressure data from bptable.
         * @param {Identity} Identity of the provider/patient/super intendant.
         * @param {Integer} Target Session ID.
         * @param {ValueTable} bptable to be updated.
         * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
         */
update_measure_bp_from_table:
        function(arg)
        {
                return update_measure_bp_from_table(arg.identity,
                arg.session_id,
                arg.bptable);
        },

        /**
         * Update pill bottle cap data from pbctable.
         * @param {Identity} Identity of the provider/patient/super intendant.
         * @param {Integer} Target Session ID.
         * @param {ValueTable} bptable to be updated.
         * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
         */
update_measure_pbc_from_table:
        function(arg)
        {
                return update_pbc_record(arg.identity,
                arg.session_id,
                arg.pbctable);
        },

        /**
         * Get a patient's pill bottle cap records.
         * @param {Identity} Identity of the provider/patient.
         * @param {Integer} Target Session ID.
         * @param {Date} start date.
         * @param {Date} end date.
         * @return {ValueTable, String} return a {ValueTable, ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_measure_pbc_table:
        function(arg)
        {
                return get_pbc_record(arg.identity,
                arg.session_id,
                arg.start_date,
                arg.end_date,
                arg.num_samples);
        },

        /**
         * Update symptom of a patient.
         * @param {Identity} Identity of the user.
         * @param {Integer} Target Session ID.
         * @param {ValueTable} Symtom table from which to update.
         * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
         */
update_measure_symptom:
        function(arg)
        {
                return update_measure_symptom(arg.identity, arg.session_id, arg.sym_table);
        },

        /**
         * Get a patient's symptom data.
         * @param {Identity} Identity of the user.
         * @param {Integer} Target Session ID.
         * @param {Date} start date.
         * @param {Date} end date.
         * @param {Integer} number of items.
         * @return {ValueTable, String} return a {SymptomsTable, ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_measure_symptom:
        function(arg)
        {
                return user_get_symptom(arg.identity,
                arg.session_id,
                arg.start_date,
                arg.end_date,
                arg.num_items);
        },

        /**
         * Get session notes.
         * @param {Identity} Identity of the provider/patient/super intendant.
         * @param {Integer} Session ID.
         * @return {String, String} return a {notes, ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_session_notes:
        function(arg)
        {
                return get_session_notes(arg.identity, arg.session_id);
        },

        /**
         * Update session notes.
         * @param {Identity} Identity of the provider.
         * @param {Integer} Session ID.
         * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
         */
set_session_notes:
        function(arg)
        {
                return set_session_notes(arg.identity, arg.session_id, arg.notes);
        },
};

