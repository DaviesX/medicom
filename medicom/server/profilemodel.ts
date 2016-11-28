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
import {MongoUtil} from "../api/mongoutil";
import {Profile, profile_copy} from "../api/profile";


/*
 * <ProfileModel> Profile storage model.
 */
export class ProfileModel 
{
        private m_util: MongoUtil;
        private m_profiles: Mongo.Collection<Profile>;

        constructor(util: MongoUtil)
        {
                this.m_util = util;
                this.m_profiles = new Mongo.Collection<Profile>("Profiles");
        }

        public has_profile(profile: Profile): boolean
        {
                return this.m_profiles.findOne({account_id : profile.account_id}) != null ||
                       this.m_profiles.findOne({email : profile.email}) != null;
        }

        public create_new_profile(account_id: number, email: string): Profile
        {
                var profile = new Profile(account_id, email);
                if (this.has_profile(profile))
                        // profile has already existed.
                        return null;
                return this.m_profiles.insert(profile) ? profile : null;
        }
        
        public get_all_profiles(): Array<Profile>
        {
                var profiles = this.m_profiles.find({}).fetch();
                for (var i = 0; i < profiles.length; i ++)
                        profiles[i] = profile_copy(profiles[i]);
                return profiles;
        }
        
        public get_profile_by_id(account_id: number): Profile
        {
                var result = this.m_profiles.findOne({account_id : account_id});
                return result != null ? profile_copy(result) : null;
        }
        
        public get_profile_by_email(email: string): Profile
        {
                var result = this.m_profiles.findOne({email : email});
                return result != null ? profile_copy(result) : null;
        }
        
        public update_profile(profile: Profile): number
        {
                return this.m_profiles.update({account_id : profile.account_id}, profile);
        }
        
        public remove_profile_by_id(id: number): number
        {
                return this.m_profiles.remove({account_id : id});
        }
        
        public reset(): number
        {
                return this.m_profiles.remove({});
        }
};




