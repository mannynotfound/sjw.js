var unirest = require('unirest');

function getFace(tweet, key, cb) {
  if (!tweet.user || !tweet.user.profile_image_url) {
    return cb(new Error('No Profile Image'))
  }
  var url = encodeURI(tweet.user.profile_image_url.replace('normal.jpg', '400x400.jpg'));

  unirest.get("https://faceplusplus-faceplusplus.p.mashape.com/detection/detect?attribute=glass%2Cpose%2Cgender%2Cage%2Crace%2Csmiling&url=" + url)
    .header("X-Mashape-Key", key)
    .header("Accept", "application/json")
    .end(function(result) {
      if (!result.body || !result.body.face || !result.body.face.length) {
        return cb(new Error('No Face Found!'));
      }

      return cb(null, result.body.face[0]);
    });
}

module.exports = {
  getFace: getFace
}
