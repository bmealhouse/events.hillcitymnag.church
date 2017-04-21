/* eslint-disable camelcase */

const test = require('ava')
const micro = require('micro')
const nock = require('nock')
const fetch = require('node-fetch')
const listen = require('test-listen')
const service = require('../lib/index')
const {FACEBOOK_HOST, HCAG_PAGE_ID} = require('../lib/constants')

const server = micro(service)
const getOptions = method => ({method})

const getFakeData = () => [
  {
    id: '1791559507836465',
    name: 'Boundaries Book Study',
    description: 'Boundaries are important things to set as we interact with family, friends, the workplace and God. Drs. Cloud and Townsend pace us through a Biblical standard for "When to say Yes and How to say No to take control of your life." Book study will cost $10 if you purchase the book through the church. If you would like to take part please FB message Pastor Valley or text him at 218.398.4197. Study will run on Sundays until April 30.',
    start_time: '2017-03-05T18:00:00-0600',
    end_time: '2017-03-05T20:00:00-0600',
    place: {
      id: '115583631855218',
      name: 'Hill City Assembly of God',
      location: {
        city: 'Hill City',
        country: 'United States',
        latitude: 46.99181,
        longitude: -93.59693,
        state: 'MN',
        street: 'PO Box 219 102 Lake Ave',
        zip: '55748'
      }
    }
  },
  {
    id: '620815931450763',
    name: 'Christmas Eve Service',
    description: 'Come join us for an time of singing and reflection centered on the birth of our Savior. Many families have made this an annual tradition and we hope your family will join us, as well.',
    start_time: '2016-12-24T19:00:00-0600',
    end_time: '2016-12-24T20:00:00-0600',
    place: {
      id: '115583631855218',
      name: 'Hill City Assembly of God',
      location: {
        city: 'Hill City',
        country: 'United States',
        latitude: 46.99181,
        longitude: -93.59693,
        state: 'MN',
        street: 'PO Box 219 102 Lake Ave',
        zip: '55748'
      }
    }
  }
]

test('405: POST requests are not supported', async t => {
  const options = getOptions('POST')
  const url = await listen(server)
  const res = await fetch(url, options)
  t.deepEqual(res.status, 405)
})

test('405: PUT requests are not supported', async t => {
  const options = getOptions('PUT')
  const url = await listen(server)
  const res = await fetch(url, options)
  t.deepEqual(res.status, 405)
})

test('405: DELETE requests are not supported', async t => {
  const options = getOptions('DELETE')
  const url = await listen(server)
  const res = await fetch(url, options)
  t.deepEqual(res.status, 405)
})

test.serial('500: access_token error', async t => {
  nock(FACEBOOK_HOST)
    .get('/oauth/access_token')
    .query(true)
    .replyWithError('ERROR')

  const url = await listen(server)
  const res = await fetch(url)

  t.deepEqual(res.status, 500)
})

test.serial('500: events error', async t => {
  nock(FACEBOOK_HOST)
    .get('/oauth/access_token')
    .query(true)
    .reply(200, {access_token: 'token'})

  nock(FACEBOOK_HOST)
    .get(`/${HCAG_PAGE_ID}/events`)
    .query(true)
    .replyWithError('ERROR')

  const url = await listen(server)
  const res = await fetch(url)

  t.deepEqual(res.status, 500)
})

test.serial('200: single page', async t => {
  nock(FACEBOOK_HOST)
    .get('/oauth/access_token')
    .query(true)
    .reply(200, {access_token: 'token'})

  nock(FACEBOOK_HOST, {
    reqheaders: {authorization: 'Bearer token'}
  })
    .get(`/${HCAG_PAGE_ID}/events`)
    .query(true)
    .reply(200, {
      data: [getFakeData()[0]],
      paging: {}
    })

  const url = await listen(server)
  const res = await fetch(url)
  const data = await res.json()

  t.deepEqual(data, [
    {
      id: '1791559507836465',
      name: 'Boundaries Book Study',
      description: 'Boundaries are important things to set as we interact with family, friends, the workplace and God. Drs. Cloud and Townsend pace us through a Biblical standard for "When to say Yes and How to say No to take control of your life." Book study will cost $10 if you purchase the book through the church. If you would like to take part please FB message Pastor Valley or text him at 218.398.4197. Study will run on Sundays until April 30.',
      startTime: '2017-03-05T18:00:00-0600',
      endTime: '2017-03-05T20:00:00-0600',
      place: {
        id: '115583631855218',
        name: 'Hill City Assembly of God',
        location: {
          city: 'Hill City',
          country: 'United States',
          latitude: 46.99181,
          longitude: -93.59693,
          state: 'MN',
          street: 'PO Box 219 102 Lake Ave',
          zip: '55748'
        }
      }
    }
  ])
})

test.serial('200: multiple pages', async t => {
  nock(FACEBOOK_HOST)
    .get('/oauth/access_token')
    .query(true)
    .reply(200, {access_token: 'token'})

  nock(FACEBOOK_HOST, {
    reqheaders: {authorization: 'Bearer token'}
  })
    .get(`/${HCAG_PAGE_ID}/events`)
    .query(true)
    .reply(200, {
      data: [getFakeData()[0]],
      paging: {
        next: `${FACEBOOK_HOST}/${HCAG_PAGE_ID}/events?next_page=true`
      }
    })

  nock(FACEBOOK_HOST, {
    reqheaders: {authorization: 'Bearer token'}
  })
    .get(`/${HCAG_PAGE_ID}/events`)
    .query({next_page: true})
    .reply(200, {
      data: [getFakeData()[1]],
      paging: {}
    })

  const url = await listen(server)
  const res = await fetch(url)
  const data = await res.json()

  t.deepEqual(data, [
    {
      id: '1791559507836465',
      name: 'Boundaries Book Study',
      description: 'Boundaries are important things to set as we interact with family, friends, the workplace and God. Drs. Cloud and Townsend pace us through a Biblical standard for "When to say Yes and How to say No to take control of your life." Book study will cost $10 if you purchase the book through the church. If you would like to take part please FB message Pastor Valley or text him at 218.398.4197. Study will run on Sundays until April 30.',
      startTime: '2017-03-05T18:00:00-0600',
      endTime: '2017-03-05T20:00:00-0600',
      place: {
        id: '115583631855218',
        name: 'Hill City Assembly of God',
        location: {
          city: 'Hill City',
          country: 'United States',
          latitude: 46.99181,
          longitude: -93.59693,
          state: 'MN',
          street: 'PO Box 219 102 Lake Ave',
          zip: '55748'
        }
      }
    },
    {
      id: '620815931450763',
      name: 'Christmas Eve Service',
      description: 'Come join us for an time of singing and reflection centered on the birth of our Savior. Many families have made this an annual tradition and we hope your family will join us, as well.',
      startTime: '2016-12-24T19:00:00-0600',
      endTime: '2016-12-24T20:00:00-0600',
      place: {
        id: '115583631855218',
        name: 'Hill City Assembly of God',
        location: {
          city: 'Hill City',
          country: 'United States',
          latitude: 46.99181,
          longitude: -93.59693,
          state: 'MN',
          street: 'PO Box 219 102 Lake Ave',
          zip: '55748'
        }
      }
    }
  ])
})
