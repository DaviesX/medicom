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
// Data models go here
import {Meteor} from "meteor/meteor";
import {AdminRecordManager} from "./adminrecordmanager.js";
import {ProfileManager} from "./profilemanager.js";
import {ProviderManager} from "./providermanager.js";
import * as M_AccountType from "../api/accounttype.js";


export function AccountManager(mongo, 
                               admin_record_mgr, 
                               profile_mgr, 
                               provider_mgr, 
                               patient_mgr,
                               identity_mgr) {
        this.__mongo = mongo;
        this.__admin_record_mgr = admin_record_mgr;
        this.__profile_mgr = profile_mgr;
        this.__provider_mgr = provider_mgr;
        this.__patient_mgr = patient_mgr;
        this.__identity_mgr = identity_mgr;
        
        // Public functions
        this.__make_account_derivatives = function(registered, profile) {
                // create profile.
                if (registered === null) return null;
                if (this.__profile_mgr.create_new_profile(registered.get_account_id(), profile) == null) {
                        // failed to create the profile, need to remove the record_fetched.
                        this.__admin_record_mgr.remove_record_by_id(registered.get_account_id());
                        return null;
                }
                // create account-type specific record.
                switch (registered.get_account_type()) {
                case M_AccountType.c_Account_Type_Provider:
                        this.__provider_mgr.create_provider(registered.get_account_id());
                        break;
                case M_AccountType.c_Account_Type_Patient:
                        this.__patient_mgr.create_patient(registered.get_account_id());
                        break;
                case M_AccountType.c_Account_Type_SuperIntendant:
                        throw "Unsupported Operation Exception";
                        break;
                }
                return registered;
        }
        // Return an AdminRecord if successful, or otherwise null.
        this.create_account_with_id = function(account_type, account_id, password, profile) {
                if (this.__admin_record_mgr.has_record(account_id)) return null;
                var registered = this.__admin_record_mgr.create_new_record_with_id(account_type, account_id, password);
                return this.__make_account_derivatives(registered, profile);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.create_account = function(account_type, password, profile) {
                var registered = this.__admin_record_mgr.create_new_record(account_type, password);
                return this.__make_account_derivatives(registered, profile);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_id = function(account_id) {
                return this.__admin_record_mgr.get_record_by_id(account_id);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_activator = function(activator) {
                return this.__admin_record_mgr.get_record_by_activator(activator);
        }
        
        // Return an AdminRecord if successful, or otherwise null.
        this.get_account_record_by_email = function(email) {
                var profile = this.__profile_mgr.get_profile_by_email(email);
                if (profile === null) return null;
                return this.__admin_record_mgr.get_record_by_id(profile.get_account_id());
        }
        
        // Return true if the activation is successful, false when the record doesn't exist or the activator is invalid.
        this.activate_account = function(record, activator) {
                if (record === null || !record.activate(activator)) return false;
                this.__admin_record_mgr.update_record(record);
                return true;
        }
        
        // Return true if the activation is successful, false when the record doesn't exist
        this.force_activate_account = function(record) {
                if (record === null) return false;
                record.force_activate();
                this.__admin_record_mgr.update_record(record);
                return true;
        }
        
        this.remove_account_by_id = function(account_id) {
                var record = this.__admin_record_mgr.get_record_by_id(account_id);
                if (record == null) return false;
                var account_type = record.get_account_type();
                
                switch (account_type) {
                case M_AccountType.c_Account_Type_Provider:
                        this.__provider_mgr.remove_provider_by_id(account_id);
                        break;
                case M_AccountType.c_Account_Type_Patient:
                        this.__patient_mgr.remove_patient_by_id(account_id);
                        break;
                case M_AccountType.c_Account_Type_SuperIntendant:
                        throw "Unsupported Operation Exception";
                        break;
                }
                
                this.__profile_mgr.remove_profile_by_id(account_id);
                this.__identity_mgr.remove_identities_by_account_id(account_id);
                this.__admin_record_mgr.remove_record_by_id(account_id);
                return true;
        }
        
        // Reset all the account information.
        this.reset = function() {
                this.__admin_record_mgr.reset();
                this.__profile_mgr.reset();
        }
}

