process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

Meteor.startup(function() {
  // Load the database with initial settings
  console.log("Bootstrapping data...");
  loadBootstrapData("bootstrap/settings.json")
});

let loadBootstrapData = function(settingFileName) {
  let bootstrapTextData = Assets.getText(settingFileName);
  if (bootstrapTextData) {
    let settings = EJSON.parse(bootstrapTextData).settings;
    _(settings).each(s => {
      let existingSetting = Setting.findOne({key: s.key});
      if (!existingSetting) {
        Setting.insert(s);
      }
    });
  }
};
