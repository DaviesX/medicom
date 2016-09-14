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

import {IDataTransaction} from "./idatatransaction.ts";

/*
 * <Profile> Represents user profile storage object.
 */
export class Profile implements IDataTransaction
{
        public account_id:      number;
        public email:           string;
        public name:            string = "";
        public phone:           string = "";
        public avatar:          any = null;
        public description:     string = "";

        constructor(account_id: number, email: string)
        {
                this.account_id = account_id;
                this.email = email;
        }

        public set_name(name: string): void
        {
                this.name = name;
        }

        public set_phone(phone: string): void
        {
                this.phone = phone;
        }

        public set_description(description: string): void
        {
                this.description = description;
        }

        public set_avatar(avatar: any): void
        {
                this.avatar = avatar;
        }

        public get_account_id(): number
        {
                return this.account_id;
        }

        public get_email(): string
        {
                return this.email;
        }

        public get_name(): string
        {
                return this.name;
        }

        public get_phone(): string
        {
                return this.phone;
        }

        public get_description(): string
        {
                return this.description;
        }
        
        public get_avatar(): any
        {
                return this.avatar;
        }
}

export function profile_copy(pod): Profile
{
        var obj = new Profile(null, null);
        obj.account_id = pod.account_id;
        obj.email = pod.email;
        obj.name = pod.name;
        obj.phone = pod.phone;
        obj.avatar = pod.avatar;
        obj.description = pod.description;
        return obj;
}

