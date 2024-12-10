/**
 * Author: Alyssa Mari F. Albarda
 */

document.addEventListener('DOMContentLoaded', function() {
    fetchOpportunities();
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

function fetchOpportunities() {
    fetch('../../php/classes/class.main.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'action': 'opportunities-fetch' 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.record && Array.isArray(data.record)) {
            displayOpportunities(data.record);
        } else {
            console.error('Error fetching opportunities:', data.error || 'Invalid data format');
            displayErrorMessage('No opportunities available at the moment.');
        }
    })
    .catch(error => {
        console.error('Error fetching opportunities:', error);
        displayErrorMessage('Failed to load opportunities. Please try again later.');
    });
}

function displayOpportunities(opportunities) {
    const container = document.querySelector('.opportunity-cards');
    container.innerHTML = '';

    if (opportunities.length === 0) {
        container.innerHTML = '<p>No opportunities available at the moment.</p>';
        return;
    }

    opportunities.forEach(opportunity => {
        const card = document.createElement('div');
        card.classList.add('opportunity-card');

        const title = document.createElement('h3');
        title.textContent = opportunity.title;
        card.appendChild(title);

        const description = document.createElement('p');
        description.textContent = opportunity.description;
        card.appendChild(description);

        const applyButton = document.createElement('a');

        let applyLink = opportunity.apply_link || '#';
        if (applyLink && !/^https?:\/\//i.test(applyLink)) {
            applyLink = 'https://' + applyLink;
        }

        applyButton.href = applyLink;
        applyButton.classList.add('apply-btn');
        applyButton.textContent = 'Apply on LinkedIn';
        applyButton.target = '_blank'; 
        applyButton.rel = 'noopener noreferrer'; 
        card.appendChild(applyButton);

        container.appendChild(card);
    });
}


function displayErrorMessage(message) {
    const container = document.querySelector('.opportunity-cards');
    container.innerHTML = `<p class="error-message">${message}</p>`;
}
