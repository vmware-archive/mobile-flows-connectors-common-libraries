/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const rp = require('request-promise')
const jwt = require('jsonwebtoken')
const { log, logReq } = require('./log')
const utility = require('./utility')
const mfPublicKeyUrl = process.env.MF_PUB_KEY_URL

let pubKeyCache

if (!mfPublicKeyUrl) {
  throw Error('Please provide Mobile Flows public key URL at MF_PUB_KEY_URL')
}

const validate = async (req, res, next) => {
  try {
    const decoded = await verifyMfJwt(req)

    const index = decoded.prn.lastIndexOf('@')
    const username = decoded.prn.substring(0, index)

    let mfCommons = {
      tenantId : decoded.tenant,
      username : username,
      email : decoded.eml,
      idmDomain : decoded.domain,
      decodedJwt : decoded
    }

    // If utility of something is called first, we will append all common properties.
    if (!res.locals.mfCommons) {
      res.locals.mfCommons = mfCommons;
    } else {
      res.locals.mfCommons = {...res.locals.mfCommons, ...mfCommons}
    }

  } catch (error) {
    logReq(res, error.message)
    return res.status(401).json({ message: error.message })
  }

  next()
}

const verifyMfJwt = async (req) => {
  const mfPublicKey = await getPublicKey()

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

const getPublicKey = async () => {
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
