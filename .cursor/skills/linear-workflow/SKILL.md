---
name: linear-workflow
description: >-
  Usa o Linear como fonte oficial de issues do Zela (andamento, conclusões,
  bloqueios e backlog). Use quando o usuário pedir issue, tarefa, backlog,
  Linear, status, andamento, conclusão, epic, milestone, ou ao iniciar,
  concluir ou registrar trabalho no projeto.
---

# Linear — Zela

O **Linear** é a fonte oficial de tarefas, andamento e conclusões do projeto. Não registrar trabalho só no chat ou em listas locais quando houver issue correspondente no Linear.

**Workspace:** team `Tcc-zela` · projeto [Zela](https://linear.app/tcc-zela/project/zela-d9fb9ef10605)

Integração via MCP em [`.cursor/mcp.json`](../../mcp.json). Se o namespace `plugin-linear-linear` exigir auth, chamar `mcp_auth` antes das demais ferramentas.

Regras do Git em [git-github-workflow](../git-github-workflow/SKILL.md) continuam válidas. Branch, commit e PR devem referenciar a issue Linear quando existir (`TCC-123`).

## Quando usar o Linear

| Situação | Ação no Linear |
| --- | --- |
| Iniciar trabalho | Localizar issue existente ou criar sub-issue no epic certo |
| Progresso parcial | Comentário de andamento na issue |
| Bloqueio ou dúvida | Comentário + manter status; não fechar |
| Conclusão | Comentário de conclusão + mover status (ex.: Done) |
| Nova demanda | Criar issue no projeto Zela com label e milestone |
| Reunião / decisão | Comentário na issue ou epic relacionado |

**Não fazer:** marcar tarefa como concluída só na conversa; duplicar backlog em markdown sem sincronizar; commitar API keys.

## Estrutura do backlog

| Elemento | Uso |
| --- | --- |
| **Epics** (label `epic`) | Agrupam funcionalidades grandes (Setup, UX, SOS, etc.) |
| **Sub-issues** | Tarefas implementáveis; `parentId` = epic (`TCC-5`, etc.) |
| **Milestones** | M0-Setup · M1-MVP-Seguranca · M2-Features · M3-Testes · M4-Roadmap |
| **Labels** | `feat`, `setup`, `ux`, `firebase`, `security`, `test`, `roadmap`, `docs` |

**Prioridade:** Urgent = SOS/segurança crítica · High = auth, Firebase, setup · Medium = features · Low = roadmap

## Fluxo padrão

### 1. Antes de codar ou documentar

1. Buscar issue existente: `list_issues` com `project: Zela` e termo do assunto.
2. Se existir, usar essa issue como referência do trabalho.
3. Se não existir, criar com `save_issue`:
   - `team`: `Tcc-zela`
   - `project`: `Zela`
   - `parentId`: epic adequado (se for sub-tarefa)
   - `labels`, `milestone`, `priority` conforme o plano
   - descrição com contexto + critérios de aceite

### 2. Ao iniciar

1. Mover status para **In Progress** (`save_issue` com `state` adequado) se a issue ainda estiver em Backlog/Todo.
2. Branch Git (se aplicável): `feat/<dev>/<descricao>` ou incluir `TCC-123` no nome quando fizer sentido.

### 3. Registrar andamento

Adicionar comentário com `save_comment` usando o template **Andamento** (ver [examples.md](examples.md)).

Atualizar quando houver mudança relevante: decisão técnica, PR aberta, teste feito, bloqueio.

### 4. Ao concluir

1. Comentário **Conclusão** na issue (o que foi feito, como validar, link da PR se houver).
2. Marcar critérios de aceite na descrição se todos cumpridos (editar descrição ou comentar checklist).
3. Mover para **Done** (`save_issue` com `state`).
4. Na PR: título ou corpo menciona `TCC-123`; em **Como validar**, espelhar critérios da issue.

### 5. Bloqueio

Comentário **Bloqueio** com causa e próximo passo. Não fechar a issue.

## Ferramentas MCP (namespace `plugin-linear-linear`)

| Ferramenta | Uso |
| --- | --- |
| `list_issues` | Buscar tarefas por projeto, assignee, label |
| `get_issue` | Detalhes de `TCC-123` |
| `save_issue` | Criar ou atualizar issue (título, status, labels, milestone) |
| `save_comment` | Andamento, conclusão, bloqueio |
| `list_projects` / `list_milestones` | Confirmar Zela e milestones |
| `list_issue_labels` | Ver labels disponíveis |

Descobrir schema: `GetDynamicTools` com `namespace: plugin-linear-linear`.

## Integração Git ↔ Linear

- **Branch:** preferir assunto alinhado à issue; pode incluir id (`feat/lia/tcc-32-botao-sos`).
- **Commit:** corpo pode citar `TCC-123` quando a mudança fecha parte da issue.
- **PR:** título `feat(sos): botão SOS (TCC-32)`; corpo com link `https://linear.app/tcc-zela/issue/TCC-32/...`

Não fazer merge sem issue associada quando o trabalho veio do backlog Zela.

## Criar nova issue

Campos mínimos:

```text
title: verbo + objeto claro em português
team: Tcc-zela
project: Zela
description: ## Contexto · ## Critérios de aceite (checkboxes)
labels: [feat|setup|ux|...]
milestone: M0-Setup | M1-MVP-Seguranca | ...
priority: 1-4 (1=Urgent, 4=Low)
parentId: TCC-N (se sub-issue de epic)
```

Epics novos só com label `epic` e justificativa; evitar duplicar títulos já existentes — buscar antes de criar.

## Checklist rápido

- [ ] Issue localizada ou criada no projeto Zela
- [ ] Status In Progress ao começar
- [ ] Comentários de andamento em marcos relevantes
- [ ] Conclusão documentada + status Done ao terminar
- [ ] PR/commit referenciam `TCC-XXX` quando aplicável
- [ ] Nenhum segredo no Linear (tokens, `.env`)

Exemplos de comentários e issues: [examples.md](examples.md).
