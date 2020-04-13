/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

/**
 * It reads the admin configured backend base URL and sets it in res.locals.baseUrl.
 * This function can be used as a middleware for all connector APIs.
 * @param  req - Request object
 * @param  res - Response object
 * @param  next - Express next function.
 */
const readBackendBaseUrl = (req, res, next) => {
  res.locals.baseUrl = req.headers['x-connector-base-url']

  next()
}

module.exports = {
  readBackendBaseUrl
}
