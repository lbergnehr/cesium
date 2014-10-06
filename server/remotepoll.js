var Future = Npm.require('fibers/future');

RemotePoll = {}
RemotePoll.start = function() {
  var intervalInSecs = Setting.get("remoteServerPollingIntervalSecs");
  RemotePoll.handle = Meteor.setInterval(pollAndUpsertServerData, intervalInSecs * 1000);
}

// Some hardcoded settings related to polling a teamcity server.
var authModel = "guestAuth";
var restBaseAddress = "app/rest";
var httpRequestOptions = {
  headers: {
    "Accept": "application/json;charset=utf-8"
  }
};

var getTeamcityRestEndpoint = function() {
  var serverBaseUrl = Setting.get("remoteServerUrl");
  return serverBaseUrl.concat('/', authModel, '/', restBaseAddress)
}

var pollAndUpsertServerData = function() {

  console.log("== Initiating remote server poll.");

  fetchRemoteServerData();

  console.log("All results are in the db. Updating Task collection");

  Build.find().forEach(upsertTask);

  console.log(Task.find().count() + " tasks available");
}

var fetchRemoteServerData = function() {
  var futures = [
    upsertCollectionWrapped('projects', Project, 'project'),
    upsertCollectionWrapped('builds', Build, 'build'),
    upsertCollectionWrapped('buildTypes', BuildType, 'buildType')
  ]

  Future.wait(futures);
}

var upsertTask = function(build) {

  var buildProperties = _(build).omit(['_id', 'buildTypeId']);
  var buildType = BuildType.findOne({
    id: build.buildTypeId
  });
  var buildTypeProperties = _(buildType).omit(['_id', 'projectId', 'name']);
  var task = _({}).extend(buildTypeProperties, buildProperties);

  task.buildTypeName = buildType.name;
  task.name = task.projectName + ", " + buildType.name;

  Task.upsert({
    id: build.id
  }, task);

}

var upsertCollection = function(dataTypeName, collection, dataProperty) {
  var count = 0;
  var url = getTeamcityRestEndpoint();

  console.log("Fetching " + dataTypeName + " from " + url);

  var result = HTTP.get(url.concat('/', dataTypeName), httpRequestOptions);
  data = JSON.parse(result.content);

  _(data[dataProperty]).each(function(entity) {
    collection.upsert({
      id: entity.id
    }, entity);
    count++;
  });

  console.log(count + " " + dataTypeName + " fetched. " + collection.find().count() + " " + dataTypeName + " available");

};

var upsertCollectionWrapped = upsertCollection.future();