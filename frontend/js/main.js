// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : `${window.location.protocol}//${window.location.host}/api`;

// User Management
let currentUser = null;
let cartItems = [];

// Initialize app
function initApp() {
  checkAuthentication();
  updateCartCount();
  setupEventListeners();
}

// Check if user is logged in
async function checkAuthentication() {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        currentUser = await response.json();
        updateAuthUI();
      } else {
        localStorage.removeItem('authToken');
        updateAuthUI();
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  }
  updateAuthUI();
}

// Update UI based on auth status
function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminBtn = document.getElementById('adminBtn');

  if (currentUser) {
    if (authBtn) authBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (adminBtn && currentUser.is_admin) {
      adminBtn.style.display = 'block';
    }

    // Add logout functionality
    if (logoutBtn) {
      logoutBtn.onclick = logout;
    }
    if (adminBtn) {
      adminBtn.onclick = () => window.location.href = '/admin.html';
    }
  } else {
    if (authBtn) {
      authBtn.style.display = 'block';
      authBtn.onclick = openAuthModal;
    }
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
  }
}

// Logout
function logout() {
  localStorage.removeItem('authToken');
  currentUser = null;
  updateAuthUI();
  showNotification('Logged out successfully', 'success');
  window.location.href = '/';
}

// Setup event listeners
function setupEventListeners() {
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      modal.style.display = 'none';
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// Update cart count
function updateCartCount() {
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl && currentUser) {
    const count = cartItems.length;
    cartCountEl.textContent = count;
  }
}

// Load cart from LocalStorage
function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) {
    cartItems = JSON.parse(saved);
  }
}

// Save cart to LocalStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  updateCartCount();
}

// Add to cart
function addToCart(product) {
  const existingItem = cartItems.find(item => item.productId === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1
    });
  }
  
  saveCart();
  showNotification(`${product.name} added to cart!`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Fetch with auth
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    currentUser = null;
    updateAuthUI();
  }

  return response;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
