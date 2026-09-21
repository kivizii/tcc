# Design System — Zela

**Zela por ela** — guia de identidade visual do app Zela. Fonte de verdade no código: [`public/css/tokens.css`](../public/css/tokens.css).

**Linear:** issues com label `layout` no epic [TCC-7](https://linear.app/tcc-zela/issue/TCC-7/epic-identidade-ux-e-navegacao).

---

## Princípios de design

1. **Discrição** — aparência de app de organização ou bem-estar; sem símbolos que denunciem segurança à primeira vista.
2. **Rapidez em emergência** — SOS acessível em poucos toques, com contraste alto.
3. **Privacidade por design** — dados sensíveis só quando necessários; saída rápida para página neutra.
4. **Mobile-first** — uso com uma mão, alvos de toque grandes, layout vertical.
5. **Acessibilidade** — contraste WCAG AA, foco visível, ícones com texto.

---

## Paleta de cores

Paleta **rosa e cinza** (intensidade média). **Vermelho exclusivo do botão SOS** (`.btn--sos`).

### Rosa

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-rosa-claro` | `#fce8f2` | Fundos suaves, banners, gradientes |
| `--color-rosa` | `#f0b8d0` | Botões primários, tags, chat próprio |
| `--color-rosa-medio` | `#e891b8` | Foco, bordas ativas |
| `--color-rosa-escuro` | `#c97596` | Nav ativa, ícones, timer, badge SOS |
| `--color-nude` | `#f5dfe8` | Fundos alternativos |
| `--color-bege` | alias de `rosa-claro` | Cards secundários |

### Cinza

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-branco-gelo` | `#f9f7f8` | Fundo principal do app |
| `--color-cinza-claro` | `#e8e6e8` | Bordas, divisores, saída rápida |
| `--color-cinza` | `#7a7579` | Texto secundário |
| `--color-cinza-escuro` | `#4a4548` | Texto forte, hover de links de emergência |
| `--color-texto` | `#3d3838` | Texto principal, links |
| `--color-texto-suave` | `#7a7579` | Subtítulos, legendas |
| `--color-branco` | `#ffffff` | Header, nav, cards |

### SOS (único vermelho)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-sos` | `#c0392b` | **Somente** `.btn--sos` |
| `--color-sos-hover` | `#a93226` | Hover do botão SOS |
| `--color-sos-text` | `#ffffff` | Texto no botão SOS |

### Semânticas (rosa/cinza)

| Token CSS | Hex | Uso |
|-----------|-----|-----|
| `--color-sucesso` | `#5c6b62` | Confirmações |
| `--color-alerta` | `#4a4548` | Avisos |
| `--color-erro` | `#b85c7a` | Erros de formulário |
| `--color-info` | `#6b6568` | Informações |

Aliases legados: `--color-lilas` → rosa, `--color-lilas-escuro` → rosa escuro.

### Regras de uso

- Interface em **rosa médio + cinza**; vermelho **apenas** no botão SOS.
- Texto principal sempre `--color-texto` sobre fundos claros.
- Links no conteúdo usam `--color-texto` com sublinhado rosa.

### Fundo decorativo

Motivos florais minimalistas em rosa claro, aplicados via `background-image` em `body:not(.exit-page-body)` em [`public/css/base.css`](../public/css/base.css):

| Asset | Uso |
|-------|-----|
| `public/assets/patterns/floral-tile.svg` | Mosaico repetível com flores e folhas — cobre a tela inteira |
| `public/assets/patterns/floral-bloom.svg` | Flor isolada (uso em assets legados) |
| `public/assets/patterns/floral-sprig.svg` | Ramo isolado (uso em assets legados) |

Distribuição: **padrão repetido** (`background-repeat: repeat`) em duas camadas deslocadas, preenchendo toda a viewport.

| Token | Valor | Uso |
|-------|-------|-----|
| `--floral-fill-soft` | `#fce8f2` | Preenchimento suave nos SVGs |
| `--floral-fill` | `#f0b8d0` | Preenchimento médio nos SVGs |
| `--floral-opacity` | `1` | Reservado para ajuste fino futuro |

Regras:

- Florais em **rosa claro**, opacidade ~24–32% no SVG; nunca em vermelho.
- Presentes em **todas as páginas do app**, exceto [`public/exit.html`](../public/exit.html) (classe `exit-page-body` — página neutra de saída rápida).
- `background-repeat: repeat` com `background-attachment: fixed`; não interfere em toques nem contraste de texto.
- Ocultos na impressão (`@media print`).

---

## Tipografia

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-family` | Inter, system-ui, sans-serif | Todo o app |
| `--font-size-xs` | 0.75rem (12px) | Labels da nav, notas |
| `--font-size-sm` | 0.875rem (14px) | Texto auxiliar, cards |
| `--font-size-base` | 1rem (16px) | Corpo |
| `--font-size-lg` | 1.125rem (18px) | Títulos de seção |
| `--font-size-xl` | 1.25rem (20px) | Saudação home |
| `--font-size-2xl` | 1.5rem (24px) | Títulos de página |
| `--font-size-3xl` | 1.875rem (30px) | Destaques raros |

| Peso | Token | Uso |
|------|-------|-----|
| 400 | `--font-weight-regular` | Parágrafos |
| 500 | `--font-weight-medium` | Labels, nav |
| 600 | `--font-weight-semibold` | Títulos, botões |
| 700 | `--font-weight-bold` | Alertas, ênfase |

Fonte carregada em [`public/css/base.css`](../public/css/base.css) via Google Fonts (pesos 400–700).

---

## Espaçamento, raios e sombras

| Categoria | Tokens | Valores |
|-----------|--------|---------|
| Espaçamento | `--space-xs` … `--space-2xl` | 4px → 48px |
| Raios | `--radius-sm/md/lg/full` | 8px, 12px, 16px, pill |
| Sombras | `--shadow-sm/md/lg` | Elevação sutil em cards e SOS |

### Layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--max-width` | 480px | Largura máxima do conteúdo |
| `--touch-min` | 44px | Altura mínima de toque (WCAG) |
| `--header-height` | 56px | Header fixo |
| `--nav-height` | 64px | Bottom navigation |

---

## Marca e ícones

### Logo

| Arquivo | Descrição |
|---------|-----------|
| `public/assets/logo/zela-wordmark.svg` | Wordmark tipográfico discreto |
| `public/assets/logo/zela-icon.svg` | Flor minimalista em fundo rosa (favicon/PWA) |
| `public/assets/favicon.svg` | Favicon do site |

Wordmark no header via [`public/js/nav.js`](../public/js/nav.js). Favicon injetado por [`public/js/bootstrap.js`](../public/js/bootstrap.js).

### Ícones SVG

Biblioteca em `public/assets/icons/` e helper JS [`public/js/icons.js`](../public/js/icons.js).

| Nome | Arquivo | Uso |
|------|---------|-----|
| home | `home.svg` | Nav início |
| sos | `sos.svg` | Nav SOS, botão emergência |
| contacts | `contacts.svg` | Nav contatos |
| map | `map.svg` | Nav mapa |
| menu | `menu.svg` | Nav mais |
| settings | `settings.svg` | Atalho configurações |
| books | `books.svg` | Atalho educativo |
| wrench | `wrench.svg` | Atalho vídeos |
| graduation | `graduation.svg` | Atalho cursos |
| heart | `heart.svg` | Atalho mães solo |
| chat | `chat.svg` | Atalho chat |
| check | `check.svg` | Status SOS sucesso |

**Padrão técnico:** stroke 2px, `viewBox="0 0 24 24"`, cor via `currentColor`.

Classes CSS: `.icon`, `.icon--nav`, `.icon--shortcut`, `.icon--sos`, `.icon--status`.

Uso em HTML: `<span data-icon="home" data-icon-class="icon icon--shortcut"></span>`.

---

## Componentes

Referência completa em [`public/css/components.css`](../public/css/components.css).

| Componente | Classes principais | Quando usar |
|------------|-------------------|-------------|
| Header | `.app-header`, `.app-header__brand`, `.app-header__logo` | Todas as telas (exceto saída rápida) |
| Bottom nav | `.bottom-nav`, `.bottom-nav__item`, `.bottom-nav__item--active` | Navegação principal |
| Botão primário | `.btn`, `.btn--primary` | Ações principais |
| Botão secundário | `.btn`, `.btn--secondary` | Ações alternativas |
| Botão SOS | `.btn`, `.btn--sos` | Emergência apenas |
| Botão ghost | `.btn`, `.btn--ghost` | Sair, cancelar |

#### Botões com acentos florais

Cantos decorados via `background-image` (sem alterar HTML):

| Variante | Assets | Notas |
|----------|--------|-------|
| `.btn--primary` | `btn-floral-tr-light.svg`, `btn-floral-bl-light.svg` | Pétalas claras sobre rosa |
| `.btn--secondary` | `btn-floral-tr-soft.svg`, `btn-floral-bl-soft.svg` | Rosa suave sobre fundo claro |
| `.btn--ghost` | `*-soft.svg` | Motivos menores (36px) |
| `.btn--sos` | `*-light.svg` | Pétalas brancas suaves; vermelho continua dominante |
| `.btn--sm` | herdado da variante | Tamanho reduzido (`--btn-floral-size-sm`) |

Tokens: `--btn-floral-size`, `--btn-floral-size-sm`, `--btn-floral-size-sos`.

Regras: decoração só nos cantos; centro livre para texto/ícones. `btn-quick-exit` do header **não** usa florais (discrição).

| Card | `.card`, `.card__title`, `.card__text` | Blocos de conteúdo |
| Atalho | `.shortcut-card`, `.shortcut-grid` | Home e grids 2 colunas |
| Formulário | `.form-group`, `.form-label`, `.form-input` | Login, cadastro, contatos |
| Alerta | `.alert`, `.alert--info/success/warning/error` | Feedback ao usuário |
| Modal | `.modal-overlay`, `.modal` | Confirmações (SOS) |
| Lista contatos | `.contact-list`, `.contact-item` | Tela de contatos |
| Configurações | `.settings-list`, `.settings-item` | Menu de configurações |
| Mapa | `.map-container`, `.poi-card`, `#map-status` | Locais de apoio em São Paulo |

#### Mapa de apoio (São Paulo)

- **Stack:** Leaflet 1.9 + tiles [CARTO Voyager](https://carto.com/) (fallback Esri World Street Map)
- **Dados:** `public/data/content.json` → `pois` (DEAM, hospitais, ONGs, delegacias)
- **Centro padrão:** São Paulo (`-23.5505`, `-46.6333`); geolocalização opcional se dentro dos limites da cidade
- **CSS crítico:** `.leaflet-container img { max-width: none !important; }` — neutraliza regra global de `img` em `base.css` que quebra os tiles
- **Tema rosa:** estilos escopados em `body[data-page="map"]` — filtro `--map-tile-filter` nos tiles OSM, controles Leaflet, filtros, cards `.poi-card` e popups `.map-popup`
- **Interação:** filtros por categoria; clique no card da lista centraliza o marcador

### Estrutura de página padrão

```html
<main class="app-shell">
  <h1 class="page-title">Título</h1>
  <p class="page-subtitle">Descrição opcional</p>
  <!-- conteúdo -->
</main>
```

Bootstrap: `<script src="js/bootstrap.js" data-depth="N"></script>` onde `N` = níveis abaixo de `public/`.

### Conteúdo (vídeos, cursos, empregos)

- Dados em `public/data/content.json` — chaves `videos`, `cursos` e `empregos`.
- Telas em `public/content/` renderizam cards via `js/content.js` (`ZL.initContentPage`).
- **Vídeos do dia a dia:** ~17 itens em `videos[]`, categorias `Manutenção`, `Reparos`, `Segurança` e `Elétrica básica`. Cada item tem `title`, `description`, `category`, `tag`, `source` (opcional) e `link` (URL do YouTube). Cards exibem thumbnail 16:9 (`.card__thumb`) derivada automaticamente do ID do vídeo (`img.youtube.com/vi/{id}/mqdefault.jpg`) e botão **Assistir no YouTube**.
- **Cursos gratuitos:** 6 blocos (`.course-block`) alinhados às áreas do plano do TCC, cada um com 4–6 links de vídeo no YouTube. Cada item em `content.json` pode ter `links[]` com `label`, `url` e `type` (`video` ou `course`). O bloco exibe thumbnail do vídeo principal (`.course-block__thumb`) e botões com mini-thumbnail nos links de vídeo (`.course-link--video`) ou secundário **Ver formação completa** (`.course-link--secondary`). Campo `source` exibe a instituição. `ZL.renderCourseBlocks` é usado só na página de cursos; vídeos e empregos usam `renderCardGrid`.

### Chat feminino

- Dados em `public/data/communities.json` — salas com `seedMessages[]` (conversas demonstrativas entre mulheres fictícias).
- Lógica em `public/js/chat.js` (`ZL.initChatPage`) e painel de salas em `public/js/communities.js`.
- **Login obrigatório** para acessar `community/chat.html` (`ZL.requireAuth`).
- **Demo fixo:** `seedMessages` vêm sempre do JSON e não são sobrescritas no `localStorage`.
- **Fallback embutido:** se o JSON falhar ao carregar, `chat.js` usa conversas de reserva (sala `amizade`) para não exibir chat vazio.
- **Mensagens da usuária:** persistidas em `chat_user_{roomId}`; ao renderizar, demo + usuária são mescladas. Chaves legadas `chat_messages_*` são removidas na migração.
- Cada mensagem pode ter `author`, `text`, `time` (opcional) e `own` (`true` só para a usuária logada).
- UI: `.message-list`, `.message-bubble--own` (lilás) / `.message-bubble--other` (bege), aviso `.chat-demo-notice`.
- **Reset de dados de teste (modo demo):** em Configurações, botão **Apagar dados de teste** chama `ZL.resetDemoData()` e apaga todas as chaves `zela_demo_*` (contas, chat, contatos, mural, SOS).
- **Console (alternativa):** `Object.keys(localStorage).filter(k => k.startsWith("zela_demo_")).forEach(k => localStorage.removeItem(k))`
- **Fluxo de demonstração (TCC):** Configurações → Apagar dados de teste → cadastrar conta nova → abrir sala (ex.: `?room=amizade`) → ver 10 mensagens fictícias → enviar mensagem → recarregar e confirmar que demo + mensagem própria persistem.

### Autenticação

- **Login:** CPF + e-mail + senha (os três obrigatórios). CPF validado localmente em `js/cpf.js` (dígitos verificadores e rejeição de sequências inválidas).
- **Cadastro:** CPF + declaração explícita de identidade feminina (checkbox obrigatório) + termos LGPD. O CPF brasileiro não codifica gênero; a restrição de acesso é por regra de negócio no app.
- **Firebase:** credencial continua sendo e-mail/senha; CPF e `isWoman` ficam no perfil (`users/{uid}` no Firestore ou `localStorage` no modo demo).
- **Perfil:** em Configurações, CPF exibido mascarado (`***.***.***-XX`) via `ZL.maskCpfDisplay`.

---

## Acessibilidade (WCAG AA)

Auditoria da paleta Zela (texto normal ≥ 4.5:1, texto grande ≥ 3:1).

| Par de cores | Ratio | Status | Notas |
|--------------|-------|--------|-------|
| `#3d3838` sobre `#f9f7f8` | ~11.5:1 | Passa AAA | Texto principal |
| `#3d3838` sobre `#ffffff` | ~12.5:1 | Passa AAA | Cards |
| `#7a7579` sobre `#f9f7f8` | ~4.5:1 | Passa AA | Texto suave |
| `#7a7579` sobre `#ffffff` | ~4.9:1 | Passa AA | Legendas em cards |
| `#ffffff` sobre `#c0392b` | ~5.9:1 | Passa AA | **Botão SOS (único vermelho)** |
| `#ffffff` sobre `#a93226` | ~6.8:1 | Passa AA | SOS hover |
| `#3d3838` sobre `#f0b8d0` | ~6.2:1 | Passa AA | Botão primário rosa |
| `#3d3838` sobre `#fce8f2` | ~10.5:1 | Passa AAA | Fundo rosa claro |
| `#c97596` sobre `#ffffff` | ~3.8:1 | Passa AA texto grande | Ícones decorativos (com label) |

### Correções aplicadas

- Vermelho restrito a `.btn--sos`; timer, badge e links 190/180 usam rosa/cinza.
- Links de conteúdo usam `--color-texto` com sublinhado rosa.
- Ícones de atalho usam rosa escuro sobre fundo branco (decorativo, com label textual).
- Touch targets mínimos de 44px em botões e nav.
- `:focus-visible` com outline rosa médio de 3px.

---

## Figma

> **Link do protótipo:** _cole aqui após criar o arquivo — veja [`figma-guide.md`](figma-guide.md)._

| Recurso | Caminho |
|---------|---------|
| Passo a passo completo | [`figma-guide.md`](figma-guide.md) |
| Tokens para importar (JSON) | [`figma-tokens.json`](figma-tokens.json) |
| Ícones SVG | [`public/assets/icons/`](../public/assets/icons/) |
| Logo | [`public/assets/logo/`](../public/assets/logo/) |

**Issue:** [TCC-67](https://linear.app/tcc-zela/issue/TCC-67/criar-arquivo-figma-com-design-tokens-e-componentes-base)

---

## Referências

- Plano do TCC: [`conteudo-plano.md`](conteudo-plano.md) §6–7
- Checklist de testes: [`testes-checklist.md`](testes-checklist.md)
