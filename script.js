document.addEventListener("DOMContentLoaded", () => {

  // --------- Element references ---------
  const addBookForm = document.getElementById("addBookForm");
  const titleInput = document.getElementById("titleInput");
  const authorInput = document.getElementById("authorInput");
  const genreInput = document.getElementById("genreInput");
  const chapterInput = document.getElementById("chapterInput");
  const linkInput = document.getElementById("linkInput");
  const libraryContainer = document.getElementById("libraryContainer");
  const themeToggle = document.getElementById("themeToggle");

  // --------- App state ---------
  let library = [];

  // --------- Load / Save ---------
  function loadLibrary() {
    const stored = localStorage.getItem("library");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) library = parsed;
    } catch (e) {
      console.error("Failed to parse stored library:", e);
    }
  }

  function saveLibrary() {
    localStorage.setItem("library", JSON.stringify(library));
  }

  // Initialize
  loadLibrary();

  // --------- Add Book ---------
  addBookForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const genre = genreInput.value.trim();
    const link = linkInput.value.trim();
    let chapter = parseInt(chapterInput.value, 10);
    if (!Number.isFinite(chapter) || chapter < 1) chapter = 1;

    if (!title || !author) {
      // Title & Author are required
      alert("Please enter Title and Author.");
      return;
    }

    const book = {
      id: Date.now(),
      title,
      author,
      genre: genre || "",
      chapter,
      link: link || "",
      read: false
    };

    library.push(book);
    saveLibrary();
    renderBooks();
    addBookForm.reset();
  });

  // --------- Render Books ---------
  function renderBooks() {
    libraryContainer.innerHTML = "";

    library.forEach((book, index) => {
      const card = document.createElement("article");
      card.className = "book-card";
      if (book.read) card.classList.add("read");

      // Title
      const titleEl = document.createElement("h3");
      titleEl.textContent = book.title;
      card.appendChild(titleEl);

      // Author + Genre
      const meta = document.createElement("div");
      meta.className = "card-meta";
      meta.innerHTML = `<div><strong>Author:</strong> ${book.author}</div>
                        <div><strong>Genre:</strong> ${book.genre || ""}</div>`;
      card.appendChild(meta);

      // Link (if exists) + Edit/Add Link button
      const linkRow = document.createElement("div");
      linkRow.className = "link-row";

      const linkButton = document.createElement("button");
      linkButton.className = "small-btn";
      linkButton.textContent = book.link ? "Open Book" : "Add Link";
      linkButton.addEventListener("click", () => {
        if (book.link) {
          window.open(book.link, "_blank", "noopener");
        } else {
          // If there is no link, start inline add flow
          startLinkEdit(book, card, null, null);
        }
      });
      linkRow.appendChild(linkButton);

      const editLinkBtn = document.createElement("button");
      editLinkBtn.className = "small-btn";
      editLinkBtn.textContent = book.link ? "Edit Link" : " ";
      // Hide the edit button text if there is no link
      if (!book.link) editLinkBtn.style.display = "none";

      editLinkBtn.addEventListener("click", () => {
        // Find the actual link anchor if present for hiding 
        startLinkEdit(book, card);
      });

      linkRow.appendChild(editLinkBtn);
      card.appendChild(linkRow);

      // If book has a link, show as a styled anchor below the buttons
      if (book.link) {
        const anchor = document.createElement("a");
        anchor.href = book.link;
        anchor.className = "book-link";
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = "Open Book";
        card.appendChild(anchor);
      }

      // Chapter row + Edit
      const chapterRow = document.createElement("div");
      chapterRow.className = "chapter-row";

      const chapterLabel = document.createElement("span");
      chapterLabel.textContent = "Chapter:";
      chapterRow.appendChild(chapterLabel);

      const chapterDisplay = document.createElement("span");
      chapterDisplay.textContent = book.chapter;
      chapterRow.appendChild(chapterDisplay);

      const editChapterBtn = document.createElement("button");
      editChapterBtn.textContent = "Edit";
      editChapterBtn.className = "small-btn";
      chapterRow.appendChild(editChapterBtn);

      card.appendChild(chapterRow);

      // Edit chapter inline
      editChapterBtn.addEventListener("click", () => {
        // create input and save/cancel
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

        // hide display while editing
        chapterDisplay.style.display = "none";
        editChapterBtn.style.display = "none";

        // append editors
        chapterRow.appendChild(input);
        chapterRow.appendChild(saveBtn);
        chapterRow.appendChild(cancelBtn);

        input.focus();
        input.select();

        saveBtn.addEventListener("click", () => {
          const newVal = parseInt(input.value, 10);
          const final = Number.isFinite(newVal) && newVal >= 1 ? newVal : 1;
          book.chapter = final;
          saveLibrary();
          renderBooks();
        });

        cancelBtn.addEventListener("click", () => renderBooks());

        input.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") saveBtn.click();
          if (ev.key === "Escape") cancelBtn.click();
        });
      });

      // Read & Delete buttons
      const btnRow = document.createElement("div");
      btnRow.className = "card-buttons";

      const readBtn = document.createElement("button");
      readBtn.className = "small-btn";
      readBtn.textContent = book.read ? "Mark Unread" : "Mark Read";
      readBtn.addEventListener("click", () => {
        book.read = !book.read;
        saveLibrary();
        renderBooks();
      });

      const delBtn = document.createElement("button");
      delBtn.className = "small-btn danger";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        if (confirm(`Delete "${book.title}"?`)) {
          library = library.filter(b => b.id !== book.id);
          saveLibrary();
          renderBooks();
        }
      });

      btnRow.appendChild(readBtn);
      btnRow.appendChild(delBtn);
      card.appendChild(btnRow);

      // add to container
      libraryContainer.appendChild(card);
    });
  } // end renderBooks

  // --------- Inline Link Editing ---------
  function startLinkEdit(book, card, oldLinkEl = null, oldBtn = null) {
    // hide existing anchor/button elements inside this card if present
    if (oldLinkEl) oldLinkEl.style.display = "none";
    if (oldBtn) oldBtn.style.display = "none";

    // create input + save/cancel
    const input = document.createElement("input");
    input.type = "url";
    input.value = book.link || "";
    input.placeholder = "Paste link...";
    input.className = "link-input";

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
    input.select();

    saveBtn.addEventListener("click", () => {
      book.link = input.value.trim();
      saveLibrary();
      renderBooks();
    });

    cancelBtn.addEventListener("click", () => renderBooks());

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") saveBtn.click();
      if (ev.key === "Escape") cancelBtn.click();
    });
  }

  // --------- Theme toggle ---------
  (function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "Light Mode";
    }
  })();

  themeToggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
    themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
  });

  // initial render
  renderBooks();

}); // DOMContentLoaded end
