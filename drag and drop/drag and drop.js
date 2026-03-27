const boxes = document.querySelectorAll(".box");
const columns = document.querySelectorAll(".right, .left");
const availableCount = document.getElementById("available-count");
const droppedCount = document.getElementById("dropped-count");

let activeCard = null;

function updateCounts() {
    const available = document.querySelectorAll(".right .box").length;
    const dropped = document.querySelectorAll(".left .box").length;
    availableCount.textContent = available;
    droppedCount.textContent = dropped;
}

boxes.forEach((box) => {
    box.addEventListener("dragstart", (event) => {
        activeCard = event.currentTarget;
        event.dataTransfer.setData("text/plain", "");
        event.dataTransfer.effectAllowed = "move";
        box.classList.add("is-dragging");
    });

    box.addEventListener("dragend", () => {
        setTimeout(() => {
            if (activeCard) {
                activeCard.classList.remove("is-dragging");
                activeCard = null;
            }
            columns.forEach((col) => col.classList.remove("is-drop-target"));
            updateCounts();
        }, 0);
    });
});

columns.forEach((column) => {
    column.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        columns.forEach((col) => col.classList.remove("is-drop-target"));
        column.classList.add("is-drop-target");
    });

    column.addEventListener("dragenter", (event) => {
        event.preventDefault();
        if (event.currentTarget !== event.relatedTarget?.parentElement) {
            column.classList.add("is-drop-target");
        }
    });

    column.addEventListener("dragleave", (event) => {
        if (!column.contains(event.relatedTarget)) {
            column.classList.remove("is-drop-target");
        }
    });

    column.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!activeCard) return;


        activeCard.style.transition = "all 0.3s ease";
        column.appendChild(activeCard);
        setTimeout(() => {
            activeCard.style.transition = "";
        }, 300);

        columns.forEach((col) => col.classList.remove("is-drop-target"));
        activeCard = null;
        updateCounts();
    });
});

updateCounts(); 