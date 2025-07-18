# Guia de Testes - Sistema de Gerenciamento de Férias

## 🚀 Como Executar o Sistema

### 1. Iniciar os Serviços

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Backend API na porta 8080
- Frontend na porta 3000

### 2. Acessar o Sistema

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health

## 👥 Usuários de Teste

O sistema já vem com usuários pré-cadastrados:

### Admin
- **Email:** admin@empresa.com
- **Senha:** admin123
- **Acesso:** Todas as funcionalidades

### Gestor
- **Email:** maria.silva@empresa.com  
- **Senha:** manager123
- **Acesso:** Aprovar/rejeitar solicitações da equipe

### Funcionários
- **Email:** joao.santos@empresa.com
- **Senha:** 123456
- **Saldo:** 22 dias

- **Email:** ana.oliveira@empresa.com
- **Senha:** 123456  
- **Saldo:** 28 dias

- **Email:** carlos.pereira@empresa.com
- **Senha:** 123456
- **Saldo:** 15 dias

## 🧪 Cenários de Teste

### 1. Login e Autenticação
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Logout
- [ ] Verificar tokens JWT

### 2. Dashboard do Funcionário
- [ ] Visualizar saldo de férias
- [ ] Ver estatísticas (dias disponíveis, utilizados, pendentes)
- [ ] Acessar ações rápidas

### 3. Solicitação de Férias
- [ ] Criar nova solicitação
- [ ] Validar datas (mínimo 15 dias antecedência)
- [ ] Validar período mínimo (5 dias úteis)
- [ ] Calcular dias úteis automaticamente
- [ ] Salvar rascunho
- [ ] Enviar solicitação

### 4. Listagem de Solicitações
- [ ] Ver todas as solicitações
- [ ] Filtrar por status
- [ ] Buscar por motivo/contato
- [ ] Visualizar detalhes
- [ ] Editar solicitações pendentes
- [ ] Cancelar solicitações pendentes

### 5. Histórico
- [ ] Ver histórico completo
- [ ] Filtrar por ano
- [ ] Exportar para CSV
- [ ] Ver estatísticas anuais

### 6. Notificações
- [ ] Ver notificações não lidas
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Filtrar por tipo

## 📝 APIs Disponíveis

### Autenticação
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao.santos@empresa.com","password":"123456"}'

# Usuário atual (requer token)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Solicitações de Férias
```bash
# Listar solicitações (requer token)
curl -X GET http://localhost:8080/api/vacation-requests \
  -H "Authorization: Bearer YOUR_TOKEN"

# Criar solicitação (requer token)
curl -X POST http://localhost:8080/api/vacation-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2025-08-15T00:00:00Z",
    "end_date": "2025-08-25T00:00:00Z",
    "reason": "Viagem em família",
    "emergency_contact": "Maria Santos - (11) 99999-9999"
  }'
```

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar logs
docker-compose logs backend

# Entrar no container
docker-compose exec backend sh
```

### Frontend não carrega
```bash
# Verificar logs
docker-compose logs frontend

# Reconstruir se necessário
docker-compose up --build frontend
```

### Banco de dados
```bash
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U vacation_user -d vacation_management

# Ver tabelas
\dt

# Ver usuários
SELECT email, name, role FROM users;
```

## ✅ Funcionalidades Implementadas

### Backend
- [x] Autenticação JWT completa
- [x] CRUD de solicitações de férias
- [x] Validações de regras de negócio (CLT)
- [x] Middleware de autenticação e autorização
- [x] Seeding de dados de teste
- [x] Cálculo automático de dias úteis

### Frontend  
- [x] Sistema de login responsivo
- [x] Dashboard com estatísticas
- [x] Formulário de solicitação com validações
- [x] Listagem e filtros de solicitações
- [x] Histórico com exportação CSV
- [x] Sistema de notificações
- [x] Design baseado nos wireframes

## 🔜 Próximos Passos

- [ ] Dashboard do gestor com aprovações
- [ ] Sistema de notificações em tempo real
- [ ] Integração frontend-backend
- [ ] Testes automatizados
- [ ] Deploy em produção