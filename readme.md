# spotify-to-twitter

> Example of how to create an automated Twitter account that tweets tracks from a Spotify playlist.

<p align="center">
  <a href="https://twitter.com/lofigrind" title="LofiGrind">
    <img src="https://raw.githubusercontent.com/transitive-bullshit/spotify-to-twitter/master/media/lofigrind.jpg" alt="LofiGrind Twitter Account" width="598" />
  </a>
</p>

[![Build Status](https://travis-ci.com/transitive-bullshit/get-apex-domain-name.svg?branch=master)](https://travis-ci.com/transitive-bullshit/get-apex-domain-name) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Usage

First clone this repo and run `npm install`.

You'll need to sign up for both Twitter and Spotify developer accounts and then paste your credentials into a local `.env` file following [.env.example](./.env.example).

```sh
# app credentials

PROVIDER_SPOTIFY_CLIENT_ID=
PROVIDER_SPOTIFY_CLIENT_SECRET=
PROVIDER_SPOTIFY_REDIRECT_URI=

PROVIDER_TWITTER_CLIENT_ID=
PROVIDER_TWITTER_CLIENT_SECRET=

# user credentials

SPOTIFY_USER_ACCESS_TOKEN=
SPOTIFY_USER_REFRESH_TOKEN=

TWITTER_USER_ACCESS_TOKEN=
TWITTER_USER_ACCESS_TOKEN_SECRET=

# automation settings

# URL or ID of spotify playlist to pull tracks from
# example: https://open.spotify.com/playlist/2MgkBl2rQnPdF3WZ6ciajc?si=gF7XkYJLRBWo8lxoMKmySA
SPOTIFY_PLAYLIST=
```

Then, just run `node index.js`.

This will pick a random track from the given Spotify playlist and tweet it from your account, adding a bit of text and a few random hashtags as well.

If you want to automate your account to tweet on a regular schedule, check out [cron](https://opensource.com/article/17/11/how-use-cron-linux) or a hosted cron solution like [Simple Cron](https://simplecron.dev).

Here's an ([example ambient playlist](https://open.spotify.com/playlist/2MgkBl2rQnPdF3WZ6ciajc?si=keroU0kmS7CcgXiw-toJjQ)) if you'd like to get started.

## Why tho?

Purely for fun: [LofiGrind](https://twitter.com/lofigrind). 🤓

I was inspired by lofi DJs like [ChilledCow](https://twitter.com/ChilledCow?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor) who have created large followings by curating fresh music on a regular basis across [YouTube](https://www.youtube.com/channel/UCSJ4gkVC6NrvII8umztf0Ow), [Twitter](https://twitter.com/ChilledCow?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor), [Spotify](https://open.spotify.com/user/chilledcow?si=VeqVRyGHTcqQylOesJ0PpA), etc.

## License

MIT © [Travis Fischer](https://github.com/transitive-bullshit)

Support my OSS work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
