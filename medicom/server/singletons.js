import {MongoDB} from './common.js'
import {AccountManager} from './accountmanager.js'
import {IdentityManager} from './identitymanager.js'

// singletons
export var g_mongo = new MongoDB();
export var g_account_mgr = new AccountManager(g_mongo);
export var g_identity_mgr = new IdentityManager(g_mongo);

// constants
export var c_Account_Type_Admin = 0;
export var c_Account_Type_Provider = 1;
export var c_Account_Type_Patient = 2;

export var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";

export var c_Admin_Account_ID = -1;
export var c_Admin_Account_Password = "42f2d30a-f9fc-11e5-86aa-5e5517507c66";
