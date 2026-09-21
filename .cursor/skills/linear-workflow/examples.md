# Exemplos — Linear Zela

## Buscar issue antes de trabalhar

Pedido da usuária: *"Vou implementar o botão SOS"*

1. `list_issues` → `project: Zela`, `query: SOS`
2. Encontrou `TCC-32` → usar essa issue
3. `save_issue` → `id: TCC-32`, `state: In Progress`
4. Branch: `feat/heloise/tcc-32-botao-sos`

## Comentário de andamento

Issue: `TCC-32`

```markdown
## Andamento — 2026-09-03

**Feito**
- Modal de confirmação antes do disparo
- Integração com geolocalização no clique

**Próximo**
- Enviar notificação aos contatos cadastrados
- Testar em tela pequena (360px)

**PR:** (abrir quando existir)
```

## Comentário de conclusão

Issue: `TCC-32`

```markdown
## Conclusão — 2026-09-10

**Entregue**
- Botão SOS com confirmação anti-acidental
- Localização compartilhada com contatos após confirmação

**Como validar**
- [ ] Acionar SOS e confirmar no modal
- [ ] Verificar que contatos recebem alerta com localização
- [ ] Cancelar no modal não dispara alerta

**PR:** https://github.com/.../pull/12
```

Depois: `save_issue` → `id: TCC-32`, `state: Done`

## Comentário de bloqueio

Issue: `TCC-17`

```markdown
## Bloqueio — 2026-09-05

**Motivo:** Conta Firebase do time ainda não criada; sem credenciais de dev.

**Impacto:** Firestore rules e auth não podem ser testados.

**Próximo passo:** Criar projeto no console Firebase e adicionar `.env.example` no repo (sem secrets).
```

Manter status **In Progress** ou **Blocked** conforme workflow do team.

## Criar sub-issue nova

Epic pai: `TCC-9` (SOS e rede de emergência)

```text
title: Validar fluxo SOS em dispositivo Android antigo
team: Tcc-zela
project: Zela
parentId: TCC-9
labels: [test, feat]
milestone: M3-Testes
priority: 3
description:
  ## Contexto
  Garantir que o SOS funciona em aparelhos com tela pequena e GPS lento.

  ## Critérios de aceite
  - [ ] Testado em pelo menos um Android com tela ≤ 5"
  - [ ] Tempo até confirmação < 3 toques
  - [ ] Localização obtida em até 15s em condições normais
```

## PR alinhada à issue

**Título:** `feat(sos): confirmação anti-acidental (TCC-32)`

**Corpo:**

```markdown
## Resumo
- Modal de confirmação no botão SOS
- Fecha TCC-32

## Como validar
- [ ] Itens do critério de aceite em TCC-32

Linear: https://linear.app/tcc-zela/issue/TCC-32/botao-sos-com-confirmacao-anti-acionamento-acidental
```

## Commit citando issue

```
feat(sos): adicionar modal de confirmacao no botao SOS

Implementa TCC-32. Evita acionamento acidental antes de alertar contatos.
```

## Epics de referência

| ID | Epic |
| --- | --- |
| TCC-5 | Setup e fundação técnica |
| TCC-7 | Identidade, UX e navegação |
| TCC-6 | Autenticação e segurança |
| TCC-9 | SOS e rede de emergência |
| TCC-8 | Mapa e canais de apoio |
| TCC-11 | Conteúdo e capacitação |
| TCC-10 | Apoio social e emocional |
| TCC-12 | Histórico e sede |
| TCC-14 | Banco de dados (Firebase) |
| TCC-15 | Testes e qualidade |
| TCC-13 | Roadmap e melhorias futuras |
