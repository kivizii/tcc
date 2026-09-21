# Exemplos — commits, branches e PRs

## Branches

Formato: `<prefixo>/<desenvolvedor>/<descricao-curta>` (ex.: `feat/lia/botao-sos`).

| Trabalho | Quem | Branch |
| --- | --- | --- |
| Organizar documentação do TCC | Heloise | `docs/heloise/plano-projeto` |
| Skill de Git | Heloise | `chore/heloise/skill-git` |
| Tela do botão de emergência | Lia | `feat/lia/botao-sos` |
| Link quebrado no README | Geovana | `fix/geovana/readme-links` |

## Commits

**Documentação**

```
docs(docs): reorganizar plano do TCC em DOCX e README

Remove duplicatas do PDF e deixa a entrega academica versionada no GitHub.
```

**Funcionalidade**

```
feat(sos): acionar alerta com confirmacao

Evita disparo acidental e envia localizacao aos contatos de confianca.
```

**Correção**

```
fix(auth): bloquear acesso masculino as areas exclusivas

A verificacao de cadastro deve falhar fechado quando o perfil nao e permitido.
```

**Tarefa de repositório**

```
chore: adicionar skill de fluxo GitHub

Padroniza branch, commit e PR para a equipe do TCC.
```

## Título de PR

- `docs: publicar plano Zela no repositorio`
- `feat(sos): botao de emergencia com confirmacao`
- `fix(chat): corrigir moderacao de mensagens`

## Corpo de PR

```markdown
## Resumo
- Gera o DOCX a partir de docs/conteudo-plano.md
- README hibrido com link para a documentacao completa

## Como validar
- [ ] Abrir README no GitHub e seguir os links
- [ ] Abrir docs/Plano-Projeto-Zela.docx no Word
```
