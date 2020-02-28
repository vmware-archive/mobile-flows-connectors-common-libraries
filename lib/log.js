/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const log = (fmt, ...args) => {
  if (!process.env.SQUELCH_LOGS) {
    console.log(fmt, ...args)
  }
}

const logReq = (res, fmt, ...args) => {
  const xReqId = res.locals.xRequestId || ''
  const tenantId = res.locals.mfJwt.tenantId || ''
  const username = res.locals.mfJwt.username || ''
  const xBaseUrl = res.locals.baseUrl || ''

  const xReqIdFmt = `[req: ${xReqId}] ` || ''
  const tenantFmt = `[t: ${tenantId}] ` || ''
  const usernameFmt = `[u: ${username}] ` || ''
  const xBaseUrlFmt = `[base: ${xBaseUrl}] ` || ''

  log(xReqIdFmt + tenantFmt + usernameFmt + xBaseUrlFmt + fmt, ...args)
}

module.exports = {
  log,
  logReq
}
