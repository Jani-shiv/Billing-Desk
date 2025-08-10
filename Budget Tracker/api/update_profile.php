<?php
session_start();
require_once '../config/database.php';

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

// Validate input
if (!isset($data['name']) || !isset($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$user_id = $_SESSION['user_id'];
$name = trim($data['name']);
$email = trim($data['email']);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Check if email already exists for another user
$check_email = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
$check_email->bind_param("si", $email, $user_id);
$check_email->execute();
$result = $check_email->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already in use']);
    exit();
}

// Update user profile
$update_sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
$stmt = $conn->prepare($update_sql);
$stmt->bind_param("ssi", $name, $email, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating profile']);
}

$stmt->close();
$conn->close();
?> 