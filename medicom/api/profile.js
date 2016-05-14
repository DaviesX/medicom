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


export function Profile(email, name, phone, avatar, description) {
        this.__account_id = "";
        this.__email = email; 
        this.__name = name; 
        this.__phone = phone; 
        this.__avatar = avatar;
        this.__description = description;

        this.set_account_id = function(account_id) { this.__account_id = account_id; }
        this.set_email = function(email) { this.__email = email; }
        this.set_name = function(name) { this.__name = name; }
        this.set_phone = function(phone) { this.__phone = phone; }
        this.set_description = function(description) { this.__description = description; }
        this.set_avatar = function(avatar) { this.__avatar = avatar; }

        this.get_account_id = function() { return this.__account_id; }
        this.get_email = function() { return this.__email; }
        this.get_name = function() { return this.__name; }
        this.get_phone = function() { return this.__phone; }
        this.get_description = function() { return this.__description; }
        this.get_avatar = function() { return this.__avatar; }
}

export function Profile_create_from_POD(pod) {
        var obj = new Profile("", "", "", null, "");
        obj.__account_id = pod.__account_id;
        obj.__email = pod.__email; 
        obj.__name = pod.__name; 
        obj.__phone = pod.__phone; 
        obj.__avatar = pod.__avatar;
        obj.__description = pod.__description;
        return obj;
}

