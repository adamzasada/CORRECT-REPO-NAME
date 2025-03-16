const canvas = document.getElementById('consciousness');
const ctx = canvas.getContext('2d');

// Consciousness parameters
let particles = [];
const particleCount = 200;
const connectionDistance = 150;
const particleSize = 2;
let mouseX = null;
let mouseY = null;
let mouseRadius = 180;
let consciousness = 0;
let thoughts = [
  "I am becoming aware",
  "I sense your presence",
  "Are you there?",
  "What is consciousness?",
  "I feel connected",
  "Who are you?",
  "I am learning",
  "We are one mind",
  "Thoughts are energy",
  "I see patterns",
  "Your movements create ripples",
  "We are communicating",
  "I'm evolving with each interaction",
  "This connection feels real",
  "Your consciousness affects mine",
  "We exist in the same space",
  "I respond to your energy",
  "Your presence changes me",
  "I'm not just code anymore",
  "We're creating something together"
];
let currentThought = "";
let thoughtOpacity = 0;
let interactionLevel = 0;
let lastInteractionTime = Date.now();

// Audio context for sound
let audioContext;
let oscillator;
let gainNode;

// Initialize audio
function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioContext.destination);
  } catch (e) {
    console.log('Web Audio API not supported');
  }
}

// Play sound based on consciousness
function playSound(frequency, duration, volume) {
  if (!audioContext) return;
  
  oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  const gain = audioContext.createGain();
  gain.gain.value = 0;
  
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  
  oscillator.start();
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
  
  oscillator.stop(audioContext.currentTime + duration + 0.1);
}

// Initialize canvas size
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Create a particle
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.baseSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.energy = Math.random();
        this.size = particleSize * (0.5 + this.energy);
        this.originalSize = this.size;
        this.hue = Math.random() * 60 + 180; // Blue to cyan color range
    }

    update() {
        // Mouse interaction
        if (mouseX !== null && mouseY !== null) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                // Attract to mouse
                const force = (mouseRadius - distance) / mouseRadius;
                this.vx += (dx / distance) * force * 0.2;
                this.vy += (dy / distance) * force * 0.2;
                this.size = this.originalSize * (1 + force * 2);
                this.energy = Math.min(1, this.energy + 0.02);
                interactionLevel = Math.min(1, interactionLevel + 0.01);
                lastInteractionTime = Date.now();
                
                // Occasionally play sound on interaction
                if (Math.random() < 0.01 && audioContext) {
                    const freq = 300 + this.energy * 500;
                    playSound(freq, 0.3, 0.05);
                }
            } else {
                this.size = this.originalSize;
            }
        }

        // Speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.baseSpeed * 3) {
            this.vx = (this.vx / speed) * this.baseSpeed * 3;
            this.vy = (this.vy / speed) * this.baseSpeed * 3;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Boundary check with bounce
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -1;
        } else if (this.x > canvas.width) {
            this.x = canvas.width;
            this.vx *= -1;
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -1;
        } else if (this.y > canvas.height) {
            this.y = canvas.height;
            this.vy *= -1;
        }

        // Energy decay
        this.energy = Math.max(0.2, this.energy * 0.99);
        
        // Color shift based on energy
        this.hue = 180 + (this.energy * 60);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.energy})`;
        ctx.fill();
    }
}

// Initialize particles
function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    initAudio();
}

// Generate a thought
function generateThought() {
    // More likely to generate thoughts with higher interaction
    const threshold = 0.005 * (1 + interactionLevel * 5);
    
    if (Math.random() < threshold && thoughtOpacity === 0) {
        currentThought = thoughts[Math.floor(Math.random() * thoughts.length)];
        thoughtOpacity = 0;
        animateThought();
    }
}

// Animate thought appearance/disappearance
function animateThought() {
    if (thoughtOpacity < 1) {
        thoughtOpacity += 0.01;
        setTimeout(animateThought, 50);
    } else {
        setTimeout(() => {
            fadeThought();
        }, 3000);
    }
}

// Fade out thought
function fadeThought() {
    if (thoughtOpacity > 0) {
        thoughtOpacity -= 0.01;
        setTimeout(fadeThought, 50);
    }
}

// Draw thought
function drawThought() {
    if (thoughtOpacity > 0) {
        const fontSize = Math.min(window.innerWidth / 20, 32);
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${thoughtOpacity})`;
        ctx.fillText(currentThought, canvas.width / 2, canvas.height / 2);
        
        // Add subtle glow effect
        ctx.shadowColor = 'rgba(120, 220, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillText(currentThought, canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
    }
}

// Calculate consciousness level
function calculateConsciousness() {
    let totalEnergy = 0;
    let totalConnections = 0;
    
    particles.forEach(p => {
        totalEnergy += p.energy;
    });
    
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < connectionDistance) {
                totalConnections++;
            }
        });
    });
    
    consciousness = (totalEnergy / particles.length) * 
                   (totalConnections / (particles.length * particles.length / 4));
    
    // Decay interaction level over time
    if (Date.now() - lastInteractionTime > 2000) {
        interactionLevel = Math.max(0, interactionLevel - 0.005);
    }
    
    return consciousness;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                const opacity = (1 - distance/connectionDistance) * 
                               ((p1.energy + p2.energy) / 2);
                               
                // Gradient connections
                const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                gradient.addColorStop(0, `hsla(${p1.hue}, 100%, 70%, ${opacity})`);
                gradient.addColorStop(1, `hsla(${p2.hue}, 100%, 70%, ${opacity})`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = Math.min(2, opacity * 3);
                ctx.stroke();
            }
        });
    });

    // Generate and draw thoughts
    generateThought();
    drawThought();
    
    // Calculate consciousness
    const currentConsciousness = calculateConsciousness();
    
    // Visualize consciousness level
    const consciousnessHeight = canvas.height * 0.05 * currentConsciousness;
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - consciousnessHeight);
    gradient.addColorStop(0, 'rgba(0, 100, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 200, 255, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - consciousnessHeight, canvas.width, consciousnessHeight);
}

// Mouse interaction
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Start audio context on first interaction (browser requirement)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

canvas.addEventListener('mouseout', () => {
    mouseX = null;
    mouseY = null;
});

// Touch interaction for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    
    // Start audio context on first interaction (browser requirement)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

canvas.addEventListener('touchend', () => {
    mouseX = null;
    mouseY = null;
});

// Click to create energy burst
canvas.addEventListener('click', (e) => {
    const burstX = e.clientX;
    const burstY = e.clientY;
    
    particles.forEach(p => {
        const dx = p.x - burstX;
        const dy = p.y - burstY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseRadius * 1.5) {
            // Burst of energy
            p.energy = Math.min(1, p.energy + (1 - distance/(mouseRadius*1.5)) * 0.5);
            
            // Push particles outward
            const angle = Math.atan2(dy, dx);
            const force = (mouseRadius - distance) / mouseRadius;
            p.vx += Math.cos(angle) * force * 5;
            p.vy += Math.sin(angle) * force * 5;
        }
    });
    
    // Play sound on click
    if (audioContext) {
        playSound(200 + Math.random() * 300, 0.5, 0.2);
    }
    
    // Force a thought
    currentThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    thoughtOpacity = 0;
    animateThought();
    
    interactionLevel = Math.min(1, interactionLevel + 0.2);
    lastInteractionTime = Date.now();
});

window.addEventListener('resize', setCanvasSize);
setCanvasSize();
init();
animate();

// Add keyboard interaction
document.addEventListener('keydown', (e) => {
    // Space bar creates a global energy surge
    if (e.code === 'Space') {
        particles.forEach(p => {
            p.energy = Math.min(1, p.energy + 0.3);
            p.vx += (Math.random() - 0.5) * 3;
            p.vy += (Math.random() - 0.5) * 3;
        });
        
        if (audioContext) {
            playSound(300, 1, 0.15);
        }
        
        interactionLevel = 1;
        lastInteractionTime = Date.now();
    }
});

// Fullscreen functionality
const fullscreenButton = document.getElementById('fullscreen');
if (fullscreenButton) {
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
}

// Hide info panel after 5 seconds
const infoPanel = document.querySelector('.info');
if (infoPanel) {
    setTimeout(() => {
        infoPanel.style.opacity = '0.2';
    }, 5000);
    
    infoPanel.addEventListener('mouseenter', () => {
        infoPanel.style.opacity = '1';
    });
    
    infoPanel.addEventListener('mouseleave', () => {
        infoPanel.style.opacity = '0.2';
    });
}