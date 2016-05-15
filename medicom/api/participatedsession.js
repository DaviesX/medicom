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
import {Meteor} from 'meteor/meteor';


export function ParticipatedSession(session_id, provider_id, patient_id) {
        this.__session_id = session_id;
        this.__patient_id = patient_id;
        this.__provider_id = provider_id;
        this.__pending_id = -1;
        this.__start = new Date().getTime();
        this.__end = null;
        
        this.__notes = "";
        this.__comments = "";
        
        this.get_session_id = function() { return this.__session_id; }
        this.get_provider_id = function() { return this.__provider_id; }
        this.get_patient_id = function() { return this.__patient_id; }
        this.activate = function() { this.__pending_id = 0; }
        this.deactivate = function() { this.__pending_id = -1; }
        this.end_session = function() { this.__end = new Date().getTime(); }
        this.is_active = function() { return this.__pending_id == 0; }
        this.set_pending = function(pending_id) { this.__pending_id = pending_id; }
        
        this.set_notes = function(notes) { this.__notes = notes; }
        this.get_notes = function() { return this.__notes; }
        
        this.set_comments = function(comments) { this.__comments = comments; }
        this.get_comments = function() { return this.__comments; }
        
        this.get_start_date = function() { return new Date(this.__start); };
        this.get_end_date = function() { return new Date(this.__end); }
}

export function ParticipatedSession_Create_From_POD(pod) {
        var obj = new ParticipatedSession(0);
        obj.__session_id = pod.__session_id;
        obj.__provider_id = pod.__provider_id;
        obj.__patient_id = pod.__patient_id;
        obj.__pending_id = pod.__pending_id;
        obj.__notes = pod.notes;
        obj.__comments = pod.comments;
        obj.__start = pod.__start;
        obj.__end = pod.__end;
        return obj;
}

