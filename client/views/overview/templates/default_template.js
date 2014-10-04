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

  maxOverviewColumns: function() {
    return Setting.get("maxOverviewColumns");
  },

  rowHeightPercentage: function() {
    return 100 / Setting.get("rowsPerOverviewPage");
  }
});

Template.task.rendered = function() {
  var taskDiv = this.find(".task");
  var height = taskDiv.clientHeight;
  var width = taskDiv.clientWidth;

  var data = this.data;

  var words = data.name.split(" ");
  var longestWord = _.chain(words)
    .pluck("length")
    .max()
    .value();
  var numberOfWords = words.length;
  var squarePixels = height * width;

  var fontSize = 2 / Math.log(longestWord * numberOfWords * numberOfWords) * Math.pow((squarePixels / 1000), 0.6);

  taskDiv.style.fontSize = fontSize + "vw";
};
