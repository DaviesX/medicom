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

export var c_Account_Type_Admin = 0;
export var c_Account_Type_Provider = 1;
export var c_Account_Type_Patient = 2;
export var c_Account_Type_SuperIntendant = 3;

export var c_Account_Type_Strings = 
["admin", "provider", "patient", "super intendant"];

export var c_Account_Type_Strings_Registerable = 
["provider", "patient", "super intendant"];

export var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";
c_Account_Type2String[c_Account_Type_SuperIntendant] = "super intendant";

export var c_String2Account_type = [];
c_String2Account_type["admin"] = c_Account_Type_Admin;
c_String2Account_type["provider"] = c_Account_Type_Provider;
c_String2Account_type["patient"] = c_Account_Type_Patient;
c_String2Account_type["super intendant"] = c_Account_Type_SuperIntendant;

export function AccountType() {
        this.get_string_from_account_type = function(accounttype) {
                return c_Account_Type2String[accounttype];
        }
        
        this.get_account_type_from_string = function(str) {
                return c_String2Account_type[str];
        }
        
        this.get_registerable_account_type_strings = function() {
                return c_Account_Type_Strings_Registerable;
        }
        
        this.get_account_type_strings = function() {
                return c_Account_Type_Strings;
        }
}
