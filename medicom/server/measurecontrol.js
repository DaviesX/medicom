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
import {Meteor} from "meteor/meteor";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {MeasureBP} from "./measurebp.js";
import {MeasurePillBottleCap} from "./measurepillbottlecap.js";
import {MeasureSymptoms} from "./measuresymptoms.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import * as M_UserGroup from "../api/usergroup.js";
import * as M_Measure from "./measure.js";

export function MeasureControl() {
        this.__measure_model = G_DataModelContext.get_measure_model();
        this.__identity_model = G_DataModelContext.get_identity_model();
        this.__session_model = G_DataModelContext.get_session_model();

        this.__update_measures_from_table = function(identity, session_id, table, f_Construct_Measure, err) {
                if (!this.__identity_model.verify_identity(identity)) {
                        err.log("You don't have a valid identity");
                        return false;
                }
                var pairs = table.get_pairs();
                for (var i = 0; i < pairs.length; i ++) {
                        var measure = f_Construct_Measure(pairs[i]);
                        this.__measure_model.update_measure(session_id, measure);
                }
                return true;
        }

        this.__get_measure_samples = function(identity, type, start_date, end_date, sample_count, session_id, err) {
                if (!this.__identity_model.verify_identity(identity)) {
                        err.log("You don't have a valid identity");
                        return null;
                }
                start_date = start_date == null ? new Date(0) : start_date;
                end_date = end_date == null ? new Date(Math.pow(2, 52)) : end_date;
                var measures = this.__measure_model.get_measures_by_date_session_and_type(
                        start_date, end_date, session_id, type, 1);
                if (measures == null) return null;
                var sampled = [];
                var sample_count = sample_count != null ?
                                        Math.min(measures.length, Math.max(1, sample_count)) : measures.length;
                var interval = measures.length/sample_count;
                for (var i = 0, j = 0; i < sample_count; i ++, j += interval) {
                        sampled[i] = measures[Math.floor(j)];
                }
                return sampled;
        }

        this.update_bp_measures = function(identity, session_id, bptable, err) {
                var measure = new MeasureBP();
                this.__update_measures_from_table(identity, session_id, bptable, function(pair) {
                        measure.__parent.set_date(pair.date);
                        measure.set_bp_value({systolic: pair.value.systolic, diastolic: pair.value.diastolic});
                        return measure;
                }, err);
                return true;
        }

        this.get_bp_measures = function(identity, start_date, end_date, sample_count, session_id, err) {
                return this.__get_measure_samples(identity, M_Measure.c_Measure_Type_BP, start_date, end_date, sample_count, session_id, err);
        }

        this.update_pbc_measures = function(identity, session_id, pbctable, err) {
                var measure = new MeasurePillBottleCap();
                this.__update_measures_from_table(identity, session_id, pbctable, function(pair) {
                        measure.__parent.set_date(pair.date);
                        return measure;
                }, err);
                return true;
        }

        this.get_pbc_measures = function(identity, start_date, end_date, sample_count, session_id, err) {
                return this.__get_measure_samples(identity, M_Measure.c_Measure_Type_PillBottleCap, start_date, end_date, sample_count, session_id, err);
        }

        this.update_symptom_measures = function(identity, session_id, symptomtable, err) {
                var measure = new MeasureSymptoms();
                this.__update_measures_from_table(identity, session_id, symptomtable, function(pair) {
                        measure.__parent.set_date(pair.date);
                        measure.set_patients_feel(pair.value.patients_feel);
                        measure.set_description(pair.value.description);
                        var symptom_pairs = pair.value.symptom_pairs;
                        if (symptom_pairs != null && symptom_pairs.length > 0) {
                                for (var i = 0 ; i < symptom_pairs.length; i ++)
                                        measure.add_symptom(symptom_pairs[i].symp_name, symptom_pairs[i].scale);
                        }
                        return measure;
                }, err);
                return true;
        }

        this.get_symptom_measures = function(identity, start_date, end_date, session_id, err) {
                return this.__get_measure_samples(identity, M_Measure.c_Measure_Type_Symptoms, start_date, end_date, null, session_id, err);
        }

        this.__get_session_by_id = function(identity, session_id, err) {
                if (!this.__identity_model.verify_identity(identity)) {
                        err.log("You don't have a valid identity");
                        return null;
                }
                var session = this.__session_model.get_session(session_id);
                if (session == null) {
                        err.log("Session: " + session_id + " doesn't exists");
                        return null;
                }
                var id = identity.get_account_record().get_account_id();
                return session;
        }

        this.get_session_notes = function(identity, session_id, err) {
                var session = this.__get_session_by_id(identity, session_id, err);
                return session != null ? session.get_notes() : null;
        }
}
