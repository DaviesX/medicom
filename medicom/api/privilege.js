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

// User group actions
export const c_Root_Actions = [
        {action: "register account",            scope: ["Owner", "Others"], grant_option: true},
        {action: "activate account",            scope: ["Owner", "Others"], grant_option: true},
        {action: "deactivate account",          scope: ["Owner", "Others"], grant_option: true},
        {action: "remove account",              scope: ["Owner", "Others"], grant_option: true},
        {action: "search account",              scope: ["Owner", "Others"], grant_option: true},
        {action: "view account",                scope: ["Owner", "Others"], grant_option: true},
        {action: "view profile",                scope: ["Owner", "Others"], grant_option: true},
        {action: "activate association",        scope: ["Owner", "Others"], grant_option: true},
        {action: "deactivate association",      scope: ["Owner", "Others"], grant_option: true},
        {action: "view association",            scope: ["Owner", "Others"], grant_option: true},
        {action: "update measure",              scope: ["Owner", "Others"], grant_option: true},
        {action: "remove measure",              scope: ["Owner", "Others"], grant_option: true},
        {action: "view measure",                scope: ["Owner", "Others"], grant_option: true},
];

export const c_Admin_Actions = [
        {action: "register account",            scope: ["Owner", "Others"], grant_option: true},
        {action: "activate account",            scope: ["Owner", "Others"], grant_option: true},
        {action: "deactivate account",          scope: ["Owner", "Others"], grant_option: true},
        {action: "remove account",              scope: ["Owner", "Others"], grant_option: true},
        {action: "search account",              scope: ["Owner", "Others"], grant_option: true},
        {action: "view account",                scope: ["Owner", "Others"], grant_option: true},
];

export const c_Assistant_Actions = [
        {action: "register account",            scope: ["Owner"], grant_option: false},
        {action: "activate account",            scope: [], grant_option: false},
        {action: "search account",              scope: ["Owner"], grant_option: false},
        {action: "view account",                scope: ["Owner"], grant_option: false},
        {action: "view profile",                scope: ["Owner"], grant_option: false},
        {action: "view association",            scope: ["Owner"], grant_option: false},
        {action: "update measure",              scope: ["Owner"], grant_option: false},
        {action: "view measure",                scope: ["Owner"], grant_option: false},
];

export const c_Provider_Actions = [
        {action: "register account",            scope: ["Owner"], grant_option: false},
        {action: "activate account",            scope: [], grant_option: false},
        {action: "search account",              scope: ["Owner"], grant_option: false},
        {action: "view account",                scope: ["Owner"], grant_option: false},
        {action: "view profile",                scope: ["Owner"], grant_option: false},
        {action: "activate association",        scope: [], grant_option: false},
        {action: "deactivate association",      scope: [], grant_option: false},
        {action: "view association",            scope: ["Owner"], grant_option: false},
        {action: "update measure",              scope: ["Owner"], grant_option: false},
        {action: "remove measure",              scope: ["Owner"], grant_option: false},
        {action: "view measure",                scope: ["Owner"], grant_option: false},
];
export const c_Patient_Actions = [];

export function Privilege(actions) {
        this.__actions = actions;

        this.__find = function(action, scope) {
                for (var i = 0; i < this.__actions.length; i ++) {
                        if (this.__actions[i].action == action) {
                                for (var j = 0; j < this.__actions[i].scope.length; j ++) {
                                        if (this.__actions[i].scope[j] == scope)
                                                return this.__actions[i];
                                }
                        }
                }
                return null;
        }

        this.has_action = function(action, scope) { return this.__find(action, scope) != null; }
        this.all_actions = function() { return this.__actions; }
}
