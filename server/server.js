process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Map collection names to they actual collection instance
var collectionNameToCollection = {
  settings: Setting
};

Meteor.startup(function() {
  // Load the database with initial settings
  console.log("Bootstrapping data...");
  loadBootstrapData("bootstrap/settings.json")
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
            console.log(`Inserting into ${collectionName}`)
            collection.insert(instance);
          }
        });
      }
    });
  }
};
