import {ErrorMessageQueue, MongoDB} from "../api/common.js";
import {AdminRecord} from "../api/adminrecord.js";
import {Profile} from "../api/profile.js";
import {AccountManager} from "./accountmanager.js"
import {IdentityManager} from "./identitymanager.js";
import {AccountInfo, AccountControl} from "./accountcontrol.js";
import * as M_AccountControl from "./accountcontrol.js";
import {DataModelContext, G_DataModelContext} from "./datamodelcontext.js";
import {c_Meteor_Methods} from "./protocols/methods.js";


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
