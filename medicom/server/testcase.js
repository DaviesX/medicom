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

import {MongoDB} from "../api/common.js";
import {Measure} from "./measure.js";
import {MeasureBP} from "./measurebp.js";
import {AccountControl} from "./accountcontrol.js";
import {SessionControl} from "./sessioncontrol.js";
import {ErrorMessageQueue} from "../api/common.js";
import {Privilege,
        c_Root_Actions,
        c_Admin_Actions,
        c_Assistant_Actions,
        c_Provider_Actions,
        c_Patient_Actions} from "../api/privilege.js";
import {c_UserGroup_Root,
        c_UserGroup_Admin,
        c_UserGroup_Provider,
        c_UserGroup_Patient,
        c_UserGroup_Assistant,
        c_UserGroup_Temporary} from "../api/usergroup.js";
import {G_DataModelContext} from "./datamodelcontext.js";
import {AdminRecordModel} from "./adminrecordmodel.js";
import {AdminRecord} from "../api/adminrecord.js";


// Helper functions.
function remove_test_accounts()
{
        var err = new ErrorMessageQueue();
        var account_ctrl = new AccountControl();
        account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "bob", err);
        account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "amy", err);
        account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "janet", err);
        account_ctrl.remove_account_by_email(account_ctrl.get_root_identity(), "jack", err);
}

function prepare_test_accounts()
{
        remove_test_accounts();

        var err = new ErrorMessageQueue();
        var account_ctrl = new AccountControl();
        var bob = account_ctrl.register("provider", "bob", "bob", "", "", err);
        var amy = account_ctrl.register("patient", "amy", "amy", "", "", err);
        var janet = account_ctrl.register("patient", "janet", "janet", "", "", err);
        var jack = account_ctrl.register("assistant", "jack", "jack", "", "", err);
        var root_id = account_ctrl.get_root_identity();
        account_ctrl.activate(bob.get_record().get_auth_code(), err);
        account_ctrl.activate(amy.get_record().get_auth_code(), err);
        account_ctrl.activate(janet.get_record().get_auth_code(), err);
        account_ctrl.activate(jack.get_record().get_auth_code(), err);
        bob = account_ctrl.get_account_info_by_id(root_id, bob.get_record().get_account_id(), err);
        amy = account_ctrl.get_account_info_by_id(root_id, amy.get_record().get_account_id(), err);
        jack = account_ctrl.get_account_info_by_id(root_id, jack.get_record().get_account_id(), err);
        janet = account_ctrl.get_account_info_by_id(root_id, janet.get_record().get_account_id(), err);

        var bob_id = account_ctrl.login_by_email("bob", "", err);
        var amy_id = account_ctrl.login_by_email("amy", "", err);
        var janet_id = account_ctrl.login_by_email("janet", "", err);
        var jack_id = account_ctrl.login_by_email("jack", "", err);

        var result =  {bob: bob, bob_id: bob_id,
                       amy: amy, amy_id: amy_id,
                       janet: janet, janet_id: janet_id,
                       jack: jack, jack_id: jack_id};
        if (err.fetch_all() != "") {
                console.log(result);
                throw new Error("Failed to create test accounts");
        }
        return result;
}


function compare_all_props(x, y)
{
        for (prop in x) {
                if (x.prop != y.prop)
                        return false;
        }
        return true;
}

function find_object(x, array)
{
        for (var j = 0; j < y.length; j ++) {
                if (compare_all_props(x, array[j]))
                        return array[j];
        }
        return null;
}

function compare_object_array(x, y)
{
        for (var i = 0; i < x.length; i ++) {
                if (null == find_object(x[i], y))
                        return false;
        }
        for (var i = 0; i < y.length; i ++) {
                if (null == find_object(y[i], x))
                        return false;
        }
        return true;
}

export function test_admin_record_model()
{
        G_DataModelContext.reset_all();
        var admin_record_model = G_DataModelContext.get_admin_record_model();
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

export function test_MongoDB()
{
        var db = G_DataModelContext.get_mongodb();

        temp_set = new Set();
        const test_scale = 1000;
        for (var i = 0; i < test_scale; i++) {
                temp_set.add(db.get_string_uuid());
        }
        if (temp_set.size != test_scale) {
                console.log(temp_set);
                throw "test_MongoDB fucked up";
        }
        console.log("test_MongoDB passed");
}

export function test_measure()
{
        var measure = new Measure(1);

        measure.set_session_id(123);
        measure.set_measure_id("345");

        if (measure.get_session_id() != 123 || measure.get_measure_id() != "345") {
                console.log(measure);
                throw "test_measure fucked up";
        }
        console.log("test_measure passed");
}

export function test_account_control()
{
        var errmq = new ErrorMessageQueue();

        var account_control = new AccountControl();

        account_control.remove_account_by_email(account_control.get_root_identity(), "zhaonias@uci.edu", errmq);
        var error = errmq.fetch_all();
        if (error != "" && error[0] != "No such account zhaonias@uci.edu exists") {
                console.log(error);
                throw Error("Failed to remove an existing account");
        }
        errmq.clear();

        var account_info = account_control.register(
                                   "provider", "zhaonias@uci.edu", "tomasds", "9495628820", "lzn19940830haha", errmq);
        if (account_info == null) {
                console.log(errmq.fetch_all());
                throw Error("account_info fucked up");
        }
        // Login without activating the account.
        var identity = account_control.login_by_email("zhaonias@uci.edu", "lzn19940830haha", errmq);
        if (identity != null) {
                if (identity.get_account_record().is_active() == "-1") {
                        // The account was falsely activated when it shouldn't.
                        console.log(account_control);
                        throw Error("How could you log in by email without activating your account!?");
                }
        } else {
                console.log(errmq.fetch_all());
                throw Error("Login should return a valid identity at any time");
        }
        // Login with an activated account.
        account_control.activate(account_info.get_record().get_auth_code(), errmq);

        if (account_control.login_by_email("zhaonias@uci.edu", "lzn19940830haha", errmq) == null) {
                console.log(account_control);
                throw Error("test_account_control fucked up");
        }
        console.log("test_account_control passed");

}

export function test_privilege_network()
{
        var priv_network = G_DataModelContext.get_privilege_network();
        priv_network.reset();
        var root = priv_network.allocate_root();
        var bob = priv_network.allocate();
        var amy = priv_network.allocate();
        var janet = priv_network.allocate();
        var paul = priv_network.allocate();
        // Assign root actions.
        for (var i = 0; i < c_Root_Actions.length; i ++)
                if (!priv_network.add_root_action(c_Root_Actions[i].action)) {
                        console.log(priv_network);
                        throw new Error("Failed to add root action");
                }

        // bob and amy being the administrators -- derived from the root.
        for (var i = 0; i < c_Admin_Actions.length; i ++) {
                if (!priv_network.derive_action_from(root, bob,
                                                     c_Admin_Actions[i].action,
                                                     c_Admin_Actions[i].scope,
                                                     c_Admin_Actions[i].grant_option)) {
                        console.log(priv_network);
                        throw new Error("Failed to add admin action for bob: " + bob);
                }
                if (!priv_network.derive_action_from(root, amy,
                                                     c_Admin_Actions[i].action,
                                                     c_Admin_Actions[i].scope,
                                                     c_Admin_Actions[i].grant_option)) {
                        console.log(priv_network);
                        throw new Error("Failed to add admin action for amy: " + amy);
                }
        }
        // verify action.for bob and amy.
        for (var i = 0; i < c_Admin_Actions.length; i ++) {
                if (!priv_network.has_action(bob, c_Admin_Actions[i].action, [132, 222])) {
                        console.log(priv_network);
                        throw new Error("Failed to authenticate for bob while he should be able to: " + bob);
                }
                if (!priv_network.has_action(amy, c_Admin_Actions[i].action, [132, 222])) {
                        console.log(priv_network);
                        throw new Error("Failed to authenticate for amy while she should be able to: " + amy);
                }
        }
        // bob will grant privilege to janet, and amy and root will grant privilege to paul.
        for (var i = 0; i < c_Admin_Actions.length; i ++) {
                if (!priv_network.derive_action_from(bob, janet,
                                                     c_Admin_Actions[i].action,
                                                     c_Admin_Actions[i].scope,
                                                     c_Admin_Actions[i].grant_option)) {
                        console.log(priv_network);
                        throw new Error("Failed to add admin action for janet from bob: " + janet);
                }
                if (!priv_network.derive_action_from(amy, paul,
                                                     c_Admin_Actions[i].action,
                                                     c_Admin_Actions[i].scope,
                                                     c_Admin_Actions[i].grant_option)) {
                        console.log(priv_network);
                        throw new Error("Failed to add admin action for paul from amy: " + paul);
                }
                if (!priv_network.derive_action_from(root, paul,
                                                     c_Admin_Actions[i].action,
                                                     c_Admin_Actions[i].scope,
                                                     c_Admin_Actions[i].grant_option)) {
                        console.log(priv_network);
                        throw new Error("Failed to add admin action for paul from root: " + paul);
                }
        }
        // verify action for janet and paul.
        for (var i = 0; i < c_Admin_Actions.length; i ++) {
                if (!priv_network.has_action(janet, c_Admin_Actions[i].action, [132, 222])) {
                        console.log(priv_network);
                        throw new Error("Failed to authenticate for janet while she should be able to: " + janet);
                }
                if (!priv_network.has_action(paul, c_Admin_Actions[i].action, [132, 222])) {
                        console.log(priv_network);
                        throw new Error("Failed to authenticate for paul while he should be able to: " + paul);
                }
        }
        // revoke privilege to bob and janet....
        priv_network.free(bob);
        priv_network.free(janet);
        // janet should lost all her privileges while paul should have retained all his privileges.
        for (var i = 0; i < c_Admin_Actions.length; i ++) {
                if (priv_network.has_action(janet, c_Admin_Actions[i].action, [])) {
                        console.log(priv_network);
                        throw new Error("It's able to authenticate for janet while it shouldn't have: " + janet);
                }
                if (!priv_network.has_action(paul, c_Admin_Actions[i].action, [])) {
                        console.log(priv_network);
                        throw new Error("Failed to authenticate for paul while he should be able to: " + paul);
                }
        }
        console.log(priv_network);
        console.log("test_privilege_network passed");
}

export function test_session_control()
{
        var err = new ErrorMessageQueue();
        var session_ctrl = new SessionControl();

        // Prepare identities.
        var test_accounts = prepare_test_accounts();

        // Create association between bob and amy.
        session_ctrl.create_association(test_accounts.bob_id,
                                        test_accounts.amy.get_record().get_account_id(),
                                        err);
        if (err.fetch_all() != "") {
                console.log(test_accounts);
                throw new Error("Failed to create assocation for bob and amy. Cause: " + err.fetch_all());
        }
        // Add 5 sessions and create comments for each session.
        var sessions_0 = [];
        for (var i = 0; i < 5; i ++) {
                var session = session_ctrl.create_session(test_accounts.bob_id,
                                                          test_accounts.amy.get_record().get_account_id(),
                                                          err);
                if (err.fetch_all() != "") {
                        console.log(session);
                        throw new Error("Failed to create session for bob and amy. Cause: " + err.fetch_all());
                }
                session_ctrl.set_session_notes(test_accounts.bob_id,
                                               session.get_session_id(),
                                               "Session notes amy, " + i,
                                               err);
                if (err.fetch_all() != "") {
                        console.log(session);
                        throw new Error("Failed to add session note for bob and may. Cause: " + err.fetch_all());
                }
                sessions_0.push(session);
        }
        // Get all the sessions from this association. It should succeed.
        var sessions_0_v = session_ctrl.get_associated_session(test_accounts.bob_id,
                                                               test_accounts.amy.get_record().get_account_id(),
                                                               err);
        if (err.fetch_all() != "") {
                console.log(sessions_0_v);
                throw new Error("Failed to get associated session subjected to bob and amy. Cause: " + err.fetch_all());
        }
        if (!compare_object_array(sessoins_0, sessions_0_v)) {
                console.log(sessions_0);
                console.log(sessions_0_v);
                throw new Error("Session fetched aren't the same");
        }
        // Create association between bob and janet.
        session_ctrl.create_association(test_accounts.bob_id,
                                        test_accounts.janet.get_record().get_account_id(),
                                        err);
        if (err.fetch_all() != "") {
                console.log(test_accounts);
                throw new Error("Failed to create assocation for bob and janet. Cause: " + err.fetch_all());
        }
        // Add 3 sesssions.
        var sessions_1 = [];
        for (var i = 0; i < 5; i ++) {
                var session = session_ctrl.create_session(test_accounts.bob_id,
                                                          test_accounts.janet.get_record().get_account_id(),
                                                          err);
                if (err.fetch_all() != "") {
                        console.log(session);
                        throw new Error("Failed to create session for bob and janet. Cause: " + err.fetch_all());
                }
                session_ctrl.set_session_notes(test_accounts.bob_id,
                                               session.get_session_id(),
                                               "Session notes janet, " + i,
                                               err);
                if (err.fetch_all() != "") {
                        console.log(session);
                        throw new Error("Failed to add session note for bob and may. Cause: " + err.fetch_all());
                }
                sessions_1.push(session);
        }
        // Get all the sessions from this association. It should succeed.
        var sessions_1_v = session_ctrl.get_associated_session(test_accounts.bob_id,
                                                               test_accounts.janet.get_record().get_account_id(),
                                                               err);
        if (err.fetch_all() != "") {
                console.log(sessions_0_v);
                throw new Error("Failed to get associated session subjected to bob and janet. Cause: " + err.fetch_all());
        }
        if (!compare_object_array(sessoins_1, sessions_1_v)) {
                console.log(sessoins_1);
                console.log(sessions_1_v);
                throw new Error("Session fetched aren't the same");
        }
        // Create association between jack and amy.
        session_ctrl.create_association(test_accounts.jack_id,
                                        test_accounts.amy.get_record().get_account_id(),
                                        err);
        if (err.fetch_all() != "") {
                console.log(test_accounts);
                throw new Error("Failed to create assocation for jack and amy. Cause: " + err.fetch_all());
        }
        // Add the sessions bob created with amy, expected to fail.
        for (var i = 0; i < 5; i ++) {
                var session = session_ctrl.add_session(test_accounts.jack_id,
                                                       sessions_0[i].get_session_id(),
                                                       err);
                if (err.fetch_all() == "") {
                        console.log(session);
                        throw new Error("Add amy's session to jack when it shouldn't. Cause: " + err.fetch_all());
                }
        }
        // Now bob share the first set of sessions with jack.
        for (var i = 0; i < 5; i ++) {
                var session = session_ctrl.share_session(test_accounts.bob_id,
                                                         test_accounts.jack.get_record().get_account_id(),
                                                         sessions_0[i].get_session_id(),
                                                         err);
                if (err.fetch_all() != "") {
                        console.log(session);
                        throw new Error("Failed to add amy's session to jack. Cause: " + err.fetch_all());
                }
        }
        // Add the sessions bob created. It should succeed.
        for (var i = 0; i < 5; i ++) {
                var session = session_ctrl.add_session(test_accounts.jack_id,
                                                       sessions_0[i].get_session_id(),
                                                       err);
                if (err.fetch_all() != "") {
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
        remove_test_accounts();
}
