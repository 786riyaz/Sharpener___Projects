const BASE_URL = "/api/notes";

const form = document.getElementById("noteForm");

const title = document.getElementById("title");
const description = document.getElementById("description");

const searchBox = document.getElementById("searchBox");

const notesContainer = document.getElementById("notesContainer");

const totalNotes = document.getElementById("totalNotes");
const showingNotes = document.getElementById("showingNotes");

let allNotes = [];


window.addEventListener("DOMContentLoaded", () => {
    fetchNotes();
});


searchBox.addEventListener("input", searchNotes);


// POST
function handleFormSubmit(event) {
    event.preventDefault();

    const note = {
        title: title.value.trim(),
        description: description.value.trim()
    };

    axios
        .post(BASE_URL, note)
        .then((res) => {

            console.log("Note created:", res.data);

            form.reset();

            fetchNotes();

        })
        .catch((err) => {
            console.error("Error creating note:", err);
        });
}


// GET
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


// Display notes
function displayNotes(notes) {

    notesContainer.innerHTML = "";

    totalNotes.innerText = allNotes.length;
    showingNotes.innerText = notes.length;


    if (notes.length === 0) {

        notesContainer.innerHTML = `
            <div class="empty-message">
                <h2>No Notes Found</h2>
                <p>
                    ${
                        allNotes.length === 0
                            ? "Create your first note."
                            : "No matching notes found."
                    }
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

            <button onclick="deleteNote(${note.id})">
                🗑 Delete
            </button>
        `;


        notesContainer.appendChild(card);
    });
}


// DELETE
function deleteNote(id) {

    axios
        .delete(`${BASE_URL}/${id}`)
        .then((res) => {

            console.log("Note deleted:", res.data);

            fetchNotes();

        })
        .catch((err) => {
            console.error("Error deleting note:", err);
        });
}


// SEARCH
function searchNotes() {

    const searchText = searchBox.value.trim();

    fetchNotes(searchText);
}