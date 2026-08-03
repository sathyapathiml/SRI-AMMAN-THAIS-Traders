# ☁️ Crackers Store POS - Cloud Deployment Guide (Option 1)

Your POS application is now **100% Cloud Ready**. The backend server serves both the SQLite Database API and the optimized React UI frontend from a single web service.

---

## 🎯 Option 1A: 1-Click Deployment on Render.com (100% FREE)

### Step 1: Upload Code to GitHub
1. Initialize Git repository and push your project to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Deploy Crackers POS Cloud"
   ```
2. Create a new repository on [GitHub](https://github.com/new) and push your code.

### Step 2: Deploy on Render
1. Go to **[Render.com](https://render.com)** and create a free account.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository.
4. Render will automatically detect `render.yaml` with the following configuration:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Deploy Web Service**.

### Step 3: Access your POS Cloud URL
Render will provide your unique 24/7 cloud URL (e.g. `https://crackers-billing-pos.onrender.com`).
You can now access your billing system from **any computer, tablet, or smartphone in the world**!

---

## 🐳 Option 1B: Docker Cloud Hosting (Railway, Fly.io, Google Cloud)
If using Docker, run:
```bash
docker build -t crackers-pos .
docker run -p 5000:5000 crackers-pos
```
Then visit `http://localhost:5000`.
