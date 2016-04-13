import {MongoDB} from './common.js'
import {AccountManager} from './accountmanager.js'
import {IdentityManager} from './identitymanager.js'

export function DataModelContext() {
        this.__mongodb = new MongoDB();
        this.__account_mgr = new AccountManager(this.__mongodb);
        this.__identity_mgr = new IdentityManager(this.__mongodb, this.__account_mgr, 10);
        
        this.get_mongodb = function() { return this.__mongodb; }
        this.get_account_manager = function() { return this.__account_mgr; }
        this.get_identity_manager = function() { return this.__identity_mgr; }
}

// singletons
export var G_DataModelContext = new DataModelContext();

