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
export function AccountInfo(record, account_id, name, email) {
        this.__record = record;
        this.__account_id = account_id;
        this.__name = name;
        this.__email = email;
        this.get_record = function() { return this.__record; }
        this.get_account_id = function() { return this.__account_id; }
        this.get_name = function() { return this.__name; }
        this.get_email = function() { return this.__email; }
}

export function AccountInfo_Create_From_POD(pod) {
        var obj = new AccountInfo(null, 0, null, null);
        obj.__record = pod.__record;
        obj.__account_id = pod.__account_id;
        obj.__name = pod.__name;
        obj.__email = pod.__email;
        return obj;
}
