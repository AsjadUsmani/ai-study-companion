import bcrypt from "bcrypt";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for existing user
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashedPassword,
    ]);

    return res.status(201).json({
      message: "User registered successfully",
      user: { email },
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const result = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Create JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. Send token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred during login"
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: "true",
  })

  return res.json({ message: "Logged out successfully" })
}