import { body } from "express-validator";

export const createNoteValidator = [
    body("title").notEmpty().withMessage("Title is required."),
    body("content").notEmpty().withMessage("Content is required.")
]