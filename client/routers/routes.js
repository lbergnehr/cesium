Router.configure({
  notFoundTemplate: "notFound"
});

Router.map(function() {
  this.route("home", {
    path: "/",
    template: "overview"
  });

  this.route("admin", {
    path: "admin",
    template: "admin"
  });
});
