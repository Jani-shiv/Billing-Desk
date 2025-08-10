<?php
require_once 'database.php';

// Read SQL file
$sql = file_get_contents('database.sql');

// Execute multiple SQL statements
if ($conn->multi_query($sql)) {
    do {
        // Store first result set
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());

    echo "Database initialized successfully!";
} else {
    echo "Error initializing database: " . $conn->error;
}

$conn->close(); 