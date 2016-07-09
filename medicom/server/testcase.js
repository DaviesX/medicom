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

