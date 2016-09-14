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

/// <reference path="../tslib/main.d.ts" />

import {Mongo} from "meteor/mongo";

class UUID
{            
        public uuid: number;

        constructor(uuid: number)
        {
                this.uuid = uuid;
        }
}

export class MongoUtil 
{
        // maintain a unique id collection
        private m_uuid_coll:    Mongo.Collection<UUID> = null;

        private init_uuid(): void
        {
                if (this.m_uuid_coll == null) {
                        this.m_uuid_coll = new Mongo.Collection<UUID>("UniqueIDCollection");
                }
                if (this.m_uuid_coll.find().count() === 0) {
                        console.log("MongoDB - It must be the first time loading the DB? Initializing Unique ID Collection");
                        this.m_uuid_coll.insert(new UUID(5092));
                } else {
                        console.log("MongoDB - The Unique ID Collection exists, reusing the information");
                }
        }

        constructor()
        {
                this.init_uuid();
        }

        public get_uuid(): number
        {
                var entry = this.m_uuid_coll.findOne({});
                if (entry == null)
                        throw new Error("MongoUtil has not been initialized before use");
                var new_uuid = entry.uuid + 1;
                this.m_uuid_coll.update({}, new UUID(new_uuid));
                return new_uuid;
        }
        
        public get_string_uuid(): string
        {
                var holder = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
                var hex = '0123456789abcdef';
                var r = 0;
                var guid = "";
                for (var i = 0; i < 36; i++) {
                        if (holder[i] !== '-' && holder[i] !== '4') {
                                // each x and y needs to be random
                                r = Math.random() * 16 | 0;
                        }

                        if (holder[i] === 'x') {
                                guid += hex[r];
                        } else if (holder[i] === 'y') {
                                // clock-seq-and-reserved first hex is filtered and remaining hex values are random
                                r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??
                                r |= 0x8; // set pos 3 to 1 as 1???
                                guid += hex[r];
                        } else {
                                guid += holder[i];
                        }
                }
                return guid;
        }

        public reset(): void
        {
                this.m_uuid_coll.remove({});
                this.init_uuid();
        }
}
