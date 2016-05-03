import {MongoDB} from "../api/common.js";
import {AdminRecordManager} from "./adminrecordmanager.js";
import {ProfileManager} from "./profilemanager.js";
import {AccountManager} from "./accountmanager.js";
import {IdentityManager} from "./identitymanager.js";
import {ProviderManager} from "./providermanager.js";
import {PatientManager} from "./patientmanager.js";
import {ParticipatedSessionManager} from "./sessionmanager.js";

export function DataModelContext() {
        this.__mongodb = new MongoDB();
        this.__provider_mgr = new ProviderManager(this.__mongodb);
        this.__patient_mgr = new PatientManager(this.__mongodb);
        this.__profile_mgr = new ProfileManager(this.__mongodb);
        this.__admin_record_mgr = new AdminRecordManager(this.__mongodb);
        this.__identity_mgr = new IdentityManager(this.__mongodb, 10);
        this.__account_mgr = new AccountManager(this.__mongodb, 
                                                this.__admin_record_mgr, 
                                                this.__profile_mgr, 
                                                this.__provider_mgr,
                                                this.__patient_mgr,
                                                this.__account_mgr);
        this.__session_mgr = new ParticipatedSessionManager(this.__mongodb,
                                                this.__provider_mgr,
                                                this.__patient_mgr);
        
        this.get_mongodb = function() { return this.__mongodb; }
        this.get_account_manager = function() { return this.__account_mgr; }
        this.get_admin_record_manager = function() { return this.__admin_record_mgr; }
        this.get_profile_manager = function() { return this.__profile_mgr; }
        this.get_identity_manager = function() { return this.__identity_mgr; }
        this.get_provider_manager = function() { return this.__provider_mgr; }
        this.get_patient_manager = function() { return this.__patient_mgr; }
        this.get_session_manager = function() { return this.__session_mgr; }
        this.reset_all = function() {
                this.__profile_mgr.reset();
                this.__provider_mgr.reset();
                this.__patient_mgr.reset();
                this.__admin_record_mgr.reset();
                this.__identity_mgr.reset();
                this.__account_mgr.reset();
                this.__session_mgr.reset();
        }
}

// singletons
export var G_DataModelContext = new DataModelContext();

