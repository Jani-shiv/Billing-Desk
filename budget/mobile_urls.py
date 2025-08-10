"""
Mobile API URLs for Budget Tracker
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from . import mobile_api

# Create router for ViewSets
router = DefaultRouter()
router.register(r'transactions', mobile_api.MobileTransactionViewSet, basename='mobile-transaction')
router.register(r'categories', mobile_api.MobileCategoryViewSet, basename='mobile-category')
router.register(r'goals', mobile_api.MobileGoalViewSet, basename='mobile-goal')

mobile_urlpatterns = [
    # Authentication endpoints
    path('auth/login/', mobile_api.mobile_login, name='mobile-login'),
    path('auth/register/', mobile_api.mobile_register, name='mobile-register'),
    path('auth/token/', obtain_auth_token, name='mobile-token'),
    
    # Dashboard and statistics
    path('dashboard/', mobile_api.mobile_dashboard, name='mobile-dashboard'),
    path('statistics/', mobile_api.mobile_statistics, name='mobile-statistics'),
    
    # Profile management
    path('profile/', mobile_api.mobile_profile, name='mobile-profile'),
    
    # Include router URLs
    path('', include(router.urls)),
]
