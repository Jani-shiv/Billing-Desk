"""
Django REST Framework Serializers for Mobile API
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, Category, Goal, UserProfile, RecurringBill, SplitBill


class UserSerializer(serializers.ModelSerializer):
    """User serializer for mobile API"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer for mobile API"""
    class Meta:
        model = UserProfile
        fields = [
            'phone', 'bio', 'date_of_birth', 'avatar', 
            'currency', 'budget_period', 'email_notifications'
        ]


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer for mobile API"""
    transaction_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'budget_limit', 'created_at', 'transaction_count', 'total_amount']
        read_only_fields = ['id', 'created_at', 'transaction_count', 'total_amount']
    
    def get_transaction_count(self, obj):
        """Get the number of transactions for this category"""
        return obj.transaction_set.count()
    
    def get_total_amount(self, obj):
        """Get the total amount spent in this category"""
        total = obj.transaction_set.aggregate(total=serializers.models.Sum('amount'))['total']
        return float(total) if total else 0.0


class TransactionSerializer(serializers.ModelSerializer):
    """Transaction serializer for mobile API"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'description', 'amount', 'type', 'date', 'currency',
            'created_at', 'category', 'category_name', 'category_type', 'user_name'
        ]
        read_only_fields = ['id', 'created_at', 'category_name', 'category_type', 'user_name']
    
    def validate_amount(self, value):
        """Validate that amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
    
    def validate(self, data):
        """Validate transaction data"""
        # Ensure category belongs to user or is global
        user = self.context['request'].user
        category = data.get('category')
        
        if category and category.user and category.user != user:
            raise serializers.ValidationError("You can only use your own categories")
        
        return data


class GoalSerializer(serializers.ModelSerializer):
    """Goal serializer for mobile API"""
    progress_percentage = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'description', 'target_amount', 'current_amount',
            'deadline', 'status', 'created_at', 'progress_percentage',
            'remaining_amount', 'is_overdue', 'days_remaining'
        ]
        read_only_fields = ['id', 'created_at', 'progress_percentage', 'remaining_amount', 'is_overdue', 'days_remaining']
    
    def get_progress_percentage(self, obj):
        """Get goal progress as percentage"""
        return obj.progress_percentage
    
    def get_remaining_amount(self, obj):
        """Get remaining amount to reach goal"""
        return float(max(0, obj.target_amount - obj.current_amount))
    
    def get_is_overdue(self, obj):
        """Check if goal is overdue"""
        if not obj.deadline:
            return False
        from django.utils import timezone
        return timezone.now().date() > obj.deadline and obj.status == 'active'
    
    def get_days_remaining(self, obj):
        """Get days remaining to deadline"""
        if not obj.deadline:
            return None
        from django.utils import timezone
        delta = obj.deadline - timezone.now().date()
        return delta.days
    
    def validate_target_amount(self, value):
        """Validate target amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Target amount must be positive")
        return value
    
    def validate_current_amount(self, value):
        """Validate current amount is not negative"""
        if value < 0:
            raise serializers.ValidationError("Current amount cannot be negative")
        return value


class RecurringBillSerializer(serializers.ModelSerializer):
    """Recurring bill serializer for mobile API"""
    next_payment_date = serializers.SerializerMethodField()
    is_due_soon = serializers.SerializerMethodField()
    
    class Meta:
        model = RecurringBill
        fields = [
            'id', 'description', 'amount', 'frequency', 'due_date',
            'created_at', 'next_payment_date', 'is_due_soon'
        ]
        read_only_fields = ['id', 'created_at', 'next_payment_date', 'is_due_soon']
    
    def get_next_payment_date(self, obj):
        """Calculate next payment date based on frequency"""
        from datetime import timedelta
        from django.utils import timezone
        
        if obj.frequency == 'weekly':
            return obj.due_date + timedelta(weeks=1)
        elif obj.frequency == 'monthly':
            return obj.due_date + timedelta(days=30)
        elif obj.frequency == 'yearly':
            return obj.due_date + timedelta(days=365)
        return obj.due_date
    
    def get_is_due_soon(self, obj):
        """Check if bill is due within 3 days"""
        from datetime import timedelta
        from django.utils import timezone
        
        due_threshold = timezone.now().date() + timedelta(days=3)
        return obj.due_date <= due_threshold


class SplitBillSerializer(serializers.ModelSerializer):
    """Split bill serializer for mobile API"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SplitBill
        fields = [
            'id', 'amount', 'split_percentage', 'created_at', 'user_name'
        ]
        read_only_fields = ['id', 'created_at', 'user_name']
    
    def validate_split_percentage(self, value):
        """Validate split percentage is between 0 and 100"""
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Split percentage must be between 0 and 100")
        return value


class TransactionSummarySerializer(serializers.Serializer):
    """Serializer for transaction summary data"""
    total_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    transaction_count = serializers.IntegerField()
    period = serializers.CharField()


class CategorySummarySerializer(serializers.Serializer):
    """Serializer for category summary data"""
    category_name = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    transaction_count = serializers.IntegerField()
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class MonthlyTrendSerializer(serializers.Serializer):
    """Serializer for monthly trend data"""
    month = serializers.CharField()
    income = serializers.DecimalField(max_digits=10, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    net = serializers.DecimalField(max_digits=10, decimal_places=2)
    transaction_count = serializers.IntegerField()


class DashboardDataSerializer(serializers.Serializer):
    """Serializer for dashboard data"""
    summary = TransactionSummarySerializer()
    recent_transactions = TransactionSerializer(many=True)
    expense_distribution = CategorySummarySerializer(many=True)
    goals = GoalSerializer(many=True)
    upcoming_bills = RecurringBillSerializer(many=True)
