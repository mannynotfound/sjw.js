var jsonfile = require('jsonfile');
var SupremeStream = require('supreme-stream');
var getFace = require('./get-face.js').getFace;

function Warrior(config, cb) {
  this.cfg = config;
  this.cb = cb;
  return this;
}

Warrior.prototype = {
  checkProblematic: function(tweet, face, trigger) {
    var triggers = trigger.keywords.filter(function(kw) {
      return tweet.text.indexOf(kw) > -1;
    }).length;

    if (!triggers) return false;

    var problemTraits = [];

    if (trigger.problematics.indexOf(face.attribute.gender.value) > -1 &&
       face.attribute.gender.confidence >= 90) {
      problemTraits.push(face.attribute.gender.value);
    }

    if (trigger.problematics.indexOf(face.attribute.race.value) > -1 &&
       face.attribute.race.confidence >= 90) {
      problemTraits.push(face.attribute.race.value);
    }

    return problemTraits.length ? problemTraits : false;
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
      this.cb(log);
    }

    if (this.cfg.logfile) {
      this.writeFile(this.cfg.logfile, log);
    }
  },

  //checkVictim(tweet, face, sourceCfg) {
    //var victims = [];
    //var triggered = {};

    //this.cfg.triggers.forEach(function(trigger) {
      //// trigger config doesnt list victims, return
      //if (!trigger.victims) return;
      //// tweet doesnt contain trigger terms
      //trigger.keywords.forEach(function(kw) {
        //if (tweet.text.indexOf(kw) > -1) {
          //console.log('HAS TRIGGERS!');
          //// write to obj key so in case we have multiple keywords
          //// we only log one instance of the trigger
          //triggered[trigger.label] = trigger;
        //}
      //});
    //});

    //if (Object.keys(triggered).length) {
      //Object.keys(triggered).forEach(function(t) {
        //var tObj = triggered[t];
      //});
    //}
  //},

  policeTweet: function(tweet, sourceCfg) {
    if (tweet.retweeted_status || tweet.quoted_status) {
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
