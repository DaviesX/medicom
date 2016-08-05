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

import {Association, Association_create_from_POD} from "../api/association.js";

export function AssociationModel()
{
        this.__associations = new Mongo.Collection("AssociationCollection");
}

AssociationModel.prototype.has_association = function(user_pair)
{
        return null != this.__associations.findOne({__user0: user_pair[0], __user1: user_pair[1]});
}

AssociationModel.prototype.create_association = function(user_pair)
{
        if (this.has_association(user_pair))
                return null;
        var assoc = new Association(user_pair[0], user_pair[1], null);
        this.__associations.insert(assoc);
        return assoc;
}

AssociationModel.prototype.has_associated_session = function(user_pair, session_id)
{
        return null != this.__associations.findOne({__user0: user_pair[0], __user1: user_pair[1], __session_id: session_id});
}

AssociationModel.prototype.get_associated_association = function(user_pair, session_id)
{
        var assoc = this.__associations.findOne({__user0: user_pair[0], __user1: user_pair[1], __session_id: session_id});
        return assoc != null ? Association_create_from_POD(assoc) : null;
}

AssociationModel.prototype.add_association = function(user_pair, session_id)
{
        var assoc = this.get_associated_association(user_pair, session_id);
        if (assoc != null)
                return assoc;
        assoc = this.get_associated_association(user_pair, null);
        if (assoc != null) {
                assoc.set_session_id(session_id);
                this.__associations.update({__user0: user_pair[0], __user1: user_pair[1], __session_id: null}, assoc);
                return assoc;
        } else {
                assoc = new Association(user_pair[0], user_pair[1], session_id);
                this.__associations.insert(assoc);
                return assoc;
        }
}

AssociationModel.prototype.__generate_associations_from_result = function(result)
{
        if (result.count() > 0) {
                var result_set = result.fetch();
                for (var i = 0; i < result_set.length; i ++)
                        result_set[i] = Association_create_from_POD(result_set[i]);
                return result_set;
        } else
                return null;
}

AssociationModel.prototype.get_associations = function(user_pair)
{
        return this.__generate_associations_from_result(
                this.__associations.find({__user0: user_pair[0], __user1: user_pair[1]}));
}

AssociationModel.prototype.get_associations_by_first = function(first)
{
        return this.__generate_associations_from_result(
                        this.__associations.find({__user0: first}));
}

AssociationModel.prototype.get_associations_by_second = function(second)
{
        return this.__generate_associations_from_result(
                        this.__associations.find({__user1: second}));
}

AssociationModel.prototype.remove_associations = function(user_pair)
{
        this.__associations.remove({__user0: user_pair[0], __user1: user_pair[1]});
}

AssociationModel.prototype.remove_associations_by_session_id = function(session_id)
{
        this.__associations.remove({__session_id: session_id});
}

AssociationModel.prototype.reset = function()
{
        this.__associations.remove({});
}
