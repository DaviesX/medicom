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
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {c_Account_Type_Patient} from "../api/accounttype.js";


export function PatientControl() {

        this.__has_patient_identity = function(identity) {
                return (G_DataModelContext.get_identity_manager().verify_identity(identity)) &&
                       (identity.get_account_record().get_account_type() == c_Account_Type_Patient);
        }
        
        this.__get_patient_from_identity = function(identity) {
                return G_DataModelContext.get_patient_manager().
                                get_patient_by_id(identity.get_account_record().get_account_id);
        }
        
        this.__get_patient_id_from_identity = function(identity, err) {
                if (!this.__has_patient_identity(identity)) {
                        err.log("Your identity is invalid");
                        return null;
                }
                return identity.get_account_record().get_account_id();
        }
        
        // Patients don't need these operations
//        this.add_provider = function(identity, provider_id, err) {
//                var patient_id = this.__get_patient_id_from_identity(identity, err);
//                if (patient_id == null) return null;
//                else                    return this.__session_utils.add_relation(provider_id, patient_id, err);
//        }
//        
//        this.start_new_session_with = function(identity, provider_id, err) {
//                var patient_id = this.__get_patient_id_from_identity(identity, err);
//                if (patient_id == null) return null;
//                else                    return this.__session_utils.start_new_session_with(provider_id, patient_id, err);
//        }
//        
//        this.end_session = function(identity, session_id, err) {
//                var patient_id = this.__get_patient_id_from_identity(identity, err);
//                if (patient_id == null) return null;
//                else                    return this.__session_utils.end_session(session_id, err);
//        }
//        
//        this.recover_session = function(identity, session_id, err) {
//                var patient_id = this.__get_patient_id_from_identity(identity, err);
//                if (patient_id == null) return null;
//                else                    return this.__session_utils.recover_session(session_id, err);
//        }
        // removal may not be allowed.
//        this.remove_provider = function(identity, provider_id, err) {
//                var patient_id = this.__get_patient_id_from_identity(identity, err);
//                if (patient_id == null) return false;
//                else { 
//                        this.__session_utils.remove_relation(provider_id, patient_id, err);
//                        return true;
//                }
//        }

        this.get_participated_provider_ids = function(identity, err) {
                var patient_id = this.__get_patient_id_from_identity(identity, err);
                if (patient_id == null) return null;
                else                    return this.__session_utils.get_participated_provider_ids(
                                                        patient_id, err);
        }
        
        this.get_sessions_by_provider_id = function(identity, patient_id, err) {
                var patient_id = this.__get_patient_id_from_identity(identity, err);
                if (patient_id == null) return null;
                else                    return this.__session_utils.get_sessions(provider_id, patient_id, err);
        }
}

