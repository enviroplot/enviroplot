
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
│   └── frontend/             # React frontend (currently empty)
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
