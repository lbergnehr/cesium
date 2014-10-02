Router.configure({
  notFoundTemplate: "notFound"
});

Router.onAfterAction(function() {
  var data = this.data();
  var title = data && data.title;

  document.title = title || "Cesium";
});

Router.map(function() {
  this.route("home", {
    path: "/",
    template: "overview",
    data: function() {
      return {
        title: "Overview",
        tasks: Task.find().fetch()
      };
    }
  });

  this.route("admin", {
    path: "admin",
    template: "admin",
    data: function() {
      return {
        title: "Administration",
        settings: Setting.find()
      }
    }
  });
});
