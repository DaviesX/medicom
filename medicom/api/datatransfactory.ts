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

import {IDataTransaction} from "./idatatransaction.ts";
import {Identity} from "./identity.ts";
import {AdminRecord} from "./adminrecord.ts";
import {AccountInfo} from "./accountinfo.ts";
import {MedicalSession} from "./medicalsession.ts";
import {ValueTable} from "./valuetable.ts";

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
        switch (object) {
                case DataTransObject.Identity:
                        return Identity.recover(pod);
                case DataTransObject.AdminRecord:
                        return AdminRecord.recover(pod);
                case DataTransObject.AccountInfo:
                        return AccountInfo.recover(pod);
                case DataTransObject.MedicalSession:
                        return MedicalSession.recover(pod);
                case DataTransObject.ValueTable:
                        return ValueTable.recover(pod);
                default:
                        throw Error("Unknown data transaction object: " + object);
        }
}
