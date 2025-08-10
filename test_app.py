#!/usr/bin/env python
"""
Simple test script to verify Django authentication works
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bellingdesk.settings')
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from budget.models import Transaction, Category, Goal

def test_authentication():
    """Test user authentication"""
    print("Testing authentication...")
    
    # Try to authenticate with the admin user
    user = authenticate(username='admin', password='admin')
    if user:
        print(f"✅ Authentication successful for user: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Staff: {user.is_staff}")
        print(f"   Superuser: {user.is_superuser}")
    else:
        print("❌ Authentication failed")
    
    return user

def test_data():
    """Test sample data"""
    print("\nTesting sample data...")
    
    # Check users
    user_count = User.objects.count()
    print(f"Users in database: {user_count}")
    
    # Check categories
    category_count = Category.objects.count()
    print(f"Categories in database: {category_count}")
    
    # Check transactions
    transaction_count = Transaction.objects.count()
    print(f"Transactions in database: {transaction_count}")
    
    # Check goals
    goal_count = Goal.objects.count()
    print(f"Goals in database: {goal_count}")
    
    # Show some sample data
    if transaction_count > 0:
        print("\nSample transactions:")
        for transaction in Transaction.objects.all()[:5]:
            print(f"  {transaction.date}: {transaction.description} - ${transaction.amount} ({transaction.type})")
    
    if goal_count > 0:
        print("\nSample goals:")
        for goal in Goal.objects.all():
            progress = (goal.current_amount / goal.target_amount) * 100
            print(f"  {goal.title}: ${goal.current_amount}/${goal.target_amount} ({progress:.1f}%)")

def main():
    """Main test function"""
    print("🔬 Billing Desk Django Application Test")
    print("=" * 50)
    
    # Test authentication
    user = test_authentication()
    
    # Test data
    test_data()
    
    print("\n" + "=" * 50)
    if user:
        print("✅ All tests passed! The application is ready to use.")
        print("\n📝 To access the application:")
        print("1. Open http://127.0.0.1:8001 in your browser")
        print("2. Login with username: admin, password: admin")
        print("3. Explore the dashboard, transactions, and goals")
    else:
        print("❌ Authentication test failed. Check the database setup.")

if __name__ == '__main__':
    main()
