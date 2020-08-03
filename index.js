/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { getConnectorBaseUrl, handleXRequestId, validateDiscovery } = require('./lib/utility')
const { readBackendBaseUrl, readBackendHeaders } = require('./lib/backend')
const { validateAuth } = require('./lib/auth')
const mfRouting = require('./lib/mf-routing')
const mockMfServer = require('./lib/mock-mf-server')
const { log, logReq } = require('./lib/log')

module.exports = Object.freeze({
  getConnectorBaseUrl,
  handleXRequestId,
  readBackendBaseUrl,
  readBackendHeaders,
  validateAuth,
  mfRouting,
  mockMfServer,
  log,
  logReq,
  validateDiscovery
})
