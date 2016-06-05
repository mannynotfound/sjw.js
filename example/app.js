var path = require('path');
var SJW = require('../index.js').warrior;
require('colors');

var config = require('../config');
config.logfile = path.resolve(__dirname, '../data/dump.json');

function sjCallback(results) {
  console.log('FOUND A PROBLEM!');
  console.log(JSON.stringify(results).yellow.bold);
}

new SJW(config, sjCallback).startStream();
