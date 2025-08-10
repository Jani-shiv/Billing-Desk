<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in as admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    header('Location: ../login.php');
    exit();
}

require_once 'includes/header.php';

// Get statistics
$stats = [
    'total_users' => 0,
    'total_transactions' => 0,
    'total_income' => 0,
    'total_expenses' => 0
];

// Get total users
$sql = "SELECT COUNT(*) as count FROM users";
$result = $conn->query($sql);
$stats['total_users'] = $result->fetch_assoc()['count'];

// Get total transactions and amounts
$sql = "SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses
        FROM transactions t
        JOIN categories c ON t.category_id = c.id";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$stats['total_transactions'] = $row['total_count'];
$stats['total_income'] = $row['total_income'];
$stats['total_expenses'] = $row['total_expenses'];

// Get recent users
$recent_users = [];
$sql = "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    $recent_users[] = $row;
}

// Get recent transactions
$recent_transactions = [];
$sql = "SELECT t.*, u.name as user_name, c.type as type 
        FROM transactions t 
        JOIN users u ON t.user_id = u.id 
        JOIN categories c ON t.category_id = c.id
        ORDER BY t.created_at DESC LIMIT 5";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    $recent_transactions[] = $row;
}

// Get monthly transaction data for chart
$monthly_data = [];
$sql = "SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m') as month,
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) as expense
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
        ORDER BY month ASC";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    $monthly_data[] = $row;
}
?>

<!-- Page Header -->
<div class="page-header">
    <div class="row align-items-center">
        <div class="col">
            <h1 class="page-title">Dashboard Overview</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">Home</a></li>
                    <li class="breadcrumb-item active">Dashboard</li>
                </ol>
            </nav>
        </div>
        <div class="col-auto">
            <button class="btn btn-action" data-bs-toggle="modal" data-bs-target="#exportModal">
                <i class="fas fa-download me-2"></i> Export Report
            </button>
        </div>
    </div>
</div>

<!-- Statistics Cards -->
<div class="row g-4 mb-4">
    <div class="col-md-3">
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-users"></i>
            </div>
            <h3 class="mb-2"><?php echo number_format($stats['total_users']); ?></h3>
            <p class="mb-0">Total Users</p>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-exchange-alt"></i>
            </div>
            <h3 class="mb-2"><?php echo number_format($stats['total_transactions']); ?></h3>
            <p class="mb-0">Total Transactions</p>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-arrow-up"></i>
            </div>
            <h3 class="mb-2">$<?php echo number_format($stats['total_income'], 2); ?></h3>
            <p class="mb-0">Total Income</p>
        </div>
    </div>
    <div class="col-md-3">
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-arrow-down"></i>
            </div>
            <h3 class="mb-2">$<?php echo number_format($stats['total_expenses'], 2); ?></h3>
            <p class="mb-0">Total Expenses</p>
        </div>
    </div>
</div>

<!-- Charts Row -->
<div class="row g-4 mb-4">
    <div class="col-md-8">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title mb-4">Monthly Transaction Overview</h5>
                <div style="height: 250px;">
                    <canvas id="transactionChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title mb-4">Income vs Expenses</h5>
                <div style="height: 250px;">
                    <canvas id="pieChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Recent Activity -->
<div class="row g-4">
    <div class="col-md-6">
        <div class="table-container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Recent Users</h5>
                <a href="users.php" class="btn btn-action btn-sm">
                    View All <i class="fas fa-arrow-right ms-1"></i>
                </a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_users as $user): ?>
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="user-avatar me-3">
                                        <?php echo strtoupper(substr($user['name'], 0, 1)); ?>
                                    </div>
                                    <?php echo htmlspecialchars($user['name']); ?>
                                </div>
                            </td>
                            <td><?php echo htmlspecialchars($user['email']); ?></td>
                            <td><?php echo date('M d, Y', strtotime($user['created_at'])); ?></td>
                            <td>
                                <a href="user_details.php?id=<?php echo $user['id']; ?>" 
                                   class="btn btn-action btn-sm">
                                    <i class="fas fa-eye"></i> View
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="table-container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Recent Transactions</h5>
                <a href="transactions.php" class="btn btn-action btn-sm">
                    View All <i class="fas fa-arrow-right ms-1"></i>
                </a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_transactions as $transaction): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($transaction['user_name']); ?></td>
                            <td>$<?php echo number_format($transaction['amount'], 2); ?></td>
                            <td>
                                <span class="badge bg-<?php echo $transaction['type'] === 'income' ? 'success' : 'danger'; ?>">
                                    <?php echo ucfirst($transaction['type']); ?>
                                </span>
                            </td>
                            <td><?php echo date('M d, Y', strtotime($transaction['created_at'])); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Export Modal -->
<div class="modal fade" id="exportModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Export Report</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form action="export_report.php" method="POST">
                    <div class="mb-3">
                        <label class="form-label">Report Type</label>
                        <select class="form-select" name="report_type" required>
                            <option value="users">Users Report</option>
                            <option value="transactions">Transactions Report</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Date Range</label>
                        <select class="form-select" name="date_range" required>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Format</label>
                        <select class="form-select" name="format" required>
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Export</button>
            </div>
        </div>
    </div>
</div>

<!-- Add Chart.js before closing body tag -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas elements
    const transactionChart = document.getElementById('transactionChart');
    const pieChart = document.getElementById('pieChart');

    if (transactionChart) {
        const ctx = transactionChart.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: <?php echo json_encode(array_column($monthly_data, 'month')); ?>,
                datasets: [{
                    label: 'Income',
                    data: <?php echo json_encode(array_column($monthly_data, 'income')); ?>,
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Expenses',
                    data: <?php echo json_encode(array_column($monthly_data, 'expense')); ?>,
                    borderColor: '#f72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('en-US', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                            },
                            maxRotation: 0
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    if (pieChart) {
        const ctx = pieChart.getContext('2d');
        const totalIncome = <?php echo $stats['total_income']; ?>;
        const totalExpenses = <?php echo $stats['total_expenses']; ?>;
        const total = totalIncome + totalExpenses;

        if (total > 0) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Income', 'Expenses'],
                    datasets: [{
                        data: [totalIncome, totalExpenses],
                        backgroundColor: ['#4cc9f0', '#f72585'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 10,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                boxWidth: 8
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return context.label + ': $' + value.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        } else {
            pieChart.style.display = 'none';
            pieChart.parentElement.innerHTML = '<div class="text-center text-muted">No transaction data available</div>';
        }
    }
});
</script>

<?php require_once 'includes/footer.php'; ?> 