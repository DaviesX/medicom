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

import {MedicalSession} from "../api/medicalsession.ts";
import {Association} from "../api/association.ts";
import {SessionModel} from "./sessionmodel.ts";
import {AssociationModel} from "./associationmodel.ts";

/*
 * <SessionManager>
 */
export class SessionManager
{
        private sessions:       SessionModel;
        private associations:   AssociationModel;

        constructor(sessions: SessionModel, associations: AssociationModel)
        {
                this.sessions = sessions;
                this.associations = associations;
        }

        public create_association(user_pair: [number, number]): Association
        {
                return this.associations.create_association(user_pair);
        }

        public remove_association(user_pair: [number, number]): number
        {
                return this.associations.remove_associations(user_pair);
        }

        public has_association(user_pair: [number, number]): boolean
        {
                return this.associations.has_association(user_pair);
        }
        
        public add_session(user_pair: [number, number], session_id: number): [MedicalSession, Association]
        {
                var session = this.sessions.get_session(session_id);
                if (session == null)
                        return null;
                var assoc = this.associations.add_association(user_pair, session_id);
                if (assoc == null)
                        return null;
                return [session, assoc];
        }
        
        public create_new_session(user_pair: [number, number]): [MedicalSession, Association]
        {
                var session = this.sessions.create_session();
                if (session == null)
                        return null;
                var assoc = this.associations.add_association(user_pair, session.get_session_id());
                if (assoc == null) {
                        this.sessions.remove_session(session.get_session_id());
                        return null;
                }
                return [session, assoc];
        }
        
        public activate_session(session_id: number): boolean
        {
                var session = this.sessions.get_session(session_id);
                if (session == null)
                        return false;
                session.activate();
                this.sessions.update_session(session);
                return true;
        }
        
        public deactivate_session(session_id: number): boolean
        {
                var session = this.sessions.get_session(session_id);
                if (session == null)
                        return false;
                session.deactivate();
                this.sessions.update_session(session);
                return true;
        }
        
        public remove_session(user_pair: [number, number], session_id: number): boolean
        {
                if (!this.has_association(user_pair))
                        return false;
                this.associations.remove_associations_by_session_id(session_id);
                this.sessions.remove_session(session_id);
                return true;
        }
        
        public has_associated_session(user_pair: [number, number], session_id: number): boolean
        {
                return this.associations.has_associated_session(user_pair, session_id);
        }
        
        public get_associated_sessions(user_pair: [number, number]): Array<MedicalSession>
        {
                var assocs = this.associations.get_associations(user_pair);
                if (assocs == null)
                        return null;
                var sessions = new Array<MedicalSession>(); 
                for (var i = 0; i < assocs.length; i ++) {
                        if (null == assocs[i].get_session_id())
                                continue;
                        var session = this.sessions.get_session(assocs[i].get_session_id());
                        if (session == null)
                                throw Error("Logical error: session_id: " + assocs[i].get_session_id() +
                                            " doesn't exist in session model but exists in association model");
                        sessions.push(session);
                }
                // Sort (is_active, date).
                sessions.sort(function (x, y) {
                        var primary = y.is_active() && x.is_active() ? 0 : 1;
                        if (primary == 0)
                                primary = y.get_start_date().getTime() - x.get_start_date().getTime();
                        return primary;
                });
                return sessions;
        }
};

