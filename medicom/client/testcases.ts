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
import {PillCapAction} from "../api/pillcapaction";
import {BloodPressure} from "../api/bloodpressure";
import {ValueTable, Row} from "../api/valuetable";
import {IRowValue, RowValueObject} from "../api/irowvalue";
import {AdminRecord} from "../api/adminrecord";
import {AccountInfo} from "../api/accountinfo";
import {UserGroup} from "../api/usergroup";
import {MedicalSession} from "../api/medicalsession";
import {Identity} from "../api/identity";
import {Profile} from "../api/profile";
import {Result} from "../api/result";
import {ErrorMessages} from "../api/error";

/// <reference path="../tslib/underscore.d.ts" />

/*
 * Client side test cases.
 */
export class TestCase {

        public static test_admin_record_model(): void
        {
                Meteor.call("test_admin_record_model");
        }

        public static test_value_table(): void
        {
                var has_passed = true;
                var table = new ValueTable();
                var table2 = new ValueTable();

                // Prepare data for the table.
                table.add_row(new Date(12345), new PillCapAction(true));
                table.add_row(new Date(12344), new PillCapAction(true));
                table.add_row(new Date(12345), new PillCapAction(true));
                table.add_row(new Date(12343), new PillCapAction(true));
                table.add_row(new Date(12342), new PillCapAction(true));
                table.add_row(new Date(12343), new PillCapAction(true));
                table = table.sort_data(false);

                table2.add_row(new Date(12345), new BloodPressure(60, 80, 50));
                table2.add_row(new Date(12345), new BloodPressure(62, 90, 55));
                table2.add_row(new Date(12344), new BloodPressure(70, 120, 58));
                table2.add_row(new Date(12342), new BloodPressure(75, 118, 57));
                // table2.sort_data(false);

                // Test get row.
                var r: Row = table.get_row(new Date(12343));
                if (r == null) {
                        console.log(r.to_string());
                        throw new Error("Get sorted row return incorrect result");
                }

                r = table2.get_row(new Date(12344));
                if (r == null) {
                        console.log(r.to_string());
                        throw new Error("Get unsorted row return incorrect result");
                }

                // Test intersection.
                var table_intersect: ValueTable = table.intersect_with(table2, function(a: Date, b: Date) {
                        return a.getTime() == b.getTime();
                }, RowValueObject.RowValueSymptom, true);
                console.log(table_intersect.to_string());
                console.log("test_value_table passed");
        }

        private static csv_stream: string =
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

        public static test_value_table_bp(): void
        {
                var bptable = new ValueTable();
                bptable.construct_from_bpcsv_stream(TestCase.csv_stream);

                var rows = bptable.all_rows();

                for (var i = 0; i < bptable.num_rows(); i ++) {
                        console.log("date: " + rows[i].get_date() 
                                  + "value: " + rows[i].get_value(RowValueObject.RowValueBloodPressure));
                }
        }

        public static test_login(): void
        {
                Meteor.call("login_by_email", 
                            {email: "chifenw@uci.edu", password: "111111"}, function (err, pod) {
                        var result: Result<AccountInfo> = <Result<AccountInfo>> Result.recover(pod);
                        if (result.get_result() == null) {
                                console.log(result.get_error().toString());
                                throw new Error("Failed to login the account");
                        } else {
                                console.log(result.get_result());
                                console.log("test_login passed");
                        }
                });
        }

        public static test_error_messages(): void
        {
                var errs = new ErrorMessages();
                errs.log("dog")
                errs.log("cat")
                errs.log("fish")
                errs.log("frog")

                if (!_.isEqual(errs.fetch_all(), ["dog", "cat", "fish", "frog"])) {
                        console.log(errs.fetch_all());
                        throw new Error("ErrorMessages doesn't match the expected value");
                }

                errs.clear();
                if (!errs.is_empty()) {
                        console.log(errs);
                        throw new Error("Failed to clear the ErrorMessages");
                }
                console.log("test_ErrorMessageQueue passed");
        }

        public static test_mongodb(): void
        {
                Meteor.call("test_mongodb");
        }

        public static test_measure(): void
        {
                Meteor.call("test_measure");
        }

        public static test_account_control(): void
        {
                Meteor.call("test_account_control");
        }

        public static test_session_control(): void
        {
                Meteor.call("test_session_control");
        }

        public static test_privilege_network(): void
        {
                Meteor.call("test_privilege_network");
        }

        public static inject_test_data(): void
        {
                Meteor.call("inject_test_data");
        }

        public static reset_data(): void
        {
                Meteor.call("reset_data");
        }

};
