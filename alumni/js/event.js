/**
 * Author: Alyssa Mari F. Albarda
 */

let CURRENT_USER_ID = 0;

document.addEventListener("DOMContentLoaded", function () {
    fetchCurrentUser()
        .then(() => fetchEvents())
        .catch(error => console.error("Initialization Error:", error));
});

// Add event listener for logout
document.getElementById('logout-link').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default link behavior
    logoutUser();
});

async function logoutUser() {
    const payload = {
        action: 'logout',
        values: {}
    };

    try {
        const response = await fetch('../../php/classes/class.main.php', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Logout response:', data);

        if (data === true || data.logged_out) { 
            window.location.href = '../html/register.html';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out. Please try again.');
    }
}


function fetchCurrentUser() {
    return fetch("../../php/classes/class.main.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "get-current-user",
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.user_id && data.user_id > 0) {
            CURRENT_USER_ID = data.user_id;
        } else {
            console.log("User not logged in.");
        }
    })
    .catch(error => {
        console.error("Error fetching current user:", error);
    });
}

function fetchEvents() {
    fetch("../../php/classes/class.main.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "event-fetch",
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
        const events = data.record || [];

        const eventsList = document.querySelector(".events-list");
        eventsList.innerHTML = ""; // Clear existing events

        if (Array.isArray(events) && events.length > 0) {
            events.forEach(event => {
                const {
                    EventID = 0,
                    Title = "No Title",
                    EventDate = "No Date",
                    Location = "No Location",
                    Description = "No Description",
                    interested_count = 0,
                    is_interested = false,
                } = event;

                let buttonHTML = `<button class="interested-btn" data-event-id="${EventID}" onclick="markInterested(${EventID}, this)">I'm Interested</button>`;

                if (is_interested) {
                    buttonHTML = `<button class="interested-btn" data-event-id="${EventID}" disabled>Interested!</button>`;
                }

                const eventCard = document.createElement("article");
                eventCard.classList.add("event");
                eventCard.innerHTML = `
                    <h2>${Title}</h2>
                    <p><strong>Date:</strong> ${EventDate}</p>
                    <p><strong>Location:</strong> ${Location}</p>
                    <p>${Description}</p>
                    <div class="interested-section">
                        ${buttonHTML}
                        <p class="interested-count">${interested_count} alumni interested</p>
                    </div>
                `;
                eventsList.appendChild(eventCard);
            });
        } else {
            eventsList.innerHTML = "<p>No upcoming events at the moment. Please check back later!</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching events:", error);
        const eventsList = document.querySelector(".events-list");
        eventsList.innerHTML = "<p>There was an error loading the events. Please try again later.</p>";
    });
}


function markInterested(eventId, button) {
    if (CURRENT_USER_ID === 0) {
        alert("Please log in to express interest in events.");
        return;
    }

    // Disable the button and show a loading state
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Processing...";

    // Optimistically update the UI
    button.textContent = "Interested!";
    const interestedCount = button.nextElementSibling;
    const currentCount = parseInt(interestedCount.textContent) || 0;
    interestedCount.textContent = `${currentCount + 1} alumni interested`;

    fetch("../../php/classes/class.main.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "interested-save",
            values: { 
                EventID: eventId
            },
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.saved) {
            // Success: Do nothing as UI is already updated
        } else {
            // Revert UI changes
            console.error("Error:", data.error);
            alert(data.error);
            button.disabled = false;
            button.textContent = originalText;
            interestedCount.textContent = `${currentCount} alumni interested`;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("There was an error processing your request. Please try again later.");
        button.disabled = false;
        button.textContent = originalText;
        interestedCount.textContent = `${currentCount} alumni interested`;
    });
}




