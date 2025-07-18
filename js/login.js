document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPassword = document.querySelector('.forgot-password');
    const modal = document.getElementById('forgotModal');
    const closeModal = document.querySelector('.close');
    const recoveryBtn = document.querySelector('.recovery-btn');
    
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
    
    // Add ripple effect to login button
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.addEventListener('click', function(e) {
        createRipple(e, this);
    });
    
    // Form validation
    function validatePhone(phone) {
        const phoneRegex = /^[+]?[1-9][\d]{9,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    function validatePassword(password) {
        return password.length >= 6 && password.length <= 20;
    }
    
    function showError(input) {
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 3000);
    }
    
    function showSuccess(input) {
        input.classList.add('valid');
        setTimeout(() => {
            input.classList.remove('valid');
        }, 2000);
    }
    
    // Real-time validation
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    
    phoneInput.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            showError(this);
        } else if (this.value && validatePhone(this.value)) {
            showSuccess(this);
        }
    });
    
    passwordInput.addEventListener('blur', function() {
        if (this.value && !validatePassword(this.value)) {
            showError(this);
        } else if (this.value && validatePassword(this.value)) {
            showSuccess(this);
        }
    });
    
    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        
        let isValid = true;
        
        if (!phone) {
            showError(phoneInput);
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError(phoneInput);
            isValid = false;
        }
        
        if (!password) {
            showError(passwordInput);
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordInput);
            isValid = false;
        }
        
        if (isValid) {
            // Simulate login process
            loginBtn.innerHTML = '<span>Logging in...</span><div class="ripple"></div>';
            loginBtn.disabled = true;
            
            setTimeout(() => {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userPhone', phone);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    });
    
    // Forgot password modal
    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
    
    // Password recovery
    recoveryBtn.addEventListener('click', function() {
        const recoveryPhone = document.getElementById('recoveryPhone').value.trim();
        
        if (!recoveryPhone) {
            alert('Please enter your phone number');
            return;
        }
        
        if (!validatePhone(recoveryPhone)) {
            alert('Please enter a valid phone number');
            return;
        }
        
        // Simulate sending recovery code
        this.innerHTML = 'Sending...';
        this.disabled = true;
        
        setTimeout(() => {
            alert('Recovery code sent to your phone!');
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                this.innerHTML = 'Send Recovery Code';
                this.disabled = false;
                document.getElementById('recoveryPhone').value = '';
            }, 300);
        }, 2000);
    });
    
    // Input animation effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Add floating animation to background
    const background = document.getElementById('login-bg');
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
    });
    
    function animateBackground() {
        const x = mouseX * 20;
        const y = mouseY * 20;
        background.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(animateBackground);
    }
    
    animateBackground();
});