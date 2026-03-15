const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_PATH = path.join(__dirname, '../database/store.db');

// Initialize database and create tables
function initializeDatabase(db) {
  return new Promise((resolve) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
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
        )
      `);

      // Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
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
        )
      `);

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(product_id) REFERENCES products(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
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
        )
      `);

      // Order Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY(order_id) REFERENCES orders(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        )
      `, () => {
        console.log('Database tables created/verified');
        resolve();
      });
    });
  });
}

async function seedDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      // Initialize tables first, then seed data
      initializeDatabase(db).then(() => {
        db.serialize(() => {
          console.log('🌱 Seeding database with sample data...');

        // Add sample categories
        const categories = [
          { name: 'Stationery', description: 'Writing and office supplies' },
          { name: 'Notebooks', description: 'Notebooks and notepads' },
          { name: 'Pencils & Pens', description: 'Writing instruments' },
          { name: 'Desk Accessories', description: 'Office desk items' },
          { name: 'General Items', description: 'Miscellaneous items' }
        ];

        categories.forEach((cat, index) => {
          db.run(
            'INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)',
            [index + 1, cat.name, cat.description],
            function(err) {
              if (err) console.error('Error inserting category:', err);
              else console.log(`✓ Category '${cat.name}' added`);
            }
          );
        });

        // Add sample products
        const products = [
          {
            id: 1,
            name: 'Ballpoint Pen - Pack of 10',
            description: 'Smooth writing ballpoint pens, assorted colors. Perfect for office, school, and daily use',
            category_id: 3,
            price: 45,
            stock: 75,
            image_url: 'https://via.placeholder.com/200?text=Ballpoint+Pen'
          },
          {
            id: 2,
            name: 'A4 Ruled Notebook - 200 Pages',
            description: 'Premium quality ruled notebook with 200 pages. Ideal for college, office, and personal use',
            category_id: 2,
            price: 65,
            stock: 100,
            image_url: 'https://via.placeholder.com/200?text=A4+Notebook'
          },
          {
            id: 3,
            name: 'Wooden Desk Organizer - 5 Compartment',
            description: 'Beautiful wooden desk organizer with 5 compartments. Great for pen, pencil, and stationery storage',
            category_id: 4,
            price: 399,
            stock: 35,
            image_url: 'https://via.placeholder.com/200?text=Desk+Organizer'
          },
          {
            id: 4,
            name: 'Fluorescent Highlighter - Pack of 6',
            description: 'Bright fluorescent highlighter markers in 6 vibrant colors. Perfect for studying and note-taking',
            category_id: 1,
            price: 89,
            stock: 60,
            image_url: 'https://via.placeholder.com/200?text=Highlighters'
          },
          {
            id: 5,
            name: 'Spiral Notebook - 100 Pages',
            description: 'Handy spiral-bound notebook with 100 pages and soft cover. Great for quick notes',
            category_id: 2,
            price: 55,
            stock: 120,
            image_url: 'https://via.placeholder.com/200?text=Spiral+Notebook'
          },
          {
            id: 6,
            name: 'Color Pencil Set - 12 Colors',
            description: 'High-quality color pencils set with 12 vibrant colors in wooden box. For artists and students',
            category_id: 3,
            price: 149,
            stock: 50,
            image_url: 'https://via.placeholder.com/200?text=Color+Pencils'
          },
          {
            id: 7,
            name: 'Heavy Duty Stapler with Staples',
            description: 'Professional stapler with 1000 staples included. Durable and reliable for daily office use',
            category_id: 1,
            price: 129,
            stock: 45,
            image_url: 'https://via.placeholder.com/200?text=Stapler'
          },
          {
            id: 8,
            name: 'Sticky Notes - 5 Color Set',
            description: 'Colorful sticky notes set with 5 colors, 100 sheets each. Perfect for reminders and notes',
            category_id: 5,
            price: 35,
            stock: 90,
            image_url: 'https://via.placeholder.com/200?text=Sticky+Notes'
          },
          {
            id: 9,
            name: 'Whiteboard Marker - Pack of 8',
            description: 'Write/erase whiteboard markers in 8 colors. Works smoothly on whiteboards and glass surfaces',
            category_id: 1,
            price: 75,
            stock: 70,
            image_url: 'https://via.placeholder.com/200?text=Whiteboard+Marker'
          },
          {
            id: 10,
            name: 'File Folder - Pack of 5',
            description: 'Durable file folders in vibrant colors. Ideal for organizing documents and papers',
            category_id: 5,
            price: 85,
            stock: 80,
            image_url: 'https://via.placeholder.com/200?text=File+Folder'
          },
          {
            id: 11,
            name: 'Compass Set - Professional Quality',
            description: 'Complete compass geometry set with ruler, protractor, and compass. Perfect for students',
            category_id: 4,
            price: 95,
            stock: 55,
            image_url: 'https://via.placeholder.com/200?text=Compass+Set'
          },
          {
            id: 12,
            name: 'Tape Dispenser - Heavy Duty',
            description: 'Sturdy tape dispenser machine with included roll of tape. Essential for office and packing',
            category_id: 4,
            price: 149,
            stock: 40,
            image_url: 'https://via.placeholder.com/200?text=Tape+Dispenser'
          },
          {
            id: 13,
            name: 'Eraser Bundle - Pack of 10',
            description: 'High-quality erasers perfect for pencil and ink removal. Works on paper without damage',
            category_id: 3,
            price: 29,
            stock: 110,
            image_url: 'https://via.placeholder.com/200?text=Erasers'
          },
          {
            id: 14,
            name: 'Sticky Tape Roll - 2 Pack',
            description: 'Transparent sticky tape rolls for all your packing and repair needs. Each roll 50 meters',
            category_id: 5,
            price: 45,
            stock: 95,
            image_url: 'https://via.placeholder.com/200?text=Sticky+Tape'
          },
          {
            id: 15,
            name: 'Sharpener - Double Hole',
            description: 'Double-hole pencil sharpener for both standard and thick pencils. Compact and handy design',
            category_id: 3,
            price: 25,
            stock: 150,
            image_url: 'https://via.placeholder.com/200?text=Pencil+Sharpener'
          }
        ];

        products.forEach(product => {
          db.run(
            'INSERT OR IGNORE INTO products (id, name, description, category_id, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product.id, product.name, product.description, product.category_id, product.price, product.stock, product.image_url],
            function(err) {
              if (err) console.error('Error inserting product:', err);
              else console.log(`✓ Product '${product.name}' added at ₹${product.price}`);
            }
          );
        });

        // Add test users
        const hashPassword = async (password) => {
          return await bcrypt.hash(password, 10);
        };

        // Create test users
        (async () => {
          try {
            const adminPassword = await hashPassword('admin123');
            const userPassword = await hashPassword('user123');
            
            // Admin user
            db.run(
              'INSERT OR IGNORE INTO users (username, email, password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
              ['admin', 'admin@anshita.com', adminPassword, 'Admin User', 1],
              function(err) {
                if (err) console.error('Error inserting admin user:', err);
                else console.log('✓ Admin user created (email: admin@anshita.com, password: admin123)');
              }
            );

            // Regular test user
            db.run(
              'INSERT OR IGNORE INTO users (username, email, password, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
              ['testuser', 'test@example.com', userPassword, 'Test User', 0],
              function(err) {
                if (err) console.error('Error inserting test user:', err);
                else console.log('✓ Test user created (email: test@example.com, password: user123)');
              }
            );
          } catch (err) {
            console.error('Error hashing passwords:', err);
          }
        })();

        setTimeout(() => {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
              reject(err);
            } else {
              console.log('\n✅ Database seeding completed successfully!');
              console.log('📊 Added 5 categories, 15 products, and 2 test users');
              console.log('\n🔐 Test Accounts:');
              console.log('  Admin: admin@anshita.com / admin123');
              console.log('  User: test@example.com / user123');
              resolve();
            }
          });
        }, 1000);
        });
      }).catch(reject);
    });
  });
}

// Run seeding
seedDatabase().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
