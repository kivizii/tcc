---
name: git-github-workflow
description: >-
  Aplica o fluxo Git/GitHub do Zela (branch, commit Conventional Commits,
  pull request e merge). Use when the user asks to commit, criar branch, merge,
  pull request, PR, push, rebase, resolver conflito, ou trabalhar no GitHub deste
  repositório.
---

# Git e GitHub — Zela

Repositório em equipe (Heloise, Lia, Geovana). Trabalho sempre em **branch**; `main` só recebe mudança via **Pull Request**.

Regras de segurança do Git do usuário continuam válidas: não alterar `git config`, não `--force` em `main`/`master`, não `--no-verify`, não amend de commit já enviado, só commit quando a usuária pedir.

## Branch

1. Atualizar `main` local: `git fetch origin` e `git checkout main` + `git pull origin main`.
2. Criar branch a partir de `main` atualizado. Nunca desenvolver em `main`.
3. Nomes em kebab-case, com **prefixo** e **desenvolvedor** obrigatórios:

```
<prefixo>/<desenvolvedor>/<descricao-curta>
```

| Prefixo | Uso |
| --- | --- |
| `docs/` | README, DOCX, PDF, skill, plano |
| `feat/` | funcionalidade nova |
| `fix/` | correção |
| `chore/` | ferramenta, ignore, CI |
| `refactor/` | reorganização sem mudar comportamento |

**Desenvolvedor:** primeiro nome em minúsculas, sem acento (`heloise`, `lia`, `geovana`). Se não souber quem está desenvolvendo, perguntar antes de criar a branch.

Exemplos: `docs/heloise/plano-tcc`, `feat/lia/botao-sos`, `fix/geovana/validacao-contato`.

4. Uma branch = um assunto. Não misturar documentação do TCC com código do app na mesma PR.

## Commit

Só após pedido explícito. Seguir o protocolo de commit do usuário (status, diff, log em paralelo; depois add seletivo; commit; status).

**Formato (Conventional Commits, mensagem em português):**

```
tipo(escopo): resumo no imperativo, até ~72 caracteres

Por que a mudança existe (1–2 frases). Opcional.
```

Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.

Escopos comuns: `readme`, `docs`, `ux`, `sos`, `chat`, `auth`, `firebase`.

No PowerShell, passar a mensagem assim (não usar `git commit -m` com `&&`):

```powershell
git commit -m @"
docs(readme): esclarecer status do repositorio

O README deve deixar claro que o codigo do app ainda nao esta versionado.
"@
```

Não commitar: `.env`, chaves, tokens, `credentials.json`, segredos. Avisar se a usuária pedir para incluir esses arquivos.

`tcc.pdf` e `docs/*.docx` podem entrar quando fizerem parte da entrega.

## Pull Request e merge

1. `git push -u origin HEAD` (com permissão de rede/`all` se o ambiente exigir).
2. Abrir PR com `gh pr create` para `main`. Título no mesmo estilo do commit principal. Corpo:

```markdown
## Resumo
- 

## Como validar
- [ ]
```

3. Não fazer merge local em `main` como substituto da PR, salvo a usuária pedir explicitamente.
4. Preferir **squash merge** na PR (histórico linear no `main`).
5. Depois do merge: `git checkout main` + `git pull origin main`. Apagar a branch remota se o GitHub não apagou: `git push origin --delete nome-da-branch`.
6. Conflitos: atualizar a branch com `git fetch` + `git merge origin/main` (não rebase em branch já compartilhada, a menos que a equipe peça). Resolver, testar, commitar, push.

Issues e andamento no Linear: seguir [linear-workflow](../linear-workflow/SKILL.md) (referenciar `TCC-XXX` na branch/PR quando aplicável).

## Checklist rápido

- [ ] Branch criada de `main` atualizado, com nome `prefixo/desenvolvedor/descricao`
- [ ] Commits atômicos, tipo/escopo corretos, sem segredos
- [ ] PR para `main`, descrição clara
- [ ] Merge via GitHub (squash), depois `main` local atualizado

Exemplos de mensagens: [examples.md](examples.md).
