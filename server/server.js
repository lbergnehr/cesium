// Map collection names to they actual collection instance
var collectionNameToCollection = {
  tasks: Task,
  settings: Setting
};

Meteor.startup(function() {

  // Load the database with initial settings
  loadBootstrapData("bootstrap/settings.json")

  // Load the database with initial data (for test?)
  if (Meteor.settings["USE_FAKE_DATA"]) {
    // Load the database with initial data (for test?)
    loadBootstrapData("bootstrap/fakedata.json");
  } else {
    RemotePoll.start()
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
            console.log("Inserting")
            collection.insert(instance);
          }
        });
      }
    });
  }
}