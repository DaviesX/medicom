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
import {Meteor} from "meteor/meteor";
import {Profile, Profile_create_from_POD} from "../api/profile.js";


export function ProfileModel(mongodb) {
        this.__mongodb = mongodb;

        this.c_Profile_Coll_Name = "ProfileCollection";
        this.__profiles = new Mongo.Collection(this.c_Profile_Coll_Name);
}

ProfileModel.prototype.has_profile = function(profile)
{
        return this.__profiles.find({__account_id : profile.get_account_id()}).count() > 0 ||
               this.__profiles.find({__email : profile.get_email()}).count() > 0;
}

ProfileModel.prototype.create_new_profile = function(account_id, email)
{
        var profile = new Profile(account_id, email);
        if (this.has_profile(profile))
                // profile has already existed.
                return null;
        this.__profiles.insert(profile);
        return profile;
}

ProfileModel.prototype.get_profile_by_id = function(account_id)
{
        var result = this.__profiles.find({__account_id : account_id});
        if (result.count() > 0) {
                return Profile_create_from_POD(result.fetch()[0]);
        } else {
                return null;
        }
}

ProfileModel.prototype.get_profile_by_email = function(email)
{
        var result = this.__profiles.find({__email : email});
        if (result.count() > 0) {
                return Profile_create_from_POD(result.fetch()[0]);
        } else {
                return null;
        }
}

ProfileModel.prototype.update_profile = function(profile)
{
        this.__profiles.update({__account_id : profile.get_account_id()}, profile);
}

ProfileModel.prototype.remove_profile_by_id = function(id)
{
        this.__profiles.remove({__account_id : id});
}

ProfileModel.prototype.reset = function()
{
        this.__profiles.remove({});
}
