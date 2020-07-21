'use strict'

module.exports = function unfurlTweet(tweet) {
  return tweet.entities.urls
    .reverse()
    .reduce(
      (status, url) =>
        status.substring(0, url.indices[0] > 0 ? url.indices[0] + 1 : 0) +
        url.expanded_url +
        status.substring(url.indices[1]),
      tweet.full_text
    )
}
