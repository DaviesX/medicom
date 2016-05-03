import {Meteor} from 'meteor/meteor';


export function ParticipatedSession(session_id, provider_id, patient_id) {
        this.__session_id = session_id;
        this.__patient_id = patient_id;
        this.__provider_id = provider_id;
        this.__pending_id = -1;
        this.__start = new Date();
        this.__end = null;
        this.get_session_id = function() { return this.__session_id; }
        this.get_provider_id = function() { return this.__provider_id; }
        this.get_patient_id = function() { return this.__patient_id; }
        this.activate = function() { this.__pending_id = 0; }
        this.deactivate = function() { this.__pending_id = -1; }
        this.set_pending = function(pending_id) { this.__pending_id = pending_id; }
}

export function ParticipatedSession_Create_From_POD(pod) {
        var obj = new ParticipatedSession(0);
        obj.__session_id = pod.__session_id;
        obj.__provider_id = pod.__provider_id;
        obj.__patient_id = pod.__patient_id;
        obj.__pending_id = pod.__pending_id;
        obj.__start = pod.__start;
        obj.__end = pod.__end;
        return obj;
}

