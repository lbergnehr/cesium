Session.setDefault("maxOverviewColumns", 3);
Session.setDefault("rowsPerOverviewPage", 2);

Template.defaultOverview.helpers({
  taskRows: function() {
    var maxColumns = Session.get("maxOverviewColumns");
    return _.chain(this.tasks)
      .groupBy(function(item, index) {
        return Math.floor(index / maxColumns);
      })
      .values()
      .value();
  },

  maxOverviewColumns: function() {
    return Session.get("maxOverviewColumns");
  },

  rowHeightPercentage: function() {
    return 100 / Session.get("rowsPerOverviewPage");
  }
});
