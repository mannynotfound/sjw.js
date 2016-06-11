var path = require('path');
var SJW = require('../index.js').Warrior;
require('colors');

var config = require('../config');
config.logfile = path.resolve(__dirname, '../data/dump.json');

function sjCallback(results) {
  console.log('FOUND A PROBLEM!');
  console.log(JSON.stringify(results).yellow.bold);
  console.log('https://twitter.com/' + results.tweet.user.screen_name + '/status/' + results.tweet.id_str);
}

var sjwStream = new SJW(config, sjCallback);
sjwStream.startStream();

//test user
//sjwStream.getClient().get('account/verify_credentials', {}, function(err, resp) {
  //console.log(err || resp);
//});
