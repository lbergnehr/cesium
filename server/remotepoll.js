var Future = Npm.require('fibers/future');

RemotePoll = {}
RemotePoll.loadTeamcityData = function () {

  console.log("== Initiating Teamcity poll.")
  var futures = [];
  futures.push(
    upsertCollectionWrapped('projects', Project, function(data) {
      return data.project
    }),
    upsertCollectionWrapped('builds', Build, function(data) {
      return data.build
    }),
    upsertCollectionWrapped('buildTypes', BuildType, function(data) {
      return data.buildType
    })
    );

  Future.wait(futures);

  console.log("All results are in. Updating Task collection")

  Build.find().forEach(function (build) {

    var buildProperties = _(build).omit(['_id','buildTypeId']);
    var buildType = BuildType.findOne({id:build.buildTypeId})
    var buildTypeProperties = _(buildType).omit(['_id','projectId','name']);
    var task = _({}).extend(buildTypeProperties, buildProperties);

    task.buildTypeName = buildType.name
    task.name = task.projectName + ", " + buildType.name 

    Task.upsert({id: build.id}, task)

  });

  console.log ( Task.find().count()  + " tasks available" );
}



// Some hardcoded settings related to polling a spedicfic Teamcity server for now.
var serverBaseUrl = "http://teamcity.jetbrains.com";
var authModel = "guestAuth"
var restBaseAddress = "app/rest"
var builds= "builds"
var url = serverBaseUrl.concat('/',authModel,'/',restBaseAddress)

var httpRequestOptions = {
  headers:{
    "Accept": "application/json;charset=utf-8"
  }
};

var upsertCollection = function (dataTypeName, collection, jsonDataExtractor) {
  var count = 0;

  console.log("Fetching " + dataTypeName + " from teamcity server.")

  var result = HTTP.get(url.concat('/',dataTypeName), httpRequestOptions); 
  data = JSON.parse(result.content);

  _(jsonDataExtractor(data)).each(function (entity) {
    collection.upsert( { id: entity.id }, entity);
    count++;
  });

  console.log ( count + " " + dataTypeName + " fetched. " + collection.find().count() + " " + dataTypeName + " available" );  

};

var upsertCollectionWrapped = upsertCollection.future()
