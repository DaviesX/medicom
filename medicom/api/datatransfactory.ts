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
import {identity_copy} from "./identity.ts";
import {admin_record_copy} from "./adminrecord.ts";
import {account_info_copy} from "./accountinfo.ts";
import {medical_session_copy} from "./medicalsession.ts";
import {value_table_copy} from "./valuetable.ts";

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
                        return identity_copy(pod);
                case DataTransObject.AdminRecord:
                        return admin_record_copy(pod);
                case DataTransObject.AccountInfo:
                        return account_info_copy(pod);
                case DataTransObject.MedicalSession:
                        return medical_session_copy(pod);
                case DataTransObject.ValueTable:
                        return value_table_copy(pod);
                default:
                        throw Error("Unknown data transaction object: " + object);
        }
}
