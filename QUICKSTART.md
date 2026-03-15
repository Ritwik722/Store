# Anshita Store - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd anshita-store/backend
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Open Browser
Go to: `http://localhost:3000`

---

## Default Account

### Admin Login (Create first)
Run this command in a SQLite client or directly modify the database:

```sql
-- Create default admin account
INSERT INTO users (username, email, password, full_name, is_admin) 
VALUES ('admin', 'admin@anshita.com', 
'$2a$10$YourHashedPasswordHere', 'Admin User', 1);
```

Or use the register function and then update:
```sql
UPDATE users SET is_admin = 1 WHERE email = 'your-email-here';
```

---

## Quick Test

1. **Register New Account**
   - Click Login in navbar
   - Click "Register here"
   - Fill details and create account

2. **Add Products (Admin)**
   - Login with admin account
   - Click Admin button
   - Go to Products section
   - Add sample product:
     - Name: "Pen Set"
     - Price: ₹99
     - Stock: 50

3. **Shop as Customer**
   - Go to Products
   - Click product to view details
   - Add to cart
   - Go to cart
   - Checkout
   - Place order (Cash on Delivery)

---

## File Locations

- **Frontend**: `/frontend/` - Open any .html file for view
- **Backend**: `/backend/server.js` - Main server
- **Database**: `/database/store.db` - SQLite database

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change PORT in backend/server.js or kill process on port |
| Database error | Delete store.db and restart (will recreate) |
| Products not showing | Check admin has added products via dashboard |
| CORS error | Ensure backend is running on http://localhost:3000 |

---

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Store information |
| Products | `/products.html` | Browse items |
| Cart | `/cart.html` | View cart items |
| Checkout | `/checkout.html` | Complete purchase |
| Admin | `/admin.html` | Manage store (admin only) |

---

## API Testing

Test API with curl:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# Get Products
curl http://localhost:3000/api/products
```

---

## Contact
📍 Anshita General Store, Indore, MP
📞 087700 14615
