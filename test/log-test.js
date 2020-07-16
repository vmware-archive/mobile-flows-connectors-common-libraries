/*
* Copyright © 2020 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

'use strict'

const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const index = require('../index')

chai.use(sinonChai)

describe('Log wrapper tests', () => {
  beforeEach(() => {
    sinon.spy(console, 'log')
  })

  afterEach(() => {
    console.log.restore()
  })

  it('should log on a discovery call', async () => {
    const mockRes = {
      locals: {}
    }

    const name = 'shree harsha'
    index.logReq(mockRes, 'My name is %s', name)
    expect(console.log).calledOnceWith('My name is %s', 'shree harsha')
  })

  it('should log base URL', async () => {
    const mockRes = {
      locals: {
        baseUrl: 'https://backend.com'
      }
    }

    index.logReq(mockRes, 'Bla')
    expect(console.log).calledOnceWith('[base: https://backend.com] Bla')
  })

  it('should log xRequestId', async () => {
    const mockRes = {
      locals: {
        xRequestId: 'req-id-1'
      }
    }

    index.logReq(mockRes, 'Bla')
    expect(console.log).calledOnceWith('[req: req-id-1] Bla')
  })

  it('should log mfJwt', async () => {
    const mockRes = {
      locals: {
        mfJwt: {
          tenantId: 'tenant123',
          username: 'shree',
          email: 'shree@vmware.com',
          idmDomain: 'vmware.com',
          decoded: {}
        }
      }
    }

    index.logReq(mockRes, 'Bla')
    expect(console.log).calledOnceWith('[t: tenant123] [u: shree] [e: shree@vmware.com] Bla')
  })

  it('should log all the properties when exists.', async () => {
    const mockRes = {
      locals: {
        xRequestId: 'req-id-1',
        baseUrl: 'https://backend.com',
        mfJwt: {
          tenantId: 'tenant123',
          username: 'shree',
          email: 'shree@vmware.com',
          idmDomain: 'vmware.com',
          decoded: {}
        }
      }
    }

    index.logReq(mockRes, 'Bla')
    expect(console.log).calledOnceWith('[req: req-id-1] [t: tenant123] [u: shree] [e: shree@vmware.com] [base: https://backend.com] Bla')
  })

  it('should log without any variables read by wrapper', async () => {
    const mockRes = {
      locals: {
        byConnectorAuthor: {
          name: 'zoom'
        }
      }
    }

    index.logReq(mockRes, 'Bla')
    expect(console.log).calledOnceWith('Bla')
  })
})
