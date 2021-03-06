'use strict'

const Twitter = require('twitter-lite')
const pRetry = require('p-retry')

const saasifyClientId = process.env.PROVIDER_TWITTER_CLIENT_ID
const saasifyClientSecret = process.env.PROVIDER_TWITTER_CLIENT_SECRET

const MAX_PAGE_SIZE = 200
const MAX_RESULTS = 20000

exports.getClient = async ({
  clientId = saasifyClientId,
  clientSecret = saasifyClientSecret,
  accessToken,
  accessTokenSecret
}) => {
  const twitterClient = new Twitter({
    consumer_key: clientId,
    consumer_secret: clientSecret,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
  })

  async function resolvePagedQuery(endpoint, opts) {
    const {
      count = MAX_PAGE_SIZE,
      maxLimit = MAX_RESULTS,
      log = console.error.bind(console),
      onPage,
      ...rest
    } = opts

    let results = []
    let page = 0
    let maxId

    do {
      const params = { count, tweet_mode: 'extended', ...rest }
      if (maxId) {
        params.max_id = maxId
      }

      let pageResults

      try {
        pageResults = await resolveTwitterQueryPage({
          twitterClient,
          endpoint,
          params,
          log
        })
      } catch (err) {
        log(
          'twitter error',
          { endpoint, page, numResults: results.length },
          err
        )

        if (results.length <= 0) {
          throw err
        }
      }

      if (!pageResults.length || (page > 0 && pageResults.length <= 1)) {
        break
      }

      if (maxId) {
        pageResults = pageResults.slice(1)
      }

      maxId = pageResults[pageResults.length - 1].id_str
      results = results.concat(pageResults)

      log(
        'twitter',
        endpoint,
        `page=${page} size=${pageResults.length} total=${results.length}`
      )

      if (onPage) {
        await onPage(pageResults)
      }

      if (maxLimit && results.length >= maxLimit) {
        break
      }

      ++page
    } while (true)

    return results
  }

  twitterClient.resolvePagedQuery = resolvePagedQuery
  return twitterClient
}

async function resolveTwitterQueryPage(opts) {
  const { twitterClient, endpoint, params, log } = opts
  log('twitter', endpoint, params)

  return pRetry(() => twitterClient.get(endpoint, params), {
    retries: 3,
    maxTimeout: 10000
  })
}
