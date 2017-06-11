const get = require('micro-get')
const microCors = require('micro-cors')
const microRollbar = require('micro-rollbar')
const Rollbar = require('rollbar')

module.exports = fn => {
  const cors = microCors({
    allowMethods: ['GET'],
    allowHeaders: ['Access-Control-Allow-Origin', 'Content-Type'],
    origin: '*'
  })

  const errorHandler = microRollbar(Rollbar)({
    accessToken: process.env.HCAG_ROLLBAR_TOKEN,
    host: 'events.hillcitymnag.church',
    enabled: process.env.NODE_ENV !== 'test'
  })

  return cors(get(errorHandler(fn)))
}
