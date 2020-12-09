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
            pollable: 'test'
          }
        }
      }
      expect(index.validateDiscovery(inValidDiscoveryMetaData).valid).to.eql(false)
    })
  })

  describe('validateCard', () => {

    const getValidCardData = () => {
      return {
        objects: [{
          id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          header: {
            title: 'test'
          },
          banner: {
            items: [
              {
                type: 'video',
                href: 'https://vmware.com/video.stream',
                title: 'Streaming video',
                description: 'A video description'
              },
              {
                type: 'image',
                href: 'https://vmware.com/image.png',
                description: 'An image description'
              }
            ]
          },
          body: {
            description: 'test'
          },
          backend_id: 'test',
          hash: 'test',
          sticky: {
            until: '2020-12-31T23:59:59.000Z',
            type: 'foo'
          },
          actions: [
            {
              id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
              action_key: 'USER_INPUT',
              label: 'test',
              completed_label: 'test',
              type: 'GET',
              content_type: 'application/json',
              primary: true,
              remove_card_on_completion: false,
              allow_repeated: true,
              user_input: [
                {
                  id: 'foo',
                  label: 'bar',
                  display_content: 'baz'
                }
              ],
              url: {
                href: 'https://test.com'
              }
            }
          ]
        }]
      }
    }

    it('should return true for valid card Data', () => {
      const cardData = getValidCardData()
      expect(index.validateCard(cardData).valid).to.eql(true)
    })

    it('should return false for invalid card data', () => {
      const invalidCardData = {
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
      expect(index.validateCard(invalidCardData).valid).to.eql(false)
    })

    it('should return false for invalid display_content', () => {
      const cardData = getValidCardData()
      cardData.objects[0].actions[0].user_input[0].display_content = 42
      expect(index.validateCard(cardData).valid).to.eql(false)
    })

    it('should return false for invalid content_type', () => {
      const cardData = getValidCardData()
      cardData.objects[0].actions[0].content_type = 42
      expect(index.validateCard(cardData).valid).to.eql(false)
    })

    it('should return false for invalid sticky', () => {
      const cardData = getValidCardData()
      cardData.objects[0].sticky.type = 42
      expect(index.validateCard(cardData).valid).to.eql(false)
    })

    it('should return false for invalid banner', () => {
      let cardData = getValidCardData()

      cardData.objects[0].banner.items[0].type = 'invalid-type'
      expect(index.validateCard(cardData).valid).to.eql(false)

      cardData = getValidCardData()
      delete cardData.objects[0].banner.items[0].type
      expect(index.validateCard(cardData).valid).to.eql(false)

      cardData = getValidCardData()
      cardData.objects[0].banner.items[0].href = 'invalid-uri'
      expect(index.validateCard(cardData).valid).to.eql(false)

      cardData = getValidCardData()
      delete cardData.objects[0].banner.items[0].href
      expect(index.validateCard(cardData).valid).to.eql(false)
    })

  })

  describe('validateBotDiscovery', () => {
    it('should return true for valid validateBotDiscovery metaData', () => {
      const validBotDiscoveryMetaData = {
        objects: [
          {
            children: [
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Create a ticket',
                  description: 'File your issues for IT.',
                  actions: [
                    {
                      title: 'Create a ticket',
                      description: 'Create a new ticket',
                      type: 'POST',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/task/confirm_create'
                      },
                      payload: {
                        type: 'incident'
                      },
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      userInput: [
                        {
                          id: 'shortDescription',
                          label: 'Please give a short description to create your ticket.',
                          format: 'textarea',
                          minLength: 1,
                          maxLength: 160
                        }
                      ]
                    }
                  ],
                  workflowId: 'vmw_FILE_GENERAL_TICKET',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'View my tickets',
                  description: 'View the tickets that I currently have open',
                  actions: [
                    {
                      title: 'View my tickets',
                      description: 'View the status of my open tickets',
                      type: 'POST',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/tasks'
                      },
                      payload: {
                        type: 'task'
                      },
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_GET_TICKET_STATUS',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a device',
                  description: 'You can order a device here.',
                  actions: [
                    {
                      title: 'View Device Categories',
                      description: 'You can view device categories.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/deviceCategoryList'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_NEW_DEVICE',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a Laptop',
                  description: 'You can order a Laptop here.',
                  actions: [
                    {
                      title: 'View List Of Laptops',
                      description: 'You can view list of Laptops.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/device_list?device_category=Laptops&limit=10&offset=0'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_LAPTOP',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a Desktop',
                  description: 'You can order a Desktop here.',
                  actions: [
                    {
                      title: 'View List Of Desktops',
                      description: 'You can view list of Desktops.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/device_list?device_category=Desktops&limit=10&offset=0'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_DESKTOP',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a Mobile device',
                  description: 'You can order a Mobile device here.',
                  actions: [
                    {
                      title: 'View List Of Mobile devices',
                      description: 'You can view list of Mobile devices.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/device_list?device_category=Mobiles&limit=10&offset=0'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_MOBILE',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a Tablet',
                  description: 'You can order a Tablet here.',
                  actions: [
                    {
                      title: 'View List Of Tablets',
                      description: 'You can view list of Tablets.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/device_list?device_category=Tablets&limit=10&offset=0'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_TABLET',
                  workflowStep: 'Complete'
                }
              }
            ]
          }
        ]
      }
      expect(index.validateBotDiscovery(validBotDiscoveryMetaData).valid).to.eql(true)
    })

    it('should return false for invalid BotDiscovery metaData', () => {
      const invalidBotDiscoveryMetadata = {
        objects: [
          {
            children: [
              {
                itemDetails: {
                  id: 12345,
                  title: 'Create a ticket',
                  description: 'File your issues for IT.',
                  actions: [
                    {
                      title: 'Create a ticket',
                      description: 'Create a new ticket',
                      type: 'POST',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/task/confirm_create'
                      },
                      payload: {
                        type: 'incident'
                      },
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      userInput: [
                        {
                          id: 'shortDescription',
                          label: 'Please give a short description to create your ticket.',
                          format: 'textarea',
                          minLength: 1,
                          maxLength: 160
                        }
                      ]
                    }
                  ],
                  workflowId: 'vmw_FILE_GENERAL_TICKET',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'View my tickets',
                  description: 'View the tickets that I currently have open',
                  actions: [
                    {
                      title: 'View my tickets',
                      description: 'View the status of my open tickets',
                      type: 'POST',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/tasks'
                      },
                      payload: {
                        type: 'task'
                      },
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_GET_TICKET_STATUS',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: 12345,
                  title: 'Order a device',
                  description: 'You can order a device here.',
                  actions: [
                    {
                      title: 'View Device Categories',
                      description: 'You can view device categories.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/deviceCategoryList'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_NEW_DEVICE',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: 12345,
                  title: 'Order a Laptop',
                  description: 'You can order a Laptop here.',
                  actions: [
                    {
                      title: 'View List Of Laptops',
                      description: 'You can view list of Laptops.',
                      type: 'GET',
                      url: {
                        href: 12345
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_LAPTOP',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: 12345,
                  title: 'Order a Desktop',
                  description: 'You can order a Desktop here.',
                  actions: [
                    {
                      title: 'View List Of Desktops',
                      description: 'You can view list of Desktops.',
                      type: 'GET',
                      url: {
                        href: 12345
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_DESKTOP',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a Mobile device',
                  description: 'You can order a Mobile device here.',
                  actions: [
                    {
                      title: 'View List Of Mobile devices',
                      description: 'You can view list of Mobile devices.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/device_list?device_category=Mobiles&limit=10&offset=0'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_MOBILE',
                  workflowStep: 'Complete'
                }
              },
              {
                itemDetails: {
                  id: '00000000-0000-0000-0000-000000000000',
                  title: 'Order a Tablet',
                  description: 'You can order a Tablet here.',
                  actions: [
                    {
                      title: 'View List Of Tablets',
                      description: 'You can view list of Tablets.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/device_list?device_category=Tablets&limit=10&offset=0'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_TABLET',
                  workflowStep: 'Complete'
                }
              }
            ]
          }
        ]
      }
      expect(index.validateBotDiscovery(invalidBotDiscoveryMetadata).valid).to.eql(false)
    })
    it('should return false for invalid BotDiscovery metaData length', () => {
      const invalidBotDiscoveryLength = {
        objects: [
          {
            children: [
              {
                itemDetails: {
                  id: 12345,
                  title: 'Order a device',
                  description: 'You can order a device here.',
                  actions: [
                    {
                      title: 'View Device Categories',
                      description: 'You can view device categories.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/deviceCategoryList'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_NEW_DEVICE',
                  workflowStep: 'Complete'
                }
              }
            ]
          },
          {
            children: [
              {
                itemDetails: {
                  id: 12345,
                  title: 'Order a device',
                  description: 'You can order a device here.',
                  actions: [
                    {
                      title: 'View Device Categories',
                      description: 'You can view device categories.',
                      type: 'GET',
                      url: {
                        href: 'https://mf/connectors/abc123/botDiscovery/api/v1/deviceCategoryList'
                      },
                      payload: {},
                      headers: {},
                      userInput: []
                    }
                  ],
                  workflowId: 'vmw_ORDER_NEW_DEVICE',
                  workflowStep: 'Complete'
                }
              }
            ]
          }
        ]
      }
      expect(index.validateBotDiscovery(invalidBotDiscoveryLength).valid).to.eql(false)
    })
  })

  describe('validateBotObject', () => {
    it('should return true for a valid bot object', () => {
      expect(index.validateBotObject({
        itemDetails: {
          id: '00000000-0000-0000-0000-000000000000',
          title: 'Here are your most recent, open tickets.',
          type: 'text',
          workflowStep: 'Complete'
        }
      }).valid).to.eql(true)
      expect(index.validateBotObject({
        itemDetails: {
          id: '00000000-0000-0000-0000-000000000000',
          title: 'ServiceNow ticket: TKT0010001',
          subtitle: 'Open',
          description: 'Via connector action',
          workflowStep: 'Complete',
          url: {
            href: 'https://dev15329.service-now.com/task.do?sys_id=f8cfe469db153300ea92eb41ca96198b'
          },
          type: 'status',
          tabularData: [
            {
              data: [
                {
                  title: 'impact',
                  shortDescription: '3'
                },
                {
                  title: 'status',
                  shortDescription: 'Open'
                },
                {
                  title: 'shortDescription',
                  shortDescription: 'Via connector action'
                },
                {
                  title: 'ticketNo',
                  shortDescription: 'TKT0010001',
                  url: {
                    href: 'https://dev15329.service-now.com/task.do?sys_id=f8cfe469db153300ea92eb41ca96198b'
                  }
                }
              ]
            }
          ]
        }
      }).valid).to.eql(true)
    })

    it('should return false for an invalid bot object', () => {
      expect(index.validateBotObject({
        itemDetails: {
          id: 12345,
          title: 'Here are your most recent, open tickets.',
          type: 'text',
          workflowStep: 'Complete'
        }
      }).valid).to.eql(false)
      expect(index.validateBotObject({
        itemDetails: {
          id: 12345,
          title: 'ServiceNow ticket: TKT0010001',
          subtitle: 'Open',
          description: 'Via connector action',
          workflowStep: 'Complete',
          url: {
            href: 'test'
          },
          type: 'status',
          tabularData: [
            {
              data: [
                {
                  title: 'impact',
                  shortDescription: '3'
                },
                {
                  title: 'status',
                  shortDescription: 'Open'
                },
                {
                  title: 'shortDescription',
                  shortDescription: 'Via connector action'
                },
                {
                  title: 'ticketNo',
                  shortDescription: 'TKT0010001',
                  url: {
                    href: 'test'
                  }
                }
              ]
            }
          ]
        }
      }).valid).to.eql(false)
    })
  })
})

const mockNext = () => {
  isNextCalled = true
}
