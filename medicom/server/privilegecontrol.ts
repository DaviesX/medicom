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

import {DataModelContext} from "./datamodelcontext.ts";
import {PrivilegeNetwork} from "./privilegenetwork.ts";
import {AdminRecordModel} from "./adminrecordmodel.ts";
import {IdentityModel} from "./identitymodel.ts";
import {Privilege, PrivilegeAction} from "../api/privilege.ts";
import {Identity} from "../api/identity.ts";
import {ErrorMessages} from "../api/error.ts";


/*
 * <PrivilegeControl>
 */
export class PrivilegeControl
{
        private privileges:     PrivilegeNetwork;
        private records:        AdminRecordModel;
        private identities:     IdentityModel;

        constructor()
        {
                this.privileges = DataModelContext.get_privilege_network();
                this.records = DataModelContext.get_admin_record_model();
                this.identities = DataModelContext.get_identity_model();
        }

        public get_identity_actions(identity: Identity, err: ErrorMessages): Privilege
        {
                try {
                        this.identities.verify_identity(identity); 
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }
                var priv_ref = identity.get_account_record().get_privilege_ref();
                var actions = this.privileges.get_all_actions(priv_ref);
                if (actions == null) {
                        err.log("Your privilege record is empty");
                        return null;
                }
                return new Privilege(actions);
        }
        
        public get_account_actions(identity: Identity, account_id: number, err: ErrorMessages): Privilege
        {
                try {
                        this.identities.verify_identity(identity); 
                } catch (error) {
                        err.log(error.toString());
                        return null;
                }
                var record = this.records.get_record_by_id(account_id);
                if (record == null) {
                        err.log("Account " + account_id + " doesn't exist");
                        return null;
                }
                var priv_ref = record.get_privilege_ref();
                var actions = this.privileges.get_all_actions(priv_ref);
                return new Privilege(actions);
        }
};

