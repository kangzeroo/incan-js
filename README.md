# Incan JS
A NodeJS library for handling many-to-many webhook subscriptions (also known as <a href="http://resthooks.org/">REST Hooks</a>)

![Incan Messenger](imgs/incan_messenger.jpg)

## An overview of REST Hooks
Read Zapier's explanation of REST hooks <a href="https://zapier.com/developer/documentation/v2/rest-hooks/">here</a>

## Setup
#### Step 1:
Install with npm:
```
$ npm install --save incan-js
```

#### Step 2:
Initialize `incan-js` into your REST server by passing in 3 database functions: `addSubs`, `removeSubs`, and `querySubs`.
These functions are custom to your database solution. For more details on each, scroll down to the specs.
```
const incan = require('incan-js')
const customDB = require('../customDatabaseAPI')

// add your 3 database calls
incan.connect({
  addSubs: customFn.addFn,
  removeSubs: customFn.removeFn,
  querySubs: customFn.queryFn
})
```

#### Step 3:
Use the 3 incan functions to manage your REST hook subscriptions.
```
// your 3 incan functions
incan.addSubs([{ resthook_subscription }])
incan.removeSubs({ resthook_subscription })
incan.event()
```

## Specs
#### addSubs()
`addSubs(newSubscription)` is a function that should add a new webhook subscription to your database, with the following format:
```
const newSubscription = {
  client_id: '<IDENTIFIER_OF_CLIENT>',
  resource_id: '<IDENTIFIER_OF_RESOURCE>',
  event_id: '<IDENTIFIER_OF_EVENT>',
  url_endpoint: '<WEBHOOK_TO_HIT>',
}
const addSubs = (newSubscription) => {
  return AztecDB.exec(`
        INSERT INTO resthook_subscriptions
        VALUES client_id = ${newSubscription.client_id}, resource_id = ${newSubscription.resource_id}, event_id = ${newSubscription.event_id}, url_endpoint: ${newSubscription.url_endpoint}
    `)
}
```
#### removeSubs()
`removeSubs(existingSubscription)` is a function that should remove a webhook subscription from your database, with the following format:
```
const existingSubscription = {
  client_id: '<IDENTIFIER_OF_CLIENT>',
  resource_id: '<IDENTIFIER_OF_RESOURCE>',
  event_id: '<IDENTIFIER_OF_EVENT>',
}
const removeSubs = (existingSubscription) => {
  return AztecDB.exec(`
        DELETE FROM resthook_subscriptions
        WHERE client_id = ${existingSubscription.client_id}
        AND resource_id = ${existingSubscription.resource_id}
        AND event_id = ${existingSubscription.event_id}
    `)
}
```
#### querySubs()
``
