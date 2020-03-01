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
  const xReqId = safeGet(res.locals, 'xRequestId')
  const tenantId = safeGet(res.locals, 'mfJwt.tenantId')
  const username = safeGet(res.locals, 'mfJwt.username')
  const xBaseUrl = safeGet(res.locals, 'baseUrl')

  const xReqIdFmt = xReqId ? `[req: ${xReqId}] ` : ''
  const tenantFmt = tenantId ? `[t: ${tenantId}] ` : ''
  const usernameFmt = username ? `[u: ${username}] ` : ''
  const xBaseUrlFmt = xBaseUrl ? `[base: ${xBaseUrl}] ` : ''

  log(xReqIdFmt + tenantFmt + usernameFmt + xBaseUrlFmt + fmt, ...args)
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
