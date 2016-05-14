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
import {AdminRecord_create_from_POD} from "./adminrecord.js"

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
        obj.__session_id = pod.__session_id;
        obj.__record = AdminRecord_create_from_POD(pod.__record);
        obj.__date = pod.__date;
        return obj;
}
