const { v4: uuidv4 } = require('uuid')

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
module.exports = cardBuilder
