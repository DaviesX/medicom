import {ErrorMessageQueue, MongoDB} from './common.js'
import {AdminRecord} from './adminrecord.js'
import {Profile} from './profile.js'
import {AccountManager} from './accountmanager.js'
import {IdentityManager} from './identitymanager.js'
import {AccountInfo, AccountControl} from './accountcontrol.js'
import * as M_AccountControl from "./accountcontrol.js"
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js"


// test cases
export function TestAccountControl() {
        console.log("TestAccountControl - begins");
        console.log("TestAccountControl - reset database");
        
        G_DataModelContext.get_mongodb().reset();
        G_DataModelContext.get_account_manager().reset();
        G_DataModelContext.get_identity_manager().reset();
        
        console.log("TestAccountControl - creating account");
        var acc_ctrl = new AccountControl();
        var profile = new Profile("example@mail.org", "Chifeng Wen", "424-299-7492", null, "Hello World!");
        var err = new ErrorMessageQueue();
        var account_info = acc_ctrl.register(M_AccountControl.c_Account_Type_Provider, "12345abcde", profile, err);
        console.log("created record: ");
        console.log(account_info);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - creating the same account(error expected).");
        var account_info2 = acc_ctrl.register(M_AccountControl.c_Account_Type_Provider, "12345abcde", profile, err);
        console.log("created record: ");
        console.log(account_info2);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - try to activate the account");
        var record = G_DataModelContext.get_account_manager().get_account_record_by_id(account_info.get_account_id());
        if (!acc_ctrl.activate(record.__activator, err)) {
                console.log("TestAccountControl - Failed to activate the account when it should, error: " + err.fetch_all());
        }
        
        console.log("TestAccountControl - try to login the account");
        var identity = acc_ctrl.login_by_email("example@mail.org", "12345abcde", err);
        console.log("identity retrieved: ");
        console.log(identity);
        console.log("error: " + err.fetch_all());
        console.log("TestAccountControl - ends");
}
