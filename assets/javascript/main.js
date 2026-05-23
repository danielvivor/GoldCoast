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

// Expose delete function globally so the inline onclick works
window.deleteBooking = function(id) {
    reservations = reservations.filter(r => r.id !== id);
    save("reservations", reservations);
    document.getElementById("view-reservation-form").dispatchEvent(new Event("submit"));
}

// Reviews
let reviews = load("reviews");

const reviewForm = document.getElementById("review-form");
const reviewsList = document.getElementById("reviews-list");
const latestReviews = document.getElementById("latest-reviews");

function renderReviews() {
    if(reviewsList) {
        reviewsList.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="review-stars">${stars(r.rating || 0)}</div>
                <p><strong>${r.name}</strong></p>
                <p>${r.comment || ""}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline edit-btn" style="padding: 0.5rem 1rem;" data-id="${r.id}">Edit</button>
                    <button class="btn btn-outline delete-btn" style="padding: 0.5rem 1rem; color: #d9534f; border-color: #d9534f;" data-id="${r.id}">Delete</button>
                </div>
            </div>
        `).join("");
    }

    if(latestReviews) {
        const lastThree = [...reviews].slice(-3).reverse();
        latestReviews.innerHTML = lastThree.map(r => `
            <div class="testimonial-card">
                <p class="testimonial-text">"${r.comment || "No comment"}"</p>
                <p class="testimonial-name">— ${r.name}</p>
            </div>
        `).join("");
    }
}

if (reviewForm) {
    reviewForm.addEventListener("submit", e => {
        e.preventDefault();

        const id = document.getElementById("review-id").value;
        const name = document.getElementById("review-name").value.trim();
        const email = document.getElementById("review-email").value.trim();
        const rating = Number(document.getElementById("review-rating").value);
        const comment = document.getElementById("review-comment").value.trim();

        if (!rating && !comment) {
            alert("Please provide a rating or a comment.");
            return;
        }

        if (id) {
            const index = reviews.findIndex(r => r.id === id);
            reviews[index] = { id, name, email, rating, comment };
        } else {
            reviews.push({ id: crypto.randomUUID(), name, email, rating, comment });
        }

        save("reviews", reviews);
        reviewForm.reset();
        document.getElementById("review-id").value = "";
        renderReviews();
    });
}

if(reviewsList) {
    reviewsList.addEventListener("click", e => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains("edit-btn")) {
            const r = reviews.find(x => x.id === id);
            document.getElementById("review-id").value = r.id;
            document.getElementById("review-name").value = r.name;
            document.getElementById("review-email").value = r.email;
            document.getElementById("review-rating").value = r.rating;
            document.getElementById("review-comment").value = r.comment;
            window.scrollTo({ top: reviewForm.offsetTop - 80, behavior: "smooth" });
        }
        if (e.target.classList.contains("delete-btn")) {
            reviews = reviews.filter(r => r.id !== id);
            save("reviews", reviews);
            renderReviews();
        }
    });
}

// Contact
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", e => {
        e.preventDefault();
        alert("Your message has been sent!");
        contactForm.reset();
    });
}
