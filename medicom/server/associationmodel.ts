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

import {Mongo} from "meteor/mongo";
import {Association, association_copy} from "../api/association.ts";

export class AssociationModel
{
        private associations:   Mongo.Collection<Association>;

        constructor()
        {
                this.associations = new Mongo.Collection<Association>("Associations");
        }

        public has_association(user_pair: [number, number]): boolean
        {
                return null != this.associations.findOne({user0: user_pair[0], user1: user_pair[1]});
        }
        
        public create_association(user_pair: [number, number]): Association
        {
                if (this.has_association(user_pair))
                        return null;
                var assoc = new Association(user_pair[0], user_pair[1], null);
                return this.associations.insert(assoc) ? assoc : null;
        }
        
        public has_associated_session(user_pair: [number, number], session_id: number): boolean
        {
                return null != this.associations.findOne({user0: user_pair[0], user1: user_pair[1], session_id: session_id});
        }
        
        public get_associated_association(user_pair: [number, number], session_id: number): Association
        {
                var assoc = this.associations.findOne({user0: user_pair[0], user1: user_pair[1], session_id: session_id});
                return assoc != null ? association_copy(assoc) : null;
        }
        
        public add_association(user_pair: [number, number], session_id: number): Association 
        {
                var assoc = this.get_associated_association(user_pair, session_id);
                if (assoc != null)
                        return assoc;
                assoc = this.get_associated_association(user_pair, null);
                if (assoc != null) {
                        assoc.set_session_id(session_id);
                        this.associations.update({user0: user_pair[0], user1: user_pair[1], session_id: null}, assoc);
                        return assoc;
                } else {
                        assoc = new Association(user_pair[0], user_pair[1], session_id);
                        this.associations.insert(assoc);
                        return assoc;
                }
        }
        
        private generate_associations_from_result(result: Mongo.Cursor<Association>): Array<Association>
        {
                if (result.count() > 0) {
                        var result_set = result.fetch();
                        var a = new Array<Association>();
                        for (var i = 0; i < result_set.length; i ++)
                                a[i] = association_copy(result_set[i]);
                        return a;
                } else
                        return null;
        }
        
        public get_associations(user_pair: [number, number]): Array<Association>
        {
                return this.generate_associations_from_result(
                        this.associations.find({user0: user_pair[0], user1: user_pair[1]}));
        }
        
        public get_associations_by_first(first: number): Array<Association>
        {
                return this.generate_associations_from_result(
                                this.associations.find({user0: first}));
        }
        
        public get_associations_by_second(second: number): Array<Association>
        {
                return this.generate_associations_from_result(
                                this.associations.find({user1: second}));
        }
        
        public remove_associations(user_pair: [number, number]): number
        {
                return this.associations.remove({user0: user_pair[0], user1: user_pair[1]});
        }
        
        public remove_associations_by_session_id(session_id: number): number
        {
                return this.associations.remove({session_id: session_id});
        }
        
        public reset(): number
        {
                return this.associations.remove({});
        }
};

