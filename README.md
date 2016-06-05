# sjw.js

A tool for automatically finding problematic users on Twitter.com

## inspo

Currently an experiment with face detection API, im listening to twitter stream for the "n word" and running face detection against the tweeter's profile pic.
If a face belonging to a white person is found, the user gets logged to a json file. This can be used for data processing or you can use the callback of the detection
to act on the tweet appropriately :smiling_imp:.

## usage

set a config object that looks like so:

```js
{
  "mashape_key": "XXX",
  "twitter_api": {
    "access_token_key": "XXX",
    "access_token_secret": "XXX",
    "consumer_key": "XXX",
    "consumer_secret": "XXX"
  },
  "triggers": [
    {
      "keywords": [
        "twitter",
        "search",
        "terms",
        "here"
      ],
      "problematics": [
        "Male",
        "White"
      ]
    }
  ]
}
```

`node index` -> output to `data/dump.json`

## TODO:

* restructure to leverage [supreme-stream](https://github.com/mannynotfound/supreme-stream)
* write as a requireable node module
* turn into class that emits events
* pretty up the console output some more
* allow more output customization
* incorporate NLP where makes sense
