/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Zhaonian Luan.
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

// if test_MongoDB failed,
export function test_MongoDB() {
        var db = new MongoDB();
        
        temp_set = new set();
        const test_scale = 1000;
        for (var i = 0; i < test_scale; i++) {
                temp_set.add(db.get_string_uuid());
        }
        if (temp_set.size() != test_scale) {
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
        var account_info = account_control.register("provider", "zhaonias@uci.edu", "tomasds", "9495628820", "lzn19940830haha", errmq);
        if (account_info == null) {
                console.log(errmq.fetch_all());
                throw "account_info fucked up";
        }
        // Will perform this test later!!!
        
//        if (account_control.login_by_email("zhaonia@uci.edu", "lzn19940830haha", errmq) != null) {
//                console.log(account_control);
//                throw("How could you log in by email without activating your account!?");
//        }
        var activator = account_info.get_record().get_activator();
        account_control.activate(activator, errmq);
        
        if (account_control.login_by_email("zhaonias@uci.edu", "lzn19940830haha", errmq) == null) {
                console.log(account_control);
                throw "test_account_control fucked up";
        }
        console.log("test_account_control passed");
        
}
















