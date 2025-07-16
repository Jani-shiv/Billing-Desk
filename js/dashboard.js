document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userPhone = localStorage.getItem('userPhone');
    
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update user info
    const userInfo = document.querySelector('.user-info span');
    if (userPhone) {
        userInfo.textContent = `Welcome, ${userPhone}!`;
    }
    
    // Add ripple effect to action buttons
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
    
    // Add event listeners to action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
        
        // Enhanced hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05) rotateX(5deg)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateX(0)';
        });
    });
    
    // Add particle effect on button hover
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const lifetime = 1000 + Math.random() * 1000;
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)', 
                opacity: 1 
            },
            { 
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, 
                opacity: 0 
            }
        ], {
            duration: lifetime,
            easing: 'ease-out'
        }).onfinish = () => particle.remove();
    }
    
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createParticle(
                        rect.left + Math.random() * rect.width,
                        rect.top + Math.random() * rect.height
                    );
                }, i * 100);
            }
        });
    });
    
    // Animate elements on load
    setTimeout(() => {
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach((button, index) => {
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 500);
    
    // Add floating animation to icons
    const icons = document.querySelectorAll('.btn-icon');
    icons.forEach(icon => {
        setInterval(() => {
            icon.style.transform = 'translateY(-8px)';
            setTimeout(() => {
                icon.style.transform = 'translateY(0)';
            }, 1500);
        }, 3000 + Math.random() * 2000);
    });
    
    // Background gradient animation
    const body = document.body;
    let gradientAngle = 135;
    
    setInterval(() => {
        gradientAngle += 0.5;
        body.style.background = `linear-gradient(${gradientAngle}deg, #667eea 0%, #764ba2 100%)`;
    }, 50);
});

// Navigation functions
function goToNewTicket() {
    const button = event.currentTarget;
    button.style.transform = 'translateY(-4px) scale(1.02)';
    
    setTimeout(() => {
        window.location.href = 'new-ticket.html';
    }, 200);
}

function goToTrack() {
    const button = event.currentTarget;
    button.style.transform = 'translateY(-4px) scale(1.02)';
    
    setTimeout(() => {
        window.location.href = 'track.html';
    }, 200);
}

function logout() {
    // Add logout animation
    const button = event.currentTarget;
    button.innerHTML = 'Logging out...';
    button.disabled = true;
    
    // Clear session data
    setTimeout(() => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userPhone');
        window.location.href = 'index.html';
    }, 1000);
}