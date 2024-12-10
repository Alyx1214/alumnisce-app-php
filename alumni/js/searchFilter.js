// searchFilter.js

document.getElementById('searchButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    const searchInput = document.getElementById('searchInput').value;
    // Implement search functionality here
    console.log('Searching for:', searchInput);
});

document.getElementById('filterForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const filters = {
        school: document.getElementById('school').value,
        course: document.getElementById('course').value,
        year: document.getElementById('year').value,
        batch: document.getElementById('batch').value
    };
    // Implement filtering functionality here
    console.log('Applying filters:', filters);
});


// Function to get query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// First and last name arrays
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Katie', 'David', 'Sarah', 'James', 'Laura'];
const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];

// Job titles and locations arrays
const jobs = ['Software Engineer', 'Data Analyst', 'UX Designer', 'Project Manager', 'Cloud Architect', 'Marketing Specialist', 'Cybersecurity Expert'];
const locations = ['Manila, Philippines', 'Quezon City, Philippines', 'San Francisco, CA, USA', 'New York, NY, USA', 'Austin, TX, USA', 'Los Angeles, CA, USA', 'Cebu, Philippines'];

// Helper function to get a random element from an array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to dynamically create mock data with random jobs and locations
function generateMockProfile(fullName) {
    const jobTitle = getRandomElement(jobs);
    const location = getRandomElement(locations);
    return {
        name: fullName,
        title: jobTitle,
        company: "Innovate Solutions",  // Example company
        location: location,
        summary: fullName + " is an expert in " + jobTitle.toLowerCase() + ".",
        image: "https://via.placeholder.com/100"
    };
}

// Search functionality based on any valid name combination
const searchName = getQueryParam('name');
if (searchName) {
    const [firstName, lastName] = searchName.split(' ');
    if (firstNames.includes(firstName) && lastNames.includes(lastName)) {
        const mockProfile = generateMockProfile(searchName);
        const resultsHtml = `
            <div class="card">
                <img src="${mockProfile.image}" alt="${mockProfile.name}" class="profile-picture"/>
                <div class="card-content">
                    <h3>${mockProfile.name}</h3>
                    <p>${mockProfile.title} at ${mockProfile.company}</p>
                    <p><strong>Location:</strong> ${mockProfile.location}</p>
                    <p><strong>Summary:</strong> ${mockProfile.summary}</p>
                    <button class="connect-button">Connect</button>
                </div>
            </div>
        `;
        document.getElementById('search-results').innerHTML = `<h2>Results for: <strong>${searchName}</strong></h2>${resultsHtml}`;
    } else {
        document.getElementById('search-results').innerHTML = `<h2>No results found for: <strong>${searchName}</strong></h2>`;
    }
} else {
    document.getElementById('search-results').innerHTML = 'No search term provided.';
}


// Function to get query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// School/Program and corresponding courses data
const schoolProgramCourses = {'SAMCIS': ['Bachelor of Science in Accountancy', 'Bachelor of Science in Management Accounting', 'Bachelor of Science in Business Administration (Financial Management, Marketing Management)', 'Bachelor of Science in Entrepreneurship', 'Bachelor of Science in Tourism Management', 'Bachelor of Science in Hospitality Management', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Technology', 'Bachelor of Multimedia Arts'], 'SEA': ['Bachelor of Science in Architecture', 'Bachelor of Science in Chemical Engineering', 'Bachelor of Science in Civil Engineering', 'Bachelor of Science in Electrical Engineering', 'Bachelor of Science in Electronics Engineering', 'Bachelor of Science in Geodetic Engineering', 'Bachelor of Science in Industrial Engineering', 'Bachelor of Science in Mechanical Engineering', 'Bachelor of Science in Mechatronics Engineering', 'Bachelor of Science in Mining Engineering'], 'SONAHBS': ['Bachelor of Science in Biology', 'Bachelor of Science in Medical Laboratory Science', 'Bachelor of Science in Nursing', 'Bachelor of Science in Pharmacy', 'Bachelor of Science in Radiologic Technology'], 'STELA': ['Bachelor of Arts in Communication', 'Bachelor of Arts in Philosophy', 'Bachelor of Arts in Political Science', 'Bachelor of Elementary Education', 'Bachelor of Physical Education', 'Bachelor of Science in Psychology', 'Bachelor of Secondary Education (English, Math, Science, Social Studies)', 'Bachelor of Special Needs Education', 'Bachelor of Science in Social Work'], 'SOL': ['Juris Doctor (JD)', 'Master of Laws (LLM)'], 'SOM': ['Doctor of Medicine'], 'SAS': ['Doctor of Philosophy in Management', 'Master of Business Administration', 'Master of Science in Accountancy', 'Master of Science in Business Administration', 'Master of Science in Public Management', 'Master of Information Technology', 'Master in Environmental Sciences', 'Master of Science in Nursing']};

// Mock alumni data
const mockAlumniData = {'John Doe': {'name': 'John Doe', 'title': 'Software Engineer', 'company': 'Tech Innovators', 'location': 'New York, NY', 'school': 'SAMCIS', 'course': 'Bachelor of Science in Computer Science', 'batch': '2020', 'image': 'https://via.placeholder.com/100'}, 'Jane Smith': {'name': 'Jane Smith', 'title': 'UX Designer', 'company': 'Creative Designs', 'location': 'San Francisco, CA', 'school': 'STELA', 'course': 'Bachelor of Arts in Communication', 'batch': '2018', 'image': 'https://via.placeholder.com/100'}, 'Emily Jones': {'name': 'Emily Jones', 'title': 'Data Scientist', 'company': 'Data Analytics Inc.', 'location': 'Manila, Philippines', 'school': 'SAMCIS', 'course': 'Bachelor of Science in Accountancy', 'batch': '2022', 'image': 'https://via.placeholder.com/100'}, 'Michael Brown': {'name': 'Michael Brown', 'title': 'Cloud Architect', 'company': 'Innovate Solutions', 'location': 'Quezon City, Philippines', 'school': 'SEA', 'course': 'Bachelor of Science in Civil Engineering', 'batch': '2023', 'image': 'https://via.placeholder.com/100'}, 'Sarah Davis': {'name': 'Sarah Davis', 'title': 'Cybersecurity Specialist', 'company': 'CyberSec Corp', 'location': 'Cebu, Philippines', 'school': 'SONAHBS', 'course': 'Bachelor of Science in Nursing', 'batch': '2021', 'image': 'https://via.placeholder.com/100'}, 'Chris Williams': {'name': 'Chris Williams', 'title': 'Marketing Manager', 'company': 'Ad Agency', 'location': 'Los Angeles, CA', 'school': 'SAS', 'course': 'Master of Science in Marketing', 'batch': '2024', 'image': 'https://via.placeholder.com/100'}};

// Dynamically populate courses based on selected school/program
function updateCourses(selectedSchool) {
    const courseSelect = document.getElementById('course');
    courseSelect.innerHTML = '<option>--Select Course--</option>';
    if (schoolProgramCourses[selectedSchool]) {
        schoolProgramCourses[selectedSchool].forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.text = course;
            courseSelect.appendChild(option);
        });
    }
}

// Function to display all search results dynamically
function displaySearchResults(results) {
    if (results.length > 0) {
        const resultsHtml = results.map(person => `
            <div class="card">
                <img src="${person.image}" alt="${person.name}" class="profile-picture"/>
                <div class="card-content">
                    <h3>${person.name}</h3>
                    <p>${person.title} at ${person.company}</p>
                    <p><strong>Location:</strong> ${person.location}</p>
                    <p><strong>School:</strong> ${person.school}</p>
                    <p><strong>Course:</strong> ${person.course}</p>
                    <p><strong>Batch:</strong> ${person.batch}</p>
                    <button class="connect-button">Connect</button>
                </div>
            </div>
        `).join('');
        document.getElementById('search-results').innerHTML = resultsHtml;
    } else {
        document.getElementById('search-results').innerHTML = '<h2>No results found</h2>';
    }
}

// Apply filters function
function applyFilters() {
    const selectedSchool = document.getElementById('school').value;
    const selectedCourse = document.getElementById('course').value;
    const selectedBatch = document.getElementById('batch').value;

    const filteredResults = Object.values(mockAlumniData).filter(person => {
        return (!selectedSchool || person.school === selectedSchool) &&
               (!selectedCourse || person.course === selectedCourse) &&
               (!selectedBatch || person.batch === selectedBatch);
    });

    displaySearchResults(filteredResults);
}

// Reset filters function
function resetFilters() {
    document.getElementById('school').value = '';
    document.getElementById('course').innerHTML = '<option>--Select Course--</option>';
    document.getElementById('batch').value = '';

    // Get the last searched name from the query parameter and redisplay original results
    const searchName = getQueryParam('name');
    if (searchName) {
        searchAlumni();  // Re-display original search results
    } else {
        document.getElementById('search-results').innerHTML = '<h2>No search term provided.</h2>';
    }
}

// Automatically trigger the search on page load
searchAlumni();



