'use strict'

const SpotifyClient = require('spotify-web-api-node')
const spotifyUri = require('spotify-uri')

const saasifyClientId = process.env.PROVIDER_SPOTIFY_CLIENT_ID
const saasifyClientSecret = process.env.PROVIDER_SPOTIFY_CLIENT_SECRET
const saasifyRedirectUri = process.env.PROVIDER_SPOTIFY_REDIRECT_URI

exports.getClient = async ({
  clientId = saasifyClientId,
  clientSecret = saasifyClientSecret,
  redirectUri = saasifyRedirectUri,
  accessToken,
  refreshToken
}) => {
  const client = new SpotifyClient({
    clientId,
    clientSecret,
    redirectUri,
    accessToken,
    refreshToken
  })

  const {
    body: { access_token }
  } = await client.refreshAccessToken()

  client.setAccessToken(access_token)

  function getPagedFunc(func, opts = {}) {
    const { limit = 100, maxLimit, onPage } = opts

    return async (...args) => {
      let results = []
      let offset = 0
      let page

      do {
        const params = args.concat([
          {
            offset,
            limit
          }
        ])

        const res = await func(...params)
        page = res.body

        if (!page) {
          break
        }

        if (onPage) {
          await onPage(page.items)
        }

        results = results.concat(page.items)
        if (maxLimit && results.length >= maxLimit) {
          break
        }

        offset += page.items.length
      } while (page.next)

      return results
    }
  }

  client.getPagedFunc = getPagedFunc
  client.parse = spotifyUri.parse.bind(spotifyUri)

  return client
}
