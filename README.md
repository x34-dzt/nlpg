# NLP-PG

A conversational BI platform — ask questions in plain English, get instant SQL queries, visualizations, and dashboards from any PostgreSQL database.

## How It Works

1. **Connect a database** — paste a connection string and you're in. A pre-seeded ecommerce demo database is available to try immediately.
2. **Ask anything** — type questions like _"top 10 customers by revenue last month"_ or _"compare quarterly sales by category"_
3. **Get answers** — the platform generates SQL, runs it, and streams back a reasoning trace, plain-English summary, auto-generated chart, and the raw SQL and data on separate tabs.
4. **Refine** — ask follow-up questions with full context preserved.
5. **Build dashboards** — pin any result as a widget, drag to rearrange, share via link.

## Features

| Feature                 | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| Natural Language to SQL | Type questions, get SQL + results + charts streamed back in real time     |
| Smart Schema Analysis   | Auto-introspects tables, columns, types, foreign keys on connect          |
| Auto Visualizations     | Detects result shape and picks the right chart — switch types manually    |
| Conversational Context  | Full conversation history maintained for follow-up refinement             |
| Ad-Hoc Dashboards       | Pin results as widgets, drag/resize to arrange, share via public link     |
| Query Safety            | Destructive queries blocked, 100 row cap, 30 second timeout               |
| Multi-Model LLM         | Google Gemini (primary) or OpenRouter (fallback) — bring your own API key |
| Pre-Seeded Demo         | 10K+ orders, 200 customers, 84 products — ready to query instantly        |

## User Interface

Each database connection opens a sidebar with **Chat**, **Dashboard**, and **Schema** tabs, plus an **API Key** button at the bottom.

### Chat

Ask questions in plain English. The response streams back with:

- **Reasoning trace** — auto-expands while the LLM thinks, then collapses under "Thought process" so you can peek at the approach
- **Plain-English summary** — rendered as markdown after the LLM sees the query results
- **Query Result card** — shows the data with:
  - **Header** — query duration badge, row count badge, and a **Pin** button to save to dashboard
  - **Three tabs**:
    - **Chart** — auto-detected visualization (bar, line, area, pie, scatter, or table based on column types). A dropdown next to the tabs lets you switch chart types on the fly
    - **SQL** — the raw SQL query that was executed, in a scrollable code block
    - **Data** — the raw result rows in a table view
- On errors, a red-bordered card shows the error message instead

Follow up on any answer — full conversation history is preserved, so _"now show only Electronics"_ or _"break that down by week"_ works naturally.

### Pinning to Dashboard

Every Query Result card has a **Pin** button in the header. Clicking it opens a dialog where you:

1. Give the widget a **title** (required)
2. Pick a **chart type** override (defaults to the current chart type)
3. Pick a **size preset** — Half (6x4), Full (12x4), Tall Half (6x8), or Tall Full (12x8)

The widget is saved and immediately appears on the Dashboard tab.

### Dashboard

Displays all pinned widgets in a **draggable, resizable grid** (12-column on desktop, 8 on tablet, 4 on mobile):

- **Drag** widgets by the handle (top-left grip icon) to rearrange
- **Resize** by dragging the bottom-right corner
- **Remove** widgets with the X button on each card (turns red on hover)
- Layout changes auto-save after 200ms of inactivity

**Share** — click the Share button to generate a public link. Anyone with the URL sees a read-only version of your dashboard (no drag, resize, or delete). Click "Stop Sharing" to revoke access.

### Schema

Auto-generated summary of every table in your database:

- Tables displayed as cards in a 2-column grid
- Each card shows: table name, column count badge, and every column with:
  - Column name (mono font)
  - Data type (color-coded: blue = integers, green = numerics, purple = strings, amber = booleans, orange = dates)
  - "req" label for NOT NULL columns
  - Default values (shown as "auto" for serial/auto-generated)
  - Foreign key indicators (link icon pointing to the referenced table.column)
- Filter tables by name with the search input at the top

### API Key

Click **"API Key"** in the sidebar footer to provide your own Google Generative AI API key. Without one, a free default model is used. Your key is stored locally in the browser (never sent to our servers) and included with each request as a header.

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Runtime   | Bun                                          |
| Backend   | Elysia, Drizzle ORM                          |
| Frontend  | Next.js 16, React 19, Tailwind CSS 4         |
| Charts    | Recharts                                     |
| Dashboard | react-grid-layout                            |
| UI        | shadcn/ui, Radix UI                          |
| LLM       | Google Gemini / OpenRouter via Vercel AI SDK |
| Database  | PostgreSQL                                   |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1+
- PostgreSQL 14+
- A Google AI or OpenRouter API key

### Setup

```bash
git clone <repo-url> && cd nlpg

# Backend
cd backend
cp .env.example .env     # fill in your values
bun install
bun run db:migrate       # create app tables
bun run db:seed-demo     # populate demo database
bun run dev              # starts on port 3001

# Frontend (separate terminal)
cd frontend
cp .env.example .env     # set NEXT_PUBLIC_API_URL=http://localhost:3001
bun install
bun run dev              # starts on port 3000
```

Register an account, click **New** to add your demo database connection, start chatting.

### Environment Variables

**Backend** (`.env`):

| Variable                       | Description                                     |
| ------------------------------ | ----------------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL connection for the app database      |
| `DEMO_DB_URL`                  | PostgreSQL connection for the demo ecommerce DB |
| `JWT_SECRET`                   | Secret for JWT token signing                    |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI key for Gemini (or provide via UI)    |
| `OPENROUTER_API_KEY`           | OpenRouter fallback key                         |
| `PORT`                         | Server port (default: 3001)                     |

**Frontend** (`.env`):

| Variable              | Description                                |
| --------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:3001`) |

## Docker

```bash
docker build -t nlpg-backend backend/
docker run -d -p 3001:3001 \
  -e DATABASE_URL="postgres://..." \
  -e DEMO_DB_URL="postgres://..." \
  -e JWT_SECRET="..." \
  -e GOOGLE_GENERATIVE_AI_API_KEY="..." \
  nlpg-backend
```

## Demo Database

The seed script generates a realistic ecommerce dataset using Faker.js:

| Table         | Rows | Contents                                                             |
| ------------- | ---- | -------------------------------------------------------------------- |
| `categories`  | 6    | Electronics, Clothing, Food & Beverage, Books, Sports, Home & Garden |
| `products`    | 84   | Products with price, cost, stock across categories                   |
| `customers`   | 200  | Customers with city, state, country, segment                         |
| `orders`      | 10K+ | Orders spanning 12 months with status and totals                     |
| `order_items` | ~30K | Line items with quantity and unit price                              |
| `reviews`     | ~800 | Product reviews with 1-5 star ratings                                |

## Example Queries

| Question                                            | Chart |
| --------------------------------------------------- | ----- |
| "Top 5 products by revenue last month?"             | Bar   |
| "Order count by day for the past 30 days?"          | Area  |
| "Customers with 10+ orders but no reviews?"         | Table |
| "Revenue by category this quarter vs last quarter?" | Bar   |
| "Average order value by customer segment?"          | Pie   |

## Project Structure

```
nlpg/
├── backend/
│   ├── src/
│   │   ├── domains/          # user, connections, conversations, widgets, public
│   │   ├── packages/
│   │   │   ├── ai/           # LLM client, system prompt, schema inspector, SQL tool
│   │   │   ├── infra/db/     # Drizzle schema & migrations
│   │   │   └── pool/         # Connection manager, query runner, schema cache
│   │   ├── guard/            # Auth, connection, conversation, widget guards
│   │   └── lib/              # JWT, HTTP helpers, errors
│   └── scripts/seed-demo.ts
└── frontend/
    ├── app/                  # Next.js App Router (auth, app, public route groups)
    ├── components/
    │   ├── charts/           # Bar, line, area, pie, scatter, table + auto-detection
    │   ├── chat/             # Panel, messages, input, API key dialog
    │   ├── dashboard/        # Grid layout, widget cards, save dialog
    │   ├── connections/      # Connection cards, schema viewer, add dialog
    │   └── ui/               # shadcn/ui primitives
    ├── hooks/                # React Query hooks
    ├── interfaces/           # TypeScript types
    ├── lib/                  # Chart detection, utils
    └── services/             # Axios API client
```


