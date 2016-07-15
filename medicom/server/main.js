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
// server
import {Meteor} from 'meteor/meteor';
import * as TestData from './testdata.js'
import * as protocol from './protocols/methods.js'
import * as TestCase from './testcase.js'


Meteor.startup(() => {

               // code to run on server at startup
               console.log("Meteor - starting up medicom server...");
               console.log("Meteor - loading up methods...");
               console.log(protocol.c_Meteor_Methods);
               Meteor.methods(protocol.c_Meteor_Methods);
               TestData.PrepareTestData(false);
               // TestCase.test_MongoDB();
               // TestCase.test_measure();
               // TestCase.test_account_control();
               });




