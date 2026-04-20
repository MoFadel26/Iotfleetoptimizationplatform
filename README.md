# IoT Fleet Optimization Platform

This is a code bundle for the IoT Fleet Optimization Platform. The original project is available at https://www.figma.com/design/jfT8USyWAXUG2G8Y8PPwwR/IoT-Fleet-Optimization-Platform.

## Setup

1. Install Node dependencies:
   ```
   npm install
   ```
2. Install Python dependencies (Flask backend):
   ```
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `HERE_API_KEY` — your HERE Maps API key (used by the server-side `/api/geocode` proxy)

## Running the project

The app needs **two terminals**:

```
# Terminal 1 — backend (Flask, port 5001)
python optimizer_api.py

# Terminal 2 — frontend (Vite dev server)
npm run dev
```

Vite proxies `/api/*` and `/optimizer/*` to the Flask backend on `localhost:5001`, so both must be running for the dashboard, route-planner test page, and geocoding to work.
