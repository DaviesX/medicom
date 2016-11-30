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


export function Profile(account_id, email) {
        this.__account_id = account_id;
        this.__email = email;
        this.__name = null;
        this.__phone = null;
        this.__avatar = null;
        this.__description = null;
}

Profile.prototype.set_name = function(name)
{
        this.__name = name;
}

Profile.prototype.set_phone = function(phone)
{
        this.__phone = phone;
}

Profile.prototype.set_description = function(description)
{
        this.__description = description;
}

Profile.prototype.set_avatar = function(avatar)
{
        this.__avatar = avatar;
}

Profile.prototype.get_account_id = function()
{
        return this.__account_id;
}

Profile.prototype.get_email = function()
{
        return this.__email;
}

Profile.prototype.get_name = function()
{
        return this.__name;
}

Profile.prototype.get_phone = function()
{
        return this.__phone;
}

Profile.prototype.get_description = function()
{
        return this.__description;
}

Profile.prototype.get_avatar = function()
{
        return this.__avatar;
}

export function Profile_create_from_POD(pod) {
        var obj = new Profile();
        obj.__account_id = pod.__account_id;
        obj.__email = pod.__email;
        obj.__name = pod.__name;
        obj.__phone = pod.__phone;
        obj.__avatar = pod.__avatar;
        obj.__description = pod.__description;
        return obj;
}

