var jsonfile = require('jsonfile');
var SupremeStream = require('supreme-stream');
var getFace = require('./get-face.js').getFace;

function Warrior(config, cb) {
  this.cfg = config;
  this.cb = cb;
  return this;
}

Warrior.prototype = {
  handleProblematic: function(tweet, face, probCfg, sourceCfg) {
    var username = tweet.user.screen_name || 'Anonymous';
    var log = {
      user: username,
      tweet: tweet,
      face: face,
      problems: probCfg.problems,
      source: sourceCfg,
    };

    if (probCfg.victims) {
      log.victims = probCfg.victims
    }

    if (this.cb) {
      this.cb(log);
    }

    if (this.cfg.logfile) {
      this.writeFile(this.cfg.logfile, log);
    }
  },

  checkVictim(tweet, trigger, cb) {
    var victims = [];

    var self = this;
    this.getClient().get('users/show', {
      id: tweet.in_reply_to_user_id
    }, function(err, user) {
      if (err)  {
        return cb(false);
      }
      if (!user.profile_image_url) {
        return cb(false);
      }
      getFace(user.profile_image_url, self.cfg.mashape_key, function(err, face) {
        if (err) {
          return cb(false);
        }

        if (trigger.victims.indexOf(face.attribute.gender.value) > -1 &&
           face.attribute.gender.confidence >= 90) {
          victims.push(face.attribute.gender.value);
        }

        if (trigger.victims.indexOf(face.attribute.race.value) > -1 &&
           face.attribute.race.confidence >= 90) {
          victims.push(face.attribute.race.value);
        }

        return cb(victims.length ? victims : false);
      });
    });
  },

  checkProblematic: function(tweet, face, trigger, cb) {
    var triggers = trigger.keywords.filter(function(kw) {
      return tweet.text.indexOf(kw) > -1;
    }).length;

    if (!triggers) return cb({problems: false});

    var problemTraits = [];

    if (trigger.problematics.indexOf(face.attribute.gender.value) > -1 &&
       face.attribute.gender.confidence >= 90) {
      problemTraits.push(face.attribute.gender.value);
    }

    if (trigger.problematics.indexOf(face.attribute.race.value) > -1 &&
       face.attribute.race.confidence >= 90) {
      problemTraits.push(face.attribute.race.value);
    }

    if (!problemTraits.length) return cb({problems: false});

    if (trigger.victims) {
      if (!tweet.in_reply_to_user_id) {
        return cb({problems: false});
      }

      this.checkVictim(tweet, trigger, function(victims) {
        if (!victims) {
          return cb({problems: false});
        }
        cb({
          problems: problemTraits,
          victims: victims
        });
      });
    } else {
      cb({problems: problemTraits});
    }
  },

  policeTweet: function(tweet, sourceCfg) {
    if (tweet.retweeted_status || tweet.quoted_status || !tweet.user
        || !tweet.user.profile_image_url) {
      return;
    }

    var self = this;

    getFace(tweet.user.profile_image_url, self.cfg.mashape_key, function(err, face) {
      if (err) return;

      var gender = face.attribute.gender;
      var race = face.attribute.race;

      self.cfg.triggers.forEach(function(trigger) {
        var problems = self.checkProblematic(tweet, face, trigger, function(probCfg) {
          if (!probCfg.problems) return;
          self.handleProblematic(tweet, face, probCfg, sourceCfg);
        });
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
    var streamCfg = {
      label: 'SJW Stream',
      channels: {}
    }

    this.cfg.triggers.forEach((t) => {
      streamCfg.channels[t.label] = t.keywords
    });

    this.stream = new SupremeStream(
      [streamCfg],
      this.cfg.accounts,
      this.callBack.bind(this)
    );

    this.stream.startAll()
  },

  getClient() {
    return this.stream.getClients()[0];
  }
}

module.exports = Warrior;
