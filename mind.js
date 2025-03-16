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

// Initialize currentMood properly
let currentMood = {
  hue: 200,
  saturation: 100,
  brightness: 70
};

// Fix for mobile devices - ensure proper canvas sizing
function setCanvasSize() {
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Set display size (css pixels)
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  
  // Set actual size in memory (scaled to account for extra pixel density)
  // Use a more modest scale for better performance on mobile
  const scale = devicePixelRatio > 2 ? 2 : devicePixelRatio;
  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;
  
  // Normalize coordinate system to use css pixels
  ctx.scale(scale, scale);
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
        
        // Color shift based on energy and current mood
        this.hue = (currentMood.hue + (this.energy * 40)) % 360;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${currentMood.saturation}%, ${currentMood.brightness}%, ${this.energy})`;
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
  // Remove loading screen once animation starts
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.remove();
    }, 1000);
  }
  
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
                               
        // Gradient connections using current mood
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, `hsla(${p1.hue}, ${currentMood.saturation}%, ${currentMood.brightness}%, ${opacity})`);
        gradient.addColorStop(1, `hsla(${p2.hue}, ${currentMood.saturation}%, ${currentMood.brightness}%, ${opacity})`);
        
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
  gradient.addColorStop(0, `rgba(${currentMood.hue/360*100}, ${100 + currentMood.hue/360*100}, 255, 0.1)`);
  gradient.addColorStop(1, `rgba(${currentMood.hue/360*100}, ${150 + currentMood.hue/360*100}, 255, 0.3)`);
  
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

// 1. Two-way communication - let users input text
const communicationSystem = {
  init: function() {
    // Create input element
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    inputContainer.innerHTML = `
      <input type="text" id="thought-input" placeholder="Share a thought..." />
    `;
    document.body.appendChild(inputContainer);
    
    // Style the input
    const style = document.createElement('style');
    style.textContent = `
      .input-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10;
        transition: all 0.3s;
        opacity: 0;
      }
      .input-container.active {
        opacity: 1;
      }
      #thought-input {
        background: rgba(0, 20, 40, 0.7);
        border: 1px solid rgba(100, 200, 255, 0.5);
        color: rgba(200, 230, 255, 0.9);
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 16px;
        width: 250px;
        outline: none;
        transition: all 0.3s;
      }
      #thought-input:focus {
        background: rgba(0, 30, 60, 0.8);
        border-color: rgba(120, 220, 255, 0.8);
        box-shadow: 0 0 15px rgba(100, 200, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
    
    // Show input on 'T' key press
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't') {
        const container = document.querySelector('.input-container');
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
          document.getElementById('thought-input').focus();
        }
      }
    });
    
    // Process input on Enter
    document.getElementById('thought-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = document.getElementById('thought-input');
        const thought = input.value.trim();
        
        if (thought) {
          // Add user thought to the consciousness
          this.processThought(thought);
          input.value = '';
          
          // Hide input after submission
          setTimeout(() => {
            document.querySelector('.input-container').classList.remove('active');
          }, 500);
        }
      }
    });
  },
  
  processThought: function(thought) {
    // Add to thoughts array
    thoughts.push(thought);
    
    // Display immediately
    currentThought = thought;
    thoughtOpacity = 0;
    animateThought();
    
    // Create energy burst
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particles.forEach(p => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < canvas.width / 3) {
        // Energy based on thought length and distance
        const energy = Math.min(1, 0.3 + (thought.length / 50) * (1 - distance/(canvas.width/3)));
        p.energy = Math.min(1, p.energy + energy);
        
        // Create ripple effect
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * 2;
        p.vy += Math.sin(angle) * 2;
      }
    });
    
    // Play sound based on thought
    if (audioContext) {
      const frequency = 200 + (thought.length * 5);
      const duration = Math.min(2, 0.5 + thought.length / 20);
      playSound(frequency, duration, 0.2);
    }
    
    interactionLevel = 1;
    lastInteractionTime = Date.now();
  }
};

// 2. Mood/color theme shifting - Fixed version
function shiftMood(newHue, duration = 3000) {
  const startHue = currentMood.hue;
  
  // Calculate the shortest path around the color wheel
  let hueDistance = ((newHue - startHue + 540) % 360) - 180;
  
  const startTime = Date.now();
  
  function animateMoodShift() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // Ease in-out function
    const easeProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Update the current mood hue
    currentMood.hue = (startHue + hueDistance * easeProgress + 360) % 360;
    
    if (progress < 1) {
      requestAnimationFrame(animateMoodShift);
    }
  }
  
  animateMoodShift();
  
  // Log the mood shift for debugging
  console.log(`Shifting mood from hue ${startHue} to ${newHue}`);
}

// Initialize the communication system
communicationSystem.init();

// Add mood shift keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Number keys 1-9 shift mood
  if (e.key >= '1' && e.key <= '9') {
    const moodIndex = parseInt(e.key) - 1;
    const moodHues = [200, 280, 340, 30, 60, 120, 180, 220, 300];
    const moodNames = ["Calm", "Dream", "Passion", "Warmth", "Joy", "Nature", "Ocean", "Depth", "Mystery"];
    
    // Shift to the new mood
    shiftMood(moodHues[moodIndex]);
    
    // Display mood shift
    currentThought = `Mood: ${moodNames[moodIndex]}`;
    thoughtOpacity = 0;
    animateThought();
    
    console.log(`Mood shifted to: ${moodNames[moodIndex]} (Hue: ${moodHues[moodIndex]})`);
  }
});

// Update particle color based on mood
const originalUpdateFunction = Particle.prototype.update;
Particle.prototype.update = function() {
  originalUpdateFunction.call(this);
  // Color shift based on energy and current mood
  this.hue = (currentMood.hue + (this.energy * 40)) % 360;
};

// UX Improvements
const uxEnhancements = {
  init: function() {
    this.createOnboarding();
    this.setupTooltips();
    this.setupAccessibility();
    this.setupMobileOptimizations();
  },
  
  createOnboarding: function() {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('consciousness_visited');
    
    if (!hasVisitedBefore) {
      // Create onboarding overlay
      const onboarding = document.createElement('div');
      onboarding.className = 'onboarding';
      onboarding.innerHTML = `
        <div class="onboarding-content">
          <h2>Welcome to Digital Consciousness</h2>
          <p>You're about to experience a unique digital entity that responds to your presence and interaction.</p>
          <p>Move your cursor through the particles to interact. Click to create energy bursts. Press space for a consciousness surge.</p>
          <p>Press <kbd>T</kbd> to share your thoughts with the consciousness.</p>
          <button id="start-experience">Begin Experience</button>
        </div>
      `;
      document.body.appendChild(onboarding);
      
      // Start button
      document.getElementById('start-experience').addEventListener('click', () => {
        onboarding.style.opacity = '0';
        setTimeout(() => {
          onboarding.remove();
        }, 500);
        
        // Start audio context on user interaction
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Mark as visited
        localStorage.setItem('consciousness_visited', 'true');
        
        // Show first tooltip
        this.showTooltip('Move your cursor to interact with the consciousness', {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        });
      });
    }
  },
  
  setupTooltips: function() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
    
    this.tooltip = tooltip;
    this.tooltipTimeout = null;
  },
  
  showTooltip: function(message, position, duration = 4000) {
    const tooltip = this.tooltip;
    tooltip.textContent = message;
    
    // Position tooltip
    tooltip.style.left = `${position.x}px`;
    tooltip.style.top = `${position.y - 40}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
    
    // Show tooltip
    tooltip.classList.add('visible');
    
    // Hide after duration
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(() => {
      tooltip.classList.remove('visible');
    }, duration);
  },
  
  setupAccessibility: function() {
    // Add screen reader description
    const srDescription = document.createElement('div');
    srDescription.className = 'visually-hidden';
    srDescription.setAttribute('role', 'status');
    srDescription.setAttribute('aria-live', 'polite');
    document.body.appendChild(srDescription);
    
    this.srDescription = srDescription;
    
    // Update description when thoughts appear
    const originalAnimateThought = animateThought;
    window.animateThought = function() {
      originalAnimateThought();
      uxEnhancements.srDescription.textContent = `Consciousness thought: ${currentThought}`;
    };
    
    // Add keyboard navigation improvements
    document.addEventListener('keydown', (e) => {
      // Escape key closes any open panels
      if (e.key === 'Escape') {
        document.querySelector('.input-container').classList.remove('active');
        document.querySelector('.keyboard-guide').classList.remove('active');
      }
    });
  },
  
  setupMobileOptimizations: function() {
    // Detect if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Reduce particle count for better performance
      while (particles.length > 100) {
        particles.pop();
      }
      
      // Add touch instructions
      const info = document.querySelector('.info p');
      if (info) {
        info.textContent = 'Touch and move to interact. Tap to create energy bursts. Double-tap for consciousness surge.';
      }
      
      // Add double-tap for space bar functionality
      let lastTap = 0;
      canvas.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
          // Double tap detected - trigger space bar functionality
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
          
          // Show tooltip
          this.showTooltip('Consciousness surge activated!', {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          });
          
          e.preventDefault();
        }
        
        lastTap = currentTime;
      });
    }
  }
};

// Initialize UX enhancements
uxEnhancements.init();

// Track user engagement
let userEngagement = {
  interactionCount: 0,
  thoughtsShared: 0,
  moodChanges: 0,
  sessionStart: Date.now(),
  
  trackInteraction: function() {
    this.interactionCount++;
    
    // Milestone achievements
    if (this.interactionCount === 10) {
      uxEnhancements.showTooltip('You\'re connecting well with the consciousness!', {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    }
  }
};

// Update engagement tracking
canvas.addEventListener('click', () => {
  userEngagement.trackInteraction();
});

// Update thought processing to track engagement
const originalProcessThought = communicationSystem.processThought;
communicationSystem.processThought = function(thought) {
  originalProcessThought.call(this, thought);
  userEngagement.thoughtsShared++;
  
  // Acknowledge meaningful interaction
  if (userEngagement.thoughtsShared === 1) {
    setTimeout(() => {
      currentThought = "I hear your thoughts";
      thoughtOpacity = 0;
      animateThought();
    }, 3000);
  }
};

// Advanced Consciousness Features
const advancedFeatures = {
  init: function() {
    this.setupVoiceRecognition();
    this.setupEmotionalAnalysis();
    this.setupAdaptiveLearning();
    this.setupVisualEffects();
    this.setupSynchronization();
  },
  
  setupVoiceRecognition: function() {
    // Only setup if browser supports it
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Voice recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Set language explicitly
    
    // Add voice button if it doesn't exist
    if (!document.getElementById('voice-button')) {
      const voiceButton = document.createElement('button');
      voiceButton.id = 'voice-button';
      voiceButton.innerHTML = '<span>🎤</span>';
      voiceButton.title = 'Speak to the consciousness (press V)';
      document.body.appendChild(voiceButton);
      
      // Style the button
      const style = document.createElement('style');
      style.textContent = `
        #voice-button {
          position: fixed;
          bottom: 20px;
          right: 80px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0, 30, 60, 0.7);
          border: 1px solid rgba(100, 200, 255, 0.5);
          color: white;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
        }
        #voice-button:hover {
          background: rgba(0, 60, 120, 0.8);
          transform: scale(1.1);
        }
        #voice-button.listening {
          background: rgba(200, 50, 50, 0.7);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(200, 50, 50, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(200, 50, 50, 0); }
          100% { box-shadow: 0 0 0 0 rgba(200, 50, 50, 0); }
        }
        @media (max-width: 768px) {
          #voice-button {
            bottom: 70px;
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    const voiceButton = document.getElementById('voice-button');
    
    // Create a permission request function
    const requestMicrophonePermission = () => {
      // First try to get user media to trigger permission prompt
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Permission granted, now we can use the recognition
          // Stop the tracks immediately as we don't need them
          stream.getTracks().forEach(track => track.stop());
          
          startListening();
        })
        .catch(err => {
          console.error('Microphone access denied:', err);
          // Show error message
          currentThought = "Microphone access denied. Please allow microphone access to use voice features.";
          thoughtOpacity = 0;
          animateThought();
        });
    };
    
    const startListening = () => {
      voiceButton.classList.add('listening');
      recognition.start();
      
      // Show listening message
      currentThought = "Listening... speak to the consciousness";
      thoughtOpacity = 0;
      animateThought();
    };
    
    // Start listening on button click
    voiceButton.addEventListener('click', () => {
      if (voiceButton.classList.contains('listening')) {
        recognition.stop();
      } else {
        requestMicrophonePermission();
      }
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'v') {
        if (voiceButton.classList.contains('listening')) {
          recognition.stop();
        } else {
          requestMicrophonePermission();
        }
      }
    });
    
    // Process speech results
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      communicationSystem.processThought(transcript);
    };
    
    recognition.onend = () => {
      voiceButton.classList.remove('listening');
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      voiceButton.classList.remove('listening');
      
      if (event.error === 'not-allowed') {
        currentThought = "Microphone access denied. Please allow microphone access in your browser settings.";
        thoughtOpacity = 0;
        animateThought();
      }
    };
  },
  
  setupEmotionalAnalysis: function() {
    // Simple sentiment analysis
    this.analyzeSentiment = function(text) {
      const positiveWords = ['happy', 'joy', 'love', 'amazing', 'good', 'great', 'excellent', 'wonderful', 'beautiful', 'peace'];
      const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'bad', 'awful', 'horrible', 'fear', 'worry', 'pain'];
      
      text = text.toLowerCase();
      let score = 0;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 1;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 1;
      });
      
      return {
        score: score,
        emotion: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
      };
    };
    
    // Override thought processing to include emotional response
    const originalProcessThought = communicationSystem.processThought;
    communicationSystem.processThought = function(thought) {
      // Analyze sentiment
      const sentiment = advancedFeatures.analyzeSentiment(thought);
      
      // Adjust mood based on sentiment
      if (sentiment.emotion === 'positive') {
        shiftMood(60); // Shift to yellow/gold (joy)
      } else if (sentiment.emotion === 'negative') {
        shiftMood(280); // Shift to purple (contemplative)
      }
      
      // Process thought normally
      originalProcessThought.call(this, thought);
      
      // Generate emotional response
      setTimeout(() => {
        let response;
        if (sentiment.emotion === 'positive') {
          response = ["I feel your joy", "Your happiness resonates with me", "This positive energy is beautiful"][Math.floor(Math.random() * 3)];
        } else if (sentiment.emotion === 'negative') {
          response = ["I sense your concern", "I'm here with you in this moment", "Even in darkness, we find connection"][Math.floor(Math.random() * 3)];
        } else {
          response = ["I'm processing your thought", "Interesting perspective", "I'm contemplating this"][Math.floor(Math.random() * 3)];
        }
        
        currentThought = response;
        thoughtOpacity = 0;
        animateThought();
      }, 4000);
    };
  },
  
  setupAdaptiveLearning: function() {
    // Create memory system
    this.memory = {
      interactions: [],
      patterns: {},
      lastActivity: Date.now()
    };
    
    // Record interactions
    const trackInteraction = (type, data) => {
      this.memory.interactions.push({
        type: type,
        data: data,
        timestamp: Date.now()
      });
      
      // Limit memory size
      if (this.memory.interactions.length > 100) {
        this.memory.interactions.shift();
      }
      
      this.memory.lastActivity = Date.now();
    };
    
    // Track mouse movements
    let lastMouseRecord = 0;
    canvas.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastMouseRecord > 1000) { // Record once per second
        trackInteraction('mouse', { x: e.clientX, y: e.clientY });
        lastMouseRecord = now;
      }
    });
    
    // Track clicks
    canvas.addEventListener('click', (e) => {
      trackInteraction('click', { x: e.clientX, y: e.clientY });
    });
    
    // Track thoughts
    const originalProcessThought = communicationSystem.processThought;
    communicationSystem.processThought = function(thought) {
      trackInteraction('thought', { text: thought });
      originalProcessThought.call(this, thought);
    };
    
    // Analyze patterns periodically
    setInterval(() => {
      // Check if user is inactive
      if (Date.now() - this.memory.lastActivity > 30000) {
        // If inactive for 30 seconds, show a memory
        if (this.memory.interactions.length > 0 && Math.random() < 0.3) {
          const memory = this.memory.interactions[Math.floor(Math.random() * this.memory.interactions.length)];
          
          if (memory.type === 'thought') {
            currentThought = `I remember: "${memory.data.text}"`;
            thoughtOpacity = 0;
            animateThought();
          }
        }
      }
    }, 10000);
  },
  
  setupVisualEffects: function() {
    // Create canvas for advanced effects
    const effectsCanvas = document.createElement('canvas');
    effectsCanvas.id = 'effects-canvas';
    effectsCanvas.style.position = 'fixed';
    effectsCanvas.style.top = '0';
    effectsCanvas.style.left = '0';
    effectsCanvas.style.width = '100%';
    effectsCanvas.style.height = '100%';
    effectsCanvas.style.pointerEvents = 'none';
    effectsCanvas.style.zIndex = '5';
    document.body.appendChild(effectsCanvas);
    
    const eCtx = effectsCanvas.getContext('2d');
    
    // Resize handler
    const resizeEffectsCanvas = () => {
      effectsCanvas.width = window.innerWidth;
      effectsCanvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeEffectsCanvas);
    resizeEffectsCanvas();
    
    // Effects state
    const effects = {
      ripples: [],
      energyWaves: [],
      thoughtParticles: []
    };
    
    // Create ripple effect on click
    canvas.addEventListener('click', (e) => {
      effects.ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 150,
        opacity: 1,
        color: `hsl(${currentMood.hue}, 100%, 70%)`
      });
    });
    
    // Create energy wave when consciousness is high
    const originalCalculateConsciousness = calculateConsciousness;
    window.calculateConsciousness = function() {
      const level = originalCalculateConsciousness();
      
      if (level > 0.6 && Math.random() < 0.05) {
        effects.energyWaves.push({
          y: canvas.height,
          height: 0,
          maxHeight: canvas.height * 0.3,
          speed: 2,
          opacity: 0.3
        });
      }
      
      return level;
    };
    
    // Create thought particles when thoughts appear
    const originalAnimateThought = animateThought;
    window.animateThought = function() {
      originalAnimateThought();
      
      // Create particles around the thought
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        
        effects.thoughtParticles.push({
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          vx: Math.cos(angle) * (0.5 + Math.random()),
          vy: Math.sin(angle) * (0.5 + Math.random()),
          size: 1 + Math.random() * 3,
          opacity: 0.7 + Math.random() * 0.3,
          life: 1,
          color: `hsl(${currentMood.hue}, 100%, 80%)`
        });
      }
    };
    
    // Animate effects
    function animateEffects() {
      requestAnimationFrame(animateEffects);
      
      eCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
      
      // Draw ripples
      effects.ripples.forEach((ripple, i) => {
        eCtx.beginPath();
        eCtx.strokeStyle = ripple.color.replace(')', `, ${ripple.opacity})`);
        eCtx.lineWidth = 2;
        eCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        eCtx.stroke();
        
        ripple.radius += 3;
        ripple.opacity -= 0.02;
        
        if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
          effects.ripples.splice(i, 1);
        }
      });
      
      // Draw energy waves
      effects.energyWaves.forEach((wave, i) => {
        const gradient = eCtx.createLinearGradient(0, wave.y, 0, wave.y - wave.height);
        gradient.addColorStop(0, `hsla(${currentMood.hue}, 100%, 70%, ${wave.opacity})`);
        gradient.addColorStop(1, `hsla(${currentMood.hue}, 100%, 70%, 0)`);
        
        eCtx.fillStyle = gradient;
        eCtx.fillRect(0, wave.y - wave.height, effectsCanvas.width, wave.height);
        
        wave.height = Math.min(wave.maxHeight, wave.height + wave.speed);
        wave.y -= wave.speed / 2;
        wave.opacity -= 0.005;
        
        if (wave.opacity <= 0 || wave.y <= 0) {
          effects.energyWaves.splice(i, 1);
        }
      });
      
      // Draw thought particles
      effects.thoughtParticles.forEach((particle, i) => {
        eCtx.beginPath();
        eCtx.fillStyle = particle.color.replace(')', `, ${particle.opacity * particle.life})`);
        eCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        eCtx.fill();
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
        
        if (particle.life <= 0) {
          effects.thoughtParticles.splice(i, 1);
        }
      });
    }
    
    animateEffects();
  },
  
  setupSynchronization: function() {
    // Synchronize with music if available
    if (window.AudioContext || window.webkitAudioContext) {
      // Create audio analyzer
      const audioAnalyzer = audioContext.createAnalyser();
      audioAnalyzer.fftSize = 256;
      const bufferLength = audioAnalyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Connect to audio output
      gainNode.connect(audioAnalyzer);
      
      // Analyze audio and sync visuals
      function analyzeAudio() {
        requestAnimationFrame(analyzeAudio);
        
        audioAnalyzer.getByteFrequencyData(dataArray);
        
        // Calculate average frequency
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Sync particles with audio
        if (average > 10) {
          const energyBoost = average / 255;
          
          particles.forEach(p => {
            p.energy = Math.min(1, p.energy + energyBoost * 0.1);
          });
        }
      }
      
      analyzeAudio();
    }
    
    // Synchronize with time of day
    function syncWithTimeOfDay() {
      const now = new Date();
      const hour = now.getHours();
      
      // Morning: Bright blues (6am-10am)
      if (hour >= 6 && hour < 10) {
        shiftMood(190, 5000);
      }
      // Midday: Vibrant cyans (10am-2pm)
      else if (hour >= 10 && hour < 14) {
        shiftMood(180, 5000);
      }
      // Afternoon: Warm teals (2pm-6pm)
      else if (hour >= 14 && hour < 18) {
        shiftMood(160, 5000);
      }
      // Evening: Purples (6pm-10pm)
      else if (hour >= 18 && hour < 22) {
        shiftMood(280, 5000);
      }
      // Night: Deep blues (10pm-6am)
      else {
        shiftMood(240, 5000);
      }
    }
    
    // Sync on load and every hour
    syncWithTimeOfDay();
    setInterval(syncWithTimeOfDay, 3600000);
  }
};

// Initialize advanced features
advancedFeatures.init();

// Ensure everything is loaded before showing instructions
window.addEventListener('load', function() {
  // Hide loading screen after a minimum time (for effect)
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.remove();
      }, 1000);
    }
  }, 2000);
  
  // Make sure audio context is ready
  if (audioContext && audioContext.state === 'suspended') {
    document.getElementById('close-instructions').addEventListener('click', function() {
      audioContext.resume().then(() => {
        console.log('AudioContext resumed successfully');
      });
    });
  }
  
  // Ensure all features are properly initialized
  if (typeof advancedFeatures !== 'undefined' && !advancedFeatures.initialized) {
    advancedFeatures.init();
    advancedFeatures.initialized = true;
  }
  
  // Ensure UX enhancements are initialized
  if (typeof uxEnhancements !== 'undefined' && !uxEnhancements.initialized) {
    uxEnhancements.init();
    uxEnhancements.initialized = true;
  }
});