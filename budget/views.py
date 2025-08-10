from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Sum, Q, Count, Avg
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from collections import defaultdict
import calendar
import json
from decimal import Decimal
from .models import (
    Transaction, Category, Goal, RecurringBill, 
    SplitBill, FinancialHealthScore, UserProfile
)


def register_view(request):
    """User registration"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(
                request, 
                f'Account created for {username}! You can now log in.'
            )
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/register.html', {'form': form})


@login_required
def dashboard_view(request):
    """Main dashboard with financial overview"""
    user = request.user
    current_month = timezone.now().month
    current_year = timezone.now().year
    
    # Calculate monthly totals
    income_total = Transaction.objects.filter(
        user=user,
        type='income',
        date__month=current_month,
        date__year=current_year
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    expense_total = Transaction.objects.filter(
        user=user,
        type='expense',
        date__month=current_month,
        date__year=current_year
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Recent transactions
    recent_transactions = Transaction.objects.filter(
        user=user
    ).select_related('category')[:5]
    
    # Goals progress
    goals = Goal.objects.filter(user=user, status='active')
    
    # Category spending with budget limits
    categories = Category.objects.filter(
        Q(user=user) | Q(user__isnull=True), 
        type='expense'
    )
    category_data = []
    for category in categories:
        spent = Transaction.objects.filter(
            user=user,
            category=category,
            type='expense',
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        progress_percent = 0
        if category.budget_limit > 0:
            progress_percent = min(100, (spent / category.budget_limit) * 100)
        
        category_data.append({
            'category': category,
            'spent': spent,
            'progress_percent': progress_percent
        })
    
    # Financial health score (simplified calculation)
    savings_rate = 0
    if income_total > 0:
        savings_rate = ((income_total - expense_total) / income_total) * 100
    
    health_score = max(0, min(100, int(50 + savings_rate)))
    
    context = {
        'income_total': income_total,
        'expense_total': expense_total,
        'recent_transactions': recent_transactions,
        'goals': goals,
        'category_data': category_data,
        'health_score': health_score,
        'current_month': datetime.now().strftime('%B %Y'),
    }
    
    return render(request, 'budget/dashboard.html', context)


@login_required
def api_expense_distribution(request):
    """API endpoint for expense distribution chart"""
    user = request.user
    current_month = timezone.now().month
    current_year = timezone.now().year
    
    categories = Category.objects.filter(
        Q(user=user) | Q(user__isnull=True), 
        type='expense'
    )
    
    data = []
    labels = []
    
    for category in categories:
        total = Transaction.objects.filter(
            user=user,
            category=category,
            type='expense',
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        if total > 0:
            labels.append(category.name)
            data.append(float(total))
    
    return JsonResponse({
        'labels': labels,
        'data': data
    })


@login_required
def api_monthly_trend(request):
    """API endpoint for monthly trend chart"""
    user = request.user
    months_data = []
    income_data = []
    expense_data = []
    
    # Get last 6 months data
    for i in range(5, -1, -1):
        date = timezone.now() - timedelta(days=30*i)
        month_name = date.strftime('%b %Y')
        
        income = Transaction.objects.filter(
            user=user,
            type='income',
            date__month=date.month,
            date__year=date.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense = Transaction.objects.filter(
            user=user,
            type='expense',
            date__month=date.month,
            date__year=date.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        months_data.append(month_name)
        income_data.append(float(income))
        expense_data.append(float(expense))
    
    return JsonResponse({
        'months': months_data,
        'income': income_data,
        'expenses': expense_data
    })


@login_required
def transactions_view(request):
    """Transactions page with filtering and CRUD operations"""
    user = request.user
    
    # Get all user's transactions
    transactions = Transaction.objects.filter(
        user=user
    ).select_related('category').order_by('-date', '-created_at')
    
    # Get all categories for filters
    categories = Category.objects.filter(
        Q(user=user) | Q(user__isnull=True)
    ).order_by('name')
    
    # Apply filters if provided
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    category_filter = request.GET.get('category')
    type_filter = request.GET.get('type')
    
    if date_from:
        transactions = transactions.filter(date__gte=date_from)
    if date_to:
        transactions = transactions.filter(date__lte=date_to)
    if category_filter:
        transactions = transactions.filter(category_id=category_filter)
    if type_filter:
        transactions = transactions.filter(type=type_filter)
    
    # Calculate totals
    total_income = transactions.filter(type='income').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    total_expenses = transactions.filter(type='expense').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    net_balance = total_income - total_expenses
    
    context = {
        'transactions': transactions,
        'categories': categories,
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_balance': net_balance,
    }
    
    return render(request, 'budget/transactions.html', context)


@login_required
def api_transactions(request):
    """API endpoint for filtered transactions"""
    user = request.user
    
    # Get all user's transactions
    transactions = Transaction.objects.filter(
        user=user
    ).select_related('category').order_by('-date', '-created_at')
    
    # Apply filters
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    category_filter = request.GET.get('category')
    type_filter = request.GET.get('type')
    
    if date_from:
        transactions = transactions.filter(date__gte=date_from)
    if date_to:
        transactions = transactions.filter(date__lte=date_to)
    if category_filter:
        transactions = transactions.filter(category_id=category_filter)
    if type_filter:
        transactions = transactions.filter(type=type_filter)
    
    # Calculate totals
    total_income = transactions.filter(type='income').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    total_expenses = transactions.filter(type='expense').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    net_balance = total_income - total_expenses
    
    # Serialize transactions
    transactions_data = []
    for transaction in transactions:
        transactions_data.append({
            'id': transaction.id,
            'date': transaction.date.isoformat(),
            'description': transaction.description,
            'amount': str(transaction.amount),
            'type': transaction.type,
            'category_name': transaction.category.name,
            'category_id': transaction.category.id,
            'notes': getattr(transaction, 'notes', ''),
        })
    
    return JsonResponse({
        'success': True,
        'transactions': transactions_data,
        'summary': {
            'total_income': str(total_income),
            'total_expenses': str(total_expenses),
            'net_balance': str(net_balance),
        }
    })


@login_required
def api_add_transaction(request):
    """API endpoint to add a new transaction"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        user = request.user
        
        # Get form data
        description = request.POST.get('description')
        amount = request.POST.get('amount')
        date = request.POST.get('date')
        transaction_type = request.POST.get('type')
        category_id = request.POST.get('category')
        notes = request.POST.get('notes', '')
        
        # Validate required fields
        if not all([description, amount, date, transaction_type, category_id]):
            return JsonResponse({
                'success': False, 
                'error': 'All required fields must be filled'
            })
        
        # Get category
        category = get_object_or_404(Category, id=category_id)
        
        # Create transaction
        transaction = Transaction.objects.create(
            user=user,
            description=description,
            amount=float(amount),
            date=datetime.strptime(date, '%Y-%m-%d').date(),
            type=transaction_type,
            category=category,
            notes=notes,
            currency='USD'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Transaction added successfully',
            'transaction_id': transaction.id
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error adding transaction: {str(e)}'
        })


@login_required
def api_get_transaction(request, transaction_id):
    """API endpoint to get transaction details"""
    try:
        transaction = get_object_or_404(
            Transaction, 
            id=transaction_id, 
            user=request.user
        )
        
        return JsonResponse({
            'success': True,
            'transaction': {
                'id': transaction.id,
                'description': transaction.description,
                'amount': str(transaction.amount),
                'date': transaction.date.isoformat(),
                'type': transaction.type,
                'category_id': transaction.category.id,
                'notes': getattr(transaction, 'notes', ''),
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error loading transaction: {str(e)}'
        })


@login_required
def api_update_transaction(request, transaction_id):
    """API endpoint to update a transaction"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        transaction = get_object_or_404(
            Transaction, 
            id=transaction_id, 
            user=request.user
        )
        
        # Get form data
        description = request.POST.get('description')
        amount = request.POST.get('amount')
        date = request.POST.get('date')
        transaction_type = request.POST.get('type')
        category_id = request.POST.get('category')
        notes = request.POST.get('notes', '')
        
        # Validate required fields
        if not all([description, amount, date, transaction_type, category_id]):
            return JsonResponse({
                'success': False, 
                'error': 'All required fields must be filled'
            })
        
        # Get category
        category = get_object_or_404(Category, id=category_id)
        
        # Update transaction
        transaction.description = description
        transaction.amount = float(amount)
        transaction.date = datetime.strptime(date, '%Y-%m-%d').date()
        transaction.type = transaction_type
        transaction.category = category
        transaction.notes = notes
        transaction.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Transaction updated successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error updating transaction: {str(e)}'
        })


@login_required
def api_delete_transaction(request, transaction_id):
    """API endpoint to delete a transaction"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        transaction = get_object_or_404(
            Transaction, 
            id=transaction_id, 
            user=request.user
        )
        
        transaction.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Transaction deleted successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error deleting transaction: {str(e)}'
        })


@login_required
def goals_view(request):
    """Goals page with CRUD operations"""
    user = request.user
    
    # Get all user's goals
    goals = Goal.objects.filter(user=user).order_by('-created_at')
    
    # Calculate summary statistics
    total_goals = goals.count()
    total_saved = goals.aggregate(
        total=Sum('current_amount')
    )['total'] or 0
    total_target = goals.aggregate(
        total=Sum('target_amount')
    )['total'] or 0
    
    context = {
        'goals': goals,
        'total_goals': total_goals,
        'total_saved': total_saved,
        'total_target': total_target,
    }
    
    return render(request, 'budget/goals.html', context)


@login_required
def api_add_goal(request):
    """API endpoint to add a new goal"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        user = request.user
        
        # Get form data
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        target_amount = request.POST.get('target_amount')
        current_amount = request.POST.get('current_amount', 0)
        deadline = request.POST.get('deadline')
        
        # Validate required fields
        if not all([title, target_amount, deadline]):
            return JsonResponse({
                'success': False, 
                'error': 'Title, target amount, and deadline are required'
            })
        
        # Create goal
        goal = Goal.objects.create(
            user=user,
            title=title,
            description=description,
            target_amount=float(target_amount),
            current_amount=float(current_amount),
            deadline=datetime.strptime(deadline, '%Y-%m-%d').date(),
            status='active'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Goal created successfully',
            'goal_id': goal.id
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error creating goal: {str(e)}'
        })


@login_required
def api_delete_goal(request, goal_id):
    """API endpoint to delete a goal"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        goal = get_object_or_404(Goal, id=goal_id, user=request.user)
        goal.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Goal deleted successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error deleting goal: {str(e)}'
        })


@login_required
def api_add_to_goal(request, goal_id):
    """API endpoint to add money to a goal"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        goal = get_object_or_404(Goal, id=goal_id, user=request.user)
        
        amount = request.POST.get('amount')
        note = request.POST.get('note', '')
        
        if not amount:
            return JsonResponse({
                'success': False, 
                'error': 'Amount is required'
            })
        
        # Add amount to goal
        goal.current_amount += float(amount)
        goal.save()
        
        # Create a transaction record for this contribution
        Transaction.objects.create(
            user=request.user,
            description=f'Contribution to goal: {goal.title}',
            amount=float(amount),
            date=timezone.now().date(),
            type='expense',
            category=Category.objects.filter(
                name='Savings', 
                user=request.user
            ).first() or Category.objects.filter(
                name='Investment', 
                user=request.user
            ).first(),
            notes=note,
            currency='USD'
        )
        
        return JsonResponse({
            'success': True,
            'message': f'${amount} added to {goal.title}',
            'new_amount': str(goal.current_amount)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error adding to goal: {str(e)}'
        })


@login_required
def profile_view(request):
    """Profile page with user statistics and charts data."""
    try:
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'currency': 'USD',
                'budget_period': 'monthly',
                'email_notifications': True
            }
        )
        
        # Calculate statistics
        now = timezone.now()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Basic stats
        total_transactions = Transaction.objects.filter(user=request.user).count()
        active_goals = Goal.objects.filter(user=request.user, is_completed=False).count()
        days_active = (now - request.user.date_joined).days
        
        # Financial calculations
        income_total = Transaction.objects.filter(
            user=request.user,
            transaction_type='income',
            date__gte=this_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense_total = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense',
            date__gte=this_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        net_worth = income_total - expense_total
        savings_rate = (net_worth / income_total * 100) if income_total > 0 else 0
        
        # Category spending data for pie chart
        category_spending = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense',
            date__gte=this_month
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')[:8]
        
        category_labels = [item['category__name'] or 'Uncategorized' for item in category_spending]
        category_data = [float(item['total']) for item in category_spending]
        
        # Monthly trend data for last 6 months
        monthly_data = []
        for i in range(6):
            month_start = (this_month - timedelta(days=32*i)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_income = Transaction.objects.filter(
                user=request.user,
                transaction_type='income',
                date__range=[month_start, month_end]
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            month_expenses = Transaction.objects.filter(
                user=request.user,
                transaction_type='expense',
                date__range=[month_start, month_end]
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_data.append({
                'month': month_start.strftime('%b'),
                'income': float(month_income),
                'expenses': float(month_expenses)
            })
        
        monthly_data.reverse()
        monthly_labels = [item['month'] for item in monthly_data]
        monthly_income = [item['income'] for item in monthly_data]
        monthly_expenses = [item['expenses'] for item in monthly_data]
        
        # Goals progress data
        goals = Goal.objects.filter(user=request.user, is_completed=False)[:5]
        goals_labels = [goal.title[:15] + '...' if len(goal.title) > 15 else goal.title for goal in goals]
        goals_progress = [
            min(100, (goal.current_amount / goal.target_amount * 100)) if goal.target_amount > 0 else 0
            for goal in goals
        ]
        
        # Recent activities
        recent_transactions = Transaction.objects.filter(
            user=request.user
        ).order_by('-date')[:10]
        
        recent_activities = []
        for transaction in recent_transactions:
            icon = 'fa-arrow-up' if transaction.transaction_type == 'income' else 'fa-arrow-down'
            color = 'text-success' if transaction.transaction_type == 'income' else 'text-danger'
            
            recent_activities.append({
                'description': f"{transaction.transaction_type.title()}: {transaction.description}",
                'timestamp': transaction.date,
                'amount': transaction.amount,
                'type': transaction.transaction_type,
                'icon': icon,
                'color': color
            })
        
        context = {
            'profile': profile,
            'total_transactions': total_transactions,
            'active_goals': active_goals,
            'days_active': days_active,
            'net_worth': net_worth,
            'savings_rate': savings_rate,
            'category_labels': json.dumps(category_labels),
            'category_data': json.dumps(category_data),
            'monthly_labels': json.dumps(monthly_labels),
            'monthly_income': json.dumps(monthly_income),
            'monthly_expenses': json.dumps(monthly_expenses),
            'goals_labels': json.dumps(goals_labels),
            'goals_progress': json.dumps(goals_progress),
            'recent_activities': recent_activities,
        }
        
        return render(request, 'budget/profile.html', context)
        
    except Exception as e:
        messages.error(request, f'Error loading profile: {str(e)}')
        return redirect('dashboard')


@csrf_exempt
@login_required
def update_profile_api(request):
    """API endpoint to update user profile."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Update user fields
        user = request.user
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.email = request.POST.get('email', user.email)
        user.save()
        
        # Update profile fields
        profile.phone = request.POST.get('phone', '')
        profile.bio = request.POST.get('bio', '')
        profile.currency = request.POST.get('currency', 'USD')
        profile.budget_period = request.POST.get('budget_period', 'monthly')
        profile.email_notifications = request.POST.get('email_notifications') == 'on'
        
        # Handle date of birth
        dob = request.POST.get('date_of_birth')
        if dob:
            try:
                profile.date_of_birth = datetime.strptime(dob, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Handle avatar upload
        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']
        
        profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error updating profile: {str(e)}'
        })


@csrf_exempt
@login_required
def toggle_notifications_api(request):
    """API endpoint to toggle email notifications."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})
    
    try:
        data = json.loads(request.body)
        enabled = data.get('enabled', False)
        
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.email_notifications = enabled
        profile.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Notifications {"enabled" if enabled else "disabled"}'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error updating notifications: {str(e)}'
        })


@login_required
def bills_view(request):
    """Bills and subscriptions page with CRUD operations."""
    try:
        # Get user's recurring bills (we'll use transactions for now)
        now = timezone.now()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Mock bill data using transactions with specific patterns
        bills = []
        bill_transactions = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense'
        ).order_by('-date')[:20]  # Get recent expenses as "bills"
        
        # Calculate statistics
        total_bills = 0
        paid_bills = 0
        pending_bills = 0
        overdue_count = 0
        
        for i, transaction in enumerate(bill_transactions):
            # Simulate bill status based on date
            days_old = (now.date() - transaction.date).days
            if days_old < 5:
                status = 'paid'
                paid_bills += transaction.amount
            elif days_old < 15:
                status = 'pending'
                pending_bills += transaction.amount
            else:
                status = 'overdue'
                overdue_count += 1
            
            total_bills += transaction.amount
            
            bills.append({
                'id': transaction.id,
                'name': transaction.description,
                'amount': transaction.amount,
                'due_date': transaction.date,
                'status': status,
                'category': transaction.category.name if transaction.category else 'Other'
            })
        
        # Category data for chart
        category_spending = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense',
            date__gte=this_month
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')[:6]
        
        category_labels = [item['category__name'] or 'Uncategorized' for item in category_spending]
        category_amounts = [float(item['total']) for item in category_spending]
        
        # Monthly trend data
        monthly_data = []
        for i in range(6):
            month_start = (this_month - timedelta(days=32*i)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_total = Transaction.objects.filter(
                user=request.user,
                transaction_type='expense',
                date__range=[month_start, month_end]
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_data.append({
                'month': month_start.strftime('%b'),
                'amount': float(month_total)
            })
        
        monthly_data.reverse()
        monthly_labels = [item['month'] for item in monthly_data]
        monthly_amounts = [item['amount'] for item in monthly_data]
        
        context = {
            'bills': bills,
            'total_bills': total_bills,
            'paid_bills': paid_bills,
            'pending_bills': pending_bills,
            'overdue_count': overdue_count,
            'category_labels': json.dumps(category_labels),
            'category_amounts': json.dumps(category_amounts),
            'monthly_labels': json.dumps(monthly_labels),
            'monthly_amounts': json.dumps(monthly_amounts),
        }
        
        return render(request, 'budget/bills.html', context)
        
    except Exception as e:
        messages.error(request, f'Error loading bills: {str(e)}')
        return redirect('dashboard')


@login_required  
def reports_view(request):
    """Reports and analytics page with comprehensive data."""
    try:
        # Get time period
        period = request.GET.get('period', 'month')
        now = timezone.now()
        
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'quarter':
            start_date = now - timedelta(days=90)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Financial overview
        income_total = Transaction.objects.filter(
            user=request.user,
            transaction_type='income',
            date__gte=start_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense_total = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense',
            date__gte=start_date
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        net_savings = income_total - expense_total
        savings_rate = (net_savings / income_total * 100) if income_total > 0 else 0
        
        # Mock comparison data (would normally compare to previous period)
        income_change = 5.2
        expense_change = 3.1
        budget_adherence = 78.5
        
        # Expense breakdown
        expense_categories = Transaction.objects.filter(
            user=request.user,
            transaction_type='expense',
            date__gte=start_date
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')[:8]
        
        expense_labels = [item['category__name'] or 'Uncategorized' for item in expense_categories]
        expense_amounts = [float(item['total']) for item in expense_categories]
        
        # Top categories with percentages
        total_expenses = sum(expense_amounts) if expense_amounts else 1
        top_categories = []
        colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        
        for i, category in enumerate(expense_categories[:5]):
            percentage = (category['total'] / total_expenses * 100) if total_expenses > 0 else 0
            top_categories.append({
                'name': category['category__name'] or 'Uncategorized',
                'amount': category['total'],
                'percentage': percentage,
                'color': colors[i % len(colors)]
            })
        
        # Trend data for charts (last 6 months)
        trend_data = []
        for i in range(6):
            month_start = (start_date - timedelta(days=30*i)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_income = Transaction.objects.filter(
                user=request.user,
                transaction_type='income',
                date__range=[month_start, month_end]
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            month_expenses = Transaction.objects.filter(
                user=request.user,
                transaction_type='expense',
                date__range=[month_start, month_end]
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            trend_data.append({
                'month': month_start.strftime('%b'),
                'income': float(month_income),
                'expenses': float(month_expenses)
            })
        
        trend_data.reverse()
        trend_labels = [item['month'] for item in trend_data]
        income_trend = [item['income'] for item in trend_data]
        expense_trend = [item['expenses'] for item in trend_data]
        
        # Goals data
        goals = Goal.objects.filter(user=request.user, is_completed=False)[:5]
        goals_labels = [goal.title[:15] + '...' if len(goal.title) > 15 else goal.title for goal in goals]
        goals_progress = [
            min(100, (goal.current_amount / goal.target_amount * 100)) if goal.target_amount > 0 else 0
            for goal in goals
        ]
        
        # Financial health score calculation
        health_factors = {
            'savings_rate': min(100, savings_rate * 5),  # 20% savings = 100 points
            'budget_adherence': budget_adherence,
            'debt_ratio': max(0, 100 - 30)  # Mock debt ratio
        }
        health_score = int(sum(health_factors.values()) / len(health_factors))
        
        # Quick stats
        transactions_count = Transaction.objects.filter(user=request.user).count()
        active_goals_count = Goal.objects.filter(user=request.user, is_completed=False).count()
        
        if expense_amounts:
            avg_daily_spending = expense_total / ((now - start_date).days or 1)
            largest_expense = max(expense_amounts)
        else:
            avg_daily_spending = 0
            largest_expense = 0
        
        context = {
            'period': period,
            'total_income': income_total,
            'total_expenses': expense_total,
            'net_savings': net_savings,
            'savings_rate': savings_rate,
            'income_change': income_change,
            'expense_change': expense_change,
            'budget_adherence': budget_adherence,
            'expense_categories': top_categories,
            'expense_labels': json.dumps(expense_labels),
            'expense_amounts': json.dumps(expense_amounts),
            'trend_labels': json.dumps(trend_labels),
            'income_trend': json.dumps(income_trend),
            'expense_trend': json.dumps(expense_trend),
            'goals_labels': json.dumps(goals_labels),
            'goals_progress': json.dumps(goals_progress),
            'comparison_labels': json.dumps(trend_labels),
            'comparison_data': json.dumps(expense_trend),
            'top_categories': top_categories,
            'health_score': health_score,
            'debt_ratio': 30,  # Mock value
            'avg_daily_spending': avg_daily_spending,
            'largest_expense': largest_expense,
            'total_transactions': transactions_count,
            'active_goals': active_goals_count,
        }
        
        return render(request, 'budget/reports.html', context)
        
    except Exception as e:
        messages.error(request, f'Error loading reports: {str(e)}')
        return redirect('dashboard')


@login_required
def budget_view(request):
    """Budget planning page with category allocations."""
    try:
        now = timezone.now()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get all categories for user
        categories = Category.objects.filter(
            Q(user=request.user) | Q(user__isnull=True),
            type='expense'
        ).distinct()
        
        # Calculate budget statistics
        budget_categories = []
        total_budget = 0
        total_spent = 0
        
        for category in categories:
            # Mock budget data - in real app this would come from Budget model
            budget_amount = category.budget_limit if category.budget_limit > 0 else 500
            
            spent_amount = Transaction.objects.filter(
                user=request.user,
                category=category,
                transaction_type='expense',
                date__gte=this_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            remaining = budget_amount - spent_amount
            progress = (spent_amount / budget_amount * 100) if budget_amount > 0 else 0
            
            budget_categories.append({
                'id': category.id,
                'name': category.name,
                'description': f"Budget for {category.name}",
                'budget': budget_amount,
                'spent': spent_amount,
                'remaining': remaining,
                'progress': min(progress, 150)  # Cap at 150% for display
            })
            
            total_budget += budget_amount
            total_spent += spent_amount
        
        remaining_budget = total_budget - total_spent
        spent_percentage = (total_spent / total_budget * 100) if total_budget > 0 else 0
        budget_health_score = max(0, 100 - spent_percentage) if spent_percentage <= 100 else 0
        
        # Chart data
        budget_labels = [cat['name'] for cat in budget_categories[:6]]
        budget_amounts = [float(cat['budget']) for cat in budget_categories[:6]]
        
        # Trend data (mock)
        trend_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        budget_trend = [2000, 2100, 2050, 2200, 2150, 2000]
        actual_trend = [1800, 2250, 1900, 2100, 2400, 1850]
        
        # Budget tips
        budget_tips = [
            {
                'title': 'Track Daily Spending',
                'description': 'Monitor your expenses daily to stay on track',
                'icon': 'fa-eye',
                'color': 'text-info'
            },
            {
                'title': 'Use the 50/30/20 Rule',
                'description': '50% needs, 30% wants, 20% savings',
                'icon': 'fa-percentage',
                'color': 'text-success'
            },
            {
                'title': 'Review Monthly',
                'description': 'Adjust your budget based on spending patterns',
                'icon': 'fa-calendar-check',
                'color': 'text-warning'
            },
            {
                'title': 'Emergency Fund',
                'description': 'Build an emergency fund of 3-6 months expenses',
                'icon': 'fa-shield-alt',
                'color': 'text-danger'
            }
        ]
        
        context = {
            'budget_categories': budget_categories,
            'available_categories': categories,
            'total_budget': total_budget,
            'total_spent': total_spent,
            'remaining_budget': remaining_budget,
            'spent_percentage': spent_percentage,
            'budget_health_score': int(budget_health_score),
            'budget_labels': json.dumps(budget_labels),
            'budget_amounts': json.dumps(budget_amounts),
            'trend_labels': json.dumps(trend_labels),
            'budget_trend': json.dumps(budget_trend),
            'actual_trend': json.dumps(actual_trend),
            'budget_tips': budget_tips,
        }
        
        return render(request, 'budget/budget.html', context)
        
    except Exception as e:
        messages.error(request, f'Error loading budget: {str(e)}')
        return redirect('dashboard')
