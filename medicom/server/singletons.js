import {MongoDB} from './common.js'
import {AccountManager} from './accountmanager.js'
import {IdentityManager} from './identitymanager.js'

// singletons
export var g_mongo = new MongoDB();
export var g_account_mgr = new AccountManager(g_mongo);
export var g_identity_mgr = new IdentityManager(g_mongo);


// Controllers
// constants
export var c_Account_Type_Admin = 0;
export var c_Account_Type_Provider = 1;
export var c_Account_Type_Patient = 2;

export var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";
