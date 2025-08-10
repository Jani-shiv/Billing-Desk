from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .favicon import favicon_view

urlpatterns = [
    # Authentication
    path('', views.dashboard_view, name='dashboard'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register_view, name='register'),
    
    # Static files
    path('favicon.ico', favicon_view, name='favicon'),
    
    # Main pages
    path('transactions/', views.transactions_view, name='transactions'),
    path('goals/', views.goals_view, name='goals'),
    path('profile/', views.profile_view, name='profile'),
    path('bills/', views.bills_view, name='bills'),
    path('reports/', views.reports_view, name='reports'),
    path('budget/', views.budget_view, name='budget'),
    
    # API endpoints
    path('api/expense-distribution/', 
         views.api_expense_distribution, 
         name='api_expense_distribution'),
    path('api/monthly-trend/', 
         views.api_monthly_trend, 
         name='api_monthly_trend'),
    path('api/transactions/', 
         views.api_transactions, 
         name='api_transactions'),
    path('api/add-transaction/', 
         views.api_add_transaction, 
         name='api_add_transaction'),
    path('api/get-transaction/<int:transaction_id>/', 
         views.api_get_transaction, 
         name='api_get_transaction'),
    path('api/update-transaction/<int:transaction_id>/', 
         views.api_update_transaction, 
         name='api_update_transaction'),
    path('api/delete-transaction/<int:transaction_id>/', 
         views.api_delete_transaction, 
         name='api_delete_transaction'),
    path('api/add-goal/', 
         views.api_add_goal, 
         name='api_add_goal'),
    path('api/delete-goal/<int:goal_id>/', 
         views.api_delete_goal, 
         name='api_delete_goal'),
    path('api/add-to-goal/<int:goal_id>/', 
         views.api_add_to_goal, 
         name='api_add_to_goal'),
    path('api/update-profile/', 
         views.update_profile_api, 
         name='api_update_profile'),
    path('api/toggle-notifications/', 
         views.toggle_notifications_api, 
         name='api_toggle_notifications'),
]
