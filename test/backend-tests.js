/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { expect } = require('chai')
const backend = require('../lib/backend')
let isNextCalled = false

describe('Backend function tests', () => {
  beforeEach(() => {
    isNextCalled = false
  })

  afterEach(() => {
    expect(isNextCalled).to.eql(true)
  })

  it('should read x-connector-base-url header', async () => {
    const mockReq = {
      headers: {
        'x-connector-base-url': 'https://salesforce.com',
        'x-connector-authorization': 'Bearer salesforce-oauth-token'
      }
    }
    const mockRes = {
      locals: {}
    }

    backend.readBackendBaseUrl(mockReq, mockRes, mockNext)
    expect(mockRes.locals.baseUrl).to.eql('https://salesforce.com')
  })

  it('should read x-connector-authorization header', async () => {
    const mockReq = {
      headers: {
        'x-connector-base-url': 'https://salesforce.com',
        'x-connector-authorization': 'Bearer salesforce-oauth-token'
      }
    }
    const mockRes = {
      locals: {}
    }

    backend.readBackendAuthorization(mockReq, mockRes, mockNext)
    expect(mockRes.locals.backendAuthorization).to.eql('Bearer salesforce-oauth-token')
  })

  it('should not error if backend base url is missing.', async () => {
    const mockReq = {
      headers: {
        'x-connector-authorization': 'Bearer salesforce-oauth-token'
      }
    }
    const mockRes = {
      locals: {}
    }

    backend.readBackendBaseUrl(mockReq, mockRes, mockNext)
  })
})

const mockNext = () => {
  isNextCalled = true
}
