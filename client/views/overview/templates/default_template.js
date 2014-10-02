Template.defaultOverview.helpers({
  taskGroup: function() {
    return {
      firstThree: _.first(this.tasks, 3),
      threeMore: _.rest(this.tasks, 3)
    };
  }
});
