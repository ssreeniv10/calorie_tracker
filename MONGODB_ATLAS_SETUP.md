# 🗄️ MongoDB Atlas Setup for Heroku Deployment

## Why MongoDB Atlas?
Heroku doesn't provide a built-in MongoDB service, so we need to use MongoDB Atlas (cloud MongoDB) for production deployment.

## 📋 Steps to Set Up MongoDB Atlas:

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new project called "FitTracker"

### Step 2: Create a Cluster
1. Click "Create a New Cluster"
2. Choose "Shared" (Free tier)
3. Select a cloud provider and region
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set role to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### Example Connection String:
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/fittracker?retryWrites=true&w=majority
```

## 🔧 Use This in Heroku:
```bash
heroku config:set MONGO_URL="your-connection-string-here"
```