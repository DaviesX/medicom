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

export class AdminRecord implements IDataTransaction
{
        public m_account_id:            number;
        public m_user_group:            number;
        public m_internal_pass:         number;
        public m_is_active:             boolean = false;
        public m_auth_code:             string;
        public m_privi_ref:             number;

        private hash33(s: string): number
        {
                var h = 5381;
                for (var i = 0; i < s.length; i ++) {
                        var c = s.charCodeAt(i);
                        h = ((h << 5) + h) + c;
                }
                return h >>> 0;
        }

        constructor(account_id: number, user_group: number, password: string, auth_code: string, privi_ref: number)
        {
                this.m_account_id = account_id;
                this.m_user_group = user_group
                this.m_internal_pass = password != null ? this.hash33(password) : 0;
                this.m_auth_code = auth_code;
                this.m_privi_ref = privi_ref;
        }

        public is_equal(other: AdminRecord): boolean
        {
                return other.m_account_id == this.m_account_id &&
                       other.m_privi_ref == this.m_privi_ref &&
                       other.m_user_group == this.m_user_group &&
                       other.m_internal_pass == this.m_internal_pass &&
                       other.m_is_active == this.m_is_active &&
                       other.m_auth_code == this.m_auth_code;
        }

        public set_auth_code(auth_code: string): void
        {
                this.m_auth_code = auth_code;
        }
        
        public get_account_id(): number
        {
                return this.m_account_id;
        }
        
        public user_group(): number
        {
                return this.m_user_group;
        }
        
        public get_auth_code(): string
        {
                return this.m_auth_code;
        }
        
        public verify_password(password: string): boolean
        {
                return this.m_internal_pass == this.hash33(password);
        }
        
        public verify_internal_pass(pass: number): boolean
        {
                return this.m_internal_pass == pass;
        }
        
        public verify_auth_code(auth_code: string): boolean
        {
                return this.m_auth_code == auth_code;
        }
        
        public get_internal_pass(): number
        {
                return this.m_internal_pass;
        }
        
        public activate(): void 
        {
                this.m_is_active = true;
        }
        
        public deactivate(): void
        {
                this.m_is_active = false;
        }
        
        public is_active(): boolean
        {
                return this.m_is_active;
        }
        
        public get_privilege_ref(): number
        {
                return this.m_privi_ref;
        }
}

export function admin_record_copy(pod)
{
        var obj = new AdminRecord(null, null, null, null, null);
        obj.m_account_id = pod.m_account_id;
        obj.m_privi_ref = pod.m_privi_ref;
        obj.m_user_group = pod.m_user_group;
        obj.m_internal_pass = pod.m_internal_pass;
        obj.m_is_active = pod.m_is_active;
        obj.m_auth_code = pod.m_auth_code;
        return obj;
}
