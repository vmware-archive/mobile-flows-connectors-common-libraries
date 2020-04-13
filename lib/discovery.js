const actions = {}
let nextActionId = 1
const serverBase = 'https://server.com'

/**
 * @param  {} actionMethod
 */
const addActionToDiscovery = (app, actionMethod, actionName = 'Take Action', actionKey = 'DIRECT') => {
  const actionUrl = `/actions/action${nextActionId++}`
  const newAction = {
    url: {
      href: `${serverBase}${actionUrl}`
    },
    user_input: [

    ],
    label: {
      'en-US': `${actionName}`
    },
    type: 'POST',
    action_key: `${actionKey}`
  }

  // add the actual action to the connector
  app.post(actionUrl, actionMethod)
  actions[actionUrl] = newAction
}
/**
 * Return a valid discovery with any declared actions
 */
const getCurrentDiscovery = (req) => {
  return {
    object_types: {
      card: {
        pollable: true,
        endpoint: {
          href: `${req.protocol}://${req.headers.host}/cards`
        }
      },
      actions: actions || {}
    }
  }
}

exports.discovery = getCurrentDiscovery
exports.addAction = addActionToDiscovery
exports.currentActions = actions
