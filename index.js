/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { getConnectorBaseUrl, handleXRequestId } = require('./lib/utility')
const { readBackendBaseUrl } = require('./lib/backend')
const { validateAuth } = require('./lib/auth')
const mfRouting = require('./lib/mf-routing')
const mockMfServer = require('./lib/mock-mf-server')
const { log, logReq } = require('./lib/log')

module.exports = Object.freeze({
  getConnectorBaseUrl,
  handleXRequestId,
  readBackendBaseUrl,
  validateAuth,
  mfRouting,
  mockMfServer,
  log,
  logReq
})
