const express = require('express')
const discovery = require('./discovery')
const mfAuth = require('./auth')
const mfRouting = require('./mf-routing')
const cardBuilder = require('./cardbuilder')

var MobileFlowsConnector = function () {
  this.app = express()
  this.app.set('trust proxy', true)

  const start = (port) => {
    // we do this on start in case any actions were added
    this.app.authenticatedAPIs = ['/cards']
    Object.keys(discovery.currentActions).forEach(key => {
      this.app.authenticatedAPIs.push(key)
    })
    // this.app.use(
    //   this.app.authenticatedAPIs,
    //   addAuth
    // )

    this.app.use('/*', mfRouting.addContextPath)
    this.app.get('/', handleDiscovery)
    // app.use('/images', express.static(path.join(__dirname, 'routes/public/images')))
    this.app.post('/cards', handleCards)
    this.app.get('/cards', showGetCardsError)

    console.log(`Listening on port ${port}`)
    this.app.listen(port)
  }

  const handleDiscovery = (req, res) => {
    const discoveryResponse = discovery.discovery(req)
    res.status(200).json(discoveryResponse)
  }

  const handleCards = async (req, res) => {
    if (this.cardRequest) {
      const result = await this.cardRequest(req)
      res.status(200).json({ objects: result })
    } else {
      res.status(200).json({ objects: [] })
    }
  }
  /**
   * Show a developer-friendly error
   * @param  {} req
   * @param  {} res
   */
  const showGetCardsError = (req, res) => {
    showUserFriendlyError(res, 'The cards endpoint expects a POST, not a GET')
  }

  /**
   * User friendly JSON response message to help the developer correct the issue
   * @param  {} req
   * @param  {} res
   * @param  {} message the message to send back
   */
  const showUserFriendlyError = (res, message) => {
    res.status(400).json({ error: message })
  }
  /**
   * Add a connector-level action to this connector.  This is an advaned use case and
   * is not necessary to start connector development
   * @param  {} actionMethod express method (req, res)
   * @param  {} actionName='TakeAction'
   * @param  {} actionKey one of 'DIRECT', 'OPEN_IN' or 'USER_INPUT'
   */
  const addAction = (actionMethod, actionName = 'Take Action', actionKey = 'DIRECT') => {
    discovery.addAction(this.app, actionMethod, actionName, actionKey)
  }

  const addAuth = async (req, res, next) => {
    console.log('addAuth')
    try {
      const mfPublicKeyUrl = res.locals.mfPublicKeyUrl || 'https://dev.hero.vmwservices.com/security/public-key'
      mfAuth.validate(mfPublicKeyUrl, req, res, next)
    } catch (error) {
      console.log(error)
      showUserFriendlyError(res, error.message)
    }
  }

  this.start = start
  this.addAction = addAction
  this.cardBuilder = cardBuilder

  return this
}

exports.MobileFlowsConnector = MobileFlowsConnector
