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
import {SessionUtils} from "./sessionutils.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import * as M_AccountType from "../api/accounttype.js";
import * as M_Measure from "./measure.js";

export function SuperIndendantControl() {
        this.__measure_mgr = G_DataModelContext.get_measure_manager();
        this.__identity_mgr = G_DataModelContext.get_identity_manager();
        this.__session_mgr = G_DataModelContext.get_session_manager();
        
        this.update_bp_measures = function(identity, session_id, bptable, err) {
                if (!this.__identity_mgr.verify_identity(identity)) {
                        err.log("You don't have a valid identity");
                        return false;
                }
                var pairs = bptable.get_pairs();
                var measure = new MeasureBP();
                for (var i = 0; i < pairs.length; i ++) {
                        measure.__parent.set_date(pairs[i].date);
                        measure.set_bp_value(pairs[i].value);
                        this.__measure_mgr.update_measure(session_id, measure);
                }
                return true;
        }
        
        this.get_bp_measures = function(identity, start_date, end_date, sample_count, session_id, err) {
                if (!this.__identity_mgr.verify_identity(identity)) {
                        err.log("You don't have a valid identity");
                        return null;
                }
                start_date = start_date == null ? new Date(0) : start_date;
                end_date = end_date == null ? new Date(Math.pow(2, 52)) : end_date;
                var measures = this.__measure_mgr.get_measures_by_date_session_and_type(
                        start_date, end_date, session_id, M_Measure.c_Measure_Type_BP, 1);
                var sampled = [];
                var sample_count = sample_count != null ? 
                                        Math.min(measures.length, Math.max(1, sample_count)) : measures.length;
                var interval = measures.length/sample_count;
                for (var i = 0, j = 0; i < sample_count; i ++, j += interval) {
                        sampled[i] = measures[Math.floor(j)];
                }
                return sampled;
        }
        
        this.__get_session_by_id = function(identity, session_id, err) {
                if (!this.__identity_mgr.verify_identity(identity)) {
                        err.log("You don't have a valid identity");
                        return null;
                }
                var session = this.__session_mgr.get_session_by_id(session_id);
                if (session == null) {
                        err.log("Session: " + session_id + " doesn't exists");
                        return null;
                }
                var id = identity.get_account_record().get_account_id();
                if (session.get_provider_id() != id && session.get_patient_id() != id) {
                        err.log("Your are not in this session");
                        return null;
                }
                return session;
        }
        
        this.get_session_notes = function(identity, session_id, err) {
                var session = this.__get_session_by_id(identity, session_id, err);
                return session != null ? session.get_notes() : null;
        }
        
        this.get_session_comments = function(identity, session_id, err) {
                var session = this.__get_session_by_id(identity, session_id, err);
                return session != null ? session.get_comments() : null;
        }
}
