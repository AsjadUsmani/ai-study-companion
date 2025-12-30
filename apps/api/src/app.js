import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import notesRoutes from "./routes/notes.routes.js";
dotenv.config();

const app = express();

// Security middlewares
app.use(helmet());
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}))
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Requesting too frequently, Please try again later.",
});
app.use(limiter);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/notes", notesRoutes)

export default app;
