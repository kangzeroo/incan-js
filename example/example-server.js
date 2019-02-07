// node example/example-server.js

const incan = require('../index')
const { createTable, addSubs, removeSubs, querySubs } = require('../drivers/postgresql')
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const http = require('http')

// express app
const app = express()
app.use(bodyParser.json())

// createTable()

incan.connect({ addSubs, removeSubs, querySubs })

// basic route
app.post('/', (req, res) => {
  console.log('POST /')
  const payload = req.body
  incan.emit(payload.resource_id, payload.event_id, payload, { headers: {} })
    .then((data) => {
      console.log(data)
      res.json({
        message: 'GET request to homepage working!',
        data: data
      })
    })
    .catch((err) => {
      console.log(err)
    })
})

// POST /subscribe
app.post('/subscribe', (req, res) => {
  console.log('POST /subscribe')
  const newSubscriptions = req.body || []
  console.log(newSubscriptions)
  /*
    newSubscriptions = [{
      client_id: '<IDENTIFIER_OF_CLIENT>',
      resource_id: '<IDENTIFIER_OF_RESOURCE>',
      event_id: '<IDENTIFIER_OF_EVENT>',
      url_endpoint: '<WEBHOOK_TO_HIT>',
    }]
  */
  incan.addSubs(newSubscriptions)
    .then(({ success, error }) => {
      res.json({
        message: 'Added subscriptions!',
        payload: { success, error }
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
})

// POST /unsubscribe
app.post('/unsubscribe', (req, res) => {
  console.log('POST /unsubscribe')
  const existingSubscriptions = req.body || []
  console.log(existingSubscriptions)
  /*
    existingSubscriptions = [{
      client_id: '<IDENTIFIER_OF_CLIENT>',
      resource_id: '<IDENTIFIER_OF_RESOURCE>',
      event_id: '<IDENTIFIER_OF_EVENT>',
      url_endpoint: '<WEBHOOK_TO_HIT>',
    }]
  */
  incan.removeSubs(existingSubscriptions)
    .then(({ success, error }) => {
      res.json({
        message: 'Removed subscriptions!',
        payload: { success, error }
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('An error occurred. ', err)
    })
})

const port = 7000
const server = http.createServer(app)
server.listen(port, function(){
  console.log("Development server listening on http: ", port)
})
