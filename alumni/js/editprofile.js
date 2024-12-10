/**
 * Author: Alyssa Mari F. Albarda
 */

let base64ImageString = null;

document.addEventListener('DOMContentLoaded', function () {
    fetch('../../php/classes/class.main.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'action': 'user-fetch'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.record) {
            populateProfileForm(data.record);
        } else {
            console.error('Error fetching profile data:', data.error);
            populateProfileForm({});
        }
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
    });

    function populateProfileForm(data) {
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const emailInput = document.getElementById('email');
        const bioInput = document.getElementById('bio');
        const programInput = document.getElementById('program');
    
        if (firstNameInput) firstNameInput.value = data.FirstName || '';
        if (lastNameInput) lastNameInput.value = data.LastName || '';
        if (emailInput) emailInput.value = data.Email || '';
        if (bioInput) bioInput.value = data.Description || '';
        if(programInput) programInput.value = data.Program || '';
    
        const skillsContainer = document.querySelector('.skills-container');
        if (skillsContainer) {
            skillsContainer.querySelectorAll('.skill-item').forEach(item => item.remove());
            if (data.Skills && data.Skills.length > 0) {
                data.Skills.forEach(skill => {
                    const skillItem = createSkillItem(skill.SkillName);
                    skillsContainer.insertBefore(skillItem, skillsContainer.querySelector('.add-skill-btn'));
                });
            } else {
                const placeholder = createSkillItem('');
                skillsContainer.insertBefore(placeholder, skillsContainer.querySelector('.add-skill-btn'));
            }
        }
    
        const experiencesContainer = document.querySelector('.experience-container .experience-section');
        if (experiencesContainer) {
            experiencesContainer.querySelectorAll('.experience-item').forEach(item => item.remove());
    
            if (data.Experiences && data.Experiences.length > 0) {
                data.Experiences.forEach(experience => {
                    if (!experience.Company && !experience.Duration && !experience.Location && !experience.Role && !experience.Description) {
                        return;
                    }
                    const experienceItem = createExperienceItem(experience);
                    experiencesContainer.appendChild(experienceItem);
                });
            } else {
                const placeholderExperience = createExperienceItem({});
                experiencesContainer.appendChild(placeholderExperience);
            }
        }
    
        const linkedAccountsContainer = document.querySelector('.linked-accounts-container');
        if (linkedAccountsContainer) {
            linkedAccountsContainer.querySelectorAll('.linked-account-item').forEach(item => item.remove());
    
            if (data.LinkedProfiles && data.LinkedProfiles.length > 0) {
                data.LinkedProfiles.forEach(account => {
                    const linkedAccountItem = createLinkedAccountItem(account.ProfileType, account.ProfileURL);
                    linkedAccountsContainer.insertBefore(linkedAccountItem, linkedAccountsContainer.querySelector('.add-account-btn'));
                });
            } else {
                const placeholderAccount = createLinkedAccountItem('', '');
                linkedAccountsContainer.insertBefore(placeholderAccount, linkedAccountsContainer.querySelector('.add-account-btn'));
            }
        }
    
        const profileImg = document.getElementById('profile-img');
        if (profileImg && data.ProfilePicture) {
            // Check if the ProfilePicture is a Base64 string
            if (data.ProfilePicture.startsWith('data:image')) {
                profileImg.src = data.ProfilePicture;
            } else {
                profileImg.src = `../img/${data.ProfilePicture}`;
            }
        }


        attachRemoveEventListeners();
    }

    function createSkillItem(skill) {
        const skillTemplate = document.getElementById('skill-template').querySelector('.skill-item').cloneNode(true);
        skillTemplate.querySelector('input').value = skill;
        return skillTemplate;
    }

    function createExperienceItem(experience) {
        const experienceTemplate = document.getElementById('experience-template').querySelector('.experience-item').cloneNode(true);
        experienceTemplate.querySelector('.company-input').value = experience.Company || '';
        experienceTemplate.querySelector('.duration-input').value = experience.Duration || '';
        experienceTemplate.querySelector('.location-input').value = experience.Location || '';
        experienceTemplate.querySelector('.role-input').value = experience.Role || '';
        experienceTemplate.querySelector('.description-input').value = experience.Description || '';
        return experienceTemplate;
    }

    function createLinkedAccountItem(profileType, profileURL) {
        const linkedAccountItem = document.createElement('div');
        linkedAccountItem.classList.add('linked-account-item');

        let iconClass = 'fas fa-question-circle'; 
        if (profileType) {
            const type = profileType.toLowerCase();
            if (type === 'email') {
                iconClass = 'fa fa-envelope';
            } else {
                iconClass = `fab fa-${type}`;
            }
        }

        linkedAccountItem.innerHTML = `
            <span class="icon-container" title="${profileType || 'Account Type'}">
                <i class="${iconClass}"></i>
            </span>
            <select class="account-type" title="Select Account Type">
                <option value="">Select Account Type</option>
                <option value="linkedin" ${profileType && profileType.toLowerCase() === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                <option value="facebook" ${profileType && profileType.toLowerCase() === 'facebook' ? 'selected' : ''}>Facebook</option>
                <option value="instagram" ${profileType && profileType.toLowerCase() === 'instagram' ? 'selected' : ''}>Instagram</option>
                <option value="email" ${profileType && profileType.toLowerCase() === 'email' ? 'selected' : ''}>Email</option>
            </select>
            <textarea placeholder="Enter account URL">${profileURL || ''}</textarea>
            <button class="remove-btn" title="Remove Account">✖</button>
        `;
        return linkedAccountItem;
    }

    document.querySelector('.add-skill-btn').addEventListener('click', function () {
        const skillsContainer = document.querySelector('.skills-container');
        const skillItem = createSkillItem('');
        skillsContainer.insertBefore(skillItem, skillsContainer.querySelector('.add-skill-btn'));
        attachRemoveEventListeners();
    });

    document.querySelector('.add-experience-btn').addEventListener('click', function () {
        const experiencesContainer = document.querySelector('.experience-container .experience-section');
        const expItem = createExperienceItem({});
        experiencesContainer.appendChild(expItem);
        attachRemoveEventListeners();
    });

    document.querySelector('.add-account-btn').addEventListener('click', function () {
        const linkedAccountsContainer = document.querySelector('.linked-accounts-container');
        const linkedAccountItem = createLinkedAccountItem('', '');
        linkedAccountsContainer.insertBefore(linkedAccountItem, document.querySelector('.add-account-btn'));
        attachRemoveEventListeners();
    });

    document.querySelector('.linked-accounts-container').addEventListener('change', function (e) {
        if (e.target.classList.contains('account-type')) {
            const selectedType = e.target.value.toLowerCase();
            const icon = e.target.parentElement.querySelector('.icon-container i');
            if (!selectedType) {
                icon.className = 'fas fa-question-circle';
            } else if (selectedType === 'email') {
                icon.className = 'fa fa-envelope';
            } else {
                icon.className = `fab fa-${selectedType}`;
            }
        }
    });

    const form = document.getElementById('edit-profile-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); 
        const profileData = {
            first_name: document.getElementById('first-name').value.trim(),
            last_name: document.getElementById('last-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            program: document.getElementById('program').value.trim(),
            skills: [],
            experiences: [],
            linked_accounts: [],
            profile_picture: base64ImageString
        };

        document.querySelectorAll('.skill-item input').forEach(input => {
            if (input.value.trim() !== '') {
                profileData.skills.push(input.value.trim());
            }
        });

        document.querySelectorAll('.experience-item').forEach(item => {
            const experience = {
                company: item.querySelector('.company-input').value.trim(),
                duration: item.querySelector('.duration-input').value.trim(),
                location: item.querySelector('.location-input').value.trim(),
                role: item.querySelector('.role-input').value.trim(),
                description: item.querySelector('.description-input').value.trim()
            };
            if (experience.company || experience.duration || experience.location || experience.role || experience.description) {
                profileData.experiences.push(experience);
            }
        });

        document.querySelectorAll('.linked-account-item').forEach(item => {
            const accountType = item.querySelector('.account-type') ? item.querySelector('.account-type').value : '';
            const profileURL = item.querySelector('textarea').value.trim();
            if (accountType && profileURL) {
                profileData.linked_accounts.push({
                    profile_type: accountType,
                    profile_url: profileURL
                });
            }
        });

        submitProfile(profileData);
    });

    function submitProfile(data) {
        fetch('../../php/classes/class.main.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'action': 'user-details-save',
                'values': data

            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.updated) {
                alert('Profile updated successfully!');
                window.location.href = '../html/profile.html';
            } else {
                alert('Error updating profile: ' + (data.error || 'Unknown error occurred.'));
            }
        })
        .catch(error => {
            alert('Server error: ' + error);
        });
    }

    function attachRemoveEventListeners() {
        document.querySelectorAll('.remove-btn').forEach(function (btn) {
            btn.removeEventListener('click', handleRemove);
            btn.addEventListener('click', handleRemove);
        });
    }

    function handleRemove(e) {
        const parent = e.target.closest('.skill-item, .experience-item, .linked-account-item');
        if (parent) parent.remove();
    }

    const profilePictureInput = document.getElementById('profile-picture');
    profilePictureInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                base64ImageString = e.target.result;
                console.log('Base64 Image String:', base64ImageString); // Debug log
                const profileImg = document.getElementById('profile-img');
                if (profileImg) {
                    profileImg.src = base64ImageString;
                }
            };
            reader.readAsDataURL(file);
        }
    });

    window.redirectToProfile = function () {
        window.location.href = '../html/profile.html';
    };
});
