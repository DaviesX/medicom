// server
import {Meteor} from 'meteor/meteor';
import * as testcases from './testcases.js'
import * as protocol from './protocols/methods.js'

Meteor.startup(() => {
        // code to run on server at startup
        console.log("Meteor - starting up medicom server...");
        console.log("Meteor - loading up methods...");
        console.log(protocol.c_Meteor_Methods);
        Meteor.methods(protocol.c_Meteor_Methods);
        // testcases.TestAccountControl();
        // testcases.TestHttpSession();
        testcases.TestPrepareSampleData(false);
        // testcases.TestBPTable();
});
