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
import { Template } from "meteor/templating";
import * as TestCase from "./testcases.js";

Router.route("/test-account-type", function() {
		TestCase.test_account_type();
})

Router.route("/test-account-info", function() {
		TestCase.test_account_info();
})

Router.route("/test-admin-record", function() {
		TestCase.test_admin_record();
});

Router.route("/test-value-table", function() {
        TestCase.test_value_table();
});

Router.route("/", function () {
        this.render("tmplhome");
});

Router.route("/home", function () {
        this.render("tmplhome");
});

Router.route("/reg", function () {
        this.render("tmplreg");
});

Router.route("/login", function () {
        this.render("tmpllogin");
});

Router.route("/provider", function () {
        this.render("tmplprovider");
});

Router.route("/patient", function () {
        this.render("tmplpatient");
});

Router.route("/profile", function () {
        this.render("tmplprofile");
});

Router.route("/autherror", function () {
        this.render("tmplautherror");
});

Router.route("/regresult", function () {
        this.render("tmplregresult");
});
