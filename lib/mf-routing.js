/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

/**
 * Call this function if connector is to be hosted behind a path based proxy.
 * If you are uncertain, it is advised to call this always.
 * It reads the context path from "x-forwarded-prefix" and updates the Mobile Flows x-routing headers.
 * @param  req - Request object
 * @param  res - Response object
 * @param  next - Express next function.
 */
exports.addContextPath = function (req, res, next) {
  const xRoutingPrefix = req.headers['x-routing-prefix']
  const xRoutingTemplate = req.headers['x-routing-template']

  const xForwardedPrefix = req.headers['x-forwarded-prefix']

  let contextPath
  if (xForwardedPrefix) {
    contextPath = xForwardedPrefix.substring(1) + '/'
  } else {
    contextPath = ''
  }

  if (xRoutingPrefix) {
    // Eg: Results either https://mf-server/conn123/card/ or https://mf-server/conn123/card/bot-connectors/
    res.locals.mfRoutingPrefix = xRoutingPrefix + contextPath
  }

  if (xRoutingTemplate) {
    res.locals.mfRoutingTemplate = xRoutingTemplate + contextPath
  }

  next()
}
