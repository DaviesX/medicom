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
import {AdminRecord} from "../api/adminrecord.js";
import {AccountInfo} from "../api/accountinfo.js";
import {c_Account_Type_Strings, c_Account_Type_Strings_Registerable, AccountType} from "../api/accounttype.js";



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

export function test_admin_record() {
		var admin_rec = new AdminRecord(0, '123456');
		
		if (!admin_rec.verify_password('123456')) {
			console.log(admin_rec);
			throw "Password fucked up";
		}
		if (admin_rec.verify_password("000000")) {
			console.log(admin_rec);
			throw "Password fucked up = 000000";
		}
		console.log("test_admin_password passed");
}

export function test_account_info() {
		var account_info = new AccountInfo(null, 32, 'frog', 'frogl@uci.edu');
		
		if (account_info.get_record() != null || account_info.get_account_id() != 32 || account_info.get_name() != 'frog' || account_info.get_email() !=	'frogl@uci.edu') {
				console.log(account_info);
				throw "account info fucked up";
		}
		console.log("test_account_info passed");
}

export function test_account_type() {
		var account_type = new AccountType();
		
		for (account in c_Account_Type_Strings) {
				if (account_type.get_string_from_account_type(account_type.get_account_type_from_string(account) in ["admin", "provider", "patient", "super intendant"])) {
						console.log(account);
						throw "General account type fucked up";
				}
		}
		
		for (account in c_Account_Type_Strings_Registerable) {
			if (account_type.get_string_from_account_type(account_type.get_account_type_from_string(account) in ["provider", "patient", "super intendant"])) {
					console.log(account);
					throw "Registerable account type fucked up";
				}
		}
		console.log('test_account_type passed');
}




















