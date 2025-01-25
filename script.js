// Add import at the top of script.js
import { UserAPI, CarAPI } from './api.js';

// Add this at the beginning of your script.js

// Improved loadNavbar function with error handling
function loadNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) return; // Skip if placeholder not found

    fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load navbar');
            }
            return response.text();
        })
        .then(data => {
            navbarPlaceholder.innerHTML = data;
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user) {
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = user.name;
                }
            }
            
            // Highlight active nav button
            const currentPage = window.location.pathname.split('/').pop().split('.')[0];
            const activeBtn = document.getElementById(`${currentPage}Btn`);
            if (activeBtn) {
                activeBtn.classList.add('active-nav');
            }
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            navbarPlaceholder.innerHTML = '<p>Error loading navigation</p>';
        });
}

// Improved window.onload function
window.onload = async function() {
    // Check if we're on the login page
    if (window.location.pathname.includes('login.html')) {
        return; // Don't load navbar or check user session on login page
    }

    loadNavbar();
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load page specific content
    try {
        if (window.location.pathname.includes('profile.html')) {
            loadUserProfile();
        } else if (window.location.pathname.includes('dashboard.html')) {
            if (user.isAdmin) {
                const adminPanel = document.getElementById('adminPanel');
                if (adminPanel) {
                    adminPanel.classList.remove('hidden');
                }
            }
            await loadCars();
        }
    } catch (error) {
        console.error('Error loading page content:', error);
    }
}

// Initialize cars array from localStorage or use default data
let cars = [];

// Load cars from API
async function loadCars() {
    try {
        cars = await CarAPI.getAllCars();
        displayCars(cars);
    } catch (error) {
        console.error('Error loading cars:', error);
        showNotification('Failed to load cars', 'error');
    }
}

// Save cars data to localStorage
function saveCarData() {
    localStorage.setItem('carData', JSON.stringify(cars));
}

let currentUser = null;

// Login function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const users = await UserAPI.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login. Please try again.');
    }
}

// Show main content after login
function showMainContent() {
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.isAdmin) {
        document.getElementById('adminPanel').classList.remove('hidden');
    }
    
    displayCars(cars);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Improved car management functions
function displayCars(carsToDisplay) {
    const container = document.getElementById('carContainer');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('currentUser'));
    container.innerHTML = '';

    carsToDisplay.forEach(car => {
        if (!car || !car.id) return;

        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <img src="${car.image || 'default-car-image.jpg'}" alt="${car.name}" onerror="this.src='default-car-image.jpg'">
            <h3>${car.name}</h3>
            <p>Model: ${car.model}</p>
            <p>Price: $${car.price}/day</p>
            ${user?.isAdmin ? `
                <div class="admin-controls">
                    <button class="edit-btn" data-car-id="${car.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" data-car-id="${car.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            ` : ''}
        `;

        // Add click event listener for the card
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.admin-controls')) {
                showCarDetails(car);
            }
        });

        // Add event listeners for edit and delete buttons
        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const carId = parseInt(e.target.closest('.edit-btn').dataset.carId);
                try {
                    const carToEdit = await CarAPI.getCarById(carId);
                    editCar(carToEdit);
                } catch (error) {
                    console.error('Error fetching car details:', error);
                    showNotification('Failed to load car details', 'error');
                }
            });
        }

        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const carId = parseInt(e.target.closest('.delete-btn').dataset.carId);
                await deleteCar(carId);
            });
        }

        container.appendChild(card);
    });
}

// Improved modal handling
function showCarDetails(car) {
    const modal = document.getElementById('carModal');
    const details = document.getElementById('carDetails');
    if (!modal || !details) return;
    
    details.innerHTML = `
        <div class="car-details-content">
            <img src="${car.image}" alt="${car.name}" onerror="this.src='default-car-image.jpg'">
            <div class="car-info">
                <h2>${car.name}</h2>
                <p><strong>Model:</strong> ${car.model}</p>
                <p><strong>Price:</strong> $${car.price}/day</p>
                <p><strong>Description:</strong></p>
                <p>${car.description || 'No description available.'}</p>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Add event listeners safely
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterCars);
    }

    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', filterCars);
    }

    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.onclick = function() {
            const modal = document.getElementById('carModal');
            if (modal) {
                modal.classList.add('hidden');
            }
        };
    });
});

// Search and filter functionality
function filterCars() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterValue = document.getElementById('priceFilter').value;
    
    let filteredCars = cars.filter(car => 
        car.name.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm)
    );
    
    if (filterValue === 'lowToHigh') {
        filteredCars.sort((a, b) => a.price - b.price);
    } else if (filterValue === 'highToLow') {
        filteredCars.sort((a, b) => b.price - a.price);
    }
    
    displayCars(filteredCars);
}

// Navigation function
function navigateTo(page) {
    // Add navigation logic here
    switch(page) {
        case 'dashboard':
            // Show dashboard/homepage
            break;
        case 'about':
            // Show about page
            break;
        case 'contact':
            // Show contact page
            break;
    }
}

// Show add car form in modal
function showAddCarForm() {
    const modal = document.getElementById('carModal');
    const details = document.getElementById('carDetails');
    
    details.innerHTML = `
        <h2>Add New Car</h2>
        <form id="addCarForm" class="add-car-form">
            <div class="form-group">
                <label for="carName">Car Name</label>
                <input type="text" id="carName" name="name" required>
            </div>
            <div class="form-group">
                <label for="carModel">Model</label>
                <input type="text" id="carModel" name="model" required>
            </div>
            <div class="form-group">
                <label for="carPrice">Price per Day ($)</label>
                <input type="number" id="carPrice" name="price" min="1" required>
            </div>
            <div class="form-group">
                <label for="carImage">Image URL</label>
                <input type="url" id="carImage" name="image" required>
            </div>
            <div class="form-group">
                <label for="carDescription">Description</label>
                <textarea id="carDescription" name="description" required></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-btn">Add Car</button>
                <button type="button" class="cancel-btn">Cancel</button>
            </div>
        </form>
    `;
    
    // Add event listeners after creating the form
    const form = details.querySelector('#addCarForm');
    form.addEventListener('submit', addNewCar);
    
    const cancelBtn = details.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', closeModal);
    
    modal.classList.remove('hidden');
}

// Add new car
async function addNewCar(event) {
    event.preventDefault();
    
    const form = event.target;
    const newCar = {
        name: form.name.value,
        model: form.model.value,
        price: parseFloat(form.price.value),
        image: form.image.value,
        description: form.description.value
    };
    
    try {
        await CarAPI.createCar(newCar);
        closeModal();
        loadCars(); // Reload cars from API
        showNotification('Car added successfully!', 'success');
    } catch (error) {
        console.error('Error adding car:', error);
        showNotification('Failed to add car', 'error');
    }
}

// Edit car
function editCar(car) {
    if (!car) return;
    
    const modal = document.getElementById('carModal');
    const details = document.getElementById('carDetails');
    
    details.innerHTML = `
        <h2>Edit Car</h2>
        <form id="editCarForm" class="add-car-form">
            <div class="form-group">
                <label for="carName">Car Name</label>
                <input type="text" id="carName" name="name" value="${car.name}" required>
            </div>
            <div class="form-group">
                <label for="carModel">Model</label>
                <input type="text" id="carModel" name="model" value="${car.model}" required>
            </div>
            <div class="form-group">
                <label for="carPrice">Price per Day ($)</label>
                <input type="number" id="carPrice" name="price" value="${car.price}" min="1" required>
            </div>
            <div class="form-group">
                <label for="carImage">Image URL</label>
                <input type="url" id="carImage" name="image" value="${car.image}" required>
            </div>
            <div class="form-group">
                <label for="carDescription">Description</label>
                <textarea id="carDescription" name="description" required>${car.description || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-btn">Update Car</button>
                <button type="button" class="cancel-btn">Cancel</button>
            </div>
        </form>
    `;
    
    // Add event listeners after creating the form
    const form = details.querySelector('#editCarForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateCar(e, car.id);
    });
    
    const cancelBtn = details.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', closeModal);
    
    modal.classList.remove('hidden');
}

// Update car
async function updateCar(event, carId) {
    event.preventDefault();
    
    const form = event.target;
    const updatedCar = {
        id: carId, // Make sure to include the ID
        name: form.name.value,
        model: form.model.value,
        price: parseFloat(form.price.value),
        image: form.image.value,
        description: form.description.value
    };
    
    try {
        await CarAPI.updateCar(carId, updatedCar);
        closeModal();
        await loadCars(); // Reload cars from API
        showNotification('Car updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating car:', error);
        showNotification('Failed to update car', 'error');
    }
}

// Delete car
async function deleteCar(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
        try {
            await CarAPI.deleteCar(carId);
            await loadCars(); // Reload cars from API
            showNotification('Car deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting car:', error);
            showNotification('Failed to delete car', 'error');
        }
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('carModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add these styles to your styles.css
const styles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 4px;
    color: white;
    z-index: 1001;
    animation: slideIn 0.3s ease-out;
}

.notification.success {
    background-color: #4CAF50;
}

.notification.error {
    background-color: #f44336;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.add-car-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
}
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Load user profile with more details
async function loadUserProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Fetch latest user data from API
        const currentUser = await UserAPI.getUserById(user.id);
        
        // Update localStorage with fresh data
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Set profile details
        document.getElementById('profileNameHeader').textContent = currentUser.name;
        document.getElementById('profileNameInput').value = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.isAdmin ? 'Administrator' : 'Regular User';
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profilePhone').value = currentUser.phone || '';
        document.getElementById('profileAddress').value = currentUser.address || '';
        document.getElementById('accountType').value = currentUser.isAdmin ? 'Administrator Account' : 'Regular Account';
        document.getElementById('memberSince').value = currentUser.memberSince || new Date().toLocaleDateString();
        
        // Update navbar username if it exists
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

// Update profile with new information
async function updateProfile(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    try {
        // Create updated user object
        const updatedUser = {
            ...user,
            name: document.getElementById('profileNameInput').value,
            phone: document.getElementById('profilePhone').value,
            address: document.getElementById('profileAddress').value
        };
        
        // Call API to update user
        await UserAPI.updateUser(user.id, updatedUser);
        
        // Update local storage with new data
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update header and navbar with new name
        document.getElementById('profileNameHeader').textContent = updatedUser.name;
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = updatedUser.name;
        }
        
        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Reset form to original values
async function resetForm() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || !user.id) {
            throw new Error('User not found');
        }
        
        // Fetch latest user data from API
        const updatedUser = await UserAPI.getUserById(user.id);
        
        // Update localStorage with fresh data
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Load the fresh data into the form
        loadUserProfile();
        
        showNotification('Form reset successfully', 'success');
    } catch (error) {
        console.error('Error resetting form:', error);
        showNotification('Failed to reset form', 'error');
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Login page functionality
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

    // Add other event listeners for buttons that previously used onclick
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    const addCarButton = document.querySelector('.add-car-btn');
    if (addCarButton) {
        addCarButton.addEventListener('click', showAddCarForm);
    }

    // Add form submit handlers
    const addCarForm = document.getElementById('addCarForm');
    if (addCarForm) {
        addCarForm.addEventListener('submit', addNewCar);
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    // Add reset form button handler
    const resetFormBtn = document.getElementById('resetFormBtn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', resetForm);
    }

    // Load profile if on profile page
    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
    }
});

// Export functions that need to be accessed globally
window.logout = logout;
window.showCarDetails = showCarDetails;
window.editCar = editCar;
window.deleteCar = deleteCar;
window.closeModal = closeModal;
window.updateCar = updateCar;
window.showAddCarForm = showAddCarForm;
window.addNewCar = addNewCar;
window.updateProfile = updateProfile;
window.resetForm = resetForm; 