const Rx = Meteor.npmRequire("rx");

let build$ = null;
Meteor.startup(function() {
  const setting$ = Rx.Observable.create(observer => {
    Setting.find({
      $or: [{
        key: "remoteServerUrl"
      }, {
        key: "numberOfBuilds"
      }, {
        key: "remoteServerPollingIntervalSecs"
      }]
    }).observe({
      changed: function(doc) {
        observer.onNext(doc);
      }
    });
  });

  setting$.subscribe(s => console.log(`Setting changed: ${s.key}`));

  build$ = setting$
  .startWith(null)
  .map(_ => {
    let tcUrl = Setting.get("remoteServerUrl");
    let numberOfBuilds = Setting.get("numberOfBuilds");
    let pollInterval = Setting.get("remoteServerPollingIntervalSecs");

    return {tcUrl, numberOfBuilds, pollInterval};
  })
  .map(s => {
    let api = new TeamCity(s.tcUrl);
    s.api = api;
    return s;
  })
  .flatMapLatest(x => x.api.getBuild$(x.numberOfBuilds, x.pollInterval * 1000))
  .shareReplay(1);
});

Meteor.publish("tasks", function() {
  let handle = build$
    .startWith([])
    .pairwise()
    .map(buildSets => {
      let lastBuildSet = buildSets[0] || [];
      let newBuildSet = buildSets[1] || [];

      let added = _(newBuildSet).filter(nb => !_(lastBuildSet).some(lb => lb.id === nb.id));
      let removed = _(lastBuildSet).filter(lb => !_(newBuildSet).some(nb => nb.id === lb.id));
      let changed = _(newBuildSet).filter(nb => _(lastBuildSet).some(lb => lb.id === nb.id && !_(lb).isEqual(nb)));

      return {
        added, removed, changed
      };
    })
    .subscribe(result => {
      if (result.added.length > 0) {
        console.log(`${result.added.length} new tasks added`);
        result.added.forEach(build => this.added("tasks", build.id, build));
      }

      if (result.removed.length > 0) {
        console.log(`${result.removed.length} tasks removed`);
        result.removed.forEach(build => this.removed("tasks", build.id));
      }

      if (result.changed.length > 0) {
        console.log(`${result.changed.length} tasks changed`);
        result.changed.forEach(build => this.changed("tasks", build.id, build));
      }
    });

  this.onStop(function() {
    handle.dispose();
  });

  this.ready();
});

Meteor.publish("settings", function() {
  return Setting.find();
});
