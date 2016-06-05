var jsonfile = require('jsonfile');
var SupremeStream = require('supreme-stream');
var getFace = require('./get-face.js').getFace;

function Warrior(config, cb) {
  this.cfg = config;
  this.cb = cb;
}

Warrior.prototype = {
  checkProblematic: function(tweet, face, trigger) {
    var triggers = trigger.keywords.filter(function(kw) {
      return tweet.text.indexOf(kw) > -1;
    }).length;

    if (!triggers) return false;

    var problemTraits = [];

    if (trigger.problematics.indexOf(face.attribute.gender.value) > -1) {
      problemTraits.push(face.attribute.gender.value);
    }

    if (trigger.problematics.indexOf(face.attribute.race.value) > -1) {
      problemTraits.push(face.attribute.race.value);
    }

    return problemTraits.length && problemTraits;
  },

  handleProblematic: function(tweet, face, problems, sourceCfg) {
    var username = tweet.user.screen_name || 'Anonymous';
    var log = {
      user: username,
      tweet: tweet,
      face: face,
      problems: problems,
      source: sourceCfg,
    };

    if (this.cb) {
      this.cb(log, sourceCfg);
    }

    if (this.cfg.logfile) {
      this.writeFile(this.cfg.logfile, log);
    }
  },

  policeTweet: function(tweet, sourceCfg) {
    if (tweet.retweeted_status && tweet.retweeted_status.length ||
        tweet.quoted_status && tweet.quoted_status.length) {
      return;
    }

    var self = this;
    getFace(tweet, self.cfg.mashape_key, function(err, face) {
      if (err) return;

      var gender = face.attribute.gender;
      var race = face.attribute.race;

      self.cfg.triggers.forEach(function(trigger) {
        var problems = self.checkProblematic(tweet, face, trigger);
        if (!problems) return;

        self.handleProblematic(tweet, face, problems, sourceCfg);
      });
    })
  },

  writeFile: function(filepath, log) {
    try {
      var logs = require(filepath);

      if (!Array.isArray(logs)) {
        logs = [];
      }

      logs.push(log);
      jsonfile.writeFile(filepath, logs, {spaces: 2});
    } catch(e) {
      console.log('COULD NOT WRITE TO FILE', e);
    }
  },

  callBack: function(err, data, cfg) {
    if (err) {
      return console.log('GOT AN ERROR!', err);
    }

    this.policeTweet(data, cfg);
  },

  startStream: function() {
    this.stream = new SupremeStream(
      this.cfg.streams,
      this.cfg.accounts,
      this.callBack.bind(this)
    ).startAll();
  }
}

module.exports = Warrior;
