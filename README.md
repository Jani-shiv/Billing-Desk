# Belling-Desk Django Budget Tracker

A modern, advanced budget tracker built with Django, Bootstrap 5, and JavaScript.

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

## Setup Instructions

### Prerequisites
- Python 3.8+
- Virtual environment (recommended)

### Installation
1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd Billing-Desk
   ```
3. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```
7. Run development server:
   ```bash
   python manage.py runserver
   ```
8. Access at `http://127.0.0.1:8000/`

## Project Structure
```
bellingdesk/
├── bellingdesk/          # Main project settings
├── budget/               # Budget tracker app
├── static/               # CSS, JS, images
├── templates/            # HTML templates
├── media/                # User uploaded files
└── requirements.txt      # Python dependencies
```

## Author
Jani-shiv

---
For support or feature requests, open an issue or contact the author.
