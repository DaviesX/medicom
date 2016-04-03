import {Meteor} from 'meteor/meteor';

export function Identity(session_id, record) {
        this.__session_id = session_id;
        this.__record = record;
        this.__date = new Date();
        this.get_account_record = function() { return this.__record; }
        this.get_session_id = function() { return this.__session_id; }
        this.get_last_date = function() { return this.__date; }
        this.update_date = function() { return this.__date = new Date(); }
}

export function Identity_create_from_POD(pod) {
        var obj = new Identity("", null);
        this.__session_id = pod.__session_id;
        this.__record = AdminRecord_create_from_POD(pod.__record);
        this.__date = pod.__date;
        return obj;
}
