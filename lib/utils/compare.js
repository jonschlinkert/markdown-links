const _ = require('lodash');


module.exports = function(arr, options) {
  var opts = _.extend({sortOrder: 'asc'}, options);
  var sortOrder = opts.sortOrder.toLowerCase();

  return arr.sort(function (a, b) {
    a = a.split('/').length;
    b = b.split('/').length;

    var result = a > b ? 1 : a < b ? -1 : 0;

    if(sortOrder === 'desc') {
      return result * -1;
    }

    return result;
  });
};


var compare = function(arr) {
  return arr.sort(function (a, b) {
    return a.split('/').length - b.split('/').length;
  });
};
