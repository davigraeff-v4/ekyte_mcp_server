# PRD: Instalacao do MCP Server do Ekyte

> Jogue este arquivo no chat do Claude Code e diga: "Executa este PRD de instalacao"
> Ele vai instalar e conectar o MCP do Ekyte, permitindo gerenciar tarefas e horas direto do chat.

---

## O Que Esse MCP Faz

Com o MCP instalado, o Claude Code consegue operar o Ekyte diretamente:
- **Criar e atualizar tarefas** com fases e responsaveis
- **Apontar horas** automaticamente
- **Listar workspaces, usuarios, fases** sem sair do chat
- **Completar tarefas e adicionar comentarios** com um comando

Sao **16 tools** — 8 de leitura, 8 de escrita.

## Pre-requisitos

- **Claude Code** instalado
- **Conta no Ekyte** com acesso a `app.ekyte.com`
- **Node.js >= 18** (apenas para instalacao local)

---

## PRIMEIRA PERGUNTA: Qual modo de instalacao?

> 🔴 **ANTES DE EXECUTAR QUALQUER PASSO, pergunte ao usuario:**
>
> **"Voce quer instalar o MCP do Ekyte de qual forma?"**
>
> | Opcao | Quando usar | O que precisa |
> |-------|-------------|---------------|
> | **A) Local** | Voce tem o repositorio clonado e quer rodar o servidor na sua maquina | Node.js >= 18, Bearer Token, Company ID |
> | **B) Remoto** | Ja existe um servidor MCP hospedado (EasyPanel, cloud, etc.) | Apenas a URL do servidor |
>
> - Se o usuario escolher **A (Local)**: execute os Passos 1 → 2 → 3 → 4 → 5 → 6
> - Se o usuario escolher **B (Remoto)**: execute os Passos 1 → 2 → 3 → 4
>
> **Em ambos os caminhos, o ultimo passo instala a skill `ekyte` globalmente em `~/.claude/skills/ekyte/`** — e o que ensina o Claude a nao chutar IDs, nao inventar datas e sempre confirmar antes de criar/completar/deletar.

---

## SEGUNDA PERGUNTA: Escopo da instalacao

> 🔴 **Apos o usuario escolher o modo (Local ou Remoto), pergunte:**
>
> **"Quer instalar globalmente (disponivel em qualquer projeto) ou apenas neste repositorio?"**
>
> | Escopo | O que faz | Onde salva |
> |--------|-----------|------------|
> | **Global** | MCP disponivel em qualquer projeto do Claude Code | Configuracao do usuario (`-s user`) |
> | **Projeto** | MCP disponivel apenas neste repositorio | Arquivo `.mcp.json` na raiz do projeto |
>
> A resposta do usuario define como o Passo 3 (Local) ou Passo 1 (Remoto) sera executado.
> Guarde a escolha para usar na hora do registro.

---

## Caminho A: Instalacao Local

### 0. Verificar Repositorio

> 🔴 **ANTES DE TUDO, verifique se o usuario ja esta dentro do repositorio do MCP server.**
>
> Ha grande chance de a pessoa ja estar no repo `ekyte_mcp_server` — afinal, este PRD esta dentro dele.
>
> **Checklist automatica (execute silenciosamente):**
> 1. Verifique se existe `package.json` no diretorio atual com o nome do projeto MCP
> 2. Verifique se existe `.env` com `EKYTE_BEARER_TOKEN` e `EKYTE_COMPANY_ID` preenchidos
> 3. Verifique se `dist/index.js` ja existe (build ja feito)
>
> **Resultados:**
> - Se `.env` ja tem as credenciais preenchidas → **pule o Passo 1** e avise o usuario
> - Se `dist/index.js` ja existe → **pule o Passo 2** e avise o usuario
> - Se tudo ja esta pronto → va direto para o **Passo 3** (registrar no Claude Code)
>
> Informe ao usuario o que foi detectado e quais passos serao pulados.

---

### 1. Obter Credenciais do Ekyte

> 🔴 **Sem essas credenciais o servidor nao inicia.** Pegue os dois valores antes de continuar.
> **Pule este passo se o Passo 0 detectou `.env` com credenciais preenchidas.**

**Bearer Token (JWT):**

1. Abra `https://app.ekyte.com` no navegador e faca login
2. Abra DevTools (`F12` ou `Cmd+Option+I`)
3. Va na aba **Network**
4. Clique em qualquer pagina do Ekyte para gerar requests
5. Clique em qualquer request para `api.ekyte.com`
6. Copie o header `Authorization: Bearer eyJ...` — o token e tudo depois de "Bearer "

> **Validade:** O JWT dura ~6 meses. Quando expirar, o MCP retorna erros 401 — repita este passo e atualize o token.

**Company ID:**

1. Ainda no DevTools → Network, olhe a URL de qualquer request
2. O padrao e `/api/companies/XXXX/...` — o `XXXX` e seu Company ID
3. Exemplo: `/api/companies/1234/workspaces` → Company ID = `1234`

---

### 2. Instalar e Buildar

> **Pule este passo se o Passo 0 detectou `dist/index.js` existente.**

```bash
npm install
npm run build
```

Verificar que o build funcionou:

```bash
ls dist/index.js
# Se nao existir → o build falhou. Verifique erros do npm run build
```

---

### 3. Registrar o MCP no Claude Code

**Se o usuario escolheu escopo Global:**

```bash
claude mcp add ekyte -s user -e EKYTE_BEARER_TOKEN=SEU_JWT_AQUI -e EKYTE_COMPANY_ID=SEU_COMPANY_ID -e TRANSPORT=stdio -- node /CAMINHO/COMPLETO/PARA/ekyte_mcp_server/dist/index.js
```

> **Dica:** Use `pwd` dentro da pasta do projeto para descobrir o caminho absoluto. O flag `-s user` registra o MCP globalmente — disponivel em qualquer projeto.
> **Se o `.env` ja tem as credenciais**, use os valores de la automaticamente — nao peca ao usuario para colar de novo.

**Se o usuario escolheu escopo Projeto:**

Crie (ou atualize) o arquivo `.mcp.json` na raiz do repositorio onde o usuario quer usar o MCP:

```json
{
  "mcpServers": {
    "ekyte": {
      "type": "stdio",
      "command": "node",
      "args": ["/CAMINHO/COMPLETO/PARA/ekyte_mcp_server/dist/index.js"],
      "env": {
        "EKYTE_BEARER_TOKEN": "SEU_JWT_AQUI",
        "EKYTE_COMPANY_ID": "SEU_COMPANY_ID",
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

> **Dica:** Use `pwd` dentro da pasta do projeto MCP para descobrir o caminho absoluto para `args`.
> **Se o `.env` ja tem as credenciais**, use os valores de la automaticamente — nao peca ao usuario para colar de novo.
> **O `.mcp.json` ja esta no `.gitignore`** deste repositorio. Se for instalar em outro repo, lembre de adicionar `.mcp.json` ao `.gitignore` de la tambem (contem credenciais sensíveis).

---

### 4. Validar Registro

```bash
claude mcp list
# Deve mostrar: ekyte
```

---

### 5. Instalar a Skill Globalmente

> 🔴 **Sem a skill, o Claude pode chutar IDs de workspace, inventar datas ou criar tarefa no cliente errado.** Este passo instala a skill `ekyte` em `~/.claude/skills/ekyte/`, disponivel em qualquer sessao do Claude Code.

A skill ja esta no repositorio em `.claude/skills/ekyte/`. Copie para o diretorio global do Claude:

**Linux / macOS:**

```bash
mkdir -p ~/.claude/skills
cp -r .claude/skills/ekyte ~/.claude/skills/
```

**Windows (PowerShell):**

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills" | Out-Null
Copy-Item -Recurse .claude\skills\ekyte "$env:USERPROFILE\.claude\skills\"
```

Verifique que os dois arquivos foram copiados:

```bash
ls ~/.claude/skills/ekyte/
# deve listar: SKILL.md  reference.md
```

> **O que a skill faz:** ensina o Claude a sempre listar antes de criar, confirmar todos os dados com o usuario antes de operacoes destrutivas (criar tarefa, completar, deletar apontamento), usar UUIDs corretos para executor_id, formato AAAA-MM-DD para datas e HH:MM para horarios, e filtrar list_tasks por workspace_id para performance.

---

### 6. Smoke Test

Abra o Claude Code e teste:

```
"Liste os workspaces do Ekyte"
```
Esperado: tabela com workspaces (ID, nome, status).

```
"Quem sao os usuarios da empresa?"
```
Esperado: tabela com usuarios (UUID, nome, email).

```
"Crie uma tarefa de teste no workspace X para o usuario Y"
```
Esperado: o Claude segue o fluxo (buscar IDs → confirmar dados → criar tarefa).

Se retornar erro 401 → token expirado, volte ao Passo 1.
Se retornar erro 500 → problema temporario no Ekyte, tente em alguns minutos.

### Checklist Local

- [ ] Repositorio verificado (Passo 0)
- [ ] Bearer Token (JWT) obtido do DevTools ou `.env`
- [ ] Company ID identificado ou lido do `.env`
- [ ] Build realizado (`dist/index.js` existe)
- [ ] Escopo definido (Global ou Projeto)
- [ ] **Global:** `claude mcp add` (stdio) executado com sucesso / **Projeto:** `.mcp.json` criado na raiz do repo
- [ ] `claude mcp list` mostra `ekyte`
- [ ] Skill copiada para `~/.claude/skills/ekyte/` (SKILL.md + reference.md)
- [ ] Smoke test passou — `list_workspaces` retorna dados reais

---

## Caminho B: Instalacao Remota

### 1. Registrar o MCP no Claude Code

**Se o usuario escolheu escopo Global:**

```bash
claude mcp add --transport http ekyte https://SEU-SERVIDOR.com/mcp --scope user
```

**Se o usuario escolheu escopo Projeto:**

Crie (ou atualize) o arquivo `.mcp.json` na raiz do repositorio onde o usuario quer usar o MCP:

```json
{
  "mcpServers": {
    "ekyte": {
      "type": "http",
      "url": "https://SEU-SERVIDOR.com/mcp"
    }
  }
}
```

> **Dica:** Se o repositorio nao tem `.mcp.json` no `.gitignore`, adicione — no caso remoto nao ha credenciais sensiveis no arquivo, mas e boa pratica.

> **Vantagem:** Nao precisa de Node.js local, nao precisa buildar, nao precisa de credenciais na sua maquina. O servidor remoto ja tem tudo configurado.

---

### 2. Validar Registro

```bash
claude mcp list
# Deve mostrar: ekyte
```

---

### 3. Instalar a Skill Globalmente

> 🔴 **Sem a skill, o Claude pode chutar IDs de workspace, inventar datas ou criar tarefa no cliente errado.** Este passo baixa a skill `ekyte` do GitHub direto para `~/.claude/skills/ekyte/`, disponivel em qualquer sessao do Claude Code.

Como no modo remoto normalmente o usuario nao tem o repo clonado, baixe os dois arquivos da skill direto do GitHub:

**Linux / macOS:**

```bash
mkdir -p ~/.claude/skills/ekyte && \
  curl -fsSL -o ~/.claude/skills/ekyte/SKILL.md \
    https://raw.githubusercontent.com/FerrazPiai/ekyte_mcp_server/main/.claude/skills/ekyte/SKILL.md && \
  curl -fsSL -o ~/.claude/skills/ekyte/reference.md \
    https://raw.githubusercontent.com/FerrazPiai/ekyte_mcp_server/main/.claude/skills/ekyte/reference.md
```

**Windows (PowerShell):**

```powershell
$dst = "$env:USERPROFILE\.claude\skills\ekyte"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$base = "https://raw.githubusercontent.com/FerrazPiai/ekyte_mcp_server/main/.claude/skills/ekyte"
Invoke-WebRequest -Uri "$base/SKILL.md"     -OutFile "$dst\SKILL.md"
Invoke-WebRequest -Uri "$base/reference.md" -OutFile "$dst\reference.md"
```

Verifique que os dois arquivos foram baixados:

```bash
ls ~/.claude/skills/ekyte/
# deve listar: SKILL.md  reference.md
```

> **O que a skill faz:** ensina o Claude a sempre listar antes de criar, confirmar todos os dados com o usuario antes de operacoes destrutivas (criar tarefa, completar, deletar apontamento), usar UUIDs corretos para executor_id, formato AAAA-MM-DD para datas e HH:MM para horarios, e filtrar list_tasks por workspace_id para performance.

---

### 4. Smoke Test

Abra o Claude Code e teste:

```
"Liste os workspaces do Ekyte"
```
Esperado: tabela com workspaces (ID, nome, status).

```
"Quem sao os usuarios da empresa?"
```
Esperado: tabela com usuarios (UUID, nome, email).

```
"Crie uma tarefa de teste no workspace X para o usuario Y"
```
Esperado: o Claude segue o fluxo (buscar IDs → confirmar dados → criar tarefa).

Se retornar erro 401 → token expirado, avise o admin do servidor.
Se retornar erro 500 → problema temporario no Ekyte, tente em alguns minutos.

### Checklist Remoto

- [ ] URL do servidor MCP obtida
- [ ] Escopo definido (Global ou Projeto)
- [ ] **Global:** `claude mcp add` (http) executado com sucesso / **Projeto:** `.mcp.json` criado na raiz do repo
- [ ] `claude mcp list` mostra `ekyte`
- [ ] Skill baixada para `~/.claude/skills/ekyte/` (SKILL.md + reference.md)
- [ ] Smoke test passou — `list_workspaces` retorna dados reais

---

## Troubleshooting

### "ERRO: Variaveis de ambiente obrigatorias nao definidas" (local)

O servidor precisa de `EKYTE_BEARER_TOKEN` e `EKYTE_COMPANY_ID`. Verifique se passou os `-e` corretos no `claude mcp add` ou se o `.mcp.json` tem os valores no campo `env`.

**Se instalou com escopo Global**, remova e adicione novamente:

```bash
claude mcp remove ekyte -s user
claude mcp add ekyte -s user -e EKYTE_BEARER_TOKEN=TOKEN_CORRETO -e EKYTE_COMPANY_ID=ID_CORRETO -e TRANSPORT=stdio -- node /caminho/dist/index.js
```

**Se instalou com escopo Projeto**, edite o `.mcp.json` na raiz do repo e corrija os valores em `env`.

### Erro 401 (Unauthorized)

Token JWT expirou. Repita o Passo 1 e atualize com `claude mcp remove` + `claude mcp add`. Se usando remoto, avise o admin do servidor.

### Erro 500 (Internal Server Error)

Problema temporario no servidor do Ekyte. Aguarde 2-3 minutos e tente novamente.

### "ekyte nao aparece no claude mcp list"

1. **Local:** Verifique se o path do `dist/index.js` esta absoluto e correto
2. **Remoto:** Verifique se a URL termina em `/mcp` e o servidor esta acessivel
3. **Projeto (`.mcp.json`):** Verifique se voce esta na raiz do repositorio onde o `.mcp.json` foi criado — ele so funciona naquele diretorio
4. Tente remover e adicionar novamente (global) ou recriar o `.mcp.json` (projeto)

### Build falha (local)

```bash
npm run clean && npm install && npm run build
```

Verifique a versao do Node (`node -v`) — precisa ser >= 18.

### Skill nao e invocada / Claude chuta IDs

Se o Claude esta criando tarefas em workspaces errados, chutando UUIDs de usuario ou nao confirmando antes de operacoes destrutivas, a skill nao esta carregada:

1. Verifique se os arquivos existem:
   ```bash
   ls ~/.claude/skills/ekyte/
   # deve listar: SKILL.md  reference.md
   ```
2. Se nao existirem, refaca o **Passo 5 (Local)** ou **Passo 3 (Remoto)**
3. Reinicie a sessao do Claude Code (`/exit` e abra de novo) para a skill ser recarregada
4. Teste forcando a invocacao: `/ekyte listar workspaces`

---

*MCP + skill instalados. O Claude Code agora opera o Ekyte direto do chat, com fluxos corretos e confirmacao em operacoes destrutivas.*
