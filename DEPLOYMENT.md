# 🚀 FitTracker Deployment Guide

## 📋 Prerequisites

- Node.js and yarn installed
- Git repository on GitHub
- GitHub account with Pages enabled

## 🔧 GitHub Pages Deployment

### Step 1: Setup GitHub Repository
1. Create a new repository on GitHub named `fittracker`
2. Clone the repository to your local machine
3. Copy all the FitTracker files to your local repository

### Step 2: Configure for Your Repository
Update the homepage URL in `/frontend/package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/fittracker"
```
Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Backend Configuration
Since GitHub Pages only hosts static content, you need to deploy the backend separately:

#### Option 1: Keep Current Cloud Backend (Recommended)
Update `/frontend/.env`:
```env
REACT_APP_BACKEND_URL=https://f21da611-9add-4dfc-8287-1dc23aabf642.preview.emergentagent.com
```

#### Option 2: Deploy Backend to Heroku/Railway/Render
1. Deploy the `/backend` folder to your preferred hosting service
2. Update `/frontend/.env` with your backend URL:
```env
REACT_APP_BACKEND_URL=https://your-backend-app.herokuapp.com
```

### Step 4: Deploy to GitHub Pages
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Deploy to GitHub Pages
yarn deploy
```

### Step 5: Enable GitHub Pages
1. Go to your GitHub repository
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Select source as "Deploy from a branch"
5. Select branch as "gh-pages"
6. Click "Save"

## 🌐 Access Your App
Your app will be available at:
```
https://YOUR_USERNAME.github.io/fittracker
```

## 🔄 Update Deployment
To update your app:
```bash
# Make your changes
# Then deploy again
yarn deploy
```

## 📁 File Structure for GitHub Pages
```
your-repo/
├── frontend/          # React app (this gets deployed to GitHub Pages)
├── backend/           # FastAPI backend (deploy separately)
├── README.md          # This deployment guide
└── .gitignore         # Git ignore file
```

## 🛠️ Troubleshooting

### Issue: Routes not working
- Make sure 404.html is in `/frontend/public/`
- Check that basename is set correctly in App.js

### Issue: API calls failing
- Verify REACT_APP_BACKEND_URL in .env
- Ensure backend is deployed and accessible
- Check CORS configuration in backend

### Issue: Build fails
- Run `yarn install` in frontend directory
- Check for any missing dependencies

## 🚀 Production Checklist
- [ ] Update homepage URL in package.json
- [ ] Configure backend URL in .env
- [ ] Deploy backend to hosting service
- [ ] Test all features after deployment
- [ ] Enable HTTPS on backend (required for production)

## 📝 Notes
- GitHub Pages serves only static content
- Backend must be hosted separately (Heroku, Railway, Render, etc.)
- All API routes must be prefixed with '/api' for proper routing
- USDA API key is included in backend configuration