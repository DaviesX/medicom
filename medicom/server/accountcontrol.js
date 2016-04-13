import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "./common.js"
import {AdminRecord} from "./adminrecord.js"
import {Profile} from "./profile.js"
import {AccountManager} from "./accountmanager.js"
import {IdentityManager} from "./identitymanager.js"
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js"


// constants
export var c_Account_Type_Admin = 0;
export var c_Account_Type_Provider = 1;
export var c_Account_Type_Patient = 2;
export var c_Account_Type_SuperIntendant = 3;

export var c_Account_Type2String = [];
c_Account_Type2String[c_Account_Type_Admin] = "admin";
c_Account_Type2String[c_Account_Type_Provider] = "provider";
c_Account_Type2String[c_Account_Type_Patient] = "patient";
c_Account_Type2String[c_Account_Type_SuperIntendant] = "super intendant";

export var c_String2Account_type = [];
c_String2Account_type["admin"] = c_Account_Type_Admin;
c_String2Account_type["provider"] = c_Account_Type_Provider;
c_String2Account_type["patient"] = c_Account_Type_Patient;
c_String2Account_type["super intendant"] = c_Account_Type_SuperIntendant;



export function AccountInfo(record, account_id, name, email) {
        this.__record = record;
        this.__account_id = account_id;
        this.__name = name;
        this.__email = email;
        this.get_record = function() { return this.__record; }
        this.get_account_id = function() { return this.__account_id; }
        this.get_name = function() { return this.__name; }
        this.get_email = function() { return this.__email; }
}

export function AccountControl() {
        this.__c_Admin_Account_ID = -1;
        this.__c_Admin_Account_Password = "42f2d30a-f9fc-11e5-86aa-5e5517507c66";
        // Create a super user account
        G_DataModelContext.get_account_manager().create_account_with_id(
                                                        c_Account_Type_Admin,
                                                        this.__c_Admin_Account_ID,
                                                        this.__c_Admin_Account_Password,
                                                        new Profile("", "",  "", "", null, ""));

        // Public APIs
        // Return account info if successful, or otherwise null.
        this.register = function(saccount_type, email, name, phone, password, err) {
                var account_type = c_String2Account_type[saccount_type];
                switch (account_type) {
                case c_Account_Type_Admin:
                        err.log("Cannot register an admin account");
                        return null;
                case c_Account_Type_SuperIntendant:
                        err.log("Cannot register a super intendant, but it can be made");
                        return null;
                default:
                        // Build an initial profile.                
                        var profile = new Profile(email, name, phone, null, "");
                        var record = G_DataModelContext.get_account_manager().create_account(
                                                        account_type, password, profile);
                        if (!record) {
                                err.log("Cannot register, account existed");
                                return null;
                        }
                        var account_info = new AccountInfo(record,
                                                           record.get_account_id(),
                                                           profile.get_name(),
                                                           profile.get_email());
                        return account_info;
                }
        }
        
        this.make_account = function(identity, saccount_type, email, name, phone, password, err) {
                var account_type = c_String2Account_type[saccount_type];
                
                // Build an initial profile.                
                var profile = new Profile(email, name, phone, null, "");
                var record = G_DataModelContext.get_account_manager().create_account(
                                                account_type, password, profile);
                if (!record) {
                        err.log("Cannot register, account existed");
                        return null;
                }
                var account_info = new AccountInfo(record,
                                                   record.get_account_id(),
                                                   profile.get_name(),
                                                   profile.get_email());
                return account_info;
        }
        
        this.get_all_account_infos = function(identity) {
        }
        
        this.remove_account = function(identity, account_id, err) {
        }
        
        // Return an identity if successful, or otherwise null.
        this.login_by_email = function(email, password, err) {
                var record = G_DataModelContext.get_account_manager().get_account_record_by_email(email);
                var identity = G_DataModelContext.get_identity_manager().login(record, password);
                if (identity === null) {
                        err.log("Invalid user name/password");
                        return null;
                }
                return identity;
        }
        
        // Return an identity if successful, or otherwise null.
        this.login_by_account_id = function(account_id, password, err) {
                var record = G_DataModelContext.get_account_manager().get_account_record_by_id(account_id);
                var identity = G_DataModelContext.get_identity_manager().login(record, password);
                if (identity === null) {
                        err.log("Invalid user name/password");
                        return null;
                }
                return identity;       
        }
        
        this.logout = function(identity, err) {
                if (!G_DataModelContext.get_account_manager().verify_identity(identity))
                        err.log("The identity is invalid");
                G_DataModelContext.get_identity_manager().logout(identity);
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.activate = function(activator, err) {
                var record = G_DataModelContext.get_account_manager().get_account_record_by_activator(activator);
                if (!G_DataModelContext.get_account_manager().activate_account(record, activator)) {
                        err.log("Failed to activate, possbily due to an invalid activator: " + activator);
                        return false;
                }
                return true;
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.force_activate = function(identity, account_id, err) {
                if (!G_DataModelContext.get_identity_manager().verify(identity)) {
                        err.log("Your identity is invalid, please try to login");
                }
                var record = identity.get_account_record();
                if (!record) {
                        err.log("Your account is invalid");
                        return false;
                }
                if (record.get_account_type() !== c_Account_Type_Admin) {
                        err.log("It needs to be the administrator to force activate an account");
                        return false;
                }
                if (!G_DataModelContext.get_account_manager().force_activate_account(record)) {
                        err.log("No such account to activate");
                        return false;
                }
                return true;
        }
}
