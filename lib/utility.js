/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { v4: uuidv4 } = require('uuid')
const { log } = require('./log')
const discoverySchema = require('../schemas/connector-discovery-schema.json')
const cardSchema = require('../schemas/card-response-schema.json')
const chatbotSchema = require('../schemas/chatbot-schema.json')
const Ajv = require('ajv')

/**
 * Calling this function would help to generate better logs.
 * It reads the header "x-request-id" and loads it in a res.locals variables.
 * When the request doesn't contain the header, function will generate one and that will be used.
 * @param  req - Request object
 * @param  res - Response object
 * @param  next - Express next function.
 */
const handleXRequestId = (req, res, next) => {
  res.locals.xRequestId = req.headers['x-request-id'] || 'gen-' + uuidv4()

  return next()
}

/**
 * Returns the connector's base URL, to be used externally.
 * It reads x-forwarded headers to build this URL.
 * @param  req - Request object
 */
const getConnectorBaseUrl = (req) => {
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host']
  const port = req.headers['x-forwarded-port']
  const path = req.headers['x-forwarded-prefix'] || ''

  if (proto !== 'https') {
    log('WARNING: Connector is not using https protocol. Its is not safe for production environments.')
  }

  if (host && port) {
    return `${proto}://${host}:${port}${path}`
  }

  if (host && !port) {
    return `${proto}://${host}${path}`
  }

  return `${proto}://${req.headers.host}${path}`
}

/**
 * Returns an object containing validation and error informations.
 * @param {object} discoveryMetadata - the discovery metadata json response as an object
 */
const validateDiscovery = (discoveryMetadata) => {
  const ajv = new Ajv()
  return {
    valid: ajv.validate(discoverySchema, discoveryMetadata),
    errors: ajv.errors
  }
}

/**
 * Returns an object containing validation and error informations.
 * @param {object} cardMetadata - the card json response as an object
 */
const validateCard = (cardMetadata) => {
  const ajv = new Ajv()
  return {
    valid: ajv.validate(cardSchema, cardMetadata),
    errors: ajv.errors
  }
}

/**
 * Returns an object containing validation and error informations.
 * @param {object} botDiscoveryMetadata - the botDiscovery itemDetails metadata json response as an object
 */
const validateBotDiscovery = (botDiscoveryMetadata) => {
  const ajv = new Ajv()
  const isValidObject = botDiscoveryMetadata.objects && botDiscoveryMetadata.objects.length === 1
  return {
    valid: isValidObject && ajv.validate(chatbotSchema, botDiscoveryMetadata.objects[0]),
    errors: !isValidObject ? [{ message: 'Invalid Object length' }] : ajv.errors // ajv returns an array of error objects
  }
}

/**
 * Returns an object containing validation and error informations.
 * @param {object} botObjects - the chatbot object response
 */
const validateBotObjects = (botObjects) => {
  const ajv = new Ajv()
  const isValidObject = botObjects.objects && botObjects.objects.length >= 1
  let errors = []
  const valid = isValidObject && botObjects.objects.reduce((accumulator, currentValue) => {
    const isValidItemDetails = ajv.validate(chatbotSchema, currentValue)
    errors = ajv.errors ? [...errors, ...ajv.errors] : errors
    return accumulator && isValidItemDetails
  }, true)
  return { valid, errors }
}

module.exports = {
  getConnectorBaseUrl,
  handleXRequestId,
  validateDiscovery,
  validateCard,
  validateBotDiscovery,
  validateBotObjects
}
