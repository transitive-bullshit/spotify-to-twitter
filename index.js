#!/usr/bin/env node
'use strict'

require('dotenv-safe').config()

const random = require('random')

const spotify = require('./lib/spotify')
const twitter = require('./lib/twitter')

const emoji = require('./lib/emoji')
const hashtags = require('./lib/hashtags')

const spotifyAccessToken = process.env.SPOTIFY_USER_ACCESS_TOKEN
const spotifyRefreshToken = process.env.SPOTIFY_USER_REFRESH_TOKEN

const twitterAccessToken = process.env.TWITTER_USER_ACCESS_TOKEN
const twitterAccessTokenSecret = process.env.TWITTER_USER_ACCESS_TOKEN_SECRET

// URL or ID of spotify playlist to pull tracks from
// https://open.spotify.com/playlist/2MgkBl2rQnPdF3WZ6ciajc?si=gF7XkYJLRBWo8lxoMKmySA
const spotifyPlaylist = 'spotify:playlist:2MgkBl2rQnPdF3WZ6ciajc'

async function main() {
  const spotifyClient = await spotify.getClient({
    accessToken: spotifyAccessToken,
    refreshToken: spotifyRefreshToken
  })

  const twitterClient = await twitter.getClient({
    accessToken: twitterAccessToken,
    accessTokenSecret: twitterAccessTokenSecret
  })

  const { id: playlistId } = spotifyClient.parse(spotifyPlaylist)

  // this is just a convenience wrapper for fetching all pages of a spotify result set
  const getPlaylistTracksPaged = spotifyClient.getPagedFunc(
    spotifyClient.getPlaylistTracks.bind(spotifyClient)
  )

  // get all the tracks in the target playlist
  const tracks = (await getPlaylistTracksPaged(playlistId))
    .filter((result) => !result.is_local)
    .map((result) => result.track)
  console.log('tracks', tracks.length)

  // select a track at random from the playlist
  const track = tracks[random.int(0, tracks.length - 1)]
  // console.log('track', JSON.stringify(track, null, 2))

  // format and tweet a single track
  if (track) {
    const tweet = await formatAndTweetTrack({ twitterClient, track })
    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    console.log(tweetUrl)
    // console.log(JSON.stringify(tweet, null, 2))
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

  console.log()
  console.log(status)
  console.log()

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

main().catch((err) => {
  console.error(err)
})
