# 🚀 Vercel Deployment Checklist - FitTracker

## ✅ Pre-deployment Status

### 🔧 Configuration Files
- ✅ `vercel.json` - Full-stack deployment configuration
- ✅ `api/index.py` - FastAPI converted to serverless functions  
- ✅ `api/requirements.txt` - Python dependencies including mangum
- ✅ `frontend/package.json` - Updated for Vercel (removed GitHub Pages)
- ✅ `frontend/build/` - React app builds successfully
- ✅ `.env.production` - Production environment variables ready

### 🗄️ Database Setup
- ⚠️ **MongoDB Atlas Connection** - REQUIRES FIXING
  - Connection string provided but authentication failed
  - See `MONGODB_FIX_REQUIRED.md` for troubleshooting steps
  - Run `python test_mongo.py` to test connection

### 🔑 Environment Variables Ready
```env
MONGO_URL="mongodb+srv://bkedhar:bkedhar@cluster0.fopy2lh.mongodb.net/fittracker?retryWrites=true&w=majority"
JWT_SECRET_KEY="your-super-secret-jwt-key-bkedhar-2024"  
USDA_API_KEY="Nd8DOm1qWuH1Y2S7OLiXuvOjdsT1d38zYj4UlCMd"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="30"
REACT_APP_BACKEND_URL=""
```

## 🎯 Deployment Steps

### Step 1: Fix MongoDB Atlas (CRITICAL)
1. **Go to MongoDB Atlas dashboard**
2. **Verify database user credentials**:
   - Username: `bkedhar`  
   - Password: `bkedhar`
   - Permissions: Read and write to any database
3. **Check network access**: Allow 0.0.0.0/0
4. **Test connection**: Run `python test_mongo.py`

### Step 2: Deploy to Vercel
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Vercel deployment ready"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**:
   - Framework Preset: Other
   - Root Directory: `/` (leave blank)
   - Build Command: `cd frontend && yarn build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && yarn install`

### Step 3: Add Environment Variables in Vercel
**Go to Project Settings > Environment Variables and add:**

| Name | Value | Environments |
|------|-------|--------------|
| `MONGO_URL` | `mongodb+srv://bkedhar:bkedhar@cluster0.fopy2lh.mongodb.net/fittracker?retryWrites=true&w=majority` | Production, Preview, Development |
| `JWT_SECRET_KEY` | `your-super-secret-jwt-key-bkedhar-2024` | Production, Preview, Development |
| `USDA_API_KEY` | `Nd8DOm1qWuH1Y2S7OLiXuvOjdsT1d38zYj4UlCMd` | Production, Preview, Development |
| `ALGORITHM` | `HS256` | Production, Preview, Development |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Production, Preview, Development |

### Step 4: Deploy and Test
1. **Trigger deployment** (should happen automatically)
2. **Test endpoints**:
   - `https://your-app.vercel.app/` - Frontend
   - `https://your-app.vercel.app/api/health` - Backend health check
3. **Test full functionality**:
   - User registration
   - Login
   - Food search
   - Dashboard

## 🔍 Testing Checklist

### API Endpoints to Test:
- [ ] `GET /api/health` - Health check
- [ ] `POST /api/register` - User registration  
- [ ] `POST /api/login` - User login
- [ ] `GET /api/profile` - User profile
- [ ] `GET /api/foods/search?query=chicken` - Food search
- [ ] `POST /api/food-entries` - Log food
- [ ] `GET /api/food-entries?date=2024-07-20` - Get food entries
- [ ] `GET /api/dashboard?date=2024-07-20` - Dashboard data

### Frontend Features to Test:
- [ ] Landing page loads
- [ ] Registration form works
- [ ] Login form works  
- [ ] Dashboard displays data
- [ ] Food search and logging
- [ ] Weight tracking
- [ ] Profile management
- [ ] Mobile responsive design

## 🚨 Common Issues & Solutions

### MongoDB Connection Issues
- **Authentication failed**: Check username/password in Atlas
- **Network timeout**: Verify network access allows 0.0.0.0/0
- **Database access**: Ensure user has read/write permissions

### Vercel Build Issues
- **Frontend build fails**: Check for missing dependencies in package.json
- **API not working**: Verify environment variables are set
- **CORS errors**: Check API allows your domain

### Runtime Issues
- **Cold start timeouts**: Normal for serverless, should resolve quickly
- **Memory issues**: Increase function memory in vercel.json if needed
- **API errors**: Check Vercel function logs in dashboard

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Frontend loads at your Vercel URL
- ✅ API health check returns 200 OK
- ✅ User can register and login
- ✅ Food search returns USDA data
- ✅ All features work end-to-end

## 📞 Need Help?

1. **MongoDB Issues**: See `MONGODB_FIX_REQUIRED.md`
2. **Vercel Issues**: Check Vercel dashboard logs
3. **API Issues**: Test individual endpoints first
4. **Frontend Issues**: Check browser console for errors

Ready to deploy! Fix the MongoDB connection first, then follow the deployment steps above. 🚀