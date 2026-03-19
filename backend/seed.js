const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const DATABASE_PATH = path.join(dbDir, 'store.db');

// Delete old database
if (fs.existsSync(DATABASE_PATH)) {
  console.log('🗑️ Removing old database...');
  fs.unlinkSync(DATABASE_PATH);
}

async function seedDatabase() {
  const db = new sqlite3.Database(DATABASE_PATH);

  return new Promise(async (resolve, reject) => {
    try {
      console.log('📦 Creating tables...');

      // Create tables
      await runAsync(db, `CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      await runAsync(db, `CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      await runAsync(db, `CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id)
      )`);

      await runAsync(db, `CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      await runAsync(db, `CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        payment_id TEXT,
        shipping_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      await runAsync(db, `CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`);

      console.log('✅ Tables created');
      console.log('🌱 Seeding data...');

      // Categories
      const categories = [
        ['Stationery', 'Writing and office supplies'],
        ['Notebooks', 'Notebooks and notepads'],
        ['Pencils & Pens', 'Writing instruments'],
        ['Desk Accessories', 'Office desk items'],
        ['General Items', 'Miscellaneous items']
      ];

      for (const [name, desc] of categories) {
        await runAsync(db, 'INSERT INTO categories (name, description) VALUES (?, ?)', [name, desc]);
      }
      console.log(`✓ ${categories.length} categories added`);

      // Products
      const products = [
        ['Ballpoint Pen - Pack of 10', 'Smooth writing ballpoint pens, assorted colors', 3, 45, 75],
        ['A4 Ruled Notebook - 200 Pages', 'Premium quality ruled notebook with 200 pages', 2, 65, 100],
        ['Wooden Desk Organizer - 5 Compartment', 'Beautiful wooden desk organizer with 5 compartments', 4, 399, 35],
        ['Fluorescent Highlighter - Pack of 6', 'Bright fluorescent highlighter markers in 6 colors', 1, 89, 60],
        ['Spiral Notebook - 100 Pages', 'Handy spiral-bound notebook with 100 pages', 2, 55, 120],
        ['Color Pencil Set - 12 Colors', 'High-quality color pencils set with 12 colors', 3, 149, 50],
        ['Heavy Duty Stapler with Staples', 'Professional stapler with 1000 staples', 1, 129, 45],
        ['Sticky Notes - 5 Color Set', 'Colorful sticky notes set with 5 colors', 5, 35, 90],
        ['Whiteboard Marker - Pack of 8', 'Write/erase whiteboard markers in 8 colors', 1, 75, 70],
        ['File Folder - Pack of 5', 'Durable file folders in vibrant colors', 5, 85, 80],
        ['Compass Set - Professional Quality', 'Complete compass geometry set', 4, 95, 55],
        ['Tape Dispenser - Heavy Duty', 'Sturdy tape dispenser with tape roll', 4, 149, 40],
        ['Eraser Bundle - Pack of 10', 'High-quality erasers for pencil and ink', 3, 29, 110],
        ['Sticky Tape Roll - 2 Pack', 'Transparent sticky tape rolls 50 meters each', 5, 45, 95],
        ['Sharpener - Double Hole', 'Double-hole pencil sharpener', 3, 25, 150]
      ];

      for (const prod of products) {
        await runAsync(db, 
          'INSERT INTO products (name, description, category_id, price, stock) VALUES (?, ?, ?, ?, ?)',
          prod
        );
      }
      console.log(`✓ ${products.length} products added`);

      // Users
      const adminPass = await bcrypt.hash('admin123', 10);
      const newAdminPass = await bcrypt.hash('123456', 10);
      const userPass = await bcrypt.hash('user123', 10);

      await runAsync(db,
        'INSERT INTO users (username, email, password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@anshita.com', adminPass, 'Admin User', 1]
      );

      await runAsync(db,
        'INSERT INTO users (username, email, password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
        ['rithwik', 'rithwiksune@gmail.com', newAdminPass, 'Rithwik Admin', 1]
      );

      await runAsync(db,
        'INSERT INTO users (username, email, password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
        ['testuser', 'test@example.com', userPass, 'Test User', 0]
      );

      console.log('✓ 3 users added');
      console.log('\n✅ Database seeding completed!');
      console.log('📊 Categories: 5, Products: 15, Users: 3');
      console.log('\n🔐 Admin Accounts:');
      console.log('  admin@anshita.com / admin123');
      console.log('  rithwiksune@gmail.com / 123456');
      console.log('\n👤 Test User:');
      console.log('  test@example.com / user123');

      db.close(() => resolve());
    } catch (err) {
      console.error('❌ Error:', err);
      db.close();
      reject(err);
    }
  });
}

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

seedDatabase()
  .then(() => {
    console.log('\n✨ Ready!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
