# EnviroPlot Backend

This is the Express-based backend server for the EnviroPlot Phase II ESA tool, supporting Supabase integration, Excel parsing/export, GIS data, and Stripe payments.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Create a `.env` File

Copy the example below and update with your actual keys:

```env
PORT=5000

# Supabase settings
SUPABASE_URL=https://homnplhtmvdfxcqcjelr.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe and Mapbox
STRIPE_SECRET_KEY=sk_test_your_stripe_key
MAPBOX_TOKEN=pk.your_mapbox_token
```

### 🔑 Where to Find These Keys

- **Supabase**:  
  Visit [app.supabase.com](https://app.supabase.com), go to your project → Settings → API  
  - Use `anon` key for public access/auth  
  - Use `service_role` key for admin tasks (e.g. deleting users)

- **Stripe**:  
  Get your secret test key from [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys)

- **Mapbox**:  
  Create a token at [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/)

---

### 3. Run the Server

```bash
npm run dev
```

or

```bash
node server.js
```

### ✅ Check if the server is running

Visit: [http://localhost:5000](http://localhost:5000)

You should see:

```json
{
  "status": "ok",
  "message": "API is healthy"
}
```

---

## 🧪 Running Tests

We use **Jest** and **Supertest**.

```bash
npm test
```

Tests include:
- Health check
- ESdat parse
- Excel export
- Stripe webhook
- Supabase DB connection
- Supabase authentication (signup, login, delete)

---

## 📂 Project Structure

```
enviroplot-backend/
├── controllers/       # API logic
├── routes/            # Route definitions
├── services/          # Supabase and other service connectors
├── tests/             # Jest + Supertest files
├── app.js             # Express app config
├── server.js          # Entrypoint
├── .env               # Environment secrets
├── jest.setup.js      # Jest ENV bootstrap
└── README.md
```

---

## 📮 API Endpoints

- `GET /` – Health check
- `POST /api/parse-esdat` – File parsing (ESdat)
- `POST /api/export-excel` – Excel export
- `POST /api/stripe-webhook` – Stripe webhook listener

---

## ✅ Next Steps

- Add sample data to Supabase tables (projects, chemicals, samples)
- Connect to frontend (React + Mapbox)
- Add CSV parsing logic and criteria matching

---

Happy hacking ⚗️🌏
