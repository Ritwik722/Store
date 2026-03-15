# Anshita General Store - Full Stack E-Commerce Website

A modern, fully-featured e-commerce website for Anshita General Store, built with vanilla HTML/CSS/JavaScript frontend and Node.js/Express backend.

## Features

✨ **Core Features:**
- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart management
- 💳 Checkout system with order placement
- 👤 User authentication (login/register)
- ⭐ Product ratings and reviews
- 🔐 Admin dashboard for product management
- 📦 Inventory management
- 📱 Fully responsive design

## Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Responsive Grid Layout
- Local Storage for cart management
- Fetch API for server communication

### Backend
- Node.js with Express.js
- SQLite3 database
- JWT authentication
- RESTful API

### Database
- SQLite3 (file-based)
- Tables: Users, Products, Categories, Reviews, Orders, Order Items

## Project Structure

```
anshita-store/
├── frontend/
│   ├── index.html          # Home page
│   ├── products.html       # Products listing
│   ├── cart.html          # Shopping cart
│   ├── checkout.html      # Checkout page
│   ├── admin.html         # Admin dashboard
│   ├── css/
│   │   ├── style.css      # Main styles
│   │   ├── products.css   # Products & cart styles
│   │   └── admin.css      # Admin styles
│   └── js/
│       ├── main.js        # Common functions
│       ├── products.js    # Products page logic
│       ├── cart.js        # Cart logic
│       ├── auth.js        # Authentication
│       ├── checkout.js    # Checkout logic
│       └── admin.js       # Admin dashboard logic
├── backend/
│   ├── server.js          # Main server file
│   ├── database.js        # Database configuration
│   ├── package.json       # Dependencies
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   └── routes/
│       ├── auth.js        # Auth endpoints
│       ├── products.js    # Product endpoints
│       ├── admin.js       # Admin endpoints
│       ├── cart.js        # Cart endpoints
│       └── orders.js      # Order endpoints
└── database/
    └── store.db           # SQLite database file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Step 1: Install Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd anshita-store/backend
npm install
```

### Step 2: Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### Step 3: Open in Browser

Open `http://localhost:3000` in your web browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth token)

### Products
- `GET /api/products` - Get all products (supports search and category filters)
- `GET /api/products/:id` - Get product details with reviews
- `GET /api/products/category/list` - Get all categories

### Admin Endpoints (Admin access required)
- `POST /api/admin` - Create product
- `PUT /api/admin/:id` - Update product
- `DELETE /api/admin/:id` - Delete product
- `POST /api/admin/category/create` - Create category

### Cart (Client-side localStorage)
- Add/remove/update items in cart
- Cart persists in browser's local storage

### Orders (Requires authentication)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:orderId` - Get specific order

## How to Use

### As a Customer

1. **Browse Products**
   - Go to Products page
   - Use search and filters to find items
   - Click on a product to see details and reviews

2. **Shopping**
   - Add items to cart
   - Adjust quantities in cart
   - Proceed to checkout

3. **Checkout**
   - Create account or login
   - Enter shipping address
   - Choose payment method (COD or Online)
   - Place order

### As an Administrator

1. **Login as Admin**
   - Admin account needs to be created via database
   - Use the "Admin" button in navbar to access dashboard

2. **Manage Products**
   - Add new products with details
   - Edit existing products
   - Delete products
   - Manage inventory/stock

3. **Manage Categories**
   - Create product categories
   - Organize products by category
   - Delete categories

4. **View Orders**
   - See all customer orders
   - Monitor order status
   - Track revenue

## Creating Admin Account

To create an admin account, you can use SQLite directly:

```sql
UPDATE users SET is_admin = 1 WHERE id = 1;
```

Or modify the database file directly using a SQLite client.

## Database Schema

### Users Table
```sql
- id: INTEGER (Primary Key)
- username: TEXT (Unique)
- email: TEXT (Unique)
- password: TEXT (Hashed)
- full_name: TEXT
- phone: TEXT
- address: TEXT
- city: TEXT
- state: TEXT
- pincode: TEXT
- is_admin: INTEGER (0 or 1)
- created_at: DATETIME
- updated_at: DATETIME
```

### Products Table
```sql
- id: INTEGER (Primary Key)
- name: TEXT
- description: TEXT
- category_id: INTEGER (Foreign Key)
- price: REAL
- stock: INTEGER
- image_url: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

### Categories Table
```sql
- id: INTEGER (Primary Key)
- name: TEXT
- description: TEXT
- created_at: DATETIME
```

### Orders Table
```sql
- id: INTEGER (Primary Key)
- user_id: INTEGER (Foreign Key)
- total_amount: REAL
- status: TEXT
- payment_method: TEXT
- payment_id: TEXT
- shipping_address: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

## Customization

### Change Store Information
Edit the following files:
- `frontend/index.html` - Store details in hero section
- `frontend/css/style.css` - Brand colors, fonts

### Change API Base URL
Edit `frontend/js/main.js`:
```javascript
const API_BASE_URL = 'http://your-api-url:3000/api';
```

### Add Products Manually
Use the Admin Dashboard or add directly to database:
```sql
INSERT INTO products (name, description, category_id, price, stock, image_url)
VALUES ('Product Name', 'Description', 1, 99.99, 50, 'image-url');
```

## Security Notes

⚠️ **Important:**
- This demo uses environment variable-based secret key
- For production, use proper environment management (.env file)
- Implement HTTPS
- Use proper password hashing
- Implement CSRF protection
- Validate all inputs server-side
- Use database encryption for sensitive data

## Troubleshooting

### Server won't start
- Check if port 3000 is in use
- Ensure Node.js is installed correctly
- Try running `npm install` again

### Database errors
- Delete `anshita-store/database/store.db` and restart server (will create new database)
- Check SQLite3 module installation

### CORS errors
- Ensure server is running on same origin or CORS is properly configured
- Check network tab in browser dev tools

## Future Enhancements

- 🔐 Enhanced security features
- 💰 Multiple payment gateway integration
- 📧 Email notifications
- 📊 Advanced analytics dashboard
- 🎨 Dark mode
- 🌍 Multi-language support
- 📱 Mobile app
- 🚚 Real-time order tracking

## Support

For issues or questions, please check:
- Backend logs in terminal
- Browser console (F12 → Console tab)
- Network requests (F12 → Network tab)

## License

MIT License - Feel free to use and modify for your needs

---

**Developed for Anshita General Store**
📍 Indore, Madhya Pradesh
📞 087700 14615
