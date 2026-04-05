import { faker } from "@faker-js/faker";
import { Pool } from "pg";

faker.seed(42);

const DEMO_DB_URL = process.env.DEMO_DB_URL;

if (!DEMO_DB_URL) {
  console.error("DEMO_DB_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({ connectionString: DEMO_DB_URL });

const NOW = new Date();
const TODAY_START = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

function daysAgo(n: number): Date {
  const d = new Date(TODAY_START);
  d.setDate(d.getDate() - n);
  return d;
}

function randomDateBetween(start: Date, end: Date): Date {
  const s = start.getTime();
  const e = end.getTime();
  return new Date(s + Math.random() * (e - s));
}

function logProgress(label: string, current: number, total?: number) {
  if (total) {
    if (current % 100 === 0 || current === total) {
      console.log(`${label}: ${current}/${total}`);
    }
  } else {
    if (current % 50 === 0) {
      console.log(`${label}: ${current}`);
    }
  }
}

const CATEGORIES = [
  { name: "Electronics", description: "Gadgets, computers, and accessories" },
  { name: "Clothing", description: "Apparel and fashion items" },
  { name: "Food & Beverage", description: "Gourmet foods and drinks" },
  { name: "Books", description: "Fiction, non-fiction, and educational" },
  { name: "Sports", description: "Equipment and outdoor gear" },
  { name: "Home & Garden", description: "Furniture, decor, and tools" },
];

const US_STATES = [
  "CA","NY","TX","FL","IL","PA","OH","GA","NC","MI",
  "NJ","VA","WA","AZ","MA","TN","IN","MO","MD","WI",
  "CO","MN","SC","AL","LA","KY","OR","OK","CT","UT",
];

const ORDER_STATUSES = [
  "completed","completed","completed","completed","completed",
  "completed","completed","completed","pending","cancelled",
];

const SEGMENTS = ["VIP", "Regular", "New", "Budget"] as const;
const SEGMENT_WEIGHTS: Record<string, number> = {
  VIP: 0.15,
  Regular: 0.45,
  New: 0.25,
  Budget: 0.15,
};

const PRODUCT_NAMES: Record<string, string[]> = {
  Electronics: [
    "Wireless Headphones","Mechanical Keyboard","USB-C Hub","Portable Charger",
    "Bluetooth Speaker","Webcam HD","Monitor Stand","Wireless Mouse","SSD 1TB",
    "HDMI Cable","Laptop Sleeve","Phone Case","Smart Watch","Tablet Stand",
  ],
  Clothing: [
    "Cotton T-Shirt","Denim Jacket","Running Shoes","Wool Scarf","Baseball Cap",
    "Slim Fit Jeans","Hoodie","Dress Shirt","Sneakers","Winter Gloves",
    "Polo Shirt","Chino Pants","Rain Coat","Sunglasses",
  ],
  "Food & Beverage": [
    "Organic Coffee Beans","Green Tea Pack","Dark Chocolate Bar","Olive Oil Premium",
    "Honey Jar","Pasta Assortment","Hot Sauce Set","Dried Fruit Mix",
    "Almond Butter","Sparkling Water","Protein Bar Box","Trail Mix",
    "Maple Syrup","Spice Collection",
  ],
  Books: [
    "The Art of Code","Modern Architecture","Space Explorer's Guide",
    "Cooking Masterclass","History of Music","Mountain Adventures",
    "Ocean Stories","Design Thinking","Startup Playbook","AI Revolution",
    "Yoga Handbook","Travel Atlas","Garden Almanac","Science Digest",
  ],
  Sports: [
    "Yoga Mat","Resistance Bands","Water Bottle","Jump Rope","Foam Roller",
    "Dumbbell Set","Running Belt","Swim Goggles","Tennis Racket",
    "Cycling Gloves","Hiking Backpack","Camping Tent","Fishing Rod","Basketball",
  ],
  "Home & Garden": [
    "LED Desk Lamp","Plant Pot Set","Throw Pillow","Wall Clock","Bookshelf",
    "Kitchen Knife Set","Bath Towel Set","Candle Collection","Door Mat",
    "Garden Tools","Picture Frame Set","Storage Bins","Coffee Table","Linen Set",
  ],
};

type ProductRow = { id: number; price: number; categoryId: number };

type OrderRow = {
  customerId: number;
  status: string;
  total: number;
  createdAt: Date;
};

type OrderItemRow = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

const BATCH_SIZE = 500;

async function batchInsertOrders(
  client: any,
  orders: OrderRow[],
  items: OrderItemRow[][],
) {
  for (let i = 0; i < orders.length; i += BATCH_SIZE) {
    const chunk = orders.slice(i, i + BATCH_SIZE);
    const itemsChunk = items.slice(i, i + BATCH_SIZE);

    const orderValues = chunk.map((_, idx) => {
      const base = idx * 4;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    });

    const orderParams = chunk.flatMap((o) => [
      o.customerId, o.status, o.total, o.createdAt,
    ]);

    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, status, total, created_at) VALUES ${orderValues.join(", ")} RETURNING id`,
      orderParams,
    );

    const itemValues: string[] = [];
    const itemParams: any[] = [];

    for (let j = 0; j < itemsChunk.length; j++) {
      const orderId = orderRes.rows[j].id;
      for (const item of itemsChunk[j]) {
        const base = itemParams.length;
        itemValues.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
        itemParams.push(orderId, item.productId, item.quantity, item.unitPrice);
      }
    }

    if (itemValues.length > 0) {
      for (let k = 0; k < itemValues.length; k += BATCH_SIZE) {
        const valSlice = itemValues.slice(k, k + BATCH_SIZE);
        const paramCount = valSlice.length * 4;
        const paramStart = k * 4;
        const paramSlice = itemParams.slice(paramStart, paramStart + paramCount);
        const reindexed = valSlice.map((_, vi) => {
          const b = vi * 4;
          return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4})`;
        });
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ${reindexed.join(", ")}`,
          paramSlice,
        );
      }
    }
  }
}

function pickSegment(): string {
  const r = Math.random();
  let cumulative = 0;
  for (const seg of SEGMENTS) {
    cumulative += SEGMENT_WEIGHTS[seg];
    if (r <= cumulative) return seg;
  }
  return "Regular";
}

function makePickProducts(products: ProductRow[]) {
  return function pickProducts(segment: string, count: number): ProductRow[] {
    if (segment === "VIP") {
      const expensive = products.filter((p) => p.price > 50);
      return faker.helpers.arrayElements(
        expensive.length >= count ? expensive : products,
        {
          min: 1,
          max: Math.min(
            count,
            expensive.length >= count ? expensive.length : products.length,
          ),
        },
      );
    }

    if (segment === "Budget") {
      const cheap = products.filter((p) => p.price < 35);
      return faker.helpers.arrayElements(
        cheap.length >= count ? cheap : products,
        {
          min: 1,
          max: Math.min(
            count,
            cheap.length >= count ? cheap.length : products.length,
          ),
        },
      );
    }

    return faker.helpers.arrayElements(products, {
      min: 1,
      max: Math.min(count, products.length),
    });
  };
}

function pickQuantity(segment: string): number {
  if (segment === "VIP") return faker.number.int({ min: 2, max: 4 });
  if (segment === "Budget") return faker.number.int({ min: 1, max: 2 });
  return faker.number.int({ min: 1, max: 3 });
}

async function seed() {
  const client = await pool.connect();

  try {
    console.log("Creating tables...");
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        price NUMERIC(10,2) NOT NULL,
        cost NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        city VARCHAR(100),
        state VARCHAR(50),
        country VARCHAR(80) NOT NULL DEFAULT 'US',
        segment VARCHAR(20) NOT NULL DEFAULT 'Regular',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_customers_state ON customers(state)`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        total NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL
      )
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id)`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`,
    );

    await client.query(`
      TRUNCATE TABLE reviews, order_items, orders, products, customers, categories
      RESTART IDENTITY CASCADE
    `);

    await client.query("COMMIT");
    console.log("Tables ready.");

    // ── Categories / Products / Customers ──
    await client.query("BEGIN");

    console.log("Seeding categories...");
    const categoryRows: { id: number; name: string }[] = [];
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const res = await client.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
        [cat.name, cat.description],
      );
      categoryRows.push({ id: res.rows[0].id, name: cat.name });
      logProgress("Categories", i + 1, CATEGORIES.length);
    }

    console.log("Seeding products...");
    const productRows: ProductRow[] = [];
    const categoryMap = new Map(categoryRows.map((c) => [c.name, c.id]));
    let pCount = 0;
    const totalProducts = Object.values(PRODUCT_NAMES).reduce(
      (acc, arr) => acc + arr.length,
      0,
    );

    for (const [catName, names] of Object.entries(PRODUCT_NAMES)) {
      const catId = categoryMap.get(catName)!;
      for (const productName of names) {
        const price = faker.number.float({
          min: 5,
          max: 120,
          fractionDigits: 2,
        });
        const margin = 0.3 + Math.random() * 0.4;
        const cost = parseFloat((price * margin).toFixed(2));
        const stock = faker.number.int({ min: 0, max: 200 });
        const createdAt = randomDateBetween(daysAgo(365), daysAgo(180));

        const res = await client.query(
          "INSERT INTO products (name, category_id, price, cost, stock, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [productName, catId, price, cost, stock, createdAt],
        );

        productRows.push({
          id: res.rows[0].id,
          price,
          categoryId: catId,
        });

        pCount++;
        logProgress("Products", pCount, totalProducts);
      }
    }

    console.log("Seeding customers...");
    const customerRows: { id: number; segment: string }[] = [];
    const NO_REVIEW_CUSTOMER_IDS: number[] = [];

    for (let i = 0; i < 200; i++) {
      const segment = pickSegment();
      const state = faker.helpers.arrayElement(US_STATES);
      const createdDaysAgo =
        segment === "New"
          ? faker.number.int({ min: 1, max: 30 })
          : faker.number.int({ min: 60, max: 365 });

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      const res = await client.query(
        "INSERT INTO customers (first_name, last_name, email, city, state, country, segment, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
        [
          firstName,
          lastName,
          faker.internet.email({ firstName, lastName }).toLowerCase(),
          faker.location.city(),
          state,
          "US",
          segment,
          daysAgo(createdDaysAgo),
        ],
      );

      const custId = res.rows[0].id;
      customerRows.push({ id: custId, segment });

      if (i >= 185) {
        NO_REVIEW_CUSTOMER_IDS.push(custId);
      }

      logProgress("Customers", i + 1, 200);
    }

    await client.query("COMMIT");

    // ── Orders (batched) ──
    await client.query("BEGIN");

    console.log("Seeding orders...");

    const pickProducts = makePickProducts(productRows);

    const generateOrder = (customer: { segment: string; id: number }, orderDate: Date, forceStatus?: string) => {
      const status = forceStatus ?? faker.helpers.arrayElement(ORDER_STATUSES);
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = pickProducts(customer.segment, itemCount);

      let orderTotal = 0;
      const items: OrderItemRow[] = [];

      for (const product of selectedProducts) {
        const quantity = pickQuantity(customer.segment);
        const unitPrice = product.price;
        orderTotal += quantity * unitPrice;
        items.push({ productId: product.id, quantity, unitPrice });
      }

      orderTotal = parseFloat(orderTotal.toFixed(2));

      return {
        order: { customerId: customer.id, status, total: orderTotal, createdAt: orderDate },
        items,
      };
    };

    const allOrders: OrderRow[] = [];
    const allItems: OrderItemRow[][] = [];
    let totalOrders = 0;
    let totalItems = 0;

    const yearAgo = daysAgo(365);
    const threeMonthsAgo = daysAgo(90);

    // Phase 1: 5500 orders spread across past year
    console.log("Phase 1: Generating 5500 orders across past year...");
    const phase1Orders: OrderRow[] = [];
    const phase1Items: OrderItemRow[][] = [];
    for (let i = 0; i < 5500; i++) {
      const customer = faker.helpers.arrayElement(customerRows);
      const orderDate = randomDateBetween(yearAgo, threeMonthsAgo);
      const { order, items } = generateOrder(customer, orderDate);
      phase1Orders.push(order);
      phase1Items.push(items);
    }
    console.log("Phase 1: Inserting...");
    await batchInsertOrders(client, phase1Orders, phase1Items);
    totalOrders += phase1Orders.length;
    totalItems += phase1Items.reduce((s, items) => s + items.length, 0);
    console.log(`Phase 1 done: ${phase1Orders.length} orders`);

    // Phase 2: 3700 orders in last 90 days
    console.log("Phase 2: Generating 3700 orders in last 90 days...");
    const phase2Orders: OrderRow[] = [];
    const phase2Items: OrderItemRow[][] = [];
    for (let i = 0; i < 3700; i++) {
      const customer = faker.helpers.arrayElement(customerRows);
      const orderDate = randomDateBetween(threeMonthsAgo, new Date(NOW.getTime() - 1000));
      const { order, items } = generateOrder(customer, orderDate);
      phase2Orders.push(order);
      phase2Items.push(items);
    }
    console.log("Phase 2: Inserting...");
    await batchInsertOrders(client, phase2Orders, phase2Items);
    totalOrders += phase2Orders.length;
    totalItems += phase2Items.reduce((s, items) => s + items.length, 0);
    console.log(`Phase 2 done: ${phase2Orders.length} orders`);

    // Phase 3: 15-30 orders per day for last 30 days
    console.log("Phase 3: Generating 15-30 orders/day for last 30 days...");
    const phase3Orders: OrderRow[] = [];
    const phase3Items: OrderItemRow[][] = [];
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const dayStart = daysAgo(dayOffset);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const ordersForDay = faker.number.int({ min: 15, max: 30 });

      for (let j = 0; j < ordersForDay; j++) {
        const customer = faker.helpers.arrayElement(customerRows);
        const orderDate = randomDateBetween(dayStart, dayEnd);
        const { order, items } = generateOrder(customer, orderDate);
        phase3Orders.push(order);
        phase3Items.push(items);
      }
      logProgress("Phase 3 days", 29 - dayOffset + 1, 30);
    }
    console.log("Phase 3: Inserting...");
    await batchInsertOrders(client, phase3Orders, phase3Items);
    totalOrders += phase3Orders.length;
    totalItems += phase3Items.reduce((s, items) => s + items.length, 0);
    console.log(`Phase 3 done: ${phase3Orders.length} orders`);

    // Phase 4: Power buyers
    console.log("Phase 4: Generating power-buyer orders...");
    const phase4Orders: OrderRow[] = [];
    const phase4Items: OrderItemRow[][] = [];
    for (const custId of NO_REVIEW_CUSTOMER_IDS) {
      const numOrders = faker.number.int({ min: 15, max: 25 });
      const customer = customerRows.find((c) => c.id === custId)!;

      for (let j = 0; j < numOrders; j++) {
        const orderDate = randomDateBetween(daysAgo(180), new Date(NOW.getTime() - 1000));
        const { order, items } = generateOrder(customer, orderDate, "completed");
        phase4Orders.push(order);
        phase4Items.push(items);
      }
    }
    console.log("Phase 4: Inserting...");
    await batchInsertOrders(client, phase4Orders, phase4Items);
    totalOrders += phase4Orders.length;
    totalItems += phase4Items.reduce((s, items) => s + items.length, 0);
    console.log(`Phase 4 done: ${phase4Orders.length} orders`);

    await client.query("COMMIT");

    // ── Reviews ──
    await client.query("BEGIN");

    console.log("Seeding reviews...");
    const noReviewSet = new Set(NO_REVIEW_CUSTOMER_IDS);
    const reviewableCustomers = customerRows.filter((c) => !noReviewSet.has(c.id));

    let totalReviews = 0;
    const reviewedPairs = new Set<string>();

    const reviewBatch: any[][] = [];

    for (let i = 0; i < 800; i++) {
      const productId = faker.helpers.arrayElement(productRows).id;
      const customer = faker.helpers.arrayElement(reviewableCustomers);
      const pairKey = `${productId}-${customer.id}`;

      if (reviewedPairs.has(pairKey)) continue;
      reviewedPairs.add(pairKey);

      const rating = faker.helpers.weightedArrayElement([
        { weight: 5, value: 5 },
        { weight: 10, value: 4 },
        { weight: 8, value: 3 },
        { weight: 4, value: 2 },
        { weight: 2, value: 1 },
      ]);

      const hasText = Math.random() < 0.7;
      const reviewText = hasText ? faker.lorem.sentences({ min: 1, max: 3 }) : null;

      reviewBatch.push([productId, customer.id, rating, reviewText, randomDateBetween(daysAgo(180), NOW)]);

      if (reviewBatch.length >= BATCH_SIZE || i === 799) {
        const values = reviewBatch.map((_, idx) => {
          const b = idx * 5;
          return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5})`;
        });
        const params = reviewBatch.flat();
        await client.query(
          `INSERT INTO reviews (product_id, customer_id, rating, review_text, created_at) VALUES ${values.join(", ")}`,
          params,
        );
        totalReviews += reviewBatch.length;
        reviewBatch.length = 0;
      }

      logProgress("Reviews", i + 1, 800);
    }

    await client.query("COMMIT");

    console.log("\nSeeding complete!");
    console.log(`  Categories: ${CATEGORIES.length}`);
    console.log(`  Products:   ${productRows.length}`);
    console.log(`  Customers:  ${customerRows.length}`);
    console.log(`  Orders:     ${totalOrders}`);
    console.log(`  Order Items:${totalItems}`);
    console.log(`  Reviews:    ${totalReviews}`);
    console.log(`  No-review customers: ${NO_REVIEW_CUSTOMER_IDS.length}`);
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
