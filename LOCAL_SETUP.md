# 🏠 Local Development Setup Guide

## 📋 Prerequisites
- Python 3.8+ 
- Node.js 16+ 
- Git

## 🔧 Backend Setup (FastAPI)

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install fastapi==0.109.0 uvicorn==0.24.0 pymongo==4.6.0 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.6 pydantic==2.5.0 python-dotenv==1.0.0 requests==2.31.0 bcrypt==4.1.2 gunicorn==21.2.0
```

3. **Your .env file is already configured with:**
```
MONGO_URL="mongodb+srv://bkedhar:bkedhar@cluster0.fopy2lh.mongodb.net/fittracker?retryWrites=true&w=majority"
JWT_SECRET_KEY="your-super-secret-jwt-key-bkedhar-2024"
USDA_API_KEY=Nd8DOm1qWuH1Y2S7OLiXuvOjdsT1d38zYj4UlCMd
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. **Start backend server:**
```bash
python server.py
# Backend will run on http://localhost:8001
```

## 🎨 Frontend Setup (React)

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
# or if you prefer yarn:
yarn install
```

3. **Your .env file is configured with:**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

4. **Start frontend:**
```bash
npm start
# or yarn start
# Frontend will run on http://localhost:3000
```

## 🧪 Test MongoDB Connection
```bash
python test_mongo.py
```

## 🚀 Your App URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## ✅ You're Ready!
MongoDB Atlas is connected and working. Both frontend and backend should start successfully!