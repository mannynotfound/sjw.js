<p align="center">
  <img src="https://raw.githubusercontent.com/mannynotfound/sjw.js/master/cover.png"/>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mannynotfound/sjw.js/master/sjwjs-logo.png" width="300"/>
</p>

# sjw.js

A tool for automatically finding abusive and problematic users on Twitter.com

## inspo

Originally an experiment to use facial recognition to find white people saying the "n word", 
the goal is to expand the amount of recognizable social contexts and document them.
By using a primative keyword matching system a large net is cast over Twitter streams that can then
be fed into smarter algorithms and reveal mystic truths.

## process

* Tweet with trigger words detected
* Facial recognition run on avatar
* If face detected, check for offending traits & context
* If problematic, take an automated screenshot + store (tweet object)[https://dev.twitter.com/overview/api/tweets] in database
* Curate tweets manually or run ML suite against database 
* Tweet the best screenshots & findings at [@sjw.js](https://twitter.com/sjw_js)

## usage

set a config object that looks like so:

```js
{
  // mashape key to use face detection API
  "mashape_key": "XXX",
  // these are the rules for problematic tweets
  "triggers": [
    {
      // identifier for trigger
      "label": "trigger label",
      // trigger words
      "keywords": [
        "twitter",
        "search",
        "terms",
        "here"
      ],
      // problematic offendor traits
      "problematics": [
        "Male",
        "White"
      ]
    }
  ],
  "accounts": [
    {
      "fullname": "XXXX",
      "creds": {
        "consumer_key": "XXX",
        "consumer_secret": "XXX",
        "access_token_key": "XXX",
        "access_token_secret": "XXX"
      }
    }
  ]
}
```

If you would like to write to a file, include a "logfile" key with the full system path name like so:

```js
var path = require('path');

config.logfile = path.resolve(__dirname, '../my/output/file/data.json');
```

Once configuration is set, instantiate a warrior like so:

```js
var Warrior = require('sjw').Warrior;

var config = require('../config');
config.logfile = path.resolve(__dirname, '../data/dump.json');

function warriorCallback(results) {
 console.log('FOUND A PROBLEM WITHIN ', results.tweet, ' FROM ', results.source);
}

var sjWarrior = new Warrior(config, warriorCallback);
sjWarrior.startStream();
```

## TODO:

* ~~restructure to leverage [supreme-stream](https://github.com/mannynotfound/supreme-stream)~~
* ~~write as a requireable node module~~
* turn into class that emits events
* create `triggers` api for social rulesets
* pretty up the console output some more
* ~~allow more output customization~~
* incorporate NLP where make sense
