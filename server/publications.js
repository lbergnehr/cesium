let build$ = null;

Meteor.publish("tasks", function() {
  if (!build$) {
    let tcUrl = Setting.get("remoteServerUrl");
    let numberOfBuilds = 30;
    let pollInterval = Setting.get("remoteServerPollingIntervalSecs");

    let api = new TeamCity(tcUrl);
    build$ = api.getBuild$(numberOfBuilds, pollInterval * 1000).share();
  }

  let handle = build$
    .startWith([])
    .pairwise()
    .map(buildSets => {
      let lastBuildSet = buildSets[0] || [];
      let newBuildSet = buildSets[1] || [];

      let added = _(newBuildSet).filter(nb => !_(lastBuildSet).some(lb => lb.id === nb.id));
      let removed = _(lastBuildSet).filter(lb => !_(newBuildSet).some(nb => nb.id === lb.id));
      let changed = _(newBuildSet).filter(nb => _(lastBuildSet).some(lb => lb.id === nb.id && !_(lb).isEqual(nb)));

      return {added, removed, changed};
    })
    .subscribe(result => {
      //console.log(`${result.added.length} items added: ${JSON.stringify(result.added)}`);
      result.added.forEach(build => this.added("tasks", build.id, build));

      //console.log(`${result.removed.length} items removed: ${JSON.stringify(result.removed)}`);
      result.removed.forEach(build => this.removed("tasks", build.id));

      //console.log(`${result.changed.length} items changed: ${JSON.stringify(result.changed)}`);
      result.changed.forEach(build => this.changed("tasks", build.id, build));
  });

  this.onStop(function() {
    handle.dispose();
  });

  this.ready();
});

Meteor.publish("settings", function() {
  return Setting.find();
});
