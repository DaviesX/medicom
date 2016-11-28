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

import {AccountInfo} from "../../api/accountinfo";
import {MedicalSession} from "../../api/medicalsession";
import {on_user_selected} from "./userbrowser";
import {on_session_selected} from "./sessionbrowser";
import {SessionParams, SessionParamObject} from "./sessionparams";
import {BrowsingState} from "./activitycenter";

let on_user_selectes = function user_select_handler(info: AccountInfo): void
{
        SessionParams.get_params().store(SessionParamObject.User, info);
        SessionParams.get_params().store(SessionParamObject.BrowsingState, BrowsingState.SessionBrowser);
};

let on_session_selected = function(info: AccountInfo, session: MedicalSession)
{
        SessionParams.get_params().store(SessionParamObject.User, info);
        SessionParams.get_params().store(SessionParamObject.MedicalSession, session);
        SessionParams.get_params().store(SessionParamObject.BrowsingState, BrowsingState.DataBrowser);
};

Template["tmpldatacenter"].onRendered(function () {
        console.log("data center rendered");
});
