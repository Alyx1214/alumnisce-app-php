/**
 * Author: Alyssa Mari F. Albarda
 */

let base64ImageString = null;
let currentPostID = null; 

// DOM Elements
const modalOverlay = document.querySelector(".modal-overlay");
const addExperienceButton = document.getElementById("add-experience-btn");
const cancelButton = document.getElementById("cancel-btn");
const addExperienceForm = document.getElementById("add-experience-form");
const logoutLink = document.getElementById('logout-link');
const filterButton = document.getElementById('filter-button');
const filterPopup = document.getElementById('filterPopup');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const experienceList = document.querySelector('.experience-list');
const commentPopup = document.querySelector('.comment-popup');
const closeCommentBtn = document.querySelector('.comment-popup .close-btn');
const submitCommentBtn = document.querySelector('.submit-comment-btn');
const commentInput = document.querySelector('.comment-input');
const commentList = document.querySelector('.comment-list');

// Event Listeners
addExperienceButton.addEventListener("click", () => {
  modalOverlay.classList.remove("hidden");
});

cancelButton.addEventListener("click", () => {
  modalOverlay.classList.add("hidden");
});

addExperienceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitExperience();
});

// Add event listener for logout
logoutLink.addEventListener('click', function (e) {
  e.preventDefault(); // Prevent default link behavior
  logoutUser();
});

filterButton.addEventListener('click', () => {
  filterPopup.classList.toggle('hidden'); 
});

document.querySelector('.btn.apply-btn').addEventListener('click', () => {
  applyFilters();
});

// Search functionality
searchButton.addEventListener('click', () => {
  const keyword = searchInput.value.trim();
  fetchPostsByKeyword(keyword);
});

searchInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const keyword = searchInput.value.trim();
    fetchPostsByKeyword(keyword);
  }
});

// Logout function
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

// Submit a new experience
function submitExperience() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if (!title || !description || !category) {
    alert('Please fill in all required fields.');
    return;
  }

  const formData = {
    'action': 'post-save',
    'values': {
        'title': title,
        'category': category,
        'content': description,
        'media': base64ImageString
    }
  };

  fetch('../../php/classes/class.main.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.inserted) {
        alert('Experience posted successfully!');
        addExperienceForm.reset();
        base64ImageString = null; 
        modalOverlay.classList.add("hidden");
        fetchPosts(); // Refresh posts after adding a new one
    } else {
        alert('Error posting experience: ' + (data.error || 'Unknown error occurred.'));
    }
  })
  .catch(error => {
    alert('Server error: ' + error);
  });
}

// Handle image to base64 conversion
const fileInput = document.getElementById('image-file');
fileInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = function() {
      base64ImageString = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// Apply filters
function applyFilters() {
  // Get values from filter popup
  const sortBy = document.getElementById('sortByDate').value;
  const category = document.getElementById('filterCategory').value;
  const keyword = searchInput.value.trim().toLowerCase();

  fetchPosts(sortBy, category, keyword);
  closeFilterPopup();
}

// Close Filter Popup
function closeFilterPopup() {
  filterPopup.classList.add('hidden');
}

// Search posts by keyword
function fetchPostsByKeyword(keyword) {
  if (!keyword) {
      alert('Please enter a keyword to search.');
      return;
  }

  fetch('../../php/classes/class.main.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        'action': 'keywords-fetch',
        'values': { keyword }
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error(data.error);
      alert('Error fetching posts: ' + data.error);
    } else {
      renderPosts(data.record);
    }
  })
  .catch(error => {
    console.error('Error fetching posts:', error);
    alert('An error occurred while fetching posts.');
  });
}

// Fetch posts with optional filters
function fetchPosts(order = 'newest', category = 'all', keyword = '') {
  // Convert 'newest'/'oldest' to appropriate order
  const sortOrder = order === 'oldest' ? 'asc' : 'desc';

  fetch('../../php/classes/class.main.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'action': 'posts-fetch',
      'values': { order: sortOrder, category: category, keyword: keyword }
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error(data.error);
      alert('Error fetching posts: ' + data.error);
    } else {
      renderPosts(data.record);
    }
  })
  .catch(error => {
    console.error('Error fetching posts:', error);
    alert('An error occurred while fetching posts.');
  });
}

// Render posts into .experience-list
function renderPosts(posts) {
  experienceList.innerHTML = ''; // Clear previous posts

  if (!posts || posts.length === 0) {
    experienceList.innerHTML = '<p>No experiences found.</p>';
    return;
  }

  posts.forEach(post => {
    const userName = `${post.FirstName.toUpperCase()} ${post.LastName.toUpperCase()}`;
    const postDate = formatDate(post.PostDate);
    const categoryName = post.Category;

    const imageTag = post.Picture
      ? `<img src="${post.Picture}" alt="Experience Image">`
      : ''; // No image, no <img> tag

    // Construct the post card
    const experienceCard = document.createElement('div');
    experienceCard.classList.add('experience-card');

    experienceCard.innerHTML = `
      <div class="card-header">
        <img src="${post.ProfilePicture ? post.ProfilePicture : '../img/default.jpg'}" alt="User Avatar">
        <div class="user-info">
            <h3>${userName}</h3>
            <p>${postDate}</p>
        </div>
      </div>
      <div class="card-body">
          <div class="experience-image">
            ${imageTag} <!-- Image is only included if it exists -->
          </div>
          <h2>${post.Title}</h2>
          <h3>${categoryName}</h3>
          <p>${post.Content}</p>
      </div>
      <button class="comment-btn" data-post-id="${post.PostID}">Comment</button>
    `;

    experienceList.appendChild(experienceCard);
  });

  // Attach comment button event listeners after rendering posts
  attachCommentButtonListeners();
}

// Format date to a more readable format
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

// Comment popup logic

// Close the comment pop-up
closeCommentBtn.addEventListener('click', () => {
  commentPopup.classList.add('hidden');
  currentPostID = null;
});

// Submit a comment
submitCommentBtn.addEventListener('click', () => {
  if (currentPostID) {
    addComment(currentPostID);
  } else {
    alert('No post selected for commenting.');
  }
});

// Open the comment pop-up for a specific post
function openCommentsPopup(postID) {
  currentPostID = postID;
  commentList.innerHTML = '';
  commentInput.value = '';
  fetchCommentsForPost(postID);
  commentPopup.classList.remove('hidden');
}

function fetchCommentsForPost(postID) {
  // Assuming backend supports action 'comments-fetch'
  fetch('../../php/classes/class.main.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'comments-fetch',
      values: { 'post_id': postID }
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        alert('Error fetching comments: ' + data.error);
      } else {
        renderComments(data.record);
      }
    })
    .catch(error => {
      console.error('Error fetching comments:', error);
      alert('An error occurred while fetching comments.');
    });
}


// Render fetched comments
function renderComments(comments) {
  commentList.innerHTML = '';
  if (!comments || comments.length === 0) {
    commentList.innerHTML = '<p>No comments yet.</p>';
    return;
  }

  comments.forEach(comment => {
    const commentEl = document.createElement('div');
    commentEl.classList.add('comment');
    commentEl.innerHTML = `
      <div class="comment-header">
        <img class="profile-pic" src="${comment.ProfilePicture || '../img/default.jpg'}" alt="Profile Picture">
        <strong class="username">${comment.CommentFirstName} ${comment.CommentLastName}:</strong>
      </div>
      <p>${comment.CommentContent}</p>
    `;
    commentList.appendChild(commentEl);
  });
}

function addComment(postID) {
  const content = commentInput.value.trim();
  if (content === '') {
    alert('Please enter a comment.');
    return;
  }

  const formData = {
    action: 'comment-save',
    values: {
      post_id: postID,
      content: content
    }
  };

  fetch('../../php/classes/class.main.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.inserted) {
        // Clear the comment input
        commentInput.value = '';
        // Re-fetch comments to update the list
        fetchCommentsForPost(postID);
      } else {
        alert('Error adding comment: ' + (data.error || 'Unknown error.'));
      }
    })
    .catch(error => {
      console.error('Error adding comment:', error);
      alert('Server error: ' + error);
    });
}

// Attach event listeners to comment buttons
function attachCommentButtonListeners() {
  const commentButtons = document.querySelectorAll('.comment-btn');
  commentButtons.forEach(button => {
    button.addEventListener('click', function() {
      const postID = this.getAttribute('data-post-id');
      openCommentsPopup(postID);
    });
  });
}

// Initial fetch on page load
document.addEventListener('DOMContentLoaded', function() {
  fetchPosts();
});
