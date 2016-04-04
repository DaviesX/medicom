// server
import {Meteor} from 'meteor/meteor';
import * as testcases from './testcases.js'


Meteor.startup(() => {
                // code to run on server at startup
                console.log("Meteor - starting up medicom server...");
                testcases.TestAccountControl();
                // testcases.TestHttpSession();
                });
