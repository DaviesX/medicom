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
import {AdminRecord} from "../api/adminrecord";
import {Profile} from "../api/profile";
import {AccountInfo} from "../api/accountinfo";
import {ValueTable} from "../api/valuetable";
import {Symptom} from "../api/symptom";
import {Result} from "../api/result";
import {AccountManager} from "./accountmanager"
import {IdentityModel} from "./identitymodel";
import {AccountControl} from "./accountcontrol";
import {DataModelContext} from "./datamodelcontext";
import {MeteorMethods, METHODS} from "./protocols/methods";


/*
 * <TestData> Generate mockup data for testing.
 */
export class TestData
{

        private static providers_name: Array<string> = [
                "Chifeng Wen",
                "Buck Stites",
                "Anisa Trumbauer",
                "Veronica Tijerina"
        ];

        private static patients_name: Array<string> = [
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

        private static patients_email: Array<string> = [
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

        private static providers_email: Array<string>  = [
                "chifenw@uci.edu",
                "bucks@gmail.com",
                "anisa@yahoo.com",
                "veronica@live.com"
        ];

        public static inject_test_data() : void
        {
                console.log("injecting test data...");

                MeteorMethods.system_reset();

                // Create patient's account
                var patient_ids = [];
                for (var i = 0; i < TestData.patients_name.length; i ++) {
                        var result = METHODS.register_and_activate({
                                user_group:     "patient",
                                email:          TestData.patients_email[i],
                                user_name:      TestData.patients_name[i],
                                phone:          "310-100-0248",
                                password:       "111111"
                        });
                        if (!result.error.is_empty())
                                throw Error(result.error.toString());
                        patient_ids[i] = result.get_result().get_admin_record().get_account_id();
                }
                // Create provider's account
                for (var i = 0; i < TestData.providers_name.length; i ++) {
                        METHODS.register_and_activate({
                                user_group:     "provider",
                                email:          TestData.providers_email[i],
                                user_name:      TestData.providers_name[i],
                                phone:          "310-100-0248",
                                password:       "111111"
                        });
                }
                // Login all providers
                var identities = [];
                for (var i = 0; i < TestData.providers_name.length; i ++) {
                        identities[i] = METHODS.login_by_email({
                                email:          TestData.providers_email[i],
                                password:       "111111"
                        }).get_result();
                }
                // Create sessions
                for (var j = 0; j < 4; j ++) {
                        for (var i = 0; i < TestData.providers_name.length; i ++) {
                                METHODS.create_user_association({
                                        identity:       identities[i],
                                        id:             patient_ids[(Math.random()*patient_ids.length) | 0]
                                });
                        }
                }
                var session_ids = new Set();
                for (var j = 0; j < 20; j ++) {
                        for (var i = 0; i < TestData.providers_name.length; i ++) {
                                var result2 = METHODS.create_medical_session({
                                        identity:       identities[i],
                                        id:             patient_ids[(Math.random()*patient_ids.length) | 0]
                                });
                                if (result2.get_error().is_empty())
                                        session_ids.add(result2.get_result().get_session_id());
                        }
                }
                // Create symptom measures.
                var sym_measures = new ValueTable();
                sym_measures.add_row(new Date(2015, 10, 13), 
                                     new Symptom([["headache", 4], ["hot ear", 1]],
                                                 [],
                                                 "Head exploded"));

                sym_measures.add_row(new Date(2015, 10, 14), 
                                     new Symptom([["headache", 3], ["hot ear", 2]],
                                                 [],
                                                 "Vomit"));

                sym_measures.add_row(new Date(2015, 10, 15), 
                                     new Symptom([["headache", 1]],
                                                 [],
                                                 "Light headed"));

                sym_measures.add_row(new Date(2015, 10, 16), 
                                     new Symptom([["headache", 1]],
                                                 [],
                                                 null));

                sym_measures.add_row(new Date(2015, 10, 17), 
                                     new Symptom([["headache", 1]],
                                                 [],
                                                 null));

                sym_measures.add_row(new Date(2015, 10, 18), 
                                     new Symptom([["headache", 0], ["finger numb", 2]],
                                                 [],
                                                 "My finger feels tickling"));

                sym_measures.add_row(new Date(2015, 10, 19), 
                                     new Symptom([["headache", 2], ["finger numb", 4], ["hot ear", 3]],
                                                 [],
                                                 null));

                sym_measures.add_row(new Date(2015, 10, 20), 
                                     new Symptom([["headache", 3], ["hot ear", 2]],
                                                 [],
                                                 null));

                sym_measures.add_row(new Date(2015, 10, 21), 
                                     new Symptom([["headache", 1], ["hot ear", 1], ["finger number", 2]],
                                                 [],
                                                 "A lot better"));

                sym_measures.add_row(new Date(2015, 10, 22), 
                                     new Symptom([["headache", 0], ["hot ear", 0], ["finger number", 1]],
                                                 [],
                                                 "I don't think I need to take any medicine today"));

                session_ids.forEach(function (session_id, junk, set) {
                        for (var k = 0; k < identities.length; k ++) {
                                var result = METHODS.update_measure_symptom({
                                        identity: identities[k],
                                        session_id: session_id,
                                        sym_table: sym_measures
                                });
                        }
                });
                console.log("finished test data injection");
        }

        public static reset_data(): void
        {
                MeteorMethods.system_reset();
        }

};
