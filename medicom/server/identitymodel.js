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
import {Meteor} from 'meteor/meteor';
import {Identity, Identity_create_from_POD} from '../api/identity.js'


export function IdentityModel(mongo, session_out_intv)
{
        this.__mongo = mongo;
        this.__session_out_intv = this.__minute2milli(session_out_intv);

        // handle the collection
        this.c_Identity_Coll_Name = "IdentityCollection";
        this.__identities = new Mongo.Collection(this.c_Identity_Coll_Name);
}

IdentityModel.prototype.__minute2milli = function(min)
{
        return min*60*1000;
}

IdentityModel.prototype.verify_identity = function(identity)
{
        if (identity == null)
                throw Error("No identity specified");
        var result = this.__identities.find({__session_id : identity.get_session_id()});
        if (result.count() == 0)
                throw Error("Identity doesn't exist in our record");

        var db_iden = Identity_create_from_POD(result.fetch()[0]);
        var db_account = db_iden.get_account_record();
        var param_account = identity.get_account_record();
        if (db_account.get_account_id() !== param_account.get_account_id() ||
            !db_account.verify_internal_pass(param_account.get_internal_pass()) ||
            !db_account.is_active()) {
                return false;
        }

        var curr_time = new Date();
        var inactive_intv = curr_time.getTime() - db_iden.get_last_date().getTime();
        if (inactive_intv < 0 || inactive_intv > this.__session_out_intv) {
                // Time out, needs to remove this identity.
                this.__identities.remove({__session_id : identity.get_session_id()});
                return false;
        }
        db_iden.update_date();
        this.__identities.update({__session_id : db_iden.get_session_id()}, db_iden);
        return true;
}

IdentityModel.prototype.create_identity = function(record)
{
        if (record == null)
                throw new Error("Logic error: creating an identity with null record");
        return new Identity(this.__mongo.get_string_uuid(), record);
}

IdentityModel.prototype.__elevate = function(identity, record)
{
        if (record == null)
                throw Error("Logic error: elevating to a null record");
        identity.elevate(record);
        this.__identities.insert(identity);
        return identity;
}

IdentityModel.prototype.elevate_by_user_password = function(identity, record, password)
{
        if (!record.verify_password(password))
                throw Error("Invalid password");
        return this.__elevate(identity, record);
}

IdentityModel.prototype.elevate_by_identity_auth_code = function(identity, auth_code, record)
{
        if (!identity.get_account_record().verify_auth_code(auth_code))
                throw Error("Invalid auth code: " + auth_code);
        return this.__elevate(identity, record);
}

IdentityModel.prototype.descend = function(identity)
{
        identity.descend();
        this.__identities.insert(identity);
        return identity;
}

IdentityModel.prototype.logout = function(identity)
{
        this.__identities.remove({__session_id : identity.get_session_id()});
}

IdentityModel.prototype.get_identity_by_session_id = function(session_id)
{
        var result = this.__identities.find({__session_id : session_id});
        return result.count() > 0 ? Identity_create_from_POD(result.fetch()[0]) : null;
}

IdentityModel.prototype.get_identities_by_account_id = function(account_id)
{
        var result = this.__identities.find({ "__record.__account_id": account_id });
        if (result.count() > 0) {
                var identities = [];
                var result_set = result.fetch();
                for (var i = 0; i < result.count; i ++) {
                        identities[i] = Identity_create_from_POD(result_set[i]);
                }
                return identities;
        } else {
                return null;
        }
}

IdentityModel.prototype.remove_identities_by_account_id = function(account_id)
{
        this.__identities.remove({ "__record.__account_id": account_id });
}

// Reset all the identity records.
IdentityModel.prototype.reset = function()
{
        this.__identities.remove({});
}
