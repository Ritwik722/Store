// Admin Dashboard Logic
let adminProducts = [];
let adminCategories = [];
let editingProductId = null;

async function checkAdminAccess() {
  // Load user from localStorage if not already set
  if (!currentUser) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      showNotification('Please log in first', 'error');
      window.location.href = '/';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        currentUser = await response.json();
      } else {
        localStorage.removeItem('authToken');
        showNotification('Session expired. Please log in again', 'error');
        window.location.href = '/';
        return;
      }
    } catch (err) {
      console.error('Error loading user:', err);
      showNotification('Failed to verify admin access', 'error');
      window.location.href = '/';
      return;
    }
  }

  // Check if user is admin
  if (!currentUser.is_admin) {
    showNotification('Admin access required', 'error');
    window.location.href = '/';
  } else {
    const adminName = document.getElementById('adminName');
    if (adminName) {
      adminName.textContent = `Welcome, ${currentUser.username}!`;
    }
  }
}

// Dashboard
async function loadDashboard() {
  try {
    const productsResponse = await fetchWithAuth(`${API_BASE_URL}/products`);
    const products = await productsResponse.json();

    const ordersResponse = await fetchWithAuth(`${API_BASE_URL}/orders`);
    const orders = await ordersResponse.json();

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

// Load Products
async function loadAdminProducts() {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/products`);
    adminProducts = await response.json();
    renderAdminProducts();
  } catch (err) {
    console.error('Error loading products:', err);
    showNotification('Error loading products', 'error');
  }
}

// Load Categories
async function loadAdminCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/list`);
    adminCategories = await response.json();
    
    const select = document.getElementById('productCategory');
    if (select) {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Select Category</option>';
      adminCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
      select.value = currentValue;
    }

    renderAdminCategories();
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

// Render Products Table
function renderAdminProducts() {
  const tbody = document.getElementById('productsTable');
  if (!tbody) return;

  tbody.innerHTML = adminProducts.map(product => `
    <tr>
      <td>
        ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="product-thumbnail">` : '<div class="no-image">No Image</div>'}
      </td>
      <td><strong>${product.name}</strong></td>
      <td>${product.category_name || '-'}</td>
      <td><strong>₹${product.price}</strong></td>
      <td>${product.stock}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="loadEditProduct(${product.id})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  if (adminProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No products found</td></tr>';
  }
}

// Setup image preview
function setupImageFileHandler() {
  const imageFileInput = document.getElementById('productImageFile');
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById('imagePreview');
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview" class="preview-image">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Add/Update Product
async function handleAddProduct() {
  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const categoryId = document.getElementById('productCategory').value;
  const price = parseFloat(document.getElementById('productPrice').value);
  const stock = parseInt(document.getElementById('productStock').value) || 0;
  const imageFile = document.getElementById('productImageFile').files[0];

  if (!name || !price) {
    showNotification('Please fill in required fields (Name & Price)', 'error');
    return;
  }

  try {
    let imageUrl = null;

    // Upload image if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      try {
        const uploadReq = await fetch(`${API_BASE_URL}/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
          body: formData
        });

        if (uploadReq.ok) {
          const uploadData = await uploadReq.json();
          imageUrl = uploadData.imageUrl;
        }
      } catch (err) {
        console.error('Image upload error:', err);
        showNotification('Warning: Image upload failed, product will be saved without image', 'warning');
      }
    }

    // If editing, update product
    if (editingProductId) {
      const updateData = {
        name,
        description: description || null,
        category_id: categoryId || null,
        price,
        stock
      };
      if (imageUrl) updateData.image_url = imageUrl;

      const response = await fetchWithAuth(`${API_BASE_URL}/admin/${editingProductId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        showNotification('Product updated successfully!', 'success');
        cancelEditProduct();
        loadAdminProducts();
        loadDashboard();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error updating product', 'error');
      }
    } else {
      // Add new product
      const response = await fetchWithAuth(`${API_BASE_URL}/admin`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: description || null,
          category_id: categoryId || null,
          price,
          stock,
          image_url: imageUrl || null
        })
      });

      if (response.ok) {
        showNotification('Product added successfully!', 'success');
        clearProductForm();
        loadAdminProducts();
        loadDashboard();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Error adding product', 'error');
      }
    }
  } catch (err) {
    console.error('Error:', err);
    showNotification('Error processing product', 'error');
  }
}

// Load Edit Product
function loadEditProduct(productId) {
  const product = adminProducts.find(p => p.id === productId);
  if (!product) return;

  editingProductId = productId;

  document.getElementById('productIdEdit').value = productId;
  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productCategory').value = product.category_id || '';

  // Show image preview if it exists
  if (product.image_url) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${product.image_url}" alt="Current" class="preview-image">`;
  }

  const addBtn = document.getElementById('addProductBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  addBtn.textContent = 'Update Product';
  cancelBtn.style.display = 'inline-block';

  // Scroll to form
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Cancel Edit Product
function cancelEditProduct() {
  editingProductId = null;
  clearProductForm();
  
  const addBtn = document.getElementById('addProductBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  addBtn.textContent = 'Add Product';
  cancelBtn.style.display = 'none';
}

// Clear Product Form
function clearProductForm() {
  document.getElementById('productIdEdit').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productCategory').value = '';
  document.getElementById('productImageFile').value = '';
  document.getElementById('imagePreview').innerHTML = '';
}

// Delete Product
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/${productId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showNotification('Product deleted successfully!', 'success');
      loadAdminProducts();
      loadDashboard();
    } else {
      showNotification('Error deleting product', 'error');
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    showNotification('Error deleting product', 'error');
  }
}

// Render Categories Table
function renderAdminCategories() {
  const tbody = document.getElementById('categoriesTable');
  if (!tbody) return;

  tbody.innerHTML = adminCategories.map(category => `
    <tr>
      <td>${category.id}</td>
      <td><strong>${category.name}</strong></td>
      <td>${category.description || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  if (adminCategories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="no-data">No categories found</td></tr>';
  }
}

// Add Category
async function handleAddCategory() {
  const name = document.getElementById('categoryName').value.trim();
  const description = document.getElementById('categoryDescription').value.trim();

  if (!name) {
    showNotification('Category name is required', 'error');
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/category/create`, {
      method: 'POST',
      body: JSON.stringify({ name, description: description || null })
    });

    if (response.ok) {
      showNotification('Category added successfully!', 'success');
      document.getElementById('categoryName').value = '';
      document.getElementById('categoryDescription').value = '';
      loadAdminCategories();
    } else {
      const error = await response.json();
      showNotification(error.message || 'Error adding category', 'error');
    }
  } catch (err) {
    console.error('Error adding category:', err);
    showNotification('Error adding category', 'error');
  }
}

// Delete Category
async function deleteCategory(categoryId) {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/category/${categoryId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showNotification('Category deleted successfully!', 'success');
      loadAdminCategories();
      loadAdminProducts();
    } else {
      showNotification('Error deleting category', 'error');
    }
  } catch (err) {
    console.error('Error deleting category:', err);
    showNotification('Error deleting category', 'error');
  }
}

// Load Orders
async function loadAdminOrders() {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders`);
    const orders = await response.json();
    renderAdminOrders(orders);
  } catch (err) {
    console.error('Error loading orders:', err);
    showNotification('Error loading orders', 'error');
  }
}

// Render Orders Table
function renderAdminOrders(orders) {
  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>#${order.id}</td>
      <td>User #${order.user_id}</td>
      <td>₹${order.total_amount.toFixed(2)}</td>
      <td><span class="badge badge-${order.status}">${order.status}</span></td>
      <td>${new Date(order.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn-view" onclick="viewOrderDetails(${order.id})">View</button>
      </td>
    </tr>
  `).join('');

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No orders found</td></tr>';
  }
}

function viewOrderDetails(orderId) {
  alert(`Order #${orderId} Details\n\nFull order information would be displayed here.`);
}

// Logout
function logoutAdmin() {
  localStorage.removeItem('authToken');
  currentUser = null;
  showNotification('Logged out successfully', 'success');
  window.location.href = '/';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  loadDashboard();
  loadAdminProducts();
  loadAdminCategories();
  loadAdminOrders();
  setupImageFileHandler();

  // Menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const section = item.dataset.section;
      if (section) {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
      }
    });
  });

  // Add/Update product button
  const addProductBtn = document.getElementById('addProductBtn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', handleAddProduct);
  }

  // Cancel edit button
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cancelEditProduct);
  }

  // Add category button
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', handleAddCategory);
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }

  // Home button
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/products.html';
    });
  }

  // Sidebar back button
  const sidebarBackBtn = document.getElementById('sidebarBackBtn');
  if (sidebarBackBtn) {
    sidebarBackBtn.addEventListener('click', () => {
      window.location.href = '/products.html';
    });
  }

  // Visit store button
  const visitStoreBtn = document.getElementById('visitStoreBtn');
  if (visitStoreBtn) {
    visitStoreBtn.addEventListener('click', () => {
      window.open('/products.html', '_blank');
    });
  }

  // Refresh data button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboard();
      loadAdminProducts();
      loadAdminCategories();
      loadAdminOrders();
      showNotification('Data refreshed successfully!', 'success');
    });
  }

  // Enter key for category name
  const categoryNameInput = document.getElementById('categoryName');
  if (categoryNameInput) {
    categoryNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAddCategory();
    });
  }
});
