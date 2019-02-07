// node drivers/postgresql.js

const pg = require('pg')
const axios = require('axios')
require('dotenv').load()

const client = new pg.Client(process.env.DATABASE_CONNECTION);
client.connect();

module.exports = {
  createTable: () => {
    return client.query(`
      CREATE TABLE webhooks_table (
        client_id VARCHAR,
        resource_id VARCHAR,
        event_id VARCHAR,
        url_endpoint VARCHAR
      );
      `).then((data) => {
        console.log('---- SUCCESS ----')
        return Promise.resolve(data)
      }).catch((err) => {
        console.log('---- FAILURE ----')
        return Promise.reject(err)
      })
  },
  addSubs: (newSubscriptions) => {
    /*
      newSubscriptions = [{
        client_id: '<IDENTIFIER_OF_CLIENT>',
        resource_id: '<IDENTIFIER_OF_RESOURCE>',
        event_id: '<IDENTIFIER_OF_EVENT>',
        url_endpoint: '<WEBHOOK_TO_HIT>',
      }]
    */
    const p = new Promise((res, rej) => {
      const all = newSubscriptions.map((sub) => {
        const qstr = `
          INSERT INTO webhooks_table (client_id, resource_id, event_id, url_endpoint)
          VALUES ('${sub.client_id}', '${sub.resource_id}', '${sub.event_id}', '${sub.url_endpoint}')
          RETURNING *;
        `
        console.log(qstr)
        return client.query(qstr).then((data) => {
          console.log('--------------')
          console.log(data.rows)
          return Promise.resolve({
            success: true,
            data: data.rows
          })
        }).catch((err) => {
          console.log(err)
          return Promise.resolve({
            success: false,
            error: err
          })
        })
      })
      Promise.all(all).then((results) => {
        let success = []
        let error = []
        results.forEach((result) => {
          if (result.success === true) {
            success.push(result)
          } else {
            error.push(result)
          }
        })
        res({
          success: success,
          error: error
        })
      })
    })
    return p
    /*
      returns Promise.resolve({
        success: [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }],
        error: []
      })
    */
  },
  removeSubs: (existingSubscriptions) => {
    /*
      existingSubscriptions = [{
        client_id: '<IDENTIFIER_OF_CLIENT>',
        resource_id: '<IDENTIFIER_OF_RESOURCE>',
        event_id: '<IDENTIFIER_OF_EVENT>',
        url_endpoint: '<WEBHOOK_TO_HIT>',
      }]
    */
    const p = new Promise((res, rej) => {
      const all = existingSubscriptions.map((sub) => {
        const qstr = `
          DELETE FROM webhooks_table
          WHERE client_id = '${sub.client_id}' AND resource_id = '${sub.resource_id}' AND event_id = '${sub.event_id}';
        `
        console.log(qstr)
        return client.query(qstr).then((data) => {
          console.log('--------------')
          console.log(data.rows)
          return Promise.resolve({
            success: true,
            data: data.rows
          })
        }).catch((err) => {
          console.log(err)
          return Promise.resolve({
            success: false,
            error: err
          })
        })
      })
      Promise.all(all).then((results) => {
        let success = []
        let error = []
        results.forEach((result) => {
          if (result.success === true) {
            success.push(result)
          } else {
            error.push(result)
          }
        })
        res({
          success: success,
          error: error
        })
      })
    })
    return p
    /*
      returns Promise.resolve({
        success: [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }],
        error: []
      })
    */
  },
  querySubs: (resource_id, event_id) => {
    const qstr = `
      SELECT * FROM webhooks_table
      WHERE resource_id = '${resource_id}' AND event_id = '${event_id}';
    `
    console.log(qstr)
    return client.query(qstr).then((data) => {
      console.log('--------------')
      console.log(data.rows)
      return Promise.resolve(data.rows)
    }).catch((err) => {
      console.log(err)
      return Promise.reject(err)
    })
  }
}
