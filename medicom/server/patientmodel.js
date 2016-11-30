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
import {Patient, Patient_Create_From_POD} from "../api/patient.js";

export function PatientModel(mongodb) {
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
        
        this.reset = function() {
                this.__patients.remove({});
        }
}
