import express from "express"
import auth from "../middlewares/auth.js"
import { createNote, deleteNote, generateQuiz, getNotes, getSingleNote, summarizeNote, tutorNote, updateNote } from "../controllers/notes.controller.js"
import { createNoteValidator } from "../validators/notes.validator.js"
import { validate } from "../middlewares/validate.js"

const router = express.Router()

router.post("/", auth, createNoteValidator, validate, createNote)
router.get("/", auth, getNotes)
router.post("/summarize", auth, summarizeNote)
router.post("/tutor", auth, tutorNote)
router.post("/quiz", auth, generateQuiz)
router.put("/:id", auth, updateNote);
router.delete("/:id", auth, deleteNote);
router.get("/:id", auth, getSingleNote);


export default router
