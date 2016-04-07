import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

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
                Meteor.call('test_function', 'test message from client...', function (error, result) {});
                },
                });
Template.signup.events({
                'submit'(event) {
                        Meteor.call('login_by_email', {email: event.target.email.value, password: event.target.password.value}, 
                                        function (error, result) {});
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
