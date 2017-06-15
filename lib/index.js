const {send} = require('micro')
const middleware = require('./middleware')
const fetchEvents = require('./fetch-events')
const transform = require('./transform')

module.exports = middleware(async (req, res) => {
  const data = await fetchEvents()
  send(res, 200, transform(data))
})
