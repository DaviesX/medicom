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

/// <reference path="../../tslib/main.d.ts" />

import {Identity} from "../../api/identity.ts";
import {AccountInfo} from "../../api/accountinfo.ts";
import {MedicalSession} from "../../api/medicalsession.ts";
import {ErrorMessages} from "../../api/error.ts";
import {Session} from "meteor/session";


export enum SessionParamObject
{
        ErrorMessage,
        Identity,
        User,
        MedicalSession,
        UserBrowserState,
        DataBrowserState
};

/*
 * <SessionParams> Session level persistent store. 
 *
 * This object is a singleton. Do not new this object -- create through session_params_inst method.
 */
export class SessionParams
{
        constructor() {}

        public store(object: SessionParamObject, param: any)
        {
                Session.setPersistent(object.toString(), param);
        }

        public obtain(object: SessionParamObject): any
        {
                var param = Session.get(object.toString());
                if (param == null)
                        return null;

                switch (object) {
                        case SessionParamObject.ErrorMessage:
                                return ErrorMessages.recover(param);
                        case SessionParamObject.Identity:
                                return Identity.recover(param);
                        case SessionParamObject.User:
                                return AccountInfo.recover(param);
                        case SessionParamObject.MedicalSession:
                                return MedicalSession.recover(param);
                        case SessionParamObject.UserBrowserState:
                        case SessionParamObject.DataBrowserState:
                                return param;
                        default:
                                throw Error ("Undefined session param object: " + object);
                }
        }
}

const g = new SessionParams();

export function session_params_inst(): SessionParams
{
        return g;
}
