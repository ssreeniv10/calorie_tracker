from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import requests
import uuid
from bson import ObjectId
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="FitTracker API", version="1.0.0")

# CORS middleware - Updated for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.github.io",
        "https://*.herokuapp.com", 
        "http://localhost:3000",
        "https://f21da611-9add-4dfc-8287-1dc23aabf642.preview.emergentagent.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/fittracker")
client = MongoClient(mongo_url)
db = client.fittracker

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# USDA API configuration
USDA_API_KEY = os.getenv("USDA_API_KEY")
USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = "sedentary"
    goal: Optional[str] = "maintain"

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    user_id: str
    username: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = "sedentary"
    goal: Optional[str] = "maintain"
    daily_calorie_goal: Optional[int] = None
    daily_protein_goal: Optional[float] = None
    daily_carb_goal: Optional[float] = None
    daily_fat_goal: Optional[float] = None

class FoodItem(BaseModel):
    food_id: str
    name: str
    brand: Optional[str] = None
    serving_size: float
    serving_unit: str
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    fiber_per_serving: Optional[float] = None
    sugar_per_serving: Optional[float] = None
    sodium_per_serving: Optional[float] = None

class FoodEntry(BaseModel):
    user_id: str
    food_id: str
    food_name: str
    meal_type: str  # breakfast, lunch, dinner, snack
    servings: float
    calories: float
    protein: float
    carbs: float
    fat: float
    date: str
    timestamp: datetime = Field(default_factory=datetime.now)

class WeightEntry(BaseModel):
    user_id: str
    weight: float
    date: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user

def calculate_bmr(age, gender, height, weight):
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
    if gender.lower() == "male":
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    return bmr

def calculate_tdee(bmr, activity_level):
    """Calculate Total Daily Energy Expenditure"""
    activity_multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extra_active": 1.9
    }
    return bmr * activity_multipliers.get(activity_level, 1.2)

def calculate_daily_goals(user_data):
    """Calculate daily nutrition goals based on user data"""
    if not all([user_data.get("age"), user_data.get("gender"), 
                user_data.get("height"), user_data.get("weight")]):
        return {"daily_calorie_goal": 2000, "daily_protein_goal": 150, 
                "daily_carb_goal": 250, "daily_fat_goal": 67}
    
    bmr = calculate_bmr(user_data["age"], user_data["gender"], 
                       user_data["height"], user_data["weight"])
    tdee = calculate_tdee(bmr, user_data.get("activity_level", "sedentary"))
    
    # Adjust calories based on goal
    goal_adjustments = {
        "lose_weight": -500,
        "maintain": 0,
        "gain_weight": 500
    }
    
    daily_calories = tdee + goal_adjustments.get(user_data.get("goal", "maintain"), 0)
    
    # Calculate macros (protein: 25%, carbs: 45%, fat: 30%)
    daily_protein = (daily_calories * 0.25) / 4  # 4 calories per gram
    daily_carbs = (daily_calories * 0.45) / 4
    daily_fat = (daily_calories * 0.30) / 9  # 9 calories per gram
    
    return {
        "daily_calorie_goal": int(daily_calories),
        "daily_protein_goal": round(daily_protein, 1),
        "daily_carb_goal": round(daily_carbs, 1),
        "daily_fat_goal": round(daily_fat, 1)
    }

# Authentication endpoints
@app.post("/api/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_dict = user.dict()
    user_dict["user_id"] = str(uuid.uuid4())
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.now()
    
    # Calculate daily goals
    goals = calculate_daily_goals(user_dict)
    user_dict.update(goals)
    
    db.users.insert_one(user_dict)
    
    # Create initial weight entry if weight was provided
    if user.weight:
        weight_entry = {
            "entry_id": str(uuid.uuid4()),
            "user_id": user_dict["user_id"],
            "weight": user.weight,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "timestamp": datetime.now()
        }
        db.weight_entries.insert_one(weight_entry)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    db_user = db.users.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# User profile endpoints
@app.get("/api/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_data = {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "age": current_user.get("age"),
        "gender": current_user.get("gender"),
        "height": current_user.get("height"),
        "weight": current_user.get("weight"),
        "activity_level": current_user.get("activity_level", "sedentary"),
        "goal": current_user.get("goal", "maintain"),
        "daily_calorie_goal": current_user.get("daily_calorie_goal"),
        "daily_protein_goal": current_user.get("daily_protein_goal"),
        "daily_carb_goal": current_user.get("daily_carb_goal"),
        "daily_fat_goal": current_user.get("daily_fat_goal")
    }
    return user_data

@app.put("/api/profile")
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    update_data = profile.dict(exclude_unset=True)
    
    # Recalculate goals if relevant data changed
    if any(key in update_data for key in ["age", "gender", "height", "weight", "activity_level", "goal"]):
        updated_user_data = {**current_user, **update_data}
        goals = calculate_daily_goals(updated_user_data)
        update_data.update(goals)
    
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}

# Food search endpoints
@app.get("/api/foods/search")
async def search_foods(query: str, current_user: dict = Depends(get_current_user)):
    if not USDA_API_KEY:
        # Mock data for demonstration
        return {
            "foods": [
                {
                    "fdcId": "123456",
                    "description": "Banana, raw",
                    "brandName": "",
                    "servingSize": 100,
                    "servingUnit": "g",
                    "calories": 89,
                    "protein": 1.1,
                    "carbs": 22.8,
                    "fat": 0.3,
                    "fiber": 2.6,
                    "sugar": 12.2,
                    "sodium": 1
                },
                {
                    "fdcId": "789012",
                    "description": "Apple, raw",
                    "brandName": "",
                    "servingSize": 100,
                    "servingUnit": "g",
                    "calories": 52,
                    "protein": 0.3,
                    "carbs": 13.8,
                    "fat": 0.2,
                    "fiber": 2.4,
                    "sugar": 10.4,
                    "sodium": 1
                }
            ]
        }
    
    try:
        response = requests.get(
            f"{USDA_BASE_URL}/foods/search",
            params={
                "query": query,
                "api_key": USDA_API_KEY,
                "dataType": ["Branded", "Foundation", "SR Legacy"],
                "pageSize": 20
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            foods = []
            
            for food in data.get("foods", []):
                # Extract nutrition data
                nutrients = {n["nutrientName"]: n["value"] for n in food.get("foodNutrients", [])}
                
                food_item = {
                    "fdcId": food["fdcId"],
                    "description": food["description"],
                    "brandName": food.get("brandName", ""),
                    "servingSize": food.get("servingSize", 100),
                    "servingUnit": food.get("servingSizeUnit", "g"),
                    "calories": nutrients.get("Energy", 0),
                    "protein": nutrients.get("Protein", 0),
                    "carbs": nutrients.get("Carbohydrate, by difference", 0),
                    "fat": nutrients.get("Total lipid (fat)", 0),
                    "fiber": nutrients.get("Fiber, total dietary", 0),
                    "sugar": nutrients.get("Sugars, total including NLEA", 0),
                    "sodium": nutrients.get("Sodium, Na", 0)
                }
                foods.append(food_item)
            
            return {"foods": foods}
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch food data")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching foods: {str(e)}")

# Food logging endpoints
@app.post("/api/food-entries")
async def log_food(entry: FoodEntry, current_user: dict = Depends(get_current_user)):
    entry_dict = entry.dict()
    entry_dict["entry_id"] = str(uuid.uuid4())
    entry_dict["user_id"] = current_user["user_id"]
    
    db.food_entries.insert_one(entry_dict)
    return {"message": "Food logged successfully", "entry_id": entry_dict["entry_id"]}

@app.get("/api/food-entries")
async def get_food_entries(date: str, current_user: dict = Depends(get_current_user)):
    entries = list(db.food_entries.find(
        {"user_id": current_user["user_id"], "date": date},
        {"_id": 0}
    ))
    
    # Group by meal type
    grouped_entries = {
        "breakfast": [],
        "lunch": [],
        "dinner": [],
        "snack": []
    }
    
    total_nutrition = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    
    for entry in entries:
        meal_type = entry["meal_type"]
        if meal_type in grouped_entries:
            grouped_entries[meal_type].append(entry)
            
            # Add to totals
            total_nutrition["calories"] += entry["calories"]
            total_nutrition["protein"] += entry["protein"]
            total_nutrition["carbs"] += entry["carbs"]
            total_nutrition["fat"] += entry["fat"]
    
    return {
        "entries": grouped_entries,
        "total_nutrition": total_nutrition
    }

@app.delete("/api/food-entries/{entry_id}")
async def delete_food_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    result = db.food_entries.delete_one({
        "entry_id": entry_id,
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Food entry not found")
    
    return {"message": "Food entry deleted successfully"}

# Weight tracking endpoints
@app.post("/api/weight-entries")
async def log_weight(entry: WeightEntry, current_user: dict = Depends(get_current_user)):
    entry_dict = entry.dict()
    entry_dict["entry_id"] = str(uuid.uuid4())
    entry_dict["user_id"] = current_user["user_id"]
    
    # Update user's current weight
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"weight": entry.weight}}
    )
    
    db.weight_entries.insert_one(entry_dict)
    return {"message": "Weight logged successfully", "entry_id": entry_dict["entry_id"]}

@app.get("/api/weight-entries")
async def get_weight_entries(current_user: dict = Depends(get_current_user)):
    entries = list(db.weight_entries.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(30))
    
    return {"entries": entries}

# Dashboard/summary endpoints
@app.get("/api/dashboard")
async def get_dashboard(date: str, current_user: dict = Depends(get_current_user)):
    # Get today's food entries
    entries = list(db.food_entries.find(
        {"user_id": current_user["user_id"], "date": date},
        {"_id": 0}
    ))
    
    # Calculate totals
    total_nutrition = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    for entry in entries:
        total_nutrition["calories"] += entry["calories"]
        total_nutrition["protein"] += entry["protein"]
        total_nutrition["carbs"] += entry["carbs"]
        total_nutrition["fat"] += entry["fat"]
    
    # Get user goals
    user_goals = {
        "daily_calorie_goal": current_user.get("daily_calorie_goal", 2000),
        "daily_protein_goal": current_user.get("daily_protein_goal", 150),
        "daily_carb_goal": current_user.get("daily_carb_goal", 250),
        "daily_fat_goal": current_user.get("daily_fat_goal", 67)
    }
    
    # Calculate progress percentages
    progress = {
        "calories": (total_nutrition["calories"] / user_goals["daily_calorie_goal"]) * 100,
        "protein": (total_nutrition["protein"] / user_goals["daily_protein_goal"]) * 100,
        "carbs": (total_nutrition["carbs"] / user_goals["daily_carb_goal"]) * 100,
        "fat": (total_nutrition["fat"] / user_goals["daily_fat_goal"]) * 100
    }
    
    # Get recent weight entry
    latest_weight = db.weight_entries.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0},
        sort=[("timestamp", -1)]
    )
    
    return {
        "total_nutrition": total_nutrition,
        "user_goals": user_goals,
        "progress": progress,
        "latest_weight": latest_weight,
        "entries_count": len(entries)
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)