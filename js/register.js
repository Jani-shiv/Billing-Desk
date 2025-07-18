document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
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
    
    // Add ripple effect to register button
    const registerBtn = document.querySelector('.register-btn');
    registerBtn.addEventListener('click', function(e) {
        createRipple(e, this);
    });
    
    // Form validation functions
    function validateName(name) {
        return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    }
    
    function validatePhone(phone) {
        const phoneRegex = /^[+]?[1-9][\d]{9,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    function validatePassword(password) {
        return password.length >= 6 && password.length <= 20;
    }
    
    function getPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 1) return 'weak';
        if (score <= 2) return 'medium';
        return 'strong';
    }
    
    function showError(input) {
        input.classList.remove('valid');
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 3000);
    }
    
    function showSuccess(input) {
        input.classList.remove('error');
        input.classList.add('valid');
    }
    
    // Input elements
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.querySelector('.password-strength');
    
    // Real-time validation
    fullNameInput.addEventListener('input', function() {
        if (this.value && validateName(this.value)) {
            showSuccess(this);
        } else if (this.value) {
            showError(this);
        }
    });
    
    phoneInput.addEventListener('input', function() {
        if (this.value && validatePhone(this.value)) {
            showSuccess(this);
        } else if (this.value) {
            showError(this);
        }
    });
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password) {
            const strength = getPasswordStrength(password);
            passwordStrength.className = `password-strength ${strength}`;
            
            if (validatePassword(password)) {
                showSuccess(this);
            } else {
                showError(this);
            }
        } else {
            passwordStrength.className = 'password-strength';
        }
    });
    
    // Form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = fullNameInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        
        let isValid = true;
        
        // Validate full name
        if (!fullName) {
            showError(fullNameInput);
            isValid = false;
        } else if (!validateName(fullName)) {
            showError(fullNameInput);
            isValid = false;
        }
        
        // Validate phone
        if (!phone) {
            showError(phoneInput);
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError(phoneInput);
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError(passwordInput);
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordInput);
            isValid = false;
        }
        
        if (isValid) {
            // Simulate registration process
            registerBtn.innerHTML = '<span>Creating Account...</span><div class="ripple"></div>';
            registerBtn.disabled = true;
            
            setTimeout(() => {
                // Store user data (in real app, this would be sent to server)
                const userData = {
                    fullName,
                    phone,
                    registrationDate: new Date().toISOString()
                };
                
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Show success modal
                successModal.style.display = 'block';
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
                
            }, 2000);
        }
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
    const background = document.getElementById('register-bg');
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
    });
    
    function animateBackground() {
        const x = mouseX * 15;
        const y = mouseY * 15;
        background.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(animateBackground);
    }
    
    animateBackground();
    
    // Add sparkle effect on successful input
    function addSparkle(element) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = '#ff6b9d';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = rect.right - 20 + 'px';
        sparkle.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(sparkle);
        
        sparkle.animate([
            { transform: 'scale(0) rotate(0deg)', opacity: 1 },
            { transform: 'scale(1) rotate(180deg)', opacity: 0.8 },
            { transform: 'scale(0) rotate(360deg)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => sparkle.remove();
    }
    
    // Add sparkle effect when input becomes valid
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.classList.contains('valid')) {
                addSparkle(this);
            }
        });
    });
});