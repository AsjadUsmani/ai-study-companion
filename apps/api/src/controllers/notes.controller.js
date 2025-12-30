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
  )

  res.json(result.rows)
  } catch (error) {
    console.error(`Error fetching notes: ${error}`);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};
