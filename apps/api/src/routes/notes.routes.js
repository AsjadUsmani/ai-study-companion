import express from "express"
import auth from "../middlewares/auth.js"
import { createNote, getNotes, summarizeNote } from "../controllers/notes.controller.js"
import { createNoteValidator } from "../validators/notes.validator.js"
import { validate } from "../middlewares/validate.js"

const router = express.Router()

router.post("/", auth, createNoteValidator, validate, createNote)
router.get("/", auth, getNotes)
router.post("/summarize", auth, summarizeNote)

export default router
