# Roteiro de defesa — Zela · Zela por ela (10–15 min)

## 1. Contexto (2 min)

- Apresentar a Zela: missão, visão e valores
- Público-alvo: mulheres em vulnerabilidade, mães solo, vítimas de violência
- Enquadramento legal: Lei Maria da Penha, LGPD, Lei do Feminicídio

## 2. Demo ao vivo (5 min)

Ordem sugerida:

1. Abrir o site (URL pública ou localhost)
2. **Cadastrar** uma conta de demonstração
3. Na **home**, mostrar interface discreta e atalhos
4. Cadastrar **2–3 contatos de confiança**
5. Acionar o **botão SOS** → mostrar confirmação anti-acidental
6. Mostrar localização e contatos notificados (simulação)
7. Demonstrar **saída rápida** (botão "Sair" → página neutra)

## 3. Tour dos módulos (5 min)

Navegação rápida (30s cada):

- **Conteúdo:** vídeos, cursos, empregos
- **Apoio social:** mães solo, creche, psicológico
- **Comunidade:** chat feminino, mural de relatos
- **Mapa:** DEAM, hospitais, ONGs com filtros
- **Educativo:** tipos de violência, canais 180/190
- **Sede de segurança:** atendimento presencial

## 4. Arquitetura (2 min)

- Stack: HTML, CSS, JavaScript + Firebase
- Modo demonstração (localStorage) vs Firebase em produção
- Schema de dados: `users`, `contacts`, `sos_events`, `preferences`
- Regras Firestore: acesso por usuária autenticada

## 5. Testes (1 min)

- Checklist executado ([testes-checklist.md](testes-checklist.md))
- Teste de usabilidade sob pressão: SOS em < 30s
- Responsividade em múltiplos tamanhos de tela

## 6. Roadmap (1 min)

Itens planejados para versões futuras (M4):

- Chaveiro físico de emergência (hardware)
- Reconhecimento facial com consentimento
- Notificações push/SMS reais
- PWA / app nativo
- Painel administrativo de moderação
- IA para navegação (com privacidade)

## Perguntas frequentes da banca

**Por que HTML/CSS/JS e não React?**
→ Simplicidade, performance em dispositivos modestos, alinhamento ao plano do TCC.

**Como garantem a privacidade?**
→ LGPD, mínimo de dados, saída rápida, regras Firestore, HTTPS em produção.

**O SOS envia SMS de verdade?**
→ No MVP, simula notificação; integração SMS/push está no roadmap (TCC-36).

**Como moderam o chat?**
→ Moderação manual planejada; no protótipo, área exclusiva com login obrigatório.
