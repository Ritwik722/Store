// Checkout Page Logic
function displayCheckout() {
  const notLoggedIn = document.getElementById('notLoggedIn');
  const checkoutContent = document.getElementById('checkoutContent');

  if (!currentUser) {
    notLoggedIn.style.display = 'block';
    if (checkoutContent) checkoutContent.style.display = 'none';
    return;
  }

  notLoggedIn.style.display = 'none';
  if (checkoutContent) checkoutContent.style.display = 'block';

  // Fill in user info
  document.getElementById('fullName').value = currentUser.full_name || '';
  document.getElementById('email').value = currentUser.email || '';
  document.getElementById('phone').value = currentUser.phone || '';
  document.getElementById('address').value = currentUser.address || '';
  document.getElementById('city').value = currentUser.city || '';
  document.getElementById('state').value = currentUser.state || '';
  document.getElementById('pincode').value = currentUser.pincode || '';

  displayOrderSummary();
}

function displayOrderSummary() {
  const orderItems = document.getElementById('orderItems');
  if (!orderItems) return;

  if (cartItems.length === 0) {
    orderItems.innerHTML = '<p class="no-reviews">Your cart is empty</p>';
    return;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  orderItems.innerHTML = cartItems.map(item => `
    <div class="order-item">
      <span>${item.name} x ${item.quantity}</span>
      <span>${formatCurrency(item.price * item.quantity)}</span>
    </div>
  `).join('');

  if (document.getElementById('orderTotal')) {
    document.getElementById('orderTotal').textContent = formatCurrency(total);
  }
}

async function placeOrder() {
  if (!currentUser) {
    showNotification('Please log in to place an order', 'error');
    return;
  }

  if (cartItems.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }

  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pincode = document.getElementById('pincode').value.trim();

  if (!fullName || !phone || !address || !city || !state || !pincode) {
    showNotification('Please fill in all address fields', 'error');
    return;
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const totalAmount = subtotal + shipping;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify({
        items: cartItems,
        total_amount: totalAmount,
        shipping_address: `${address}, ${city}, ${state} ${pincode}`,
        payment_method: paymentMethod,
        payment_id: paymentMethod === 'cod' ? 'COD' : null
      })
    });

    if (response.ok) {
      const data = await response.json();
      showNotification('Order placed successfully!', 'success');
      cartItems = [];
      saveCart();
      
      // Redirect to order confirmation or home
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      const error = await response.json();
      showNotification(error.message || 'Error placing order', 'error');
    }
  } catch (err) {
    console.error('Order error:', err);
    showNotification('Error placing order', 'error');
  }
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  displayCheckout();

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }

  const loginCheckoutBtn = document.getElementById('loginCheckout');
  if (loginCheckoutBtn) {
    loginCheckoutBtn.addEventListener('click', openAuthModal);
  }
});
