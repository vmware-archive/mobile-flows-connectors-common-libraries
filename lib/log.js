/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const log = (fmt, ...args) => {
  if (!process.env.SQUELCH_LOGS) {
    console.log('[BHNC] ' + fmt, ...args)
  }
}

const logReq = (res, fmt, ...args) => {
  const xReqId = res.locals.xReqId
  const xReqIdFmt = xReqId ? `[req: ${xReqId}] ` : ''
  const xBaseUrl = res.locals.baseUrl
  const xBaseUrlFmt = xBaseUrl ? `[base: ${xBaseUrl}] ` : ''
  const tenant = res.locals.mfTenant
  const tenantFmt = tenant ? `[t: ${tenant}] ` : ''
  const username = res.locals.username
  const usernameFmt = username ? `[u: ${username}] ` : ''
  log(tenantFmt + usernameFmt + xReqIdFmt + xBaseUrlFmt + fmt, ...args)
}

module.exports = {
  log,
  logReq
}
