'use strict';

const Joi = require('joi')
const UdaruServer = require('@nearform/udaru-hapi-server')

// In production, this would be persisted in the data store, but using an
// in-memory array is expedient for this example.
const products = [ 'product1', 'product2', 'product3' ]

UdaruServer.route({
  method: 'DELETE',
  path: '/products',
  handler: (request, reply) => {
    products.length = 0 // empty the products array
    reply(products)
  },
  config: {
    plugins: {
      auth: {
        action: 'org1:action:delete',
        resource: '/products'
      }
    }
  }
})

UdaruServer.route({
  method: 'GET',
  path: '/products',
  handler: (request, reply) => reply(products),
  config: {
    plugins: {
      auth: {
        action: 'org1:action:list',
        resource: '/products'
      }
    }
  }
})

UdaruServer.route({
  method: 'POST',
  path: '/products',
  handler: (request, reply) => {
    products.push(...request.payload)
    reply(products)
  },
  config: {
    plugins: {
      auth: {
        action: 'org1:action:create',
        resource: '/products'
      }
    },
    validate: {
      payload: Joi.array().items(Joi.string().min(1))
    }
  }
})

UdaruServer.route({
  method: 'PUT',
  path: '/products',
  handler: (request, reply) => {
    for (let i = 0; i < products.length; i++) {
      products[i] += request.payload
    }
    reply(products)
  },
  config: {
    plugins: {
      auth: {
        action: 'org1:action:append',
        resource: '/products'
      }
    },
    validate: {
      payload: Joi.string().min(1)
    }
  }
})

UdaruServer.route({
  method: 'POST',
  path: '/products/reverse',
  handler: (request, reply) => {
    for (let i = 0; i < products.length; i++) {
      products[i] = products[i].split('').reverse().join('')
    }
    reply(products)
  },
  config: {
    plugins: {
      auth: {
        action: 'org1:action:reverse',
        resource: '/products'
      }
    }
  }
})
