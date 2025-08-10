from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from budget.models import Category, Transaction, Goal
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@billingdesk.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            admin_user.set_password('admin')
            admin_user.save()
            self.stdout.write('Created admin user')
        
        # Create categories
        categories_data = [
            {'name': 'Food & Dining', 'type': 'expense', 'budget_limit': 500},
            {'name': 'Transportation', 'type': 'expense', 'budget_limit': 300},
            {'name': 'Entertainment', 'type': 'expense', 'budget_limit': 200},
            {'name': 'Utilities', 'type': 'expense', 'budget_limit': 400},
            {'name': 'Healthcare', 'type': 'expense', 'budget_limit': 250},
            {'name': 'Shopping', 'type': 'expense', 'budget_limit': 600},
            {'name': 'Salary', 'type': 'income', 'budget_limit': 0},
            {'name': 'Freelance', 'type': 'income', 'budget_limit': 0},
            {'name': 'Investment', 'type': 'income', 'budget_limit': 0},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                user=admin_user,
                defaults={
                    'type': cat_data['type'],
                    'budget_limit': cat_data['budget_limit']
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Create sample transactions
        transactions_data = [
            # Income transactions
            {
                'amount': 5000, 'type': 'income', 'category': 'Salary',
                'description': 'Monthly Salary', 'days_ago': 1
            },
            {
                'amount': 1200, 'type': 'income', 'category': 'Freelance',
                'description': 'Website Development Project', 'days_ago': 5
            },
            {
                'amount': 500, 'type': 'income', 'category': 'Investment',
                'description': 'Stock Dividends', 'days_ago': 10
            },
            
            # Expense transactions
            {
                'amount': 150, 'type': 'expense', 'category': 'Food & Dining',
                'description': 'Grocery Shopping', 'days_ago': 1
            },
            {
                'amount': 45, 'type': 'expense', 'category': 'Transportation',
                'description': 'Gas Station', 'days_ago': 2
            },
            {
                'amount': 25, 'type': 'expense', 'category': 'Food & Dining',
                'description': 'Coffee Shop', 'days_ago': 2
            },
            {
                'amount': 80, 'type': 'expense', 'category': 'Entertainment',
                'description': 'Movie Night', 'days_ago': 3
            },
            {
                'amount': 120, 'type': 'expense', 'category': 'Utilities',
                'description': 'Electric Bill', 'days_ago': 4
            },
            {
                'amount': 200, 'type': 'expense', 'category': 'Shopping',
                'description': 'Clothing Purchase', 'days_ago': 5
            },
            {
                'amount': 60, 'type': 'expense', 'category': 'Food & Dining',
                'description': 'Restaurant Dinner', 'days_ago': 6
            },
            {
                'amount': 30, 'type': 'expense', 'category': 'Transportation',
                'description': 'Public Transport', 'days_ago': 7
            },
            {
                'amount': 100, 'type': 'expense', 'category': 'Healthcare',
                'description': 'Doctor Visit', 'days_ago': 8
            },
            {
                'amount': 75, 'type': 'expense', 'category': 'Entertainment',
                'description': 'Streaming Services', 'days_ago': 9
            },
            {
                'amount': 90, 'type': 'expense', 'category': 'Utilities',
                'description': 'Internet Bill', 'days_ago': 10
            },
        ]
        
        for trans_data in transactions_data:
            transaction, created = Transaction.objects.get_or_create(
                user=admin_user,
                description=trans_data['description'],
                date=date.today() - timedelta(days=trans_data['days_ago']),
                defaults={
                    'amount': trans_data['amount'],
                    'type': trans_data['type'],
                    'category': categories[trans_data['category']],
                    'currency': 'USD'
                }
            )
            if created:
                self.stdout.write(
                    f'Created transaction: {transaction.description}'
                )
        
        # Create sample goals
        goals_data = [
            {
                'title': 'Emergency Fund',
                'description': 'Build emergency fund for 6 months expenses',
                'target_amount': 10000,
                'current_amount': 3500,
                'deadline': date.today() + timedelta(days=365)
            },
            {
                'title': 'Vacation Trip',
                'description': 'Save for European vacation',
                'target_amount': 5000,
                'current_amount': 1200,
                'deadline': date.today() + timedelta(days=180)
            },
            {
                'title': 'New Laptop',
                'description': 'Save for MacBook Pro',
                'target_amount': 2500,
                'current_amount': 800,
                'deadline': date.today() + timedelta(days=90)
            },
        ]
        
        for goal_data in goals_data:
            goal, created = Goal.objects.get_or_create(
                user=admin_user,
                title=goal_data['title'],
                defaults={
                    'description': goal_data['description'],
                    'target_amount': goal_data['target_amount'],
                    'current_amount': goal_data['current_amount'],
                    'deadline': goal_data['deadline'],
                    'status': 'active'
                }
            )
            if created:
                self.stdout.write(f'Created goal: {goal.title}')
        
        self.stdout.write(
            self.style.SUCCESS(
                'Successfully populated database with sample data!'
            )
        )
        self.stdout.write(
            'You can now login with username: admin, password: admin'
        )
