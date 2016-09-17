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

import {DataModelContext} from "./datamodelcontext.js";
import {Privilege} from "../api/privilege.js";

export function PrivilegeControl()
{
        this.__priv_network = DataModelContext.get_privilege_network();
        this.__identity_model = DataModelContext.get_identity_model();
}

PrivilegeControl.prototype.get_identity_actions = function(identity, err)
{
        if (!this.__identity_model.verify_identity(identity)) {
                err.log("Your identity is invalid");
                return null;
        }
        var priv_ref = identity.get_account_record().get_privilege_ref();
        var actions = this.__priv_network.get_all_actions(priv_ref);
        if (actions == null) {
                err.log("Your privilege record is empty");
                return null;
        }
        var priv_actions = [];
        for (var i = 0; i < actions.length; i ++) {
                priv_actions.push({
                        action: actions[i].get_action(),
                        scope: actions[i].get_scope_set(),
                        with_grant_option: actions[i].has_grant_option(),
                });
        }
        return new Privilege(priv_actions);
}

PrivilegeControl.prototype.get_account_actions = function(identity, account_id, err)
{
}
