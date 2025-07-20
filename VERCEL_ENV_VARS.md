# Environment Variables for Vercel Deployment

## Required Environment Variables

Copy these to your Vercel dashboard under Settings > Environment Variables:

### Database Configuration
```
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fittracker?retryWrites=true&w=majority
```

### JWT Security
```
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### USDA API
```
USDA_API_KEY=Nd8DOm1qWuH1Y2S7OLiXuvOjdsT1d38zYj4UlCMd
```

### Frontend Configuration (Optional - will use same domain by default)
```
REACT_APP_BACKEND_URL=
```

## How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. For each variable above:
   - Click "Add New"
   - Enter the name (e.g., `MONGO_URL`)
   - Enter the value
   - Select environments: Production, Preview, Development
   - Click "Save"

## Important Notes:

- **MONGO_URL**: Get this from MongoDB Atlas (see MONGODB_ATLAS_VERCEL.md)
- **JWT_SECRET_KEY**: Generate a long, random string for production
- **USDA_API_KEY**: Already included, but you can get your own at https://fdc.nal.usda.gov/api-guide.html
- **REACT_APP_BACKEND_URL**: Leave empty to use same domain, or set to your Vercel URL

After adding all variables, redeploy your project for changes to take effect.