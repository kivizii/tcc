/**
 * Copie este arquivo para firebase-config.local.js e preencha com suas credenciais.
 * Adicione no HTML antes do bootstrap (opcional):
 * <script src="js/firebase-config.local.js"></script>
 */
window.ZL = window.ZL || {};
Object.assign(window.ZL.firebaseConfig, {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
});

/** URL da Cloud Function assistantChat após deploy (ex.: https://us-central1-seu-projeto.cloudfunctions.net/assistantChat) */
window.ZL.assistantFunctionUrl = "";
