// Products Page Logic
let products = [];
let categories = [];
let selectedProductId = null;

async function loadProducts(search = '', category = '') {
  try {
    let url = `${API_BASE_URL}/products?`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${category}`;

    const response = await fetch(url);
    if (response.ok) {
      products = await response.json();
      renderProducts(products);
      updateProductCount();
    }
  } catch (err) {
    console.error('Error loading products:', err);
    showNotification('Error loading products', 'error');
  }
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/list`);
    if (response.ok) {
      categories = await response.json();
      renderCategories();
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

function renderCategories() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

function renderProducts(productsToRender) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (productsToRender.length === 0) {
    grid.innerHTML = '<p class="empty-message">No products found</p>';
    return;
  }

  grid.innerHTML = productsToRender.map(product => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image_url || 'https://via.placeholder.com/200?text=' + encodeURIComponent(product.name)}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200?text=Product'">
      </div>
      <div class="product-body">
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.category_name || 'Uncategorized'}</div>
        <div class="product-rating">★★★★☆ (4.5)</div>
        <div class="product-price">${formatCurrency(product.price)}</div>
        <div class="product-stock">
          Stock: <span class="stock-status ${product.stock > 0 ? product.stock > 10 ? 'in-stock' : 'low-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? product.stock + ' available' : 'Out of stock'}
          </span>
        </div>
        <div class="product-actions">
          <button class="btn-view" onclick="openProductDetail(${product.id})">View Details</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateProductCount() {
  const count = document.getElementById('productCount');
  if (count) {
    count.textContent = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;
  }
}

async function openProductDetail(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (response.ok) {
      const product = await response.json();
      selectedProductId = productId;
      displayProductDetail(product);
    }
  } catch (err) {
    console.error('Error loading product:', err);
    showNotification('Error loading product details', 'error');
  }
}

function displayProductDetail(product) {
  document.getElementById('modalProductImage').src = product.image_url || 'https://via.placeholder.com/300';
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductDescription').textContent = product.description || 'No description available';
  document.getElementById('modalProductPrice').textContent = formatCurrency(product.price);
  document.getElementById('modalProductCategory').textContent = product.category_name || 'Uncategorized';
  document.getElementById('modalProductStock').textContent = product.stock;
  document.getElementById('modalProductRating').textContent = (product.avg_rating || 0).toFixed(1);

  // Set max quantity
  const quantityInput = document.getElementById('quantityInput');
  quantityInput.value = 1;
  quantityInput.max = Math.max(1, product.stock);

  // Update add to cart button
  const addBtn = document.getElementById('addToCartBtn');
  addBtn.disabled = product.stock <= 0;
  addBtn.onclick = () => {
    const quantity = parseInt(quantityInput.value);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity
    });
  };

  // Display reviews
  displayReviews(product.reviews || []);

  // Show modal
  document.getElementById('productModal').style.display = 'flex';
}

function displayReviews(reviews) {
  const reviewsList = document.getElementById('reviewsList');
  
  if (!reviews || reviews.length === 0) {
    reviewsList.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review!</div>';
    return;
  }

  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-item">
      <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
      <p>${review.comment || 'No comment'}</p>
      <p class="reviewer">— ${review.username}</p>
    </div>
  `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      const search = document.getElementById('searchInput')?.value || '';
      const category = document.getElementById('categoryFilter')?.value || '';
      loadProducts(search, category);
    });

    // Also search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          applyFiltersBtn.click();
        }
      });
    }
  }

  loadCategories();
  loadProducts();
});
