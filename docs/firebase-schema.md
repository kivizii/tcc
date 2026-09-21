# Schema Firebase — Zela

## Coleções

### `users/{userId}`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `email` | string | E-mail da usuária |
| `displayName` | string | Nome exibido |
| `createdAt` | timestamp | Data de cadastro |

### `users/{userId}/contacts/{contactId}`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` | string | Nome do contato |
| `phone` | string | Telefone |
| `type` | string | `familia`, `amiga`, `vizinha`, `outro` |
| `notifyOnSos` | boolean | Recebe alerta no SOS |
| `createdAt` | timestamp | Data de cadastro |

### `users/{userId}/preferences/{docId}`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `quickExitEnabled` | boolean | Saída rápida ativa |
| `locationShareMinutes` | number | Minutos de compartilhamento de localização |
| `updatedAt` | timestamp | Última atualização |

### `users/{userId}/sos_events/{eventId}`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `triggeredAt` | timestamp | Momento do acionamento |
| `latitude` | number | Latitude (opcional) |
| `longitude` | number | Longitude (opcional) |
| `status` | string | `active`, `cancelled`, `expired` |
| `notifiedContacts` | array | IDs dos contatos notificados |
| `expiresAt` | timestamp | Expiração da localização |

## Regras de acesso

- Cada usuária só lê e escreve seus próprios documentos (`firebase/firestore.rules`).
- Mínimo de dados pessoais coletado (LGPD).

## Modo demonstração

Sem credenciais Firebase configuradas, o app usa `localStorage` com prefixo `zela_demo_`.
