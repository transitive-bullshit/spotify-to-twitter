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

  // const { body: spotifyProfile } = await spotifyClient.getMe()
  // console.log(spotifyProfile)

  // const artist = await spotifyClient.getArtist('0yTK74zLEsMyrdVPjw3Zqi')
  // console.log(JSON.stringify(artist, null, 2))

  const { id: playlistId } = spotifyClient.parse(spotifyPlaylist)

  const getPlaylistTracksPaged = spotifyClient.getPagedFunc(
    spotifyClient.getPlaylistTracks.bind(spotifyClient)
  )

  const tracks = (await getPlaylistTracksPaged(playlistId))
    .filter((result) => !result.is_local)
    .map((result) => result.track)

  console.log('tracks', tracks.length)
  const track = tracks[random.int(0, tracks.length - 1)]
  console.log('track', JSON.stringify(track, null, 2))

  if (track) {
    const name = sanitizeTrackName(track.name)
    const url = track.external_urls.spotify
    const albumName = track.album.name
    const artists = track.artists.map((artist) => artist.name)

    const numHashtags = random.int(0, 3)
    const hasEmoji = random.float() < 0.9
    const suffix = emoji[random.int(0, emoji.length - 1)]
    const tags = []

    const h = hashtags.slice()
    for (let j = 0; j < numHashtags; ++j) {
      const hashtag = h.splice(random.int(0, h.length - 1))[0]
      if (hashtag) {
        tags.push(hashtag)
      }
    }
    const tagsString1 = tags.join(' ').trim()
    const tagsString2 = tagsString1.length ? `${tagsString1} ` : ''

    const status = `${name} by ${artists.join(' & ')}${
      hasEmoji ? ' ' + suffix : ''
    }\n\n${tagsString2}${url}`

    console.log()
    console.log(status)
    console.log()

    await postTweet({
      twitterClient,
      status
    })

    // console.log(JSON.stringify(tweet, null, 2))
  }

  // console.log(JSON.stringify(tracks, null, 2))
}

function sanitizeTrackName(name) {
  return name
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^\)]*\)/g, '')
    .trim()
}

async function postTweet(opts) {
  const { twitterClient, status, url } = opts

  return twitterClient.post('statuses/update', {
    status
  })
}

main().catch((err) => {
  console.error(err)
})
