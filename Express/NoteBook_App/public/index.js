const BASE_URL = "/api/notes";

const form = document.getElementById("noteForm");

const title = document.getElementById("title");
const description = document.getElementById("description");

const searchBox = document.getElementById("searchBox");

const notesContainer = document.getElementById("notesContainer");

const totalNotes = document.getElementById("totalNotes");
const showingNotes = document.getElementById("showingNotes");

const formHeading = document.getElementById("formHeading");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

let allNotes = [];

// Stores the ID of the note currently being edited.
// null means we are creating a new note.
let editingNoteId = null;

// ==============================
// LOAD NOTES
// ==============================

window.addEventListener("DOMContentLoaded", () => {
  fetchNotes();
});

// ==============================
// SEARCH
// ==============================

searchBox.addEventListener("input", searchNotes);

// ==============================
// CREATE / UPDATE
// ==============================

function handleFormSubmit(event) {
  event.preventDefault();

  const note = {
    title: title.value.trim(),
    description: description.value.trim(),
  };

  // If editingNoteId exists, update the note
  if (editingNoteId !== null) {
    axios
      .put(`${BASE_URL}/${editingNoteId}`, note)
      .then((res) => {
        console.log("Note updated:", res.data);

        resetForm();

        fetchNotes();
      })
      .catch((err) => {
        console.error("Error updating note:", err);
      });

    return;
  }

  // Otherwise create a new note
  axios
    .post(BASE_URL, note)
    .then((res) => {
      console.log("Note created:", res.data);

      resetForm();

      fetchNotes();
    })
    .catch((err) => {
      console.error("Error creating note:", err);
    });
}

// ==============================
// GET NOTES
// ==============================

function fetchNotes(search = "") {
  let url = BASE_URL;

  if (search) {
    url += `?search=${encodeURIComponent(search)}`;
  }

  axios
    .get(url)
    .then((res) => {
      allNotes = res.data;

      displayNotes(allNotes);
    })
    .catch((err) => {
      console.error("Error fetching notes:", err);
    });
}

// ==============================
// DISPLAY NOTES
// ==============================

function displayNotes(notes) {
  notesContainer.innerHTML = "";

  totalNotes.innerText = allNotes.length;
  showingNotes.innerText = notes.length;

  if (notes.length === 0) {
    notesContainer.innerHTML = `
            <div class="empty-message">
                <h2>No Notes Found</h2>

                <p>
                    ${allNotes.length === 0 ? "Create your first note." : "No matching notes found."}
                </p>
            </div>
        `;

    return;
  }

  notes.forEach((note) => {
    const card = document.createElement("div");

    card.className = "note-card";

    card.innerHTML = `
            <h3>${note.title}</h3>

            <p>${note.description}</p>

            <button
                onclick="editNote(${note.id})"
                style="background: #0ea5e9; margin-bottom: 8px;"
            >
                ✏️ Edit
            </button>

            <button
                onclick="deleteNote(${note.id})"
            >
                🗑 Delete
            </button>
        `;

    notesContainer.appendChild(card);
  });
}

// ==============================
// EDIT NOTE
// ==============================

function editNote(id) {
  // Find the note from the notes already loaded
  const note = allNotes.find((note) => note.id === id);

  if (!note) {
    console.error("Note not found");
    return;
  }

  // Store the ID
  editingNoteId = id;

  // Put note data into the form
  title.value = note.title;
  description.value = note.description;

  // Change form UI
  formHeading.innerText = "Edit Note";

  submitButton.innerText = "💾 Update Note";

  cancelButton.style.display = "block";

  // Scroll to the form
  form.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==============================
// CANCEL EDIT
// ==============================

function cancelEdit() {
  resetForm();
}

// ==============================
// RESET FORM
// ==============================

function resetForm() {
  form.reset();

  // Return to create mode
  editingNoteId = null;

  formHeading.innerText = "Create New Note";

  submitButton.innerText = "➕ Add Note";

  cancelButton.style.display = "none";
}

// ==============================
// DELETE NOTE
// ==============================

function deleteNote(id) {
  axios
    .delete(`${BASE_URL}/${id}`)
    .then((res) => {
      console.log("Note deleted:", res.data);

      // If the deleted note was being edited,
      // exit edit mode.
      if (editingNoteId === id) {
        resetForm();
      }

      fetchNotes();
    })
    .catch((err) => {
      console.error("Error deleting note:", err);
    });
}

// ==============================
// SEARCH NOTES
// ==============================

function searchNotes() {
  const searchText = searchBox.value.trim();

  fetchNotes(searchText);
}
