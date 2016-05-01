import {Meteor} from "meteor/meteor";
import {Provider, Provider_Create_From_POD} from "../api/provider.js";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";

export function ProviderManager(mongodb) {
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
        
        this.update_provider = function(provider) {
                this.__providers.update({__account_id: provider.get_account_id()}, provider);
        }
}
