document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    const breakdownForm = document.getElementById('breakdownForm');
    const successModal = document.getElementById('successModal');
    
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
    
    // Add ripple effect to submit button
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.addEventListener('click', function(e) {
        if (e.target.closest('.btn-primary')) {
            createRipple(e, this);
        }
    });
    
    // Form validation
    function validateForm() {
        const department = document.getElementById('department').value;
        const description = document.getElementById('description').value.trim();
        const priority = document.querySelector('input[name="priority"]:checked');
        
        let isValid = true;
        
        if (!department) {
            showError(document.getElementById('department'));
            isValid = false;
        }
        
        if (!description || description.length < 10) {
            showError(document.getElementById('description'));
            isValid = false;
        }
        
        if (!priority) {
            showError(document.querySelector('.priority-buttons'));
            isValid = false;
        }
        
        return isValid;
    }
    
    function showError(element) {
        element.style.border = '2px solid #f44336';
        element.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.3)';
        
        setTimeout(() => {
            element.style.border = '';
            element.style.boxShadow = '';
        }, 3000);
    }
    
    // Generate ticket ID
    function generateTicketId() {
        const prefix = 'BRK';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
    
    // Form submission
    breakdownForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = {
            type: 'breakdown',
            department: document.getElementById('department').value,
            description: document.getElementById('description').value.trim(),
            priority: document.querySelector('input[name="priority"]:checked').value,
            ticketId: generateTicketId(),
            userPhone: localStorage.getItem('userPhone'),
            createdAt: new Date().toISOString(),
            status: 'received'
        };
        
        // Animate submit button
        submitBtn.innerHTML = '<span>Submitting...</span><div class="ripple"></div>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Store ticket data
            const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
            existingTickets.push(formData);
            localStorage.setItem('userTickets', JSON.stringify(existingTickets));
            
            // Show success modal
            document.getElementById('ticketId').textContent = formData.ticketId;
            successModal.style.display = 'block';
            
            // Reset form
            breakdownForm.reset();
            submitBtn.innerHTML = '<span>Submit Ticket</span><div class="ripple"></div>';
            submitBtn.disabled = false;
            
        }, 2000);
    });
    
    // Add input animations
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            this.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Priority button animations
    const priorityBtns = document.querySelectorAll('.priority-btn');
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            priorityBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Create pulse effect
            this.style.animation = 'none';
            this.offsetHeight; // Trigger reflow
            this.style.animation = 'pulse 0.3s ease';
        });
    });
    
    // Add character counter for description
    const descriptionTextarea = document.getElementById('description');
    const counterDiv = document.createElement('div');
    counterDiv.style.textAlign = 'right';
    counterDiv.style.fontSize = '0.8rem';
    counterDiv.style.color = 'rgba(255, 255, 255, 0.6)';
    counterDiv.style.marginTop = '4px';
    descriptionTextarea.parentElement.appendChild(counterDiv);
    
    descriptionTextarea.addEventListener('input', function() {
        const count = this.value.length;
        counterDiv.textContent = `${count} characters`;
        
        if (count < 10) {
            counterDiv.style.color = '#f44336';
        } else if (count > 500) {
            counterDiv.style.color = '#ff9800';
        } else {
            counterDiv.style.color = 'rgba(255, 255, 255, 0.6)';
        }
    });
    
    // Add floating animation to form elements
    setTimeout(() => {
        const formGroups = document.querySelectorAll('.select-group, .textarea-group, .priority-group');
        formGroups.forEach((group, index) => {
            setTimeout(() => {
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 300);
});

// Navigation functions
function goBack() {
    window.location.href = 'new-ticket.html';
}

function goToDashboard() {
    const modal = document.getElementById('successModal');
    modal.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 300);
}