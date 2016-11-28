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

import {Identity} from "../../api/identity";
import {AccountInfo} from "../../api/accountinfo";
import {MedicalSession} from "../../api/medicalsession";

import {IDataProcessor} from "./idataprocessor";
import {DataProcSymptom} from "./dataprocsymptom";


export function data_proc_factory_create_all(identity: Identity, user: AccountInfo, session: MedicalSession): Array<IDataProcessor>
{
        var a = new Array<IDataProcessor>();
        a.push(new DataProcSymptom(identity, user, session));
        return a;
}
