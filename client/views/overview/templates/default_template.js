Template.defaultOverview.helpers({
  taskRows: function() {
    var maxColumns = Setting.get("maxOverviewColumns");
    return _.chain(this.tasks)
      .groupBy(function(item, index) {
        return Math.floor(index / maxColumns);
      })
      .values()
      .value();
  },

  rowHeightPercentage: function() {
    return 100 / Setting.get("rowsPerOverviewPage");
  }
});

Template.task.rendered = function() {
  var taskDiv = this.find(".task div");

  $(taskDiv).textfill({
    maxFontPixels: 500
  });
};

var statusMap = {
  SUCCESS: "task-success",
  FAILURE: "task-failure"
};
Template.task.helpers({
  columnWidthPercentage: function() {
    return 100 / Setting.get("maxOverviewColumns");
  },

  taskStatusClass: function() {
    return statusMap[this.status];
  }
});
