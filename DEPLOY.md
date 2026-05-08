# How to Put This Project on the Web

This guide explains, in plain language, how to publish this project so anyone with a link can open it in their browser. No coding required.

---

## What This Project Is

A full-stack web app: a **React (Vite) frontend** for visualizing fleet data, plus a **Python (Flask) backend** that runs route optimization and talks to a MongoDB database.

---

## Recommended Platform

**[Render](https://render.com)** — free tier, and it can host both the frontend (static site) **and** the Python backend in one place. Vercel/Netlify can't run the Python backend, and GitHub Pages can't run code at all, so Render is the only single-platform free option that fits this project.

You will create **two services** on Render from the same GitHub repo:

1. A **Web Service** for the Python backend (`optimizer_api.py`)
2. A **Static Site** for the React frontend (the `dist/` folder built by Vite)

You'll also need a free **MongoDB Atlas** database and a free **HERE Maps** API key (the backend already expects both).

---

## One-Time Setup (do this once)

### Step 1 — Push the code to GitHub

If the project isn't already on GitHub, create a new repo at <https://github.com/new> and upload this folder to it. Render reads code from GitHub.

### Step 2 — Fix one file before you deploy

Open `vite.config.ts` in any text editor. Near the top you'll see lines that read `key.pem` and `cert.pem`. Those files only exist on the developer's laptop and will crash the build on Render. Replace the whole `server: { ... }` block with this empty version:

```ts
server: {},
```

Save the file and push the change to GitHub. (You can skip this step if someone else has already done it.)

### Step 3 — Create a free MongoDB Atlas database

1. Sign up at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a free **M0** cluster (any region is fine).
3. Under **Database Access**, create a username and password — write them down.
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `USERNAME` and `PASSWORD` with the ones you just created. Save this string for Step 5.

### Step 4 — Get a free HERE Maps API key

1. Sign up at <https://platform.here.com/>.
2. Create a new project and generate an **API Key**.
3. Save the key for Step 5.

### Step 5 — Deploy the Python backend on Render

1. Sign up at <https://render.com> using your GitHub account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and pick this repository.
4. Fill in these settings exactly:
   - **Name:** `fleet-optimizer-api` (or anything you like)
   - **Region:** pick the one closest to you
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn optimizer_api:app --bind 0.0.0.0:$PORT`
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add three:
   - `MONGO_URI` → the connection string from Step 3
   - `MONGO_DB` → `fleet_optimizer`
   - `HERE_API_KEY` → the key from Step 4
6. Click **Create Web Service**. Wait ~3–5 minutes for the first build to finish.
7. When it's live, copy the URL at the top of the page — it looks like `https://fleet-optimizer-api.onrender.com`. **Save this.**

> Note: `gunicorn` isn't currently in `requirements.txt`. Add a new line `gunicorn>=21.0` to `requirements.txt` and push to GitHub before this step, otherwise the start command will fail.

### Step 6 — Deploy the React frontend on Render

1. Back on Render, click **New +** → **Static Site**.
2. Pick the same GitHub repository.
3. Fill in these settings:
   - **Name:** `fleet-optimizer-web` (or anything you like)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` → the backend URL from Step 5 (e.g. `https://fleet-optimizer-api.onrender.com`)
5. Under **Redirects/Rewrites** (or "Add Rule"), add one rule so React Router works:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
6. Click **Create Static Site** and wait ~3–5 minutes.

---

## Sharing the Link

Once the static site finishes building, Render shows a public URL at the top of the page — something like `https://fleet-optimizer-web.onrender.com`. Click it to confirm the app loads, then copy and paste that URL into Slack/email/etc. Anyone with the link can open it in their browser. No login needed unless you add one.

---

## Updating the Site

Every time someone pushes new code to the `main` branch on GitHub, Render automatically rebuilds and redeploys both services within a few minutes. No manual steps needed.

---

## Troubleshooting

**1. Build fails with "Cannot find module 'fs'" or "ENOENT: no such file or directory, open 'key.pem'"**
You skipped Step 2. Open `vite.config.ts`, replace the `server: { ... }` block with `server: {},`, push to GitHub, and Render will rebuild.

**2. Backend deploy fails with "gunicorn: command not found"**
Add `gunicorn>=21.0` as a new line in `requirements.txt`, push to GitHub, and Render will rebuild. Gunicorn is the production server that runs the Flask app.

**3. The site loads but shows "Network Error" or the map/data is blank**
The frontend can't reach the backend. Check that `VITE_API_BASE_URL` on the static site matches the backend URL exactly (including `https://`, no trailing slash). Also confirm the backend service is "Live" (green dot) on the Render dashboard. Free Render backends sleep after 15 minutes of inactivity — the first request after a nap takes ~30 seconds to wake up.

**4. Backend logs show "ServerSelectionTimeoutError" or "Authentication failed"**
MongoDB can't connect. Re-check `MONGO_URI` for typos, make sure you replaced `USERNAME`/`PASSWORD` with real values, and confirm Network Access in Atlas allows `0.0.0.0/0`.

**5. Refreshing a page like `/dashboard` shows "Not Found"**
You skipped the rewrite rule in Step 6.5. Add a rewrite from `/*` to `/index.html` in the static site's Redirects/Rewrites settings.
