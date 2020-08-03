/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const { expect } = require('chai')
const index = require('../index')
let isNextCalled = false

describe('Utility function tests', () => {
  beforeEach(() => {
    isNextCalled = false
  })

  describe('handleXRequestId', () => {
    it('should read the header', async () => {
      const mockReq = {
        headers: {
          'x-request-id': 'req123'
        }
      }
      const mockRes = {
        locals: {}
      }
      index.handleXRequestId(mockReq, mockRes, mockNext)
      expect(mockRes.locals.xRequestId).to.eql('req123')
      expect(isNextCalled).to.eql(true)
    })
  })

  describe('handleXRequestId', () => {
    it('should create one when its missing', async () => {
      const mockReq = {
        headers: {}
      }
      const mockRes = {
        locals: {}
      }
      index.handleXRequestId(mockReq, mockRes, mockNext)
      expect(mockRes.locals.xRequestId).to.contains('gen-')
      expect(isNextCalled).to.eql(true)
    })
  })

  describe('getConnectorBaseUrl', () => {
    it('should build from x forwarded headers', async () => {
      const mockReq = {
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'my-host',
          'x-forwarded-port': 3030,
          'x-forwarded-prefix': '/my-path-prefix'
        }
      }
      const connectorUrl = index.getConnectorBaseUrl(mockReq)
      expect(connectorUrl).to.eql('https://my-host:3030/my-path-prefix')
    })
  })

  describe('getConnectorBaseUrl', () => {
    it('should build without any x forwarded headers', async () => {
      const mockReq = {
        headers: {
          host: 'host-one'
        }
      }
      const connectorUrl = index.getConnectorBaseUrl(mockReq)
      expect(connectorUrl).to.eql('http://host-one')
    })
  })

  describe('validateDiscovery', () => {
    it('should return true for valid discovery metaData', () => {
      const validDiscoveryMetaData = {
        object_types: {
          card: {
            endpoint: {
              href: 'https://test.com'
            },
            pollable: true
          }
        }
      }
      expect(index.validateDiscovery(validDiscoveryMetaData).valid).to.eql(true)
    })

    it('should return false for invalid discovery metaData', () => {
      const inValidDiscoveryMetaData = {
        object_types: {
          card: {
            endpoint: {
              href: 'https://test.com'
            },
            pollable: "test"
          }
        }
      }
      expect(index.validateDiscovery(inValidDiscoveryMetaData).valid).to.eql(false)
    })    
  })
})

const mockNext = () => {
  isNextCalled = true
}
