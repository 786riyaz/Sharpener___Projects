import { Op } from "sequelize";
import Note from "../models/notes.js";

// POST /notes
const createNote = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      description: description.trim(),
    });

    console.log(`Note created successfully. ID: ${note.id}, Title: ${note.title}`);

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Error creating note:", error);

    res.status(500).json({
      message: "Failed to create note",
    });
  }
};

// GET /notes
// GET /notes?search=javascript
const getNotes = async (req, res) => {
  try {
    const { search } = req.query;

    let where = {};

    if (search && search.trim() !== "") {
      where = {
        title: {
          [Op.like]: `%${search.trim()}%`,
        },
      };
    }

    const notes = await Note.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    console.log(search ? `Notes searched successfully: ${search}` : "All notes retrieved successfully.");

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error retrieving notes:", error);

    res.status(500).json({
      message: "Failed to retrieve notes",
    });
  }
};

// GET /notes/:id
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Error retrieving note:", error);

    res.status(500).json({
      message: "Failed to retrieve note",
    });
  }
};

// PUT /notes/:id
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await note.update({
      title: title.trim(),
      description: description.trim(),
    });

    console.log(`Note updated successfully. ID: ${note.id}, Title: ${note.title}`);

    res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Error updating note:", error);

    res.status(500).json({
      message: "Failed to update note",
    });
  }
};

// DELETE /notes/:id
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    await note.destroy();

    console.log(`Note deleted successfully. ID: ${id}`);

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);

    res.status(500).json({
      message: "Failed to delete note",
    });
  }
};

export { createNote, getNotes, getNoteById, updateNote, deleteNote };
