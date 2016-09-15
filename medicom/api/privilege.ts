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

import {UserGroupConst} from "./usergroup.ts";

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
        {action: "register account",            scope: [-2, UserGroupConst.Patient], grant_option: false},
        {action: "activate account",            scope: [-2, UserGroupConst.Patient], grant_option: false},
        {action: "search account",              scope: [-2], grant_option: false},
        {action: "view profile",                scope: [-2], grant_option: false},
        {action: "view session",                scope: [-2], grant_option: false},
        {action: "create association",          scope: [-2, UserGroupConst.Patient], grant_option: false},
        {action: "remove association",          scope: [-1], grant_option: false},
        {action: "search association",          scope: [-1], grant_option: false},
        {action: "add session",                 scope: [-2], grant_option: false},
        {action: "search session",              scope: [-1], grant_option: false},
        {action: "view session",                scope: [-1], grant_option: false},
        {action: "update measure",              scope: [-1], grant_option: false},
        {action: "view measure",                scope: [-1], grant_option: false},
];

export const c_Provider_Actions = [
        {action: "register account",            scope: [-2, UserGroupConst.Patient], grant_option: false},
        {action: "activate account",            scope: [-2, UserGroupConst.Patient], grant_option: false},
        {action: "search account",              scope: [-2, UserGroupConst.Patient], grant_option: false},
        {action: "view profile",                scope: [-2], grant_option: false},
        {action: "create association",          scope: [-2, UserGroupConst.Patient], grant_option: false},
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

/*
 * <PrivilegeAction>
 */
export class PrivilegeAction
{
        public action:                string;
        public scope_set:             Array<number>;
        public with_grant_option:     boolean;

        // Parse special scopes.
        private replace_special_scope(scope_set: Array<number>, node_ref: number): void
        {
                for (var i = 0; i < scope_set.length; i ++)
                        if (scope_set[i] == -2)
                                scope_set[i] = node_ref;
        }

        constructor(node_ref: number, action: string, scope_set: Array<number>, with_grant_option: boolean)
        {
                this.action = action;
                this.scope_set = scope_set;
                this.with_grant_option = with_grant_option;

                if (scope_set != null)
                        this.replace_special_scope(this.scope_set, node_ref);
        }

        public get_action(): string
        {
                return this.action;
        }
        
        public get_scope_set(): Array<number>
        {
                return this.scope_set;
        }
        
        public set_grant_option(with_grant_option: boolean): void
        {
                this.with_grant_option = with_grant_option;
        }
        
        public has_grant_option(): boolean
        {
                return this.with_grant_option;
        }
        
        public add_scope(scope: number, node_ref: number): boolean 
        {
                if (this.is_in_scope(scope))
                        return false;
                this.scope_set.push(scope);
                this.replace_special_scope(this.scope_set, node_ref);
                return true;
        }
        
        public remove_scope(scope: number): void
        {
                var target = this.scope_set.length;
                for (var i = 0; i < this.scope_set.length; i ++) {
                        if (this.scope_set[i] == scope) {
                                target = i;
                                break;
                        }
                }
                var last;
                for (last = target; last < this.scope_set.length - 1; last ++)
                        this.scope_set[last] = this.scope_set[last + 1];
                this.scope_set = this.scope_set.slice(last);
        }
        
        public is_in_scope(scope: number): boolean
        {
                for (var i = 0; i < this.scope_set.length; i ++) {
                        if (this.scope_set[i] == -1 || this.scope_set[i] == scope)
                                return true;
                }
                return false;
        }
        
        public is_inclusive_scope_set(scope_set: Array<number>): boolean
        {
                for (var i = 0; i < scope_set.length; i ++) {
                        if (!this.is_in_scope(scope_set[i]))
                                return false;
                }
                return true;
        }
        
        public is_action_compatible(action: string): boolean
        {
                return this.action == action;
        }
};

export function privilege_action_copy(pod): PrivilegeAction
{
        var obj = new PrivilegeAction(null, null, null, null);
        obj.action = pod.action;
        obj.scope_set = pod.scope_set;
        obj.with_grant_option = pod.with_grant_option;
        return obj;
}

/*
 * <Privilege> Sets of actions.
 */
export class Privilege
{
        public actions: Array<PrivilegeAction>;

        constructor(actions)
        {
                this.actions = actions;
        }

        public has_action(action: string, scope: number): boolean
        {
                return this.find(action, scope) != null;
        }
        
        public all_actions(): Array<PrivilegeAction>
        {
                return this.actions;
        }
        
        public find(action: string, scope: number): PrivilegeAction
        {
                for (var i = 0; i < this.actions.length; i ++) {
                        if (this.actions[i].action == action) {
                                if (scope != null) {
                                        for (var j = 0; j < this.actions[i].scope_set.length; j ++) {
                                                if (this.actions[i].scope_set[j] == scope)
                                                        return this.actions[i];
                                        }
                                } else
                                        return this.actions[i];
                        }
                }
                return null;
        }
};

export function privilege_copy(pod): Privilege
{
        var obj = new Privilege(null);
        obj.actions = pod.actions;
        for (var i = 0; i < obj.actions.length; i ++)
                obj.actions[i] = privilege_action_copy(obj.actions[i]);
        return obj;
}
