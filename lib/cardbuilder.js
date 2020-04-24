const { v4: uuidv4 } = require('uuid')
const Ajv = require('ajv')
const request = require('request')

const loadSchema = (uri) => {
  return request.json(uri).then(function (res) {
    if (res.statusCode >= 400) { throw new Error('Loading error: ' + res.statusCode) }
    return res.body
  })
}

const cardVerifier = async (card) => {
  const ajv = new Ajv({ loadSchema: loadSchema })
  const schemaUri = 'https://raw.githubusercontent.com/vmware-samples/card-connectors-guide/gh-pages/schema/herocard-response-schema.json'
  const heroResponseSchema = await ajv.getSchema(schemaUri)
  const validate = ajv.compile(heroResponseSchema)
  const valid = validate(card)
  const errors = []
  if (!valid) {
    validate.errors.forEach(element => { errors.push(JSON.stringify(element)) })
    throw Error(errors)
  }
  return valid
}

const cardBuilder = (backendId) => {
  this.card = {
    header: {
      title: 'Default card title'
    },
    body: {
      fields: []
    },
    id: uuidv4(),
    backend_id: `${backendId}`
  }

  this.setTitle = (title) => {
    this.card.header.title = title
  }

  this.setImage = (href) => {
    this.card.image = { href: `${href}` }
  }

  this.addField = (title, description) => {
    this.card.body.fields.push({
      type: 'GENERAL',
      title: `${title}`,
      description: `${description}`
    })
  }

  this.cardJSON = () => {
    return JSON.stringify(this.card)
  }

  return this
}
exports.cardBuilder = cardBuilder
exports.cardVerifier = cardVerifier

const validCard = { image: { href: 'https://mobilesecurity.win/jiraservicedesk/images/connector.png' }, body: { fields: [{ type: 'GENERAL', title: 'Reporter', description: 'David Customer' }, { type: 'GENERAL', title: 'Phone details and justification', description: 'This is the description details and justification' }, { type: 'GENERAL', title: 'Status', description: 'Waiting for approval' }, { type: 'GENERAL', title: 'Date Created', description: 'Today 4:10 PM' }], description: 'https://mobileflows.atlassian.net/servicedesk/customer/portal/1/FSDP-34' }, actions: [{ action_key: 'DIRECT', id: 'd11c3ee2-b965-4a3a-b95b-03bc23f992f3', user_input: [], request: { decision: 'approve', issueKey: 'FSDP-34' }, repeatable: false, primary: true, label: 'Approve', completed_label: 'Approved', type: 'POST', url: { href: 'https://dev.hero.vmwservices.com/connectors/foo/bar/servicedesk/actions' } }, { action_key: 'DIRECT', id: '6835c2fe-65e5-4ddb-a51d-18a29924ecb0', user_input: [], request: { decision: 'decline', issueKey: 'FSDP-34' }, repeatable: false, primary: false, label: 'Decline', completed_label: 'Declined', type: 'POST', url: { href: 'https://dev.hero.vmwservices.com/connectors/foo/bar/servicedesk/actions' } }], id: 'ee498f52-6400-4141-aa35-1273c53fc7cc', backend_id: 'FSDP-34', hash: '8RENCcsklxgpndR3ARDy1QqmXZROBKzdSD+BAhCBEEA=', header: { title: 'Dave Hock!', subtitle: ['https://mobileflows.atlassian.net/servicedesk/customer/portal/1/FSDP-34'] } }

cardVerifier(validCard)
