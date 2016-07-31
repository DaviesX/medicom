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
import {ErrorMessageQueue, MongoDB} from "../api/common.js"


export function SessionUtils() {

        this.has_relation = function(provider_id, patient_id, err) {
                return G_DataModelContext.get_session_model().has_session(provider_id, patient_id);
        }

        this.add_relation = function(provider_id, patient_id, err) {
                if (G_DataModelContext.get_session_model().has_session(provider_id, patient_id)) {
                        err.log("The relation has been in your session list already.");
                        return null;
                }
                var session = G_DataModelContext.get_session_model().
                                        create_session(provider_id, patient_id);
                if (session == null) {
                        err.log("Failed to create session. The ID provided: (provider: " +
                                 provider_id + ", patient:" + patient_id + ") may be invalid");
                        return null;
                }
                session.activate();
                G_DataModelContext.get_session_model().update_session(session);
                return session;
        }

        this.start_new_session_with = function(provider_id, patient_id, err) {
                if (!G_DataModelContext.get_session_model().has_session(provider_id, patient_id)) {
                        err.log("This relation isn't in your list, please add the relation first.");
                        return null;
                }
                var session = G_DataModelContext.get_session_model().
                                        create_session(provider_id, patient_id);
                if (session == null) {
                        err.log("Failed to create session. The ID provided: (provider: " +
                                 provider_id + ", patient:" + patient_id + ") may be invalid");
                        return null;
                }
                // Deactivate old sessions.
                var old_sessions = G_DataModelContext.get_session_model().
                                        get_sessions_by_ids(provider_id, patient_id, true);
                if (old_sessions != null) {
                        for (var i = 0; i < old_sessions.length; i ++) {
                                old_sessions[i].deactivate();
                                G_DataModelContext.get_session_model().update_session(old_sessions[i]);
                        }
                }
                // Update new session.
                session.activate();
                G_DataModelContext.get_session_model().update_session(session);
                return session;
        }

        this.end_session = function(session_id, err) {
                var session = G_DataModelContext.get_session_model().
                                        get_session(session_id);
                if (session == null) {
                        err.log("Failed to recover session. The ID provided: " + session_id + " may be invalid");
                        return null;
                }
                session.deactivate();
                G_DataModelContext.get_session_model().update_session(session);
                return session;
        }

        this.recover_session = function(session_id, err) {
                var session = G_DataModelContext.get_session_model().
                                        get_session(session_id);
                if (session == null) {
                        err.log("Failed to recover session. The ID provided: " + session_id + " may be invalid");
                        return null;
                }
                // Deactivate old sessions.
                var old_sessions = G_DataModelContext.get_session_model().
                                        get_sessions_by_ids(session.get_provider_id(), session.get_patient_id());
                if (old_sessions != null) {
                        for (var i = 0; i < old_sessions.length; i ++) {
                                old_sessions[i].deactivate();
                                G_DataModelContext.get_session_model().update_session(old_sessions[i]);
                        }
                }
                session.activate();
                G_DataModelContext.get_session_model().update_session(session);
                return session;
        }

        this.remove_relation = function(provider_id, patient_id, err) {
                var sessions = G_DataModelContext.get_session_model().get_sessions_by_ids(
                                        provider_id, patient_id, true);
                if (sessions == null) {
                        err.log("Such session:(provider: " + provider_id +
                                ", patient:" + patient_id + ") does not exists");
                        return false;
                }
                for (var i = 0; i < sessions.length; i ++) {
                        sessions[i].deactivate();
                        G_DataModelContext.get_session_model().update_session(sessions[i]);
                }
                return true;
        }

        this.get_participated_patient_ids = function(provider_id, err) {
                var sessions = G_DataModelContext.get_session_model().
                                        get_sessions_by_provider_id(provider_id, true);
                if (sessions == null) {
                        return null;
                }
                sessions = _.uniq(sessions, false, function(obj) {return obj.get_patient_id()});
                var patient_ids = [];
                for (var i = 0; i < sessions.length; i ++) {
                        patient_ids[i] = sessions[i].get_patient_id();
                }

                return patient_ids;
        }

        this.get_participated_provider_ids = function(patient_id, err) {
                var sessions = G_DataModelContext.get_session_model().
                                        get_sessions_by_patient_id(patient_id, true);
                if (sessions == null) {
                        return null;
                }
                sessions = _.uniq(sessions, false, function(obj) {return obj.get_provider_id()});
                var provider_ids = [];
                for (var i = 0; i < sessions.length; i ++) {
                        provider_ids[i] = sessions[i].provider_id();
                }

                return provider_ids;
        }

        this.get_sessions = function(provider_id, patient_id, err) {
                return G_DataModelContext.get_session_model().get_sessions_by_ids(
                                        provider_id, patient_id, false);
        }
}
