import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-test", async (req, res) => {
    res.json({
      mcqs: [
        { question: "Mock question? (AI removed)", options: ["A", "B", "C", "D", "E"], correctAnswerIndex: 0, explanation: "AI features are disabled." }
      ],
      fillInBlanks: [],
      essays: [
        { question: "Mock essay? (AI removed)" }
      ]
    });
  });

  app.post("/api/evaluate-essay", async (req, res) => {
    res.json({
      score: 50,
      feedback: "AI evaluation is disabled."
    });
  });

  app.post("/api/tts", async (req, res) => {
    res.status(501).json({ error: 'TTS disabled (AI removed)' });
  });

  app.post("/api/transcribe", async (req, res) => {
    res.json({ text: "Transcription disabled (AI removed)" });
  });

  app.post("/api/generate-lesson-segment", async (req, res) => {
    res.json({
      teacherText: "Lesson segment disabled (AI removed).",
      quiz: { question: "AI removed?", options: ["Yes", "No", "Maybe", "Ok"], correctAnswerIndex: 0, explanation: "" },
      isEnd: false,
      notes: "AI disabled."
    });
  });

  app.post("/api/evaluate-lesson-quiz", async (req, res) => {
    res.json({ teacherReaction: "Evaluation disabled (AI removed)." });
  });

  app.post("/api/chat", async (req, res) => {
    res.json({ role: 'model', content: "Chat is disabled (AI removed)." });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
