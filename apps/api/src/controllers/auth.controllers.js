import bcrypt from 'bcrypt'
import pool from '../utils/db.js';
import jwt from "jsonwebtoken"

export const register = async(req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10)
  await pool.query(
    "Insert into users (email, password) values ($1, $2)",
    [email, hashedPassword]
  )
  // DB logic will come later
  return res.status(201).json({
    message: "User registered successfully",
    user: { email },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body

  // 1. Find user
  const result = await pool.query(
    "SELECT id, email, password FROM users WHERE email = $1",
    [email]
  )

  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const user = result.rows[0]

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  // 3. Create JWT
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  // 4. Send token as HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return res.json({
    message: "Login successful",
    user: { id: user.id, email: user.email },
  })
}