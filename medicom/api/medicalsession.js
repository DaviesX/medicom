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


export function MedicalSession(session_id, provider_id, patient_id) {
        this.__session_id = session_id;
        this.__is_active = -1;

        this.__start = new Date().getTime();
        this.__end = null;

        this.__comments = "";
}

MedicalSession.prototype.get_session_id = function()
{
        return this.__session_id;
}

MedicalSession.prototype.activate = function()
{
        this.__is_active = true;
}

MedicalSession.prototype.deactivate = function()
{
        this.__is_active = false;
}

MedicalSession.prototype.end_session = function()
{
        this.__end = new Date().getTime();
}

MedicalSession.prototype.is_active = function()
{
        return this.__is_active;
}

MedicalSession.prototype.set_comments = function(comments)
{
        this.__comments = comments;
}

MedicalSession.prototype.get_comments = function()
{
        return this.__comments;
}

MedicalSession.prototype.get_start_date = function()
{
        return new Date(this.__start);
}

MedicalSession.prototype.get_end_date = function()
{
        return new Date(this.__end);
}

export function MedicalSession_Create_From_POD(pod) {
        var obj = new MedicalSession();
        obj.__session_id = pod.__session_id;
        obj.__is_active = pod.__is_active;
        obj.__comments = pod.__comments;
        obj.__start = pod.__start;
        obj.__end = pod.__end;
        return obj;
}

