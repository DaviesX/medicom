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
import * as M_Methods from "./protocols/methods";
import {AdminRecord} from "../api/adminrecord.js";
import {Profile} from "../api/profile.js";
import {AccountManager} from "./accountmanager.js"
import {IdentityModel} from "./identitymodel.js";
import {AccountInfo, AccountControl} from "./accountcontrol.js";
import * as M_AccountControl from "./accountcontrol.js";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {c_Meteor_Methods} from "./protocols/methods.js";
import {ValueTable} from "../api/valuetable.js";


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

export function PrepareTestData() {
        console.log("TestPrepareSampleData - begins");

        M_Methods.system_reset();

        // Create patient's account
        var patient_ids = [];
        for (var i = 0; i < patients_name.length; i ++) {
                var result = c_Meteor_Methods.user_register_and_activate({
                        user_group: "patient",
                        email: patients_email[i],
                        user_name: patients_name[i],
                        phone: "310-100-0248",
                        password: "111111"
                });
                if (result.error != "")
                        throw Error(result.error.toString());
                patient_ids[i] = result.account_info.get_record().get_account_id();
        }
        // Create provider's account
        for (var i = 0; i < providers_name.length; i ++) {
                c_Meteor_Methods.user_register_and_activate({
                        user_group: "provider",
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
        var session_ids = new Set();
        for (var j = 0; j < 20; j ++) {
                for (var i = 0; i < providers_name.length; i ++) {
                        var result = c_Meteor_Methods.provider_start_new_session_with({
                                identity: identities[i],
                                id: patient_ids[(Math.random()*patient_ids.length) | 0]
                        });
                        if (result.error == "")
                                session_ids.add(result.session.get_session_id());
                }
        }
        // Create symptom measures.
        var sym_measures = new ValueTable();
        sym_measures.add_row(new Date(2015, 10, 13), {
                patients_feel: 5,
                description: "Lorem ipsum dolor sit amet, ex nec sint idque, mel et mollis iisque appareat, lorem ubique disputationi qui cu. At veri fabellas pri. Equidem accusam adipiscing ut eam. Mei ut alia mollis, quo soleat theophrastus te, an has sumo nullam dignissim."
        });
        sym_measures.add_row(new Date(2015, 10, 14), {
                patients_feel: 4,
                description: "Primis assentior et has, ex pericula definitiones mea, sententiae scripserit mediocritatem ad quo. Et his volumus atomorum dignissim, impedit reprehendunt eam an. Apeirian definitiones signiferumque mei eu, eros assueverit mediocritatem ad qui, ea inani noluisse adipiscing usu. In stet eirmod sit. Veri adhuc sed et, per illum sapientem at. Eam omittam legendos facilisis an, etiam putent perpetua est no, iudico dolorum eu quo."
        });
        sym_measures.add_row(new Date(2015, 10, 15), {
                patients_feel: 2,
                description: "Sea ei option veritus, ea nonumy euismod torquatos duo. No suas epicuri est, ullum deserunt cum cu. His ut expetenda intellegam. An vocent tibique interesset cum, scripta officiis cum te. Usu eu postea integre explicari, vis te inani soluta deterruisset. Ius aliquip alterum facilisis at."
        });
        sym_measures.add_row(new Date(2015, 10, 16), {
                patients_feel: 3,
                description: "Animal euismod te vel. Ius putant numquam dolorum at. Pri eu timeam constituto, ex verear iuvaret vel. Modus dictas voluptua in nec."
        });
        sym_measures.add_row(new Date(2015, 10, 17), {
                patients_feel: 4,
                description: "Antiopam tractatos eu quo, et agam prompta mel, appareat adipiscing vis ne. Te eos simul bonorum, pri an elit dissentiet, vis semper docendi definitiones at. Pri ei principes disputationi. Id liber aeque persius qui, mea ut movet tibique praesent."
        });
        sym_measures.add_row(new Date(2015, 10, 18), {
                patients_feel: 5,
                description: "Antiopam tractatos eu quo, et agam prompta mel, appareat adipiscing vis ne. Te eos simul bonorum, pri an elit dissentiet, vis semper docendi definitiones at. Pri ei principes disputationi. Id liber aeque persius qui, mea ut movet tibique praesent."
        });
        session_ids.forEach(function (session_id, junk, set) {
                for (var k = 0; k < identities.length; k ++) {
                        var result = c_Meteor_Methods.user_update_symptom({
                                identity: identities[k],
                                session_id: session_id,
                                sym_table: sym_measures
                        });
                }
        });
        console.log("TestPrepareSampleData - ends");
}
