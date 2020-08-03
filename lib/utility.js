/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { v4: uuidv4 } = require('uuid')
const { log } = require('./log')
const tv4 = require('tv4')
const discoverySchema = require('../schemas/connector-discovery-schema.json')

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
  return tv4.validateMultiple(discoveryMetadata, discoverySchema)
}

module.exports = {
  getConnectorBaseUrl,
  handleXRequestId,
  validateDiscovery
}
