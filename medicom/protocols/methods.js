// Web APIs go here
import {Meteor} from 'meteor/meteor';
import {Profile} from "../server/profile.js"
import {ErrorMessageQueue} from "../server/common.js"
import {AccountControl} from "../server/accountcontrol.js"
import {ProviderControl} from "../server/providercontrol.js"


var g_acc_ctrl = new AccountControl();
var g_provider_ctrl = new ProviderControl();

function server_print(arg) {
        console.log(arg);
}

function user_login_by_email(email, password) {
        return acc_ctrl.login_by_id(email, password);
}

function user_login_by_id(id, password) {
        return acc_ctrl.login_by_id(id, password);
}

function user_register(account_type, email, name, phone, password) {
        var err = new ErrorMessageQueue();
        var info = acc_ctrl.register(account_type, email, name, phone, password, err);
        return { account_info: info, error: err.fetch_all() };
}

function user_register_and_activate(account_type, email, name, phone, password) {
        var err = new ErrorMessageQueue();
        var info = acc_ctrl.register(account_type, email, name, phone, password, err);
        if (info != null) {
                acc_ctrl.activate(info.get_account_record().get_activator(), err);
        }
        return { account_info: info, error: err.fetch_all() };
}

function provider_get_patient_set(identity) {
        return g_provider_ctrl.get_participated_patients();
}

export var c_Meteor_Methods = {
server_print: function(arg) {
                       server_print(arg.test_string);
               },
user_login_by_email: function(arg) {
                       return user_login_by_email(arg.email, arg.password);
                },
user_login_by_id: function(arg) {
                        return user_login_by_id(arg.id, arg.password);
                },
user_register: function(arg) {
                        return user_register(arg.account_type, email, name, phone, password);
                },
user_register_and_activate: function(arg) {
                        return user_register_and_activate(arg.account_type, email, name, phone, password);
                },
provider_get_patient_set: function(arg) {
                        return provider_get_patient_set(arg.identity);
                },
};
