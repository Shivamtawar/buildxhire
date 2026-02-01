# Deployment Guide - BuildxHire on Render

## Prerequisites
- Render account (https://render.com)
- GitHub repository with your code
- GROQ_API_KEY from Groq

## Deployment Steps

### 1. Push Code to GitHub
Ensure all changes are committed and pushed:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** and select **"Web Service"**
3. **Connect your GitHub repository**:
   - Search for your repo
   - Select the repository
   - Click "Connect"

4. **Configure the Web Service**:
   - **Name**: `buildxhire` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && cd frontend && npm install && npm run build && cd ..`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free` (or paid if you want better performance)

### 3. Add Environment Variables
In the Render dashboard for your service:

1. Go to **Environment** section
2. Add the following environment variable:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `your-actual-groq-api-key`
3. Click "Save"

### 4. Deploy
1. Click **"Create Web Service"**
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 3-5 minutes)
4. Once deployed, you'll get a URL like: `https://buildxhire.onrender.com`

## Project Structure
```
buildxhire/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies (includes gunicorn)
├── Procfile              # Render process configuration
├── frontend/
│   ├── src/              # React source code
│   ├── dist/             # Built React app (served by Flask)
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## How It Works

1. **Build Process**: When you push to GitHub, Render:
   - Installs Python dependencies from `requirements.txt`
   - Installs Node dependencies from `frontend/package.json`
   - Builds the React app to `frontend/dist/`

2. **Runtime**: The Flask app:
   - Serves the built React files from `frontend/dist/`
   - Handles all API requests to `/resume/*` and `/interview/*` endpoints
   - Uses environment variable `PORT` (Render sets this automatically)

3. **Client Routing**: React Router handles client-side navigation, and the Flask fallback route ensures all routes serve `index.html`

## Important Notes

- ✅ **Frontend and Backend**: Both are now in ONE repository and deployed as ONE service
- ✅ **No CORS needed**: Frontend is served from the same origin as the backend
- ✅ **Static files optimized**: Vite builds a production-optimized bundle
- ✅ **Automatic SSL**: Render provides free HTTPS

## Troubleshooting

### Build fails with "npm not found"
- Render detects Node.js from the presence of `frontend/package.json`
- Make sure it's in the correct location

### 404 errors on refresh
- This is normal behavior and Flask will serve `index.html` for all unknown routes
- React Router will handle the client-side navigation

### API calls returning 404
- Make sure your API endpoints in the frontend point to `/api/resume/*` or the actual endpoint paths
- Verify GROQ_API_KEY is set in Environment variables

### Deployment hangs
- Check that the build command is correct
- Verify `frontend/dist/` is not in `.gitignore` (it's not with the provided .gitignore)
- Wait a bit longer - first deployments sometimes take time

## Redeploy

To redeploy after making changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically detect the push and redeploy.

## Free Tier Limits

- **Auto-sleep**: Service goes to sleep after 15 minutes of inactivity (spins up on next request)
- **Build time**: Limited to 30 minutes
- **Storage**: 0.5GB
- **Bandwidth**: Fair use policy

For production, consider upgrading to a paid plan for faster builds and no auto-sleep.
