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
import {ErrorMessageQueue} from "../api/common.js";
import {Privilege,
        c_Root_Actions,
        c_Admin_Actions,
        c_Assistant_Actions,
        c_Provider_Actions,
        c_Patient_Actions} from "../api/privilege.js";
import {G_DataModelContext} from "./datamodelcontext.js";


export function test_MongoDB() {
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


export function test_measure() {
        var measure = new Measure(1);

        measure.set_session_id(123);
        measure.set_measure_id("345");

        if (measure.get_session_id() != 123 || measure.get_measure_id() != "345") {
                console.log(measure);
                throw "test_measure fucked up";
        }
        console.log("test_measure passed");
}


export function test_account_control() {
        var account_control = new AccountControl();
        var errmq = new ErrorMessageQueue();
        // zhaonias@uci.edu does not work!
        // @todo#davis: This error could be reproduced. Need more work on the controller layer in order to resolve the issue.
        var account_info = account_control.register(
                        "provider", "zhaonias@uci.edu", "tomasds", "9495628820", "lzn19940830haha", errmq);
        if (account_info == null) {
                console.log(errmq.fetch_all());
                throw "account_info fucked up";
        }
        // Login without activating the account.
        var identity = account_control.login_by_email("zhaonia@uci.edu", "lzn19940830haha", errmq);
        if (identity != null) {
                if (identity.get_account_record().get_activator() == "-1") {
                        // The account was falsely activated when it shouldn't.
                        console.log(account_control);
                        throw "How could you log in by email without activating your account!?";
                }
        } else {
                console.log(errmq.fetch_all());
                throw "Login should return a valid identity at any time";
        }
        // Login with an activated account.
        var activator = account_info.get_record().get_activator();
        account_control.activate(activator, errmq);

        if (account_control.login_by_email("zhaonias@uci.edu", "lzn19940830haha", errmq) == null) {
                console.log(account_control);
                throw "test_account_control fucked up";
        }
        console.log("test_account_control passed");

}


export function test_privilege_network() {
        var priv_network = G_DataModelContext.get_privilege_network();
        priv_network.reset();
        var root = priv_network.allocate_root(-1, "root");
        var bob = priv_network.allocate(123, "system");
        var amy = priv_network.allocate(124, "system");
        var janet = priv_network.allocate(125, "system");
        var paul = priv_network.allocate(126, "system");
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
