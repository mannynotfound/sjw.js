<p align="center">
  <img src="https://raw.githubusercontent.com/mannynotfound/sjw.js/master/sjwjs-logo.png" />
</p>

# sjw.js

A tool for automatically finding problematic users on Twitter.com

## inspo

Currently powering an experiment with face detection API, im listening to twitter stream for the "n word" and running face detection against the tweeter's profile pic.
If a face belonging to a white person is found, the user is saved to a database and an automated screenshot of the tweet is tweeted by [@sjw_js](https://twitter.com/sjw_js) for permanent documentation.

## usage

set a config object that looks like so:

```js
{
  // mashape key to use face detection API
  "mashape_key": "XXX",
  // these are the rules for problematic tweets
  "triggers": [
    {
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
  ],
  "streams": [
    {
      "label": "Racial Injustice",
      "channels": {
        "nword": [
          "bad",
          "words",
          "to",
          "track",
          "here"
        ]
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
var Warrior = require('sjw').warrior;

var config = require('../config');
config.logfile = path.resolve(__dirname, '../data/dump.json');

new SJW(config, function(results, cfg) {
 console.log('FOUND A PROBLEM WITHIN ', results, ' WITH CONFIG ', cfg);
}).startStream();
```

## TODO:

* ~~restructure to leverage [supreme-stream](https://github.com/mannynotfound/supreme-stream)~~
* ~~write as a requireable node module~~
* turn into class that emits events
* create `triggers` api for social rulesets
* pretty up the console output some more
* ~~allow more output customization~~
* incorporate NLP where makes sense
