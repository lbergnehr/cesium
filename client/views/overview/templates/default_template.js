Template.defaultOverview.onCreated(function() {
  this.subscribe("tasks");
  this.subscribe("settings");
});

Template.defaultOverview.helpers({
  taskRows: function() {
    let tasks = Task.find({}, {
      sort: {
        id: -1
      }
    }).fetch();
    let taskGroups = _(tasks).groupBy(t => t.buildType.projectName);

    var maxColumns = Setting.get("maxOverviewColumns");
    return _.chain(_(taskGroups).pairs())
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

var textFillArgs = {
  maxFontPixels: 500
};
var throttledResize = _.debounce(function() {
  $(".task > div").textfill(textFillArgs);
}, 500);
$(window).resize(throttledResize);

Template.task.rendered = function() {
  var taskDiv = this.find(".task > div");

  $(taskDiv).textfill(textFillArgs);
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
    let tasks = this[1];

    let isRunning = _(tasks).some(x => x.state === "running");
    if (isRunning) {
      return "task-running";
    }

    let isFailed = _(tasks).some(x => x.status === "FAILURE");
    if (isFailed) {
      return "task-failure";
    }

    return "task-success";
  },

  builds: function() {
    return this[1];
  },

  buildStatusClass: function() {
    if (this.state === "running") {
      return "task-running";
    }

    if (this.status === "FAILURE") {
      return "task-failure";
    }

    return "task-success";
  }
});
