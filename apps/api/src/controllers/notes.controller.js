import aiClient from "../utils/aiClient.js";
import pool from "../utils/db.js";

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;
    const result = await pool.query(
      "INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, title, content, created_at",
      [userId, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error creating note: ${error}`);
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, title, content, created_at
     FROM notes
     WHERE user_id = $1
     ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching notes: ${error}`);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const summarizeNote = async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.user.id;

    // 1. Get note
    const noteRes = await pool.query(
      "SELECT content, summary FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (noteRes.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const note = noteRes.rows[0];

    // 2. Return cached summary
    if (note.summary) {
      return res.json({ summary: note.summary, cached: true });
    }

    // 3. Call AI
    const aiRes = await aiClient.post("/summarize", {
      text: note.content,
    });

    const summary = aiRes.data.summary;

    // 4. Save summary
    await pool.query("UPDATE notes SET summary = $1 WHERE id = $2", [
      summary,
      req.body.noteId,
    ]);

    return res.json({ summary, cached: false });
  } catch (error) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: "Failed to summarize note" });
  }
};
