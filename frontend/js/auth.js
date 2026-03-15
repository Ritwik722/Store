// Authentication Logic
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function switchToLogin() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm) loginForm.style.display = 'block';
  if (registerForm) registerForm.style.display = 'none';
}

function switchToRegister() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'block';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      currentUser = data.user;
      updateAuthUI();
      document.getElementById('authModal').style.display = 'none';
      showNotification('Login successful!', 'success');
      
      // Redirect to checkout if coming from there
      if (window.location.pathname.includes('checkout')) {
        window.location.reload();
      }
    } else {
      const error = await response.json();
      showNotification(error.message || 'Login failed', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showNotification('Error during login', 'error');
  }
}

async function handleRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const fullName = document.getElementById('regFullName').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!username || !email || !password) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, full_name: fullName, password })
    });

    if (response.ok) {
      showNotification('Account created successfully! Please log in.', 'success');
      switchToLogin();
      document.getElementById('loginEmail').value = email;
    } else {
      const error = await response.json();
      showNotification(error.message || 'Registration failed', 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    showNotification('Error during registration', 'error');
  }
}

// Setup Auth Event Listeners
function setupAuthListeners() {
  // Auth modal switches
  const switchToLoginBtns = document.querySelectorAll('#switchToLogin');
  const switchToRegisterBtns = document.querySelectorAll('#switchToRegister');
  
  switchToLoginBtns.forEach(btn => {
    btn.onclick = switchToLogin;
  });
  
  switchToRegisterBtns.forEach(btn => {
    btn.onclick = switchToRegister;
  });

  // Auth buttons - Direct onclick assignment
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.onclick = handleLogin;
  }

  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.onclick = handleRegister;
  }

  // Auth button in checkout
  const loginCheckoutBtn = document.getElementById('loginCheckout');
  if (loginCheckoutBtn) {
    loginCheckoutBtn.onclick = openAuthModal;
  }

  // Auth button in navbar
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    authBtn.onclick = openAuthModal;
  }

  // Enter key for login/register
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.onkeypress = (e) => {
      if (e.key === 'Enter') handleLogin();
    };
  }

  const regPassword = document.getElementById('regPassword');
  if (regPassword) {
    regPassword.onkeypress = (e) => {
      if (e.key === 'Enter') handleRegister();
    };
  }
}

// Call setup when DOM is ready OR immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAuthListeners);
} else {
  setupAuthListeners();
}

// Also setup on page load to be extra sure
window.addEventListener('load', setupAuthListeners);
