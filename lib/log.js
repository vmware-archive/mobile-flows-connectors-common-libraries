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
  let xReqId = ''
  let tenantId = ''
  let username = ''
  let xBaseUrl = req.headers['x-connector-base-url'] || ''

  if (res.locals.mfCommons) {
    xReqId = res.locals.mfCommons.xRequestId || ''
    tenantId = res.locals.mfCommons.tenantId || ''
    username = res.locals.mfCommons.username || ''
  }

  const xReqIdFmt = `[req: ${xReqId}] `
  const tenantFmt = `[t: ${tenantId}] `
  const usernameFmt = `[u: ${username}] `
  const xBaseUrlFmt = `[base: ${xBaseUrl}] `

  log(xReqIdFmt + tenantFmt + usernameFmt + xBaseUrlFmt + fmt, ...args)
}

module.exports = {
  log,
  logReq
}
