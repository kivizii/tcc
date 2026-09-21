# Zela

**Zela por ela** — plataforma de apoio, acolhimento e segurança feminina. TCC de Análise e Desenvolvimento de Sistemas (Escola Raul Brasil).

**Equipe:** Heloise Vitoria · Lia Isiye · Geovana Pinto Ferreira

Este repositório concentra a **documentação do plano** e o **código do aplicativo web** (pasta `public/`).

Documentação acadêmica completa (texto organizado, sem duplicatas do material original): [docs/Plano-Projeto-Zela.docx](docs/Plano-Projeto-Zela.docx). O mesmo conteúdo em Markdown, usado para gerar o DOCX, está em [docs/conteudo-plano.md](docs/conteudo-plano.md). A fonte original em PDF permanece em [tcc.pdf](tcc.pdf).

## Executar o app localmente

```powershell
npx --yes serve public -p 3000
```

Abra `http://localhost:3000`. O app roda em **modo demonstração** com `localStorage` — o Firebase aparece no projeto apenas como **referência arquitetural** para a simulação do TCC, sem projeto real configurado.

### Assistente Zela (IA)

A **Assistente Zela** (`support/assistente.html`) responde dúvidas sobre direitos femininos 24h. Há um **balãozinho flutuante** em todas as telas.

- **Modo demo (padrão):** respostas automáticas locais por FAQ (`public/data/assistant-knowledge.json`)
- **Modo produção:** Cloud Function `assistantChat` + Gemini (chave só no backend)

Configuração:

1. Copie `.env.example` para `.env` e preencha Firebase + `GEMINI_API_KEY`
2. `cd functions && npm install`
3. `firebase functions:secrets:set GEMINI_API_KEY`
4. `firebase deploy --only functions,hosting`
5. Defina `window.ZL.assistantFunctionUrl` em `public/js/firebase-config.local.js` (não commitado) com a URL da function


## Deploy

- **GitHub Pages:** workflow em [`.github/workflows/pages.yml`](.github/workflows/pages.yml) — publica a pasta `public/` ao fazer merge em `main`. URL: https://kivizii.github.io/tcc-zela/ (requer Pages habilitado em Settings → Source: GitHub Actions).
- **Firebase Hosting:** `firebase deploy --only hosting` (requer Firebase CLI e projeto configurado).

## Sumário

- [O que é a Zela](#o-que-é-a-zela)
- [Funcionalidades principais](#funcionalidades-principais)
- [Público-alvo e enquadramento legal](#público-alvo-e-enquadramento-legal)
- [Identidade visual e UX](#identidade-visual-e-ux)
- [Stack prevista](#stack-prevista)
- [Banco de dados e testes](#banco-de-dados-e-testes)
- [Roadmap](#roadmap)
- [Backlog no Linear](#backlog-no-linear)
- [Executar o app](#executar-o-app-localmente)
- [Status do repositório](#status-do-repositório)

## O que é a Zela

A Zela é uma proposta de plataforma digital (e rede de apoio) para que mulheres se sintam protegidas, valorizadas, ouvidas e capazes de reconstruir a vida com dignidade. A missão combina **tecnologia**, **acolhimento** e **segurança**.

**Visão:** tornar-se uma das principais plataformas de apoio feminino no Brasil e, futuramente, no mundo, reconhecida por inovação, acolhimento e impacto social.

**Valores:** respeito, empatia, segurança, inclusão, igualdade, solidariedade, ética, responsabilidade social, proteção, saúde mental, união, combate à violência, confiança, acolhimento, liberdade e independência.

## Funcionalidades principais

| Área | O que oferece |
| --- | --- |
| Independência no cotidiano | Vídeos de reparos, manutenção e segurança em casa |
| Defesa pessoal | Conteúdos e cursos básicos de artes marciais |
| Mães solo | Orientações, encaminhamento profissional, rede de apoio e emprego |
| Creche parceira | Apoio para mães que trabalham, estudam ou fazem os cursos |
| Emprego e capacitação | Vagas e cursos gratuitos (tecnologia, administração, atendimento, educação, empreendedorismo) |
| Chaveiro de emergência | Botão disfarçado que alerta mulheres próximas, compartilha localização e aciona a rede de apoio |
| Apoio psicológico | Atendimento a ansiedade, medo, autoestima, violência psicológica e outros temas |
| Chat feminino | Espaço moderado de conversa, amizade e pedido de ajuda |
| Assistente Zela 24h | Chat 1-a-1 com respostas automáticas sobre direitos (FAQ local + IA via Gemini) |
| Mural de relatos | Histórias de superação, violência, maternidade solo e recomeços |
| Histórico de agressores | Denúncias e registros alinhados à legislação de privacidade |
| Sede de segurança | Acolhimento presencial, psicológico, jurídico e orientações |
| Cursos gratuitos | Informática, programação, educação financeira, defesa pessoal, empreendedorismo |

Homens familiares, amigos e apoiadores podem deixar mensagens de conscientização no chat e no mural, sem acesso às áreas exclusivas femininas.

## Público-alvo e enquadramento legal

**Público:** mulheres em vulnerabilidade, mães solo, vítimas de violência, pessoas em busca de emprego, apoio psicológico ou capacitação.

A atuação se alinha, entre outras normas, à:

- Lei Maria da Penha (Lei nº 11.340/2006)
- Constituição Federal de 1988 (igualdade e direitos fundamentais)
- Lei do Feminicídio (Lei nº 13.104/2015)
- Estatuto da Criança e do Adolescente (ECA), nos projetos com crianças e creche
- LGPD, no tratamento de dados pessoais, localização e contatos de confiança

## Identidade visual e UX

Interface pensada para **discrição**, **rapidez em emergência** e **privacidade por design** — aparência próxima a apps de organização ou bem-estar, sem elementos que denunciem a finalidade à primeira vista.

- **Layout:** minimalista, User-Centered Design, poucos elementos por tela, alvos de toque grandes, uso com uma mão
- **Paleta:** rosa claro, nude, bege, branco gelo, lilás suave e cinza claro; destaque só em ações importantes; cor contrastante no SOS
- **Tipografia:** sem serifa (Inter, Poppins, Nunito, SF Pro, Roboto); títulos semibold; textos regular; alertas em bold
- **Navegação:** tela inicial com emergência, contatos, localização e configurações; barra inferior consistente; poucos toques
- **Privacidade:** dados sensíveis só quando necessários; botão de saída rápida previsto no roadmap
- **Acessibilidade:** contraste, botões grandes, ícones reconhecíveis, linguagem simples

Prototipação: esboços em papel → wireframes → protótipo de alta fidelidade no **Figma**, alinhado a Material Design e Human Interface Guidelines.

## Stack prevista

| Camada | Tecnologia | Papel |
| --- | --- | --- |
| Estrutura | HTML | Telas, formulários, navegação e organização do conteúdo |
| Visual | CSS | Identidade discreta, layout responsivo, tipografia e acessibilidade |
| Interação | JavaScript | SOS, validação, localização, menus e respostas imediatas |
| Dados e auth | Firebase | Persistência de conta, contatos e configurações |

## Banco de dados e testes

O Firebase armazena conta da usuária, contatos de confiança e preferências, com regras de acesso, autenticação e o mínimo de dados pessoais necessário.

Testes previstos e descritos no plano: diferentes dispositivos e tamanhos de tela, responsividade, navegação e links, formulários (campos vazios e formatos inválidos), usabilidade sob pressão, recursos principais, integração interface–scripts–banco e regressão após correções.

## Roadmap

Melhorias futuras (detalhadas no DOCX):

- Botão de emergência com confirmação anti-acionamento acidental
- Localização em tempo real com prazo de expiração
- Mapa de DEAM, delegacias, hospitais e organizações de apoio
- Conteúdo educativo sobre tipos de violência e canais oficiais
- Saída rápida para página neutra
- Notificações, PWA / app nativo, painel administrativo, geolocalização e HTTPS

## Backlog no Linear

O planejamento de implementação (epics, tarefas, milestones e prioridades) está no **Linear**, no projeto [Zela](https://linear.app/tcc-zela/project/zela-d9fb9ef10605), team **Tcc-zela**.

| Milestone | Foco |
| --- | --- |
| M0-Setup | Estrutura do app, Firebase, design tokens, Figma |
| M1-MVP-Seguranca | SOS, contatos, autenticação, LGPD |
| M2-Features | Mapa, conteúdo, apoio social, chat, mural |
| M3-Testes | Qualidade, integração e regressão |
| M4-Roadmap | PWA, painel admin, IA, melhorias futuras |

**Labels:** `epic`, `feat`, `setup`, `ux`, `firebase`, `security`, `test`, `roadmap`, `docs`

### Conectar o Linear ao Cursor (MCP)

O repositório inclui [`.cursor/mcp.json`](.cursor/mcp.json) com o servidor oficial do Linear. Para usar o agente do Cursor para criar ou consultar issues:

1. Abra `Ctrl+Shift+J` → **MCP** e verifique o servidor **linear**.
2. Na primeira vez, complete o login OAuth no navegador.
3. Se o status ficar vermelho, desabilite e reabilite o servidor ou reinicie o Cursor.

Cada integrante da equipe autentica no próprio Cursor. Não commite API keys no repositório.

Fluxo de issues (andamento, conclusões, integração com Git): skill [`.cursor/skills/linear-workflow/SKILL.md`](.cursor/skills/linear-workflow/SKILL.md).

## Status do repositório

| Área | Status |
| --- | --- |
| Documentação acadêmica | ✅ Plano, DOCX, PDF |
| App web (`public/`) | ✅ HTML/CSS/JS implementado |
| Firebase | 📋 Referência de simulação (schema e regras de exemplo) |
| Testes | 📋 Checklist em [docs/testes-checklist.md](docs/testes-checklist.md) |
| Defesa | 📋 Roteiro em [docs/roteiro-defesa.md](docs/roteiro-defesa.md) |

Para o texto acadêmico completo (conclusões, aprendizados, exemplos de uso e detalhamento de testes), use o [DOCX](docs/Plano-Projeto-Zela.docx).
