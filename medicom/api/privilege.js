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

import {c_UserGroup_Root,
        c_UserGroup_Admin,
        c_UserGroup_Provider,
        c_UserGroup_Patient,
        c_UserGroup_Assistant,
        c_UserGroup_Temporary} from "./usergroup.js";

// User group actions
export const c_Root_Actions = [
        {action: "register account",            scope: [-1], grant_option: true},
        {action: "create account",              scope: [-1], grant_option: true},
        {action: "activate account",            scope: [-1], grant_option: true},
        {action: "deactivate account",          scope: [-1], grant_option: true},
        {action: "remove account",              scope: [-1], grant_option: true},
        {action: "search account",              scope: [-1], grant_option: true},
        {action: "view account",                scope: [-1], grant_option: true},
        {action: "view profile",                scope: [-1], grant_option: true},
        {action: "create association",          scope: [-1], grant_option: true},
        {action: "remove association",          scope: [-1], grant_option: true},
        {action: "search association",          scope: [-1], grant_option: true},
        {action: "create session",              scope: [-1], grant_option: true},
        {action: "remove session",              scope: [-1], grant_option: true},
        {action: "add session",                 scope: [-1], grant_option: true},
        {action: "share session",               scope: [-1], grant_option: true},
        {action: "search session",              scope: [-1], grant_option: true},
        {action: "activate session",            scope: [-1], grant_option: true},
        {action: "deactivate session",          scope: [-1], grant_option: true},
        {action: "view session",                scope: [-1], grant_option: true},
        {action: "update session",              scope: [-1], grant_option: true},
        {action: "update measure",              scope: [-1], grant_option: true},
        {action: "remove measure",              scope: [-1], grant_option: true},
        {action: "view measure",                scope: [-1], grant_option: true},
];

export const c_Admin_Actions = [
        {action: "register account",            scope: [-1], grant_option: true},
        {action: "create account",              scope: [-1], grant_option: true},
        {action: "activate account",            scope: [-1], grant_option: true},
        {action: "deactivate account",          scope: [-1], grant_option: true},
        {action: "remove account",              scope: [-1], grant_option: true},
        {action: "search account",              scope: [-1], grant_option: true},
        {action: "view account",                scope: [-1], grant_option: true},
];

export const c_Assistant_Actions = [
        {action: "register account",            scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "activate account",            scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "search account",              scope: [-2], grant_option: false},
        {action: "view profile",                scope: [-2], grant_option: false},
        {action: "view session",                scope: [-2], grant_option: false},
        {action: "create association",          scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "remove association",          scope: [-1], grant_option: false},
        {action: "search association",          scope: [-1], grant_option: false},
        {action: "add session",                 scope: [-2], grant_option: false},
        {action: "search session",              scope: [-1], grant_option: false},
        {action: "view session",                scope: [-1], grant_option: false},
        {action: "update measure",              scope: [-1], grant_option: false},
        {action: "view measure",                scope: [-1], grant_option: false},
];

export const c_Provider_Actions = [
        {action: "register account",            scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "activate account",            scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "search account",              scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "view profile",                scope: [-2], grant_option: false},
        {action: "create association",          scope: [-2, c_UserGroup_Patient], grant_option: false},
        {action: "remove association",          scope: [-1], grant_option: false},
        {action: "search association",          scope: [-1], grant_option: false},
        {action: "create session",              scope: [-1], grant_option: false},
        {action: "remove session",              scope: [-1], grant_option: false},
        {action: "add session",                 scope: [-2], grant_option: true},
        {action: "share session",               scope: [-2], grant_option: false},
        {action: "search session",              scope: [-1], grant_option: false},
        {action: "activate session",            scope: [-2], grant_option: false},
        {action: "deactivate session",          scope: [-2], grant_option: false},
        {action: "view session",                scope: [-1], grant_option: false},
        {action: "update session",              scope: [-1], grant_option: false},
        {action: "update measure",              scope: [-1], grant_option: false},
        {action: "remove measure",              scope: [-1], grant_option: false},
        {action: "view measure",                scope: [-1], grant_option: false},
];

export const c_Patient_Actions = [
        {action: "register account",            scope: [-2], grant_option: false},
        {action: "search account",              scope: [-2], grant_option: false},
        {action: "view profile",                scope: [-2], grant_option: false},
        {action: "search association",          scope: [-1], grant_option: false},
        {action: "search session",              scope: [-1], grant_option: false},
        {action: "view session",                scope: [-2], grant_option: false},
        {action: "update measure",              scope: [-2], grant_option: false},
        {action: "view measure",                scope: [-2], grant_option: false},
];

export const c_Temporary_Actions = [
        {action: "register account",            scope: [-2], grant_option: false},
];


// Privilege
export function Privilege(actions)
{
        this.__actions = actions;
}

Privilege.prototype.has_action = function(action, scope)
{
        return this.__find(action, scope) != null;
}

Privilege.prototype.all_actions = function()
{
        return this.__actions;
}

Privilege.prototype.__find = function(action, scope)
{
        for (var i = 0; i < this.__actions.length; i ++) {
                if (this.__actions[i].action == action) {
                        if (scope != null) {
                                for (var j = 0; j < this.__actions[i].scope.length; j ++) {
                                        if (this.__actions[i].scope[j] == scope)
                                                return this.__actions[i];
                                }
                        } else
                                return this.__actions[i];
                }
        }
        return null;
}

export function Privilege_create_from_POD(pod)
{
        var obj = new Privilege();
        obj.__actions = pod.__actions;
        return obj;
}
