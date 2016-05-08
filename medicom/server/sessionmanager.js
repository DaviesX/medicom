import {Meteor} from "meteor/meteor";
import {ParticipatedSession, ParticipatedSession_Create_From_POD} from "../api/participatedsession.js"


export function ParticipatedSessionManager(mongodb, provider_mgr, patient_mgr) {
        this.__mongodb = mongodb;
        this.__provider_mgr = provider_mgr;
        this.__patient_mgr = patient_mgr;
        this.c_Participated_Session_Coll_Name = "ParticipatedSessionCollection";
        this.__sessions = new Mongo.Collection(this.c_Participated_Session_Coll_Name);
        
        this.has_session = function(provider_id, patient_id) {
                var result = this.__sessions.find({__provider_id: provider_id, __patient_id: patient_id});
                return result.count() > 0;
        }
        
        this.has_session_strict = function(provider_id, patient_id, begin_time) {
                var result = this.__sessions.find({__provider_id: provider_id, 
                                                   __patient_id: patient_id,
                                                   __start: begin_time});
                return result.count() > 0;
        }
        
        this.create_session = function(provider_id, patient_id) {
                if (!this.__patient_mgr.has_patient(patient_id) ||
                    !this.__provider_mgr.has_provider(provider_id)) {
                        return null;
                }
                var uuid = this.__mongodb.get_uuid();
                var session = new ParticipatedSession(uuid, provider_id, patient_id);
                this.__sessions.insert(session);
                return session;
        }
        
        this.__generate_results = function(result) {
                if (result.count() > 0) {
                        var sessions = [];
                        var result_set = result.fetch();
                        for (var i = 0; i < result.count(); i ++) {
                                sessions[i] = ParticipatedSession_Create_From_POD(result_set[i]);
                        }
                        return sessions;
                } else {
                        return null;
                }
        }
        
        this.__generate_result = function(result) {
                if (result.count() > 0) {
                        return ParticipatedSession_Create_From_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.get_sessions_by_patient_id = function(patient_id, is_active) {
                if (!is_active)
                        return this.__generate_results(this.__sessions.find({__patient_id: patient_id}));
                else
                        return this.__generate_results(this.__sessions.find({
                                        __patient_id: patient_id,
                                        __pending_id: 0}));
        }
        
        this.get_sessions_by_provider_id = function(provider_id, is_active) {
                if (!is_active)
                        return this.__generate_results(this.__sessions.find(
                                        {__provider_id: provider_id}));
                else
                        return this.__generate_results(this.__sessions.find({
                                                __provider_id: provider_id,
                                                __pending_id: 0}, {sort: {__patient_id: -1}}));
        }
        
        this.get_sessions_by_ids = function(provider_id, patient_id, is_active) {
                if (!is_active) {
                        return this.__generate_results(this.__sessions.find({
                                        __provider_id: provider_id, 
                                        __patient_id: patient_id}, {sort: {__pending_id: -1}}));
                } else {
                        return this.__generate_results(this.__sessions.find({
                                        __provider_id: provider_id, 
                                        __patient_id: patient_id,
                                        __pending_id: 0}, {sort: {__pending_id: -1}}));
                }
        }
        
        this.get_session_by_id = function(session_id) {
                return this.__generate_result(this.__sessions.find({__session_id : session_id}));
        }
        
        this.update_session = function(session) {
                this.__sessions.update({__session_id : session.get_session_id()}, session);
        }
        
        this.reset = function() {
                return this.__sessions.remove({});
        }
}
