/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { getConnectorBaseUrl, handleXRequestId } = require('./lib/utility')
const connectorAuth = require('./lib/connector-auth')
const { log, logReq } = require('./lib/log')

module.exports = Object.freeze({
    getConnectorBaseUrl: getConnectorBaseUrl,
    handleXRequestId: handleXRequestId,
    validateConnectorAuth: connectorAuth.validate,
    log: log,
    logReq: logReq
})
