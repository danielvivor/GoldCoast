// Utility helpers
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function stars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
}

// Mobile Navigation
const navToggle = document.querySelector(".nav-toggle");
const navContainer = document.querySelector(".nav-container");

if (navToggle && navContainer) {
    navToggle.addEventListener("click", () => {
        navContainer.classList.toggle("nav-open");
        const isOpen = navContainer.classList.contains("nav-open");
        navToggle.setAttribute("aria-expanded", isOpen);
    });
}

// Infinite Auto-Scrolling
document.querySelectorAll(".menu-scroll-track").forEach(track => {
    // Get all the images currently inside the track
    const images = Array.from(track.children);
    
    // Clone each image and append it to the SAME track
    images.forEach(img => {
        const clone = img.cloneNode(true);
        // Optional: Hide clones from screen readers so they aren't announced twice
        clone.setAttribute("aria-hidden", "true"); 
        track.appendChild(clone);
    });
});

// Reservations (Dynamic Tables & Identifier)
let reservations = load("reservations");

const multiResForm = document.getElementById("multi-reservation-form");
const addTableBtn = document.getElementById("add-table-btn");
const tablesContainer = document.getElementById("tables-container");
const tableTemplate = document.getElementById("table-row-template");
const successMsg = document.getElementById("booking-success-msg");

// Add a new table
if (addTableBtn && tablesContainer && tableTemplate) {
    addTableBtn.addEventListener("click", () => {
        const clone = tableTemplate.content.cloneNode(true);
        tablesContainer.appendChild(clone);
        updateTableNumbers();
    });
}