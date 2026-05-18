import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Self-Service Portal API',
      version: '1.0.0',
      description: 'Production API for auth, cases, knowledge, community, and users',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    paths: {
      '/auth/register': { post: { summary: 'Register user', responses: { '201': { description: 'Created' } } } },
      '/auth/login': { post: { summary: 'Login user', responses: { '200': { description: 'Success' } } } },
      '/auth/logout': { post: { summary: 'Logout user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/auth/me': { get: { summary: 'Current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/auth/forgot-password': { post: { summary: 'Forgot password', responses: { '200': { description: 'Success' } } } },
      '/auth/reset-password': { post: { summary: 'Reset password', responses: { '200': { description: 'Success' } } } },
      '/cases': {
        get: { summary: 'List cases', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } },
        post: { summary: 'Create case', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
      },
      '/cases/{id}': {
        get: { summary: 'Get case', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } },
        put: { summary: 'Update case', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } },
        delete: { summary: 'Delete case', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } },
      },
      '/cases/{id}/comments': { post: { summary: 'Add case comment', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } } },
      '/knowledge': {
        get: { summary: 'List articles', responses: { '200': { description: 'Success' } } },
        post: { summary: 'Create article', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
      },
      '/knowledge/{id}': {
        get: { summary: 'Get article', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } },
        put: { summary: 'Update article', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } },
      },
      '/knowledge/{id}/helpful': { post: { summary: 'Vote helpful', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } } },
      '/community': {
        get: { summary: 'List posts', responses: { '200': { description: 'Success' } } },
        post: { summary: 'Create post', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
      },
      '/community/{id}': { get: { summary: 'Get post', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } } },
      '/community/{id}/comments': { post: { summary: 'Add comment', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } } },
      '/community/{id}/upvote': { put: { summary: 'Toggle upvote', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } } },
      '/community/{id}/comments/{commentId}/answer': { put: { summary: 'Mark answer', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } } },
      '/users/profile': {
        get: { summary: 'Get profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } },
        put: { summary: 'Update profile', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } },
      },
      '/users/change-password': { put: { summary: 'Change password', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/users': { get: { summary: 'List users', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Success' } } } },
      '/users/{id}/role': { put: { summary: 'Update role', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Success' } } } },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
