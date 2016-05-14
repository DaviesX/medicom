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
import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {AdminRecord} from "../api/adminrecord.js";
import {Profile} from "../api/profile.js";
import {AccountManager} from "./accountmanager.js"
import {IdentityManager} from "./identitymanager.js";
import {AccountInfo, AccountControl} from "./accountcontrol.js";
import * as M_AccountControl from "./accountcontrol.js";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {c_Meteor_Methods} from "./protocols/methods.js";
import {BPTable} from "../api/bptable.js";


// test cases
export function TestAccountControl() {
        console.log("TestAccountControl - begins");
        console.log("TestAccountControl - reset database");
        
        G_DataModelContext.get_mongodb().reset();
        G_DataModelContext.get_account_manager().reset();
        G_DataModelContext.get_identity_manager().reset();
        
        console.log("TestAccountControl - creating account");
        var acc_ctrl = new AccountControl();
        var err = new ErrorMessageQueue();
        var account_info = acc_ctrl.register("provider", "example@mail.org", "Chifeng Wen", "424-299-7492", "12345abcde", err);
        console.log("created record: ");
        console.log(account_info);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - creating the same account(error expected).");
        var account_info2 = acc_ctrl.register("provider", 
                                              "example@mail.org", "Chifeng Wen", "424-299-7492", "12345abcde", err);
        console.log("created record: ");
        console.log(account_info2);
        console.log("error: " + err.fetch_all());
        
        console.log("TestAccountControl - try to activate the account");
        var record = G_DataModelContext.get_account_manager().get_account_record_by_id(account_info.get_account_id());
        if (!acc_ctrl.activate(record.__activator, err)) {
                console.log("TestAccountControl - Failed to activate the account when it should, error: " + err.fetch_all());
        }
        
        console.log("TestAccountControl - try to login the account");
        var identity = acc_ctrl.login_by_email("example@mail.org", "12345abcde", err);
        console.log("identity retrieved: ");
        console.log(identity);
        console.log("error: " + err.fetch_all());
        console.log("TestAccountControl - ends");
}

const providers_name = [
        "Chifeng Wen",
        "Buck Stites",
        "Anisa Trumbauer",
        "Veronica Tijerina"
];

const patients_name = [
        "Oliva Granger",
        "Francesco Fan",
        "Wilbur Bates",
        "Frankie Engel",
        "Flor Wierenga",
        "Sharolyn Demont",
        "Terina Pettey",
        "Lizzie Fairbairn",
        "Dillon Crippen",
        "Alfonzo Redner",
        "Briana Siple",
        "Ron Bonin",
        "Darcel Hickmon",
        "Mignon Dudney",
        "Liza Locascio",
        "Lamont Riggleman",
        "Wendi Schw"
];

const patients_email = [
        "en-bfcu@l-a48agtf.com",
        "2halar@z9ay0ndczbe6.com",
        "gcz_@axes4opsvq.com",
        "9tv0ftkjw_k16@nl-q09pwc8.com",
        "m0b42zzh@hum14vk36.com",
        "ilwzktc8v.lalhc@c811d9jqxc.com",
        "780@pdh-3rs5mc4x.com",
        "7fg3@7754fj.com",
        "kncfktis@s-0-5kb.com",
        "e33k0rf5k--@tnf31i8-1eqh.com",
        "h-1j@vwnlmxh4.com",
        "d2-xcdo5ll4aq@hitvprkyb7bm.com",
        "vbrve@fs1ivda7o3.com",
        "_fnvw67j83ki--@3-oldu553o8.com",
        "lugdtmqc9j9ed@wokumcu.com",
        "yqsdxcdf@wekdosk.com",
        "dgwq3mdf9j9ed@23ci0zk.com",
];

const providers_email = [
        "chifenw@uci.edu",
        "bucks@gmail.com",
        "anisa@yahoo.com",
        "veronica@live.com"
];

export function TestPrepareSampleData(to_reset) {
        console.log("TestPrepareSampleData - begins");
        
        if (!to_reset) return;
        console.log("TestPrepareSampleData - reset database");
        G_DataModelContext.reset_all();
        
        // Create patient's account
        var patient_ids = [];
        for (var i = 0; i < patients_name.length; i ++) {
                var result = c_Meteor_Methods.user_register_and_activate({
                        account_type: "patient",
                        email: patients_email[i],
                        user_name: patients_name[i],
                        phone: "310-100-0248",
                        password: "111111"
                });
                patient_ids[i] = result.account_info.get_record().get_account_id();
        }
        // Create provider's account
        for (var i = 0; i < providers_name.length; i ++) {
                c_Meteor_Methods.user_register_and_activate({
                        account_type: "provider",
                        email: providers_email[i],
                        user_name: providers_name[i],
                        phone: "310-100-0248",
                        password: "111111"
                });
        }
        // Login all providers
        var identities = [];
        for (var i = 0; i < providers_name.length; i ++) {
                identities[i] = c_Meteor_Methods.user_login_by_email({
                        email: providers_email[i],
                        password: "111111"
                }).identity;
        }
        // Create sessions
        for (var j = 0; j < 4; j ++) {
                for (var i = 0; i < providers_name.length; i ++) {
                        c_Meteor_Methods.provider_add_patient_by_id({
                                identity: identities[i],
                                id: patient_ids[(Math.random()*patient_ids.length) | 0]
                        });
                }
        }
        for (var j = 0; j < 1000; j ++) {
                for (var i = 0; i < providers_name.length; i ++) {
                        c_Meteor_Methods.provider_start_new_session_with({
                                identity: identities[i],
                                id: patient_ids[(Math.random()*patient_ids.length) | 0]
                        });
                }
        } 
        console.log("TestPrepareSampleData - ends");
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

export function TestBPTable() {
        var bptable = new BPTable();
        bptable.construct_from_csv_stream(csv_stream);

        var values = bptable.get_bp_values();
        var dates = bptable.get_dates();

        for (var i = 0; i < values.length; i ++) {
                console.log("date: " + dates[i].toString() + "value: " + values[i]);
        }
}
