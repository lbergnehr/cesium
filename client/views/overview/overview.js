Template.overview.helpers({
  overviewTemplate: function() {
    return Setting.get("overviewTemplate");
  },

  meteorVersion: function() {
    return Meteor.release;
  }
});
