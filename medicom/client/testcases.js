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
import {ValueTable} from "../api/valuetable.js";

export function test_value_table() {
        var has_passed = true;
        var table = new ValueTable();
        var table2 = new ValueTable();
        
        // Prepare data for the table.
        table.add_row(new Date(12345), {x: 1});
        table.add_row(new Date(12344), {x: 2});
        table.add_row(new Date(12345), {x: 3});
        table.add_row(new Date(12343), {x: 4});
        table.add_row(new Date(12342), {x: 5});
        table.add_row(new Date(12343), {x: 6});
        table = table.sort_data(false);
        
        table2.add_row(new Date(12345), {y: 2});
        table2.add_row(new Date(12345), {y: 3});
        table2.add_row(new Date(12344), {y: 4});
        table2.add_row(new Date(12342), {y: 1});
        // table2.sort_data(false);
        
        // Test get row.
        var v = table.get_row(new Date(12343));
        if (v == null || v.value.x != 4) {
                console.log(v);
                throw "Get sorted row return incorrect result";
        }
        
        v = table2.get_row(new Date(12344));
        if (v == null || v.value.y != 4) {
                console.log(v);
                throw "Get unsorted row return incorrect result";
        }
        
        // Test intersection.       
        var table_intersect = table.intersect_with(table2, function(a, b) {
                                        return a.getTime() === b.getTime();
                                }, true);
        console.log(table_intersect);
        console.log("test_value_table passed");
}
