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
import {Profile} from "../../api/profile.ts";
import {AccountInfo} from "../../api/accountinfo.ts";
import {MedicalSession} from "../../api/medicalsession.ts";
import {ValueTable} from "../../api/valuetable.ts";
import {Identity} from "../../api/identity.ts";
import {DataTransObject} from "../../api/datatransfactory.ts";
import {Result} from "../../api/result.ts";
import {ErrorMessages} from "../../api/error.ts";
import {UserGroup, user_group_get_registerable} from "../../api/usergroup.ts";
import {AccountControl} from "../accountcontrol.js";
import {MeasureControl} from "../measurecontrol.js";
import {SessionControl} from "../sessioncontrol.js";
import {PrivilegeControl} from "../privilegecontrol.js";
import {DataModelContext} from "../datamodelcontext.js";
import {TestData} from "../testdata.ts";
import {TestCase} from "../testcase.ts";

export class MeteorMethods
{
        private static account:         AccountControl = new AccountControl();
        private static privilege:       PrivilegeControl = new PrivilegeControl();
        private static session:         SessionControl = new SessionControl();
        private static measure:         MeasureControl = new MeasureControl();
        
        public static system_init(): void
        {
                MeteorMethods.account.system_init();
                MeteorMethods.session.system_init();
        }
        
        public static system_reset(): void
        {
                console.log("Performing system reset...");
                console.log("Reset database");
                DataModelContext.reset_all();
                console.log("Reinitialize the system");
                MeteorMethods.system_init();
                console.log("All set and ready to go");
        }
        
        public static server_print(msg: string): void
        {
                console.log(msg);
        }
        
        public static get_registerable_user_groups(): Result<Array<string>>
        {
                var a = new Array<string>();
                var b = user_group_get_registerable();
                for (var i = 0; i < b.length; i ++)
                        a.push(b[i].to_string());
                return new Result<Array<string>>(a, null, new ErrorMessages());
        }
        
        public static search_account_infos(identity: Identity, key_word: string, cap: number): Result<Array<AccountInfo>>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var account_infos = MeteorMethods.account.search_account_infos(identity, key_word, cap, err);
                return new Result<Array<AccountInfo>>(account_infos, DataTransObject.AccountInfo, err);
        }
        
        public static get_account_info_by_id(identity: Identity, account_id: number): Result<AccountInfo>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var account_info = MeteorMethods.account.get_account_info_by_id(identity, account_id, err);
                return new Result<AccountInfo>(account_info, DataTransObject.AccountInfo, err);
        }
        
        public static login_by_email(email: string, password: string): Result<Identity>
        {
                var err = new ErrorMessages();
                var identity = MeteorMethods.account.login_by_email(email, password, err);
                return new Result<Identity>(identity, DataTransObject.Identity, err); 
        }
        
        public static login_by_id(id: number, password: string): Result<Identity>
        {
                var err = new ErrorMessages();
                var identity = MeteorMethods.account.login_by_account_id(id, password, err);
                return new Result<Identity>(identity, DataTransObject.Identity, err);
        }
        
        public static logout(identity: Identity): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var result = MeteorMethods.account.logout(identity, err);
                return new Result<boolean>(result, null, err);
        }
        
        public static register(user_group: string, email: string, 
                               name: string, phone: string, password: string): Result<AccountInfo>
        {
                var err = new ErrorMessages();
                var info = MeteorMethods.account.register(user_group, email, name, phone, password, err);
                return new Result<AccountInfo>(info, DataTransObject.AccountInfo, err);
        }
        
        public static activate_account(auth_code: string): Result<boolean>
        {
                var err = new ErrorMessages();
                var info = MeteorMethods.account.activate(auth_code, err);
                return new Result<boolean>(info, null, err);
        }
        
        public static register_and_activate(user_group: string, email: string, 
                                            name: string, phone: string, password: string): Result<AccountInfo>
        {
                var err = new ErrorMessages();
                var info = MeteorMethods.account.register(user_group, email, name, phone, password, err);
                if (info != null)
                        MeteorMethods.account.activate(info.get_admin_record().get_auth_code(), err);
                return new Result<AccountInfo>(info, DataTransObject.AccountInfo, err);
        }
        
        public static create_user_association(identity: Identity, user_id: number): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                if (!MeteorMethods.session.create_association(identity, user_id, err))
                        return new Result<boolean>(false, null, err);
                else
                        return new Result<boolean>(true, null, err);
        }
        
        public static remove_user_association(identity: Identity, user_id: number): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                if (!MeteorMethods.session.remove_association(identity, user_id, err))
                        return new Result<boolean>(false, null, err);
                else
                        return new Result<boolean>(true, null, err);
        }
        
        public static get_associated_user_info(identity: Identity): Result<Array<AccountInfo>>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var user_infos = MeteorMethods.session.get_associated_users(identity, err);
                return new Result<Array<AccountInfo>>(user_infos, DataTransObject.AccountInfo, err); 
        }
        
        public static create_medical_session(identity: Identity, user_id: number): Result<MedicalSession>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var session = MeteorMethods.session.create_session(identity, user_id, err);
                return new Result<MedicalSession>(session, DataTransObject.MedicalSession, err);
        }
        
        public static share_medical_session(identity: Identity, user_id: number, session_id: number): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var result = MeteorMethods.session.share_session(identity, user_id, session_id, err);
                return new Result<boolean>(result, null, err);
        }
        
        public static add_medical_session(identity: Identity, user_id: number, session_id: number): Result<MedicalSession>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var session = MeteorMethods.session.add_session(identity, user_id, session_id, err);
                return new Result<MedicalSession>(session, DataTransObject.MedicalSession, err);
        }
        
        public static activate_medical_session(identity: Identity, user_id: number, session_id: number): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var result = MeteorMethods.session.activate_session(identity, session_id, err);
                return new Result<boolean>(result, null, err);
        }
        
        public static deactivate_medical_session(identity: Identity, user_id: number, session_id: number): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var result = MeteorMethods.session.deactivate_session(identity, session_id, err);
                return new Result<boolean>(result, null, err);
        }
        
        public static get_associated_session(identity: Identity, user_id: number): Result<Array<MedicalSession>>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var sessions = MeteorMethods.session.get_associated_sessions(identity, user_id, err);
                return new Result<Array<MedicalSession>>(sessions, DataTransObject.MedicalSession, err);
        }
        
        public static get_session_notes(identity: Identity, session_id: number): Result<string>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var notes = MeteorMethods.session.get_session_notes(identity, session_id, err);
                return new Result<string>(notes, null, err);
        }
        
        public static set_session_notes(identity: Identity, session_id: number, notes: string): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var result = MeteorMethods.session.set_session_notes(identity, session_id, notes, err);
                return new Result<boolean>(result, null, err);
        }
        
        public static get_measure_bp_table(identity: Identity, session_id: number, 
                                           start_date: Date, end_date: Date, num_samples: number): Result<ValueTable>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var measures = MeteorMethods.measure.get_bp_measures(
                                       identity, start_date, end_date, num_samples, session_id, err);
                var bptable = new ValueTable();
                if (measures != null) {
                        for (var i = 0; i < measures.length; i ++)
                                bptable.add_row(measures[i].get_date(), measures[i].get_bp_value());
                }
                return new Result<ValueTable>(bptable, DataTransObject.ValueTable, err);
        }
        
        public static update_measure_bp_from_table(identity: Identity, session_id: number, table: ValueTable): Result<boolean>
        {
                var err = new ErrorMessages();
                var r = true;
                if (table == null) {
                        err.log("invalid blood pressure table");
                        r = false;
                } else {
                        table = ValueTable.recover(table);
                        identity = identity != null ? Identity.recover(identity) : null;
                        if (!MeteorMethods.measure.update_bp_measures(identity, session_id, table, err)) {
                                err.log("failed to update bp data");
                                r = false;
                        }
                }
                return new Result<boolean>(r, null, err);
        }
        
        public static update_pbc_record(identity: Identity, session_id: number, pbctable: ValueTable): Result<boolean>
        {
                var err = new ErrorMessages();
                var r = true;
                if (pbctable == null) {
                        err.log("invalid blood pressure table");
                        r = false;
                } else {
                        pbctable = ValueTable.recover(pbctable);
                        identity = identity != null ? Identity.recover(identity) : null;
                        MeteorMethods.measure.update_pbc_measures(identity, session_id, pbctable, err);
                }
                return new Result<boolean>(r, null, err);
        }
        
        public static get_pbc_record(identity: Identity, session_id: number, 
                                     start_date: Date, end_date: Date, num_samples: number): Result<ValueTable>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var measures = MeteorMethods.measure.get_pbc_measures(identity, start_date, end_date, num_samples, session_id, err);
                var pbctable = new ValueTable();
                if (measures != null) {
                        for (var i = 0; i < measures.length; i ++)
                                pbctable.add_row(measures[i].get_date(), measures[i].get_action());
                }
                return new Result<ValueTable>(pbctable, DataTransObject.ValueTable, err);
        }
        
        public static get_measure_symptom(identity: Identity, session_id: number, 
                                          start_date: Date, end_date: Date, num_items: number): Result<ValueTable>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var measures = MeteorMethods.measure.get_symptom_measures(identity, start_date, end_date, session_id, err);
                var sym_table = new ValueTable();
                if (measures != null) {
                        var n = Math.min(measures.length, num_items == null ? measures.length : num_items);
                        for (var i = 0; i < n; i ++)
                                sym_table.add_row(measures[i].get_date(), measures[i].get_symptoms());
                }
                return new Result<ValueTable>(sym_table, DataTransObject.ValueTable, err);
        }
        
        public static update_measure_symptom(identity: Identity, session_id: number, sym_table: ValueTable): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                sym_table = ValueTable.recover(sym_table);
                if (!MeteorMethods.measure.update_symptom_measures(identity, session_id, sym_table, err)) {
                        err.log("failed to update symptom measures");
                        return new Result<boolean>(false, null, err);
                }
                return new Result<boolean>(true, null, err);
        }
        
        public static get_measure_fitbit_table(identity: Identity, session_id: number, 
                                               start_date: Date, end_date: Date, num_samples: number): Result<ValueTable>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                var measures = MeteorMethods.measure.get_fitbit_measures(identity, start_date, end_date, num_samples, session_id, err);
                var fbtable = new ValueTable();
                if (measures != null) {
                        for (var i = 0; i < measures.length; i ++)
                                fbtable.add_row(measures[i].get_date(), measures[i].get_sleep_info());
                }
                return new Result<ValueTable>(fbtable, DataTransObject.ValueTable, err);
        }
        
        public static update_measure_fitbit_from_table(identity: Identity, session_id: number, fbtable: ValueTable): Result<boolean>
        {
                var err = new ErrorMessages();
                identity = identity != null ? Identity.recover(identity) : null;
                fbtable = ValueTable.recover(fbtable);
                if (!MeteorMethods.measure.update_fitbit_measures(identity, session_id, fbtable, err)) {
                        err.log("failed to update fitbit measures");
                        return new Result<boolean>(false, null, err);
                }
                return new Result<boolean>(true, null, err);
        }
};


export var METHODS = {
        /**
         * Inject test data into the database.
         * @return {null}
         */
reset_data:
        function(arg)
        {
                TestData.reset_data();
        },

        /**
         * Inject test data into the database.
         * @return {null}
         */
inject_test_data:
        function(arg)
        {
                TestData.inject_test_data();
        },

        /**
         * Unit test on the AdminRecordModel.
         * @return {null}
         */
test_admin_record_model:
        function(arg)
        {
                TestCase.admin_record_model();
        },

        /**
         * Unit test on the IdentityModel.
         * @return {null}
         */
test_identity_model:
        function(arg)
        {
                TestCase.identity_model();
        },

        /**
         * Unit test on the PrivilegeNetwork.
         * @return {null}
         */
test_privilege_network:
        function(arg)
        {
                TestCase.privilege_network();
        },

        /**
         * Test the usability of the mongo database.
         * @return {null}
         */
test_mongodb:
        function(arg)
        {
                TestCase.mongo_util();
        },

        /**
         * Unit test on the Measure.
         * @return {null}
         */
test_measure:
        function(arg)
        {
                TestCase.measure();
        },

        /**
         * Unit test on the AccountControl.
         * @return {null}
         */
test_account_control:
        function(arg)
        {
                TestCase.account_control();
        },
        /**
         * Unit test on the SessionControl.
         * @return {null}
         */
test_session_control:
        function(arg)
        {
                TestCase.session_control();
        },
        /**
         * Print a message on server side.
         * @param {String} The message string.
         * @return {null}
         */
server_print:
        function(arg)
        {
                MeteorMethods.server_print(arg.str);
        },
        /**
         * Get a list of registerable account types.
         * @return An array of account types as strings.
         */
get_registerable_user_groups:
        function(arg)
        {
                return MeteorMethods.get_registerable_user_groups();
        },
        /**
         * Search a list of accounts from the key word.
         * @param {Identity} The user identity.
         * @param {String} Key word.
         * @return {AccountInfo[], String}  An array of account infos.
         */
search_account_infos:
        function(arg)
        {
                return MeteorMethods.search_account_infos(arg.identity, arg.key_word, arg.cap);
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
                return MeteorMethods.get_account_info_by_id(arg.identity, arg.id);
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
                return MeteorMethods.login_by_email(arg.email, arg.password);
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
                return MeteorMethods.login_by_id(arg.id, arg.password);
        },
        /**
         * Logout a user.
         * @param {Identity} Identity of the user.
         * @return {String} return a {""} object if sucessful, or otherwise, {"..."}.
         */
logout:
        function(arg)
        {
                return MeteorMethods.logout(arg.identity);
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
                return MeteorMethods.register(arg.user_group,
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
                return MeteorMethods.register_and_activate(arg.user_group,
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
                return MeteorMethods.activate_account(arg.auth_code);
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
                return MeteorMethods.create_user_association(arg.identity, arg.id);
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
                return MeteorMethods.remove_user_association(arg.identity, arg.id);
        },

        /**
         * Get provider's patients' ids.
         * @param {Identity} Identity of the provider.
         * @return {Integer[], String} return a {Integer[], ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_associated_user_info:
        function(arg)
        {
                return MeteorMethods.get_associated_user_info(arg.identity);
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
                return MeteorMethods.get_associated_session(arg.identity, arg.id);
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
                return MeteorMethods.create_medical_session(arg.identity, arg.id);
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
                return MeteorMethods.deactivate_medical_session(arg.identity, arg.id, arg.session_id);
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
                return MeteorMethods.activate_medical_session(arg.identity, arg.id, arg.session_id);
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
                return MeteorMethods.get_measure_bp_table(arg.identity,
                                                          arg.session_id,
                                                          arg.start_date,
                                                          arg.end_date,
                                                          arg.num_samples);
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
                return MeteorMethods.update_measure_bp_from_table(arg.identity,
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
                return MeteorMethods.update_pbc_record(arg.identity,
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
                return MeteorMethods.get_pbc_record(arg.identity,
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
                return MeteorMethods.update_measure_symptom(arg.identity, arg.session_id, arg.sym_table);
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
                return MeteorMethods.get_measure_symptom(arg.identity,
                                                         arg.session_id,
                                                         arg.start_date,
                                                         arg.end_date,
                                                         arg.num_items);
        },

        /**
         * Get a patient's fitbit graph data.
         * @param {Identity} Identity of the provider/patient.
         * @param {Integer} Target Session ID.
         * @param {Date} start date.
         * @param {Date} end date.
         * @param {Integer} number of samples.
         * @return {ValueTable, String} return a {ValueTable, ""} object if sucessful, or otherwise, {null, "..."}.
         */
get_measure_fitbit_table:
        function(arg)
        {
                return MeteorMethods.get_measure_fitbit_table(arg.identity,
                                                              arg.session_id,
                                                              arg.start_date,
                                                              arg.end_date,
                                                              arg.num_samples);
        },

        /**
         * Update fitbit data from fitbit table.
         * @param {Identity} Identity of the provider/patient/super intendant.
         * @param {Integer} Target Session ID.
         * @param {ValueTable} source fitbit table to update.
         * @return {Boolean, String} return a {True, ""} object if sucessful, or otherwise, {False, "..."}.
         */
update_measure_fitbit_from_table:
        function(arg)
        {
                return MeteorMethods.update_measure_fitbit_from_table(arg.identity,
                                                                      arg.session_id,
                                                                      arg.fbtable);
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
                return MeteorMethods.get_session_notes(arg.identity, arg.session_id);
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
                return MeteorMethods.set_session_notes(arg.identity, arg.session_id, arg.notes);
        },
};

