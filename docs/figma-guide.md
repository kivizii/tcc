# Guia Figma — Zela

**Zela por ela** — especificação para criar o arquivo Figma do zero, espelhando [`public/css/tokens.css`](../public/css/tokens.css) e [`docs/design-system.md`](design-system.md).

**Issue Linear:** [TCC-67](https://linear.app/tcc-zela/issue/TCC-67/criar-arquivo-figma-com-design-tokens-e-componentes-base)

**Arquivos de apoio no repositório:**

| Arquivo | Uso |
|---------|-----|
| [`figma-tokens.json`](figma-tokens.json) | Importar cores, tipografia e espaçamento (plugin Tokens Studio) |
| [`public/assets/icons/`](../public/assets/icons/) | Arrastar SVGs para a página Ícones |
| [`public/assets/logo/`](../public/assets/logo/) | Wordmark e ícone no Header |

---

## Passo a passo (≈ 1–2 h)

### 1. Criar o arquivo

1. Acesse [figma.com](https://www.figma.com) e faça login.
2. **Drafts** → **New design file**.
3. Renomeie para **Zela — Design System**.
4. Crie 4 páginas (botão `+` ao lado de Page 1):
   - `01 Tokens`
   - `02 Componentes`
   - `03 Telas`
   - `04 Ícones`

### 2. Importar tokens (recomendado)

**Opção A — Plugin Tokens Studio (mais rápido)**

1. Menu **Plugins** → **Find more plugins** → instale **Tokens Studio for Figma**.
2. Abra o plugin → **Load from JSON** (ou Settings → sync local).
3. Selecione o arquivo `docs/figma-tokens.json` deste repositório.
4. No plugin, clique **Apply to document** para gerar Color Styles e Variables.

**Opção B — Manual**

1. Na página `01 Tokens`, crie retângulos com cada cor da tabela abaixo.
2. Selecione cada retângulo → painel direito **Fill** → ícone de **Style** (`◆`) → **+** → nomeie conforme a tabela (ex.: `lilas`, `sos`).
3. Repita para todas as 19 cores.

### 3. Text styles (fonte Inter)

1. Se o Figma pedir, ative a fonte **Inter** (Google Fonts integrado).
2. Crie textos de exemplo e salve como Text Style:

| Nome do style | Fonte | Tamanho | Peso |
|---------------|-------|---------|------|
| text-xs | Inter | 12 | Medium |
| text-sm | Inter | 14 | Regular |
| text-base | Inter | 16 | Regular |
| text-lg | Inter | 18 | Semi Bold |
| text-xl | Inter | 20 | Semi Bold |
| text-2xl | Inter | 24 | Semi Bold |
| text-3xl | Inter | 30 | Semi Bold |

### 4. Importar ícones e logo

1. Abra a página `04 Ícones`.
2. No explorador de arquivos, arraste todos os `.svg` de `public/assets/icons/` para o canvas.
3. Organize em grid 4×3 com espaçamento de 24px.
4. Na página `02 Componentes`, importe também:
   - `public/assets/logo/zela-wordmark.svg`
   - `public/assets/logo/zela-icon.svg`

### 5. Montar componentes (página `02 Componentes`)

Use frame base **360px** de largura (iPhone). Ative **Auto layout** em todos os componentes.

| Componente | Especificação |
|------------|---------------|
| `Button/Primary` | Fill `lilas`, texto `texto`, radius 12px, padding 16×24, min-height 44px |
| `Button/Secondary` | Fill `bege`, demais iguais |
| `Button/SOS` | Fill `sos`, texto `branco`, radius 16px, largura 328px, ícone sos à esquerda |
| `Button/Ghost` | Stroke `cinza-claro` 1px, fundo transparente |
| `Card/Default` | Fill `branco`, stroke `cinza-claro`, radius 12px, padding 16px |
| `ShortcutCard` | 156×88px, ícone 24px + label `text-sm` Medium |
| `Header` | 360×56px, wordmark à esquerda, botão saída à direita |
| `BottomNav` | 360×64px, 5 itens com ícone 20px + label `text-xs` |
| `Input/Default` | 328×44px, stroke `cinza-claro`, radius 8px |
| `Alert/Warning` | Fundo `#fdf3e8`, texto `alerta`, padding 16px |

Selecione cada um → botão direito **Create component** (`Ctrl+Alt+K`).

### 6. Telas de alta fidelidade (página `03 Telas`)

Crie frames **360×800** (ou iPhone 14):

1. **Início** — Header + saudação + Button/SOS + grid 2×2 ShortcutCard + grid serviços + BottomNav
2. **SOS** — Header + título + Alert/Warning + Button/SOS + link secundário + BottomNav
3. **Contatos** — Header + lista Card + formulário Input + BottomNav
4. **Configurações** — Header + lista de links (settings-list) + BottomNav

Use instâncias dos componentes da página 2 (não duplique estilos soltos).

### 7. Prototipar

1. Aba **Prototype** (painel direito).
2. Conecte: Início → botão SOS → tela SOS.
3. Conecte: BottomNav itens → telas correspondentes.
4. Interaction: **On tap** → **Navigate to** → **Instant**.

### 8. Compartilhar com a equipe

1. Botão **Share** (canto superior direito).
2. Em **Anyone with the link** → **can view**.
3. Copie o link.
4. Cole o link em:
   - `docs/design-system.md` (seção Figma)
   - Comentário na issue [TCC-67](https://linear.app/tcc-zela/issue/TCC-67)
5. Marque TCC-67 como **Done** no Linear.

**Quando tiver o link**, envie aqui no chat que atualizamos o `design-system.md` automaticamente.

---

## Estrutura do arquivo

Criar um arquivo Figma com 4 páginas:

### 1. Tokens

**Color styles** (nomes = tokens CSS):

| Nome no Figma | Hex |
|---------------|-----|
| rosa-claro | #F2C4D6 |
| rosa | #E8A4BC |
| nude | #E8D5C4 |
| bege | #F5EBE0 |
| branco-gelo | #FAF8F6 |
| lilas | #C9B8D9 |
| lilas-escuro | #9B87B8 |
| cinza-claro | #E8E4E0 |
| cinza | #6B6560 |
| texto | #3D3835 |
| texto-suave | #6B6560 |
| branco | #FFFFFF |
| sos | #C0392B |
| sos-hover | #A93226 |
| sucesso | #27AE60 |
| alerta | #E67E22 |
| erro | #C0392B |
| info | #5B7C99 |

**Text styles** (fonte Inter):

| Nome | Tamanho | Peso |
|------|---------|------|
| text-xs | 12px | Medium 500 |
| text-sm | 14px | Regular 400 |
| text-base | 16px | Regular 400 |
| text-lg | 18px | Semibold 600 |
| text-xl | 20px | Semibold 600 |
| text-2xl | 24px | Semibold 600 |
| text-3xl | 30px | Semibold 600 |

**Spacing variables** (opcional): 4, 8, 16, 24, 32, 48 px.

**Corner radius:** 8, 12, 16 px.

### 2. Componentes

Criar componentes reutilizáveis (frame 360×auto, alinhado a mobile):

- `Button/Primary` — fundo lilás, texto escuro, radius 12px, min-height 44px
- `Button/Secondary` — fundo bege
- `Button/SOS` — fundo sos, texto branco, radius 16px, largura total
- `Button/Ghost` — borda cinza-claro
- `Card/Default` — fundo branco, borda cinza-claro, shadow sm
- `ShortcutCard` — grid 2 colunas, ícone + label
- `Header` — logo wordmark + slot auth, height 56px
- `BottomNav` — 5 itens com ícones SVG
- `Input/Default` — border, focus ring lilás
- `Alert/Warning`, `Alert/Info`, `Alert/Success`, `Alert/Error`

Exportar ícones da pasta `public/assets/icons/` para a página de ícones.

### 3. Telas

Alta fidelidade (360×800 frame):

1. **Início** — saudação, botão SOS, atalhos, serviços
2. **SOS** — alerta 190/180, botão acionar, timer
3. **Contatos** — lista + formulário
4. **Configurações** — lista de links

Vincular componentes da página 2. Prototipar fluxo: Início → SOS → confirmação.

### 4. Ícones

Grid com todos os SVGs de `public/assets/icons/`:

home, sos, contacts, map, menu, settings, books, wrench, graduation, heart, chat, check.

---

## Após criar

1. Compartilhar link view-only com a equipe.
2. Adicionar link em `docs/design-system.md` (seção Figma).
3. Comentar o link na issue TCC-67 e marcar como Done.

---

## Checklist de validação

- [ ] Cores batem com `tokens.css` (sem divergência de hex)
- [ ] Fonte Inter em todos os text styles
- [ ] Componentes com auto-layout e min-height 44px nos botões
- [ ] Telas principais prototipadas e navegáveis
- [ ] Ícones importados da biblioteca SVG do repositório
