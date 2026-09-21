const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_PROMPT } = require("./knowledge");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 10;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const rateLimitMap = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);

  return entry.count <= RATE_LIMIT_MAX;
}

function sanitizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .slice(-MAX_HISTORY_TURNS)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      text: String(item?.text || "").trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((item) => item.text.length > 0);
}

function buildGeminiHistory(messages) {
  const history = [];
  for (let i = 0; i < messages.length - 1; i += 1) {
    const msg = messages[i];
    history.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }],
    });
  }
  return history;
}

exports.assistantChat = onRequest(
  {
    cors: true,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Método não permitido." });
      return;
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Limite de mensagens atingido. Tente novamente em alguns minutos." });
      return;
    }

    const messages = sanitizeMessages(req.body?.messages);
    if (messages.length === 0) {
      res.status(400).json({ error: "Nenhuma mensagem válida enviada." });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      res.status(400).json({ error: "A última mensagem deve ser da usuária." });
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: buildGeminiHistory(messages),
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await chat.sendMessage(lastMessage.text);
      const reply = result?.response?.text?.()?.trim();

      if (!reply) {
        res.status(502).json({ error: "Resposta vazia do serviço de IA." });
        return;
      }

      res.status(200).json({ reply, source: "ai" });
    } catch (err) {
      console.error("assistantChat error:", err.message);
      res.status(500).json({ error: "Não foi possível gerar a resposta agora. Tente novamente." });
    }
  }
);
