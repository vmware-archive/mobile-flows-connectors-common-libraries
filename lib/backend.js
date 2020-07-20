/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

/**
 * @deprecated since 1.1.0 This function will be deleted in version 2.0.0
 * Please switch to use {@code readBackendHeaders}
 *
 * It reads the admin configured backend base URL and sets it in res.locals.baseUrl.
 * This function can be used as a middleware for all connector APIs.
 *
 * @param  req - Request object
 * @param  res - Response object
 * @param  next - Express next function.
 */
const readBackendBaseUrl = (req, res, next) => {
  res.locals.baseUrl = req.headers['x-connector-base-url']

  next()
}

/*
 * It reads all the backend headers ('x-connector-' headers) and sets them in local variables.
 * 'res.locals.backendBaseUrl' would contain admin configured backend base URL
 * 'res.locals.backendAuthorization' would contain backend authorization. Usually it can be used directly while accessing backend APIs.
 *
 * @param  req - Request object
 * @param  res - Response object
 * @param  next - Express next function.
 */
const readBackendHeaders = (req, res, next) => {
  res.locals.backendBaseUrl = req.headers['x-connector-base-url']
  res.locals.backendAuthorization = req.headers['x-connector-authorization']

  next()
}

module.exports = {
  readBackendBaseUrl,
  readBackendHeaders
}
