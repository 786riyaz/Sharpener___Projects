import express from "express";

import {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote
} from "../controllers/notes.js";

const router = express.Router();


// POST /notes
router.post("/", createNote);


// GET /notes
// GET /notes?search=javascript
router.get("/", getNotes);


// GET /notes/:id
router.get("/:id", getNoteById);


// PUT /notes/:id
router.put("/:id", updateNote);


// DELETE /notes/:id
router.delete("/:id", deleteNote);


export default router;