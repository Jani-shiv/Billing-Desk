document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // Add enhanced hover effects to ticket cards
    const ticketCards = document.querySelectorAll('.ticket-card');
    
    ticketCards.forEach((card, index) => {
        // Stagger animation on load
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * 200);
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05) rotateX(5deg) rotateY(2deg)';
            
            // Create floating particles
            createFloatingParticles(this);
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
        });
        
        // Click animation
        card.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-10px) scale(1.05) rotateX(5deg) rotateY(2deg)';
        });
    });
    
    // Create floating particles effect
    function createFloatingParticles(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#ff9800', '#4caf50', '#f44336'];
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                particle.style.boxShadow = '0 0 10px currentColor';
                
                const startX = rect.left + Math.random() * rect.width;
                const startY = rect.top + Math.random() * rect.height;
                
                particle.style.left = startX + 'px';
                particle.style.top = startY + 'px';
                
                document.body.appendChild(particle);
                
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                
                particle.animate([
                    { 
                        transform: 'translate(0, 0) scale(1)', 
                        opacity: 1 
                    },
                    { 
                        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, 
                        opacity: 0 
                    }
                ], {
                    duration: 1500,
                    easing: 'ease-out'
                }).onfinish = () => particle.remove();
            }, i * 150);
        }
    }
    
    // Add icon bounce animation
    const icons = document.querySelectorAll('.card-icon');
    icons.forEach(icon => {
        setInterval(() => {
            icon.style.animation = 'none';
            icon.offsetHeight; // Trigger reflow
            icon.style.animation = 'iconBounce 2s ease-in-out infinite';
        }, 3000 + Math.random() * 2000);
    });
    
    // Add smooth page transition effect
    const contentWrapper = document.querySelector('.content-wrapper');
    contentWrapper.style.opacity = '0';
    contentWrapper.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        contentWrapper.style.transition = 'all 0.8s ease-out';
        contentWrapper.style.opacity = '1';
        contentWrapper.style.transform = 'translateY(0)';
    }, 300);
    
    // Background animation
    const body = document.body;
    let hue = 0;
    
    setInterval(() => {
        hue += 0.1;
        const color1 = `hsl(${(320 + hue) % 360}, 85%, 65%)`;
        const color2 = `hsl(${(350 + hue) % 360}, 80%, 60%)`;
        const color3 = `hsl(${(210 + hue) % 360}, 90%, 70%)`;
        
        body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
    }, 100);
});

// Navigation functions
function goBack() {
    // Add exit animation
    const cards = document.querySelectorAll('.ticket-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(50px) scale(0.9)';
            card.style.opacity = '0';
        }, index * 100);
    });
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 600);
}

function goToBreakdown() {
    const card = event.currentTarget;
    
    // Add click effect
    card.style.transform = 'translateY(-5px) scale(1.02)';
    card.style.background = 'rgba(255, 152, 0, 0.2)';
    
    // Create expanding circle effect
    const circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.top = '50%';
    circle.style.left = '50%';
    circle.style.width = '0';
    circle.style.height = '0';
    circle.style.background = 'rgba(255, 152, 0, 0.3)';
    circle.style.borderRadius = '50%';
    circle.style.transform = 'translate(-50%, -50%)';
    circle.style.pointerEvents = 'none';
    circle.style.zIndex = '10';
    
    card.appendChild(circle);
    
    circle.animate([
        { width: '0', height: '0', opacity: 1 },
        { width: '400px', height: '400px', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    });
    
    setTimeout(() => {
        window.location.href = 'breakdown.html';
    }, 300);
}

function goToFacility() {
    const card = event.currentTarget;
    
    card.style.transform = 'translateY(-5px) scale(1.02)';
    card.style.background = 'rgba(76, 175, 80, 0.2)';
    
    const circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.top = '50%';
    circle.style.left = '50%';
    circle.style.width = '0';
    circle.style.height = '0';
    circle.style.background = 'rgba(76, 175, 80, 0.3)';
    circle.style.borderRadius = '50%';
    circle.style.transform = 'translate(-50%, -50%)';
    circle.style.pointerEvents = 'none';
    circle.style.zIndex = '10';
    
    card.appendChild(circle);
    
    circle.animate([
        { width: '0', height: '0', opacity: 1 },
        { width: '400px', height: '400px', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    });
    
    setTimeout(() => {
        window.location.href = 'facility.html';
    }, 300);
}

function goToSafety() {
    const card = event.currentTarget;
    
    card.style.transform = 'translateY(-5px) scale(1.02)';
    card.style.background = 'rgba(244, 67, 54, 0.2)';
    
    const circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.top = '50%';
    circle.style.left = '50%';
    circle.style.width = '0';
    circle.style.height = '0';
    circle.style.background = 'rgba(244, 67, 54, 0.3)';
    circle.style.borderRadius = '50%';
    circle.style.transform = 'translate(-50%, -50%)';
    circle.style.pointerEvents = 'none';
    circle.style.zIndex = '10';
    
    card.appendChild(circle);
    
    circle.animate([
        { width: '0', height: '0', opacity: 1 },
        { width: '400px', height: '400px', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    });
    
    setTimeout(() => {
        // For now, redirect to facility as safety page uses same structure
        window.location.href = 'facility.html';
    }, 300);
}