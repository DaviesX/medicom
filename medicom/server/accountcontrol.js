import {Meteor} from 'meteor/meteor';
import {ErrorMessageQueue, MongoDB} from './common.js'
import {AdminRecord} from './adminrecord.js'
import {Profile} from './profile.js'
import {AccountManager} from './accountmanager.js'
import {IdentityManager} from './identitymanager.js'
import * as singletons from './singletons.js'


export function AccountInfo(account_id, name, email) {
        this.__account_id = account_id;
        this.__name = name;
        this.__email = email;
        this.get_account_id = function() { return this.__account_id; }
        this.get_name = function() { return this.__name; }
        this.get_email = function() { return this.__email; }
}

export function AccountControl() {
        // Create a super user account
        singletons.g_account_mgr.create_account_with_id(singletons.c_Account_Type_Admin,
                                                        singletons.c_Admin_Account_ID,
                                                        singletons.c_Admin_Account_Password,
                                                        new Profile("", "",  "", "", null, ""));

        // Public APIs
        // Return account info if successful, or otherwise null.
        this.register = function(account_type, password, profile, err) {
                switch (account_type) {
                case singletons.c_Account_Type_Admin:
                        err.log("Cannot register an admin account");
                        return null;
                default:
                        var record = singletons.g_account_mgr.create_account(account_type, password, profile);
                        if (!record) {
                                err.log("Cannot register, account existed");
                                return null;
                        }
                        var account_info = new AccountInfo(record.get_account_id(),
                                                           profile.get_name(),
                                                           profile.get_email());
                        return account_info;
                }
        }
        
        this.get_all_account_infos = function(identity) {
        }
        
        this.remove_account = function(identity, account_id, err) {
        }
        
        // Return an identity if successful, or otherwise null.
        this.login_by_email = function(email, password, err) {
                var record = singletons.g_account_mgr.get_account_record_by_email(email);
                var identity = singletons.g_identity_mgr.login(record, password);
                if (identity === null) {
                        err.log("Invalid user name/password");
                        return null;
                }
                return identity;
        }
        
        // Return an identity if successful, or otherwise null.
        this.login_by_account_id = function(account_id, password, err) {
                var record = singletons.g_account_mgr.get_account_record_by_id(account_id);
                var identity = singletons.g_identity_mgr.login(record, password);
                if (identity === null) {
                        err.log("Invalid user name/password");
                        return null;
                }
                return identity;       
        }
        
        this.logout = function(identity, err) {
                if (!singletons.g_account_mgr.verify_identity(identity))
                        err.log("The identity is invalid");
                singletons.g_account_mgr.logout(identity);
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.activate = function(activator, err) {
                var record = singletons.g_account_mgr.get_account_record_by_activator(activator);
                if (!singletons.g_account_mgr.activate_account(record, activator)) {
                        err.log("Failed to activate, possbily due to an invalid activator: " + activator);
                        return false;
                }
                return true;
        }
        
        // Return true if the activation is successful, or otherwise false, error message is left in the ErrorMessageQueue.
        this.force_activate = function(identity, account_id, err) {
                if (!singletons.g_identity_mgr.verify(identity)) {
                        err.log("Your identity is invalid, please try to login");
                }
                var record = identity.get_account_record();
                if (!record) {
                        err.log("Your account is invalid");
                        return false;
                }
                if (record.get_account_type() !== singletons.c_Account_Type_Admin) {
                        err.log("It needs to be the administrator to force activate an account");
                        return false;
                }
                if (!singletons.g_account_mgr.force_activate_account(record)) {
                        err.log("No such account to activate");
                        return false;
                }
                return true;
        }
}
