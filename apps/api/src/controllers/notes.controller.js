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
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const notesRes = await pool.query(
      `
    SELECT id, title, content, summary, created_at
    FROM notes
    WHERE user_id = $1
      AND (
        title ILIKE $2
        OR content ILIKE $2
      )
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4
    `,
      [userId, `%${search}%`, limit, offset]
    );

    const countRes = await pool.query(
      `
    SELECT COUNT(*) FROM notes
    WHERE user_id = $1
      AND (
        title ILIKE $2
        OR content ILIKE $2
      )
    `,
      [userId, `%${search}%`]
    );

    res.json({
      notes: notesRes.rows,
      total: parseInt(countRes.rows[0].count),
      page,
      limit,
    });
  } catch (error) {
    console.error(`Error fetching notes: ${error}`);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const getSingleNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const result = await pool.query(
      `
      SELECT id, title, content, created_at
      FROM notes
      WHERE id = $1 AND user_id = $2
      `,
      [noteId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching note: ${error}`);
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

export const summarizeNote = async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: "noteId is required" });
    }

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

    const summary = aiRes.data?.summary;

    if (!summary) {
      throw new Error("AI service returned invalid response");
    }
    // 4. Save summary
    await pool.query("UPDATE notes SET summary = $1 WHERE id = $2", [
      summary,
      noteId,
    ]);

    return res.json({ summary, cached: false });
  } catch (error) {
    console.error("AI ERROR STATUS:", error.response?.status);
    console.error("AI ERROR DATA:", error.response?.data);
    console.error("AI ERROR MESSAGE:", error.message);
    console.error("Summarize error:", error);
    res.status(500).json({ error: "Failed to summarize note" });
  }
};

export const tutorNote = async (req, res) => {
  try {
    const { noteId, question } = req.body;
    const userId = req.user.id;

    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: "Question is too short" });
    }

    const noteRes = await pool.query(
      "SELECT content FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (noteRes.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const noteContent = noteRes.rows[0].content;

    const aiRes = await aiClient.post("/tutor", {
      note: noteContent,
      question,
    });

    return res.json({ answer: aiRes.data.answer });
  } catch (error) {
    console.error("AI ERROR STATUS:", error.response?.status);
  console.error("AI ERROR DATA:", error.response?.data);
  console.error("AI ERROR MESSAGE:", error.message);
    res.status(500).json({ error: "Tutor mode failed" });
  }
};

export const generateQuiz = async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.user.id;

    const noteRes = await pool.query(
      "SELECT content FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (noteRes.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const aiRes = await aiClient.post("/quiz", {
      note: noteRes.rows[0].content,
    });

    return res.json(aiRes.data);
  } catch (error) {
    console.error("AI ERROR STATUS:", error.response?.status);
  console.error("AI ERROR DATA:", error.response?.data);
  console.error("AI ERROR MESSAGE:", error.message);
    console.error("Quiz error:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const result = await pool.query(
      `
      UPDATE notes
      SET title = $1, content = $2, summary = NULL
      WHERE id = $3 AND user_id = $4
      RETURNING id
      `,
      [title, content, noteId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating note: ${error}`);
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting note: ${error}`);
    res.status(500).json({ error: "Failed to delete note" });
  }
};
