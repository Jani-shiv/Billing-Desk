"""
Mobile API Views for Budget Tracker
Provides REST API endpoints for mobile application consumption
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json

from .models import Transaction, Category, Goal, UserProfile, RecurringBill
from .serializers import (
    TransactionSerializer, CategorySerializer, GoalSerializer,
    UserProfileSerializer, RecurringBillSerializer, UserSerializer
)


@api_view(['POST'])
@permission_classes([])  # Allow unauthenticated access
def mobile_login(request):
    """Mobile login endpoint that returns authentication token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        
        # Get or create user profile
        profile, profile_created = UserProfile.objects.get_or_create(user=user)
        
        return Response({
            'success': True,
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': {
                'currency': profile.currency,
                'budget_period': profile.budget_period,
            }
        })
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([])  # Allow unauthenticated access
def mobile_register(request):
    """Mobile registration endpoint"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not all([username, email, password]):
        return Response({
            'error': 'Username, email, and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({
            'error': 'Username already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({
            'error': 'Email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create user profile
        profile = UserProfile.objects.create(user=user)
        
        # Create default categories
        default_categories = [
            {'name': 'Food & Dining', 'type': 'expense'},
            {'name': 'Transportation', 'type': 'expense'},
            {'name': 'Shopping', 'type': 'expense'},
            {'name': 'Entertainment', 'type': 'expense'},
            {'name': 'Bills & Utilities', 'type': 'expense'},
            {'name': 'Salary', 'type': 'income'},
            {'name': 'Freelance', 'type': 'income'},
            {'name': 'Investment', 'type': 'income'},
        ]
        
        for cat_data in default_categories:
            Category.objects.create(
                name=cat_data['name'],
                type=cat_data['type'],
                user=user
            )
        
        token = Token.objects.create(user=user)
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_dashboard(request):
    """Mobile dashboard data endpoint"""
    user = request.user
    
    # Get current month transactions
    current_month = timezone.now().replace(day=1)
    next_month = (current_month + timedelta(days=32)).replace(day=1)
    
    transactions = Transaction.objects.filter(
        user=user,
        date__gte=current_month,
        date__lt=next_month
    )
    
    # Calculate totals
    total_income = transactions.filter(type='income').aggregate(
        total=Sum('amount'))['total'] or 0
    total_expenses = transactions.filter(type='expense').aggregate(
        total=Sum('amount'))['total'] or 0
    net_balance = total_income - total_expenses
    
    # Get recent transactions
    recent_transactions = Transaction.objects.filter(user=user).order_by('-date')[:10]
    
    # Get expense distribution
    expense_categories = transactions.filter(type='expense').values(
        'category__name'
    ).annotate(
        total=Sum('amount')
    ).order_by('-total')[:5]
    
    # Get goals progress
    goals = Goal.objects.filter(user=user, status='active')
    
    return Response({
        'success': True,
        'data': {
            'summary': {
                'total_income': float(total_income),
                'total_expenses': float(total_expenses),
                'net_balance': float(net_balance),
                'transaction_count': transactions.count()
            },
            'recent_transactions': TransactionSerializer(recent_transactions, many=True).data,
            'expense_distribution': list(expense_categories),
            'goals': GoalSerializer(goals, many=True).data
        }
    })


class MobileTransactionViewSet(viewsets.ModelViewSet):
    """Mobile Transaction API ViewSet"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly transaction summary"""
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month', timezone.now().month)
        
        start_date = datetime(int(year), int(month), 1).date()
        if int(month) == 12:
            end_date = datetime(int(year) + 1, 1, 1).date()
        else:
            end_date = datetime(int(year), int(month) + 1, 1).date()
        
        transactions = self.get_queryset().filter(
            date__gte=start_date,
            date__lt=end_date
        )
        
        income = transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        expenses = transactions.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        return Response({
            'month': f"{year}-{month:02d}",
            'income': float(income),
            'expenses': float(expenses),
            'net': float(income - expenses),
            'transaction_count': transactions.count()
        })


class MobileCategoryViewSet(viewsets.ModelViewSet):
    """Mobile Category API ViewSet"""
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True)
        ).order_by('name')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MobileGoalViewSet(viewsets.ModelViewSet):
    """Mobile Goal API ViewSet"""
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_progress(self, request, pk=None):
        """Add progress to a goal"""
        goal = self.get_object()
        amount = float(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response({
                'error': 'Amount must be positive'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        goal.current_amount += amount
        goal.save()
        
        # Check if goal is completed
        if goal.current_amount >= goal.target_amount:
            goal.status = 'completed'
            goal.save()
        
        return Response({
            'success': True,
            'message': f'Added {amount} to goal',
            'goal': GoalSerializer(goal).data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mobile_statistics(request):
    """Get detailed statistics for mobile app"""
    user = request.user
    
    # Get date range (default to last 6 months)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=180)
    
    transactions = Transaction.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    )
    
    # Monthly trend
    monthly_data = []
    current_date = start_date.replace(day=1)
    
    while current_date <= end_date:
        if current_date.month == 12:
            next_month = current_date.replace(year=current_date.year + 1, month=1)
        else:
            next_month = current_date.replace(month=current_date.month + 1)
        
        month_transactions = transactions.filter(
            date__gte=current_date,
            date__lt=next_month
        )
        
        income = month_transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        expenses = month_transactions.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        monthly_data.append({
            'month': current_date.strftime('%Y-%m'),
            'income': float(income),
            'expenses': float(expenses),
            'net': float(income - expenses)
        })
        
        current_date = next_month
    
    # Category breakdown
    category_breakdown = transactions.filter(type='expense').values(
        'category__name'
    ).annotate(
        total=Sum('amount')
    ).order_by('-total')
    
    return Response({
        'success': True,
        'data': {
            'monthly_trend': monthly_data,
            'category_breakdown': list(category_breakdown),
            'total_income': float(transactions.filter(type='income').aggregate(
                total=Sum('amount'))['total'] or 0),
            'total_expenses': float(transactions.filter(type='expense').aggregate(
                total=Sum('amount'))['total'] or 0),
        }
    })


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def mobile_profile(request):
    """Get or update user profile"""
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data,
            'profile': UserProfileSerializer(profile).data
        })
    
    elif request.method == 'PUT':
        # Update user fields
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()
        
        # Update profile fields
        profile.phone = request.data.get('phone', profile.phone)
        profile.bio = request.data.get('bio', profile.bio)
        profile.currency = request.data.get('currency', profile.currency)
        profile.budget_period = request.data.get('budget_period', profile.budget_period)
        profile.email_notifications = request.data.get('email_notifications', profile.email_notifications)
        
        if 'date_of_birth' in request.data:
            profile.date_of_birth = request.data['date_of_birth']
        
        profile.save()
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': UserSerializer(user).data,
            'profile': UserProfileSerializer(profile).data
        })
