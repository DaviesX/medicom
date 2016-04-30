import { Template } from "meteor/templating";


Router.route("/", function () {
        this.render("tmplhome");
});

Router.route("/home", function () {
        this.render("tmplhome");
});

Router.route("/reg", function () {
        this.render("tmplreg");
});

Router.route("/login", function () {
        this.render("tmpllogin");
});

Router.route("/provider", function () {
        this.render("tmplprovider");
});

Router.route("/autherror", function () {
        this.render("tmplautherror");
});

Router.route("/regresult", function () {
        this.render("tmplregresult");
});
