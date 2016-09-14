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

/*
 * <UserGroup> Represents a user group.
 */
export class UserGroup
{
        private m_user_group:   number;

        constructor(user_group: number)
        {
                if (user_group < 0 || user_group > 5)
                        throw new Error("Unknown user group " + user_group);
                else
                        this.m_user_group = user_group;
        }

        public to_string(): string
        {
                switch (this.m_user_group) {
                        case 0: return "root";
                        case 1: return "admin";
                        case 2: return "provider";
                        case 3: return "patient";
                        case 4: return "assistant";
                        case 5: return "temporary";
                }
        }

        public from_string(s: string): void
        {
                switch (s) {
                        case "root":            this.m_user_group = 0;
                        case "admin":           this.m_user_group = 1;
                        case "provider":        this.m_user_group = 2;
                        case "patient":         this.m_user_group = 3;
                        case "assistant":       this.m_user_group = 4;
                        case "temporary":       this.m_user_group = 5;
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
