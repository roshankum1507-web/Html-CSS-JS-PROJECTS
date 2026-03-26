"use strict";

const STORAGE_KEY = "notes-app-items";
const THEME_KEY = "notes-app-theme";
const DEFAULT_COLOR = "#fffdf8";
const notesContainer = document.getElementById("notes-container");
const createNoteBtn = document.getElementById("create-note");
const clearAllBtn = document.getElementById("clear-all");
const themeToggleBtn = document.getElementById("theme-toggle");
const exportBtn = document.getElementById("export-notes");
const importTriggerBtn = document.getElementById("import-trigger");
const importFileInput = document.getElementById("import-file");
const searchInput = document.getElementById("search");
const tagFilter = document.getElementById("tag-filter");
const statusText = document.getElementById("status");

let notes = [];
let searchQuery = "";
let selectedTag = "all";
let draggedId = null;

function clearAllNotes() {
    notes = [];
    saveNotes();
    renderNotes();
}

function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function extractTags(content) {
    const matches = content.toLowerCase().match(/#[a-z0-9_-]+/g) || [];
    return [...new Set(matches.map((tag) => tag.slice(1)))];
}

function normalizeNote(raw) {
    if (!raw || typeof raw !== "object") {
        return null;
    }

    const id = typeof raw.id === "string" && raw.id ? raw.id : null;
    if (!id) {
        return null;
    }

    const content = typeof raw.content === "string" ? raw.content : "";
    const color = typeof raw.color === "string" && raw.color ? raw.color : DEFAULT_COLOR;
    const markdown = Boolean(raw.markdown);
    const tags = Array.isArray(raw.tags)
        ? raw.tags.filter((tag) => typeof tag === "string" && tag.trim())
        : extractTags(content);

    return { id, content, color, markdown, tags };
}

function updateStatus() {
    const visibleCount = getFilteredNotes().length;
    statusText.textContent = `${visibleCount} shown / ${notes.length} note${notes.length === 1 ? "" : "s"}`;
}

function updateTagFilterOptions() {
    const allTags = [...new Set(notes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b));
    const previousValue = tagFilter.value;

    tagFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All tags";
    tagFilter.appendChild(allOption);

    allTags.forEach((tag) => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = `#${tag}`;
        tagFilter.appendChild(option);
    });

    if (allTags.includes(previousValue)) {
        tagFilter.value = previousValue;
        selectedTag = previousValue;
    } else {
        tagFilter.value = "all";
        selectedTag = "all";
    }
}

function getFilteredNotes() {
    return notes.filter((note) => {
        const queryMatch = !searchQuery || note.content.toLowerCase().includes(searchQuery);
        const tagMatch = selectedTag === "all" || note.tags.includes(selectedTag);
        return queryMatch && tagMatch;
    });
}

function noteMatchesActiveFilters(note) {
    const queryMatch = !searchQuery || note.content.toLowerCase().includes(searchQuery);
    const tagMatch = selectedTag === "all" || note.tags.includes(selectedTag);
    return queryMatch && tagMatch;
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderMarkdown(content) {
    const escaped = escapeHtml(content);
    const lines = escaped.split("\n");
    let inList = false;
    const htmlParts = [];

    lines.forEach((line) => {
        if (/^\s*[-*]\s+/.test(line)) {
            if (!inList) {
                htmlParts.push("<ul>");
                inList = true;
            }
            const item = line.replace(/^\s*[-*]\s+/, "");
            htmlParts.push(`<li>${formatInlineMarkdown(item)}</li>`);
            return;
        }

        if (inList) {
            htmlParts.push("</ul>");
            inList = false;
        }

        if (!line.trim()) {
            htmlParts.push("<br>");
            return;
        }

        if (/^###\s+/.test(line)) {
            htmlParts.push(`<h3>${formatInlineMarkdown(line.replace(/^###\s+/, ""))}</h3>`);
            return;
        }
        if (/^##\s+/.test(line)) {
            htmlParts.push(`<h2>${formatInlineMarkdown(line.replace(/^##\s+/, ""))}</h2>`);
            return;
        }
        if (/^#\s+/.test(line)) {
            htmlParts.push(`<h1>${formatInlineMarkdown(line.replace(/^#\s+/, ""))}</h1>`);
            return;
        }

        htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
    });

    if (inList) {
        htmlParts.push("</ul>");
    }

    return htmlParts.join("");
}

function formatInlineMarkdown(text) {
    return text
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/(^|\s)#([a-z0-9_-]+)/gi, "$1<span class=\"tag-chip\">#$2</span>");
}

function renderNotes() {
    notesContainer.innerHTML = "";
    updateTagFilterOptions();
    const visibleNotes = getFilteredNotes();

    if (notes.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No notes yet. Click Create Note to start.";
        notesContainer.appendChild(emptyState);
        updateStatus();
        return;
    }

    if (visibleNotes.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No matching notes for this search/filter.";
        notesContainer.appendChild(emptyState);
        updateStatus();
        return;
    }

    visibleNotes.forEach((note) => {
        const card = document.createElement("article");
        card.className = "note-card";
        card.dataset.id = note.id;
        card.draggable = true;
        card.style.setProperty("--note-color", note.color);

        const toolbar = document.createElement("div");
        toolbar.className = "note-toolbar";

        const dragHint = document.createElement("span");
        dragHint.textContent = "Drag to reorder";

        const colorInput = document.createElement("input");
        colorInput.className = "note-color";
        colorInput.type = "color";
        colorInput.value = note.color;
        colorInput.title = "Change note color";

        const markdownToggle = document.createElement("button");
        markdownToggle.className = "btn-ghost btn-small btn-markdown";
        markdownToggle.type = "button";
        markdownToggle.textContent = note.markdown ? "Edit" : "Markdown";

        toolbar.append(dragHint, colorInput, markdownToggle);

        const editor = document.createElement("textarea");
        editor.className = "note-input";
        editor.spellcheck = true;
        editor.value = note.content;
        if (note.markdown) {
            editor.classList.add("is-hidden");
        }

        const preview = document.createElement("div");
        preview.className = "note-preview";
        preview.innerHTML = renderMarkdown(note.content);
        if (!note.markdown) {
            preview.classList.add("is-hidden");
        }

        const tagsWrap = document.createElement("div");
        tagsWrap.className = "note-tags";
        note.tags.forEach((tag) => {
            const chip = document.createElement("span");
            chip.className = "tag-chip";
            chip.textContent = `#${tag}`;
            tagsWrap.appendChild(chip);
        });

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-delete";
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";

        actions.appendChild(deleteBtn);
        card.appendChild(toolbar);
        card.appendChild(editor);
        card.appendChild(preview);
        card.appendChild(tagsWrap);
        card.appendChild(actions);
        notesContainer.appendChild(card);
    });

    updateStatus();
}

function addNote() {
    notes.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        content: "",
        color: DEFAULT_COLOR,
        markdown: false,
        tags: []
    });
    saveNotes();
    renderNotes();

    const firstEditor = notesContainer.querySelector(".note-input:not(.is-hidden)");
    if (firstEditor instanceof HTMLTextAreaElement) {
        firstEditor.focus();
    }
}

function removeNote(noteId) {
    notes = notes.filter((note) => note.id !== noteId);
    saveNotes();
    renderNotes();
}

function updateNoteContent(noteId, content) {
    const target = notes.find((note) => note.id === noteId);
    if (!target) {
        return null;
    }
    target.content = content;
    target.tags = extractTags(content);
    saveNotes();
    return target;
}

function renderTagsInsideCard(card, tags) {
    const tagsWrap = card.querySelector(".note-tags");
    if (!tagsWrap) {
        return;
    }

    tagsWrap.innerHTML = "";
    tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = `#${tag}`;
        tagsWrap.appendChild(chip);
    });
}

function updateNoteColor(noteId, color) {
    const target = notes.find((note) => note.id === noteId);
    if (!target) {
        return;
    }
    target.color = color;
    saveNotes();
}

function toggleMarkdownMode(noteId) {
    const target = notes.find((note) => note.id === noteId);
    if (!target) {
        return;
    }
    target.markdown = !target.markdown;
    saveNotes();
    renderNotes();
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    themeToggleBtn.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        return;
    }
    setTheme("light");
}

function reorderNotes(dragId, targetId, placeAfter) {
    if (!dragId || !targetId || dragId === targetId) {
        return;
    }

    const fromIndex = notes.findIndex((note) => note.id === dragId);
    let toIndex = notes.findIndex((note) => note.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
        return;
    }

    const [moved] = notes.splice(fromIndex, 1);
    if (fromIndex < toIndex) {
        toIndex -= 1;
    }
    notes.splice(placeAfter ? toIndex + 1 : toIndex, 0, moved);
    saveNotes();
    renderNotes();
}

function exportNotes() {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-notes.json";
    link.click();
    URL.revokeObjectURL(url);
}

async function importNotes(file) {
    try {
        const fileText = await file.text();
        const parsed = JSON.parse(fileText);
        if (!Array.isArray(parsed)) {
            window.alert("Import failed: file must contain an array of notes.");
            return;
        }
        const normalized = parsed.map(normalizeNote).filter(Boolean);
        notes = normalized;
        saveNotes();
        renderNotes();
    } catch (error) {
        window.alert("Import failed: invalid JSON file.");
    }
}

function loadNotes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            notes = [];
            renderNotes();
            return;
        }

        const parsed = JSON.parse(raw);
        notes = Array.isArray(parsed) ? parsed.map(normalizeNote).filter(Boolean) : [];
    } catch (error) {
        notes = [];
    }
    renderNotes();
}

createNoteBtn.addEventListener("click", addNote);
themeToggleBtn.addEventListener("click", toggleTheme);
exportBtn.addEventListener("click", exportNotes);
importTriggerBtn.addEventListener("click", () => importFileInput.click());

importFileInput.addEventListener("change", async () => {
    const [file] = importFileInput.files;
    if (!file) {
        return;
    }
    await importNotes(file);
    importFileInput.value = "";
});

searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderNotes();
});

tagFilter.addEventListener("change", (event) => {
    selectedTag = event.target.value;
    renderNotes();
});

clearAllBtn.addEventListener("click", () => {
    if (notes.length === 0) {
        return;
    }
    clearAllNotes();
});

notesContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const card = target.closest(".note-card");
    if (!card) {
        return;
    }

    const noteId = card.dataset.id;

    if (target.classList.contains("btn-delete")) {
        removeNote(noteId);
        return;
    }

    if (target.classList.contains("btn-markdown")) {
        toggleMarkdownMode(noteId);
    }
});

notesContainer.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    if (target.classList.contains("note-input")) {
        const card = target.closest(".note-card");
        if (!card) {
            return;
        }

        const updatedNote = updateNoteContent(card.dataset.id, target.value || "");
        if (!updatedNote) {
            return;
        }

        renderTagsInsideCard(card, updatedNote.tags);
        updateTagFilterOptions();
        updateStatus();

        if ((searchQuery || selectedTag !== "all") && !noteMatchesActiveFilters(updatedNote)) {
            renderNotes();
        }
        return;
    }
});

notesContainer.addEventListener("dragstart", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    const card = target.closest(".note-card");
    if (!card) {
        return;
    }
    draggedId = card.dataset.id;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
});

notesContainer.addEventListener("dragend", () => {
    draggedId = null;
    notesContainer.querySelectorAll(".note-card").forEach((card) => card.classList.remove("dragging"));
});

notesContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
});

notesContainer.addEventListener("drop", (event) => {
    event.preventDefault();
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const targetCard = target.closest(".note-card");
    if (!targetCard) {
        return;
    }

    const rect = targetCard.getBoundingClientRect();
    const placeAfter = event.clientY > rect.top + rect.height / 2;
    reorderNotes(draggedId, targetCard.dataset.id, placeAfter);
});

notesContainer.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("note-color")) {
        return;
    }
    const card = target.closest(".note-card");
    if (!card) {
        return;
    }
    updateNoteColor(card.dataset.id, target.value);
    card.style.setProperty("--note-color", target.value);
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "enter") {
        event.preventDefault();
        addNote();
    }
});

loadTheme();
loadNotes();
