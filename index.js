
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
        returns [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }]
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
        returns [{
          client_id: 'zapier',
          resource_id: 'khan',
          event_id: 'added_friend',
          url_endpoint: 'https://hooks.zapier.com/<unique_path>'
        }]
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
    emit: (resource_id, event_id, payload) => {
      /*
        accepts (resource_id, event_id, payload)
      */
      let success = []
      let gone = []
      let error = []
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
    }
  }
}()
