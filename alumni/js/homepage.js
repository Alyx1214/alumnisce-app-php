/**
 * Author: Alyssa Mari F. Albarda
 */

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

// Function to generate random names
function generateRandomNames(num) {
    const firstNames = ["John", "Jane", "Michael", "Emily", "Chris", "Katie", "David", "Sarah", "James", "Laura"];
    const lastNames = ["Doe", "Smith", "Johnson", "Brown", "Williams", "Jones", "Garcia", "Miller", "Davis", "Rodriguez"];

    const names = [];
    for (let i = 0; i < num; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        names.push({
            name: `${firstName} ${lastName}`,
            // Modify this to point to your searchFilter.html
            profileUrl: `../html/searchFilter.html?name=${encodeURIComponent(`${firstName} ${lastName}`)}`
        });
    }
    return names;
}

// Generate a sample list of alumni names
const alumniNames = generateRandomNames(20); // Generate 20 random names

// Function to show suggestions based on input
function showSuggestions(input) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = ''; // Clear previous suggestions

    if (input.length === 0) {
        suggestionsDiv.style.display = 'none'; // Hide dropdown if input is empty
        return;
    }

    // Filter names based on the input
    const filteredNames = alumniNames.filter(alumni => 
        alumni.name.toLowerCase().includes(input.toLowerCase())
    );

    // Show the suggestions
    if (filteredNames.length > 0) {
        suggestionsDiv.style.display = 'block';
        filteredNames.forEach(alumni => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = alumni.name;
            
            // Redirect to searchFilter.html with the selected name as a query parameter
            suggestionItem.onclick = () => {
                window.location.href = alumni.profileUrl; // Redirects to searchFilter.html
            };

            suggestionsDiv.appendChild(suggestionItem);
        });
    } else {
        suggestionsDiv.style.display = 'none'; // Hide dropdown if no matches
    }
}

// // Hide suggestions when clicking outside the search bar
// document.addEventListener('click', function(event) {
//     const suggestionsDiv = document.getElementById('suggestions');
//     if (!document.getElementById('search-bar').contains(event.target)) {
//         suggestionsDiv.style.display = 'none';
//     }
// });
