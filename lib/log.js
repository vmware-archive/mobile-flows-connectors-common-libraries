/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

/**
 * It takes a message to log with optional substitution values.
 * Set any value for "process.env.SQUELCH_LOGS", to completely stop all the logs from this library.
 * @param  fmt - Message format
 * @param  args - Optional substitution values
 */
const log = (fmt, ...args) => {
  if (!process.env.SQUELCH_LOGS) {
    console.log(fmt, ...args)
  }
}

/**
 * It can be used to log a message along with some useful properties related to the current request.
 * Set any value for "process.env.SQUELCH_LOGS", to completely stop all the logs from this library.
 * @param  res - Response object
 * @param  fmt - Message format
 * @param  args - Optional substitution values
 */
const logReq = (res, fmt, ...args) => {
  const xReqId = safeGet(res.locals, 'xRequestId')
  const tenantId = safeGet(res.locals, 'mfJwt.tenantId')
  const username = safeGet(res.locals, 'mfJwt.username')
  const email = safeGet(res.locals, 'mfJwt.email')
  const xBaseUrl = safeGet(res.locals, 'backendBaseUrl') || safeGet(res.locals, 'baseUrl')
  const preHire = safeGet(res.locals, 'mfJwt.preHire')

  const xReqIdFmt = xReqId ? `[req: ${xReqId}] ` : ''
  const tenantFmt = tenantId ? `[t: ${tenantId}] ` : ''
  const usernameFmt = username ? `[u: ${username}] ` : ''
  const emailFmt = email ? `[e: ${email}] ` : ''
  const xBaseUrlFmt = xBaseUrl ? `[base: ${xBaseUrl}] ` : ''
  const preHireFmt = preHire !== undefined ? `[ph: ${preHire}] ` : ''

  log(xReqIdFmt + tenantFmt + usernameFmt + emailFmt + xBaseUrlFmt + preHireFmt + fmt, ...args)
}

function safeGet (obj, propPath) {
  if (!propPath) {
    return
  }
  const props = propPath.split('.')
  let result = obj
  props.forEach(p => { result = result && result[p] })
  return result
}

module.exports = {
  log,
  logReq
}
