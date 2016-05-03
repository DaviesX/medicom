import {Meteor} from "meteor/meteor";
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {Patient, Patient_Create_From_POD} from "../api/patient.js";

export function PatientManager(mongodb) {
        this.__mongodb = mongodb;
        this.c_Patient_Coll_Name = "PatientCollection";
        
        this.__patients = new Mongo.Collection(this.c_Patient_Coll_Name);
        
        this.create_patient = function(account_id) {
                var patient = new Patient(account_id);
                this.__patients.insert(patient);
                return patient;
        }
        
        this.remove_patient_by_id = function(account_id) {
                this.__patients.remove({__account_id: account_id});
        }
        
        this.get_patient_by_id = function(account_id) {
                var result = this.__patients.find({__account_id : account_id});
                if (result.count() > 0) {
                        return Patient_Create_From_POD(result.fetch()[0]);
                } else {
                        return null;
                }
        }
        
        this.has_patient = function(account_id) {
                return this.__patients.find({__account_id : account_id}).count() > 0;
        }
        
        this.update_patient = function(patient) {
                this.__patients({__account_id: patient.get_account_id()}, patient);
        }
}
