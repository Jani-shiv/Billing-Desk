document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    const facilityForm = document.getElementById('facilityForm');
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
    
    // Checkbox limitation (max 2 per section)
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const sectionName = this.name;
                const sectionCheckboxes = section.querySelectorAll(`input[name="${sectionName}"]`);
                const checkedBoxes = section.querySelectorAll(`input[name="${sectionName}"]:checked`);
                
                // Enable/disable other input when other checkbox is checked
                if (this.value === 'other') {
                    const otherInput = section.querySelector('.other-input');
                    if (this.checked) {
                        otherInput.style.opacity = '1';
                        otherInput.style.pointerEvents = 'all';
                        otherInput.focus();
                    } else {
                        otherInput.style.opacity = '0.5';
                        otherInput.style.pointerEvents = 'none';
                        otherInput.value = '';
                    }
                }
                
                // Limit to 2 checkboxes per section
                if (checkedBoxes.length >= 2) {
                    sectionCheckboxes.forEach(cb => {
                        if (!cb.checked) {
                            cb.disabled = true;
                            cb.parentElement.style.opacity = '0.5';
                        }
                    });
                } else {
                    sectionCheckboxes.forEach(cb => {
                        cb.disabled = false;
                        cb.parentElement.style.opacity = '1';
                    });
                }
                
                // Add checked animation
                if (this.checked) {
                    this.parentElement.style.transform = 'translateX(4px) scale(1.02)';
                    this.parentElement.style.background = 'rgba(0, 242, 254, 0.1)';
                } else {
                    this.parentElement.style.transform = 'translateX(0) scale(1)';
                    this.parentElement.style.background = 'transparent';
                }
            });
            
            // Add hover effects
            checkbox.parentElement.addEventListener('mouseenter', function() {
                if (!checkbox.disabled) {
                    this.style.transform = 'translateX(4px)';
                    this.style.background = 'rgba(255, 255, 255, 0.05)';
                }
            });
            
            checkbox.parentElement.addEventListener('mouseleave', function() {
                if (!checkbox.checked) {
                    this.style.transform = 'translateX(0)';
                    this.style.background = 'transparent';
                }
            });
        });
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        let hasSelection = false;
        
        // Check if at least one checkbox is selected
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkedBoxes.length === 0) {
            showError('Please select at least one issue from any section');
            isValid = false;
        } else {
            hasSelection = true;
        }
        
        // Validate "other" inputs if their checkboxes are checked
        checkedBoxes.forEach(checkbox => {
            if (checkbox.value === 'other') {
                const otherInput = checkbox.parentElement.querySelector('.other-input');
                if (!otherInput.value.trim()) {
                    showError('Please specify the "Other" issue');
                    otherInput.style.border = '2px solid #f44336';
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.background = 'rgba(244, 67, 54, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '12px 24px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.zIndex = '10000';
        errorDiv.style.animation = 'slideDown 0.3s ease';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }
    
    // Generate ticket ID
    function generateTicketId() {
        const prefix = 'FAC';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
    
    // Form submission
    facilityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Collect selected issues
        const selectedIssues = [];
        const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        checkedBoxes.forEach(checkbox => {
            let value = checkbox.value;
            if (value === 'other') {
                const otherInput = checkbox.parentElement.querySelector('.other-input');
                value = `Other: ${otherInput.value.trim()}`;
            }
            selectedIssues.push({
                category: checkbox.name,
                issue: value
            });
        });
        
        const formData = {
            type: 'facility',
            issues: selectedIssues,
            additionalDetails: document.getElementById('additional-details').value.trim(),
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
            facilityForm.reset();
            
            // Reset all visual states
            const allCheckboxItems = document.querySelectorAll('.checkbox-item');
            allCheckboxItems.forEach(item => {
                item.style.transform = 'translateX(0) scale(1)';
                item.style.background = 'transparent';
                item.style.opacity = '1';
            });
            
            const allOtherInputs = document.querySelectorAll('.other-input');
            allOtherInputs.forEach(input => {
                input.style.opacity = '0.5';
                input.style.pointerEvents = 'none';
            });
            
            submitBtn.innerHTML = '<span>Submit Ticket</span><div class="ripple"></div>';
            submitBtn.disabled = false;
            
        }, 2000);
    });
    
    // Add section animations
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateX(0)';
        }, 300 + index * 200);
    });
    
    // Add textarea animations
    const textarea = document.getElementById('additional-details');
    textarea.addEventListener('focus', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 8px 25px rgba(0, 242, 254, 0.3)';
    });
    
    textarea.addEventListener('blur', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
    });
    
    // Add character counter for additional details
    const counterDiv = document.createElement('div');
    counterDiv.style.textAlign = 'right';
    counterDiv.style.fontSize = '0.8rem';
    counterDiv.style.color = 'rgba(255, 255, 255, 0.6)';
    counterDiv.style.marginTop = '4px';
    textarea.parentElement.appendChild(counterDiv);
    
    textarea.addEventListener('input', function() {
        const count = this.value.length;
        counterDiv.textContent = `${count} characters`;
        
        if (count > 500) {
            counterDiv.style.color = '#ff9800';
        } else {
            counterDiv.style.color = 'rgba(255, 255, 255, 0.6)';
        }
    });
    
    // Background color animation
    const body = document.body;
    let hue = 210;
    
    setInterval(() => {
        hue += 0.1;
        const color1 = `hsl(${(210 + hue) % 360}, 90%, 70%)`;
        const color2 = `hsl(${(190 + hue) % 360}, 95%, 75%)`;
        
        body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    }, 100);
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