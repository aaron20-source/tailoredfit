// script.js
// Contains all JavaScript logic for the Virtual TRY ON App (Multi-Page Version)
// Revision v43: Added console logging to handleRegistration for debugging account creation issues.
// Revision v42: Modified Forgot Password flow to verify email against registered users in localStorage.
// Revision v41: Added functionality to save clothing item to gallery on click with recommended size.
// Revision v40.1: Improved error message in the main catch block to include error.message if available.
// Revision v40: Added more robust error handling for loading state from localStorage and initial element checks.
// Revision v39: Added modal pop-up for clothing preview with size recommendation.
//               Modal image is intended to be the main model wearing the selected clothing.
// Revision v38.1: Enhanced uploaded clothing to be try-on-able on both default and uploaded models of matching gender.
// Revision v38: Added "Upload Your Clothes" functionality.


// --- Constants ---
const USERS_STORAGE_KEY = 'virtualTryOnUsers';
const LOGGED_IN_USER_EMAIL_KEY = 'virtualTryOnLoggedInUser';
const REMEMBERED_USER_EMAIL_KEY = 'virtualTryOnRememberedUserEmail';
const USER_GALLERY_KEY_PREFIX = 'virtualTryOnUserGallery_';
const LAST_STUDIO_STATE_KEY = 'virtualTryOnLastStudioState';
const USER_UPLOADED_MODEL_KEY_PREFIX = 'virtualTryOnUploadedModel_';
const USER_UPLOADED_CLOTHING_KEY_PREFIX = 'virtualTryOnUserClothing_';
const DEFAULT_BACKGROUND_COLOR = '#f1f5f9';
const DEFAULT_MODEL_HEIGHT_CM = 170;
const DEFAULT_MODEL_WEIGHT_KG = 70;
const DEFAULT_CLOTHING_CATEGORY = 'All';

// --- Global State ---
let emailToReset = null;
let userUploadedClothingItems = [];
let currentItemForModalTryOn = null; // To store the item selected in the modal

// --- Predefined Data ---
// IMPORTANT: For predefinedClothingItems, ensure image paths are accessible by the browser.
// Local absolute paths (e.g., "C:/Users/...") WILL NOT WORK in most browser environments.
// Use relative paths (e.g., "images/female_model_shirt.png") or full HTTPS URLs.
// NOTE: Keeping local paths as requested by the user for now, but this is a common source of errors.
const predefinedModels = {
    female: { type: 'default', gender: 'female', name: 'Default Female', src: 'C:/Users/Administrator/Desktop/try on 2/female.png', defaultHeightCm: 165, defaultWeightKg: 60 },
    male: { type: 'default', gender: 'male', name: 'Default Male', src: 'C:/Users/Administrator/Desktop/try on 2/male.png', defaultHeightCm: 175, defaultWeightKg: 75 }
};

const predefinedClothingItems = [
    {
        id: 'item_tops_1', name: 'Green short-sleeve shirt', src: 'C:/Users/Administrator/Desktop/try on 2/14th.png', category: 'Tops', gender: 'unisex', type: 'top',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/tfA2.png", // Default female
            male: "C:/Users/Administrator/Desktop/try on 2/ma/male an/tma2.png",     // Default male
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/tf3.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: "C:/Users/Administrator/Desktop/try on 2/male/for male/tm3.png"      // *** REPLACE WITH YOUR PATH ***
        }
    },
    {
        id: 'item_tops_2', name: 'Black shirt with pockets', src: 'C:/Users/Administrator/Desktop/try on 2/17th.png', category: 'Tops', gender: 'male', type: 'top',
        tryOnImage: {
            female: null,
            male: "C:/Users/Administrator/Desktop/try on 2/ma/male an/tma3.png",     // Default male
            uploaded_female: null, // Not applicable or image not available
            uploaded_male: "C:/Users/Administrator/Desktop/try on 2/male/for male/tm1.png" // *** REPLACE WITH YOUR PATH ***
        }
    },
    {
        id: 'item_tops_3', name: 'White blouse with a bow', src: 'C:/Users/Administrator/Desktop/try on 2/12th.png', category: 'Tops', gender: 'female', type: 'top',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/tfA4.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/tf1.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
    {
        id: 'item_outer_1', name: 'Denim Jacket', src: 'C:/Users/Administrator/Desktop/try on 2/21.png', category: 'Tops', gender: 'unisex', type: 'top',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/tfA3.png", // Default female
            male: "C:/Users/Administrator/Desktop/try on 2/ma/male an/tma4.png",     // Default male
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/tf4.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: "C:/Users/Administrator/Desktop/try on 2/male/for male/tm2.png"      // *** REPLACE WITH YOUR PATH ***
        }
    },
    {
        id: 'item_outer_2', name: 'Black short-sleeve shirt with white stitching', src: 'C:/Users/Administrator/Desktop/try on 2/5th.png', category: 'Tops', gender: 'male', type: 'top',
        tryOnImage: {
            female: null,
            male: "C:/Users/Administrator/Desktop/try on 2/ma/male an/tma1.png",     // Default male
            uploaded_female: null,
            uploaded_male: "C:/Users/Administrator/Desktop/try on 2/male/for male/tm4.png" // *** REPLACE WITH YOUR PATH ***
        }
    },
    {
        id: 'item_outer_3', name: 'Beige cropped sweater', src: 'C:/Users/Administrator/Desktop/try on 2/6th.png', category: 'Tops', gender: 'female', type: 'top',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/tfA1.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/tf2.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
    {
        id: 'item_dress_1', name: 'Black dress/Business casual', src: 'C:/Users/Administrator/Desktop/try on 2/22.png', category: 'One Piece', gender: 'female', type: 'other',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/opf4.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/opf22.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
    {
        id: 'item_dress_2', name: 'Brown sleeveless dress', src: 'C:/Users/Administrator/Desktop/try on 2/9th.png', category: 'One Piece', gender: 'female', type: 'other',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/opf3.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/opf11.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
    {
        id: 'item_dress_3', name: 'Red dress with pleats and gold buttons', src: 'C:/Users/Administrator/Desktop/try on 2/10th.png', category: 'One Piece', gender: 'female', type: 'other',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/opf1.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/opf33.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
    {
        id: 'item_bottoms_1', name: 'Dark blue jeans', src: 'C:/Users/Administrator/Desktop/try on 2/2nd.png', category: 'Bottoms', gender: 'unisex', type: 'bottom',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/bfa1.png", // Default female
            male: "C:/Users/Administrator/Desktop/try on 2/ma/male an/bma1.png",     // Default male
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/bf1.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: "C:/Users/Administrator/Desktop/try on 2/male/for male/bm1.png"      // *** REPLACE WITH YOUR PATH ***
        }
    },
    {
        id: 'item_bottoms_2', name: 'Black wide-leg pants', src: 'C:/Users/Administrator/Desktop/try on 2/20.png', category: 'Bottoms', gender: 'male', type: 'bottom',
        tryOnImage: {
            female: null,
            male: "C:/Users/Administrator/Desktop/try on 2/ma/male an/bma2.png",     // Default male
            uploaded_female: null,
            uploaded_male: "C:/Users/Administrator/Desktop/try on 2/male/for male/bm2.png" // *** REPLACE WITH YOUR PATH ***
        }
    },
    {
        id: 'item_bottoms_3', name: 'Marni low-rise Flared Trousers', src: 'C:/Users/Administrator/Desktop/try on 2/23.png', category: 'Bottoms', gender: 'female', type: 'bottom',
         tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/bfa2.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/bf2.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
    {
        id: 'item_skirt_1', name: 'Red pleated skirt', src: 'C:/Users/Administrator/Desktop/try on 2/7th.png', category: 'One Piece', gender: 'female', type: 'other',
        tryOnImage: {
            female: "C:/Users/Administrator/Desktop/try on 2/fa/female an/opf2.png", // Default female
            male: null,
            uploaded_female: "C:/Users/Administrator/Desktop/try on 2/female/for female/opf44.png", // *** REPLACE WITH YOUR PATH ***
            uploaded_male: null
        }
    },
];
// --- Size Chart Data ---
const sizeChart = [
    { size: 'Small', minHeightCm: 150, maxHeightCm: 163, minWeightKg: 43, maxWeightKg: 52 },
    { size: 'Medium', minHeightCm: 157, maxHeightCm: 170, minWeightKg: 52, maxWeightKg: 61 },
    { size: 'Large', minHeightCm: 163, maxHeightCm: 175, minWeightKg: 61, maxWeightKg: 70 },
    { size: 'XL', minHeightCm: 168, maxHeightCm: 180, minWeightKg: 68, maxWeightKg: 77 },
];


// --- Utility Functions ---
function getUsers() { try { const u = localStorage.getItem(USERS_STORAGE_KEY); return u ? JSON.parse(u) : []; } catch (e) { console.error("LS Error (getUsers):", e); return []; } }
function saveUsers(users) { try { localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); } catch (e) { console.error("LS Error (saveUsers):", e); alert("Error saving user data."); } }
function findUserByEmail(email) { if (!email) return null; try { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null; } catch (e) { console.error("Error (findUserByEmail):", e); return null; } }
function getLoggedInUserEmail() { try { return localStorage.getItem(LOGGED_IN_USER_EMAIL_KEY); } catch (e) { console.error("LS Error (getLoggedInUserEmail):", e); return null; } }
function getLoggedInUser() { const e = getLoggedInUserEmail(); return e ? findUserByEmail(e) : null; }
function saveLastStudioState(state) { try { localStorage.setItem(LAST_STUDIO_STATE_KEY, JSON.stringify(state)); } catch (e) { console.error("LS Error (saveLastStudioState):", e); } }
function getLastStudioState() { try { const s = localStorage.getItem(LAST_STUDIO_STATE_KEY); return s ? JSON.parse(s) : null; } catch (e) { console.error("LS Error (getLastStudioState):", e); return null; } }
function getUserGallery(email) { if (!email) return []; try { const key = `${USER_GALLERY_KEY_PREFIX}${email.toLowerCase()}`; const galleryJson = localStorage.getItem(key); return galleryJson ? JSON.parse(galleryJson) : []; } catch (e) { console.error("LS Error (getUserGallery):", e); return []; } }
function saveUserGallery(email, galleryItems) { if (!email) return; try { const key = `${USER_GALLERY_KEY_PREFIX}${email.toLowerCase()}`; localStorage.setItem(key, JSON.stringify(galleryItems)); } catch (e) { console.error("LS Error (saveUserGallery):", e); alert("Could not save item to gallery."); } }
// Modified addToUserGallery to accept item data including recommendedSize and itemType
function addToUserGallery(email, itemData) {
    if (!email || !itemData || !itemData.id || !itemData.src) {
        console.warn("addToUserGallery: Invalid input");
        return;
    }
    const gallery = getUserGallery(email);
    // Check if an item with the same ID already exists (prevent duplicates of the same clothing item)
    // Note: This check prevents adding the *same clothing item* multiple times.
    // Outfits will have unique IDs based on timestamp, so they won't be blocked by this.
    if (gallery.some(g => g.id === itemData.id && g.itemType !== 'outfit')) {
        console.log("Clothing item already in gallery.");
        // Optional: Show a message to the user that the item is already saved
        const studioSuccessMessage = document.getElementById('studio-success-message'); // Attempt to get message element
        if (studioSuccessMessage) {
             showMessage(studioSuccessMessage, `"${itemData.name}" is already in your gallery.`, false, 3000);
        }
        return;
    }
    // Add itemType for clarity in gallery (clothing vs outfit)
    const newItem = { ...itemData, createdAt: Date.now(), itemType: itemData.itemType || 'clothing' };
    gallery.push(newItem);
    saveUserGallery(email, gallery);
}
function removeFromUserGallery(email, itemId) { if (!email) return; let gallery = getUserGallery(email); gallery = gallery.filter(item => item.id !== itemId); saveUserGallery(email, gallery); }
function saveUploadedModelData(email, modelData) { if (!email || !modelData || !modelData.gender || !modelData.src) { console.warn("saveUploadedModelData: Invalid input", modelData); return; } try { const key = `${USER_UPLOADED_MODEL_KEY_PREFIX}${email.toLowerCase()}`; localStorage.setItem(key, JSON.stringify({ gender: modelData.gender, src: modelData.src })); console.log("Saved uploaded model data for", email); } catch (e) { console.error("LS Error (saveUploadedModelData):", e); alert("Error saving uploaded model data."); } }
function getUploadedModelData(email) { if (!email) return null; try { const key = `${USER_UPLOADED_MODEL_KEY_PREFIX}${email.toLowerCase()}`; const data = localStorage.getItem(key); const parsedData = data ? JSON.parse(data) : null; if (parsedData) { parsedData.defaultHeightCm = parsedData.defaultHeightCm || DEFAULT_MODEL_HEIGHT_CM; parsedData.defaultWeightKg = parsedData.defaultWeightKg || DEFAULT_MODEL_WEIGHT_KG; } return parsedData; } catch (e) { console.error("LS Error (getUploadedModelData):", e); return null; } }
function deleteUploadedModelData(email) { if (!email) return; try { const key = `${USER_UPLOADED_MODEL_KEY_PREFIX}${email.toLowerCase()}`; localStorage.removeItem(key); console.log("Deleted uploaded model data for", email); } catch (e) { console.error("LS Error (deleteUploadedModelData):", e); } }

function getUserUploadedClothing(email) {
    if (!email) return [];
    try {
        const key = `${USER_UPLOADED_CLOTHING_KEY_PREFIX}${email.toLowerCase()}`;
        const clothingJson = localStorage.getItem(key);
        return clothingJson ? JSON.parse(clothingJson) : [];
    } catch (e) {
        console.error("LS Error (getUserUploadedClothing):", e);
        return [];
    }
}

function saveUserUploadedClothing(email, clothingItems) {
    if (!email) return;
    try {
        const key = `${USER_UPLOADED_CLOTHING_KEY_PREFIX}${email.toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify(clothingItems));
        console.log("Saved user uploaded clothing for", email);
    } catch (e) {
        console.error("LS Error (saveUserUploadedClothing):", e);
        alert("Could not save uploaded clothing.");
    }
}

function addUserUploadedClothingItem(email, item) {
    if (!email || !item || !item.id || !item.src || !item.name || !item.category || !item.gender) {
        console.warn("addUserUploadedClothingItem: Invalid input", item);
        return false;
    }
    const userClothing = getUserUploadedClothing(email);
    userClothing.push(item);
    saveUserUploadedClothing(email, userClothing);
    return true;
}


function requireLogin() { if (!getLoggedInUserEmail()) { console.log("User not logged in. Redirecting..."); window.location.href = 'login.html'; } }
function redirectIfLoggedIn() { if (getLoggedInUserEmail()) { console.log("User already logged in. Redirecting..."); window.location.href = 'studio.html'; } }
function handleLogout() { try { const email = getLoggedInUserEmail(); localStorage.removeItem(LOGGED_IN_USER_EMAIL_KEY); localStorage.removeItem(LAST_STUDIO_STATE_KEY); console.log("User logged out."); window.location.href = 'login.html'; } catch(e) { console.error("Error during logout:", e); window.location.href = 'login.html'; } }

function togglePasswordVisibility(event) {
    const icon = event.target.closest('.password-toggle-icon');
    if (!icon) return;
    const targetId = icon.getAttribute('data-target');
    if (!targetId) return;
    const passwordInput = document.getElementById(targetId);
    if (passwordInput) {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        icon.querySelector('i').classList.toggle('ri-eye-line', !isPassword);
        icon.querySelector('i').classList.toggle('ri-eye-off-line', isPassword);
    }
}
function setErrorFor(input, message) {
    if (!input) return;
    const formControl = input.closest('.mb-5') || input.closest('.form-control') || input.parentElement.closest('div');
    if (!formControl) return;
    let small = formControl.querySelector('small.error-text');
    if (!small) {
        small = document.createElement('small');
        small.classList.add('text-red-500', 'text-xs', 'mt-1', 'block', 'error-text');
        if (input.nextSibling) {
            formControl.insertBefore(small, input.nextSibling);
        } else {
            formControl.appendChild(small);
        }
    }
    formControl.classList.remove('success');
    formControl.classList.add('error');
    small.innerText = message;
    if (input.tagName === 'INPUT' || input.tagName === 'SELECT') {
        input.classList.add('border-red-500', 'focus:ring-red-500');
        input.classList.remove('border-green-500', 'focus:ring-green-500');
    }
}

function setSuccessFor(input) {
    if (!input) return;
    const formControl = input.closest('.mb-5') || input.closest('.form-control') || input.parentElement.closest('div');
    if (!formControl) return;
    const small = formControl.querySelector('small.error-text');
    if (small) {
        small.innerText = '';
        small.remove();
    }
    formControl.classList.remove('error');
    if (input.tagName === 'INPUT' || input.tagName === 'SELECT') {
        input.classList.remove('border-red-500', 'focus:ring-red-500');
    }
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

function clearFormStates(forms) {
    forms.forEach(form => {
        if (!form) return;
        form.querySelectorAll('input, select, textarea').forEach(input => {
            clearValidationState(input);
        });
        form.querySelectorAll('.error-message, .success-message, .message-area').forEach(msg => {
            msg.classList.add('hidden');
            msg.textContent = '';
        });
        form.querySelectorAll('.custom-radio.checked').forEach(cr => cr.classList.remove('checked'));
        form.querySelectorAll('.file-upload-area').forEach(area => {
            const display = area.querySelector('p:first-of-type');
            if (display && area.dataset.defaultText) {
                display.textContent = area.dataset.defaultText;
            }
            area.classList.remove('border-primary', 'bg-secondary', 'bg-opacity-20', 'border-red-500');
        });
        form.reset();
    });
}

function clearValidationState(input) {
    if (!input) return;
    const formControl = input.closest('.mb-5') || input.closest('.form-control') || input.parentElement.closest('div');
    if (formControl) {
        const small = formControl.querySelector('small.error-text');
        if (small) {
            small.innerText = '';
            small.remove();
        }
        formControl.classList.remove('error', 'success');
        if (input.tagName === 'INPUT' || input.tagName === 'SELECT') {
            input.classList.remove('border-red-500', 'focus:ring-red-500', 'border-green-500', 'focus:ring-green-500');
        }
        if (input.type === 'file') {
            const dropArea = formControl.querySelector('.file-upload-area');
            if (dropArea) {
                dropArea.classList.remove('border-red-500');
            }
        }
    }
}


function showMessage(element, text, isError = false, duration = 3000) {
    if (!element) return;
    element.textContent = text;
    element.classList.remove('hidden', 'text-red-600', 'text-green-600');
    element.classList.add(isError ? 'text-red-600' : 'text-green-600');
    element.style.display = 'block';

    if (duration > 0) {
        setTimeout(() => {
            element.classList.add('hidden');
             element.style.display = 'none';
        }, duration);
    }
}


// --- Page-Specific Initialization Functions ---

function initLoginPage() {
    console.log("Initializing Login Page");
    redirectIfLoggedIn();

    const loginForm = document.getElementById('login-form');
    const emailInput = loginForm?.querySelector('input[type="email"]#login-email');
    const passwordInput = loginForm?.querySelector('input[type="password"]#login-password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginMessage = document.getElementById('login-message');

    if (!loginForm || !emailInput || !passwordInput || !loginMessage || !rememberMeCheckbox) {
        console.error("Login form elements missing!");
        if (loginMessage) showMessage(loginMessage, "Error initializing login form.", true);
        return;
    }

    try {
        const rememberedEmail = localStorage.getItem(REMEMBERED_USER_EMAIL_KEY);
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    } catch (e) {
        console.error("LS Error (loading remembered email):", e);
    }

    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('focus', () => {
            clearValidationState(input);
            showMessage(loginMessage, '', false, 0);
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !isValidEmail(email)) { setErrorFor(emailInput, 'Valid email is required'); isValid = false; } else { setSuccessFor(emailInput); }
        if (!password) { setErrorFor(passwordInput, 'Password cannot be blank'); isValid = false; } else { setSuccessFor(passwordInput); }

        if (!isValid) { showMessage(loginMessage, 'Please fix the errors above.', true); return; }

        const user = findUserByEmail(email);
        if (user && user.password === password) {
            try {
                localStorage.setItem(LOGGED_IN_USER_EMAIL_KEY, user.email);
                if (rememberMeCheckbox.checked) { localStorage.setItem(REMEMBERED_USER_EMAIL_KEY, user.email); } else { localStorage.removeItem(REMEMBERED_USER_EMAIL_KEY); }
                showMessage(loginMessage, 'Login successful! Redirecting...', false, 1500);
                setTimeout(() => window.location.href = 'studio.html', 1500);
            } catch (lsError) { showMessage(loginMessage, 'Login failed due to a storage error.', true); }
        } else {
            showMessage(loginMessage, 'Invalid email or password.', true);
            setErrorFor(emailInput, ' '); setErrorFor(passwordInput, ' ');
        }
    });
}

function handleRegistration() {
    console.log("Initializing Registration Form Handling");
    const registerForm = document.getElementById('register-form');
    const nameInput = registerForm?.querySelector('input[type="text"]#register-name');
    const emailInput = registerForm?.querySelector('input[type="email"]#register-email');
    const passwordInput = registerForm?.querySelector('input[type="password"]#register-password');
    const confirmPasswordInput = registerForm?.querySelector('input[type="password"]#confirm-password');
    const termsCheckbox = registerForm?.querySelector('input[type="checkbox"]#terms');
    const registerMessage = document.getElementById('register-message');

    // --- Added Logging ---
    console.log("handleRegistration function called.");
    console.log("Register form elements:", { registerForm, nameInput, emailInput, passwordInput, confirmPasswordInput, termsCheckbox, registerMessage });
    // --- End Added Logging ---


    if (!registerForm || !nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !termsCheckbox || !registerMessage) {
        console.error("Registration form elements missing!");
         if (registerMessage) showMessage(registerMessage, "Error initializing registration form.", true);
        return;
    }

    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('focus', () => { clearValidationState(input); showMessage(registerMessage, '', false, 0); });
    });
    termsCheckbox.addEventListener('change', () => { showMessage(registerMessage, '', false, 0); });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // --- Added Logging ---
        console.log("Registration form submitted.");
        // --- End Added Logging ---

        let isValid = true;
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // --- Added Logging ---
        console.log("Form values:", { name, email, password, confirmPassword, termsChecked: termsCheckbox.checked });
        // --- End Added Logging ---


        if (!name) { setErrorFor(nameInput, 'Full Name is required'); isValid = false; } else { setSuccessFor(nameInput); }
        if (!email || !isValidEmail(email)) { setErrorFor(emailInput, 'Valid email is required'); isValid = false; }
        else if (findUserByEmail(email)) {
             setErrorFor(emailInput, 'This email is already registered');
             showMessage(registerMessage, 'This email is already registered. Please use a different email or log in.', true); // More explicit message
             isValid = false;
        }
        else { setSuccessFor(emailInput); }
        if (!password) { setErrorFor(passwordInput, 'Password cannot be blank'); isValid = false; }
        else if (password.length < 6) { setErrorFor(passwordInput, 'Password must be at least 6 characters'); isValid = false; }
        else { setSuccessFor(passwordInput); }
        if (!confirmPassword) { setErrorFor(confirmPasswordInput, 'Please confirm your password'); isValid = false; }
        else if (password && confirmPassword !== password) { setErrorFor(confirmPasswordInput, 'Passwords do not match'); isValid = false; }
        else if (password) { setSuccessFor(confirmPasswordInput); }
        if (!termsCheckbox.checked) { showMessage(registerMessage, 'You must accept the terms and privacy policy.', true); isValid = false; }

        // --- Added Logging ---
        console.log("Validation result:", isValid);
        // --- End Added Logging ---

        if (!isValid) { if (!registerMessage.textContent || registerMessage.textContent === 'Processing...') { showMessage(registerMessage, 'Please fix the errors above.', true); } return; }

        const newUser = { email: email, password: password, name: name, createdAt: Date.now() };

        // --- Added Logging ---
        console.log("New user object:", newUser);
        // --- End Added Logging ---

        try {
            const users = getUsers();
            users.push(newUser);
            saveUsers(users);

            // --- Added Logging ---
            console.log("User saved successfully. Current users:", getUsers());
            // --- End Added Logging ---

            showMessage(registerMessage, 'Registration successful! You can now log in.', false, 5000);
            const loginTab = document.getElementById('login-tab');
            const registerTab = document.getElementById('register-tab');
            const loginFormDiv = document.getElementById('login-form-div');
            const registerFormDiv = document.getElementById('register-form-div');
            if (loginTab && registerTab && loginFormDiv && registerFormDiv) {
                 clearFormStates([registerForm]);
                 loginTab.classList.add('tab-active'); registerTab.classList.remove('tab-active');
                 loginFormDiv.classList.remove('hidden'); registerFormDiv.classList.add('hidden');
                 const loginEmailInput = loginFormDiv.querySelector('input[type="email"]');
                 if(loginEmailInput) { loginEmailInput.value = email; setSuccessFor(loginEmailInput); }
            }
        } catch (error) {
            // --- Added Logging ---
            console.error("Error saving user to localStorage:", error);
            // --- End Added Logging ---
            showMessage(registerMessage, 'Failed to register. Please try again.', true);
        }
    });
}


function initForgotPasswordPage() {
    console.log("Initializing Forgot Password Page");
    // requireLogin(); // Keep this if you want to ensure only logged-in users can reset their password, otherwise remove.
                    // Assuming for this flow, anyone can attempt to reset if they know the email, so removing requireLogin().
    // requireLogin(); // Removed as per assumption

    const forgotSection = document.getElementById('forgot-password-section');
    const resetSection = document.getElementById('reset-password-section');
    const successSection = document.getElementById('success-section');
    const forgotForm = document.getElementById('forgot-password-form');
    const resetForm = document.getElementById('reset-password-form');
    const emailInput = document.getElementById('forgot-email');
    const newPasswordInput = document.getElementById('reset-new-password');
    const confirmPasswordInput = document.getElementById('reset-confirm-password');
    const forgotMessage = document.getElementById('forgot-message');
    const resetMessage = document.getElementById('reset-message');

    if (!forgotSection || !resetSection || !successSection || !forgotForm || !resetForm ||
        !emailInput || !newPasswordInput || !confirmPasswordInput || !forgotMessage || !resetMessage) {
        console.error("Forgot password page elements are missing!");
        document.body.innerHTML = '<p class="text-red-600 text-center mt-10">Error initializing the page. Please contact support.</p>';
        return;
    }

    // Ensure only the forgot section is visible initially
    forgotSection.classList.remove('hidden');
    resetSection.classList.add('hidden');
    successSection.classList.add('hidden');


    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Clear previous states
        clearValidationState(emailInput);
        showMessage(forgotMessage, '', false, 0);

        const email = emailInput.value.trim();

        // Validate email format
        if (!email || !isValidEmail(email)) {
            setErrorFor(emailInput, 'Valid email required.');
            showMessage(forgotMessage, 'Please enter a valid email address.', true);
            return;
        }

        // --- Verify email against registered users ---
        const user = findUserByEmail(email);

        if (user) {
            // Email found, proceed to reset section
            emailToReset = user.email; // Store the *verified* email globally
            setSuccessFor(emailInput); // Mark email input as valid

            showMessage(forgotMessage, `Email verified. Set your new password below.`, false, 0); // Show success message below the form
            forgotSection.classList.add('hidden');
            resetSection.classList.remove('hidden');
            successSection.classList.add('hidden');

            // Clear the password fields in the reset form in case they had previous values
            resetForm.reset();
            clearFormStates([resetForm]); // Clear validation states for reset form

        } else {
            // Email not found
            setErrorFor(emailInput, 'Email not registered.'); // Mark email input as invalid
            showMessage(forgotMessage, `The email "${email}" is not registered. Please check the email address or register for an account.`, true);
            emailToReset = null; // Ensure emailToReset is null if verification fails
        }
    });

    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearValidationState(newPasswordInput); clearValidationState(confirmPasswordInput); showMessage(resetMessage, '', false, 0);
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let isValid = true;

        if (!newPassword) { setErrorFor(newPasswordInput, 'New password required.'); isValid = false; }
        else if (newPassword.length < 6) { setErrorFor(newPasswordInput, 'Min 6 characters.'); isValid = false; }
        else { setSuccessFor(newPasswordInput); }
        if (!confirmPassword) { setErrorFor(confirmPasswordInput, 'Confirm password.'); isValid = false; }
        else if (newPassword && confirmPassword !== newPassword) { setErrorFor(confirmPasswordInput, 'Passwords do not match.'); isValid = false; }
        else if (newPassword) { setSuccessFor(confirmPasswordInput); }

        if (!isValid) { showMessage(resetMessage, 'Please fix errors.', true); return; }
        if (!emailToReset) { showMessage(resetMessage, 'Error: Email not verified. Please start again.', true); return; } // Check if emailToReset is set

        try {
            const users = getUsers();
            // Find the user using the stored emailToReset
            const userIndex = users.findIndex(u => u.email.toLowerCase() === emailToReset.toLowerCase());

            if (userIndex !== -1) {
                // User found (should be, as emailToReset was set after verification)
                if (users[userIndex].password === newPassword) {
                    setErrorFor(newPasswordInput, 'New password must be different.');
                    showMessage(resetMessage, 'New password must be different from the current one.', true);
                    return;
                }
                // Update the password
                users[userIndex].password = newPassword;
                saveUsers(users);

                // Reset global state and show success
                emailToReset = null;
                resetSection.classList.add('hidden');
                successSection.classList.remove('hidden');
                forgotSection.classList.add('hidden');

                 // Clear the reset form after successful reset
                 resetForm.reset();
                 clearFormStates([resetForm]);

            } else {
                // This case should ideally not happen if emailToReset is correctly managed,
                // but it's a fallback for safety.
                showMessage(resetMessage, 'User not found for reset. Please try verifying your email again.', true);
                emailToReset = null; // Clear state
                // Optionally redirect back to the forgot email section
                resetSection.classList.add('hidden');
                forgotSection.classList.remove('hidden');
                successSection.classList.add('hidden');
                forgotForm.reset(); // Clear the forgot form as well
                clearFormStates([forgotForm]); // Clear validation states for forgot form
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            showMessage(resetMessage, 'An error occurred during password reset. Please try again.', true);
        }
    });

    // Add event listener to the "Cancel" link to clear state and return to forgot section
    const cancelResetLink = document.getElementById('cancel-reset-link');
    if (cancelResetLink) {
        cancelResetLink.addEventListener('click', (e) => {
             // Allow default link behavior (navigating to login.html)
             // If you want to stay on the forgot password page and just go back to the email input:
             // e.preventDefault();
             // emailToReset = null;
             // resetSection.classList.add('hidden');
             // forgotSection.classList.remove('hidden');
             // forgotForm.reset();
             // clearFormStates([forgotForm]);
             // showMessage(forgotMessage, '', false, 0); // Clear any previous message
        });
    }


}


function initAccountPage() {
    console.log("Initializing Account Page");
    requireLogin();
    const user = getLoggedInUser();
    if (!user) { handleLogout(); return; }

    const nameDisplay = document.getElementById('account-name');
    const emailDisplay = document.getElementById('account-email');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountError = document.getElementById('delete-account-error');

    if (!emailDisplay || !deleteAccountBtn || !deleteAccountError || !nameDisplay) {
         console.error("Account page elements missing!"); return;
    }
    nameDisplay.textContent = user.name || 'N/A';
    emailDisplay.textContent = user.email;

    deleteAccountBtn.addEventListener('click', () => {
        showMessage(deleteAccountError, '', false, 0);
        if (confirm('Delete account? This cannot be undone.')) {
            const emailConfirmation = prompt(`Confirm by typing your email: ${user.email}`);
            if (emailConfirmation === user.email) {
                try {
                    let users = getUsers();
                    users = users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
                    saveUsers(users);
                    localStorage.removeItem(`${USER_GALLERY_KEY_PREFIX}${user.email.toLowerCase()}`);
                    localStorage.removeItem(`${USER_UPLOADED_MODEL_KEY_PREFIX}${user.email.toLowerCase()}`);
                    localStorage.removeItem(`${USER_UPLOADED_CLOTHING_KEY_PREFIX}${user.email.toLowerCase()}`);
                    localStorage.removeItem(LAST_STUDIO_STATE_KEY);
                    localStorage.removeItem(LOGGED_IN_USER_EMAIL_KEY);
                    alert('Account deleted.'); window.location.href = 'login.html';
                } catch (error) { showMessage(deleteAccountError, 'Failed to delete. Try again.', true); }
            } else { showMessage(deleteAccountError, 'Deletion cancelled. Email mismatch.', true); }
        }
    });
}


function initGalleryPage() {
    console.log("Initializing Gallery Page");
    requireLogin();
    const user = getLoggedInUser();
    if (!user) { handleLogout(); return; }

    const galleryContainer = document.getElementById('gallery-items-container');
    const emptyMessage = document.getElementById('gallery-empty-message');
    if (!galleryContainer || !emptyMessage) { console.error("Gallery elements missing!"); return; }

    function renderGallery() {
        galleryContainer.innerHTML = '';
        const galleryItems = getUserGallery(user.email);
        if (galleryItems.length === 0) { emptyMessage.classList.remove('hidden'); galleryContainer.classList.add('hidden'); return; }

        emptyMessage.classList.add('hidden'); galleryContainer.classList.remove('hidden');
        galleryItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        galleryItems.forEach(item => {
            // Ensure item and essential properties exist
            if (!item || !item.src || !item.id) return;

            const itemDiv = document.createElement('div');
            // Use flex-col for stacking image and info
            itemDiv.className = 'gallery-item group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 flex flex-col';

            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.name || 'Gallery Item';
            // Adjusted image class for better display in gallery
            img.className = `w-full h-40 object-contain p-2 ${(item.itemType === 'outfit' ? 'bg-gray-200' : 'bg-gray-50')}`;
            img.loading = 'lazy';
            img.onerror = () => { img.src = 'https://placehold.co/150x150/cccccc/888888?text=Error'; img.alt = 'Load Error';};

            const infoDiv = document.createElement('div');
            infoDiv.className = 'p-2 flex-grow flex flex-col justify-between'; // Added flex-grow and flex-col

            const nameP = document.createElement('p');
            nameP.textContent = item.name || (item.itemType === 'outfit' ? 'Saved Outfit' : 'Gallery Item');
            nameP.className = 'text-sm font-medium text-center text-gray-800 truncate mb-1'; // Adjusted text size and weight

            // Display recommended size if available
            const sizeP = document.createElement('p');
            sizeP.className = 'text-xs text-center text-gray-600';
            if (item.recommendedSize) {
                sizeP.textContent = `Recommended Size: ${item.recommendedSize}`;
            } else if (item.itemType === 'outfit' && item.modelDetails) {
                 sizeP.textContent = `Saved with ${item.modelDetails.name || item.modelDetails.gender} model`;
            } else {
                 sizeP.textContent = 'Item'; // Default text if no size or outfit info
            }

            infoDiv.appendChild(nameP);
            infoDiv.appendChild(sizeP);


            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center space-x-2 p-2 opacity-0 group-hover:opacity-100';

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; deleteBtn.title = "Delete";
            deleteBtn.className = 'delete-item-btn bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1 px-2 rounded';
            deleteBtn.onclick = (e) => { e.stopPropagation(); if (confirm(`Delete "${nameP.textContent}"?`)) { removeFromUserGallery(user.email, item.id); renderGallery(); } };

            overlayDiv.appendChild(deleteBtn);

            // Append elements to itemDiv
            itemDiv.append(img, infoDiv, overlayDiv);
            galleryContainer.appendChild(itemDiv);
        });
    }
    renderGallery();
}


function initStudioPage() {
    console.log("Initializing Studio Page (v41 - Save Item to Gallery)");
    requireLogin();
    const user = getLoggedInUser();
    if (!user) { handleLogout(); return; }

    // --- Get
    //  Elements with checks ---
    const elements = {
        modelSelectionArea: document.getElementById('model-selection-area'),
        mannequinContainer: document.getElementById('studio-mannequin-container'),
        modelImageFemale: document.getElementById('model-image-female'),
        modelImageMale: document.getElementById('model-image-male'),
        modelImageUploaded: document.getElementById('model-image-uploaded'),
        bgColorPicker: document.getElementById('bg-color-picker'),
        studioErrorMessage: document.getElementById('studio-error-message'),
        studioSuccessMessage: document.getElementById('studio-success-message'),
        clothingItemGrid: document.getElementById('clothing-item-grid'),
        loadingSpinner: document.getElementById('loading-spinner'),
        clothingCategoryFilter: document.getElementById('clothing-category-filter'),
        clothingSearchInput: document.getElementById('clothing-search-input'),
        uploadModelForm: document.getElementById('upload-model-form'),
        modelFileInput: document.getElementById('model-file-input'),
        modelUploadDropArea: document.getElementById('model-upload-drop-area'),
        modelFileNameDisplay: document.getElementById('model-file-name-display'),
        uploadModelMessage: document.getElementById('upload-model-message'),
        uploadedModelSelectorDiv: document.getElementById('uploaded-model-selector'),
        uploadedModelPreviewBtn: document.getElementById('uploaded-model-preview-btn'),
        removeUploadedModelBtn: document.getElementById('remove-uploaded-model-btn'),
        currentModelHeightInput: document.getElementById('current-model-height'),
        currentModelWeightInput: document.getElementById('current-model-weight'),
        sizeRecommendationDisplay: document.getElementById('size-recommendation-display'),
        selectedImageDisplayArea: document.getElementById('selected-clothing-image-area'),
        studioResetButton: document.getElementById('studio-reset-btn'), // Note: This element is fetched again later, ensure ID consistency
        uploadClothesForm: document.getElementById('upload-clothes-form'),
        clothingNameInput: document.getElementById('clothing-name-input'),
        clothingGenderFemaleRadio: document.getElementById('clothing-gender-female'),
        clothingGenderMaleRadio: document.getElementById('clothing-gender-male'),
        clothingCategoryUploadSelect: document.getElementById('clothing-category-upload'),
        clothingFileInput: document.getElementById('clothing-file-input'),
        clothingUploadDropArea: document.getElementById('clothing-upload-drop-area'),
        clothingFileNameDisplay: document.getElementById('clothing-file-name-display'),
        uploadClothesMessage: document.getElementById('upload-clothes-message'),
        clothingPreviewModal: document.getElementById('clothing-preview-modal'),
        modalCloseButton: document.getElementById('modal-close-button'),
        modalClothingImage: document.getElementById('modal-clothing-image'),
        modalClothingName: document.getElementById('modal-clothing-name'),
        modalSizeRecommendation: document.getElementById('modal-size-recommendation'),
        modalTryOnButton: document.getElementById('modal-try-on-button')
    };

    // --- Check for missing essential elements ---
    const missingElements = Object.entries(elements)
        .filter(([key, value]) => value === null)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error("Critical Error: Missing essential studio page elements:", missingElements);
        // Use elements.studioErrorMessage if available, otherwise fallback to document.body
        // This ensures that if studioErrorMessage itself is missing, we still attempt to show an error.
        const errorDisplayContainer = elements.studioErrorMessage || document.body;
        const msg = `Critical error: Missing elements (${missingElements.join(', ')}). Please check studio.html.`;

        if (errorDisplayContainer) {
            if (errorDisplayContainer.tagName !== 'BODY') {
                errorDisplayContainer.textContent = msg;
                if (errorDisplayContainer.classList) errorDisplayContainer.classList.remove('hidden');
                if (errorDisplayContainer.style) errorDisplayContainer.style.color = 'red';
            } else {
                // If errorDisplayContainer is document.body, replace its content.
                errorDisplayContainer.innerHTML = `<p class="text-red-600 text-center mt-10 p-4">${msg}</p>`;
            }
        } else {
            // Absolute fallback if even document.body is somehow not available (highly unlikely)
            alert(`A critical error occurred: ${error && error.message ? error.message : 'Unknown error'}. Please refresh.`);
        }
        // Stop initialization if essential elements are missing
        return;
    }

    // Destructure elements for easier access after validation
    const {
        modelSelectionArea, mannequinContainer, modelImageFemale, modelImageMale,
        modelImageUploaded, bgColorPicker, studioErrorMessage, studioSuccessMessage,
        clothingItemGrid, loadingSpinner, clothingCategoryFilter, clothingSearchInput,
        uploadModelForm, modelFileInput, modelUploadDropArea, modelFileNameDisplay,
        uploadModelMessage, uploadedModelSelectorDiv, uploadedModelPreviewBtn,
        removeUploadedModelBtn, currentModelHeightInput, currentModelWeightInput,
        sizeRecommendationDisplay, selectedImageDisplayArea, /* studioResetButton is handled later */
        uploadClothesForm, clothingNameInput, clothingGenderFemaleRadio,
        clothingGenderMaleRadio, clothingCategoryUploadSelect, clothingFileInput,
        clothingUploadDropArea, clothingFileNameDisplay, uploadClothesMessage,
        clothingPreviewModal, modalCloseButton, modalClothingImage, modalClothingName,
        modalSizeRecommendation, modalTryOnButton
    } = elements;


    let currentModel = null;
    let currentModelHeightCm = DEFAULT_MODEL_HEIGHT_CM;
    let currentModelWeightKg = DEFAULT_MODEL_WEIGHT_KG;
    let currentBackgroundColor = DEFAULT_BACKGROUND_COLOR;
    let currentClothingCategory = DEFAULT_CLOTHING_CATEGORY;
    let activeModelImageElement = null;
    let uploadedModelData = null;
    let isTryOnImageLoaded = false;
    let currentTriedOnItem = null;
    let currentSearchTerm = '';

    function populateClothingCategoryUpload() {
        const selectedGender = document.querySelector('input[name="clothingGender"]:checked')?.value;
        clothingCategoryUploadSelect.innerHTML = ''; // Element is confirmed present

        const categories = {
            female: ['Tops', 'Bottoms', 'One Piece'],
            male: ['Tops', 'Bottoms']
        };

        const options = selectedGender ? categories[selectedGender] : [];

        if (options.length === 0) { // Default or if gender not found
             ['Tops', 'Bottoms'].forEach(cat => {
                const option = document.createElement('option');
                option.value = cat; option.textContent = cat;
                clothingCategoryUploadSelect.appendChild(option);
            });
        } else {
            options.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat; option.textContent = cat;
                clothingCategoryUploadSelect.appendChild(option);
            });
        }
    }
    populateClothingCategoryUpload(); // Initial call
    // Event listeners for clothing gender radio buttons to update category options
    [clothingGenderFemaleRadio, clothingGenderMaleRadio].forEach(radio => { // Elements are confirmed present
        radio.addEventListener('change', populateClothingCategoryUpload);
    });


    function recommendSize(heightCm, weightKg) {
        if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return "Enter valid height/weight";
        for (const sz of sizeChart) if (weightKg >= sz.minWeightKg && weightKg < sz.maxWeightKg && heightCm >= sz.minHeightCm && heightCm <= sz.maxHeightCm) return sz.size;
        if (weightKg < sizeChart[0].minWeightKg) return sizeChart[0].size; if (weightKg >= sizeChart[sizeChart.length-1].maxWeightKg) return sizeChart[sizeChart.length-1].maxHeightCm; // Corrected maxWeightKg check
        let closestSize = null, minDiff = Infinity;
        for (const sz of sizeChart) { const diff = Math.abs(weightKg - ((sz.minWeightKg + sz.maxWeightKg) / 2)); if (diff < minDiff) { minDiff = diff; closestSize = sz.size; } }
        return closestSize || "Consult chart";
    }


    function updateSizeRecommendationDisplay(message = null) {
        // sizeRecommendationDisplay is confirmed present from 'elements'
        if (message) { sizeRecommendationDisplay.textContent = `Recommended: ${message}`; sizeRecommendationDisplay.classList.add('visible'); }
        else { sizeRecommendationDisplay.textContent = ''; sizeRecommendationDisplay.classList.remove('visible'); }
    }

    function updateSelectedClothingImageDisplay(selectedItem = null, model = null) {
        // selectedImageDisplayArea is confirmed present
        selectedImageDisplayArea.innerHTML = ''; let imagesToShow = []; let previewTitle = '';
        if (selectedItem && selectedItem.category && model) { // Added model check
            const category = selectedItem.category; let tryOnKey = model.type === 'uploaded' ? `uploaded_${model.gender}` : model.gender;
            previewTitle = `${category} Previews (${model.gender === 'female' ? 'Female' : 'Male'} Model):`;
            if (category === 'One Piece') { previewTitle = 'One Piece Previews (Female Model):'; tryOnKey = (model.type === 'uploaded' && model.gender === 'female') ? 'uploaded_female' : 'female'; }

            const allItems = [...predefinedClothingItems, ...userUploadedClothingItems];
            allItems.forEach(item => {
                if (item.category === category && item.tryOnImage) {
                    let imageUrl = item.tryOnImage[tryOnKey];
                    if (category === 'One Piece' && (!imageUrl || (typeof imageUrl === 'string' && imageUrl.includes("*** REPLACE")))) {
                        if (model.type === 'uploaded' && model.gender === 'female' && item.tryOnImage?.female && typeof item.tryOnImage.female === 'string' && !item.tryOnImage.female.includes("*** REPLACE")) imageUrl = item.tryOnImage.female;
                        else if (model.type === 'default' && model.gender === 'female' && item.tryOnImage?.uploaded_female && typeof item.tryOnImage.uploaded_female === 'string' && !item.tryOnImage.uploaded_female.includes("*** REPLACE")) imageUrl = item.tryOnImage.uploaded_female;
                    }
                    if (imageUrl && typeof imageUrl === 'string' && !imageUrl.includes("*** REPLACE")) imagesToShow.push({ src: imageUrl, name: item.name });
                }
            });
        }
        if (imagesToShow.length > 0) {
            const titleLabel = document.createElement('p'); titleLabel.textContent = previewTitle; titleLabel.className = 'text-xs font-medium text-gray-600 w-full mb-2 text-center'; selectedImageDisplayArea.appendChild(titleLabel);
            imagesToShow.forEach(imgData => {
                const imgEl = document.createElement('img'); imgEl.src = imgData.src; imgEl.alt = `${imgData.name} Preview`; imgEl.title = imgData.name;
                imgEl.className = 'h-[100px] w-[90px] object-contain border border-gray-300 rounded p-1 bg-white';
                imgEl.onerror = () => { imgEl.src = `https://placehold.co/90x100/cccccc/888888?text=Error`; imgEl.alt = 'Load error'; };
                selectedImageDisplayArea.appendChild(imgEl);
            });
            selectedImageDisplayArea.classList.remove('hidden');
        } else { selectedImageDisplayArea.classList.add('hidden'); }
    }
    function calculateModelScaleFactors() {
        // currentModelHeightInput and currentModelWeightInput are confirmed present
        const height = parseInt(currentModelHeightInput.value, 10) || DEFAULT_MODEL_HEIGHT_CM; const weight = parseInt(currentModelWeightInput.value, 10) || DEFAULT_MODEL_WEIGHT_KG;
        const baseH = currentModel?.defaultHeightCm || DEFAULT_MODEL_HEIGHT_CM; const baseW = currentModel?.defaultWeightKg || DEFAULT_MODEL_WEIGHT_KG;
        const safeH = baseH > 0 ? baseH : DEFAULT_MODEL_HEIGHT_CM; const safeW = baseW > 0 ? baseW : DEFAULT_MODEL_WEIGHT_KG;
        return { scaleX: Math.max(0.5, Math.min(2.0, weight / safeW)), scaleY: Math.max(0.5, Math.min(2.0, height / safeH)) };
    }
    function applyModelScale() {  if (activeModelImageElement) { const { scaleX, scaleY } = calculateModelScaleFactors(); activeModelImageElement.style.transformOrigin = 'center bottom'; activeModelImageElement.style.transform = `scale(${scaleX}, ${scaleY})`; } }

    function updateCategoryFilterOptions(modelGender) {
        // clothingCategoryFilter is confirmed present
        const onePieceOpt = clothingCategoryFilter.querySelector('option[value="One Piece"]');
        if (onePieceOpt) { if (modelGender === 'male') { onePieceOpt.style.display = 'none'; if (clothingCategoryFilter.value === 'One Piece') { clothingCategoryFilter.value = 'All'; currentClothingCategory = 'All'; renderClothingItems(); } } else { onePieceOpt.style.display = ''; } }
        currentClothingCategory = clothingCategoryFilter.value;
    }

    function selectModel(modelData) {
        currentModel = modelData ? { ...modelData } : { ...predefinedModels.female }; // predefinedModels.female is defined
        isTryOnImageLoaded = false; currentTriedOnItem = null;
        updateSizeRecommendationDisplay(null);
        updateSelectedClothingImageDisplay(null, currentModel);

        // modelImageUploaded, modelImageFemale, modelImageMale are confirmed present
        activeModelImageElement = (currentModel.type === 'uploaded') ? modelImageUploaded : (currentModel.gender === 'female' ? modelImageFemale : modelImageMale);
        activeModelImageElement.src = currentModel.src;
        if (currentModel.type === 'uploaded') { activeModelImageElement.dataset.gender = currentModel.gender; }
        currentModel.defaultHeightCm = currentModel.defaultHeightCm || (predefinedModels[currentModel.gender]?.defaultHeightCm || DEFAULT_MODEL_HEIGHT_CM);
        currentModel.defaultWeightKg = currentModel.defaultWeightKg || (predefinedModels[currentModel.gender]?.defaultWeightKg || DEFAULT_MODEL_WEIGHT_KG);

        [modelImageFemale, modelImageMale, modelImageUploaded].forEach(img => { img.classList.add('hidden'); img.style.transform = 'scale(1)'; img.style.opacity = 1; });
        activeModelImageElement.classList.remove('hidden');

        currentModelHeightCm = currentModel.defaultHeightCm; currentModelWeightKg = currentModel.defaultWeightKg;
        currentModelHeightInput.value = currentModelHeightCm; // Confirmed present
        currentModelWeightInput.value = currentModelWeightKg; // Confirmed present
        applyModelScale();

        document.querySelectorAll('.model-select-btn, .uploaded-model-preview').forEach(btn => {
            btn.classList.remove('selected', 'border-primary', 'border-secondary', 'border-violet-700', 'ring-2', 'ring-offset-1', 'ring-secondary', 'ring-violet-300');
            if (currentModel && btn.dataset.modelType === currentModel.type && (btn.dataset.modelType === 'uploaded' || btn.dataset.gender === currentModel.gender)) {
                btn.classList.add('selected', btn.dataset.modelType === 'uploaded' ? 'border-violet-700 ring-violet-300' : 'border-primary-ring-secondary', 'ring-2', 'ring-offset-1');
            }
        });
        updateCategoryFilterOptions(currentModel.gender);
        saveCurrentStudioState(); renderClothingItems();
    }

    function handleModelUpload(event) {
        event.preventDefault();
        // uploadModelMessage, modelFileInput, uploadModelForm are confirmed present
        showMessage(uploadModelMessage, "Processing...", false, 0);
        const file = modelFileInput.files?.[0];
        const gender = uploadModelForm.elements.uploadModelGender.value;

        clearValidationState(modelFileInput.closest('.file-upload-area'));
        if (!file || !file.type.startsWith('image/')) { showMessage(uploadModelMessage, "Valid image required.", true); setErrorFor(modelFileInput.closest('.file-upload-area'), " "); return; }
        if (!gender) { showMessage(uploadModelMessage, "Select gender.", true); return; }
        const maxSizeMB = 5; if (file.size > maxSizeMB * 1024 * 1024) { showMessage(uploadModelMessage, `File > ${maxSizeMB}MB.`, true); setErrorFor(modelFileInput.closest('.file-upload-area'), " "); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                uploadedModelData = { gender, src: e.target.result, defaultHeightCm: DEFAULT_MODEL_HEIGHT_CM, defaultWeightKg: DEFAULT_MODEL_WEIGHT_KG };
                saveUploadedModelData(user.email, uploadedModelData);
                updateUploadedModelPreview();
                showMessage(uploadModelMessage, "Model uploaded!", false, 3000);
                selectModel({ type: 'uploaded', ...uploadedModelData, name: 'Uploaded Model' });
                clearFormStates([uploadModelForm]);
            } else { showMessage(uploadModelMessage, "Error processing file.", true); }
        }
        reader.onerror = () => { showMessage(uploadModelMessage, "Error reading file.", true); }
        reader.readAsDataURL(file);
    }

    function updateUploadedModelPreview() {
        // uploadedModelPreviewBtn, uploadedModelSelectorDiv, removeUploadedModelBtn are confirmed present
        if (uploadedModelData?.src) {
            uploadedModelPreviewBtn.src = uploadedModelData.src; uploadedModelPreviewBtn.dataset.gender = uploadedModelData.gender;
            uploadedModelSelectorDiv.classList.remove('hidden'); removeUploadedModelBtn.classList.remove('hidden');
        } else {
            uploadedModelSelectorDiv.classList.add('hidden'); removeUploadedModelBtn.classList.add('hidden');
        }
    }
    function handleRemoveUploadedModel() {
        if (confirm("Remove uploaded model?")) {
            deleteUploadedModelData(user.email); uploadedModelData = null; updateUploadedModelPreview();
            if (currentModel && currentModel.type === 'uploaded') { selectModel(predefinedModels.female); }
            showMessage(uploadModelMessage, "Uploaded model removed.", false, 3000); // uploadModelMessage confirmed present
            updateSizeRecommendationDisplay(null); updateSelectedClothingImageDisplay(null, currentModel);
        }
    }

    function handleClothingUpload(event) {
        event.preventDefault();
        // uploadClothesMessage, clothingNameInput, uploadClothesForm, clothingCategoryUploadSelect, clothingFileInput confirmed present
        showMessage(uploadClothesMessage, "Processing...", false, 0);

        const name = clothingNameInput.value.trim();
        const gender = uploadClothesForm.elements.clothingGender.value;
        const category = clothingCategoryUploadSelect.value;
        const file = clothingFileInput.files?.[0];

        let isValid = true;
        clearValidationState(clothingNameInput);
        clearValidationState(clothingCategoryUploadSelect);
        clearValidationState(clothingFileInput.closest('.file-upload-area'));


        if (!name) {
            setErrorFor(clothingNameInput, "Clothing name is required.");
            isValid = false;
        }
        if (!category) {
            setErrorFor(clothingCategoryUploadSelect, "Category is required.");
            isValid = false;
        }
        if (!file || !file.type.startsWith('image/')) {
            setErrorFor(clothingFileInput.closest('.file-upload-area'), "A valid image file is required.");
            isValid = false;
        } else {
            const maxSizeMB = 2;
            if (file.size > maxSizeMB * 1024 * 1024) {
                setErrorFor(clothingFileInput.closest('.file-upload-area'), `File size exceeds ${maxSizeMB}MB.`);
                isValid = false;
            }
        }

        if (!isValid) {
            showMessage(uploadClothesMessage, "Please fix the errors above.", true, 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result;
            if (typeof dataUrl === 'string') {
                const newItemId = `user_cloth_${Date.now()}`;
                let itemType = 'other';
                if (category === 'Tops') itemType = 'top';
                else if (category === 'Bottoms') itemType = 'bottom';

                const newClothingItem = {
                    id: newItemId,
                    name: name,
                    src: dataUrl,
                    category: category,
                    gender: gender,
                    type: itemType,
                    userUploaded: true,
                    tryOnImage: {
                        female: null, male: null,
                        uploaded_female: null, uploaded_male: null
                    }
                };

                if (gender === 'female' || gender === 'unisex') { // Simplified logic for unisex
                    newClothingItem.tryOnImage.female = dataUrl;
                    newClothingItem.tryOnImage.uploaded_female = dataUrl;
                }
                if (gender === 'male' || gender === 'unisex') { // Simplified logic for unisex
                    newClothingItem.tryOnImage.male = dataUrl;
                    newClothingItem.tryOnImage.uploaded_male = dataUrl;
                }


                if (addUserUploadedClothingItem(user.email, newClothingItem)) {
                    userUploadedClothingItems.push(newClothingItem);
                    showMessage(uploadClothesMessage, `"${name}" added to your clothes!`, false, 3000);
                    clearFormStates([uploadClothesForm]);
                    populateClothingCategoryUpload();
                    renderClothingItems();
                } else {
                     showMessage(uploadClothesMessage, "Failed to save clothing item. Invalid data.", true, 3000);
                }

            } else {
                showMessage(uploadClothesMessage, "Error processing clothing image.", true, 3000);
            }
        };
        reader.onerror = () => {
            showMessage(uploadClothesMessage, "Error reading clothing image file.", true, 3000);
        };
        reader.readAsDataURL(file);
    }

    // --- Modal Functions ---
    function showClothingPreviewModal(item) {
        // clothingPreviewModal, modalClothingImage, modalSizeRecommendation, modalClothingName are confirmed present
        if (!item || !currentModel) return;

        let tryOnKey = (currentModel.type === 'uploaded') ? `uploaded_${currentModel.gender}` : currentModel.gender;
        let specificImageUrl = item.tryOnImage ? item.tryOnImage[tryOnKey] : null;

        if (item.category === 'One Piece' && currentModel.gender === 'female' && !specificImageUrl) {
            if (currentModel.type === 'uploaded' && item.tryOnImage?.female) specificImageUrl = item.tryOnImage.female;
            else if (currentModel.type === 'default' && item.tryOnImage?.uploaded_female) specificImageUrl = item.tryOnImage.uploaded_female;
            else if (item.userUploaded && item.gender === 'female') specificImageUrl = item.src;
        }

        if (item.userUploaded && !specificImageUrl && (item.gender === currentModel.gender || item.gender === 'unisex')) {
            specificImageUrl = item.src;
        }


        if (specificImageUrl && typeof specificImageUrl === 'string' && !specificImageUrl.includes("*** REPLACE")) {
            modalClothingImage.src = specificImageUrl;
            modalClothingImage.alt = `${item.name} on ${currentModel.name || currentModel.gender} model`;
        } else {
            modalClothingImage.src = item.src;
            modalClothingImage.alt = `${item.name} (clothing item preview)`;
            console.warn(`No specific "model wearing clothes" image for ${item.name} on ${currentModel.type} ${currentModel.gender}. Showing item thumbnail in modal.`);
        }

        modalClothingName.textContent = item.name;
        const recommended = recommendSize(currentModelHeightCm, currentModelWeightKg);
        modalSizeRecommendation.textContent = `Recommended Size: ${recommended || 'N/A'}`;

        currentItemForModalTryOn = item;
        clothingPreviewModal.style.display = 'flex';
    }

    function closeClothingPreviewModal() {
        // clothingPreviewModal confirmed present
        clothingPreviewModal.style.display = 'none';
        currentItemForModalTryOn = null;
    }

    // modalCloseButton confirmed present
    modalCloseButton.addEventListener('click', closeClothingPreviewModal);

    window.addEventListener('click', (event) => {
        if (event.target === clothingPreviewModal) { // clothingPreviewModal confirmed present
            closeClothingPreviewModal();
        }
    });
    // modalTryOnButton confirmed present
    modalTryOnButton.addEventListener('click', () => {
        if (currentItemForModalTryOn) {
            handleTryOnSelection(currentItemForModalTryOn);
        }
        closeClothingPreviewModal();
    });
    // --- End Modal Functions ---


    function renderClothingItems() {
        // clothingItemGrid, clothingCategoryFilter confirmed present
        if (!currentModel) return;
        clothingItemGrid.innerHTML = '';
        const selectedCategory = clothingCategoryFilter.value;
        const searchTerm = currentSearchTerm.toLowerCase();

        const allClothingItems = [...predefinedClothingItems, ...userUploadedClothingItems];

        const itemsToDisplay = allClothingItems.filter(item => {
             const genderMatch = (item.gender === 'unisex' || item.gender === currentModel.gender || (item.category === 'One Piece' && currentModel.gender === 'female'));
             const categoryMatch = (selectedCategory === 'All' || item.category === selectedCategory);
             const searchMatch = (!searchTerm || item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm));
             return genderMatch && categoryMatch && searchMatch;
        });

        if (itemsToDisplay.length === 0) {
            clothingItemGrid.innerHTML = `<p class="text-gray-500 text-sm col-span-full text-center p-4">No items match filters.</p>`;
            return;
        }

        itemsToDisplay.forEach(item => {
            const itemDiv = document.createElement('div');
            let hasPreviewForCurrentModel = false;
            let tryOnKey = null;

            if (item.tryOnImage) {
                tryOnKey = (currentModel.type === 'uploaded') ? `uploaded_${currentModel.gender}` : currentModel.gender;
                hasPreviewForCurrentModel = item.tryOnImage[tryOnKey] &&
                                          typeof item.tryOnImage[tryOnKey] === 'string' &&
                                          !item.tryOnImage[tryOnKey].includes("*** REPLACE") &&
                                          !(item.category === 'One Piece' && currentModel.gender === 'male');
            }
            if (item.userUploaded && !hasPreviewForCurrentModel && (item.gender === currentModel.gender || item.gender === 'unisex')) {
                hasPreviewForCurrentModel = true;
            }


            itemDiv.className = `clothing-item ${hasPreviewForCurrentModel ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`;
            itemDiv.dataset.itemId = item.id;
            // Updated title to indicate saving on click
            itemDiv.title = hasPreviewForCurrentModel ? `Click to preview and save "${item.name}" to gallery` : `${item.name} (Preview unavailable for this model/gender combination)`;


            const img = document.createElement('img');
            img.src = item.src; img.alt = item.name; img.loading = 'lazy';
            img.onerror = () => { img.src = `https://placehold.co/80x80/cccccc/888888?text=Error`; img.alt = 'Load error'; };

            const nameP = document.createElement('p');
            nameP.textContent = item.name; nameP.title = item.name;

            itemDiv.appendChild(img); itemDiv.appendChild(nameP);

            itemDiv.addEventListener('click', () => {
                 if (hasPreviewForCurrentModel) {
                     // Calculate recommended size for the current model BEFORE showing the modal
                     const recommended = recommendSize(currentModelHeightCm, currentModelWeightKg);

                     // Save the item to the gallery with the recommended size
                     const galleryItemData = {
                        id: item.id, // Use the original item ID
                        name: item.name,
                        src: item.src, // Save the thumbnail image
                        category: item.category,
                        gender: item.gender,
                        type: item.type,
                        userUploaded: item.userUploaded || false, // Ensure userUploaded status is saved
                        recommendedSize: recommended, // Add the recommended size
                        // Optionally save model details used for recommendation
                        recommendedForModel: {
                            type: currentModel.type,
                            gender: currentModel.gender,
                            heightCm: currentModelHeightCm,
                            weightKg: currentModelWeightKg
                        }
                     };
                     addToUserGallery(user.email, galleryItemData);
                     // studioSuccessMessage confirmed present
                     showMessage(studioSuccessMessage, `"${item.name}" saved to gallery! Recommended size: ${recommended}`, false, 3000);

                     // Then show the preview modal
                     showClothingPreviewModal(item);

                 } else {
                     updateSelectedClothingImageDisplay(item, currentModel);
                     updateSizeRecommendationDisplay(null);
                     // studioErrorMessage confirmed present
                     showMessage(studioErrorMessage, `Preview for "${item.name}" not available for this model/gender. Cannot save to gallery.`, true, 4000); // Updated message
                 }
            });
            clothingItemGrid.appendChild(itemDiv);
        });
    }

    function handleTryOnSelection(item) {
        if (!item || !currentModel || !activeModelImageElement) return;

        let specificImageUrl = null;
        let imageKey = (currentModel.type === 'uploaded') ? `uploaded_${currentModel.gender}` : currentModel.gender;

        if (item.tryOnImage && item.tryOnImage[imageKey]) {
            specificImageUrl = item.tryOnImage[imageKey];
        }

        if (item.userUploaded && !specificImageUrl && (item.gender === currentModel.gender || item.gender === 'unisex')) {
            specificImageUrl = item.src;
        }


        if (specificImageUrl && typeof specificImageUrl === 'string' && !specificImageUrl.includes("*** REPLACE")) {
            if (loadingSpinner) loadingSpinner.classList.remove('hidden'); // loadingSpinner confirmed present
            activeModelImageElement.style.opacity = 0;

            const tempImg = new Image();
            tempImg.onload = () => {
                activeModelImageElement.src = specificImageUrl;
                isTryOnImageLoaded = true; currentTriedOnItem = item;
                applyModelScale(); activeModelImageElement.style.opacity = 1;
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                // studioSuccessMessage confirmed present
                showMessage(studioSuccessMessage, `${item.name} applied!`, false, 2000);
                updateSelectedClothingImageDisplay(item, currentModel);
            };
            tempImg.onerror = () => {
                // studioErrorMessage confirmed present
                showMessage(studioErrorMessage, `Failed to load try-on image for ${item.name}. Reverting to base model.`, true, 5000);
                activeModelImageElement.src = currentModel.src;
                isTryOnImageLoaded = false; currentTriedOnItem = null;
                applyModelScale();
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                updateSelectedClothingImageDisplay(null, currentModel);
            };
            tempImg.src = specificImageUrl;
        } else {
            // studioErrorMessage confirmed present
            showMessage(studioErrorMessage, `Try-on image for "${item.name}" is not configured correctly for the current ${currentModel.type} ${currentModel.gender} model.`, true, 4000);
            if (activeModelImageElement.src !== currentModel.src) {
                activeModelImageElement.src = currentModel.src;
                isTryOnImageLoaded = false; currentTriedOnItem = null;
                applyModelScale();
            }
            updateSelectedClothingImageDisplay(item, currentModel);
        }
    }

    // modelSelectionArea confirmed present
    modelSelectionArea.addEventListener('click', (e) => {
        const btn = e.target.closest('.model-select-btn, .uploaded-model-preview'); if (!btn) return;
        const modelType = btn.dataset.modelType;
        if (modelType === 'default') { selectModel(predefinedModels[btn.dataset.gender]); }
        else if (modelType === 'uploaded' && uploadedModelData) { selectModel({ type: 'uploaded', ...uploadedModelData, name: 'Uploaded Model' }); }
    });

    function handleSizeInputChange() {
        applyModelScale();
        // sizeRecommendationDisplay confirmed present
        // Update recommendation display based on current model size inputs
        const recommended = recommendSize(parseInt(currentModelHeightInput.value, 10), parseInt(currentModelWeightInput.value, 10));
        updateSizeRecommendationDisplay(recommended);

        // Note: The recommended size saved to the gallery happens when the clothing item is clicked,
        // based on the size inputs *at that moment*. This input handler only updates the display.
    }

    // currentModelHeightInput, currentModelWeightInput confirmed present
    currentModelHeightInput.addEventListener('input', (e) => { currentModelHeightCm = parseInt(e.target.value, 10) || DEFAULT_MODEL_HEIGHT_CM; handleSizeInputChange(); });
    currentModelHeightInput.addEventListener('change', saveCurrentStudioState);
    currentModelWeightInput.addEventListener('input', (e) => { currentModelWeightKg = parseInt(e.target.value, 10) || DEFAULT_MODEL_WEIGHT_KG; handleSizeInputChange(); });
    currentModelWeightInput.addEventListener('change', saveCurrentStudioState);

    // uploadModelForm, removeUploadedModelBtn, uploadClothesForm confirmed present
    uploadModelForm.addEventListener('submit', handleModelUpload);
    removeUploadedModelBtn.addEventListener('click', handleRemoveUploadedModel);
    uploadClothesForm.addEventListener('submit', handleClothingUpload);

    // bgColorPicker, mannequinContainer confirmed present
    bgColorPicker.addEventListener('input', (e) => { currentBackgroundColor = e.target.value; mannequinContainer.style.backgroundColor = currentBackgroundColor; });
    bgColorPicker.addEventListener('change', saveCurrentStudioState);

    // clothingCategoryFilter, clothingSearchInput confirmed present
    clothingCategoryFilter.addEventListener('change', (e) => {
        currentClothingCategory = e.target.value;
        // When category changes, clear try-on image and selected image area
        if (activeModelImageElement && currentModel && activeModelImageElement.src !== currentModel.src) {
             activeModelImageElement.src = currentModel.src;
             isTryOnImageLoaded = false; currentTriedOnItem = null;
             applyModelScale();
        }
        updateSizeRecommendationDisplay(null); // Clear size recommendation display
        updateSelectedClothingImageDisplay(null, currentModel); // Clear selected image area
        renderClothingItems(); saveCurrentStudioState();
    });
    clothingSearchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderClothingItems();
    });


    function loadInitialStudioState() {
        console.log("Loading initial studio state (v41)...");
        uploadedModelData = getUploadedModelData(user.email);
        userUploadedClothingItems = getUserUploadedClothing(user.email);
        updateUploadedModelPreview(); // Uses elements confirmed present

        const lastState = getLastStudioState();
        let modelToSelect = null;

        try {
            if (lastState) {
                 currentBackgroundColor = lastState.backgroundColor || DEFAULT_BACKGROUND_COLOR;
                 currentClothingCategory = lastState.category || DEFAULT_CLOTHING_CATEGORY;
                 mannequinContainer.style.backgroundColor = currentBackgroundColor; // Confirmed present
                 bgColorPicker.value = currentBackgroundColor; // Confirmed present

                 currentModelHeightCm = parseInt(lastState.heightCm, 10) || DEFAULT_MODEL_HEIGHT_CM;
                 currentModelWeightKg = parseInt(lastState.weightKg, 10) || DEFAULT_MODEL_WEIGHT_KG;
                 currentModelHeightInput.value = currentModelHeightCm; // Confirmed present
                 currentModelWeightInput.value = currentModelWeightKg; // Confirmed present

                 if (lastState.type === 'uploaded' && uploadedModelData) {
                     modelToSelect = {
                         type: 'uploaded',
                         ...uploadedModelData,
                         name: 'Uploaded Model',
                         defaultHeightCm: parseInt(lastState.defaultHeightCm, 10) || uploadedModelData.defaultHeightCm || DEFAULT_MODEL_HEIGHT_CM,
                         defaultWeightKg: parseInt(lastState.defaultWeightKg, 10) || uploadedModelData.defaultWeightKg || DEFAULT_MODEL_WEIGHT_KG
                     };
                 } else if (lastState.type === 'default' && lastState.gender && predefinedModels[lastState.gender]) {
                     modelToSelect = {
                         ...predefinedModels[lastState.gender],
                         defaultHeightCm: parseInt(lastState.defaultHeightCm, 10) || predefinedModels[lastState.gender].defaultHeightCm || DEFAULT_MODEL_HEIGHT_CM,
                         defaultWeightKg: parseInt(lastState.defaultWeightKg, 10) || predefinedModels[lastState.gender].defaultWeightKg || DEFAULT_MODEL_WEIGHT_KG
                     };
                 }
            } else {
                 mannequinContainer.style.backgroundColor = DEFAULT_BACKGROUND_COLOR;
                 bgColorPicker.value = DEFAULT_BACKGROUND_COLOR;
                 currentModelHeightInput.value = DEFAULT_MODEL_HEIGHT_CM;
                 currentModelWeightInput.value = DEFAULT_MODEL_WEIGHT_KG;
                 currentClothingCategory = DEFAULT_CLOTHING_CATEGORY;
            }
        } catch (error) {
             console.error("Error loading studio state from localStorage:", error);
             // studioErrorMessage confirmed present
             showMessage(studioErrorMessage, "Error loading saved studio state. Using defaults. Try clearing browser storage if issues persists.", true, 5000);
             localStorage.removeItem(LAST_STUDIO_STATE_KEY);
             uploadedModelData = getUploadedModelData(user.email);
             userUploadedClothingItems = getUserUploadedClothing(user.email);
             updateUploadedModelPreview();
             currentBackgroundColor = DEFAULT_BACKGROUND_COLOR;
             currentClothingCategory = DEFAULT_CLOTHING_CATEGORY;
             currentModelHeightCm = DEFAULT_MODEL_HEIGHT_CM;
             currentModelWeightKg = DEFAULT_MODEL_WEIGHT_KG;
             mannequinContainer.style.backgroundColor = currentBackgroundColor;
             bgColorPicker.value = currentBackgroundColor;
             currentModelHeightInput.value = currentModelHeightCm;
             currentModelWeightInput.value = currentModelWeightKg;
             currentSearchTerm = '';
             clothingSearchInput.value = ''; // Confirmed present
             modelToSelect = uploadedModelData ? { type: 'uploaded', ...uploadedModelData, name: 'Uploaded Model' } : predefinedModels.female;
        }


        if (!modelToSelect) {
            modelToSelect = uploadedModelData ? { type: 'uploaded', ...uploadedModelData, name: 'Uploaded Model' } : predefinedModels.female;
        }
        selectModel(modelToSelect);

        // clothingCategoryFilter confirmed present
        const optionExists = Array.from(clothingCategoryFilter.options).some(opt => opt.value === currentClothingCategory && opt.style.display !== 'none');
        if (optionExists) { clothingCategoryFilter.value = currentClothingCategory; }
        else { clothingCategoryFilter.value = 'All'; currentClothingCategory = 'All'; }

        // Initial size recommendation display update based on loaded state
        const initialRecommended = recommendSize(currentModelHeightCm, currentModelWeightKg);
        updateSizeRecommendationDisplay(initialRecommended);


        if (loadingSpinner) loadingSpinner.classList.add('hidden'); // loadingSpinner confirmed present
    }

    function saveCurrentStudioState() {
        // currentModel is set by selectModel, other elements confirmed present
        if (!currentModel || !clothingCategoryFilter || !currentModelHeightInput || !currentModelWeightInput) return;
        const state = {
            type: currentModel.type, gender: currentModel.gender,
            heightCm: parseInt(currentModelHeightInput.value, 10) || DEFAULT_MODEL_HEIGHT_CM,
            weightKg: parseInt(currentModelWeightInput.value, 10) || DEFAULT_MODEL_WEIGHT_KG,
            defaultHeightCm: currentModel.defaultHeightCm || DEFAULT_MODEL_HEIGHT_CM,
            defaultWeightKg: currentModel.defaultWeightKg || DEFAULT_MODEL_WEIGHT_KG,
            backgroundColor: currentBackgroundColor,
            category: clothingCategoryFilter.value || DEFAULT_CLOTHING_CATEGORY
        };
        saveLastStudioState(state);
    }

    loadInitialStudioState();

    // Note: saveToGalleryBtn and studioResetButton are fetched here, not part of the initial 'elements' object check.
    // Their IDs are assumed to be correct as per studio.html.
    const saveToGalleryBtn = document.getElementById('save-to-gallery-btn');
    if (saveToGalleryBtn) {
        saveToGalleryBtn.addEventListener('click', () => {
            if (currentTriedOnItem && activeModelImageElement && isTryOnImageLoaded) {
                 const outfitItem = {
                    id: `outfit_${Date.now()}`,
                    name: `Outfit: ${currentTriedOnItem.name} on ${currentModel.name || currentModel.gender}`,
                    src: activeModelImageElement.src,
                    itemType: 'outfit', // Mark as outfit
                    modelDetails: { type: currentModel.type, gender: currentModel.gender, name: currentModel.name, heightCm: currentModelHeightCm, weightKg: currentModelWeightKg }, // Save model details
                    clothingItemId: currentTriedOnItem.id // Reference the clothing item
                };
                addToUserGallery(user.email, outfitItem); // Use the updated addToUserGallery
                // studioSuccessMessage confirmed present
                showMessage(studioSuccessMessage, "Outfit saved to gallery!", false, 3000);
            } else {
                // studioErrorMessage confirmed present
                showMessage(studioErrorMessage, "Try on an item first to save an outfit.", true, 3000);
            }
        });
    } else {
        console.warn("Save to Gallery button (save-to-gallery-btn) not found.");
    }

    const studioResetButtonElement = document.getElementById('studio-reset-btn'); // Renamed to avoid conflict with elements.studioResetButton if it were there
    if (studioResetButtonElement) {
        studioResetButtonElement.addEventListener('click', () => {
            if (confirm("Reset studio to default settings? This will not delete your uploaded models or clothes.")) {
                localStorage.removeItem(LAST_STUDIO_STATE_KEY);
                currentBackgroundColor = DEFAULT_BACKGROUND_COLOR;
                currentClothingCategory = DEFAULT_CLOTHING_CATEGORY;
                currentSearchTerm = '';
                if(clothingSearchInput) clothingSearchInput.value = ''; // Confirmed present

                // Reset model image to default and clear try-on state
                if (activeModelImageElement && currentModel && activeModelImageElement.src !== currentModel.src) {
                    activeModelImageElement.src = currentModel.src;
                    isTryOnImageLoaded = false;
                    currentTriedOnItem = null;
                    applyModelScale(); // Apply default scale
                }

                // Reset size inputs and recommendation display
                currentModelHeightCm = DEFAULT_MODEL_HEIGHT_CM;
                currentModelWeightKg = DEFAULT_MODEL_WEIGHT_KG;
                if(currentModelHeightInput) currentModelHeightInput.value = currentModelHeightCm;
                if(currentModelWeightInput) currentModelWeightInput.value = currentModelWeightKg;
                const defaultRecommended = recommendSize(currentModelHeightCm, currentModelWeightKg);
                updateSizeRecommendationDisplay(defaultRecommended);


                updateSelectedClothingImageDisplay(null, currentModel); // Clear selected image area

                loadInitialStudioState(); // This will re-select the default/uploaded model and render items

                // studioSuccessMessage confirmed present
                showMessage(studioSuccessMessage, "Studio reset to defaults.", false, 3000);
            }
        });
    } else {
         console.warn("Studio Reset button (studio-reset-btn) not found.");
    }
}


// --- Global Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.password-toggle-icon').forEach(icon => {
        icon.addEventListener('click', togglePasswordVisibility);
        const targetInputId = icon.getAttribute('data-target');
        const targetInput = document.getElementById(targetInputId);
        if (targetInput) {
            const isPassword = targetInput.type === 'password';
            icon.querySelector('i').classList.toggle('ri-eye-line', isPassword);
            icon.querySelector('i').classList.toggle('ri-eye-off-line', !isPassword);
        }
    });

    const logoutButton = document.getElementById('nav-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => { e.preventDefault(); if (confirm("Logout?")) { handleLogout(); } });
    }
});


// --- Page Initialization Router ---
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;
    console.log(`--- Initializing page: ${pageId} ---`);
    try {
        switch (pageId) {
            case 'login-page': initLoginPage(); handleRegistration(); break;
            case 'forgot-password-page': initForgotPasswordPage(); break;
            case 'account-page': initAccountPage(); break;
            case 'studio-page': initStudioPage(); break;
            case 'gallery-page': initGalleryPage(); break;
            default:
                const header = document.getElementById('main-header');
                if(header && pageId !== 'login-page' && pageId !== 'forgot-password-page') { requireLogin(); }
                break;
        }
    } catch (error) {
        console.error(`Critical error during page initialization for ${pageId}:`, error);
        // Ensure the full error object is logged for better debugging from the console
        console.error("Full error object for critical failure:", error);

        const errorDisplayElement = document.getElementById('studio-error-message') || document.getElementById('login-message') || document.body;

        if (errorDisplayElement) {
            let displayMessage = "A critical error occurred. Please refresh.";
            if (error && error.message) { // Try to get a more specific message from the error object
                displayMessage = `Error: ${error.message}. Please refresh. (Check console for more details)`;
            }

            if (errorDisplayElement.tagName !== 'BODY') {
                errorDisplayElement.textContent = displayMessage;
                // Ensure classList and style properties exist before trying to use them
                if (errorDisplayElement.classList) {
                    errorDisplayElement.classList.remove('hidden');
                }
                if (errorDisplayElement.style) {
                     errorDisplayElement.style.color = 'red';
                }
            } else { // Fallback to replacing body content if no specific error div is found or targeted
                document.body.innerHTML = `<p class="text-red-600 text-center mt-10 p-4">${displayMessage}</p>`;
            }
        } else {
            // Absolute fallback if no error display element can be found at all (e.g., document.body is null)
            alert(`A critical error occurred: ${error && error.message ? error.message : 'Unknown error'}. Please refresh.`);
        }
     }
    console.log(`--- Page init complete: ${pageId} ---`);
});
