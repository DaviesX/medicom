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
import {MongoDB} from "../api/common.js";
import {AdminRecordModel} from "./adminrecordmodel.js";
import {ProfileModel} from "./profilemodel.js";
import {AccountManager} from "./accountmanager.js";
import {IdentityModel} from "./identitymodel.js";
import {ProviderModel} from "./providermodel.js";
import {PatientModel} from "./patientmodel.js";
import {SessionModel} from "./sessionmodel.js";
import {MeasureModel} from "./measuremodel.js";
import {PrivilegeNetwork} from "./privilegenetwork.js";

export function DataModelContext() {
        this.__mongodb = new MongoDB();
        this.__provider_mgr = new ProviderModel(this.__mongodb);
        this.__patient_mgr = new PatientModel(this.__mongodb);
        this.__profile_mgr = new ProfileModel(this.__mongodb);
        this.__admin_record_mgr = new AdminRecordModel(this.__mongodb);
        this.__identity_mgr = new IdentityModel(this.__mongodb, 10);
        this.__account_mgr = new AccountManager(this.__mongodb,
                                                this.__admin_record_mgr,
                                                this.__profile_mgr,
                                                this.__provider_mgr,
                                                this.__patient_mgr,
                                                this.__account_mgr);
        this.__session_mgr = new SessionModel(this.__mongodb,
                                                this.__provider_mgr,
                                                this.__patient_mgr);
        this.__measure_mgr = new MeasureModel(this.__mongodb);
        this.__priv_network = new PrivilegeNetwork();

        this.get_mongodb = function() { return this.__mongodb; }
        this.get_account_manager = function() { return this.__account_mgr; }
        this.get_admin_record_manager = function() { return this.__admin_record_mgr; }
        this.get_profile_manager = function() { return this.__profile_mgr; }
        this.get_identity_manager = function() { return this.__identity_mgr; }
        this.get_provider_manager = function() { return this.__provider_mgr; }
        this.get_patient_manager = function() { return this.__patient_mgr; }
        this.get_measure_manager = function() { return this.__measure_mgr; }
        this.get_session_model = function() { return this.__session_mgr; }
        this.get_privilege_network = function() { return this.__priv_network; }
        this.reset_all = function() {
                this.__profile_mgr.reset();
                this.__provider_mgr.reset();
                this.__patient_mgr.reset();
                this.__admin_record_mgr.reset();
                this.__identity_mgr.reset();
                this.__account_mgr.reset();
                this.__session_mgr.reset();
                this.__measure_mgr.reset();
                this.__priv_network.reset();
        }
}

// singletons
export var G_DataModelContext = new DataModelContext();

