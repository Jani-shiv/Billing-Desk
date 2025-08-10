# Budget Tracker Mobile App

This mobile application provides a complete budget tracking solution for iOS and Android devices, consuming the Django REST API backend.

## Features

### 📱 Core Features
- **Authentication**: Login, Register, Token-based authentication
- **Dashboard**: Overview of income, expenses, balance, and recent transactions
- **Transactions**: Add, edit, delete, and view transaction history
- **Categories**: Manage income and expense categories
- **Goals**: Set savings goals and track progress
- **Statistics**: Monthly trends and spending analytics
- **Profile**: User profile management and settings

### 🔧 Technical Stack
- **Frontend**: React Native (Cross-platform iOS/Android)
- **Backend**: Django REST API
- **Authentication**: Token-based authentication
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **UI Components**: React Native Elements/Paper
- **Charts**: Victory Native for data visualization
- **Storage**: AsyncStorage for offline data

## API Endpoints

### Authentication
- `POST /mobile/auth/login/` - User login
- `POST /mobile/auth/register/` - User registration
- `POST /mobile/auth/token/` - Get auth token

### Dashboard
- `GET /mobile/dashboard/` - Get dashboard data
- `GET /mobile/statistics/` - Get detailed statistics

### Transactions
- `GET /mobile/transactions/` - List transactions
- `POST /mobile/transactions/` - Create transaction
- `PUT /mobile/transactions/{id}/` - Update transaction
- `DELETE /mobile/transactions/{id}/` - Delete transaction
- `GET /mobile/transactions/monthly_summary/` - Monthly summary

### Categories
- `GET /mobile/categories/` - List categories
- `POST /mobile/categories/` - Create category
- `PUT /mobile/categories/{id}/` - Update category
- `DELETE /mobile/categories/{id}/` - Delete category

### Goals
- `GET /mobile/goals/` - List goals
- `POST /mobile/goals/` - Create goal
- `PUT /mobile/goals/{id}/` - Update goal
- `DELETE /mobile/goals/{id}/` - Delete goal
- `POST /mobile/goals/{id}/add_progress/` - Add progress to goal

### Profile
- `GET /mobile/profile/` - Get user profile
- `PUT /mobile/profile/` - Update user profile

## Setup Instructions

### Backend Setup (Django)
1. Ensure Django REST Framework is installed and configured
2. Run migrations: `python manage.py migrate`
3. Create superuser: `python manage.py createsuperuser`
4. Start server: `python manage.py runserver`

### Mobile App Setup (React Native)

#### Prerequisites
- Node.js (v14 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

#### Installation
```bash
# Clone or navigate to the mobile app directory
cd BudgetTrackerMobile

# Install dependencies
npm install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS (Mac only)
npx react-native run-ios
```

#### Configuration
1. Update the API base URL in `src/config/api.js`
2. Configure app icons and splash screens
3. Set up push notifications (optional)

## Mobile App Structure

```
BudgetTrackerMobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Common components
│   │   ├── charts/          # Chart components
│   │   └── forms/           # Form components
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── dashboard/       # Dashboard screen
│   │   ├── transactions/    # Transaction screens
│   │   ├── goals/           # Goals screens
│   │   ├── profile/         # Profile screens
│   │   └── statistics/      # Statistics screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API services
│   ├── store/               # Redux store configuration
│   │   ├── slices/          # Redux slices
│   │   └── middleware/      # Custom middleware
│   ├── utils/               # Utility functions
│   ├── config/              # App configuration
│   └── assets/              # Images, fonts, etc.
├── android/                 # Android-specific code
├── ios/                     # iOS-specific code
└── package.json             # Dependencies and scripts
```

## Key Features Implementation

### 1. Authentication Flow
- Login/Register screens with form validation
- Token storage in AsyncStorage
- Automatic token refresh
- Logout functionality

### 2. Dashboard
- Income/Expense summary cards
- Recent transactions list
- Expense distribution chart
- Quick action buttons

### 3. Transaction Management
- Add transaction with category selection
- Edit existing transactions
- Delete transactions with confirmation
- Filter by date range and category
- Search functionality

### 4. Goals Tracking
- Create savings goals with target amounts and deadlines
- Visual progress indicators
- Add money to goals
- Goal completion celebrations

### 5. Analytics & Reports
- Monthly income/expense trends
- Category-wise spending breakdown
- Interactive charts and graphs
- Export functionality

### 6. Offline Support
- Cache data locally using AsyncStorage
- Sync when connection is restored
- Offline transaction creation

## API Testing

You can test the mobile API endpoints using tools like Postman or curl:

### Get Auth Token
```bash
curl -X POST http://127.0.0.1:8001/mobile/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

### Get Dashboard Data
```bash
curl -X GET http://127.0.0.1:8001/mobile/dashboard/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Create Transaction
```bash
curl -X POST http://127.0.0.1:8001/mobile/transactions/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Coffee",
    "amount": "5.50",
    "type": "expense",
    "category": 1,
    "date": "2025-08-10"
  }'
```

## Development Notes

### Security Considerations
- All API endpoints require authentication
- Token-based authentication for mobile apps
- Input validation on both client and server
- HTTPS in production

### Performance Optimization
- Pagination for large data sets
- Image optimization and lazy loading
- Efficient state management
- Debounced search functionality

### Testing
- Unit tests for utilities and services
- Integration tests for API calls
- E2E tests for critical user flows
- Device testing on multiple screen sizes

## Deployment

### Backend Deployment
- Deploy Django app to cloud provider (AWS, Heroku, DigitalOcean)
- Configure production database (PostgreSQL recommended)
- Set up HTTPS with SSL certificate
- Configure environment variables

### Mobile App Deployment
- Build release APK for Android
- Submit to Google Play Store
- Build and submit to Apple App Store (requires Apple Developer account)
- Set up crash reporting and analytics

## Support & Maintenance

### Monitoring
- API performance monitoring
- Error tracking and logging
- User analytics and usage patterns
- App store reviews and ratings

### Updates
- Regular security updates
- Feature enhancements based on user feedback
- Bug fixes and performance improvements
- Compatibility with new OS versions
