import {Meteor} from 'meteor/meteor';
import {ParticipatedSession} from "./participatedsession.js"


export function ParticipatedSessionManager(mongodb) {
        this.__mongodb = mongodb;
        this.c_Participated_Session_Coll_Name = "ParticipatedSessionCollection";
        this.__sessions = new Mongo.Collection(this.c_Participated_Session_Coll_Name);
        
        this.create_session = function(provider_id, patient_id) {
                var uuid = this.__mongo.get_string_uuid();
                var session = new ParticipatedSession(uuid, provider_id, patient_id);
                this.__sessions.insert(session);
                return session;
        }
        
        this.get_all_sessions_of_patient = function(patient_id) {
        }
        
        this.get_all_sessions_of_provider = function(provider_id) {
        }
        
        this.get_session_by_id = function(session_id) {
                var result = this.__sessions.find({__session_id : session_id});
                if (result.count() > 0) {
                        return ParticipatedSession_Create_From_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.update_session = function(session) {
                this.__sessions.update({__session_id : session.get_session_id()}, session);
        }
}
