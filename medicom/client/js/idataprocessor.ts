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
import {Identity} from "../../api/identity.ts";
import {AccountInfo} from "../../api/accountinfo.ts";
import {MedicalSession} from "../../api/medicalsession.ts";

/*
 * <IDataProcessor> Process and Present data.
 */
export abstract class IDataProcessor
{
        protected identity:     Identity;
        protected user:         AccountInfo;
        protected session:      MedicalSession;

        constructor(identity: Identity, user: AccountInfo, session: MedicalSession)
        {
                this.identity = identity;
                this.user = user;
                this.session = session;
        }

        public abstract upload(data: IDataTransaction): boolean;
        public abstract download():                     IDataTransaction;
        public abstract load(file: File):               IDataTransaction;
        public abstract render(data: IDataTransaction): boolean;
};