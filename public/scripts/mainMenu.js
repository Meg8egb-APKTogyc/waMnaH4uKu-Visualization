const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

 
const particles = [];
const particleCount = 50;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`;
    }
    
    move() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) {
            this.speedX = -this.speedX;
        }
        
        if (this.y > canvas.height || this.y < 0) {
            this.speedY = -this.speedY;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        for (let i = 0; i < particles.length; i++) {
            const x = this.x - particles[i].x;
            const y = this.y - particles[i].y;
            const distance = Math.sqrt(x * x + y * y);
            
            if (distance < 100) {
                ctx.strokeStyle = `hsla(${Math.random() * 60 + 200}, 100%, 70%, ${1 - distance/100})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(particles[i].x, particles[i].y);
                ctx.stroke();
            }
        }
    }
}

function init() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].move();
        particles[i].draw();
    }
    
    requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});