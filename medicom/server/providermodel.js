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
import {Provider, Provider_Create_From_POD} from "../api/provider.js";

export function ProviderModel(mongodb) {
        this.__mongodb = mongodb;
        this.c_Provider_Coll_Name = "ProviderCollection";
        
        this.__providers = new Mongo.Collection(this.c_Provider_Coll_Name);
        
        this.create_provider = function(account_id) {
                var provider = new Provider(account_id);
                this.__providers.insert(provider);
                return provider;
        }
        
        this.remove_provider_by_id = function(account_id) {
                this.__providers.remove({__account_id : account_id});
        }
        
        this.get_provider_by_id = function(account_id) {
                var result = this.__providers.find({__account_id : account_id});
                if (result.count() > 0) {
                        return Provider_Create_From_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.has_provider = function(account_id) {
                return this.__providers.find({__account_id : account_id}).count() > 0;
        }
        
        this.update_provider = function(provider) {
                this.__providers.update({__account_id: provider.get_account_id()}, provider);
        }
        
        this.reset = function() {
                this.__providers.remove({});
        }
}
