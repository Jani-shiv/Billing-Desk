# Billing-Desk - Complete Budget Tracker Solution

A comprehensive budget tracking platform with Django backend and React Native mobile app.

## 🚀 **Full Stack Features**

### **Django Web Application**
- User authentication and authorization
- Complete budget tracking with transactions, categories, goals
- Tax planning and financial analytics
- Beautiful Bootstrap 5 responsive UI
- Admin panel for user management
- RESTful API for mobile consumption

### **React Native Mobile App**
- Cross-platform (Android/iOS) support  
- Material Design UI with React Native Paper
- Redux state management with persistence
- Real-time data synchronization with Django backend
- Expo development for easy deployment
- Token-based authentication

## Features
- AI Auto-Expense Categorization
- Visual Budget Progress Bars
- Recurring Bills & Auto-Reminders (Email/SMS)
- Expense Heatmap Calendar
- Split Bills with Friends
- Multi-Currency with Live Rates
- Dark Mode / Light Mode Toggle
- Export Data as PDF & Excel
- Monthly Financial Health Score
- Savings Suggestions AI
- Responsive, animated UI

## 🏗️ **Project Architecture**

### **Backend (Django)**
- **Framework**: Django 5.0.1 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Token-based authentication for API
- **Features**: Complete CRUD operations, user management, financial analytics

### **Mobile App (React Native)**
- **Framework**: React Native 0.80.2 with Expo
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: React Native Paper (Material Design)
- **Navigation**: React Navigation 7.x
- **Charts**: React Native Chart Kit

## 🚀 **Setup Instructions**

### **Django Backend Setup**

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Jani-shiv/Billing-Desk.git
   cd Billing-Desk
   ```

2. **Create Virtual Environment**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Setup**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run Django Server**:
   ```bash
   python manage.py runserver 127.0.0.1:8001
   ```

### **React Native Mobile App Setup**

1. **Navigate to Mobile App**:
   ```bash
   cd BudgetTrackerMobile
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npx expo start
   ```

4. **Run on Device**:
   - Install **Expo Go** app on your phone
   - Scan QR code from terminal
   - Or press `w` for web browser

## 📱 **Mobile App Features**
- **Authentication**: Login/Register with Django backend
- **Dashboard**: Financial overview with charts and analytics  
- **Transactions**: Add, edit, delete transactions with categories
- **Goals**: Set and track financial goals with progress indicators
- **Profile**: User profile management and settings
- **Offline Support**: Redux Persist for offline data storage
- **Real-time Sync**: Automatic synchronization with Django API

## 🌐 **API Endpoints**
- `POST /mobile/login/` - User login
- `POST /mobile/register/` - User registration
- `GET /mobile/dashboard/` - Dashboard data
- `GET/POST /mobile/transactions/` - Transaction management
- `GET/POST /mobile/goals/` - Goals management
- `GET/PUT /mobile/profile/` - Profile management

## 📁 **Project Structure**
```
Billing-Desk/
├── bellingdesk/              # Django project settings
├── budget/                   # Django budget app
│   ├── mobile_api.py        # Mobile API views
│   ├── serializers.py       # API serializers
│   └── mobile_urls.py       # Mobile API URLs
├── BudgetTrackerMobile/      # React Native app
│   ├── src/
│   │   ├── store/           # Redux store and slices
│   │   └── config/          # API and theme configuration
│   ├── App.js               # Main app component
│   └── package.json         # Mobile dependencies
├── static/                   # Django static files
├── templates/                # Django templates
└── requirements.txt          # Python dependencies
```

## Author
Jani-shiv

---
For support or feature requests, open an issue or contact the author.
<<<<<<< HEAD
=======
│   │   │   ├── style.css
│   │   │   └── tax-planning.css
│   │   ├── images/
│   │   │   ├── icons/
│   │   │   ├── profiles/
│   │   │   └── *.svg, *.png
│   │   └── js/
│   │       ├── dashboard.js
│   │       ├── main.js
│   │       └── transactions.js
│   ├── config/
│   │   ├── database.php
│   │   ├── database.sql
│   │   ├── init_db.php
│   │   └── update_schema.php
│   ├── sql/
│   │   └── create_tax_deductions_table.sql
│   └── *.php (Main application files)
├── login.php
└── sql/
    └── remember_tokens.sql
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

*   [Chart.js](https://www.chartjs.org/)
*   [Bootstrap](https://getbootstrap.com/)
*   [GIPHY](https://giphy.com/) for the awesome GIFs!

---

Made with ❤️ by the **OPEN-FINANCE-VOYAGER** team.
>>>>>>> 377be8e0f35cd09e860ad9b05cc92b19b6495503
