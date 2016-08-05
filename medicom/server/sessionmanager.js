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

SessionManager.prototype.has_association = function(user_pair)
{
        return this.__assoc_model.has_association(user_pair);
}

SessionManager.prototype.add_session = function(user_pair, session_id)
{
        var session = this.__session_model.get_session(session_id);
        if (session == null)
                return null;
        var assoc = this.__assoc_model.add_association(user_pair, session_id);
        if (assoc == null)
                return null;
        return {session: session, association: assoc};
}

SessionManager.prototype.create_new_session = function(user_pair)
{
        var session = this.__session_model.create_session();
        if (session == null)
                return null;
        var assoc = this.__assoc_model.add_association(user_pair, session.get_session_id());
        if (assoc == null) {
                this.__session_model.remove_session(session.get_session_id());
                return null;
        }
        return {session: session, association: assoc};
}

SessionManager.prototype.activate_session = function(session_id)
{
        var session = this.__session_model.get_session(session_id);
        if (session == null)
                return false;
        session.activate();
        this.__session_model.update_session(session);
        return true;
}

SessionManager.prototype.deactivate_session = function(session_id)
{
        var session = this.__session_model.get_session(session_id);
        if (session == null)
                return false;
        session.deactivate();
        this.__session_model.update_session(session);
        return true;
}

SessionManager.prototype.remove_session = function(user_pair, session_id)
{
        if (!this.has_association(user_pair))
                return false;
        this.__assoc_model.remove_associations_by_session_id(session_id);
        this.__session_model.remove_session(session_id);
        return true;
}

SessionManager.prototype.has_associated_session = function(user_pair, session_id)
{
        return this.__assoc_model.has_associated_session(user_pair, session_id);
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
        // Sort (is_active, date).
        sessions.sort(function (x, y) {
                var primary = y.is_active() - x.is_active();
                if (primary == 0)
                        primary = y.get_start_date() - x.get_start_date();
                return primary;
        });
        return sessions;
}
