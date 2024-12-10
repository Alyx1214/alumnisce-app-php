/**
 * Author: Alyssa Mari F. Albarda
 */

document.addEventListener('DOMContentLoaded', () => {
    getAllAlumni();

    // Add event listeners for filter and sort controls
    document.getElementById('filter-program').addEventListener('change', getAllAlumni);
    document.getElementById('sort-order').addEventListener('change', getAllAlumni);
    document.getElementById('search-btn').addEventListener('click', getAllAlumni);
    document.getElementById('search-keyword').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            getAllAlumni();
        }
    });
    
// Add event listener for logout
document.getElementById('logout-link').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default link behavior
    logoutUser();
});
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

async function getAllAlumni() {
    const alumniList = document.getElementById('alumni-list');
    alumniList.innerHTML = '<div class="loading-spinner"></div>';

    const programFilter = document.getElementById('filter-program').value;
    const sortOrder = document.getElementById('sort-order').value;
    const searchKeyword = document.getElementById('search-keyword').value.trim();

    const action = searchKeyword ? 'get-users-by-keyword' : 'get-all-alumni';

    const payload = {
        action: action,
        values: {
            program: programFilter,
            order: sortOrder
        }
    };

    if (searchKeyword) {
        payload.values.keyword = searchKeyword;
    }

    try {
        const response = await fetch('../../php/classes/class.main.php', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Received response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        let alumniData = [];

        if (data.fetched && Array.isArray(data.record)) {
            alumniData = data.record;
        }

        else if (Array.isArray(data.record)) {
            alumniData = data.record;
        }

        else if (Array.isArray(data)) {
            alumniData = data;
        } else {
            console.error('Unexpected data format:', data);
            displayError('Unexpected data format received.');
            return;
        }

        renderAlumniList(alumniData);
    } catch (error) {
        console.error('Error fetching alumni:', error);
        displayError('An error occurred while fetching alumni data.');
    }
}


function renderAlumniList(alumni) {
    const alumniList = document.getElementById('alumni-list');
    alumniList.innerHTML = ''; 

    if (!Array.isArray(alumni) || alumni.length === 0) {
        alumniList.innerHTML = '<p>No alumni found.</p>';
        console.log('No alumni to display.');
        return;
    }

    alumni.forEach((alumnus, index) => {
       
        const firstName = alumnus.FirstName || 'N/A';
        const lastName = alumnus.LastName || 'N/A';
        const program = alumnus.Program || 'N/A';
        const profilePicture = alumnus.ProfilePicture || '../img/default-profile.jpg';

        console.log(`Rendering alumnus ${index + 1}:`, alumnus);

        const alumniCard = document.createElement('div');
        alumniCard.classList.add('alumni-card');

        const img = document.createElement('img');
        img.src = profilePicture;
        img.alt = `${firstName} ${lastName}`;
        img.classList.add('alumni-photo');
        alumniCard.appendChild(img);

        const details = document.createElement('div');
        details.classList.add('alumni-details');

        const name = document.createElement('h3');
        name.textContent = `${firstName} ${lastName}`;
        details.appendChild(name);

        const programElement = document.createElement('p');
        programElement.textContent = program;
        details.appendChild(programElement);

        alumniCard.appendChild(details);
        alumniList.appendChild(alumniCard);
    });

    console.log('Alumni list rendered successfully.');
}

// Function to display error messages
function displayError(message) {
    const alumniList = document.getElementById('alumni-list');
    alumniList.innerHTML = `<p class="error">${message}</p>`;
}



