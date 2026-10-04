# Deployment Guide (Under 5 Minutes)

Deploy this fullstack application with automated CI/CD and an isolated database in minutes.

---

## Local Development (Docker-Compose)

If you want to test the entire stack locally with a single command:

```bash
docker-compose up --build
```
Your frontend & API will now be listening on `http://localhost:10000`.

---

## Production Deployment to Render

### Prerequisites
1. A [Render Account](https://render.com/).
2. A free [MongoDB Atlas Database URL](https://www.mongodb.com/cloud/atlas) (Render databases default to Postgres; using MongoDB Atlas ensures persistent MongoDB storage on Render's free tier).

### Step-by-step Setup

1. **Push Code to GitHub**
   Create a new repository on GitHub and push this codebase:
   ```bash
   git init
   git add .
   git commit -m "chore: configuration for deployment"
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render**
   * Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
   * Connect your GitHub Repository.
   * Render will parse the `render.yaml` file automatically.
   * Replace the `MONGO_URI` connection string parameter in the UI with your **MongoDB Atlas connection string**.
   * Click **Approve** to deploy.

3. **Enable CI/CD Pipeline (Automated Deployments)**
   * Retrieve your **Service ID** from your Render service settings URL (e.g., `srv-xxxxxxxxxxxxxxxx`).
   * Retrieve your **API Key** from Render Account Settings -> **API Keys**.
   * Add these keys to your GitHub repository under **Settings** -> **Secrets and variables** -> **Actions**:
     * `RENDER_SERVICE_ID`
     * `RENDER_API_KEY`

Every push to your main branch will now automatically build, test, and deploy securely with zero-downtime!