Template.setting.created = function() {
  this.reactiveFieldValue = new ReactiveVar(this.data.value);
};

Template.setting.helpers({
  submitButtonDisabledAttribute: function() {
    var fieldValue = Template.instance().reactiveFieldValue.get();
    if (!fieldValue || fieldValue === this.value) {
      return "disabled";
    }
  },

  resetButtonHiddenClass: function() {
    var fieldValue = Template.instance().reactiveFieldValue.get();
    if (!this.value || this.value === this.defaultValue) {
      return "hidden";
    }
  }
});

Template.setting.events({
  "input input": function(event) {
    var fieldValue = event.target.value;
    Template.instance().reactiveFieldValue.set(fieldValue);
  },

  "click .js-submit-setting-value": function(event) {
    event.preventDefault();

    var setting = Template.currentData();
    var fieldValue = Template.instance().reactiveFieldValue.get();

    Setting.update(setting._id, {
      $set: {
        value: fieldValue
      }
    });
  },

  "click .js-reset-setting-value": function(event) {
    event.preventDefault();

    var setting = Template.currentData();

    // Reset the value of the setting
    Setting.update(setting._id, {
      $set: {
        value: null
      }
    });

    // Reset the reactive field value
    Template.instance().reactiveFieldValue.set(null);
  }
});
