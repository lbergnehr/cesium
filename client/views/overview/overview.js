Template.overview.onCreated(function() {
  this.subscribe("settings");
});

Template.overview.helpers({
  overviewTemplate: function() {
    return Setting.get("overviewTemplate");
  },

  meteorVersion: function() {
    return Meteor.release;
  }
});
