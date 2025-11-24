// ===============================================================
// SECTION 1 — Main storage + Load/Save + Add Book Form
// ===============================================================

let library = [];

// Load saved books
function loadLibrary() {
    const stored = localStorage.getItem("library");
    if (stored) library = JSON.parse(stored);
}
loadLibrary();

// Save books
function saveLibrary() {
    localStorage.setItem("library", JSON.stringify(library));
}

// Handle "Add Book" form
document.getElementById("addBookForm").addEventListener("submit", (ev) => {
    ev.preventDefault();

    const title = titleInput.value.trim();
    const chapter = parseInt(chapterInput.value) || 1;
    const link = linkInput.value.trim();

    if (!title) return;

    library.push({
        id: Date.now(),
        title,
        chapter,
        link,
        completed: false
    });

    saveLibrary();
    renderBooks();
    ev.target.reset();
});

// ===============================================================
// SECTION 2 — Rendering the Library (DOM creation)
// ===============================================================

function renderBooks() {
    const container = document.getElementById("libraryContainer");
    container.innerHTML = "";

    library.forEach(book => {
        const card = document.createElement("article");
        card.className = "book-card";

        // title
        const titleEl = document.createElement("h3");
        titleEl.textContent = book.title;
        card.appendChild(titleEl);

        // chapter row
        const chapterRow = document.createElement("p");
        chapterRow.innerHTML = `
            <strong>Chapter:</strong> 
            <span class="chapter-display">${book.chapter}</span>
        `;
        card.appendChild(chapterRow);

        // edit chapter button
        const editChapterBtn = document.createElement("button");
        editChapterBtn.textContent = "Edit Chapter";
        editChapterBtn.className = "small-btn";
        chapterRow.appendChild(editChapterBtn);

        const displaySpan = chapterRow.querySelector(".chapter-display");
        editChapterBtn.addEventListener("click", () => {
            enableChapterEditing(book, chapterRow, displaySpan, editChapterBtn);
        });

        // reading link (if exists)
        if (book.link) {
            createEditableLink(book, card);
        } else {
            const addLinkBtn = document.createElement("button");
            addLinkBtn.textContent = "Add Link";
            addLinkBtn.className = "small-btn";
            card.appendChild(addLinkBtn);

            addLinkBtn.addEventListener("click", () => {
                startLinkEdit(book, card);
            });
        }

        // toggle completed
        const readBtn = document.createElement("button");
        readBtn.textContent = book.completed ? "Mark Incomplete" : "Mark Read";
        readBtn.className = "small-btn";
        readBtn.addEventListener("click", () => toggleRead(book.id));
        card.appendChild(readBtn);

        // delete
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "small-btn danger";
        deleteBtn.addEventListener("click", () => deleteBook(book.id));
        card.appendChild(deleteBtn);

        container.appendChild(card);
    });
}

renderBooks();

// ===============================================================
// SECTION 3 — Delete + Toggle functions
// ===============================================================

function deleteBook(id) {
    library = library.filter(b => b.id !== id);
    saveLibrary();
    renderBooks();
}

function toggleRead(id) {
    const book = library.find(b => b.id === id);
    if (!book) return;

    book.completed = !book.completed;
    saveLibrary();
    renderBooks();
}

// ===============================================================
// SECTION 4 — Inline Chapter Editing
// ===============================================================

function enableChapterEditing(book, row, display, btn) {
    display.style.display = "none";
    btn.style.display = "none";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.value = book.chapter;
    input.className = "chapter-input";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "small-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "small-btn";

    row.appendChild(input);
    row.appendChild(saveBtn);
    row.appendChild(cancelBtn);

    input.focus();

    saveBtn.addEventListener("click", () => {
        const val = parseInt(input.value) || 1;
        book.chapter = val;
        saveLibrary();
        renderBooks();
    });

    cancelBtn.addEventListener("click", () => renderBooks());
}

// ===============================================================
// SECTION 5 — Editable Link Feature
// ===============================================================

function createEditableLink(book, card) {
    const linkEl = document.createElement("a");
    linkEl.href = book.link;
    linkEl.target = "_blank";
    linkEl.textContent = "Open Book";
    linkEl.className = "book-link";
    card.appendChild(linkEl);

    const editLinkBtn = document.createElement("button");
    editLinkBtn.textContent = "Edit Link";
    editLinkBtn.className = "small-btn";
    card.appendChild(editLinkBtn);

    editLinkBtn.addEventListener("click", () => {
        startLinkEdit(book, card, linkEl, editLinkBtn);
    });
}

function startLinkEdit(book, card, oldLinkEl = null, oldBtn = null) {
    if (oldLinkEl) oldLinkEl.style.display = "none";
    if (oldBtn) oldBtn.style.display = "none";

    const input = document.createElement("input");
    input.type = "url";
    input.value = book.link;
    input.placeholder = "Enter link…";
    input.className = "chapter-input";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "small-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "small-btn";

    card.appendChild(input);
    card.appendChild(saveBtn);
    card.appendChild(cancelBtn);

    input.focus();

    saveBtn.addEventListener("click", () => {
        book.link = input.value.trim();
        saveLibrary();
        renderBooks();
    });

    cancelBtn.addEventListener("click", () => renderBooks());
}

// ===============================================================
// SECTION 6 — Dark Mode Toggle
// ===============================================================

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");

    themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
});
