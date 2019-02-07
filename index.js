const axios = require('axios')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

module.exports = function () {
  this.addSubs = () => []
  this.removeSubs = () => []
  this.querySubs = () => []
  return {
    connect: ({ addSubs, removeSubs, querySubs }) => {
      /*
        accepts { addSubs: fn, removeSubs: fn, querySubs: fn }
      */
      this.addSubs = addSubs
      this.removeSubs = removeSubs
      this.querySubs = querySubs
      return Promise.resolve()
      /*
        returns Promise.resolve()
      */
    },
    addSubs: (webhooks) => {
      /*
        accepts [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }]
      */
      return this.addSubs(webhooks)
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
    removeSubs: (webhooks) => {
      /*
        accepts [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }]
      */
      return this.removeSubs(webhooks)
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
      /*
        accepts (resource_id, event_id)
      */
      return this.querySubs(resource_id, event_id)
      /*
        returns [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }]
      */
    },
    emit: (resource_id, event_id, payload, headers) => {
      const p = new Promise((res, rej) => {
        /*
          accepts (resource_id, event_id, payload, headers)
        */

        this.querySubs(resource_id, event_id)
          .then((results) => {
            const all = results.map((sub) => {
              return axios.post(sub.url_endpoint, payload, headers)
                .then((data) => {
                  return Promise.resolve({
                    status: data.status,
                    data: sub
                  })
                })
                .catch((err) => {
                  return Promise.reject({
                    status: data.status,
                    data: sub,
                    error: err
                  })
                })
            })
            return Promise.all(all)
          })
          .then((webhook_statuses) => {
            let success = []
            let gone = []
            let error = []
            webhook_statuses.forEach((result) => {
              if (result.status === 200) {
                success.push(result)
              } else if (result.status === 410) {
                gone.push(result)
              } else {
                error.push(result)
              }
            })
            if (gone.length > 0) {
              this.removeSubs(gone.map(g => g.data))
            }
            res({
              success: success,
              gone: gone,
              error: error
            })
          })
          .catch((err) => {
            console.log(err)
          })
        /*

          STEP 1: Query for matches using this.querySubs()
          STEP 2: Send POST/endpoint for each match
          STEP 3A: Collect all that respond with 200 status
          STEP 3B: Collect all that respond with 410 status and delete webhook with this.removeSubs()
          STEP 3C: Collect all that respond with 4** status
          STEP 4: Return the 3 arrays of statuses

        */
        /*
          returns Promise.resolve({
            success: [],
            gone: [],
            error: []
          })
        */
      })
      return p
    }
  }
}()
