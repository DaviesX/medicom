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

export enum UserGroupConst
{
        Root,
        Admin,
        Provider,
        Patient,
        Assistant,
        Temporary,
};

/*
 * <UserGroup> Represents a user group.
 */
export class UserGroup
{
        public user_group:      number;

        constructor(user_group: number)
        {
                if (user_group < 0 || user_group > 5)
                        throw new Error("Unknown user group " + user_group);
                else
                        this.user_group = user_group;
        }

        public is(group: number): boolean
        {
                return this.user_group == group;
        }

        public what(): number
        {
                return this.user_group;
        }

        public to_string(): string
        {
                switch (this.user_group) {
                        case 0: return "root";
                        case 1: return "admin";
                        case 2: return "provider";
                        case 3: return "patient";
                        case 4: return "assistant";
                        case 5: return "temporary";
                        default:        throw new Error("Unknown user group " + this.user_group);
                }
        }

        public from_string(s: string): number 
        {
                switch (s) {
                        case "root":            return this.user_group = UserGroupConst.Root;
                        case "admin":           return this.user_group = UserGroupConst.Admin;
                        case "provider":        return this.user_group = UserGroupConst.Provider;
                        case "patient":         return this.user_group = UserGroupConst.Patient;
                        case "assistant":       return this.user_group = UserGroupConst.Assistant;
                        case "temporary":       return this.user_group = UserGroupConst.Temporary;
                        default:                throw new Error("Unknown user group string " + s);
                }
        }
}

// An array of registerable user groups.
export function user_group_get_registerable(): Array<UserGroup>
{
        var a = new Array<UserGroup>();
        a.push(new UserGroup(2));
        a.push(new UserGroup(3));
        a.push(new UserGroup(4));
        return a;
}
