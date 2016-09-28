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
        private account_id:             number;
        private usergroup:              number;
        private internal_pass:          number;
        private isactive:               boolean = false;
        private authcode:               string;
        private privilege_ref:          number;

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
                this.account_id = account_id;
                this.usergroup = user_group
                this.internal_pass = password != null ? this.hash33(password) : 0;
                this.authcode = auth_code;
                this.privilege_ref = privi_ref;
        }

        public toString(): string
        {
                return "AdminRecord = [" + this.account_id + ", " + this.usergroup + ", " 
                                         + this.isactive + ", " + this.authcode + ", " + this.privilege_ref + "]";
        }

        public is_equal(other: AdminRecord): boolean
        {
                return other.account_id == this.account_id &&
                       other.privilege_ref == this.privilege_ref &&
                       other.usergroup == this.usergroup &&
                       other.internal_pass == this.internal_pass &&
                       other.isactive == this.isactive &&
                       other.authcode == this.authcode;
        }

        public set_auth_code(auth_code: string): void
        {
                this.authcode = auth_code;
        }
        
        public get_account_id(): number
        {
                return this.account_id;
        }
        
        public user_group(): number
        {
                return this.usergroup;
        }
        
        public get_auth_code(): string
        {
                return this.authcode;
        }
        
        public verify_password(password: string): boolean
        {
                return this.internal_pass == this.hash33(password);
        }
        
        public verify_internal_pass(pass: number): boolean
        {
                return this.internal_pass == pass;
        }
        
        public verify_auth_code(auth_code: string): boolean
        {
                return this.authcode == auth_code;
        }
        
        public get_internal_pass(): number
        {
                return this.internal_pass;
        }
        
        public activate(): void 
        {
                this.isactive = true;
        }
        
        public deactivate(): void
        {
                this.isactive = false;
        }
        
        public is_active(): boolean
        {
                return this.isactive;
        }
        
        public get_privilege_ref(): number
        {
                return this.privilege_ref;
        }

        public static recover(pod: any): AdminRecord
        {
                var obj = new AdminRecord(null, null, null, null, null);
                obj.account_id = pod.account_id;
                obj.privilege_ref = pod.privilege_ref;
                obj.usergroup = pod.usergroup;
                obj.internal_pass = pod.internal_pass;
                obj.isactive = pod.isactive;
                obj.authcode = pod.authcode;
                return obj;
        }
};

