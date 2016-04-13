import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Identity} from "../server/identity.js"
import './main.html';

Template.hello.onCreated(function helloOnCreated() {
                // counter starts at 1
                this.counter = new ReactiveVar(1);
                });

Template.hello.helpers({
                counter() {
                        return Template.instance().counter.get();
                },
                });

Template.hello.events({
                'click #click-me'(event, instance) {
                // increment the counter when button is clicked
                instance.counter.set(instance.counter.get() + 1);
                Meteor.call('server_print', {message: 'test message from client...'}, function (error, result) {});
                },
                });
Template.signup.events({
                'submit'(event) {
                        var email = event.target.email.value;
                        var password = event.target.password.value
                        var login_ret = Meteor.call('user_login_by_email', 
                                                    {email: email, password: password}, 
                                                    function (error, result) {});
                        if (login_ret.identity === null) {
                                console.log(login_ret.error);
                                return;
                        } else {
                                Session.set("identity", login_ret.identity);
                        }
                },
                });

Template.loginstate.helpers({
                        is_logged_in() {
                                if (Session.get("identity") === undefined)
                                        return "You are not logged in yet";
                                else
                                        return "You are logged in";
                        },
                });
