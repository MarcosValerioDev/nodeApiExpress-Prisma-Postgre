# node1 — API REST Node.js + PostgreSQL

API REST com **Express 5**, **Prisma 7** e **PostgreSQL**, com autenticação JWT e CRUD de usuários.

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 24 + TypeScript |
| HTTP | Express 5 |
| Banco | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Validação | class-validator / class-transformer (DTOs de body) e Zod (env, params, query) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Segurança | Helmet, CORS, express-rate-limit |
| Docs | Swagger UI (OpenAPI 3) |

## Requisitos

- Node.js 20+ (testado no 24)
- PostgreSQL rodando localmente

## Instalação

```bash
npm install                # também roda `prisma generate` (postinstall)
cp .env.example .env       # ajuste DATABASE_URL e JWT_SECRET
npm run prisma:migrate     # cria as tabelas no banco
npm run dev                # http://localhost:3000
```

Gerar um `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Variáveis de ambiente

Validadas com Zod na inicialização. Se alguma estiver inválida, o servidor não sobe.

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | — | String de conexão do PostgreSQL (**obrigatória**) |
| `JWT_SECRET` | — | Segredo do JWT, mínimo 32 caracteres (**obrigatória**) |
| `JWT_EXPIRES_IN` | `1d` | Validade do token (`15m`, `1h`, `7d`...) |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `PORT` | `3000` | Porta HTTP |
| `CORS_ORIGIN` | `*` | Origens permitidas, separadas por vírgula |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Janela do rate limit (15 min) |
| `RATE_LIMIT_MAX` | `100` | Requisições por IP por janela (global) |
| `AUTH_RATE_LIMIT_MAX` | `10` | Tentativas de login/cadastro por IP por janela |

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor com hot reload (tsx watch) |
| `npm run build` | Compila para `dist/` |
| `npm start` | Roda o build (`dist/server.js`) |
| `npm run typecheck` | Checagem de tipos sem gerar arquivos |
| `npm run prisma:migrate` | Cria/aplica migrações em desenvolvimento |
| `npm run prisma:deploy` | Aplica migrações em produção |
| `npm run prisma:generate` | Regenera o Prisma Client |
| `npm run prisma:studio` | Abre o Prisma Studio |

## Documentação (Swagger)

Com o servidor rodando (fora de `production`):

- **UI:** http://localhost:3000/api/docs
- **JSON OpenAPI:** http://localhost:3000/api/docs.json

Para testar rotas protegidas: faça login em `POST /auth/login`, copie o `accessToken`, clique em **Authorize** e cole o token.

## Endpoints

Prefixo: `/api`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | — | Status da API |
| POST | `/auth/login` | — | Login, retorna o JWT |
| POST | `/users` | — | Cadastro de usuário |
| GET | `/users?page=1&limit=10&search=` | JWT | Lista paginada |
| GET | `/users/me` | JWT | Usuário autenticado |
| GET | `/users/:id` | JWT | Busca por id |
| PATCH | `/users/:id` | JWT (só o próprio) | Atualiza nome/email/senha |
| DELETE | `/users/:id` | JWT (só o próprio) | Remove o usuário |

### Exemplos

```bash
# Cadastro
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Marcos","email":"marcos@mail.com","password":"senha1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcos@mail.com","password":"senha1234"}'

# Rota protegida
curl http://localhost:3000/api/users/me -H "Authorization: Bearer <TOKEN>"
```

### Formato de erro

```json
{
  "message": "Dados inválidos",
  "details": { "email": ["email inválido"] }
}
```

| Status | Quando |
|---|---|
| 400 | Body/params/query inválidos ou JSON malformado |
| 401 | Token ausente/inválido ou credenciais erradas |
| 403 | Tentativa de alterar/remover outro usuário |
| 404 | Recurso ou rota não encontrados |
| 409 | Email já cadastrado |
| 429 | Rate limit excedido |

## Regras de validação (usuário)

- `name`: opcional, 2–100 caracteres
- `email`: email válido, salvo em minúsculas
- `password`: 8–72 caracteres, com letras e números
- Campos fora do DTO são rejeitados (`whitelist` + `forbidNonWhitelisted`)
- A resposta nunca inclui `passwordHash`

## Estrutura

```
prisma/
  schema.prisma          models
  migrations/            migrações SQL
src/
  server.ts              bootstrap + graceful shutdown
  app.ts                 middlewares globais, rotas, swagger, erros
  routes.ts              agrega os routers dos módulos
  config/env.ts          variáveis de ambiente (Zod)
  docs/swagger.ts        especificação OpenAPI
  lib/prisma.ts          Prisma Client
  errors/AppError.ts     erro de domínio com status HTTP
  middlewares/           auth (JWT), validate, rateLimit, errorHandler
  modules/
    auth/                login
    users/               CRUD de usuários
      dto/               DTOs de entrada (class-validator) e saída
      users.schemas.ts   Zod para params/query
      users.service.ts   regras de negócio
      users.controller.ts
      users.routes.ts
  generated/prisma/      Prisma Client gerado (não versionado)
```

## Licença

ISC — MarcosDev
