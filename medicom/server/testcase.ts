/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Zhaonian Luan, Chifeng Wen.
 * MediCom is free software; you can redistribute it and/or modify it under the terms of
 * the GNU General Public License, version 2, as published by the Free Software Foundation.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import {MongoUtil} from "../api/mongoutil";
import {Measure} from "./measure";
import {MeasureBP} from "./measurebp";
import {AccountControl} from "./accountcontrol";
import {SessionControl} from "./sessioncontrol";
import {ErrorMessages} from "../api/error";
import {Privilege, 
        ROOT_ACTIONS,
        ADMIN_ACTIONS,
        ASSISTANT_ACTIONS,
        PROVIDER_ACTIONS,
        PATIENT_ACTIONS} from "../api/privilege";
import {UserGroupConst, UserGroup} from "../api/usergroup";
import {DataModelContext} from "./datamodelcontext";
import {AdminRecordModel} from "./adminrecordmodel";
import {AdminRecord} from "../api/adminrecord";


/*
 * <TestCase> Server side test cases.
 */
export class TestCase
{
        // Helper functions.
        private static remove_test_accounts(): void
        {
                var err = new ErrorMessages();
                var account_ctrl = new AccountControl();
                account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "bob", err);
                account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "amy", err);
                account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "janet", err);
                account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "jack", err);
                if (!err.is_empty())
                        console.log("Failed to remove test accounts. Cause: " + err.fetch_all());
        }
        
        private static prepare_test_accounts(): any
        {
                TestCase.remove_test_accounts();
        
                var err = new ErrorMessages();
                var account_ctrl = new AccountControl();
                var bob = account_ctrl.register("provider", "bob", "bob", "", "", err);
                var amy = account_ctrl.register("patient", "amy", "amy", "", "", err);
                var janet = account_ctrl.register("patient", "janet", "janet", "", "", err);
                var jack = account_ctrl.register("assistant", "jack", "jack", "", "", err);
                var root_id = account_ctrl.get_root_identity();
                if (!err.is_empty())
                        throw new Error("Failed to prepare test accounts. Cause: " + err.toString());
                if (!account_ctrl.activate(bob.get_admin_record().get_auth_code(), err))
                        throw new Error ("Failed to activate bob");
                if (!account_ctrl.activate(amy.get_admin_record().get_auth_code(), err))
                        throw new Error ("Failed to activate amy");
                if (!account_ctrl.activate(janet.get_admin_record().get_auth_code(), err))
                        throw new Error ("Failed to activate janet");
                if (!account_ctrl.activate(jack.get_admin_record().get_auth_code(), err))
                        throw new Error ("Failed to activate jack");
                bob = account_ctrl.get_account_info_by_id(root_id, bob.get_admin_record().get_account_id(), err);
                amy = account_ctrl.get_account_info_by_id(root_id, amy.get_admin_record().get_account_id(), err);
                jack = account_ctrl.get_account_info_by_id(root_id, jack.get_admin_record().get_account_id(), err);
                janet = account_ctrl.get_account_info_by_id(root_id, janet.get_admin_record().get_account_id(), err);
        
                var bob_id = account_ctrl.login_by_email("bob", "", err);
                var amy_id = account_ctrl.login_by_email("amy", "", err);
                var janet_id = account_ctrl.login_by_email("janet", "", err);
                var jack_id = account_ctrl.login_by_email("jack", "", err);
        
                var result =  {bob: bob, bob_id: bob_id,
                               amy: amy, amy_id: amy_id,
                               janet: janet, janet_id: janet_id,
                               jack: jack, jack_id: jack_id};
                if (!err.is_empty()) {
                        console.log(result);
                        throw new Error("Failed to create test accounts. Cause: " + err.toString());
                }
                return result;
        }
        
        
        private static compare_all_props(x: any, y: any): boolean
        {
                for (var prop in x) {
                        if (x.prop != y.prop)
                                return false;
                }
                return true;
        }
        
        private static find_object(x, array: Array<any>): any
        {
                for (var j = 0; j < array.length; j ++) {
                        if (TestCase.compare_all_props(x, array[j]))
                                return array[j];
                }
                return null;
        }
        
        private static compare_object_array(x, y): boolean
        {
                for (var i = 0; i < x.length; i ++) {
                        if (null == TestCase.find_object(x[i], y))
                                return false;
                }
                for (var i = 0; i < y.length; i ++) {
                        if (null == TestCase.find_object(y[i], x))
                                return false;
                }
                return true;
        }
        
        public static admin_record_model(): void
        {
                var admin_record_model = DataModelContext.get_admin_record_model();
                var admin_record = admin_record_model.create_new_record_with_id(5, 48844835, "lzn19940830", 4);
                var admin_record_by_id = admin_record_model.get_record_by_id(48844835);
                if (!admin_record.is_equal(admin_record_by_id)) {
                        console.log(admin_record_by_id);
                        console.log(admin_record);
                        throw new Error("test_AdminRecordModel fucked up");
                }
                admin_record_model.remove_record_by_id(48844835);
                if (admin_record_model.get_record_by_id(48844835)) {
                    console.log(admin_record_model);
                        throw new Error("test_AminRecordModel fucked up");
                }
                console.log("test_AdminRecordModel passed");
        }

        public static identity_model(): void
        {
                var identities = DataModelContext.get_identity_model();
                var record = new AdminRecord(1342, UserGroupConst.Provider, "1234", "mmkl", 1);
                record.activate();
                var iden = identities.create_identity(record);
                identities.verify_identity(iden);
                console.log("test identity model passed");
        }
        
        public static mongo_util(): void
        {
                var db = DataModelContext.get_util();
        
                var temp_set = new Set<string>();
                const test_scale = 1000;
                for (var i = 0; i < test_scale; i++) {
                        temp_set.add(db.get_string_uuid());
                }
                if (temp_set.size != test_scale) {
                        console.log(temp_set);
                        throw "test_MongoDB fucked up";
                }
                console.log("test mongo_util passed");
        }
        
        public static measure(): void
        {
                var measure = new Measure(1, new Date());
        
                measure.set_session_id(123);
                measure.set_measure_id("345");
        
                if (measure.get_session_id() != 123 || measure.get_measure_id() != "345") {
                        console.log(measure);
                        throw "test_measure fucked up";
                }
                console.log("test measure passed");
        }
        
        public static account_control(): void
        {
                var errmq = new ErrorMessages();
        
                var account_control = new AccountControl();
                account_control.system_init();
        
                account_control.remove_account_by_email(account_control.get_root_identity(), "zhaonias@uci.edu", errmq);
                account_control.remove_account_by_email(account_control.get_root_identity(), "John_Smith@uci.edu", errmq);
                if (!errmq.is_empty())
                        console.log(errmq);

                errmq.clear();
        
                var account_info = account_control.register(
                                           "provider", "zhaonias@uci.edu", "tomasds", "9495628820", "lzn19940830haha", errmq);
                if (account_info == null) {
                        throw Error("account_info fucked up. Cause: " + errmq.toString());
                }
                // Login without activating the account.
                var provider_id = account_control.login_by_email("zhaonias@uci.edu", "lzn19940830haha", errmq);
                if (provider_id != null) {
                        if (provider_id.get_account_record().is_active()) {
                                // The account was falsely activated when it shouldn't.
                                console.log(account_control);
                                throw Error("How could you log in by email without activating your account!?");
                        }
                } else {
                        console.log(errmq.fetch_all());
                        throw Error("Login should return a valid identity at any time");
                }
                // Login with an activated account.
                account_control.activate(account_info.get_admin_record().get_auth_code(), errmq);
                provider_id = account_control.login_by_email("zhaonias@uci.edu", "lzn19940830haha", errmq);
                if (provider_id == null) {
                        console.log(account_control);
                        throw Error("test_account_control fucked up");
                }
        
                // Register a patient account.search for it.
                var john_smith = account_control.register("patient", "John_Smith@uci.edu", "John smith", "434546445", "111111", errmq);
                account_control.activate(john_smith.get_admin_record().get_auth_code(), errmq);
                john_smith = account_control.get_account_info_by_id(provider_id, john_smith.get_admin_record().get_account_id(), errmq)
                var infos = account_control.search_account_infos(provider_id, "John", 10, errmq);
                if (!errmq.is_empty()) {
                        console.log(provider_id);
                        console.log(john_smith);
                        console.log(errmq.fetch_all());
                        throw new Error("Got null pointer from searching john smith");
                }
                var has_match = false;
                for (var i = 0; i < infos.length; i ++) {
                        if (infos[i].is_equal(john_smith)) {
                                has_match = true;
                                break;
                        }
                }
                if (!has_match) {
                        console.log(john_smith);
                        console.log(infos);
                        throw new Error("Couldn't found john smith when it should");
                }
        
                account_control.remove_account_by_email(account_control.get_root_identity(), "zhaonias@uci.edu", errmq);
                account_control.remove_account_by_email(account_control.get_root_identity(), "John_Smith@uci.edu", errmq);
                if (!errmq.is_empty()) {
                        console.log(errmq.fetch_all());
                        throw new Error("Failed to remove accounts");
                }
                console.log("test account_control passed");
        }
        
        public static privilege_network(): void
        {
                var priv_network = DataModelContext.get_privilege_network();
                priv_network.reset();
                var root = priv_network.allocate_root();
                var bob = priv_network.allocate();
                var amy = priv_network.allocate();
                var janet = priv_network.allocate();
                var paul = priv_network.allocate();
                // Assign root actions.
                for (var i = 0; i < ROOT_ACTIONS.length; i ++)
                        if (!priv_network.add_root_action(ROOT_ACTIONS[i].action)) {
                                console.log(priv_network);
                                throw new Error("Failed to add root action");
                        }
        
                // bob and amy being the administrators -- derived from the root.
                for (var i = 0; i < ADMIN_ACTIONS.length; i ++) {
                        if (!priv_network.derive_action_from(root, bob,
                                                             ADMIN_ACTIONS[i].action,
                                                             ADMIN_ACTIONS[i].scope,
                                                             ADMIN_ACTIONS[i].grant_option)) {
                                console.log(priv_network);
                                throw new Error("Failed to add admin action for bob: " + bob);
                        }
                        if (!priv_network.derive_action_from(root, amy,
                                                             ADMIN_ACTIONS[i].action,
                                                             ADMIN_ACTIONS[i].scope,
                                                             ADMIN_ACTIONS[i].grant_option)) {
                                console.log(priv_network);
                                throw new Error("Failed to add admin action for amy: " + amy);
                        }
                }
                // verify action.for bob and amy.
                for (var i = 0; i < ADMIN_ACTIONS.length; i ++) {
                        if (!priv_network.has_action(bob, ADMIN_ACTIONS[i].action, [132, 222])) {
                                console.log(priv_network);
                                throw new Error("Failed to authenticate for bob while he should be able to: " + bob);
                        }
                        if (!priv_network.has_action(amy, ADMIN_ACTIONS[i].action, [132, 222])) {
                                console.log(priv_network);
                                throw new Error("Failed to authenticate for amy while she should be able to: " + amy);
                        }
                }
                // bob will grant privilege to janet, and amy and root will grant privilege to paul.
                for (var i = 0; i < ADMIN_ACTIONS.length; i ++) {
                        if (!priv_network.derive_action_from(bob, janet,
                                                             ADMIN_ACTIONS[i].action,
                                                             ADMIN_ACTIONS[i].scope,
                                                             ADMIN_ACTIONS[i].grant_option)) {
                                console.log(priv_network);
                                throw new Error("Failed to add admin action for janet from bob: " + janet);
                        }
                        if (!priv_network.derive_action_from(amy, paul,
                                                             ADMIN_ACTIONS[i].action,
                                                             ADMIN_ACTIONS[i].scope,
                                                             ADMIN_ACTIONS[i].grant_option)) {
                                console.log(priv_network);
                                throw new Error("Failed to add admin action for paul from amy: " + paul);
                        }
                        if (!priv_network.derive_action_from(root, paul,
                                                             ADMIN_ACTIONS[i].action,
                                                             ADMIN_ACTIONS[i].scope,
                                                             ADMIN_ACTIONS[i].grant_option)) {
                                console.log(priv_network);
                                throw new Error("Failed to add admin action for paul from root: " + paul);
                        }
                }
                // verify action for janet and paul.
                for (var i = 0; i < ADMIN_ACTIONS.length; i ++) {
                        if (!priv_network.has_action(janet, ADMIN_ACTIONS[i].action, [132, 222])) {
                                console.log(priv_network);
                                throw new Error("Failed to authenticate for janet while she should be able to: " + janet);
                        }
                        if (!priv_network.has_action(paul, ADMIN_ACTIONS[i].action, [132, 222])) {
                                console.log(priv_network);
                                throw new Error("Failed to authenticate for paul while he should be able to: " + paul);
                        }
                }
                // revoke privilege to bob and janet....
                priv_network.free(bob);
                priv_network.free(janet);
                // janet should lost all her privileges while paul should have retained all his privileges.
                for (var i = 0; i < ADMIN_ACTIONS.length; i ++) {
                        if (priv_network.has_action(janet, ADMIN_ACTIONS[i].action, [])) {
                                console.log(priv_network);
                                throw new Error("It's able to authenticate for janet while it shouldn't have: " + janet);
                        }
                        if (!priv_network.has_action(paul, ADMIN_ACTIONS[i].action, [])) {
                                console.log(priv_network);
                                throw new Error("Failed to authenticate for paul while he should be able to: " + paul);
                        }
                }
                console.log(priv_network);
                console.log("test_privilege_network passed");
        }
        
        public static session_control()
        {
                var err = new ErrorMessages();
                var session_ctrl = new SessionControl();
                session_ctrl.system_init();
        
                // Prepare identities.
                var test_accounts = TestCase.prepare_test_accounts();
        
                // Create association between bob and amy.
                session_ctrl.create_association(test_accounts.bob_id,
                                                test_accounts.amy.get_admin_record().get_account_id(),
                                                err);
                if (!err.is_empty()) {
                        console.log(test_accounts);
                        throw new Error("Failed to create assocation for bob and amy. Cause: " + err.fetch_all());
                }
                // Add 5 sessions and create comments for each session.
                var sessions_0 = [];
                for (var i = 0; i < 5; i ++) {
                        var session = session_ctrl.create_session(test_accounts.bob_id,
                                                                  test_accounts.amy.get_admin_record().get_account_id(),
                                                                  err);
                        if (!err.is_empty()) {
                                console.log(session);
                                throw new Error("Failed to create session for bob and amy. Cause: " + err.fetch_all());
                        }
                        session_ctrl.set_session_notes(test_accounts.bob_id,
                                                       session.get_session_id(),
                                                       "Session notes amy, " + i,
                                                       err);
                        if (!err.is_empty()) {
                                console.log(session);
                                throw new Error("Failed to add session note for bob and may. Cause: " + err.fetch_all());
                        }
                        sessions_0.push(session);
                }
                // Get all the sessions from this association. It should succeed.
                var sessions_0_v = session_ctrl.get_associated_sessions(test_accounts.bob_id,
                                                                        test_accounts.amy.get_admin_record().get_account_id(),
                                                                        err);
                if (!err.is_empty()) {
                        console.log(sessions_0_v);
                        throw new Error("Failed to get associated session subjected to bob and amy. Cause: " + err.fetch_all());
                }
                if (!TestCase.compare_object_array(sessions_0, sessions_0_v)) {
                        console.log(sessions_0);
                        console.log(sessions_0_v);
                        throw new Error("Session fetched aren't the same");
                }
                // Create association between bob and janet.
                session_ctrl.create_association(test_accounts.bob_id,
                                                test_accounts.janet.get_admin_record().get_account_id(),
                                                err);
                if (!err.is_empty()) {
                        console.log(test_accounts);
                        throw new Error("Failed to create assocation for bob and janet. Cause: " + err.fetch_all());
                }
                // Add 3 sesssions.
                var sessions_1 = [];
                for (var i = 0; i < 5; i ++) {
                        var session = session_ctrl.create_session(test_accounts.bob_id,
                                                                  test_accounts.janet.get_admin_record().get_account_id(),
                                                                  err);
                        if (!err.is_empty()) {
                                console.log(session);
                                throw new Error("Failed to create session for bob and janet. Cause: " + err.fetch_all());
                        }
                        session_ctrl.set_session_notes(test_accounts.bob_id,
                                                       session.get_session_id(),
                                                       "Session notes janet, " + i,
                                                       err);
                        if (!err.is_empty()) {
                                console.log(session);
                                throw new Error("Failed to add session note for bob and may. Cause: " + err.fetch_all());
                        }
                        sessions_1.push(session);
                }
                // Get all the sessions from this association. It should succeed.
                var sessions_1_v = session_ctrl.get_associated_sessions(test_accounts.bob_id,
                                                                        test_accounts.janet.get_admin_record().get_account_id(),
                                                                        err);
                if (!err.is_empty()) {
                        console.log(sessions_0_v);
                        throw new Error("Failed to get associated session subjected to bob and janet. Cause: " + err.fetch_all());
                }
                if (!TestCase.compare_object_array(sessions_1, sessions_1_v)) {
                        console.log(sessions_1);
                        console.log(sessions_1_v);
                        throw new Error("Session fetched aren't the same");
                }
                // Create association between jack and amy.
                session_ctrl.create_association(test_accounts.jack_id,
                                                test_accounts.amy.get_admin_record().get_account_id(),
                                                err);
                if (!err.is_empty()) {
                        console.log(test_accounts);
                        throw new Error("Failed to create assocation for jack and amy. Cause: " + err.fetch_all());
                }
                // Add the sessions bob created with amy, expected to fail.
                for (var i = 0; i < 5; i ++) {
                        var session = session_ctrl.add_session(test_accounts.jack_id,
                                                               test_accounts.amy.get_admin_record().get_account_id(),
                                                               sessions_0[i].get_session_id(),
                                                               err);
                        if (err.is_empty()) {
                                console.log(session);
                                throw new Error("Add amy's session to jack when it shouldn't. Cause: " + err.fetch_all());
                        }
                }
                // Now bob share the first set of sessions with jack.
                err.clear();
                for (var i = 0; i < 5; i ++) {
                        var r = session_ctrl.share_session(test_accounts.bob_id,
                                                           test_accounts.jack.get_admin_record().get_account_id(),
                                                           sessions_0[i].get_session_id(),
                                                           err);
                        if (!r || !err.is_empty()) {
                                console.log(r);
                                throw new Error("Failed to share amy's session to jack. Cause: " + err.fetch_all());
                        }
                }
                // Add the sessions bob created. It should succeed.
                for (var i = 0; i < 5; i ++) {
                        var session = session_ctrl.add_session(test_accounts.jack_id,
                                                               test_accounts.amy.get_admin_record().get_account_id(),
                                                               sessions_0[i].get_session_id(),
                                                               err);
                        if (!err.is_empty()) {
                                console.log(session);
                                throw new Error("Failed to add amy's session to jack. Cause: " + err.fetch_all());
                        }
                }
                // Bob deactivate and then recover the first session with amy. It should change according to the operation.
                if (!session_ctrl.deactivate_session(test_accounts.bob_id, sessions_0[0].get_session_id(), err))
                        throw new Error("Failed to deactivate session " + sessions_0[0] + " Cause: " + err.fetch_all());
                if (!session_ctrl.activate_session(test_accounts.bob_id, sessions_0[0].get_session_id(), err))
                        throw new Error("Failed to activate session " + sessions_0[0] + " Cause: " + err.fetch_all());
                // Jack deactivate the first session with amy, expected to fail.
                if (session_ctrl.deactivate_session(test_accounts.jack_id, sessions_0[0].get_session_id(), err))
                        throw new Error("Session " + sessions_0[0] + " is deactivated when it shouldn't");
                TestCase.remove_test_accounts();
        
                console.log("test_session_control passed");
        }
};
