const {send} = require('micro')
const Rollbar = require('rollbar')
const middleware = require('./middleware')
const fetchEvents = require('./fetch-events')
const transform = require('./transform')

module.exports = middleware(async (req, res) => {
  const data = await fetchEvents()
  Rollbar.wait(() => send(res, 200, transform(data)))
})
