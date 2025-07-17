## 🗃️ Estrutura do Banco de Dados

### Entidades Principais

#### Users
```sql
- id (UUID)
- email (string, unique)
- name (string)
- role (enum: employee, manager, admin)
- department_id (UUID)
- manager_id (UUID, nullable)
- vacation_balance (integer)
- created_at, updated_at
```

#### VacationRequests
```sql
- id (UUID)
- user_id (UUID)
- start_date (date)
- end_date (date)
- business_days (integer)
- reason (text)
- emergency_contact (string)
- status (enum: pending, approved, rejected, cancelled)
- approved_by (UUID, nullable)
- approved_at (timestamp, nullable)
- rejection_reason (text, nullable)
- created_at, updated_at
```

#### Notifications
```sql
- id (UUID)
- user_id (UUID)
- type (enum: request, approval, rejection, reminder)
- title (string)
- message (text)
- read (boolean)
- created_at
```