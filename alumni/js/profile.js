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

document.addEventListener('DOMContentLoaded', function () {
    fetch('../../php/classes/class.main.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'user-fetch',  
            values: {}
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log(data.error);
        } else {
            // Update profile information
            document.querySelector('.profile-main .profile-info h2').textContent = `${data.record.FirstName} ${data.record.LastName}`;
            document.querySelector('.profile-main .profile-info .program').textContent = `${data.record.Program}`;
            document.querySelector('.profile-body .bio-description').textContent = data.record.Description;

            // Update profile picture
            if (data.record.ProfilePicture) {
                const profileImg = document.querySelector('.profile-main .profile-img');
                if (data.record.ProfilePicture.startsWith('data:image')) {
                    // If already a Base64 string
                    profileImg.src = data.record.ProfilePicture;
                } else {
                    // If it's a path to the image
                    profileImg.src = `../img/${data.record.ProfilePicture}`;
                }
            }


            // Update linked profiles
            const linkedProfiles = document.querySelector('.linked-profiles');
            linkedProfiles.innerHTML = ''; 

            if (data.record.LinkedProfiles && data.record.LinkedProfiles.length > 0) {
                data.record.LinkedProfiles.forEach(profile => {
                    if (profile.ProfileType && profile.ProfileURL) {
                        const platform = profile.ProfileType.toLowerCase();
                        linkedProfiles.innerHTML += `<a href="${profile.ProfileURL}" class="linked-profile" target="_blank">
                            <i class="fab fa-${platform}"></i> ${profile.ProfileType}
                        </a>`;
                    } 
                });
            } else {
                linkedProfiles.innerHTML = '<p>No linked profiles found.</p>';
            }

            // Update experience section
            const experienceSection = document.querySelector('.experience-section');
            experienceSection.innerHTML = ''; 
            data.record.Experiences.forEach(experience => {
                experienceSection.innerHTML += `<div class="experience-item">
                    <h4">${experience.Title}</h4>
                    <p class="company">${experience.Company}</p>
                    <p class="duration">${experience.Duration}</p>
                    <p class="location-role">${experience.Location} | ${experience.Role}</p>
                    <p class="description">${experience.Description}</p>
                </div>`;
            });

            // Update skills section
            const skillsSection = document.querySelector('.skills-section');
            skillsSection.innerHTML = ''; 
            data.record.Skills.forEach(skill => {
                skillsSection.innerHTML += `<span class="skill">${skill.SkillName}</span>`;
            });

            // Update timeline section
            const timelineSection = document.querySelector('.timeline');
            timelineSection.innerHTML = ''; 
            data.record.Posts.forEach(post => {
                timelineSection.innerHTML += `<div class="timeline-item">
                    <div class="timeline-content">
                        <h4>${post.Title}</h4>
                        <p>${post.Content}</p>
                        <span class="post-date">${formatDate(post.PostDate)}</span>
                    </div>
                </div>`;
            });
        }
    })
    .catch(error => console.error('Error fetching profile data:', error));

    // Function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }
});

// Function to redirect to edit profile
function redirectToEditProfile() {
    window.location.href = '../html/editprofile.html'; 
}
