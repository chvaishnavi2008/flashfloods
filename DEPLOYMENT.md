# AapdaSetu — Deployment Guide 🚀

This repository is ready to be deployed to the cloud for free using any of the following methods:

---

## ⚡ Option 1: Render.com (Recommended — 100% Free Full-Stack Single Link)

Render allows you to host the entire React Frontend + Python Backend as a **single web service** with an automatic HTTPS URL (`https://aapdasetu.onrender.com`).

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy AapdaSetu prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/aapdasetu.git
   git push -u origin main
   ```
2. Go to **[render.com](https://render.com/)** and sign in with GitHub.
3. Click **"New +"** $\rightarrow$ **"Web Service"**.
4. Select your **`aapdasetu`** GitHub repository.
5. Configure the settings:
   * **Name**: `aapdasetu`
   * **Runtime**: `Python 3`
   * **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   * **Start Command**:
     ```bash
     cd backend && gunicorn app:app
     ```
   * **Instance Type**: `Free`
6. Click **"Deploy Web Service"**.
7. Once deployed, Render will provide you with a live HTTPS URL!

---

## ⚡ Option 2: Railway.app (Free & Instant Container Deploy)

1. Go to **[railway.app](https://railway.app/)** and sign in with GitHub.
2. Click **"New Project"** $\rightarrow$ **"Deploy from GitHub repo"**.
3. Select your repository. Railway will automatically detect the `Dockerfile` and build both the React frontend and Flask backend in under 2 minutes.
4. Click **"Generate Domain"** under service settings to get your live public URL.

---

## ⚡ Option 3: Vercel (Frontend) + Render (Backend)

If you prefer hosting the React frontend on **Vercel**:
1. **Deploy Backend on Render**:
   - Create a Web Service for `backend/` on Render with build `pip install -r requirements.txt` and start `gunicorn app:app`.
   - Copy your backend URL (e.g. `https://pralaywatch-api.onrender.com`).
2. **Deploy Frontend on Vercel**:
   - Go to **[vercel.com](https://vercel.com/)** $\rightarrow$ **"Add New Project"**.
   - Set **Root Directory** to `frontend`.
   - Add Environment Variable:
     * `VITE_API_URL` = `https://pralaywatch-api.onrender.com/api`
   - Click **Deploy**.

---

## ⚡ Option 4: Instant Public Live URL for Presentations (Localtunnel / Cloudflared)

If you want an immediate public HTTPS link on your phone or for an SIH jury presentation without waiting for cloud builds:

### Using Cloudflare Tunnels (No installation needed):
```bash
npx localtunnel --port 3000
```
This gives you an instant public HTTPS URL (e.g. `https://famous-tiger-42.loca.lt`) that you can open on any mobile phone, tablet, or jury laptop!
