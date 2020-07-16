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

/**
 * It reads the backend authorization from the request header 'x-connector-authorization' and sets it in res.locals.backendAuthorization.
 * This function can be used as a middleware for all connector APIs.
 * Usually it can be used directly while accessing backend APIs.
 * @param  req - Request object
 * @param  res - Response object
 * @param  next - Express next function.
 */
const readBackendAuthorization = (req, res, next) => {
  res.locals.backendAuthorization = req.headers['x-connector-authorization']

  next()
}

module.exports = {
  readBackendBaseUrl,
  readBackendAuthorization
}
