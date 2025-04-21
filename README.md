
# EnviroPlot

EnviroPlot is a tool designed to assist environmental consultants in preparing Phase II ESA reports in compliance with AS 4363.2-2004. It features data parsing, criteria comparison, geospatial mapping, and report generation.

---

## 📁 Project Structure

```
enviroplot/
├── apps/
│   ├── backend/              # Express.js backend with TypeScript
│   │   ├── controllers/      # Request handlers for routes
│   │   ├── dist/             # Compiled JavaScript output
│   │   ├── node_modules/     # Backend dependencies
│   │   ├── routes/           # Express routing logic
│   │   ├── services/         # Business logic layer
│   │   ├── src/              # Entry point and core app logic
│   │   ├── jest.config.js    # Jest test config
│   │   ├── jest.setup.js     # Test setup script
│   │   ├── tsconfig.json     # TypeScript configuration
│   │   ├── tsconfig.test.json# TypeScript test config
│   │   ├── package.json      # Backend scripts and dependencies
│   │   └── README.md         # Backend-specific documentation
│   └── frontend/             # React + Next.js frontend with Supabase Auth, Tailwind, and GIS viewer
│       ├── components/       # Reusable layout and UI components
│       ├── lib/              # Supabase client and utility functions
│       ├── pages/            # Next.js pages (routing)
│       ├── public/           # Static assets
│       ├── styles/           # Tailwind and global CSS
│       ├── __tests__/        # Frontend component tests
│       ├── postcss.config.js # PostCSS setup for Tailwind
│       ├── tailwind.config.js# Tailwind CSS config
│       ├── next.config.js    # Next.js config with backend proxy
│       ├── tsconfig.json     # Frontend TypeScript config
│       └── package.json      # Frontend dependencies and scripts
├── packages/
│   └── shared-types/         # Shared TypeScript types for reuse
├── .env                      # Shared environment variables
├── .env.backend              # Backend-specific environment variables
├── .env.frontend             # Frontend-specific environment variables
└── README.md                 # Project-wide documentation
```

---

## ⚙️ Backend Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
cd apps/backend
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Testing
```bash
npm test
```

### Available Scripts
- `dev`: Start in development mode with live reloading.
- `build`: Compile TypeScript files into `/dist`.
- `start`: Run the compiled JavaScript files.
- `test`: Run unit tests with Jest.
- `lint`: Lint the TypeScript codebase.

---

## 🔜 Next Steps

- Implement frontend (React + Next.js)
- Connect Supabase for auth and storage
- Integrate Stripe for payments
- Add Mapbox for GIS mapping
- Enable ESdat file parsing and criteria matching


---

## 🌐 Frontend Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
cd apps/frontend
npm install
```

### Development
```bash
npm run dev
```

> The frontend runs on http://localhost:3000 and proxies API requests to the backend via `NEXT_PUBLIC_BACKEND_API_URL`.

---

## 📦 Environment Configuration

This project uses a **single unified `.env` file** at the root (`/enviroplot/.env`) shared across both frontend and backend.

```env
# Backend
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
MAPBOX_TOKEN=your-mapbox-token

# Frontend-exposed
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api
```

Load this file using `dotenv` in backend and through `next.config.js` in the frontend.

---

## 🧪 Testing

Each app (`backend`, `frontend`) includes its own Jest configuration.

To test frontend:

```bash
cd apps/frontend
npm run test
```

To test backend:

```bash
cd apps/backend
npm run test
```

---

## ✅ Tech Stack & Tools

- **Backend:** Express.js, TypeScript, Jest
- **Frontend:** Next.js, React, Tailwind CSS, Supabase, Mapbox
- **Dev Tools:** dotenv, Jest, ts-node, ExcelJS
- **CI/CD:** Planned for future (Vercel + Render)
