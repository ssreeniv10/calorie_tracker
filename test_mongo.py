#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Run this to verify your MongoDB Atlas connection works
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

def test_mongodb_connection():
    # Load environment variables
    load_dotenv()
    mongo_url = os.getenv('MONGO_URL')
    
    if not mongo_url:
        print("❌ MONGO_URL not found in environment variables")
        return False
    
    print(f"🔗 Testing connection to: {mongo_url.split('@')[1] if '@' in mongo_url else mongo_url}")
    
    try:
        # Create client with timeout
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=10000)
        
        # Test the connection
        print("⏳ Connecting to MongoDB Atlas...")
        server_info = client.server_info()
        print(f"✅ Connected successfully! MongoDB version: {server_info.get('version', 'Unknown')}")
        
        # Test database access
        db = client.fittracker
        print(f"✅ Database '{db.name}' accessible")
        
        # Test write operation
        test_collection = db.connection_test
        test_doc = {"test": "connection_successful", "timestamp": "now"}
        result = test_collection.insert_one(test_doc)
        print(f"✅ Write test successful! Document ID: {result.inserted_id}")
        
        # Clean up test document
        test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Clean up successful")
        
        # List existing collections
        collections = db.list_collection_names()
        print(f"📋 Existing collections: {collections if collections else 'None (new database)'}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        
        # Provide specific error guidance
        error_str = str(e).lower()
        if "authentication failed" in error_str:
            print("\n🔍 Authentication Error - Check:")
            print("  1. Username and password are correct")
            print("  2. Database user exists in Atlas")
            print("  3. User has proper permissions")
        elif "network" in error_str or "timeout" in error_str:
            print("\n🔍 Network Error - Check:")
            print("  1. Network access allows 0.0.0.0/0 in Atlas")
            print("  2. Your internet connection")
        elif "ssl" in error_str:
            print("\n🔍 SSL Error - Check:")
            print("  1. Connection string includes correct SSL options")
            
        return False

if __name__ == "__main__":
    print("🧪 MongoDB Atlas Connection Test")
    print("=" * 40)
    
    success = test_mongodb_connection()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 All tests passed! MongoDB Atlas is ready for deployment.")
    else:
        print("❌ Connection failed. Please fix the issues above before deploying.")
        print("\n📖 See MONGODB_FIX_REQUIRED.md for detailed troubleshooting steps.")