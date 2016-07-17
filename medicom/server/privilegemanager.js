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

import {G_DataModelContext} from "./datamodelcontext.js";
import {Privilege,
        c_Root_Actions,
        c_Admin_Actions,
        c_Assistant_Actions,
        c_Provider_Actions,
        c_Patient_Actions} from "../api/privilege.js";

export function PrivilegeManager() {

        this.authorize_privileges_to = function(identity, account_id, actions, with_grant_option) {
        }

        this.revoke_privileges_from = function(identity, account_id, actions) {
        }

        this.get_privilege_actions = function(identity) {
        }

        this.authenticate = function(identity, action, f_Additional_Rule) {
        }
}
