import {Meteor} from 'meteor/meteor';
import {ParticipatedSession} from "./participatedsession.js"


export function ParticipatedSessionManager(mongodb) {
        this.__mongodb = mongodb;
        this.c_Participated_Session_Coll_Name = "ParticipatedSessionCollection";
        this.__sessions = new Mongo.Collection(this.c_Participated_Session_Coll_Name);
        
        this.create_session = function(provider_id) {
                var uuid = this.__mongo.get_string_uuid();
                var session = new ParticipatedSession(provider_id, uuid);
                this.__sessions.insert(session);
                return session;
        }
        
        this.update_session = function(session) {
                this.__sessions.update({__session_id : session.get_session_id()}, session);
        }
}
