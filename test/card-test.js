'use strict'

const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

describe('Card builder and verifier tests', () => {
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
}