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
import { Template } from "meteor/templating";
import * as TestCase from "./testcases.js";

Router.route("/test-admin-record-model", function() {
             TestCase.test_admin_record_model();
             });

Router.route("/inject-test-data", function() {
             TestCase.inject_test_data();
             });

Router.route("/test-privilege-network", function() {
             TestCase.test_privilege_network();
             });

Router.route("/test-account-control", function() {
             TestCase.test_account_control();
             });

Router.route("/test-session-control", function() {
             TestCase.test_session_control();
             });

Router.route("/test-measure", function() {
             TestCase.test_measure();
             });

Router.route("/test-mongodb", function() {
             TestCase.test_mongodb();
             });

Router.route("/test-error-message-queue", function() {
             TestCase.test_ErrorMessageQueue();
             });

Router.route("/test-profile", function() {
             TestCase.test_profile();
             });

Router.route("/test-provider", function() {
             TestCase.test_provider();
             });

Router.route("/test-patient", function() {
             TestCase.test_patient();
             });

Router.route("/test-identity", function() {
             TestCase.test_identity();
             });

Router.route("/test-participated-session", function() {
             TestCase.test_participated_session();
             });

Router.route("/test-account-type", function() {
             TestCase.test_account_type();
             });

Router.route("/test-account-info", function() {
             TestCase.test_account_info();
             });

Router.route("/test-admin-record", function() {
             TestCase.test_admin_record();
             });

Router.route("/test-value-table", function() {
             TestCase.test_value_table();
             });

Router.route("/test-value-table-bp", function() {
             TestCase.test_value_table_bp();
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
