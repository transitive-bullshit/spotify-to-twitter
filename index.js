#!/usr/bin/env node
'use strict'

require('dotenv-safe').config()

const random = require('random')

const spotify = require('./lib/spotify')
const twitter = require('./lib/twitter')
const spinner = require('./lib/spinner')

const emoji = require('./lib/emoji')
const hashtags = require('./lib/hashtags')

const spotifyAccessToken = process.env.SPOTIFY_USER_ACCESS_TOKEN
const spotifyRefreshToken = process.env.SPOTIFY_USER_REFRESH_TOKEN

const twitterAccessToken = process.env.TWITTER_USER_ACCESS_TOKEN
const twitterAccessTokenSecret = process.env.TWITTER_USER_ACCESS_TOKEN_SECRET

// URL or ID of spotify playlist to pull tracks from
// https://open.spotify.com/playlist/2MgkBl2rQnPdF3WZ6ciajc?si=gF7XkYJLRBWo8lxoMKmySA
const spotifyPlaylist = process.env.SPOTIFY_PLAYLIST

module.exports = async function main() {
  const spotifyClient = await spinner(
    spotify.getClient({
      accessToken: spotifyAccessToken,
      refreshToken: spotifyRefreshToken
    }),
    'Initializing spotify'
  )

  const twitterClient = await spinner(
    twitter.getClient({
      accessToken: twitterAccessToken,
      accessTokenSecret: twitterAccessTokenSecret
    }),
    'Initializing twitter'
  )

  /*
  const rawTweets = await twitterClient.resolvePagedQuery(
    'statuses/user_timeline',
    {
      include_rts: false
    }
  )

  const tweets = rawTweets.map(unfurlTweet)
  console.log(JSON.stringify(tweets, null, 2))

  return
  */

  const { id: playlistId } = spotifyClient.parse(spotifyPlaylist)

  // this is just a convenience wrapper for fetching all pages of a spotify result set
  const getPlaylistTracksPaged = spotifyClient.getPagedFunc(
    spotifyClient.getPlaylistTracks.bind(spotifyClient)
  )

  // get all the tracks in the target playlist
  const tracks = (
    await spinner(
      getPlaylistTracksPaged(playlistId),
      `Fetching tracks in spotify playlist ${playlistId}`
    )
  )
    .filter((result) => !result.is_local)
    .map((result) => result.track)
  console.error(`Found ${tracks.length} tracks`)

  // select a track at random from the playlist
  const track = tracks[random.int(0, tracks.length - 1)]

  // tweet the track
  if (track) {
    const tweet = await formatAndTweetTrack({ twitterClient, track })
    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    console.log(tweetUrl)
    // console.error(JSON.stringify(tweet, null, 2))
  }

  return tracks
}

function formatAndTweetTrack(opts) {
  const { twitterClient, track } = opts

  const name = sanitizeTrackName(track.name)
  const url = track.external_urls.spotify
  // const albumName = track.album.name
  const artists = track.artists.map((artist) => artist.name)

  // TODO: in the future, it'd be great to map each artist to their respective
  // twitter handle, so we could @mention them in the tweet.
  // Note that spotify has this data but afaict tthey don't expose it via the API.

  // randomize the hashtags and emoji
  const numHashtags = random.int(0, 3)
  const hasEmoji = random.float() < 0.9
  const suffix = emoji[random.int(0, emoji.length - 1)]
  const tags = ['#spotify']

  // choose some hashtags at random
  const h = hashtags.slice()
  for (let j = 0; j < numHashtags; ++j) {
    const hashtag = h.splice(random.int(0, h.length - 1))[0]
    if (hashtag) {
      tags.push(hashtag)
    }
  }
  const tagsString1 = tags.join(' ').trim()
  const tagsString2 = tagsString1.length ? `${tagsString1} ` : ''

  // super fancy templating
  const status = `${name} by ${artists.join(' & ')}${
    hasEmoji ? ' ' + suffix : ''
  }\n\n${tagsString2}${url}`

  console.error()
  console.error(status)
  console.error()

  return twitterClient.post('statuses/update', {
    status
  })
}

function sanitizeTrackName(name) {
  return name
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
}

if (!module.parent) {
  module.exports().catch((err) => {
    console.error(err)
  })
}
