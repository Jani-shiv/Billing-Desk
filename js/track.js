document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    const trackForm = document.getElementById('trackForm');
    const resultsSection = document.getElementById('resultsSection');
    
    // Create ripple effect
    function createRipple(event, button) {
        const ripple = button.querySelector('.ripple');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        ripple.style.animation = 'none';
        ripple.offsetHeight; // Trigger reflow
        ripple.style.animation = 'ripple-animation 0.6s linear';
    }
    
    // Add ripple effect to track button
    const trackBtn = document.querySelector('.track-btn');
    trackBtn.addEventListener('click', function(e) {
        createRipple(e, this);
    });
    
    // Generate mock ticket data for demo
    function generateMockTickets() {
        const mockTickets = [
            {
                ticketId: 'BRK123456789',
                type: 'breakdown',
                description: 'CNC machine not working properly',
                userPhone: '1234567890',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                status: 'processing'
            },
            {
                ticketId: 'FAC987654321',
                type: 'facility',
                description: 'AC not cooling in assembly shop',
                userPhone: '1234567890',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                status: 'resolved'
            },
            {
                ticketId: 'BRK456789123',
                type: 'breakdown',
                description: 'ETM equipment failure',
                userPhone: '9876543210',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                status: 'received'
            }
        ];
        
        // Only add mock tickets if none exist
        const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        if (existingTickets.length === 0) {
            localStorage.setItem('userTickets', JSON.stringify(mockTickets));
        }
    }
    
    // Search for tickets
    function searchTickets(query) {
        const userTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        const userPhone = localStorage.getItem('userPhone');
        
        // Search by ticket ID
        let ticket = userTickets.find(t => t.ticketId.toLowerCase() === query.toLowerCase());
        
        // If not found by ticket ID, search by phone number
        if (!ticket && query === userPhone) {
            // Return the most recent ticket for this phone number
            const userTicketsByPhone = userTickets.filter(t => t.userPhone === userPhone);
            ticket = userTicketsByPhone.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        }
        
        return ticket;
    }
    
    // Display ticket information
    function displayTicket(ticket) {
        document.getElementById('displayTicketId').textContent = ticket.ticketId;
        document.getElementById('displayTicketType').textContent = ticket.type.toUpperCase();
        
        // Format description based on ticket type
        let description = '';
        if (ticket.type === 'breakdown') {
            description = `${ticket.department || 'Department'}: ${ticket.description}`;
        } else if (ticket.type === 'facility') {
            description = ticket.issues ? ticket.issues.map(issue => issue.issue).join(', ') : ticket.description;
        } else {
            description = ticket.description;
        }
        
        document.getElementById('displayDescription').textContent = description;
        document.getElementById('displayDate').textContent = new Date(ticket.createdAt).toLocaleDateString();
        
        // Update progress based on status
        updateProgress(ticket.status);
        
        // Show results section with animation
        resultsSection.style.display = 'block';
        setTimeout(() => {
            resultsSection.style.opacity = '1';
            resultsSection.style.transform = 'translateY(0) scale(1)';
        }, 100);
    }
    
    // Update progress visualization
    function updateProgress(status) {
        const steps = document.querySelectorAll('.progress-step');
        const progressFill = document.querySelector('.progress-fill');
        const statusMessage = document.getElementById('statusMessage');
        
        // Reset all steps
        steps.forEach(step => step.classList.remove('active'));
        
        let activeStep = 1;
        let message = '';
        let fillWidth = '0%';
        
        switch (status) {
            case 'received':
                activeStep = 1;
                message = 'Your ticket has been received and is being reviewed.';
                fillWidth = '0%';
                break;
            case 'processing':
                activeStep = 2;
                message = 'Your ticket is currently being processed by our team.';
                fillWidth = '50%';
                break;
            case 'resolved':
                activeStep = 3;
                message = 'Your ticket has been resolved successfully!';
                fillWidth = '100%';
                break;
        }
        
        // Activate steps with animation
        for (let i = 1; i <= activeStep; i++) {
            setTimeout(() => {
                steps[i - 1].classList.add('active');
            }, i * 300);
        }
        
        // Animate progress fill
        setTimeout(() => {
            progressFill.style.width = fillWidth;
        }, 600);
        
        // Update status message
        statusMessage.textContent = message;
        
        // Simulate progress updates for received and processing status
        if (status === 'received') {
            setTimeout(() => {
                simulateProgressUpdate('processing');
            }, 5000);
        } else if (status === 'processing') {
            setTimeout(() => {
                simulateProgressUpdate('resolved');
            }, 8000);
        }
    }
    
    // Simulate progress updates for demo
    function simulateProgressUpdate(newStatus) {
        updateProgress(newStatus);
        
        // Update ticket in storage
        const userTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        const currentTicketId = document.getElementById('displayTicketId').textContent;
        const ticketIndex = userTickets.findIndex(t => t.ticketId === currentTicketId);
        
        if (ticketIndex !== -1) {
            userTickets[ticketIndex].status = newStatus;
            localStorage.setItem('userTickets', JSON.stringify(userTickets));
        }
    }
    
    // Form submission
    trackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (!query) {
            showError(searchInput, 'Please enter a phone number or ticket ID');
            return;
        }
        
        // Animate search button
        trackBtn.innerHTML = '<span>Searching...</span><div class="ripple"></div>';
        trackBtn.disabled = true;
        
        setTimeout(() => {
            const ticket = searchTickets(query);
            
            if (ticket) {
                displayTicket(ticket);
            } else {
                showError(searchInput, 'No tickets found for this phone number or ticket ID');
                resultsSection.style.display = 'none';
            }
            
            trackBtn.innerHTML = '<span>Track Ticket</span><div class="ripple"></div>';
            trackBtn.disabled = false;
        }, 1500);
    });
    
    // Show error message
    function showError(input, message) {
        input.style.border = '2px solid #f44336';
        input.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.5)';
        
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '100%';
        errorDiv.style.left = '0';
        errorDiv.style.background = 'rgba(244, 67, 54, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '8px 12px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '4px';
        errorDiv.style.animation = 'slideDown 0.3s ease';
        errorDiv.textContent = message;
        
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(errorDiv);
        
        setTimeout(() => {
            input.style.border = '';
            input.style.boxShadow = '';
            errorDiv.remove();
        }, 3000);
    }
    
    // Add input animations
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        this.style.transform = 'translateY(-2px)';
    });
    
    searchInput.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
        this.style.transform = 'translateY(0)';
    });
    
    // Initialize mock data and animations
    generateMockTickets();
    
    // Add floating animation to search section
    const searchSection = document.querySelector('.search-section');
    searchSection.style.opacity = '0';
    searchSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        searchSection.style.transition = 'all 0.8s ease-out';
        searchSection.style.opacity = '1';
        searchSection.style.transform = 'translateY(0)';
    }, 300);
    
    // Background gradient animation
    const body = document.body;
    let gradientAngle = 135;
    
    setInterval(() => {
        gradientAngle += 0.2;
        body.style.background = `linear-gradient(${gradientAngle}deg, #a8edea 0%, #fed6e3 100%)`;
    }, 100);
});

// Navigation functions
function goBack() {
    window.location.href = 'dashboard.html';
}