var unirest = require('unirest');
var Twitter = require('twitter');
var jsonfile = require('jsonfile');
var FILEPATH = './data/dump.json';
var config = require('./config');
require('colors');

var client = new Twitter(config.twitter_api);

function checkProblematic(problematics, face) {
  var problemTraits = [];

  if (problematics.indexOf(face.attribute.gender.value) > -1) {
    problemTraits.push(face.attribute.gender.value);
  }

  if (problematics.indexOf(face.attribute.race.value) > -1) {
    problemTraits.push(face.attribute.race.value);
  }

  return problemTraits.length && problemTraits;
}

function policeTweet(tweet) {
  var username = tweet.user.screen_name;
  var url = encodeURI(tweet.user.profile_image_url.replace('normal.jpg', '400x400.jpg'));

  unirest.get("https://faceplusplus-faceplusplus.p.mashape.com/detection/detect?attribute=glass%2Cpose%2Cgender%2Cage%2Crace%2Csmiling&url=" + url)
  .header("X-Mashape-Key", config.mashape_key)
  .header("Accept", "application/json")
  .end(function (result) {
    if (!result.body.face.length) {
     return console.log('NO FACE FOUND FOR ', result.body.url);
    }

    var face = result.body.face[0];
    var gender = face.attribute.gender;
    var race = face.attribute.race;
    console.log(
      'USER '.cyan, username.yellow.bold,
      ' IS A '.cyan, race.value.yellow,
      gender.value.yellow
    );

    config.triggers.forEach(function(trigger) {
      var hasTriggers = false;
      trigger.keywords.forEach(function(kw) {
        if (tweet.text.indexOf(kw) > -1) {
          hasTriggers = true;
        }
      });
      if (!hasTriggers) return;

      var problems = checkProblematic(trigger.problematics, face);
      if (!problems) return;

      var logs = require(FILEPATH);
      var log = {
        user: username,
        tweet: tweet,
        face: face,
        problems: problems
      };
      logs.push(log);

      jsonfile.writeFile(FILEPATH, logs, {spaces: 2}, function(err) {
        if (err) {
          console.log('ERROR WRITING JSON!'.red.bold, err);
          console.log('');
        } else {
          console.log('UPDATED DUMP.JSON!'.green.bold);
          console.log('');
        }
      });
    });
  });
}

console.log('STARTING STREAM!'.rainbow);
console.log('');
var triggerTerms = config.triggers.map(function(t) {
  return t.keywords.join(',');
});

client.stream('statuses/filter', {track: triggerTerms.join(',')}, function(stream) {
  stream.on('data', function(tweet) {
    if (tweet.retweeted_status || tweet.quoted_status) {
      return;
    }

    console.log('~~~~~~~~~~~~~~~~~~~~~~'.grey)
    console.log('')
    var name = '@'.yellow.bold + tweet.user.screen_name.yellow.bold;
    var text = tweet.text.cyan.bold;
    console.log(name, ' | ', text);
    policeTweet(tweet);
    console.log('')
  });

  stream.on('error', function(error) {
    console.log('OH NO!'.red.bold);
    console.log(error);
  });
});
