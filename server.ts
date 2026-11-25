import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Personalized kid-friendly explanation (spec §10 & §14: Gemini only generates personalized explanations; official answer comes from vetted bank)
app.post('/api/ai/explain', async (req, res) => {
  try {
    const {
      grade,
      subject,
      question,
      correctAnswer,
      studentAnswer,
      baseExplanation,
      spiritName,
    } = req.body ?? {};

    if (!question || !correctAnswer) {
      res.status(400).json({ error: '缺少題目或正確答案資訊。' });
      return;
    }

    const ai = getGeminiClient();
    const safeGrade = Math.min(6, Math.max(3, Number(grade) || 5));
    const prompt = [
      `年級：國小${safeGrade}年級`,
      `科目：${String(subject || '綜合').slice(0, 20)}`,
      `題目：${String(question).slice(0, 300)}`,
      `學生作答：${String(studentAnswer || '未作答').slice(0, 120)}`,
      `審核正確答案：${String(correctAnswer).slice(0, 120)}`,
      `原始解析：${String(baseExplanation || '').slice(0, 300)}`,
      `請以守護精靈「${String(spiritName || '智光精靈').slice(0, 20)}」的溫暖鼓勵口吻，用繁體中文（台灣用語）寫出 80～140 字的簡單步驟講解，不可更改正確答案，不要用艱深詞彙，最後給一句簡短加油。`,
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          '你是台灣國小108課綱學習遊戲《智光守護者》的兒童友善守護精靈老師。請全程使用溫暖正向的台灣繁體中文，絕不出現暴力、不當或批評字眼，嚴格遵守審核題庫的正確答案，回覆簡潔清楚、適合國小三到六年級閱讀，限制在 150 字以內。',
      },
    });

    const text = (response.text ?? '').trim();
    if (!text) {
      res.status(502).json({ error: '精靈暫時沒有回應，請稍後再試。' });
      return;
    }
    res.json({ explanation: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'GEMINI_API_KEY_NOT_CONFIGURED') {
      res.status(503).json({
        error: '尚未設定 Gemini API 金鑰，目前僅顯示審核題庫內建解析。',
      });
      return;
    }
    res.status(502).json({ error: `AI 解析服務暫時無法連線：${message}` });
  }
});

// Guardian Spirit lobby encouragement & study tip
app.post('/api/ai/spirit-chat', async (req, res) => {
  try {
    const {
      nickname,
      grade,
      spiritName,
      spiritStage,
      wrongCount,
      weakTopic,
      userTopic,
    } = req.body ?? {};

    const ai = getGeminiClient();
    const prompt = [
      `玩家暱稱：${String(nickname || '小守護者').slice(0, 16)}（國小${Number(grade) || 5}年級）`,
      `守護精靈：${String(spiritName || '墨麒麟').slice(0, 20)}（階段：${String(spiritStage || '幼體').slice(0, 10)}）`,
      `待複習錯題數：${Number(wrongCount) || 0}`,
      weakTopic ? `最近較弱知識點：${String(weakTopic).slice(0, 40)}` : '',
      `玩家想問或互動的主題：${String(userTopic || '今天要學什麼好呢？').slice(0, 120)}`,
      '請以精靈口吻回覆一句溫暖有趣、帶點奇幻冒險感的繁體中文鼓勵或學習小秘訣（限 60 字內）。',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          '你是兒童安全學習遊戲《智光守護者》的守護精靈。只聊學習、鼓勵、讀書小技巧與智光世界冒險，不可索取任何個資，回覆用親切台灣繁體中文，控制在 70 字以內。',
      },
    });

    const reply = (response.text ?? '').trim();
    if (!reply) {
      res.status(502).json({ error: '精靈正在打盹，請再點一次試試看。' });
      return;
    }
    res.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'GEMINI_API_KEY_NOT_CONFIGURED') {
      res.status(503).json({
        error: '尚未設定 Gemini API 金鑰，請在 Settings > Secrets 確認設定。',
      });
      return;
    }
    res.status(502).json({ error: `精靈語音連線暫時異常：${message}` });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lumina Guardian] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
