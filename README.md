

# Belling-Desk

A modern, advanced budget tracker built with PHP, MySQL, Bootstrap 5, and JavaScript.

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

## Setup
1. Import the database schema from `Budget Tracker/config/database.sql` (database name: `Belling-Desk`).
2. Configure database credentials in `Budget Tracker/config/database.php`.
3. Place all project files in your XAMPP `htdocs` directory.
4. Access the app via `http://localhost/Billing-Desk/Budget Tracker/`.

## Folder Structure
- `Budget Tracker/` - Main app files
- `assets/` - CSS, JS, images
- `admin/` - Admin panel
- `api/` - API endpoints
- `config/` - Database config and schema
- `sql/` - SQL migrations

## Author
Jani-shiv

---
For support or feature requests, open an issue or contact the author.
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
