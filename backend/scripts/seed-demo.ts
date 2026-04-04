import { faker } from "@faker-js/faker";
import { Pool } from "pg";

faker.seed(42);

const DEMO_DB_URL =
  process.env.DEMO_DB_URL || "postgresql://postgres@localhost:5432/demo_store";

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

const CATEGORIES = [
  { name: "Electronics", description: "Gadgets, computers, and accessories" },
  { name: "Clothing", description: "Apparel and fashion items" },
  { name: "Food & Beverage", description: "Gourmet foods and drinks" },
  { name: "Books", description: "Fiction, non-fiction, and educational" },
  { name: "Sports", description: "Equipment and outdoor gear" },
  { name: "Home & Garden", description: "Furniture, decor, and tools" },
];

const US_STATES = [
  "CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI",
  "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI",
  "CO", "MN", "SC", "AL", "LA", "KY", "OR", "OK", "CT", "UT",
];

const ORDER_STATUSES = [
  "completed", "completed", "completed", "completed", "completed",
  "completed", "completed", "completed", "pending", "cancelled",
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
    "Wireless Headphones", "Mechanical Keyboard", "USB-C Hub",
    "Portable Charger", "Bluetooth Speaker", "Webcam HD",
    "Monitor Stand", "Wireless Mouse", "SSD 1TB", "HDMI Cable",
    "Laptop Sleeve", "Phone Case", "Smart Watch", "Tablet Stand",
  ],
  Clothing: [
    "Cotton T-Shirt", "Denim Jacket", "Running Shoes",
    "Wool Scarf", "Baseball Cap", "Slim Fit Jeans",
    "Hoodie", "Dress Shirt", "Sneakers", "Winter Gloves",
    "Polo Shirt", "Chino Pants", "Rain Coat", "Sunglasses",
  ],
  "Food & Beverage": [
    "Organic Coffee Beans", "Green Tea Pack", "Dark Chocolate Bar",
    "Olive Oil Premium", "Honey Jar", "Pasta Assortment",
    "Hot Sauce Set", "Dried Fruit Mix", "Almond Butter", "Sparkling Water",
    "Protein Bar Box", "Trail Mix", "Maple Syrup", "Spice Collection",
  ],
  Books: [
    "The Art of Code", "Modern Architecture", "Space Explorer's Guide",
    "Cooking Masterclass", "History of Music", "Mountain Adventures",
    "Ocean Stories", "Design Thinking", "Startup Playbook", "AI Revolution",
    "Yoga Handbook", "Travel Atlas", "Garden Almanac", "Science Digest",
  ],
  Sports: [
    "Yoga Mat", "Resistance Bands", "Water Bottle",
    "Jump Rope", "Foam Roller", "Dumbbell Set",
    "Running Belt", "Swim Goggles", "Tennis Racket", "Cycling Gloves",
    "Hiking Backpack", "Camping Tent", "Fishing Rod", "Basketball",
  ],
  "Home & Garden": [
    "LED Desk Lamp", "Plant Pot Set", "Throw Pillow",
    "Wall Clock", "Bookshelf", "Kitchen Knife Set",
    "Bath Towel Set", "Candle Collection", "Door Mat", "Garden Tools",
    "Picture Frame Set", "Storage Bins", "Coffee Table", "Linen Set",
  ],
};

type ProductRow = { id: number; price: number; categoryId: number };

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── Categories ──
    console.log("Seeding categories...");
    const categoryRows: { id: number; name: string }[] = [];
    for (const cat of CATEGORIES) {
      const res = await client.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
        [cat.name, cat.description],
      );
      categoryRows.push({ id: res.rows[0].id, name: cat.name });
    }

    // ── Products ──
    // Price ranges: $5–$120 (realistic small store)
    console.log("Seeding products...");
    const productRows: ProductRow[] = [];
    const categoryMap = new Map(categoryRows.map((c) => [c.name, c.id]));

    for (const [catName, names] of Object.entries(PRODUCT_NAMES)) {
      const catId = categoryMap.get(catName)!;
      for (const productName of names) {
        const price = parseFloat(faker.commerce.price({ min: 5, max: 120, dec: 2 }));
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
      }
    }

    // ── Customers ──
    console.log("Seeding customers...");
    const customerRows: { id: number; segment: string }[] = [];
    const NO_REVIEW_CUSTOMER_IDS: number[] = [];

    function pickSegment(): string {
      const r = Math.random();
      let cumulative = 0;
      for (const seg of SEGMENTS) {
        cumulative += SEGMENT_WEIGHTS[seg];
        if (r <= cumulative) return seg;
      }
      return "Regular";
    }

    for (let i = 0; i < 200; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const segment = pickSegment();
      const state = faker.helpers.arrayElement(US_STATES);
      const createdDaysAgo = segment === "New"
        ? faker.number.int({ min: 1, max: 30 })
        : faker.number.int({ min: 60, max: 365 });
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

      // Last 15 customers will be "power buyers" with >10 orders and NO reviews
      if (i >= 185) {
        NO_REVIEW_CUSTOMER_IDS.push(custId);
      }
    }

    // ── Orders ──
    console.log("Seeding orders...");

    // Helper: pick products biased by segment
    function pickProducts(segment: string, count: number): ProductRow[] {
      if (segment === "VIP") {
        // VIP buys higher-priced items
        const expensive = productRows.filter((p) => p.price > 50);
        return faker.helpers.arrayElements(
          expensive.length >= count ? expensive : productRows,
          { min: 1, max: Math.min(count, expensive.length >= count ? expensive.length : productRows.length) },
        );
      }
      if (segment === "Budget") {
        const cheap = productRows.filter((p) => p.price < 35);
        return faker.helpers.arrayElements(
          cheap.length >= count ? cheap : productRows,
          { min: 1, max: Math.min(count, cheap.length >= count ? cheap.length : productRows.length) },
        );
      }
      return faker.helpers.arrayElements(productRows, {
        min: 1,
        max: Math.min(count, productRows.length),
      });
    }

    function pickQuantity(segment: string): number {
      if (segment === "VIP") return faker.number.int({ min: 2, max: 4 });
      if (segment === "Budget") return faker.number.int({ min: 1, max: 2 });
      return faker.number.int({ min: 1, max: 3 });
    }

    let totalOrders = 0;
    let totalItems = 0;
    const orderCustomerIds: number[] = [];

    // Phase 1: Spread ~1800 orders across past year (months 12..2 ago)
    // ~150 orders/month × 12 months
    const yearAgo = daysAgo(365);
    const threeMonthsAgo = daysAgo(90);

    for (let i = 0; i < 1800; i++) {
      const customer = faker.helpers.arrayElement(customerRows);
      const orderDate = randomDateBetween(yearAgo, threeMonthsAgo);
      const status = faker.helpers.arrayElement(ORDER_STATUSES);
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = pickProducts(customer.segment, itemCount);

      let orderTotal = 0;
      const items: { productId: number; quantity: number; unitPrice: number }[] = [];
      for (const product of selectedProducts) {
        const quantity = pickQuantity(customer.segment);
        const unitPrice = product.price;
        orderTotal += quantity * unitPrice;
        items.push({ productId: product.id, quantity, unitPrice });
      }
      orderTotal = parseFloat(orderTotal.toFixed(2));

      const orderRes = await client.query(
        "INSERT INTO orders (customer_id, status, total, created_at) VALUES ($1, $2, $3, $4) RETURNING id",
        [customer.id, status, orderTotal, orderDate],
      );
      totalOrders++;
      orderCustomerIds.push(customer.id);

      for (const item of items) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
          [orderRes.rows[0].id, item.productId, item.quantity, item.unitPrice],
        );
        totalItems++;
      }
    }

    // Phase 2: Dense orders in last 90 days — ensure good daily coverage
    // ~1200 orders in 90 days ≈ 13/day average
    for (let i = 0; i < 1200; i++) {
      const customer = faker.helpers.arrayElement(customerRows);
      const orderDate = randomDateBetween(threeMonthsAgo, new Date(NOW.getTime() - 1000));
      const status = faker.helpers.arrayElement(ORDER_STATUSES);
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = pickProducts(customer.segment, itemCount);

      let orderTotal = 0;
      const items: { productId: number; quantity: number; unitPrice: number }[] = [];
      for (const product of selectedProducts) {
        const quantity = pickQuantity(customer.segment);
        const unitPrice = product.price;
        orderTotal += quantity * unitPrice;
        items.push({ productId: product.id, quantity, unitPrice });
      }
      orderTotal = parseFloat(orderTotal.toFixed(2));

      const orderRes = await client.query(
        "INSERT INTO orders (customer_id, status, total, created_at) VALUES ($1, $2, $3, $4) RETURNING id",
        [customer.id, status, orderTotal, orderDate],
      );
      totalOrders++;
      orderCustomerIds.push(customer.id);

      for (const item of items) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
          [orderRes.rows[0].id, item.productId, item.quantity, item.unitPrice],
        );
        totalItems++;
      }
    }

    // Phase 3: Guarantee every single day in the last 30 days has at least 5 orders
    const noReviewSet = new Set(NO_REVIEW_CUSTOMER_IDS);
    const reviewableCustomers = customerRows.filter((c) => !noReviewSet.has(c.id));

    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const dayStart = daysAgo(dayOffset);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const ordersForDay = faker.number.int({ min: 5, max: 12 });

      for (let j = 0; j < ordersForDay; j++) {
        const customer = faker.helpers.arrayElement(customerRows);
        const orderDate = randomDateBetween(dayStart, dayEnd);
        const status = faker.helpers.arrayElement(ORDER_STATUSES);
        const itemCount = faker.number.int({ min: 1, max: 4 });
        const selectedProducts = pickProducts(customer.segment, itemCount);

        let orderTotal = 0;
        const items: { productId: number; quantity: number; unitPrice: number }[] = [];
        for (const product of selectedProducts) {
          const quantity = pickQuantity(customer.segment);
          const unitPrice = product.price;
          orderTotal += quantity * unitPrice;
          items.push({ productId: product.id, quantity, unitPrice });
        }
        orderTotal = parseFloat(orderTotal.toFixed(2));

        const orderRes = await client.query(
          "INSERT INTO orders (customer_id, status, total, created_at) VALUES ($1, $2, $3, $4) RETURNING id",
          [customer.id, status, orderTotal, orderDate],
        );
        totalOrders++;
        orderCustomerIds.push(customer.id);

        for (const item of items) {
          await client.query(
            "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
            [orderRes.rows[0].id, item.productId, item.quantity, item.unitPrice],
          );
          totalItems++;
        }
      }
    }

    // Phase 4: Create power buyers (customers with >10 orders but no reviews)
    console.log("Seeding power-buyer customers (orders without reviews)...");
    for (const custId of NO_REVIEW_CUSTOMER_IDS) {
      const numOrders = faker.number.int({ min: 11, max: 18 });
      for (let j = 0; j < numOrders; j++) {
        const orderDate = randomDateBetween(daysAgo(180), new Date(NOW.getTime() - 1000));
        const itemCount = faker.number.int({ min: 1, max: 3 });
        const selectedProducts = faker.helpers.arrayElements(productRows, {
          min: 1,
          max: Math.min(itemCount, productRows.length),
        });

        let orderTotal = 0;
        const items: { productId: number; quantity: number; unitPrice: number }[] = [];
        for (const product of selectedProducts) {
          const quantity = faker.number.int({ min: 1, max: 3 });
          const unitPrice = product.price;
          orderTotal += quantity * unitPrice;
          items.push({ productId: product.id, quantity, unitPrice });
        }
        orderTotal = parseFloat(orderTotal.toFixed(2));

        const orderRes = await client.query(
          "INSERT INTO orders (customer_id, status, total, created_at) VALUES ($1, $2, $3, $4) RETURNING id",
          [custId, "completed", orderTotal, orderDate],
        );
        totalOrders++;

        for (const item of items) {
          await client.query(
            "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
            [orderRes.rows[0].id, item.productId, item.quantity, item.unitPrice],
          );
          totalItems++;
        }
      }
    }

    // ── Reviews ──
    // Only create reviews for reviewable customers (NOT the power buyers)
    console.log("Seeding reviews...");
    let totalReviews = 0;
    const reviewedPairs = new Set<string>();

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

      await client.query(
        "INSERT INTO reviews (product_id, customer_id, rating, review_text, created_at) VALUES ($1, $2, $3, $4, $5)",
        [productId, customer.id, rating, reviewText, randomDateBetween(daysAgo(180), NOW)],
      );
      totalReviews++;
    }

    await client.query("COMMIT");
    console.log("\nSeeding complete!");
    console.log(`  Categories: ${CATEGORIES.length}`);
    console.log(`  Products:   ${productRows.length}`);
    console.log(`  Customers:  ${customerRows.length}`);
    console.log(`  Orders:     ${totalOrders}`);
    console.log(`  Order Items:${totalItems}`);
    console.log(`  Reviews:    ${totalReviews}`);
    console.log(`  No-review customers (>10 orders each): ${NO_REVIEW_CUSTOMER_IDS.length}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
