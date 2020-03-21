'use strict'

const { expect } = require('chai')
const mockMobileFlows = require('../lib/mock-mf-server')
const index = require('../index')
const mockMfPublicKeyUrl = 'http://localhost:5000/public-key'
let isNextCalled = false

describe('Mobile Flows connectors common tests', () => {
  beforeEach(() => {
    isNextCalled = false
  })

  before(() => {
    try {
      mockMobileFlows.start(5000)
    } catch (e) {
      console.log('Something went wrong!', e)
      expect.fail('Something went wrong!')
    }
  })

  after(done => {
    mockMobileFlows.stop(done)
  })

  describe('Connector auth', () => {
    it('should validate and decode claims', async () => {
      const mfJwt = mockMobileFlows.getMfTokenFor('shree', 'https://my-host:3030/my-path-prefix/action-one')
      const mockReq = {
        headers: {
          authorization: 'Bearer ' + mfJwt,
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'my-host',
          'x-forwarded-port': 3030,
          'x-forwarded-prefix': '/my-path-prefix'
        },
        originalUrl: '/action-one'
      }
      const mockRes = {
        locals: {}
      }

      const validatorFn = index.validateAuth(mockMfPublicKeyUrl)
      await validatorFn(mockReq, mockRes, mockNext)

      expect(mockRes.locals.mfJwt.tenantId).to.eql('tenantId')
      expect(mockRes.locals.mfJwt.username).to.eql('shree')
      expect(mockRes.locals.mfJwt.email).to.eql('shree@vmware.com')
      expect(mockRes.locals.mfJwt.idmDomain).to.eql('vmware.com')
      expect(mockRes.locals.mfJwt.decoded.tenant).to.eql('tenantId')
      expect(isNextCalled).to.eql(true)
    })
  })

  describe('Connector auth', () => {
    it('should 401 for wrong audience', async () => {
      const mfJwt = mockMobileFlows.getMfTokenFor('shree', 'https://hacker-org:3030/my-path-prefix/action-one')
      const mockReq = {
        headers: {
          authorization: 'Bearer ' + mfJwt,
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'my-host',
          'x-forwarded-port': 3030,
          'x-forwarded-prefix': '/my-path-prefix'
        },
        originalUrl: '/action-one'
      }
      let expResStatus
      const mockRes = {
        locals: {},
        status: (status) => {
          expResStatus = status
          return {
            json: (body) => {}
          }
        }
      }

      const validatorFn = index.validateAuth(mockMfPublicKeyUrl)
      await validatorFn(mockReq, mockRes, mockNext)

      expect(expResStatus).to.eql(401)
      expect(isNextCalled).to.eql(false)
    })
  })

  describe('Connector auth', () => {
    it('should 401 for bogus authorization', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer bogus',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'my-host',
          'x-forwarded-port': 3030,
          'x-forwarded-prefix': '/my-path-prefix'
        },
        originalUrl: '/action-one'
      }
      let expResStatus
      const mockRes = {
        locals: {},
        status: (status) => {
          expResStatus = status
          return {
            json: (body) => {}
          }
        }
      }

      const validatorFn = index.validateAuth(mockMfPublicKeyUrl)
      await validatorFn(mockReq, mockRes, mockNext)

      expect(expResStatus).to.eql(401)
      expect(isNextCalled).to.eql(false)
    })
  })
})

const mockNext = () => {
  isNextCalled = true
}
