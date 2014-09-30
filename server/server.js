// Map collection names to they actual collection instance
var collectionNameToCollection = {
  tasks: Task
};

Meteor.startup(function() {
  // Load the database with initial data (for test?)
  loadBootstrapData("bootstrap/data.json");
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
