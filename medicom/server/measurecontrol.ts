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

import {DataModelContext} from "./datamodelcontext.ts";
import {MeasureModel} from "./measuremodel.ts";
import {IdentityModel} from "./identitymodel.ts";
import {SessionModel} from "./sessionmodel.ts";
import {Measure, MeasureObject} from "./measure.ts";
import {MeasureBP} from "./measurebp.ts";
import {MeasurePBC} from "./measurepbc.ts";
import {MeasureSymptoms} from "./measuresymptoms.ts";
import {MeasureFitbit} from "./measurefitbit.ts";
import {ErrorMessages} from "../api/error.ts";
import {ValueTable} from "../api/valuetable.ts";
import {Identity} from "../api/identity.ts";


export class MeasureControl
{
        private measures:       MeasureModel; 
        private identities:     IdentityModel;
        private sessions:       SessionModel;

        constructor()
        {
                this.measures = DataModelContext.get_measure_model();
                this.identities = DataModelContext.get_identity_model();
                this.sessions = DataModelContext.get_session_model();
        }

        private update_measures_from_table(identity: Identity, 
                                           session_id: number, 
                                           table: ValueTable, 
                                           f_Construct_Measure, 
                                           err: ErrorMessages): boolean
        {
                try {
                        this.identities.verify_identity(identity);
                } catch (error) {
                        err.log(error.toString());
                        return false;
                }
                var rows = table.all_rows();
                for (var i = 0; i < rows.length; i ++) {
                        var measure = f_Construct_Measure(rows[i]);
                        this.measures.update_measure(session_id, measure);
                }
                return true;
        }
        
        private get_measure_samples(identity: Identity, 
                                    object: MeasureObject, 
                                    start_date: Date, end_date: Date, sample_count: number, 
                                    session_id: number, 
                                    err: ErrorMessages): Array<Measure>
        {
                try {
                        this.identities.verify_identity(identity);
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }
                start_date = start_date == null ? new Date(0) : start_date;
                end_date = end_date == null ? new Date(Math.pow(2, 52)) : end_date;
                var measures = this.measures.get_measures_by_date_session_and_type(
                                                start_date, end_date, session_id, object, 1);
                if (measures == null) 
                        return null;
                var sampled = new Array<Measure>();
                var sample_count = sample_count != null ?
                                   Math.min(measures.length, Math.max(1, sample_count)) : measures.length;
                var interval = measures.length/sample_count;
                for (var i = 0, j = 0; i < sample_count; i ++, j += interval)
                        sampled[i] = measures[Math.floor(j)];
                return sampled;
        }
        
        public update_bp_measures(identity: Identity, session_id: number, bptable: ValueTable, err: ErrorMessages): boolean
        {
                var measure = new MeasureBP(null, null);
                this.update_measures_from_table(identity, session_id, bptable, function(pair) {
                        measure.set_date(pair.date);
                        measure.set_bp_value(pair.value);
                        return measure;
                }, err);
                return true;
        }
        
        public get_bp_measures(identity: Identity, 
                               start_date: Date, end_date: Date, sample_count: number, 
                               session_id: number, err: ErrorMessages): Array<MeasureBP>
        {
                return <Array<MeasureBP>> this.get_measure_samples(identity, MeasureObject.BloodPressure,
                                                start_date, end_date, sample_count, session_id, err);
        }
        
        public update_pbc_measures(identity: Identity, session_id: number, pbctable: ValueTable, err: ErrorMessages): boolean
        {
                var measure = new MeasurePBC(null, null);
                this.update_measures_from_table(identity, session_id, pbctable, function(pair) {
                        measure.set_date(pair.date);
                        measure.set_action(pair.date);
                        return measure;
                }, err);
                return true;
        }
        
        public get_pbc_measures(identity: Identity, 
                                start_date: Date, end_date: Date, sample_count: number, 
                                session_id: number, err: ErrorMessages): Array<MeasurePBC>
        {
                return <Array<MeasurePBC>> this.get_measure_samples(identity, MeasureObject.PillBottleCap,
                                                start_date, end_date, sample_count, session_id, err);
        }
        
        public update_symptom_measures(identity: Identity, session_id: number, 
                                       symptomtable: ValueTable, err: ErrorMessages): boolean
        {
                var measure = new MeasureSymptoms(null, null);
                this.update_measures_from_table(identity, session_id, symptomtable, function(pair) {
                        measure.set_date(pair.date);
                        measure.set_symptoms(pair.value);
                        return measure;
                }, err);
                return true;
        }
        
        public get_symptom_measures(identity: Identity, 
                                    start_date: Date, end_date: Date, session_id: number, 
                                    err: ErrorMessages): Array<MeasureSymptoms>
        {
                return <Array<MeasureSymptoms>> this.get_measure_samples(identity, MeasureObject.Symptoms,
                                                start_date, end_date, null, session_id, err);
        }
        
        public update_fitbit_measures(identity: Identity, session_id: number, 
                                      fitbittable: ValueTable, err: ErrorMessages): boolean
        {
                var measure = new MeasureFitbit(null, null);
                this.update_measures_from_table(identity, session_id, fitbittable, function(pair) {
                        measure.set_date(pair.date);
                        measure.set_sleep_info(pair.value);
                        return measure;
                }, err);
                return true;
        }
        
        public get_fitbit_measures(identity: Identity, 
                                   start_date: Date, end_date: Date, sample_count: number, 
                                   session_id: number, err: ErrorMessages): Array<MeasureFitbit>
        {
                return <Array<MeasureFitbit>> this.get_measure_samples(identity, MeasureObject.Fitbit,
                                                start_date, end_date, sample_count, session_id, err);
        }
};
