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

export function Association(user0, user1, session_id)
{
        this.__user0 = user0;
        this.__user1 = user1;
        this.__session_id = session_id;
}

Association.prototype.get_user_pair = function()
{
        return [this.__user0, this.__user1];
}

Association.prototype.get_session_id = function()
{
        return this.__session_id;
}

Association.prototype.set_session_id = function(session_id)
{
        this.__session_id = session_id;
}

export function Association_create_from_POD(pod)
{
        var obj = new Association();
        obj.__user0 = pod.__user0;
        obj.__user1 = pod.__user1;
        obj.__session_id = pod.__session_id;
        return obj;
}
