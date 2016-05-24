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

export function SessionNotesDisplay() {
        this.__identity = null;
        this.__session = null;
        this.__notes_holder = null;
        
        this.set_access_info = function(identity, session) {
                this.__identity = identity;
                this.__session = session;
        }
        
        this.set_notes_holder = function(holder) {
                this.__notes_holder = holder;
        }
        
        this.update_notes = function() {
                var clazz = this;
                
                Meteor.call("user_get_session_notes", 
                            {identity: this.__identity, 
                             session_id: this.__session.get_session_id()}, function(error, result) {
                        if (result.error != "") {
                                console.log(result.error);
                        } else {
                                clazz.__notes_holder.html(result.notes);
                        }
                });
        }
        
        this.save_notes = function() {
                Meteor.call("provider_set_session_notes", 
                            {identity: this.__identity, 
                             session_id: this.__session.get_session_id(),
                             notes: this.__notes_holder.val()}, function(error, result) {
                        if (result.error != "") {
                                console.log(result.error);
                        } else {
                                console.log("Notes are saved");
                        }
                });
        }
}
