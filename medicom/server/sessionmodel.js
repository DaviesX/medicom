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
import {Meteor} from "meteor/meteor";
import {MedicalSession, MedicalSession_Create_From_POD} from "../api/medicalsession.js"


export function SessionModel(mongodb)
{
        this.__mongodb = mongodb;
        this.__sessions = new Mongo.Collection("MedicalSessionCollection");
}

SessionModel.prototype.create_session = function()
{
        var uuid = this.__mongodb.get_uuid();
        var session = new MedicalSession(uuid);
        this.__sessions.insert(session);
        return session;
}

SessionModel.prototype.get_session = function(session_id)
{
        var result = this.__sessions.findOne({__session_id : session_id});
        return result != null ? MedicalSession_Create_From_POD(result) : null;
}

SessionModel.prototype.remove_session = function(session_id)
{
        this.__sessions.remove({__session_id: session_id});
}

SessionModel.prototype.update_session = function(session)
{
        this.__sessions.update({__session_id : session.get_session_id()}, session);
}

SessionModel.prototype.reset = function()
{
        return this.__sessions.remove({});
}
