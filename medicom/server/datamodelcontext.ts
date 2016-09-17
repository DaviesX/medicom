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
 * You should have received a copy of the GNU General Public License along with DataModelContext program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import {MongoUtil} from "../api/mongoutil.ts";
import {AdminRecordModel} from "./adminrecordmodel.ts";
import {ProfileModel} from "./profilemodel.ts";
import {AccountManager} from "./accountmanager.ts";
import {IdentityModel} from "./identitymodel.ts";
import {SessionModel} from "./sessionmodel.ts";
import {AssociationModel} from "./associationmodel.ts";
import {SessionManager} from "./sessionmanager.ts";
import {MeasureModel} from "./measuremodel.ts";
import {PrivilegeNetwork} from "./privilegenetwork.ts";


/*
 * <DataModelContext>
 */
export class DataModelContext
{
        private static util:            MongoUtil = new MongoUtil();
        private static profiles:        ProfileModel = new ProfileModel(DataModelContext.util);
        private static records:         AdminRecordModel = new AdminRecordModel(DataModelContext.util);
        private static identities:      IdentityModel = new IdentityModel(DataModelContext.util, 10);
        private static privileges:      PrivilegeNetwork = new PrivilegeNetwork();
        private static accounts:        AccountManager = new AccountManager(DataModelContext.util,
                                                                            DataModelContext.records,
                                                                            DataModelContext.profiles,
                                                                            DataModelContext.identities,
                                                                            DataModelContext.privileges);
        private static associations:    AssociationModel = new AssociationModel();
        private static sessions:        SessionModel = new SessionModel(DataModelContext.util);
        private static sess_assocs:     SessionManager = new SessionManager(DataModelContext.sessions,
                                                                            DataModelContext.associations);
        private static measures:        MeasureModel = new MeasureModel(DataModelContext.util);

        public static get_util() 
        { 
                return DataModelContext.util; 
        }

        public static get_account_manager() 
        { 
                return DataModelContext.accounts;
        }

        public static get_admin_record_model() 
        { 
                return DataModelContext.records; 
        }

        public static get_profile_model() 
        { 
                return DataModelContext.profiles; 
        }

        public static get_identity_model() 
        { 
                return DataModelContext.identities; 
        }

        public static get_measure_model() 
        { 
                return DataModelContext.measures; 
        }

        public static get_association_model() 
        { 
                return DataModelContext.associations; 
        }

        public static get_session_model() 
        { 
                return DataModelContext.sessions; 
        }

        public static get_session_manager() 
        { 
                return DataModelContext.sess_assocs; 
        }

        public static get_privilege_network() 
        { 
                return DataModelContext.privileges; 
        }

        public static reset_all() 
        {
                DataModelContext.profiles.reset();
                DataModelContext.records.reset();
                DataModelContext.identities.reset();
                DataModelContext.accounts.reset();
                DataModelContext.associations.reset();
                DataModelContext.sessions.reset();
                DataModelContext.measures.reset();
                DataModelContext.privileges.reset();
        }
};

