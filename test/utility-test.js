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
            pollable: true,
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

  describe('validateCard', () => {
    it('should return true for valid card metaData', () => {
      const validCardMetaData = {
        objects: [{
          id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          header: {
              title: 'test'
          },
          body: {
              description: 'test'
          },
          backend_id: 'test',
          hash: 'test',
          actions: [
              {
                  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                  action_key: 'OPEN_IN',
                  label: 'test',
                  completed_label: 'test',
                  type: 'GET',
                  primary: true,
                  remove_card_on_completion: false,
                  allow_repeated: true,
                  url: {
                  href: 'https://test.com'
                  }
              }
          ]
        }]
      }
      expect(index.validateCard(validCardMetaData).valid).to.eql(true)
    })

    it('should return false for invalid card metaData', () => {
      const inValidCardMetaData = {
        objects: [{
          id: 'test',
          header: {
              title: 'test'
          },
          body: {
              description: 'test'
          },
          backend_id: 'test',
          hash: 'test',
          actions: [
              {
                  id: 'test',             
                  label: 'Open Zone Info',
                  completed_label: 'Zone Info Opened',
                  type: 'GET',
                  primary: true,
                  remove_card_on_completion: false,
                  allow_repeated: true,
                  url: {
                  href: 'https://test.com'
                  }
              }
          ]
        }]
      }
      expect(index.validateCard(inValidCardMetaData).valid).to.eql(false)
    })    
  })

  describe('validateBotDiscovery', () => {
    it('should return true for valid validateBotDiscovery metaData', () => {
      const validBotDiscoveryMetaData = {
        "children": [{
            "itemDetails": {
                "id": "bf838612-018d-4ce9-90b4-8b1a0d48ffd8",
                "title": "test",
                "description": "test",
                "workflowId": "test",
                "workflowStep": "Complete",
                "actions": [{
                    "title": "Register a new device.",
                    "description": "Register your new device.",
                    "url": {
                        "href": "https://test.com"
                    },
                    "type": "GET"
                }]
            }
        }, {
            "itemDetails": {
                "id": "a573b652-66a5-4169-bea5-8048eef52021",
                "title": "Sync device.",
                "description": "Sync your device.",
                "workflowId": "test",
                "workflowStep": "Complete",
                "actions": [{
                    "title": "Sync device.",
                    "description": "Sync your device.",
                    "url": {
                        "href": "https://test.com"
                    },
                    "type": "GET"
                }]
            }
        }]
    }
      expect(index.validateBotDiscovery(validBotDiscoveryMetaData).valid).to.eql(true)
    })

    it('should return false for invalid BotDiscovery metaData', () => {
      const inValidBotDiscoveryMetaData = {
        "children": [{
            "itemDetails": {
                "id": 1234,
                "title": "Register a new device.",
                "description": "Register your new device.",
                "workflowId": "test",
                "workflowStep": "Complete",
                "actions": [{
                    "title": "Register a new device.",
                    "description": "Register your new device.",
                    "url": {
                        "href": 1234
                    },
                    "type": "GET"
                }]
            }
        }, {
            "itemDetails": {
                "id": 1234,
                "title": "Sync device.",
                "description": "Sync your device.",
                "workflowId": "test",
                "workflowStep": "Complete",
                "actions": [{
                    "title": "Sync device.",
                    "description": "Sync your device.",
                    "url": {
                        "href": 1234
                    },
                    "type": "GET"
                }]
            }
        }]
    }
      expect(index.validateBotDiscovery(inValidBotDiscoveryMetaData).valid).to.eql(false)
    })    
  })
})

const mockNext = () => {
  isNextCalled = true
}
