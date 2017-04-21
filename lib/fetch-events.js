const fetch = require('node-fetch')
const {FACEBOOK_HOST, HCAG_APP_ID, HCAG_PAGE_ID} = require('./constants')

module.exports = async () => {
  const auth = await authenticate()
  return getEvents(auth.access_token)
}

async function authenticate() {
  const clientId = `client_id=${HCAG_APP_ID}`
  const clientSecret = `client_secret=${process.env.HCAG_FACEBOOK_APP_SECRET}`
  const grantType = 'grant_type=client_credentials'
  const queryString = `${clientId}&${clientSecret}&${grantType}`

  const res = await fetch(`${FACEBOOK_HOST}/oauth/access_token?${queryString}`)
  return res.json()
}

async function getEvents(accessToken) {
  const options = {
    headers: {authorization: `Bearer ${accessToken}`}
  }

  async function getPage(uri) {
    const res = await fetch(uri, options)
    const {data, paging} = await res.json()

    if (!paging.next) {
      return [...data]
    }

    return [...data, ...(await getPage(paging.next))]
  }

  return getPage(`${FACEBOOK_HOST}/${HCAG_PAGE_ID}/events`, options)
}
