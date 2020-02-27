/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const uuid = require('uuid/v4')

const handleXRequestId = (req, res, next) => {
  res.locals.xReqId = req.headers['x-request-id'] || 'bhnc-gen-' + uuid()
  return next()
}

const getConnectorBaseUrl = (req) => {
  const proto = req.header('x-forwarded-proto') || 'http'
  const host = req.header('x-forwarded-host')
  const port = req.header('x-forwarded-port')
  const path = req.header('x-forwarded-prefix') || ''

  if (host && port) {
    return `${proto}://${host}:${port}${path}`
  }

  if (host && !port) {
    return `${proto}://${host}${path}`
  }

  return `${proto}://${req.headers.host}${path}`
}

module.exports = {
  getConnectorBaseUrl,
  handleXRequestId
}
