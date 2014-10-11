Router.configure({
  notFoundTemplate: "notFound"
});

Router.onAfterAction(function() {
  var data = this.data();
  var title = data && data.title;

  var mainTitle = Setting.get("radiatorName");
  if (title) {
    document.title = title + " — " + mainTitle;
  } else {
    document.title = mainTitle;
  }
});

Router.map(function() {
  this.route("home", {
    path: "/",
    template: "overview",
    data: function() {
      return {
        tasks: Task.find({}, {
          limit: 30
        }).fetch()
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
