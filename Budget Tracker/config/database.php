<?php
// Session timeout protection
function check_session_timeout() {
    $timeout = 30 * 60; // 30 minutes
    $warning_time = 5 * 60; // 5 minutes warning before timeout
    
    if (isset($_SESSION['last_activity'])) {
        $inactive_time = time() - $_SESSION['last_activity'];
        
        // Show warning if close to timeout
        if ($inactive_time > ($timeout - $warning_time) && !isset($_SESSION['warning_shown'])) {
            $_SESSION['warning_shown'] = true;
            return 'warning';
        }
        
        // Logout if timeout exceeded
        if ($inactive_time > $timeout) {
            session_unset();
            session_destroy();
            header("Location: login.php?msg=timeout");
            exit();
        }
    }
    
    $_SESSION['last_activity'] = time();
    return 'active';
}

// Database configuration
$db_host = 'localhost:3306';  // Changed port to 3306
$db_user = 'root';
$db_pass = '';
$db_name = 'budget_planner';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");

// Create tables if they don't exist
$sql = "
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(64) DEFAULT NULL,
    token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
";

// Execute SQL queries
$queries = explode(';', $sql);
foreach ($queries as $query) {
    if (trim($query) != '') {
        if (!$conn->query($query)) {
            error_log("Error creating table: " . $conn->error);
        }
    }
}

// Check if admin user exists and create if not
$admin_email = 'admin@budgetplanner.com';
$check_admin = $conn->prepare("SELECT id FROM admin_users WHERE email = ?");
$check_admin->bind_param("s", $admin_email);
$check_admin->execute();
$result = $check_admin->get_result();

if ($result->num_rows == 0) {
    // Create default admin user
    $admin_name = 'Admin';
    $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
    $insert_admin = $conn->prepare("INSERT INTO admin_users (name, email, password) VALUES (?, ?, ?)");
    $insert_admin->bind_param("sss", $admin_name, $admin_email, $admin_password);
    $insert_admin->execute();
}

// Check if demo user exists and create if not
$email = 'demo@example.com';
$check_user = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check_user->bind_param("s", $email);
$check_user->execute();
$result = $check_user->get_result();

if ($result->num_rows == 0) {
    // Create demo user
    $name = 'Demo User';
    $password = password_hash('demo12345', PASSWORD_DEFAULT);
    $insert_user = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $insert_user->bind_param("sss", $name, $email, $password);
    
    if ($insert_user->execute()) {
        $user_id = $conn->insert_id;
        
        // Insert default categories
        $categories = [
            ['Salary', 'income'],
            ['Investments', 'income'],
            ['Freelance', 'income'],
            ['Rent', 'expense'],
            ['Food', 'expense'],
            ['Transportation', 'expense'],
            ['Utilities', 'expense'],
            ['Shopping', 'expense'],
            ['Entertainment', 'expense'],
            ['Healthcare', 'expense']
        ];
        
        $stmt = $conn->prepare("INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)");
        foreach ($categories as $category) {
            $stmt->bind_param("iss", $user_id, $category[0], $category[1]);
            $stmt->execute();
        }
    }
}

// CSRF Protection Functions
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        return false;
    }
    return true;
}

function csrf_input() {
    return '<input type="hidden" name="csrf_token" value="' . generate_csrf_token() . '">';
}

// Default categories setup
function ensure_user_has_categories($conn, $user_id) {
    // Check if user has any categories
    $check_sql = "SELECT COUNT(*) as category_count FROM categories WHERE user_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $user_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $count = $result->fetch_assoc()['category_count'];
    
    if ($count == 0) {
        // Define default categories
        $default_categories = [
            ['name' => 'Salary', 'type' => 'income'],
            ['name' => 'Investments', 'type' => 'income'],
            ['name' => 'Freelance', 'type' => 'income'],
            ['name' => 'Rent', 'type' => 'expense'],
            ['name' => 'Food', 'type' => 'expense'],
            ['name' => 'Transportation', 'type' => 'expense'],
            ['name' => 'Utilities', 'type' => 'expense'],
            ['name' => 'Shopping', 'type' => 'expense'],
            ['name' => 'Entertainment', 'type' => 'expense'],
            ['name' => 'Healthcare', 'type' => 'expense']
        ];
        
        // Insert default categories
        $sql = "INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        foreach ($default_categories as $category) {
            $stmt->bind_param("iss", $user_id, $category['name'], $category['type']);
            $stmt->execute();
        }
        
        return true;
    }
    
    return false;
}
?> 