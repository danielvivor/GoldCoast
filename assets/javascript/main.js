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

// Remove a table (Event Delegation)
if (tablesContainer) {
    tablesContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-table")) {
            e.target.closest(".table-entry-card").remove();
            updateTableNumbers();
        }
    });
}

function updateTableNumbers() {
    const tableCards = tablesContainer.querySelectorAll(".table-item");
    tableCards.forEach((card, index) => {
        const numberSpan = card.querySelector(".table-number");
        if (numberSpan) {
            numberSpan.textContent = `Table #${index + 1}`;
        }
    });
}

// Handle Reservation Submit
if (multiResForm) {
    multiResForm.addEventListener("submit", e => {
        e.preventDefault();

        const bookingEmail = document.getElementById("booking-email").value.trim();
        const tableCards = tablesContainer.querySelectorAll(".table-item");
        
        let bookingDetails = {
            id: crypto.randomUUID(),
            email: bookingEmail,
            tables: []
        };

        tableCards.forEach(card => {
            const date = card.querySelector(".table-date").value;
            const time = card.querySelector(".table-time").value;
            const guests = card.querySelector(".table-guests").value;
            bookingDetails.tables.push({ date, time, guests });
        });

        reservations.push(bookingDetails);
        save("reservations", reservations);

        // Reset UI
        multiResForm.reset();
        
        // Remove all extra tables, keep only the first one
        while (tablesContainer.children.length > 1) {
            tablesContainer.removeChild(tablesContainer.lastChild);
        }
        
        successMsg.style.display = "block";
        setTimeout(() => successMsg.style.display = "none", 4000);
    });
}

// Manage/Search Booking
const viewResForm = document.getElementById("view-reservation-form");
const resResultsContainer = document.getElementById("reservation-results");

if (viewResForm) {
    viewResForm.addEventListener("submit", e => {
        e.preventDefault();
        const searchEmail = document.getElementById("search-email").value.trim();
        
        // Find all bookings matching the email
        const userBookings = reservations.filter(r => r.email === searchEmail);
        
        if (userBookings.length === 0) {
            resResultsContainer.innerHTML = `<p style="color: #d9534f;">No bookings found for ${searchEmail}.</p>`;
            return;
        }

        // Render results
        let html = "";
        userBookings.forEach(booking => {
            html += `
                <div class="result-card">
                    <div class="status-badge">Confirmed</div>
                    <p><strong>Booking ID:</strong> ${booking.id.split('-')[0]}</p>
                    <p><strong>Tables Booked:</strong> ${booking.tables.length}</p>
                    <ul style="margin-left: 1.5rem; margin-top: 0.5rem; font-size: 0.9em; color: var(--color-text-muted);">
                        ${booking.tables.map((t, i) => `<li>Table ${i+1}: ${t.date} at ${t.time} for ${t.guests}</li>`).join('')}
                    </ul>
                    <button class="btn-outline full-width" style="margin-top: 1rem; padding: 0.5rem;" onclick="deleteBooking('${booking.id}')">Cancel Booking</button>
                </div>
            `;
        });
        resResultsContainer.innerHTML = html;
    });
}