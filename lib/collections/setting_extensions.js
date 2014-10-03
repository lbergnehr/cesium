Setting.get = function(key) {
  var setting = Setting.findOne({key: key});
  return setting && (setting.value || setting.defaultValue);
};
