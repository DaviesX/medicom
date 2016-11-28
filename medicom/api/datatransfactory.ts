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

import {IDataTransaction} from "./idatatransaction";
import {Identity} from "./identity";
import {AdminRecord} from "./adminrecord";
import {AccountInfo} from "./accountinfo";
import {MedicalSession} from "./medicalsession";
import {ValueTable} from "./valuetable";

export enum DataTransObject
{
        Identity,
        AdminRecord,
        AccountInfo,
        MedicalSession,
        ValueTable
};

export function data_transaction_copy(object: DataTransObject, pod: any): IDataTransaction
{
        if (pod == null || object == null)
                return pod;

        switch (object) {
                case DataTransObject.Identity:
                        return Identity.recover(pod);
                case DataTransObject.AdminRecord:
                        return AdminRecord.recover(pod);
                case DataTransObject.AccountInfo:
                        if (pod.length !== undefined) {
                                for (var i = 0; i < pod.length; i ++)
                                        pod[i] = AccountInfo.recover(pod[i]);
                                return pod;
                        }
                        return AccountInfo.recover(pod);
                case DataTransObject.MedicalSession:
                        if (pod.length !== undefined) {
                                for (var i = 0; i < pod.length; i ++)
                                        pod[i] = MedicalSession.recover(pod[i]);
                                return pod;
                        }
                        return MedicalSession.recover(pod);
                case DataTransObject.ValueTable:
                        return ValueTable.recover(pod);
                default:
                        throw new Error("Cannot construct transaction object of type " + object);
        }
}
