const BASE_URL = "https://crudcrud.com/api/4f2d085beb8444f1a6d6ab1a85ab44eb/notebook";

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

function handleFormSubmit(event) {
  event.preventDefault();

  const note = {
    title: title.value.trim(),
    description: description.value.trim(),
  };

  axios
    .post(BASE_URL, note)
    .then(() => {
      form.reset();

      fetchNotes();
    })
    .catch((err) => console.error(err));
}

function fetchNotes() {
  axios
    .get(BASE_URL)
    .then((res) => {
      allNotes = res.data;

      searchNotes();
    })
    .catch((err) => console.error(err));
}

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
            <button onclick="deleteNote('${note._id}')">
                🗑 Delete
            </button>`;

    notesContainer.appendChild(card);
  });
}

function deleteNote(id) {
  axios
    .delete(BASE_URL + "/" + id)
    .then(() => {
      fetchNotes();
    })
    .catch((err) => console.error(err));
}

function searchNotes() {
  const searchText = searchBox.value.trim().toLowerCase();

  const filteredNotes = allNotes.filter((note) => {
    return note.title.toLowerCase().includes(searchText);
  });

  displayNotes(filteredNotes);
}
