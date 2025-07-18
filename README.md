# Sistema de Gerenciamento de Férias

Sistema web para gerenciamento de solicitações de férias, desenvolvido com Next.js e Go.

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **Zustand** - Gerenciamento de estado
- **React Hook Form + Zod** - Formulários e validação

### Backend
- **Go (Golang)** - Linguagem principal
- **Gin** - Framework web
- **GORM** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+
- Go 1.21+

## 🛠️ Instalação e Execução

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd gerenciador-ferias
```

2. Copie o arquivo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie o banco de dados:
```bash
docker-compose up -d postgres
```

4. Instale as dependências do backend:
```bash
cd backend
go mod download
```

5. Instale as dependências do frontend:
```bash
cd ../frontend
npm install
```

6. Execute o sistema completo:
```bash
# Na raiz do projeto
docker-compose up
```

O sistema estará disponível em:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 🏗️ Estrutura do Projeto

```
gerenciador-ferias/
├── frontend/              # Aplicação Next.js
│   ├── app/              # App Router pages
│   ├── components/       # Componentes React
│   └── lib/             # Utilitários
├── backend/              # API Go
│   ├── cmd/api/         # Entry point
│   ├── internal/        # Código interno
│   │   ├── config/      # Configurações
│   │   ├── database/    # Conexão BD
│   │   ├── handlers/    # HTTP handlers
│   │   ├── middleware/  # Middlewares
│   │   ├── models/      # Modelos GORM
│   │   └── services/    # Lógica de negócio
│   └── migrations/      # Migrações SQL
└── docker-compose.yml   # Configuração Docker
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. As rotas protegidas requerem o token no header:
```
Authorization: Bearer [token]
```

## 📝 Funcionalidades Implementadas

### MVP - Fase 1
- [x] Configuração do ambiente de desenvolvimento
- [x] Estrutura base do backend Go
- [x] Estrutura base do frontend Next.js
- [x] Banco de dados PostgreSQL com Docker
- [x] Modelos de dados (User, VacationRequest, Notification)
- [x] Página de login
- [x] Dashboard com estatísticas

### Em Desenvolvimento
- [ ] Sistema de autenticação JWT completo
- [ ] Formulário de solicitação de férias
- [ ] APIs de gestão de férias
- [ ] Sistema de notificações
- [ ] Dashboard do gestor

## 🚦 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

### Férias
- `GET /api/vacation-requests` - Listar solicitações
- `POST /api/vacation-requests` - Criar solicitação
- `PUT /api/vacation-requests/:id` - Atualizar solicitação
- `DELETE /api/vacation-requests/:id` - Cancelar solicitação

### Gestor
- `GET /api/manager/pending-requests` - Solicitações pendentes
- `PUT /api/vacation-requests/:id/approve` - Aprovar
- `PUT /api/vacation-requests/:id/reject` - Rejeitar

## 🎨 Design System

O sistema utiliza um design moderno com:
- Cores principais: Purple (#667eea) e Indigo (#764ba2)
- Tipografia: Inter
- Componentes baseados no shadcn/ui
- Layout responsivo mobile-first

## 📄 Licença

Este projeto está sob a licença MIT.