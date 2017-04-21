const get = require('micro-get')
const microCors = require('micro-cors')
const microRollbar = require('micro-rollbar')

module.exports = fn => {
  const cors = microCors({
    allowMethods: ['GET'],
    allowHeaders: ['Access-Control-Allow-Origin', 'Content-Type'],
    origin: '*'
  })

  const errorHandler = microRollbar(process.env.HCAG_ROLLBAR_TOKEN, {
    environment: process.env.NODE_ENV || 'development',
    host: 'events.hillcitymnag.church',
    enabled: process.env.NODE_ENV !== 'test'
  })

  return cors(get(errorHandler(fn)))
}
