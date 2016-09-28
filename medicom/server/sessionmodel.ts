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

import {Mongo} from "meteor/mongo";
import {MongoUtil} from "../api/mongoutil.ts";
import {MedicalSession} from "../api/medicalsession.ts";


export class SessionModel
{
        private m_util:         MongoUtil;
        private m_sessions:     Mongo.Collection<MedicalSession>;

        constructor(util: MongoUtil)
        {
                this.m_util = util;
                this.m_sessions = new Mongo.Collection<MedicalSession>("MedicalSessions");
        }

        public create_session(): MedicalSession
        {
                var session = new MedicalSession(this.m_util.get_uuid());
                return this.m_sessions.insert(session) ? session : null;
        }

        public get_session(session_id: number): MedicalSession
        {
                var result = this.m_sessions.findOne({session_id: session_id});
                return result != null ? MedicalSession.recover(result) : null;
        }

        public has_session(session_id: number): boolean
        {
                return null != this.m_sessions.findOne({session_id : session_id});
        }

        public remove_session(session_id: number): number
        {
                return this.m_sessions.remove({session_id: session_id});
        }

        public update_session(new_session: MedicalSession): number 
        {
                return this.m_sessions.update({session_id : new_session.get_session_id()}, new_session);
        }

        public reset(): number
        {
                return this.m_sessions.remove({});
        }
}

