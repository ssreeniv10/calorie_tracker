# 🚀 FitTracker Vercel Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at https://vercel.com
3. **MongoDB Atlas**: Set up cloud database (see MongoDB Atlas Setup section)

## 🔧 Deployment Steps

### Step 1: Setup MongoDB Atlas (Required)

Since Vercel is serverless, you need a cloud database:

1. Go to https://www.mongodb.com/atlas
2. Create a free account and new project
3. Create a cluster (choose M0 Sandbox - Free tier)
4. Create a database user with read/write permissions
5. Add network access (0.0.0.0/0 for all IPs)
6. Get your connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fittracker?retryWrites=true&w=majority
   ```

### Step 2: Deploy to Vercel

1. **Import Project**:
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: Other
   - Root Directory: Leave blank (/)
   - Build Command: `cd frontend && yarn build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && yarn install`

3. **Environment Variables**:
   Add these in Vercel dashboard > Settings > Environment Variables:
   
   ```env
   # Database
   MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fittracker?retryWrites=true&w=majority
   
   # JWT Security
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # USDA API
   USDA_API_KEY=Nd8DOm1qWuH1Y2S7OLiXuvOjdsT1d38zYj4UlCMd
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like: https://your-app-name.vercel.app

### Step 3: Update Frontend Environment

After deployment, update your frontend environment variable:

1. In Vercel dashboard, go to Settings > Environment Variables
2. Add/Update:
   ```env
   REACT_APP_BACKEND_URL=https://your-app-name.vercel.app
   ```

3. Redeploy the project

## 📁 Project Structure for Vercel

```
your-repo/
├── api/                    # Backend API (Python/FastAPI)
│   ├── index.py           # Main API file
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/              # React source code
│   ├── public/           # Static files
│   ├── package.json      # Node.js dependencies
│   └── .env              # Environment variables
├── vercel.json           # Vercel configuration
└── .vercel/              # Vercel settings
    └── project.json      # Build configuration
```

## 🔧 Key Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/$1"
    }
  ]
}
```

## 🌐 How It Works

1. **Frontend**: React app served as static files from `/frontend/build`
2. **Backend**: Python/FastAPI serverless functions from `/api`
3. **Database**: MongoDB Atlas cloud database
4. **Routing**: 
   - `/api/*` → Backend serverless functions
   - Everything else → React frontend

## 🛠️ Troubleshooting

### Issue: API calls failing
- Check environment variables are set in Vercel dashboard
- Verify MONGO_URL connection string is correct
- Check CORS settings allow your Vercel domain

### Issue: Frontend routes not working
- Ensure 404.html is in `/frontend/public/`
- Check vercel.json routing configuration

### Issue: Build fails
- Check build command: `cd frontend && yarn build`
- Verify all dependencies are listed in package.json
- Check Python dependencies in `api/requirements.txt`

### Issue: Database connection errors
- Verify MongoDB Atlas network access allows all IPs
- Check database user has proper permissions
- Ensure connection string includes database name

## 🚀 Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Environment variables set in Vercel dashboard
- [ ] CORS settings updated for production domain
- [ ] JWT secret key changed from default
- [ ] All API endpoints tested
- [ ] React routing works on all pages
- [ ] Mobile responsive design verified

## 📊 Performance Benefits

- **Global CDN**: React app served from Vercel's global edge network
- **Serverless Backend**: Auto-scaling API with zero server management
- **Fast Cold Starts**: Optimized Python runtime for quick function startup
- **Automatic HTTPS**: SSL certificates and security handled automatically

## 📝 Notes

- **Serverless Functions**: Each API call runs in a separate serverless function
- **Connection Pooling**: MongoDB connections are handled per function invocation
- **Environment Variables**: All secrets managed securely in Vercel dashboard
- **Automatic Deploys**: Connected to GitHub for automatic deployment on push

Your FitTracker app is now ready for production with global performance and scalability! 🎉