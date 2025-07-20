#!/usr/bin/env python3
"""
MongoDB Atlas URL Validator and Fixer
Helps identify and fix common connection string issues
"""

import urllib.parse
import re

def validate_mongodb_url(url):
    """Validate and analyze MongoDB Atlas connection string"""
    print(f"🔍 Analyzing connection string:")
    print(f"   {url[:50]}...{url[-20:]}")
    print()
    
    issues = []
    suggestions = []
    
    # Check basic format
    if not url.startswith('mongodb+srv://'):
        issues.append("❌ Should start with 'mongodb+srv://'")
        suggestions.append("Use the SRV connection string from Atlas")
    else:
        print("✅ Correct protocol (mongodb+srv://)")
    
    # Extract components
    try:
        # Parse the URL
        parsed = urllib.parse.urlparse(url)
        
        # Extract username and password
        if parsed.username and parsed.password:
            print(f"✅ Username found: {parsed.username}")
            print(f"✅ Password found: {'*' * len(parsed.password)}")
            
            # Check for special characters in password
            if any(char in parsed.password for char in ['@', ':', '/', '?', '#']):
                issues.append("⚠️ Password contains special characters")
                suggestions.append("URL-encode special characters in password")
        else:
            issues.append("❌ Missing username or password")
            suggestions.append("Include username:password in the connection string")
        
        # Check hostname
        if parsed.hostname:
            if '.mongodb.net' in parsed.hostname:
                print(f"✅ Valid Atlas hostname: {parsed.hostname}")
            else:
                issues.append("❌ Hostname doesn't look like Atlas")
                suggestions.append("Use the connection string from Atlas dashboard")
        
        # Check database name
        database = parsed.path.strip('/')
        if database:
            print(f"✅ Database specified: {database}")
        else:
            issues.append("⚠️ No database name specified")
            suggestions.append("Add database name: /fittracker")
        
        # Check query parameters
        if 'retryWrites=true' in url:
            print("✅ Retry writes enabled")
        
        if 'w=majority' in url:
            print("✅ Write concern set to majority")
            
    except Exception as e:
        issues.append(f"❌ URL parsing failed: {e}")
        suggestions.append("Check the connection string format")
    
    print()
    
    if issues:
        print("🚨 Issues found:")
        for issue in issues:
            print(f"   {issue}")
        print()
        
        print("💡 Suggestions:")
        for suggestion in suggestions:
            print(f"   • {suggestion}")
        print()
        
        # Provide corrected version if possible
        try:
            if parsed.username and parsed.password:
                fixed_url = f"mongodb+srv://{parsed.username}:{parsed.password}@{parsed.hostname}/fittracker?retryWrites=true&w=majority"
                print("🔧 Suggested corrected URL:")
                print(f"   {fixed_url}")
        except:
            pass
    else:
        print("🎉 Connection string looks good!")
    
    return len(issues) == 0

if __name__ == "__main__":
    print("🔗 MongoDB Atlas Connection String Validator")
    print("=" * 50)
    
    # Test the provided URL
    test_url = "mongodb+srv://bkedhar:bkedhar@cluster0.fopy2lh.mongodb.net/fittracker?retryWrites=true&w=majority"
    
    is_valid = validate_mongodb_url(test_url)
    
    print("=" * 50)
    
    if is_valid:
        print("✅ Ready to test connection with: python test_mongo.py")
    else:
        print("❌ Fix the issues above, then test with: python test_mongo.py")
    
    print("\n📖 For more help, see: MONGODB_FIX_REQUIRED.md")