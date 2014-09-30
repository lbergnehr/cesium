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
        title: "Overview"
      };
    }
  });

  this.route("admin", {
    path: "admin",
    template: "admin",
    data: function() {
      return {
        title: "Administration"
      }
    }
  });
});
