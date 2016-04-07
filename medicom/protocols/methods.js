// Web APIs go here
import {Meteor} from 'meteor/meteor';
// import * as singletons from '../server/singletons.js'

function test_function(arg) {
        console.log(arg);
}

function login_by_email(email, password) {
//        console.log(singletons);
        console.log("email:" + email);
        console.log("password:" + password);
}

export var c_Meteor_Methods = {
test_function: function(arg) {
                       test_function(arg);
               },
login_by_email: function(arg) {
                       login_by_email(arg.email, arg.password);
                }
};
