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
// common helper functions
import { Meteor } from 'meteor/meteor';


export function ErrorMessageQueue() {
        this.__queue = [];
        
        this.log = function(message) {
                this.__queue.push(message);
        }
        
        this.is_empty = function() {
                return this.fetch_all().length == 0;
        }
        
        this.fetch_all = function() {
                var answer = [];
                for (var i = 0, j = 0; i < this.__queue.length; i ++) {
                        if (this.__queue[i] != null || this.__queue[i] == "") {
                                answer[j ++] = this.__queue[i];
                        }
                }
                return answer;
        }
        
        this.clear = function() {
                this.__queue = [];
        }
}

export function ErrorMessageQueue_Create_From_POD(pod) {
        var obj = new ErrorMessageQueue();
        obj.__queue = pod.__queue;
        return obj;
}


export function MongoDB() {
        // maintain a unique id collection
        this.c_Unique_Id_Collection = "UniqueIDCollection";
        this.__uuid_coll = null;
        
        this.__init = function() {
                if (this.__uuid_coll == null) {
                        this.__uuid_coll = new Mongo.Collection(this.c_Unique_Id_Collection);
                }
                if (this.__uuid_coll.find().count() === 0) {
                        console.log("MongoDB - It must be the first time loading the DB? Initializing Unique ID Collection");
                        this.__uuid_coll.insert({uuid : 5092});
                } else {
                        console.log("MongoDB - The Unique ID Collection exists, reusing the information");
                }
        }
        
        this.__init();

        this.get_uuid = function() {
                var entry = this.__uuid_coll.find().fetch()[0];
                var uuid = entry.uuid;
                this.__uuid_coll.update({}, {uuid : ++ entry.uuid});
                return uuid;
        }
        
        this.get_string_uuid = function() {
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
        
        this.reset = function() {
                this.__uuid_coll.remove({});
                this.__init();
        }
}
