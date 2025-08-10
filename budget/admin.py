from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Category, Transaction, Goal, RecurringBill, SplitBill, FinancialHealthScore, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

admin.site.register(Category)
admin.site.register(Transaction)
admin.site.register(Goal)
admin.site.register(RecurringBill)
admin.site.register(SplitBill)
admin.site.register(FinancialHealthScore)
admin.site.register(UserProfile)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)