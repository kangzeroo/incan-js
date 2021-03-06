# Incan JS
A NodeJS library for handling many-to-many webhook subscriptions (also known as <a href="http://resthooks.org/">REST Hooks</a>). Clients can listen to any arbitrary event happening on your server.
<br/><br/>
REST Hooks are an efficient alternative to:
- The inefficient practice of polling (when clients check for changes by making REST requests every X seconds)<br/>
- The expensive cost of websocket connections at scale<br/>

`incan-js` should be used alongside your existing stateless REST api as a way for other servers (clients) to subscribe to real-time updates.


![Incan Messenger](imgs/incan_messenger.jpg)
Photo curtosey of <a href="http://cuzcoeats.com/chasquis-communication-incas-time/">cuzcoeats.com</a>
<br/>
<a href="https://www.youtube.com/watch?v=3aYeUOVgbck">The Incan Empire</a> was known for its highly efficient messenger system despite not having horses, written writing or the wheel.
<br/><br/>

## Quick Start
Video Tutorial: https://www.youtube.com/watch?v=jkV7gbStYkU

#### Step 0:
You will need a database to store websocket subscriptions. `incan-js` is database agnostic because you provide the database queries. The data schema should look like below. We recommend indexing on the `resource_id` key for fast retrievals.
```
~ webhooks_table ~

resource_id STRING PRIMARY,
client_id STRING,
event_id STRING,
url_endpoint STRING
```

#### Step 1:
Install with npm:
```
$ npm install --save incan-js
```

#### Step 2:
Initialize `incan-js` into your REST server by passing in 3 database functions: `addSubs`, `removeSubs`, and `querySubs`.
These functions are custom to your database solution. They allow `incan-js` to access your database and modify the `webhooks_table`. For more details on each, scroll down to the specs. Look inside the `drivers/` folder to see an example for `postgreSQL`.

```js
const incan = require('incan-js')
const customDB = require('../customDatabaseAPI')

// add your 3 database calls
incan.connect({
  addSubs: customDB.addFn,
  removeSubs: customDB.removeFn,
  querySubs: customDB.queryFn
})
```

#### Step 3:
Use the four `incan-js` functions to manage your REST hook subscriptions.
```js
// add a webhook
incan.addSubs(webhooks)

// remove a webhook
incan.removeSubs(webhooks)

// trigger a webhook
const { resource_id, event_id, payload } = someEvent
const headers = { headers: { Authorization: 'Bearer <AUTH_TOKEN>' } }
incan.emit(resource_id, event_id, payload, headers)

// query webhooks
incan.querySubs(resource_id, event_id)


// reference objects
const webhooks = [{
  client_id: 'zapier',
  resource_id: 'khan',
  event_id: 'added_friend',
  url_endpoint: 'https://hooks.zapier.com/<unique_path>'
}]
const someEvent = {
  resource_id: 'khan',
  event_id: 'added_friend',
  payload: {
    target: 'khan',
    new_friend: 'david',
    added_date: 'ISO8601_datestamp',
  }
}

```

## Implementation
The below example shows how to add `incan-js` to the REST endpoints of an ExpressJS app. Add a `POST /subscribe` and `POST /unsubscribe` endpoint to your REST routes so that clients can tell your server which events it wants to subscribe to. This is where `addSubs()` and `removeSubs()` are used.
```js
// routes.js

// POST /subscribe
app.post('/subscribe', function(err, req) {
  const newSubscriptions = req.body
  /*
    newSubscriptions = [
      {
        client_id: 'zapier',
        resource_id: 'khan',
        event_id: 'added_friend',
        url_endpoint: 'https://hooks.zapier.com/<unique_path>'
      }
    ]
  */
  incan.addSubs(newSubscriptions)
})

// POST /unsubscribe
app.post('/unsubscribe', function(err, req) {
  const existingSubscriptions = req.body
  /*
    existingSubscriptions = [
      {
        client_id: 'zapier',
        resource_id: 'khan',
        event_id: 'added_friend'
      }
    ]
  */
  incan.removeSubs(existingSubscriptions)
})
```
Now that clients have subscribed to events, we can emit events with `incan.emit()`. Behind the scenes, `incan.emit()` will use `querySubs()` to find matching webhook subscriptions in your database. Then `incan.emit()` will send out the event to the appropriate `url_endpoint`s, and automatically unsubscribe upon any `410` responses.
```js
// emit the `added_friend` event to all listeners

addFriendToSocialNetwork('khan', 'david').then(({ me, friend, data }) => {
  // incan.emit(resource_id, event_id, payload, headers)
  incan.emit(me, 'added_friend', data, { headers: { Authorization: 'Bearer <AUTH_TOKEN>' } })
})
```
<br/><br/><br/><br/><br/>
## An overview of REST Hooks
Read Zapier's explanation of REST hooks <a href="https://zapier.com/developer/documentation/v2/rest-hooks/">here</a>. You will need your own persistant data store. I recommend Redis but you can use your existing SQL database, MongoDB, S3 Buckets...etc

![Visual Explanation](imgs/how_resthooks_work.png)
<br/><br/>

## Specs
The below 3 database functions must be custom made per database and passed in to `incan.connect()` by the developer. This allows `incan-js` to work with any persistent data store. I recommend Redis or AWS S3 but you can use your existing SQL database, MongoDB, DynamoDB... etc. Currently `incan-js` is limited to 1 persistent data store per run, so you can only call `incan.connect()` once.

#### addSubs()
`addSubs(newSubscription)` should be a function that adds new webhook subscriptions to your database, returning a promise. Your `addSubs()` should by default accept an array and return a success/failure status.
```js
// incan.addSubs() = customDatabaseAPI.addFn

// customDatabaseAPI.js
const newSubscriptions = [{
  client_id: '<IDENTIFIER_OF_CLIENT>',
  resource_id: '<IDENTIFIER_OF_RESOURCE>',
  event_id: '<IDENTIFIER_OF_EVENT>',
  url_endpoint: '<WEBHOOK_TO_HIT>',
}]
exports.addFn = (newSubscriptions) => {
  return Promise.all(newSubscriptions.map((sub) => {
    return AztecDB.exec(`
          INSERT INTO webhooks_table (client_id, resource_id, event_id, url_endpoint)
          VALUES (${sub.client_id}, ${sub.resource_id}, ${sub.event_id}, ${sub.url_endpoint});
      `)
    }))
}

```
#### removeSubs()
`removeSubs(existingSubscription)` should be a function that removes webhook subscriptions from your database, returning a promise. `removeSubs()` is used by `incan-js` to delete webhooks automatically (eg. Upon a `410` response). Your `removeSubs()` should by default accept an array and return a success/failure status.
```js
// incan.removeSubs() = customDatabaseAPI.removeFn

// customDatabaseAPI.js
const existingSubscriptions = [{
  client_id: '<IDENTIFIER_OF_CLIENT>',
  resource_id: '<IDENTIFIER_OF_RESOURCE>',
  event_id: '<IDENTIFIER_OF_EVENT>',
}]
exports.removeFn = (existingSubscriptions) => {
  return Promise.all(existingSubscriptions.map((sub) => {
    return AztecDB.exec(`
        DELETE FROM webhooks_table
        WHERE client_id = ${sub.client_id}
        AND resource_id = ${sub.resource_id}
        AND event_id = ${sub.event_id};
    `)
  }))
}
```
#### querySubs()
`querySubs(resource_id, event_id)` should be a function that queries your database for webhook subscriptions with matching `resource_id` and `event_id`. It should return a promise with an array of matches. `incan-js` will use the `querySubs` function to fulfill any waiting webhooks. Any `POST` request to a webhook endpoint returning a `410` response will automatically unsubscribe from the webhook.
```js
// incan.querySubs() = customDatabaseAPI.queryFn

// customDatabaseAPI.js
exports.queryFn = (resource_id, event_id) => {
  return AztecDB.exec(`
      SELECT FROM webhooks_table
      WHERE resource_id = resource_id
      AND event_id = event_id;
  `)
}
```

## Limitations
`incan-js` and REST Hooks are highly effective for sending real-time updates to static servers (with an I.P. address or domain name). However, it cannot support client -> server communications. For that, check out <a href="https://socket.io/">websockets</a>.<br/><br/>
You can set `incan-js` to re-attempt failed webhook calls X times before giving up and deleting the webhook subscription. However if your `incan.emit()` lies within a serverless function (such as `AWS API Gateway`), then make sure your `incan.config.duration()` conforms to the 30 second timeout limit.
```js
incan.config({
  max_attempts: 3,
  duration: (attempt_num) => {
    // exponential backoff
    // attempt_1 = 5 seconds
    // attempt_2 = 25 seconds
    // attempt_3 = 125 seconds
    return Math.pow(5, attempt_num)
  }
})
```
