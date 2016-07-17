/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Chifeng Wen, Zhaonian Luan.
 * MediCom is free software; you can redistribute it and/or modify it under the terms of
 * the GNU General Public License, version 2, as published by the Free Software Foundation.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */
import {Meteor} from "meteor/meteor";
import {ValueTable} from "../api/valuetable.js";
import {AdminRecord} from "../api/adminrecord.js";
import {AccountInfo} from "../api/accountinfo.js";
import {c_Account_Type_Strings, c_Account_Type_Strings_Registerable, AccountType} from "../api/accounttype.js";
import {ParticipatedSession} from "../api/participatedsession.js";
import {Identity} from "../api/identity.js";
import {Patient} from "../api/patient.js";
import {Provider} from "../api/provider.js";
import {Profile} from "../api/profile.js";
import {ErrorMessageQueue} from "../api/common.js";



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

const csv_stream =
" 2015-11-11 22:05:00,95  \n" +
" 2015-11-12 23:08:00,108 \n" +
" 2015-11-13 22:57:00,91  \n" +
" 2015-11-15 22:15:00,109 \n" +
" 2015-11-16 22:17:00,92  \n" +
" 2015-11-17 22:11:00,90  \n" +
" 2015-11-18 21:22:00,108 \n" +
" 2015-11-19 21:34:00,99  \n" +
" 2015-11-20 22:50:00,97  \n" +
" 2015-11-22 23:47:00,107 \n" +
" 2015-11-23 22:10:00,90  \n" +
" 2015-11-24 21:31:00,83  \n" +
" 2015-11-24 21:32:00,85  \n" +
" 2015-11-25 23:12:00,91  \n" +
" 2015-11-28 23:49:00,108 \n" +
" 2015-11-29 23:18:00,96  \n" +
" 2015-11-30 11:16:00,97  \n" +
" 2015-12-04 21:46:00,97  \n" +
" 2015-12-06 21:43:00,104 \n" +
" 2015-12-07 23:32:00,99  \n" +
" 2015-12-08 22:58:00,90  \n" +
" 2015-12-09 23:21:00,100";

export function test_value_table_bp() {
        var bptable = new ValueTable();
        bptable.construct_from_csv_stream(csv_stream);

        var pairs = bptable.get_pairs();

        for (var i = 0; i < pairs.length; i ++) {
                console.log("date: " + pairs[i].date + "value: " + pairs[i].value);
        }
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
        console.log("test_account_type passed");
}


export function test_participated_session() {
        var participated_session = new ParticipatedSession(4, 8, 24);

        if (participated_session.get_session_id() != 4 || participated_session.get_provider_id() != 8 || participated_session.get_patient_id() != 24) {
                console.log(participated_session);
                throw "Participated session fucked up";
        }
        console.log("test_participated_session passed");
}


export function test_identity() {
        admin_rec = new AdminRecord(1, "327322");
        var identity = new Identity("100", admin_rec);

        if (identity.get_session_id() != "100" || !identity.get_account_record().verify_password("327322")) {
                console.log(identity);
                throw "Identity fucked up";
        }
        console.log("test_idenity passed");
}


export function test_patient() {
        var patient = new Patient(48844835);

        if (patient.get_account_id() != 48844835) {
                console.log(patient);
                throw "Patient fucked up";
        }
        console.log("test_patient passed");
}


export function test_provider() {
        var provider = new Provider(342785028);

        if (provider.get_account_id() != 342785028) {
                console.log(provider);
                throw "Provider fucked up";
        }
        console.log("test_provider passed");
}


export function test_profile() {
        var profile = new Profile("yijunw4@uci.edu", "Alex Thornton", 949-552-3234, "patient", "Alex likes boo.");

        if (profile.get_email() != "yijunw4@uci.edu" || profile.get_name() != "Alex Thornton"
            || profile.get_phone() != "949-552-3234"
            || profile.get_avatar() != "patient"
            || profile.get_description() != "Alex likes boo.") {
                console.log(profile);
                throw "profile fucked up";
        }
        console.log("test_profile passed");
}


export function test_ErrorMessageQueue() {
        var error_message_q = new ErrorMessageQueue();
        error_message_q.log("dog")
        error_message_q.log("cat")
        error_message_q.log("fish")
        error_message_q.log("frog")

        if (!_.isEqual(error_message_q.fetch_all(), ["dog", "cat", "fish", "frog"])) {
                console.log(error_message_q.fetch_all());
                throw "ErrorMessageQueue fucked up";
        }

        error_message_q.clear();
        if (!error_message_q.is_empty()) {
                console.log(error_message_q);
                throw "ErrorMessageQueue clear fucked up";
        }
        console.log("test_ErrorMessageQueue passed");
}

export function test_mongodb() {
        Meteor.call("test_mongodb");
}

export function test_measure() {
        Meteor.call("test_measure");
}

export function test_account_control() {
        Meteor.call("test_account_control");
}

export function test_privilege_network() {
        Meteor.call("test_privilege_network");
}

export function inject_test_data() {
        Meteor.call("inject_test_data");
}
