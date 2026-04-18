# Ekyte MCP Server

Servidor MCP (Model Context Protocol) que permite ao Claude e outras IAs interagir com a plataforma Ekyte para gestão de tarefas e apontamento de horas.

Toda a API usada é a **interna** (`https://api.ekyte.com/api/...`), autenticada por **JWT Bearer** (mesmo token que o front `app.ekyte.com` envia). Não usa a API pública `/v1.x`.

## Tools Disponíveis

### Leitura (read-only)

| Tool | Descrição |
|------|-----------|
| `ekyte_list_workspaces` | Lista workspaces (clientes) da empresa |
| `ekyte_list_users` | Lista usuários/membros (com UUID) |
| `ekyte_list_task_types` | Lista tipos de tarefa (template + workflow_id) |
| `ekyte_list_phases` | Lista fases de um workflow (para descobrir `phase_id`) |
| `ekyte_list_tasks` | Lista tarefas com filtros (workspace, status, datas, etc.) |
| `ekyte_get_task` | Detalhes de uma tarefa específica |
| `ekyte_list_time_entries` | Lista apontamentos de horas |

### Escrita (destrutivo — pede confirmação)

| Tool | Descrição |
|------|-----------|
| `ekyte_create_task` | Cria nova tarefa |
| `ekyte_update_task` | Edita tarefa existente (JSON Patch) |
| `ekyte_complete_task` | Marca tarefa como concluída |
| `ekyte_add_task_comment` | Adiciona comentário na timeline |
| `ekyte_create_time_entry_with_task` | Aponta horas em tarefa específica |
| `ekyte_create_time_entry_without_task` | Aponta horas avulso |
| `ekyte_delete_time_entry` | Remove apontamento |

## Fluxo recomendado para criar uma tarefa

1. `ekyte_list_workspaces` → pegar `workspace_id`
2. `ekyte_list_task_types` → pegar `task_type_id` (e o `workflow_id` associado)
3. `ekyte_list_phases` com o `workflow_id` → pegar `phase_id` (normalmente a fase inicial)
4. `ekyte_list_users` → pegar `executor_id` (UUID)
5. `ekyte_create_task` com os 4 IDs + datas + tempo estimado

## Configuração

### Variáveis de ambiente

```env
EKYTE_BEARER_TOKEN=seu_jwt_aqui
EKYTE_COMPANY_ID=9312
TRANSPORT=http   # ou "stdio" para uso local
PORT=3000
```

### Onde pegar cada valor

- **EKYTE_BEARER_TOKEN** — Abra `app.ekyte.com` no navegador → DevTools → Network → qualquer request para `api.ekyte.com` → copiar header `Authorization: Bearer ...`. O JWT tem validade de ~6 meses; troque quando expirar.
- **EKYTE_COMPANY_ID** — Visível na URL de qualquer chamada de API do Ekyte: `/api/companies/XXXX/...`. Para a V4 Ferraz Piai: `9312`.

## Deploy no EasyPanel

1. Subir o código para Git (GitHub, GitLab).
2. No EasyPanel: novo serviço → **App** → método **Docker** → apontar para o repositório.
3. Configurar as variáveis de ambiente (seção acima).
4. Expor porta `3000` com HTTPS.
5. Endpoint final: `https://seu-servico.seu-dominio.com/mcp`

Verificar o deploy:

```bash
curl https://seu-servico.seu-dominio.com/health
# {"status":"ok","server":"ekyte-mcp-server","version":"1.0.0"}
```

## Conexão com o Claude

### Claude Code (CLI) — transporte HTTP remoto

No diretório do projeto onde você vai usar a MCP, crie `.mcp.json`:

```json
{
  "mcpServers": {
    "ekyte": {
      "type": "http",
      "url": "https://ekyte-mcp.seu-dominio.com/mcp"
    }
  }
}
```

Ou no escopo de usuário, via CLI:

```bash
claude mcp add --transport http ekyte https://ekyte-mcp.seu-dominio.com/mcp --scope user
```

Teste: `claude mcp list` deve mostrar `ekyte ✓ connected`.

### Claude Desktop — transporte stdio local

Rode o servidor em modo `stdio` (sem HTTP). No `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ekyte": {
      "command": "node",
      "args": ["C:/caminho/para/ekyte-mcp-server/dist/index.js"],
      "env": {
        "EKYTE_BEARER_TOKEN": "seu_jwt",
        "EKYTE_COMPANY_ID": "9312",
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### Claude Desktop — transporte HTTP remoto (com MCP remoto instalado no EasyPanel)

```json
{
  "mcpServers": {
    "ekyte": {
      "url": "https://ekyte-mcp.seu-dominio.com/mcp"
    }
  }
}
```

## Desenvolvimento local

```bash
npm install
npm run build

# Modo stdio (default) — para Claude Desktop
EKYTE_BEARER_TOKEN=xxx EKYTE_COMPANY_ID=9312 npm start

# Modo HTTP — simula o deploy EasyPanel
EKYTE_BEARER_TOKEN=xxx EKYTE_COMPANY_ID=9312 TRANSPORT=http npm start

# Hot reload
npm run dev
```

Smoke test rápido (HTTP):

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Arquitetura

```
src/
├── index.ts               # Entry point (stdio + HTTP streamable)
├── constants.ts           # Base URL, timeouts, limites
├── types.ts               # Tipos do Ekyte
├── services/
│   └── ekyte-client.ts    # Cliente axios + helpers companyUrl / companyV2Url
├── schemas/
│   ├── common.ts          # Schemas Zod compartilhados
│   ├── task.ts            # Schemas de tarefas e fases
│   └── time-entry.ts      # Schemas de apontamentos
└── tools/
    ├── read-tools.ts      # Tools de leitura
    └── write-tools.ts     # Tools de escrita
```

## Endpoints que a MCP usa (referência)

Todos com `Authorization: Bearer <jwt>` e base `https://api.ekyte.com`:

| Método | Path | Tool |
|--------|------|------|
| GET | `/api/companies/{id}/workspaces` | list_workspaces |
| GET | `/api/companies/{id}/users` | list_users |
| GET | `/api/companies/{id}/task-types` | list_task_types |
| GET | `/api/companies/{id}/workflows/{wf}` | list_phases (retorna `phases[]`) |
| GET | `/api/v2/companies/{id}/ctc-tasks` | list_tasks |
| GET | `/api/v2/companies/{id}/ctc-tasks/{task}` | get_task |
| POST | `/api/companies/{id}/ctc-tasks` | create_task |
| PATCH | `/api/v2/companies/{id}/ctc-tasks/{task}` | update_task / complete_task |
| POST | `/api/v2/companies/{id}/ctc-tasks/{task}/comments` | add_task_comment |
| GET | `/api/companies/{id}/time-trackings/data/details` | list_time_entries |
| POST | `/api/companies/{id}/workspaces/{ws}/time-trackings` | create_time_entry_* |
| PATCH | `/api/companies/{id}/workspaces/{ws}/time-trackings/{id}` | delete_time_entry |
