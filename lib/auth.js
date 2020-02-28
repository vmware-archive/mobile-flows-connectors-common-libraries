/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const rp = require('request-promise')
const jwt = require('jsonwebtoken')
const { log, logReq } = require('./log')
const utility = require('./utility')

let pubKeyCache

const validate = async (mfPublicKeyUrl, req, res, next) => {
  try {
    const decoded = await verifyMfJwt(mfPublicKeyUrl, req)

    const index = decoded.prn.lastIndexOf('@')
    const username = decoded.prn.substring(0, index)

    res.locals.mfJwt = {}
    res.locals.mfJwt.tenantId = decoded.tenant
    res.locals.mfJwt.username = username
    res.locals.mfJwt.email = decoded.eml
    res.locals.mfJwt.idmDomain = decoded.domain
    res.locals.mfJwt.decoded = decoded
  } catch (error) {
    logReq(res, error.message)
    return res.status(401).json({ message: error.message })
  }

  next()
}

const verifyMfJwt = async (mfPublicKeyUrl, req) => {
  const mfPublicKey = await getPublicKey(mfPublicKeyUrl)

  return new Promise((resolve, reject) => {
    const jwtOptions = {
      algorithms: ['RS256'],
      audience: getExternalUrl(req),
      clockTolerance: 60,
      clockTimestamp: Date.now() / 1000
    }
    const auth = (req.headers.authorization || '').replace('Bearer ', '').trim()
    jwt.verify(auth, mfPublicKey, jwtOptions, (err, decoded) => {
      if (err) {
        reject(new Error('Failed to validate MobileFlows Jwt. ' + err.message))
      } else {
        resolve(decoded)
      }
    })
  })
}

const getPublicKey = async (mfPublicKeyUrl) => {
  if (!mfPublicKeyUrl) {
    throw Error('Please provide Mobile Flows public key URL')
  }

  if (pubKeyCache && pubKeyCache.expiresAtTime > Date.now()) {
    return pubKeyCache.value
  }

  const key = await rp(mfPublicKeyUrl)
  const expiresAtTime = Date.now() + 3600000

  log(
    'Updating pub key cache for url: %s, set to expire around: %s',
    mfPublicKeyUrl,
    new Date(expiresAtTime)
  )

  pubKeyCache = {
    expiresAtTime: expiresAtTime,
    value: key
  }

  return key
}

const getExternalUrl = (req) => {
  return utility.getConnectorBaseUrl(req) + req.originalUrl
}

module.exports = {
  validate
}