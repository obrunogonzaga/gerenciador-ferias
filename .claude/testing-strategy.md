## 🧪 Estratégia de Testes

### Frontend
- **Unit Tests**: Jest + Testing Library
- **Integration Tests**: Cypress
- **E2E Tests**: Playwright
- **Visual Regression**: Chromatic

### Backend
- **Unit Tests**: Testify
- **Integration Tests**: Ginkgo
- **API Tests**: Postman/Newman
- **Performance Tests**: k6

## 📋 Critérios de Aceitação

### Funcionário deve poder:
- [x] Fazer login e ver seu dashboard
- [x] Solicitar férias informando período e motivo
- [x] Ver status de suas solicitações
- [x] Receber notificações de aprovação/rejeição
- [x] Consultar histórico de férias

### Gestor deve poder:
- [x] Ver todas as solicitações da sua equipe
- [x] Aprovar ou rejeitar com comentários
- [x] Ver calendário da equipe
- [x] Receber notificações de novas solicitações
- [x] Gerar relatórios básicos

### Sistema deve:
- [x] Validar regras de negócio (mínimo de dias, conflitos)
- [x] Enviar notificações por email
- [x] Ser responsivo para dispositivos móveis
- [x] Manter logs de auditoria
- [x] Ter tempo de resposta < 2 segundos