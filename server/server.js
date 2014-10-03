// Map collection names to they actual collection instance
var collectionNameToCollection = {
  tasks: Task,
  settings: Setting,
  projects: Project
};

Meteor.startup(function() {
    // Load the database with initial data (for test?)
    if ( process.env.USE_BOOTSTRAP_DATA) {
      loadBootstrapData("bootstrap/data.json");
    } else {
      upsertCollection('projects', Project, function(data) {
        return data.project
      })

      upsertCollection('builds', Build, function(data) {
        return data.build
      })

      upsertCollection('buildTypes', BuildType, function(data) {
        return data.buildType
      })


      Build.find().forEach(function (build) {

        var buildProperties = _(build).omit(['_id','buildTypeId','href']);
        var buildType = BuildType.findOne({id:build.buildTypeId})
        var buildTypeProperties = _(buildType).omit(['_id','projectId','id','name']);
        var task = _({}).extend(buildTypeProperties, buildProperties);

        task.buildTypeName = buildType.name
        task.name = task.projectName + ", " + buildType.name 

        Task.upsert({id: build.id}, task)

      });

      console.log ( Task.find().count()  + " tasks available" );


  }
});

var loadBootstrapData = function(fileName) {
  var bootstrapTextData = Assets.getText(fileName);
  if (bootstrapTextData) {
    var bootstrapData = EJSON.parse(bootstrapTextData);
    var keys = _.keys(bootstrapData);
    _(keys).each(function(collectionName) {
      var collection = collectionNameToCollection[collectionName];
      if (!collection.find().count()) {
        _(bootstrapData[collectionName]).each(function(instance) {
          if (collection) {
            collection.insert(instance);
          }
        });
      }
    });
  }
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
  result = HTTP.get(url.concat('/',dataTypeName), httpRequestOptions) 

  data = JSON.parse(result.content);

  _(jsonDataExtractor(data)).each(function (entity) {
    collection.upsert( { id: entity.id }, entity);
    count++;
  });

  console.log ( count + " " + dataTypeName + " fetched");
  console.log ( collection.find().count() + " " + dataTypeName + " available" );  
}



