# Ekyte MCP Server

Servidor MCP (Model Context Protocol) que permite ao Claude e outras IAs interagir com a plataforma Ekyte para gestão de tarefas e apontamento de horas.

## Tools Disponíveis

### Leitura (Read-only)
| Tool | Descrição |
|------|-----------|
| `ekyte_list_workspaces` | Lista workspaces da empresa |
| `ekyte_list_users` | Lista usuários/membros |
| `ekyte_list_task_types` | Lista tipos de tarefa |
| `ekyte_list_tasks` | Lista tarefas com filtros (workspace, status, datas, etc.) |
| `ekyte_get_task` | Detalhes completos de uma tarefa |

### Escrita (Requer confirmação)
| Tool | Descrição |
|------|-----------|
| `ekyte_create_task` | Cria nova tarefa |
| `ekyte_create_time_entry_with_task` | Aponta horas em tarefa específica |
| `ekyte_create_time_entry_without_task` | Aponta horas avulso (sem tarefa) |

### Pendentes (aguardando endpoints)
| Tool | Descrição |
|------|-----------|
| `ekyte_update_task` | Editar tarefa existente |
| `ekyte_complete_task` | Concluir tarefa |
| `ekyte_list_time_entries` | Listar apontamentos de horas |
| `ekyte_delete_time_entry` | Remover apontamento |

## Configuração

### Variáveis de Ambiente

```env
EKYTE_API_KEY=sua_api_key_aqui
EKYTE_BEARER_TOKEN=seu_bearer_token_jwt
EKYTE_COMPANY_ID=9312
TRANSPORT=http
PORT=3000
```

### Onde encontrar cada valor

- **EKYTE_API_KEY**: Ekyte → Minha Empresa → API Key
- **EKYTE_BEARER_TOKEN**: Token JWT admin (capturado via DevTools do navegador)
- **EKYTE_COMPANY_ID**: ID numérico da empresa (visível na URL do Ekyte: `api.ekyte.com/api/companies/XXXX/...`)

## Deploy no EasyPanel

### 1. Subir o código para um repositório Git (GitHub, GitLab, etc.)

### 2. No EasyPanel:
1. Criar novo serviço → **App**
2. Selecionar **Docker** como método de build
3. Conectar ao repositório Git
4. Configurar variáveis de ambiente (seção acima)
5. Expor porta 3000 com HTTPS
6. O endpoint será: `https://seu-servico.seu-dominio.com/mcp`

### 3. Verificar o deploy:
```bash
curl https://seu-servico.seu-dominio.com/health
# Deve retornar: {"status":"ok","server":"ekyte-mcp-server","version":"1.0.0"}
```

## Configuração no Claude Desktop / Claude Code

Adicione ao arquivo de configuração do MCP:

```json
{
  "mcpServers": {
    "ekyte": {
      "url": "https://seu-servico.seu-dominio.com/mcp"
    }
  }
}
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Build
npm run build

# Executar (modo stdio)
EKYTE_API_KEY=xxx EKYTE_BEARER_TOKEN=xxx EKYTE_COMPANY_ID=9312 npm start

# Executar (modo HTTP)
EKYTE_API_KEY=xxx EKYTE_BEARER_TOKEN=xxx EKYTE_COMPANY_ID=9312 TRANSPORT=http npm start

# Desenvolvimento com hot reload
npm run dev
```

## Arquitetura

```
src/
├── index.ts              # Entry point (stdio + HTTP)
├── constants.ts          # Constantes e configurações
├── types.ts              # Interfaces TypeScript
├── services/
│   └── ekyte-client.ts   # Cliente HTTP (apiKey + Bearer)
├── schemas/
│   ├── common.ts         # Schemas Zod compartilhados
│   ├── task.ts           # Schemas de tarefas
│   └── time-entry.ts     # Schemas de apontamentos
└── tools/
    ├── read-tools.ts     # Tools de leitura
    └── write-tools.ts    # Tools de escrita
```
