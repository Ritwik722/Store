# SETUP INSTRUCTIONS

## What's Included

This is a **complete full-stack e-commerce website** for Anshita General Store with:

✨ **Features:**
- Product catalog with search & filters
- Shopping cart system
- User registration & authentication
- Checkout & order placement
- Admin dashboard with product management
- Inventory management
- Customer reviews & ratings
- Responsive design (mobile-friendly)

## Files Created

### Backend (Node.js + Express)
```
backend/
├── server.js              # Main server application
├── database.js            # Database connection & queries
├── seed.js                # Sample data seeder
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── middleware/
│   └── auth.js           # JWT authentication
└── routes/
    ├── auth.js           # User registration/login
    ├── products.js       # Product listings
    ├── admin.js          # Admin endpoints
    ├── cart.js           # Cart management
    └── orders.js         # Order processing
```

### Frontend (HTML/CSS/JavaScript)
```
frontend/
├── index.html             # Home page
├── products.html          # Products page
├── cart.html              # Shopping cart
├── checkout.html          # Checkout page
├── admin.html             # Admin dashboard
├── css/
│   ├── style.css          # Main styles
│   ├── products.css       # Products & cart styles
│   └── admin.css          # Admin styles
└── js/
    ├── main.js            # Common functions
    ├── products.js        # Products logic
    ├── cart.js            # Cart logic
    ├── auth.js            # Authentication
    ├── checkout.js        # Checkout logic
    └── admin.js           # Admin logic
```

### Documentation & Configuration
```
├── README.md              # Complete documentation
├── QUICKSTART.md          # Quick start guide
├── package.json           # Root package.json
├── .gitignore             # Git ignore file
├── setup.sh               # Linux/Mac setup script
├── setup.bat              # Windows setup script
└── database/
    └── (auto-created)     # SQLite database file
```

## Quick Start (Windows)

### Option 1: Using Setup Script
1. Double-click `setup.bat`
2. Wait for installation to complete
3. From `backend` folder, run: `npm start`
4. Open `http://localhost:3000`

### Option 2: Manual Setup
1. Open Terminal/Command Prompt
2. Navigate to project folder
3. Run: `cd backend && npm install`
4. Run: `npm start`
5. Open browser to `http://localhost:3000`

## Quick Start (Mac/Linux)

1. Open Terminal
2. Navigate to project folder
3. Run: `chmod +x setup.sh && ./setup.sh`
4. Run: `npm start`
5. Open `http://localhost:3000`

## Initialize with Sample Data

After server starts, in another terminal:
```bash
cd anshita-store/backend
npm run seed
```

This will add:
- 5 sample product categories
- 8 sample products with prices and descriptions

## Default Admin Account

To create an admin account, you need to:

1. Register a new account (Home → Login → Register)
2. Update the database to make user admin (requires SQLite client)
3. Or directly update via database:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';
```

## Store Information

This website is created for:

**Anshita General Store**
📍 49, Street Number 2, Jai Bajrang Nagar, Indore, MP 452011
📞 087700 14615
⭐ 5.0 stars

## Features Guide

### For Customers
- Browse products with search and category filters
- View detailed product information
- Add items to cart
- Manage cart (add/remove/update quantities)
- Register and login to place orders
- Checkout with address and payment selection
- Place orders (Cash on Delivery or Online)

### For Admins
- Login with admin account
- Access admin dashboard
- Add new products with details
- Edit existing products
- Delete products
- Create product categories
- Track inventory/stock levels
- View orders and revenue

## Technology Stack

**Frontend:**
- HTML5, CSS3
- Vanilla JavaScript
- Local Storage API
- Fetch API for server communication

**Backend:**
- Node.js
- Express.js framework
- SQLite3 database
- JWT authentication
- Bcryptjs for password hashing

**Database:**
- SQLite3 (file-based, no extra setup needed)
- 6 tables: Users, Products, Categories, Reviews, Orders, OrderItems

## API Base URL

All API requests go to: `http://localhost:3000/api`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Port 3000 in use" | Change port in backend/server.js or close the application using port 3000 |
| "npm: command not found" | Install Node.js from nodejs.org |
| Database error | Delete database/store.db and restart server |
| CORS errors | Ensure backend is running on http://localhost:3000 |
| Products not showing | Use admin dashboard to add products, or run `npm run seed` |

## Security Notes

⚠️ This is a demo/development version. For production:
- Use HTTPS
- Implement proper environment variables (.env file)
- Add CSRF protection
- Enable input validation
- Use database encryption
- Implement rate limiting
- Add proper error logging

## Next Steps

1. ✅ Install dependencies: `npm install` (in backend folder)
2. ✅ Start server: `npm start`
3. ✅ Open browser: `http://localhost:3000`
4. ✅ Register account or seed sample data
5. ✅ Start shopping or manage store!

## Support

For detailed information, see:
- `README.md` - Complete documentation
- `QUICKSTART.md` - Quick reference
- Backend console output - Error logs

---

🎉 Your Anshita General Store website is ready to use!
