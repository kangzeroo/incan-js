// node example/example-client.js

const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')

// express app
const app = express()
app.use(bodyParser.json())

// basic route
app.get('/', (req, res) => {
  console.log('GET /')
  res.send('GET request to homepage working')
})

// webhook
app.post('/alert/*', (req, res) => {
  console.log('POST /alert')
  console.log(req.body)
  res.json({
    message: 'Got alerted by a webhook!',
    payload: req.body
  })
})

const port = 8000
const server = http.createServer(app)
server.listen(port, function(){
  console.log("Development server listening on http: ", port)
})
