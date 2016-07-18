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

export const c_UserGroup_Admin = 0;
export const c_UserGroup_Provider = 1;
export const c_UserGroup_Patient = 2;
export const c_UserGroup_Assistant = 3;

export const c_UserGroup_Strings =
["admin", "provider", "patient", "assistant"];

export const c_Account_Type_Strings_Registerable =
["provider", "patient", "super intendant"];

var c_UserGroup2String = [];
c_UserGroup2String[c_UserGroup_Admin] = "admin";
c_UserGroup2String[c_UserGroup_Provider] = "provider";
c_UserGroup2String[c_UserGroup_Patient] = "patient";
c_UserGroup2String[c_UserGroup_Assistant] = "assistant";

var c_String2UserGroup = [];
c_String2UserGroup["admin"] = c_UserGroup_Admin;
c_String2UserGroup["provider"] = c_UserGroup_Provider;
c_String2UserGroup["patient"] = c_UserGroup_Patient;
c_String2UserGroup["assistant"] = c_UserGroup_Assistant;

export function UserGroup()
{
}

UserGroup.prototype.get_string_from_user_group = function(usergroup)
{
        return c_UserGroup2String[usergroup];
}

UserGroup.prototype.get_user_group_from_string = function(str)
{
        return c_String2UserGroup[str];
}

UserGroup.prototype.get_registerable_user_group_strings = function()
{
        return c_Account_Type_Strings_Registerable;
}

UserGroup.prototype.get_user_group_strings = function()
{
        return c_UserGroup_Strings;
}
