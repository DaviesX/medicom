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

/// <reference path = "../tslib/lib.es6.d.ts" />

import {Mongo} from "meteor/mongo";
import {MongoUtil} from "../api/mongoutil";
import {Identity} from "../api/identity";
import {AdminRecord} from "../api/adminrecord";

/*
 * <IdentityModel> Identities persistent storage.
 */
export class IdentityModel
{
        private m_util:                 MongoUtil;
        private m_session_out:          number;
        private m_identities:           Mongo.Collection<Identity>;
        private IN_MEMORY:              boolean = true;

        private m_mem_identities:       Map<string, Identity>;

        // Persistent storage management.
        
        private insert(iden: Identity): void
        {
                if (this.IN_MEMORY)
                        this.m_mem_identities.set(iden.get_session_id(), iden);
                else
                        this.m_identities.insert(iden);
        }

        private get_by_session_id(session_id: string): Identity
        {
                if (this.IN_MEMORY)
                        return this.m_mem_identities.get(session_id);
                else {
                        var iden = this.m_identities.findOne({session_id: session_id}); 
                        return iden != null ? Identity.recover(iden) : null;
                }
        }

        private get_by_account_id(account_id: number): Array<Identity>
        {
                if (this.IN_MEMORY) {
                        var r = new Array<Identity>();
                        this.m_mem_identities.forEach(function (v: Identity, k: string, m: Map<string, Identity>) {
                                if (v.get_account_record().get_account_id() == account_id)
                                        r.push(v);
                        });
                        return r;
                } else {
                        var result = this.m_identities.find({"record.account_id": account_id});
                        if (result.count() > 0) {
                                var identities = [];
                                var result_set = result.fetch();
                                for (var i = 0; i < result.count(); i ++)
                                        identities[i] = Identity.recover(result_set[i]);
                                return identities;
                        } else
                                return null;
                }
        }

        private update(iden: Identity): void
        {
                if (this.IN_MEMORY)
                        this.m_mem_identities.set(iden.get_session_id(), iden);
                else
                        this.m_identities.update({session_id: iden.get_session_id()}, iden);
        }

        private remove_by_session_id(session_id: string): number 
        {
                if (this.IN_MEMORY)
                        return this.m_mem_identities.delete(session_id) ? 1 : 0;
                else
                        return this.m_identities.remove({session_id : session_id});
        }

        private remove_by_account_id(account_id: number): number
        {
                if (this.IN_MEMORY) {
                        var r = new Array<string>();
                        this.m_mem_identities.forEach(function (v: Identity, k: string, m: Map<string, Identity>) {
                                if (v.get_account_record().get_account_id() == account_id)
                                        r.push(k);
                        });
                        for (var i = 0; i < r.length; i ++)
                                this.m_mem_identities.delete(r[i]);
                        return r.length;
                } else
                        return this.m_identities.remove({"record.account_id": account_id});
        }

        private remove_all(): number
        {
                if (this.IN_MEMORY) {
                        var n = this.m_mem_identities.size;
                        this.m_mem_identities.clear();
                        return n;
                } else
                        return this.m_identities.remove({});
        }
        
        // Utils 

        private minute2milli(min: number): number
        {
                return min*60*1000;
        }

        private elevate(identity: Identity, record: AdminRecord): Identity
        {
                if (record == null)
                        throw new Error("Logic error: elevating to a null record");
                identity.elevate(record);
                this.update(identity);
                return identity;
        }

        // APIs

        constructor(util: MongoUtil, interval: number)
        {
                this.m_util = util;
                this.m_session_out = this.minute2milli(interval);
                this.m_identities = new Mongo.Collection<Identity>("Identities");
                this.m_mem_identities = new Map<string, Identity>();
        }

        public verify_identity(identity: Identity): void 
        {
                if (identity == null)
                        throw new Error("No identity specified");

                var db_iden = this.get_by_session_id(identity.get_session_id());
                if (db_iden == null)
                        throw new Error("Identity doesn't exist in our record, Detail: " + identity.toString());
        
                var db_account = db_iden.get_account_record();
                var param_account = identity.get_account_record();
                if (db_account.get_account_id() !== param_account.get_account_id() ||
                    !db_account.verify_internal_pass(param_account.get_internal_pass()) ||
                    !db_account.is_active())
                        throw new Error("Identity doesn't match that in the database");
        
                var curr_time = new Date();
                var inactive_intv = curr_time.getTime() - db_iden.get_last_date().getTime();
                if (inactive_intv < 0 || inactive_intv > this.m_session_out) {
                        // Time out, needs to remove this identity.
                        this.remove_by_session_id(db_iden.get_session_id());
                        throw new Error("The identity has been sessioned out");
                }
                db_iden.update_date();
                this.update(db_iden);
        }

        public create_identity(record: AdminRecord): Identity
        {
                if (record == null)
                        throw new Error("Logic error: creating an identity with null record");
                var identity = new Identity(this.m_util.get_string_uuid(), record);
                this.insert(identity);
                return identity;
        }

        public elevate_by_user_password(identity: Identity, 
                                        record: AdminRecord, 
                                        password: string): Identity
        {
                if (!record.verify_password(password))
                        throw Error("Invalid password");
                return this.elevate(identity, record);
        }

        public elevate_by_identity_auth_code(identity: Identity, 
                                             auth_code: string, 
                                             record: AdminRecord): Identity
        {
                if (identity == null || !identity.get_account_record().verify_auth_code(auth_code))
                        throw new Error("Invalid auth code: " + auth_code);
                return this.elevate(identity, record);
        }

        public descend(identity: Identity): Identity
        {
                identity.descend();
                this.update(identity);
                return identity;
        }

        public logout(identity: Identity): void
        {
                this.remove_by_session_id(identity.get_session_id());
        }

        public get_identity_by_session_id(session_id: string): Identity
        {
                return this.get_by_session_id(session_id);
        }

        public get_identities_by_account_id(account_id: number): Array<Identity>
        {
                return this.get_by_account_id(account_id);
        }

        public remove_identities_by_account_id(account_id: number): number
        {
                return this.remove_by_account_id(account_id);
        }

        // Reset all the identity records.
        public reset(): number
        {
                return this.remove_all();
        }
};

