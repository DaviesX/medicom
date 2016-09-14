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
import {MongoUtil} from "../api/mongoutil.ts";
import {AdminRecordModel} from "./adminrecordmodel.js";
import {ProfileModel} from "./profilemodel.js";
import {AccountManager} from "./accountmanager.js";
import {IdentityModel} from "./identitymodel.js";
import {ProviderModel} from "./providermodel.js";
import {PatientModel} from "./patientmodel.js";
import {SessionModel} from "./sessionmodel.js";
import {AssociationModel} from "./associationmodel.js";
import {SessionManager} from "./sessionmanager.js";
import {MeasureModel} from "./measuremodel.js";
import {PrivilegeNetwork} from "./privilegenetwork.js";

export function DataModelContext() {
        this.__mongodb = new MongoUtil();
        this.__provider_model = new ProviderModel(this.__mongodb);
        this.__patient_model = new PatientModel(this.__mongodb);
        this.__profile_model = new ProfileModel(this.__mongodb);
        this.__admin_record_model = new AdminRecordModel(this.__mongodb);
        this.__identity_model = new IdentityModel(this.__mongodb, 10);
        this.__priv_network = new PrivilegeNetwork();
        this.__account_mgr = new AccountManager(this.__mongodb,
                                                this.__admin_record_model,
                                                this.__profile_model,
                                                this.__provider_model,
                                                this.__patient_model,
                                                this.__identity_model,
                                                this.__priv_network);
        this.__association_model = new AssociationModel();
        this.__session_model = new SessionModel(this.__mongodb);
        this.__session_mgr = new SessionManager(this.__session_model,
                                                this.__association_model);
        this.__measure_model = new MeasureModel(this.__mongodb);

        this.get_mongodb = function() { return this.__mongodb; }
        this.get_account_manager = function() { return this.__account_mgr; }
        this.get_admin_record_model = function() { return this.__admin_record_model; }
        this.get_profile_model = function() { return this.__profile_model; }
        this.get_identity_model = function() { return this.__identity_model; }
        this.get_provider_model = function() { return this.__provider_model; }
        this.get_patient_model = function() { return this.__patient_model; }
        this.get_measure_model = function() { return this.__measure_model; }
        this.get_association_model = function() { return this.__association_model; }
        this.get_session_model = function() { return this.__session_model; }
        this.get_session_manager = function() { return this.__session_mgr; }
        this.get_privilege_network = function() { return this.__priv_network; }
        this.reset_all = function() {
                this.__profile_model.reset();
                this.__provider_model.reset();
                this.__patient_model.reset();
                this.__admin_record_model.reset();
                this.__identity_model.reset();
                this.__account_mgr.reset();
                this.__association_model.reset();
                this.__session_model.reset();
                this.__measure_model.reset();
                this.__priv_network.reset();
        }
}

// singletons
export var G_DataModelContext = new DataModelContext();

