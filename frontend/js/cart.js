// Cart Page Logic
function displayCart() {
  const emptyCart = document.getElementById('emptyCart');
  const cartContent = document.getElementById('cartContent');

  if (cartItems.length === 0) {
    emptyCart.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  if (cartContent) cartContent.style.display = 'block';

  renderCartTable();
  calculateTotals();
}

function renderCartTable() {
  const tbody = document.getElementById('cartItemsTable');
  if (!tbody) return;

  tbody.innerHTML = cartItems.map((item, index) => `
    <tr>
      <td>
        <div class="product-name-in-cart">${item.name}</div>
      </td>
      <td>${formatCurrency(item.price)}</td>
      <td>
        <div class="quantity-controls">
          <button onclick="decreaseQuantity(${index})">-</button>
          <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
          <button onclick="increaseQuantity(${index})">+</button>
        </div>
      </td>
      <td>${formatCurrency(item.price * item.quantity)}</td>
      <td>
        <button class="btn-remove" onclick="removeFromCart(${index})">Remove</button>
      </td>
    </tr>
  `).join('');
}

function updateQuantity(index, newQuantity) {
  const quantity = parseInt(newQuantity);
  if (quantity > 0) {
    cartItems[index].quantity = quantity;
    saveCart();
    displayCart();
  }
}

function increaseQuantity(index) {
  cartItems[index].quantity++;
  saveCart();
  displayCart();
}

function decreaseQuantity(index) {
  if (cartItems[index].quantity > 1) {
    cartItems[index].quantity--;
  } else {
    removeFromCart(index);
  }
  saveCart();
  displayCart();
}

function removeFromCart(index) {
  const itemName = cartItems[index].name;
  cartItems.splice(index, 1);
  saveCart();
  displayCart();
  showNotification(`${itemName} removed from cart`, 'success');
}

function calculateTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 50 : 0; // Free shipping for now
  const total = subtotal + shipping;

  if (document.getElementById('subtotal')) {
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
  }
  if (document.getElementById('shipping')) {
    document.getElementById('shipping').textContent = formatCurrency(shipping);
  }
  if (document.getElementById('total')) {
    document.getElementById('total').textContent = formatCurrency(total);
  }
}

function setupCartEventListeners() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (currentUser) {
        window.location.href = '/checkout.html';
      } else {
        openAuthModal();
      }
    });
  }
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  displayCart();
  setupCartEventListeners();
});
