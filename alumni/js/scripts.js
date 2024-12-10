/**
 * Author: Alyssa Mari F. Albarda
 */

// Toggle between sign-up and login forms
function toggleForm(form) {
    const signupForm = document.getElementById('signup-form-container');
    const loginForm = document.getElementById('login-form-container');
    const toggleBtn = document.getElementById('toggle-btn');
    const signupBtn = document.getElementById('signup-btn');

    if (form === 'login') {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        toggleBtn.style.display = 'none'; // Hide the sign in button
        signupBtn.style.display = 'block'; // Show the sign up button
    } else {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        toggleBtn.style.display = 'block'; // Show the sign in button
        signupBtn.style.display = 'none'; // Hide the sign up button
    }
}

function handleLogin(event) {
    event.preventDefault();

    const sluId = document.getElementById("login-sluid").value;
    const password = document.getElementById("login-password").value;

    // Validate user input
    if (!sluId || !password) {
        alert("Please enter both SLU ID and password.");
        return;
    }

    const formData = {
        'action': 'login',
        'values': {
            'slu_id': sluId,
            'password': password
        }
    };

    fetch('/../../php/classes/class.main.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.logged_in) {
            window.location.href = "../html/homepage.html";
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        alert("Server error: " + error);
    });
}

// document.getElementById('opportunity-form').addEventListener('submit', function(event) {
//     event.preventDefault();

//     // Get form values
//     const jobTitle = document.getElementById('job-title').value;
//     const jobDescription = document.getElementById('job-description').value;
//     const applicationLink = document.getElementById('application-link').value;

//     // Create a new opportunity card
//     const opportunityCard = document.createElement('div');
//     opportunityCard.classList.add('opportunity-card');
//     opportunityCard.innerHTML = `
//         <h3>${jobTitle}</h3>
//         <p>${jobDescription}</p>
//         <a href="${applicationLink}" target="_blank" class="apply-btn">Apply Here</a>
//     `;

//     // Add the new card to the opportunities grid
//     document.getElementById('opportunities-grid').appendChild(opportunityCard);

//     // Clear the form
//     document.getElementById('opportunity-form').reset();
// });

function handleSignup(event) {
    event.preventDefault();  // Prevent form from submitting the traditional way

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const sluId = document.getElementById("slu-id").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validate form data (e.g., check if passwords match)
    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    // Create a JSON object to send to the server
    const formData = {
        'action': 'user-save',
        'values': {
            'first_name': firstName,
            'last_name': lastName,
            'slu_id': sluId,
            'emailadd': email,
            'password': password
        }
    };

    fetch('/../../../server/php/classes/class.main.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.inserted) {
            window.location.href = "../html/homepage.html";
        } else {
            alert("Error saving user: " + data.error);
        }
    })
    .catch(error => {
        alert("Error: " + error);
    });
}

function markInterested(eventId) {
    // This function will handle adding the user to the interested list
    // A call would be made to the backend (via API or form) to update interest in the database.
    alert("You've expressed interest in this event!");
}
