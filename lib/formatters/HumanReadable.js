'use strict';

var stream = require('stream'),
    util = require('util');

var moment = require('moment'),
    stringifyObject = require('stringify-object');

var colorize = require('./colorize');

var Transform = stream.Transform;

var HumanReadable = function (options) {
  options = options || {};
  options.objectMode = true;

  Transform.call(this, options);
};

util.inherits(HumanReadable, Transform);

/*eslint-disable no-underscore-dangle*/
HumanReadable.prototype._transform = function (chunk, encoding, callback) {
/*eslint-enable no-underscore-dangle*/
  var result = '',
      timestamp = moment.utc(chunk.timestamp);

  result += colorize(chunk.message + ' (' + chunk.level + ')', chunk.level, 'bold') + '\n';
  result += colorize(chunk.module.name + '@' + chunk.module.version, 'white');
  if (chunk.source) {
    result += colorize(' (' + chunk.source + ')', 'white');
  }
  result += '\n';
  result += colorize(timestamp.format('HH:mm:ss.SSS') + '@' + timestamp.format('YYYY-MM-DD') + ' ' + chunk.pid + '#' + chunk.id, 'gray') + '\n';
  if (chunk.metadata) {
    result += colorize(stringifyObject(chunk.metadata, {
      indent: '  ',
      singleQuotes: true
    }).replace(/\\n/g, '\n'), 'gray') + '\n';
  }
  result += colorize(new Array((process.stdout.columns || 80) + 1).join('\u2500'), 'gray') + '\n';

  this.push(result);
  callback();
};

module.exports = HumanReadable;
