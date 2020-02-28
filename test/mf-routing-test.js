'use strict'

const { expect } = require('chai')
const index = require('../index')
let isNextCalled = false

describe('MobileFlows routing prefix tests', () => {
  beforeEach(() => {
    isNextCalled = false
  })

  describe('addContextPath', () => {
    it('to routing template', async () => {
      const mockReq = {
        headers: {
          'x-routing-template': 'https://mf-server/conn123/INSERT_OBJECT_TYPE/',
          'x-forwarded-prefix': '/my-path-prefix'
        }
      }
      const mockRes = {
        locals: {}
      }
      index.mfRouting.addContextPath(mockReq, mockRes, mockNext)
      expect(mockRes.locals.mfRoutingTemplate).to.eql('https://mf-server/conn123/INSERT_OBJECT_TYPE/my-path-prefix/')
      expect(isNextCalled).to.eql(true)
    })
  })

  describe('addContextPath', () => {
    it('to routing prefix', async () => {
      const mockReq = {
        headers: {
          'x-routing-prefix': 'https://mf-server/conn123/card/',
          'x-forwarded-prefix': '/my-path-prefix'
        }
      }
      const mockRes = {
        locals: {}
      }
      index.mfRouting.addContextPath(mockReq, mockRes, mockNext)
      expect(mockRes.locals.mfRoutingPrefix).to.eql('https://mf-server/conn123/card/my-path-prefix/')
      expect(isNextCalled).to.eql(true)
    })
  })

  describe('addContextPath', () => {
    it('works without any path prefix', async () => {
      const mockReq = {
        headers: {
          'x-routing-prefix': 'https://mf-server/conn123/card/'
        }
      }
      const mockRes = {
        locals: {}
      }
      index.mfRouting.addContextPath(mockReq, mockRes, mockNext)
      expect(mockRes.locals.mfRoutingPrefix).to.eql('https://mf-server/conn123/card/')
      expect(isNextCalled).to.eql(true)
    })
  })
})

const mockNext = () => {
  isNextCalled = true
}
