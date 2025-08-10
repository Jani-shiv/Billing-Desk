from django.contrib import admin
from .models import (
    Category, Transaction, Goal, RecurringBill,
    SplitBill, MerchantKeyword, CurrencyRate, FinancialHealthScore
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'budget_limit', 'user', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['name', 'user__username']
    ordering = ['name']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'description', 'amount', 'type', 'category', 'user', 'date'
    ]
    list_filter = ['type', 'category', 'date', 'created_at']
    search_fields = ['description', 'user__username']
    date_hierarchy = 'date'
    ordering = ['-date']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'target_amount', 'current_amount', 'deadline',
        'user', 'is_achieved'
    ]
    list_filter = ['status', 'deadline']
    search_fields = ['title', 'user__username']
    ordering = ['deadline']
    
    def is_achieved(self, obj):
        return obj.current_amount >= obj.target_amount
    is_achieved.boolean = True
    is_achieved.short_description = 'Achieved'


@admin.register(RecurringBill)
class RecurringBillAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'amount', 'frequency', 'due_date', 'user'
    ]
    list_filter = ['frequency', 'due_date']
    search_fields = ['title', 'user__username']
    ordering = ['due_date']


@admin.register(SplitBill)
class SplitBillAdmin(admin.ModelAdmin):
    list_display = ['transaction', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'transaction__description']
    ordering = ['-created_at']


@admin.register(MerchantKeyword)
class MerchantKeywordAdmin(admin.ModelAdmin):
    list_display = ['keyword', 'category', 'created_at']
    list_filter = ['category']
    search_fields = ['keyword', 'category__name']
    ordering = ['keyword']


@admin.register(CurrencyRate)
class CurrencyRateAdmin(admin.ModelAdmin):
    list_display = ['currency', 'rate', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['currency']
    ordering = ['-updated_at']


@admin.register(FinancialHealthScore)
class FinancialHealthScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'month', 'created_at']
    list_filter = ['month', 'created_at']
    search_fields = ['user__username']
    ordering = ['-month']
