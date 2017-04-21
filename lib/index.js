const {send} = require('micro')
const rollbar = require('rollbar')
const middleware = require('./middleware')
const fetchEvents = require('./fetch-events')
const transform = require('./transform')

module.exports = middleware(async (req, res) => {
  const data = await fetchEvents()
  rollbar.wait(() => send(res, 200, transform(data)))
})
