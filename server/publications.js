var api = new TeamCity(Setting.get("remoteServerUrl"));

Meteor.publish("tasks", function() {
  var handle = api.getBuild$(30)
    .flatMap(build => api.getBuildDetail$(build.id).map(details => _(build).extend(details)))
    .subscribe(result => {
      console.log(`Added ${result.id}`);
      this.added("tasks", result.id, result);
    });

  this.onStop(function() {
    handle.dispose();
  });
  
  this.ready();
});

Meteor.publish("settings", function() {
  return Setting.find();
});
