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

export class Association
{
        public user0:           number;
        public user1:           number;
        public session_id:      number;

        constructor(user0: number, user1: number, session_id: number)
        {
                this.user0 = user0;
                this.user1 = user1;
                this.session_id = session_id;
        }

        public get_user_pair(): [number, number]
        {
                return [this.user0, this.user1];
        }
        
        public get_session_id(): number
        {
                return this.session_id;
        }
        
        public set_session_id(session_id: number): void
        {
                this.session_id = session_id;
        }
};

export function association_copy(pod): Association
{
        var obj = new Association(null, null, null);
        obj.user0 = pod.user0;
        obj.user1 = pod.user1;
        obj.session_id = pod.session_id;
        return obj;
}
