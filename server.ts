import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("mathsahabat.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    title TEXT,
    content TEXT,
    grade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    user_email TEXT,
    content TEXT,
    is_tutor INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(question_id) REFERENCES questions(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/questions", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions WHERE status = 'active' ORDER BY created_at DESC").all();
    res.json(questions);
  });

  app.post("/api/questions", (req, res) => {
    const { title, content, grade, user_email } = req.body;
    // Simple moderation: check for bad words (mock)
    const badWords = ["kasar", "jahat"]; // Example
    const isInappropriate = badWords.some(word => content.toLowerCase().includes(word));
    
    const status = isInappropriate ? 'pending' : 'active';
    const info = db.prepare("INSERT INTO questions (title, content, grade, user_email, status) VALUES (?, ?, ?, ?, ?)").run(title, content, grade, user_email, status);
    res.json({ id: info.lastInsertRowid, status });
  });

  app.get("/api/questions/:id/answers", (req, res) => {
    const answers = db.prepare("SELECT * FROM answers WHERE question_id = ? ORDER BY created_at ASC").all(req.params.id);
    res.json(answers);
  });

  app.post("/api/answers", (req, res) => {
    const { question_id, content, user_email, is_tutor } = req.body;
    const info = db.prepare("INSERT INTO answers (question_id, content, user_email, is_tutor) VALUES (?, ?, ?, ?)").run(question_id, content, user_email, is_tutor ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
