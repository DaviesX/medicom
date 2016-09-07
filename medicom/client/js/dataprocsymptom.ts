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

import {IDataProcessor} from "./idataprocessor.ts";
import {IDataTransaction} from "../../api/idatatransaction.ts";
import {Identity} from "../../api/identity.ts";
import {AccountInfo} from "../../api/accountinfo.ts";
import {MedicalSession} from "../../api/medicalsession.ts";

import {DataParams} from "./dataparams.ts";
import {DataBrowserUI} from "./databrowserui.ts";


/*
 * <DataProcSymptom> Data processor implementation to handle Symptoms.
 */
export class DataProcSymptom extends IDataProcessor
{
        constructor(identity: Identity, user: AccountInfo, session: MedicalSession)
        {
                super(identity, user, session);
        }

        public id(): string
        {
                return "data_proc_symptom";
        }

        public name(): string
        {
                return "Symptom Data";
        }

        public upload_call(pdata: IDataTransaction, arams: DataParams): [string, any] 
        {
                return null;
        }

        public download_call(params: DataParams): [string, any]
        {
                return null;
        }

        public load(stream: string, suffix: string): IDataTransaction
        {
                return null;
        }

        public render(data: IDataTransaction, 
                      params: DataParams,
                      target: DataBrowserUI): boolean
        {
                return false;
        }
};
