import { Template } from 'meteor/templating';
import "../html/login.html";


Template.tmpllogin.onRendered(function () {
        console.log("login template rendered");
});


Template.tmplreg.events({"click #btn-signup"(event) {
        var regerror = "";
        return;
}});
