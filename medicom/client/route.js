import { Template } from "meteor/templating";


Router.route("/", function () {
        this.render("tmpl-home");
});

Router.route("/home", function () {
        this.render("tmpl-home");
});

Router.route("/reg", function () {
        this.render("tmpl-reg");
});

Router.route("/login", function () {
        this.render("tmpl-login");
});

Router.route("/provider", function () {
        this.render("tmpl-provider");
});

Router.route("/autherror", function () {
        this.render("tmpl-autherror");
});
