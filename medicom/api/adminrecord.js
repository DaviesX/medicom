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


export function AdminRecord(account_type, password) {        
        this.__hash33 = function(s) {
                var h = 5381;
                for (var i = 0; i < s.length; i ++) {
                        var c = s.charCodeAt(i);
                        h = ((h << 5) + h) + c;
                }
                return h >>> 0;
        }
        
        this.__account_id = 0;
        this.__privilege_ref = 0;
        this.__account_type = account_type;
        this.__internal_pass = this.__hash33(password);
        this.__activator = "";

        this.set_account_id = function(account_id) { this.__account_id = account_id; }
        this.set_activator = function(activator) { this.__activator = activator; }
        
        this.get_account_id = function() { return this.__account_id; }
        this.get_account_type = function() { return this.__account_type; }
        this.get_activator = function() { return this.__activator; }
        this.verify_password = function(password) { return this.__internal_pass === this.__hash33(password); }
        this.verify_internal_pass = function(pass) { return this.__internal_pass === pass; }
        this.get_internal_pass = function() { return this.__internal_pass; }
        this.activate = function(activator) { 
                if (this.__activator === activator) { 
                        this.__activator = "-1";
                        return true;
                } else {
                        return false;
                }
        }
        this.deactivate = function(activator) { this.__activator = activator; }
        this.force_activate = function() { this.__activator = "-1"; }
        this.is_activated = function() { return this.__activator === "-1"; }
}

export function AdminRecord_create_from_POD(pod) {
        var obj = new AdminRecord(0, "");
        obj.__account_id = pod.__account_id;
        obj.__account_type = pod.__account_type;
        obj.__internal_pass = pod.__internal_pass;
        obj.__activator = pod.__activator;
        return obj;
}
