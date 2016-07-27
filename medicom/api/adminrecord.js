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


export function AdminRecord(account_id, user_group, password, auth_code, privi_ref)
{
        this.__account_id = account_id;
        this.__privilege_ref = privi_ref;
        this.__user_group = user_group;
        this.__internal_pass = password != null ? this.__hash33(password) : 0;
        this.__is_active = false;
        this.__auth_code = auth_code;
}

AdminRecord.prototype.is_equal = function(other)
{
        if (other.__account_id == this.__account_id &&
            other.__privilege_ref == this.__privilege_ref &&
            other.__user_group == this.__user_group &&
            other.__internal_pass == this.__internal_pass &&
            other.__is_active == this.__is_active &&
            other.__auth_code == this.__auth_code) {
                return true;
        }
        return false;
}

AdminRecord.prototype.__hash33 = function(s)
{
        var h = 5381;
        for (var i = 0; i < s.length; i ++) {
                var c = s.charCodeAt(i);
                h = ((h << 5) + h) + c;
        }
        return h >>> 0;
}

AdminRecord.prototype.set_auth_code = function(auth_code)
{
        this.__auth_code = auth_code;
}

AdminRecord.prototype.get_account_id = function()
{
        return this.__account_id;
}

AdminRecord.prototype.user_group = function()
{
        return this.__user_group;
}

AdminRecord.prototype.get_auth_code = function()
{
        return this.__auth_code;
}

AdminRecord.prototype.verify_password = function(password)
{
        return this.__internal_pass === this.__hash33(password);
}

AdminRecord.prototype.verify_internal_pass = function(pass)
{
        return this.__internal_pass === pass;
}

AdminRecord.prototype.verify_auth_code = function(auth_code)
{
        return this.__auth_code === auth_code;
}

AdminRecord.prototype.get_internal_pass = function()
{
        return this.__internal_pass;
}

AdminRecord.prototype.activate = function()
{
        this.__is_active = true;
}

AdminRecord.prototype.deactivate = function()
{
        this.__is_active = false;
}

AdminRecord.prototype.is_active = function()
{
        return this.__is_active;
}

AdminRecord.prototype.get_privilege_ref = function()
{
        return this.__privilege_ref;
}

export function AdminRecord_create_from_POD(pod) {
        var obj = new AdminRecord();
        obj.__account_id = pod.__account_id;
        obj.__privilege_ref = pod.__privilege_ref;
        obj.__user_group = pod.__user_group;
        obj.__internal_pass = pod.__internal_pass;
        obj.__is_active = pod.__is_active;
        obj.__auth_code = pod.__auth_code;
        return obj;
}
