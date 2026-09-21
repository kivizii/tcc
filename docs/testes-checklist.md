# Checklist de testes — Zela

Executar antes da defesa do TCC. Marcar cada item após validação.

## 10.1 — Múltiplos dispositivos / resoluções

- [ ] Testado em tela pequena (320px)
- [ ] Testado em tela média (375px — iPhone)
- [ ] Testado em tela grande (768px+)
- [ ] Botões e fontes proporcionais
- [ ] Sem quebra entre resoluções

## 10.2 — Responsividade

- [ ] Sem rolagem horizontal indevida
- [ ] Textos e botões sem sobreposição
- [ ] Cards e grid adaptam ao tamanho da tela

## 10.3 — Navegação e links

- [ ] Barra inferior leva às páginas corretas
- [ ] Atalhos da home funcionam
- [ ] Links em Configurações funcionam
- [ ] Sem rotas quebradas (404)

## 10.4 — Formulários

- [ ] Login: campos vazios rejeitados
- [ ] Login: e-mail inválido rejeitado
- [ ] Cadastro: senha curta rejeitada
- [ ] Contatos: telefone inválido rejeitado
- [ ] Mensagens de erro claras

## 10.5 — Regressão

- [ ] Correções não quebraram outras telas
- [ ] SOS ainda funciona após edição de contatos
- [ ] Navegação intacta após mudanças

## 10.6 — Usabilidade sob pressão

- [ ] Usuária nova encontra SOS em menos de 30 segundos
- [ ] Confirmação anti-acidental funciona
- [ ] Saída rápida acessível em 1 toque

## 10.6.1 — Contraste e acessibilidade visual

Ver ratios detalhados em [`design-system.md`](design-system.md#acessibilidade-wcag-aa).

- [ ] Texto principal legível sobre fundo branco-gelo
- [ ] Texto suave legível sobre fundos claros
- [ ] Botão SOS com contraste texto/fundo ≥ 4.5:1
- [ ] Links de conteúdo legíveis (cor texto, não lilás escuro)
- [ ] Touch targets ≥ 44px em botões e navegação
- [ ] Foco visível (`:focus-visible`) em elementos interativos

## 10.7 — Integração UI + JS + dados

- [ ] Cadastro → login → home
- [ ] Contatos persistem após recarregar página
- [ ] SOS registra evento (demo: localStorage)
- [ ] Chat e mural persistem mensagens

## Como executar localmente

1. Abra a pasta `public/` com Live Server (VS Code) ou:
   ```powershell
   npx --yes serve public -p 3000
   ```
2. Acesse `http://localhost:3000`
3. Crie uma conta de teste e percorra os fluxos acima
