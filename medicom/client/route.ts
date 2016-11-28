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
import {Template} from "meteor/templating";
import {TestCase} from "./testcases";


Router.route("/inject_test_data", function() {
             TestCase.inject_test_data();
             });

Router.route("/reset_data", function() {
             TestCase.reset_data();
             });

Router.route("/test_admin_record_model", function() {
             TestCase.test_admin_record_model();
             });

Router.route("/test_privilege_network", function() {
             TestCase.test_privilege_network();
             });

Router.route("/test_account_control", function() {
             TestCase.test_account_control();
             });

Router.route("/test_session_control", function() {
             TestCase.test_session_control();
             });

Router.route("/test_measure", function() {
             TestCase.test_measure();
             });

Router.route("/test_mongodb", function() {
             TestCase.test_mongodb();
             });

Router.route("/test_error_messages", function() {
             TestCase.test_error_messages();
             });

Router.route("/test_value_table", function() {
             TestCase.test_value_table();
             });

Router.route("/test_value_table_bp", function() {
             TestCase.test_value_table_bp();
             });

Router.route("/test_login", function() {
             TestCase.test_login();
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

Router.route("/account-settings", function () {
             this.render("tmplaccountsettings");
             });

Router.route("/autherror", function () {
             this.render("tmplautherror");
             });

Router.route("/regresult", function () {
             this.render("tmplregresult");
             });
