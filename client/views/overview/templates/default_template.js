Template.defaultOverview.onCreated(function() {
  this.subscribe("tasks");
  this.subscribe("settings");
});

Template.defaultOverview.helpers({
  taskRows: function() {
    // Don't include projects ending with '_'.
    let tasks = Task.find({
      "buildType.projectName": {
        $regex: /.*[^_]$/
      }
    }, {
      sort: {
        id: -1
      }
    }).fetch();
    let taskGroups = _(tasks).groupBy(t => {
      let index = t.buildType.projectName.indexOf(" ::");
      return index === -1 ? t.buildType.projectName : t.buildType.projectName.substring(0, index);
    });

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
  $(".task-title").textfill(textFillArgs);
}, 500);
$(window).resize(throttledResize);

Template.task.onRendered(function() {
  var taskDiv = this.find(".task-title");

  $(taskDiv).textfill(textFillArgs);
});

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

    let isFailed = _.chain(tasks)
      .groupBy("buildTypeId")
      .pairs()
      .map(pair => _(pair[1]).sortBy(x => -x.id)[0])
      .some(x => x.status === "FAILURE")
      .value();

    if (isFailed) {
      return "task-failure";
    }

    return "task-success";
  },

  builds: function() {
    return _.chain(this[1])
      .sortBy(x => x.id)
      .take(5)
      .value();
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

Template.build.helpers({
  buildIsRunning: function() {
    return this.state === "running";
  }
});

Template.buildInProgress.onRendered(function() {
  let instance = Template.instance();

  let element = instance.find(".progress-bar");
  instance.progressBar = new ProgressBar.Line(element, {
    color: "#268bd2"
  });

  this.autorun(function() {
    let data = Template.currentData();
    if (!data) {
      return;
    }
    instance.progressBar.animate(data.percentageComplete / 100);
  });
});

Template.buildInProgress.onDestroyed(function() {
  if (this.progressBar) {
    this.progressBar.destroy();
  }
});

Template.finishedBuild.helpers({
  buildDuration: function() {
    let start = moment(this.startDate);
    let stop = moment(this.finishDate);

    return moment.duration(stop.diff(start)).humanize();
  }
});
