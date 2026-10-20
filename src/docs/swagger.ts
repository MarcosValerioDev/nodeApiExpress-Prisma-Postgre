import { env } from '../config/env';

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'node1 API',
    version: '1.0.0',
    description: 'API REST com Express 5, Prisma 7 e PostgreSQL. Autenticação via JWT (Bearer).',
  },
  servers: [{ url: `http://localhost:${env.PORT}/api`, description: 'Local' }],
  tags: [
    { name: 'Health', description: 'Status da API' },
    { name: 'Auth', description: 'Autenticação' },
    { name: 'Users', description: 'CRUD de usuários' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Dados inválidos' },
          details: {
            type: 'object',
            additionalProperties: { type: 'array', items: { type: 'string' } },
            example: { email: ['email inválido'] },
          },
        },
      },
      CreateUserDto: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Marcos' },
          email: { type: 'string', format: 'email', maxLength: 255, example: 'marcos@mail.com' },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 72,
            description: 'Deve conter letras e números',
            example: 'senha1234',
          },
        },
      },
      UpdateUserDto: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email', maxLength: 255 },
          password: { type: 'string', minLength: 8, maxLength: 72, description: 'Deve conter letras e números' },
        },
      },
      LoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'marcos@mail.com' },
          password: { type: 'string', example: 'senha1234' },
        },
      },
      UserResponseDto: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
          user: { $ref: '#/components/schemas/UserResponseDto' },
        },
      },
      PaginatedUsers: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              total: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 1 },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica se a API está no ar',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login — retorna o JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginDto' } } },
        },
        responses: {
          200: {
            description: 'Autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          400: errorResponse('Dados inválidos'),
          401: errorResponse('Credenciais inválidas'),
          429: errorResponse('Muitas tentativas'),
        },
      },
    },
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Cadastra um usuário (público)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserDto' } } },
        },
        responses: {
          201: {
            description: 'Criado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponseDto' } } },
          },
          400: errorResponse('Dados inválidos'),
          409: errorResponse('Email já cadastrado'),
          429: errorResponse('Muitas tentativas'),
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Lista usuários (paginado)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', description: 'Busca por nome ou email', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedUsers' } } },
          },
          400: errorResponse('Query inválida'),
          401: errorResponse('Não autenticado'),
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponseDto' } } },
          },
          401: errorResponse('Não autenticado'),
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Busca usuário por id',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponseDto' } } },
          },
          400: errorResponse('id inválido'),
          401: errorResponse('Não autenticado'),
          404: errorResponse('Usuário não encontrado'),
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Atualiza o próprio usuário',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserDto' } } },
        },
        responses: {
          200: {
            description: 'Atualizado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponseDto' } } },
          },
          400: errorResponse('Dados inválidos'),
          401: errorResponse('Não autenticado'),
          403: errorResponse('Acesso negado'),
          404: errorResponse('Usuário não encontrado'),
          409: errorResponse('Email já cadastrado'),
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Remove o próprio usuário',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          204: { description: 'Removido' },
          400: errorResponse('id inválido'),
          401: errorResponse('Não autenticado'),
          403: errorResponse('Acesso negado'),
          404: errorResponse('Usuário não encontrado'),
        },
      },
    },
  },
};
