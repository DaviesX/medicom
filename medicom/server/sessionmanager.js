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

export function SessionManager(session_model, assoc_model)
{
        this.__session_model = session_model;
        this.__assoc_model = assoc_model;
}

SessionManager.prototype.create_association = function(user_pair)
{
        return this.__assoc_model.create_association(user_pair);
}

SessionManager.prototype.remove_association = function(user_pair)
{
        this.__assoc_model.remove_assocations(user_pair);
}

SessionManager.prototype.add_new_session = function(user_pair)
{
        var session = this.__session_model.create_session();
        if (session == null)
                return null;
        var assoc = this.__assoc_model.add_association(user_pair, session.get_session_id());
        if (assoc == null)
                return null;
        return {session: session, association: assoc};
}

SessionManager.prototype.recover_session = function(session_id)
{
        var session = this.__session_model.get_session(session_id);
        if (session == null)
                return false;
        session.activate();
        this.__session_model.update_session(session0);
        return true;
}

SessionManager.prototype.deactivate_session = function(session_id)
{
        var session = this.__session_model.get_session(session_id);
        if (session == null)
                return false;
        session.deactivate();
        this.__session_model.update_session(session0);
        return true;
}

SessionManager.prototype.set_session_comment = function(session_id, comment)
{
        var session = this.__session_model.get_session(session_id);
        if (session == null)
                return false;
        session.set_comments(comment);
        this.__session_model.update_session(session0);
        return true;
}

SessionManager.prototype.remove_session = function(session_id)
{
        this.__session_model.remove_session_by_id(session_id);
}

SessionManager.prototype.get_associated_sessions = function(user_pair)
{
        var assocs = this.__assoc_model.get_associations(user_pair);
        if (assocs == null)
                return null;
        var sessions = [];
        for (var i = 0; i < assocs.length; i ++) {
                if (null == assocs[i].get_session_id())
                        continue;
                var session = this.__session_model.get_session(assocs[i].get_session_id());
                if (session == null)
                        throw Error("Logical error: session_id: " + assocs[i].get_session_id() +
                                    " doesn't exist in session model but exists in association model");
                sessions.push(session);
        }
        return sessions;
}
