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
      onPage,
      ...rest
    } = opts

    let numResults = 0
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
          params
        })
      } catch (err) {
        console.error('twitter error', { endpoint, page, numResults }, err)

        if (numResults <= 0) {
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
      numResults += pageResults.length

      console.log(
        'twitter',
        endpoint,
        `page=${page} size=${pageResults.length} total=${numResults}`
      )

      if (onPage) {
        await onPage(pageResults)
      }

      if (maxLimit && numResults >= maxLimit) {
        break
      }

      ++page
    } while (true)

    return numResults
  }

  twitterClient.resolvePagedQuery = resolvePagedQuery
  return twitterClient
}

async function resolveTwitterQueryPage(opts) {
  const { twitterClient, endpoint, params } = opts
  console.log('twitter', endpoint, params)

  return pRetry(() => twitterClient.get(endpoint, params), {
    retries: 3,
    maxTimeout: 10000
  })
}
