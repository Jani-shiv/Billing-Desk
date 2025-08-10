// Billing Desk - Enhanced JavaScript
// Main application JavaScript file

// Global variables
let charts = {};
let currentUser = null;
let isDarkMode = localStorage.getItem('darkMode') === 'enabled';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Application initialization
function initializeApp() {
    console.log('🚀 Billing Desk - Initializing...');
    
    // Set dark mode
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon();
    }
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize notifications
    initializeNotifications();
    
    // Initialize form validations
    initializeFormValidations();
    
    // Initialize charts if on dashboard
    if (document.getElementById('expenseChart')) {
        initializeDashboard();
    }
    
    console.log('✅ Billing Desk - Initialized successfully');
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize animations
function initializeAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card, .stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Animate progress bars
    setTimeout(() => {
        animateProgressBars();
    }, 500);
    
    // Animate numbers
    setTimeout(() => {
        animateNumbers();
    }, 800);
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
    progressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        if (progress) {
            bar.style.width = progress + '%';
        }
    });
}

// Animate numbers with counting effect
function animateNumbers() {
    const numberElements = document.querySelectorAll('[data-animate-number]');
    numberElements.forEach(element => {
        const finalValue = parseFloat(element.getAttribute('data-animate-number'));
        animateNumber(element, 0, finalValue);
    });
}

// Number animation function
function animateNumber(element, start, end, duration = 1500) {
    const range = end - start;
    const startTime = new Date().getTime();
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const decimals = element.getAttribute('data-decimals') || 0;
    
    function updateNumber() {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smoother animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (range * easeOutQuart);
        
        element.textContent = prefix + current.toFixed(decimals) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = prefix + end.toFixed(decimals) + suffix;
        }
    }
    
    updateNumber();
}

// Initialize dashboard specific features
function initializeDashboard() {
    // Load financial summary data
    loadFinancialSummary();
    
    // Initialize charts
    setTimeout(() => {
        initializeCharts();
    }, 1000);
    
    // Auto-refresh data every 5 minutes
    setInterval(() => {
        refreshDashboardData();
    }, 300000);
}

// Load financial summary
function loadFinancialSummary() {
    // This would typically fetch from an API
    const summaryElements = {
        totalBalance: document.getElementById('totalBalance'),
        monthlyIncome: document.getElementById('monthlyIncome'),
        monthlyExpenses: document.getElementById('monthlyExpenses'),
        monthlySavings: document.getElementById('monthlySavings')
    };
    
    // Add data attributes for animation
    Object.entries(summaryElements).forEach(([key, element]) => {
        if (element) {
            const value = parseFloat(element.textContent.replace(/[^0-9.-]/g, ''));
            element.setAttribute('data-animate-number', value);
            element.setAttribute('data-prefix', '$');
            element.setAttribute('data-decimals', '2');
        }
    });
}

// Initialize all charts
function initializeCharts() {
    // Expense Distribution Chart
    if (document.getElementById('expenseChart')) {
        loadExpenseChart();
    }
    
    // Monthly Trend Chart
    if (document.getElementById('trendChart')) {
        loadTrendChart();
    }
    
    // Health Score Chart
    if (document.getElementById('healthScoreChart')) {
        loadHealthScoreChart();
    }
}

// Load expense distribution chart
function loadExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Show loading state
    showChartLoading(ctx, 'Loading expense data...');
    
    fetch('/api/expense-distribution/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            charts.expenseChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels || ['Food', 'Transportation', 'Entertainment', 'Utilities'],
                    datasets: [{
                        data: data.data || [30, 20, 15, 35],
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ],
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverBorderWidth: 5,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    family: 'Inter'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#6366f1',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                    return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 2000,
                        easing: 'easeOutBounce'
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading expense chart:', error);
            showChartError(ctx, 'Failed to load expense data');
        });
}

// Load monthly trend chart
function loadTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    showChartLoading(ctx, 'Loading trend data...');
    
    fetch('/api/monthly-trend/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            charts.trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Income',
                            data: data.income || [3000, 3200, 2800, 3500, 3300, 3600],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#10b981',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        },
                        {
                            label: 'Expenses',
                            data: data.expenses || [2500, 2700, 2300, 2800, 2600, 2900],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#ef4444',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    family: 'Inter'
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                },
                                font: {
                                    family: 'Inter'
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    family: 'Inter'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#6366f1',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeOutQuart'
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading trend chart:', error);
            showChartError(ctx, 'Failed to load trend data');
        });
}

// Load health score chart
function loadHealthScoreChart() {
    const ctx = document.getElementById('healthScoreChart').getContext('2d');
    const scoreElement = document.getElementById('healthScore');
    const score = parseInt(scoreElement.textContent) || 75;
    
    charts.healthScoreChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: ['#6366f1', '#f1f5f9'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000,
                easing: 'easeOutBounce'
            }
        }
    });
    
    // Animate the score number
    animateNumber(scoreElement, 0, score, 2000);
}

// Show chart loading state
function showChartLoading(ctx, message = 'Loading...') {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    
    // Set up text style
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw loading text
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    ctx.fillText(message, centerX, centerY);
    
    // Draw loading spinner
    const spinnerRadius = 20;
    const lineWidth = 3;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    // Animate spinner
    let angle = 0;
    function drawSpinner() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw text
        ctx.fillText(message, centerX, centerY + 40);
        
        // Draw spinner
        ctx.beginPath();
        ctx.arc(centerX, centerY - 20, spinnerRadius, angle, angle + Math.PI * 1.5);
        ctx.stroke();
        
        angle += 0.1;
        if (angle < Math.PI * 4) { // Spin for 2 full rotations
            requestAnimationFrame(drawSpinner);
        }
    }
    
    drawSpinner();
    ctx.restore();
}

// Show chart error state
function showChartError(ctx, message = 'Error loading data') {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    
    // Set up text style
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw error message
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    ctx.fillText(message, centerX, centerY);
    
    // Draw error icon
    ctx.font = '24px Font Awesome';
    ctx.fillText('⚠', centerX, centerY - 30);
    
    ctx.restore();
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    updateDarkModeIcon();
    
    // Notify user
    showNotification(
        `Dark mode ${isDarkMode ? 'enabled' : 'disabled'}`,
        'info'
    );
}

// Update dark mode icon
function updateDarkModeIcon() {
    const icon = document.getElementById('darkModeIcon');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Notification system
function initializeNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notificationContainer')) {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1060;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    
    const typeClasses = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
    };
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.className = `alert ${typeClasses[type]} alert-dismissible fade show notification animate__animated animate__fadeInRight`;
    notification.innerHTML = `
        <i class="${icons[type]} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, duration);
    
    return notification;
}

// Loading state for buttons
function showLoading(button, loadingText = 'Loading...') {
    const originalText = button.innerHTML;
    const originalDisabled = button.disabled;
    
    button.innerHTML = `<span class="loading-spinner me-2"></span>${loadingText}`;
    button.disabled = true;
    
    return function stopLoading() {
        button.innerHTML = originalText;
        button.disabled = originalDisabled;
    };
}

// Form validation
function initializeFormValidations() {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', validateForm);
    });
}

// Validate form function
function validateForm(event) {
    const form = event.target;
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            field.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    // Password confirmation
    const password1 = form.querySelector('input[name="password1"]');
    const password2 = form.querySelector('input[name="password2"]');
    if (password1 && password2) {
        if (password1.value !== password2.value) {
            password2.classList.add('is-invalid');
            isValid = false;
            showNotification('Passwords do not match', 'error');
        }
    }
    
    if (!isValid) {
        event.preventDefault();
        showNotification('Please check the form for errors', 'error');
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Currency formatting
function formatCurrency(amount, currency = '$') {
    const num = parseFloat(amount);
    if (isNaN(num)) return currency + '0.00';
    
    return currency + num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Date formatting
function formatDate(date, format = 'MMM DD, YYYY') {
    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };
    
    return d.toLocaleDateString('en-US', options);
}

// Refresh dashboard data
function refreshDashboardData() {
    console.log('🔄 Refreshing dashboard data...');
    
    // Refresh charts
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    
    // Reinitialize charts
    setTimeout(() => {
        initializeCharts();
    }, 500);
    
    showNotification('Dashboard data refreshed', 'success', 2000);
}

// Get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// API helper functions
const API = {
    // Base API call
    call: async function(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        };
        
        const config = { ...defaultOptions, ...options };
        config.headers = { ...defaultOptions.headers, ...options.headers };
        
        try {
            const response = await fetch(endpoint, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },
    
    // GET request
    get: function(endpoint) {
        return this.call(endpoint, { method: 'GET' });
    },
    
    // POST request
    post: function(endpoint, data) {
        return this.call(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    put: function(endpoint, data) {
        return this.call(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    delete: function(endpoint) {
        return this.call(endpoint, { method: 'DELETE' });
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + D for dark mode toggle
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
    }
    
    // Ctrl/Cmd + N for new transaction
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        if (typeof showTransactionModal === 'function') {
            showTransactionModal();
        }
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
});

// Export functions for global use
window.BillingDesk = {
    showNotification,
    showLoading,
    toggleDarkMode,
    formatCurrency,
    formatDate,
    animateNumber,
    API,
    refreshDashboardData
};

console.log('📊 Billing Desk JavaScript loaded successfully');
