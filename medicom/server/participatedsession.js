import {Meteor} from 'meteor/meteor';


export function ParticipatedSession(session_id, provider_id) {
        this.__session_id = session_id;
        this.__provider_id = provider_id;
        this.__start = new Date();
        this.__end = null;
        this.__measure_id = [];

        this.add_measurement = function(measure_id) {
                this.__measure_id[this.__measure_id.length + 1] = measure_id;
        }
        
        this.get_measurement_ids = function() { return this.__measure_id; }
        this.get_session_id = function() { return this.__session_id; }
        this.get_provider_id = function() { return this.__provider_id; }
}

export function ParticipatedSession_Create_From_POD(pod) {
        var obj = new ParticipatedSession(0);
        this.__session_id = pod.__session_id;
        this.__provider_id = pod.__provider_id;
        this.__start = pod.__start;
        this.__end = pod.__end;
        this.__measure_id = pod.__measure_id;
        return obj;
}

