// Neon Serpent: Reborn - Enhanced Version

class NeonSerpent {
    constructor() {
        this.initializeElements();
        this.initializeGameState();
        this.initializeCanvas();
        this.initializeParticles();
        this.initializeEnhancedFeatures();
        this.bindEvents();
        this.loadSettings();
        this.startBackgroundAnimation();
    }

    initializeElements() {
        // Screen elements
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            game: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over-screen'),
            settings: document.getElementById('settings-screen'),
            leaderboard: document.getElementById('leaderboard-screen')
        };

        // UI elements
        this.ui = {
            highScore: document.getElementById('high-score'),
            gamesPlayed: document.getElementById('games-played'),
            currentScore: document.getElementById('current-score'),
            currentLevel: document.getElementById('current-level'),
            snakeLength: document.getElementById('snake-length'),
            finalScore: document.getElementById('final-score'),
            finalLength: document.getElementById('final-length'),
            finalLevel: document.getElementById('final-level')
        };

        // Canvas elements
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.backgroundCanvas = document.getElementById('background-canvas');
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
    }

    initializeGameState() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            level: 1,
            highScore: parseInt(localStorage.getItem('neon-serpent-high-score')) || 0,
            gamesPlayed: parseInt(localStorage.getItem('neon-serpent-games-played')) || 0
        };

        this.snake = {
            body: [{x: 10, y: 10}],
            direction: {x: 1, y: 0},
            nextDirection: {x: 1, y: 0}
        };

        this.food = {
            x: 15,
            y: 15,
            glowPhase: 0
        };

        this.settings = {
            speed: 2,
            sound: true,
            theme: 'neon',
            particles: 'high'
        };

        this.particles = [];
        this.updateUI();
    }

    initializeCanvas() {
        this.gridSize = 20;
        this.tileCount = {
            x: Math.floor(this.canvas.width / this.gridSize),
            y: Math.floor(this.canvas.height / this.gridSize)
        };
        
        // Set up background canvas
        this.backgroundCanvas.width = window.innerWidth;
        this.backgroundCanvas.height = window.innerHeight;
    }

    initializeParticles() {
        this.backgroundParticles = [];
        for (let i = 0; i < 100; i++) {
            this.backgroundParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: ['#00ffff', '#ff0080', '#00ff41', '#b400ff'][Math.floor(Math.random() * 4)],
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    initializeEnhancedFeatures() {
        // Biome System
        this.biomeSystem = {
            currentBiome: 'fire',
            timeRemaining: 20000, // 20 seconds
            lastUpdate: Date.now(),
            biomes: ['fire', 'ice', 'magnetic'],
            effects: {
                fire: { speedMultiplier: 1.2, scoreMultiplier: 1.5 },
                ice: { speedMultiplier: 0.8, scoreMultiplier: 1.0 },
                magnetic: { speedMultiplier: 1.0, scoreMultiplier: 1.3 }
            }
        };

        // Phase Dash System
        this.phaseDash = {
            cooldownTime: 5000, // 5 seconds
            lastUsed: 0,
            isActive: false,
            duration: 500, // 0.5 seconds
            activatedAt: 0
        };

        // Game Entities
        this.obstacles = [];
        this.critters = [];
        this.specialFood = null;
        this.biomeParticles = [];
        
        this.gameEntities = {
            maxObstacles: 8,
            maxCritters: 4,
            specialFoodChance: 0.1,
            critterSpeed: 0.3
        };

        // Enhanced UI elements
        this.enhancedUI = {
            biomeDisplay: document.querySelector('.biome-display'),
            biomeName: document.querySelector('.biome-name'),
            biomeTimer: document.querySelector('.biome-timer'),
            dashCooldown: document.querySelector('.dash-cooldown'),
            cooldownBar: document.querySelector('.cooldown-fill'),
            critterCount: document.querySelector('.critter-count')
        };
    }

    bindEvents() {
        // Menu buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-btn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('leaderboard-back-btn').addEventListener('click', () => this.showMainMenu());

        // Game controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Settings
        document.getElementById('speed-setting').addEventListener('change', (e) => {
            this.settings.speed = parseInt(e.target.value);
            this.saveSettings();
        });
        
        document.getElementById('sound-setting').addEventListener('change', (e) => {
            this.settings.sound = e.target.value === 'on';
            this.saveSettings();
        });
        
        document.getElementById('theme-setting').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('particles-setting').addEventListener('change', (e) => {
            this.settings.particles = e.target.value;
            this.saveSettings();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.backgroundCanvas.width = window.innerWidth;
            this.backgroundCanvas.height = window.innerHeight;
        });

        // Initialize mobile controls
        this.initializeMobileControls();
    }

    handleKeyPress(e) {
        if (!this.gameState.isPlaying) return;

        const key = e.key;
        const currentDir = this.snake.direction;

        // Prevent reverse direction
        switch(key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (currentDir.y !== 1) this.snake.nextDirection = {x: 0, y: -1};
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (currentDir.y !== -1) this.snake.nextDirection = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (currentDir.x !== 1) this.snake.nextDirection = {x: -1, y: 0};
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (currentDir.x !== -1) this.snake.nextDirection = {x: 1, y: 0};
                break;
            case ' ':
                e.preventDefault();
                if (this.gameState.isPaused) {
                    this.togglePause();
                } else {
                    this.activatePhaseDash();
                }
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }
    }

    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.level = 1;
        
        this.snake.body = [{x: 10, y: 10}];
        this.snake.direction = {x: 1, y: 0};
        this.snake.nextDirection = {x: 1, y: 0};
        
        // Reset enhanced features
        this.biomeSystem.currentBiome = 'fire';
        this.biomeSystem.timeRemaining = 20000;
        this.biomeSystem.lastUpdate = Date.now();
        this.phaseDash.lastUsed = 0;
        this.phaseDash.isActive = false;
        
        this.generateFood();
        this.initializeGameEntities();
        this.updateCanvasBiome();
        this.particles = [];
        this.biomeParticles = [];
        
        this.showScreen('game');
        this.updateUI();
        this.updateEnhancedUI();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameState.isPlaying) return;
        
        if (!this.gameState.isPaused) {
            this.updateGame();
            this.renderGame();
        }
        
        const speed = [200, 150, 100, 75, 50][this.settings.speed - 1] || 150;
        setTimeout(() => this.gameLoop(), speed);
    }

    updateGame() {
        // Update enhanced systems
        this.updateBiomeSystem();
        this.updateCritters();
        this.updateEnhancedUI();
        
        // Update snake direction
        this.snake.direction = {...this.snake.nextDirection};
        
        // Move snake
        const head = {...this.snake.body[0]};
        head.x += this.snake.direction.x;
        head.y += this.snake.direction.y;
        
        // Check wall collision (phase dash allows passing through)
        if (!this.phaseDash.isActive && (head.x < 0 || head.x >= this.tileCount.x || head.y < 0 || head.y >= this.tileCount.y)) {
            this.gameOver();
            return;
        }
        
        // Wrap around walls during phase dash
        if (this.phaseDash.isActive) {
            if (head.x < 0) head.x = this.tileCount.x - 1;
            if (head.x >= this.tileCount.x) head.x = 0;
            if (head.y < 0) head.y = this.tileCount.y - 1;
            if (head.y >= this.tileCount.y) head.y = 0;
        }
        
        // Check obstacle collision (phase dash allows passing through)
        if (!this.phaseDash.isActive) {
            for (let obstacle of this.obstacles) {
                if (head.x === obstacle.x && head.y === obstacle.y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Check self collision (phase dash allows passing through)
        if (!this.phaseDash.isActive) {
            for (let segment of this.snake.body) {
                if (head.x === segment.x && head.y === segment.y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        this.snake.body.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        }
        // Check special food collision
        else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.eatSpecialFood();
        }
        // Check critter collision
        else {
            let ateCreature = false;
            for (let i = this.critters.length - 1; i >= 0; i--) {
                const critter = this.critters[i];
                if (head.x === critter.x && head.y === critter.y) {
                    this.eatCritter(i);
                    ateCreature = true;
                    break;
                }
            }
            
            if (!ateCreature) {
                this.snake.body.pop();
            }
        }
        
        // Update particles
        this.updateParticles();
        
        this.updateUI();
    }

    eatFood() {
        this.gameState.score += 10 * this.gameState.level;
        
        // Level up every 5 food items
        if (this.snake.body.length % 5 === 0) {
            this.gameState.level++;
            this.createLevelUpEffect();
        }
        
        this.createFoodEffect();
        this.generateFood();
        
        if (this.settings.sound) {
            this.playSound('eat');
        }
    }

    generateFood() {
        let validPosition = false;
        
        while (!validPosition) {
            this.food.x = Math.floor(Math.random() * this.tileCount.x);
            this.food.y = Math.floor(Math.random() * this.tileCount.y);
            
            validPosition = true;
            for (let segment of this.snake.body) {
                if (segment.x === this.food.x && segment.y === this.food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        this.food.glowPhase = 0;
    }

    gameOver() {
        this.gameState.isPlaying = false;
        this.gameState.gamesPlayed++;
        
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
            localStorage.setItem('neon-serpent-high-score', this.gameState.highScore);
        }
        
        localStorage.setItem('neon-serpent-games-played', this.gameState.gamesPlayed);
        
        this.updateFinalStats();
        this.createGameOverEffect();
        
        if (this.settings.sound) {
            this.playSound('gameOver');
        }
        
        setTimeout(() => {
            this.showScreen('gameOver');
        }, 1000);
    }

    renderGame() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw critters
        this.drawCritters();
        
        // Draw food
        this.drawFood();
        
        // Draw special food
        this.drawSpecialFood();
        
        // Draw snake
        this.drawSnake();
        
        // Draw biome particles
        this.drawBiomeParticles();
        
        // Draw particles
        this.drawParticles();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.tileCount.x; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.tileCount.y; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        this.snake.body.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Snake body
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#00ffff';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 20;
            } else {
                // Body
                this.ctx.fillStyle = `hsl(180, 100%, ${50 + (index * 2)}%)`;
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 10;
            }
            
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        });
    }

    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        this.food.glowPhase += 0.1;
        const glow = Math.sin(this.food.glowPhase) * 0.5 + 0.5;
        
        this.ctx.fillStyle = '#ff0080';
        this.ctx.shadowColor = '#ff0080';
        this.ctx.shadowBlur = 15 + glow * 10;
        
        this.ctx.fillRect(x + 4, y + 4, this.gridSize - 8, this.gridSize - 8);
        this.ctx.shadowBlur = 0;
    }

    createFoodEffect() {
        const centerX = (this.food.x * this.gridSize) + (this.gridSize / 2);
        const centerY = (this.food.y * this.gridSize) + (this.gridSize / 2);
        
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                decay: 0.02,
                color: '#ff0080',
                size: Math.random() * 3 + 1
            });
        }
    }

    createLevelUpEffect() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                decay: 0.015,
                color: '#00ff41',
                size: Math.random() * 4 + 2
            });
        }
    }

    createGameOverEffect() {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                decay: 0.01,
                color: '#b400ff',
                size: Math.random() * 5 + 2
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            return particle.life > 0;
        });
    }

    drawParticles() {
        if (this.settings.particles === 'off') return;
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    startBackgroundAnimation() {
        const animate = () => {
            this.updateBackgroundParticles();
            this.drawBackgroundParticles();
            requestAnimationFrame(animate);
        };
        animate();
    }

    updateBackgroundParticles() {
        if (this.settings.particles === 'off') return;
        
        this.backgroundParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;
        });
    }

    drawBackgroundParticles() {
        if (this.settings.particles === 'off') {
            this.backgroundCtx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
            return;
        }
        
        this.backgroundCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
        
        this.backgroundParticles.forEach(particle => {
            this.backgroundCtx.save();
            this.backgroundCtx.globalAlpha = particle.alpha;
            this.backgroundCtx.fillStyle = particle.color;
            this.backgroundCtx.shadowColor = particle.color;
            this.backgroundCtx.shadowBlur = 5;
            
            this.backgroundCtx.beginPath();
            this.backgroundCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.backgroundCtx.fill();
            
            this.backgroundCtx.restore();
        });
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }

    showMainMenu() {
        this.showScreen('mainMenu');
        this.updateUI();
    }

    showLeaderboard() {
        this.showScreen('leaderboard');
        this.updateLeaderboard();
    }

    showSettings() {
        this.showScreen('settings');
        this.loadSettings();
    }

    updateUI() {
        if (this.ui.highScore) this.ui.highScore.textContent = this.gameState.highScore;
        if (this.ui.gamesPlayed) this.ui.gamesPlayed.textContent = this.gameState.gamesPlayed;
        if (this.ui.currentScore) this.ui.currentScore.textContent = this.gameState.score;
        if (this.ui.currentLevel) this.ui.currentLevel.textContent = this.gameState.level;
        if (this.ui.snakeLength) this.ui.snakeLength.textContent = this.snake.body.length;
    }

    updateFinalStats() {
        if (this.ui.finalScore) this.ui.finalScore.textContent = this.gameState.score;
        if (this.ui.finalLength) this.ui.finalLength.textContent = this.snake.body.length;
        if (this.ui.finalLevel) this.ui.finalLevel.textContent = this.gameState.level;
    }

    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        const scores = this.getLeaderboard();
        
        leaderboardList.innerHTML = '';
        
        scores.forEach((score, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">PLAYER</span>
                <span class="score">${score}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }

    getLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('neon-serpent-leaderboard')) || [];
        scores.push(this.gameState.highScore);
        scores.sort((a, b) => b - a);
        return scores.slice(0, 10);
    }

    saveLeaderboard() {
        const scores = this.getLeaderboard();
        localStorage.setItem('neon-serpent-leaderboard', JSON.stringify(scores));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('neon-serpent-settings');
        if (savedSettings) {
            this.settings = {...this.settings, ...JSON.parse(savedSettings)};
        }
        
        // Update UI
        document.getElementById('speed-setting').value = this.settings.speed;
        document.getElementById('sound-setting').value = this.settings.sound ? 'on' : 'off';
        document.getElementById('theme-setting').value = this.settings.theme;
        document.getElementById('particles-setting').value = this.settings.particles;
    }

    saveSettings() {
        localStorage.setItem('neon-serpent-settings', JSON.stringify(this.settings));
    }

    playSound(type) {
        if (!this.settings.sound) return;
        
        // Create simple sound effects using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'eat':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                break;
            case 'gameOver':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
                break;
            case 'dash':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.2);
                break;
            case 'critter':
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.15);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    // ============ ENHANCED FEATURES METHODS ============

    // Phase Dash System
    activatePhaseDash() {
        const now = Date.now();
        if (now - this.phaseDash.lastUsed < this.phaseDash.cooldownTime) return;
        
        this.phaseDash.isActive = true;
        this.phaseDash.activatedAt = now;
        this.phaseDash.lastUsed = now;
        
        this.createPhaseDashEffect();
        this.showFlashMessage('PHASE DASH ACTIVATED!');
        
        if (this.settings.sound) {
            this.playSound('dash');
        }
        
        setTimeout(() => {
            this.phaseDash.isActive = false;
        }, this.phaseDash.duration);
    }

    createPhaseDashEffect() {
        const head = this.snake.body[0];
        const centerX = (head.x * this.gridSize) + (this.gridSize / 2);
        const centerY = (head.y * this.gridSize) + (this.gridSize / 2);
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                decay: 0.03,
                color: '#00ffff',
                size: Math.random() * 4 + 2
            });
        }
    }

    // Biome System
    updateBiomeSystem() {
        const now = Date.now();
        const deltaTime = now - this.biomeSystem.lastUpdate;
        this.biomeSystem.timeRemaining -= deltaTime;
        this.biomeSystem.lastUpdate = now;
        
        if (this.biomeSystem.timeRemaining <= 0) {
            this.switchBiome();
        }
        
        this.updateBiomeUI();
        this.updateBiomeParticles();
    }

    switchBiome() {
        const currentIndex = this.biomeSystem.biomes.indexOf(this.biomeSystem.currentBiome);
        const nextIndex = (currentIndex + 1) % this.biomeSystem.biomes.length;
        this.biomeSystem.currentBiome = this.biomeSystem.biomes[nextIndex];
        this.biomeSystem.timeRemaining = 15000 + Math.random() * 10000; // 15-25 seconds
        
        this.updateCanvasBiome();
        this.showFlashMessage(`${this.biomeSystem.currentBiome.toUpperCase()} BIOME ACTIVATED!`);
        
        if (this.settings.sound) {
            this.playSound('eat'); // Reuse eat sound for biome switch
        }
    }

    updateCanvasBiome() {
        this.canvas.className = `biome-${this.biomeSystem.currentBiome}`;
    }

    updateBiomeUI() {
        if (this.enhancedUI.biomeName) {
            this.enhancedUI.biomeName.textContent = this.biomeSystem.currentBiome;
            this.enhancedUI.biomeDisplay.className = `biome-display biome-${this.biomeSystem.currentBiome}`;
        }
        
        if (this.enhancedUI.biomeTimer) {
            const seconds = Math.ceil(this.biomeSystem.timeRemaining / 1000);
            this.enhancedUI.biomeTimer.textContent = `${seconds}s`;
        }
    }

    updateBiomeParticles() {
        // Add biome-specific ambient particles
        if (Math.random() < 0.1) {
            const colors = {
                fire: '#ff4500',
                ice: '#87ceeb',
                magnetic: '#9932cc'
            };
            
            this.biomeParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1,
                decay: 0.01,
                color: colors[this.biomeSystem.currentBiome],
                size: Math.random() * 2 + 1
            });
        }
        
        // Update existing biome particles
        this.biomeParticles = this.biomeParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            return particle.life > 0;
        });
    }

    // Game Entities Management
    initializeGameEntities() {
        this.obstacles = [];
        this.critters = [];
        this.specialFood = null;
        this.biomeParticles = [];
        
        // Generate initial obstacles
        this.generateObstacles();
        this.generateCritters();
        this.maybeGenerateSpecialFood();
    }

    generateObstacles() {
        for (let i = 0; i < this.gameEntities.maxObstacles; i++) {
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                const x = Math.floor(Math.random() * this.tileCount.x);
                const y = Math.floor(Math.random() * this.tileCount.y);
                
                validPosition = true;
                
                // Check if position conflicts with snake or food
                for (let segment of this.snake.body) {
                    if (segment.x === x && segment.y === y) {
                        validPosition = false;
                        break;
                    }
                }
                
                if (validPosition && (x === this.food.x && y === this.food.y)) {
                    validPosition = false;
                }
                
                // Check distance from snake head
                const head = this.snake.body[0];
                if (validPosition && Math.abs(head.x - x) < 3 && Math.abs(head.y - y) < 3) {
                    validPosition = false;
                }
                
                if (validPosition) {
                    this.obstacles.push({ x, y });
                }
                
                attempts++;
            }
        }
    }

    generateCritters() {
        for (let i = 0; i < this.gameEntities.maxCritters; i++) {
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                const x = Math.floor(Math.random() * this.tileCount.x);
                const y = Math.floor(Math.random() * this.tileCount.y);
                
                validPosition = true;
                
                // Check conflicts
                for (let segment of this.snake.body) {
                    if (segment.x === x && segment.y === y) {
                        validPosition = false;
                        break;
                    }
                }
                
                for (let obstacle of this.obstacles) {
                    if (obstacle.x === x && obstacle.y === y) {
                        validPosition = false;
                        break;
                    }
                }
                
                if (validPosition && (x === this.food.x && y === this.food.y)) {
                    validPosition = false;
                }
                
                if (validPosition) {
                    this.critters.push({
                        x, y,
                        targetX: x,
                        targetY: y,
                        moveTimer: Math.random() * 100
                    });
                }
                
                attempts++;
            }
        }
    }

    maybeGenerateSpecialFood() {
        if (Math.random() < this.gameEntities.specialFoodChance) {
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                const x = Math.floor(Math.random() * this.tileCount.x);
                const y = Math.floor(Math.random() * this.tileCount.y);
                
                validPosition = true;
                
                // Check all conflicts
                for (let segment of this.snake.body) {
                    if (segment.x === x && segment.y === y) {
                        validPosition = false;
                        break;
                    }
                }
                
                for (let obstacle of this.obstacles) {
                    if (obstacle.x === x && obstacle.y === y) {
                        validPosition = false;
                        break;
                    }
                }
                
                for (let critter of this.critters) {
                    if (critter.x === x && critter.y === y) {
                        validPosition = false;
                        break;
                    }
                }
                
                if (validPosition && (x === this.food.x && y === this.food.y)) {
                    validPosition = false;
                }
                
                if (validPosition) {
                    this.specialFood = {
                        x, y,
                        glowPhase: 0,
                        rotation: 0
                    };
                }
                
                attempts++;
            }
        }
    }

    // Flash Messages
    showFlashMessage(text) {
        const message = document.createElement('div');
        message.className = 'flash-message';
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2500);
    }

    // Enhanced UI Updates
    updateEnhancedUI() {
        // Update dash cooldown
        if (this.enhancedUI.cooldownBar) {
            const now = Date.now();
            const timeSince = now - this.phaseDash.lastUsed;
            const progress = Math.min(timeSince / this.phaseDash.cooldownTime, 1);
            this.enhancedUI.cooldownBar.style.width = (progress * 100) + '%';
            
            if (progress >= 1) {
                this.enhancedUI.cooldownBar.classList.add('cooldown-ready');
            } else {
                this.enhancedUI.cooldownBar.classList.remove('cooldown-ready');
            }
        }
        
        // Update critter count
        if (this.enhancedUI.critterCount) {
            this.enhancedUI.critterCount.textContent = this.critters.length;
        }
    }

    // Critter AI System
    updateCritters() {
        this.critters.forEach(critter => {
            critter.moveTimer--;
            
            if (critter.moveTimer <= 0) {
                // Choose new random target nearby
                const directions = [
                    {x: 0, y: -1}, {x: 0, y: 1},
                    {x: -1, y: 0}, {x: 1, y: 0}
                ];
                
                const direction = directions[Math.floor(Math.random() * directions.length)];
                critter.targetX = Math.max(0, Math.min(this.tileCount.x - 1, critter.x + direction.x));
                critter.targetY = Math.max(0, Math.min(this.tileCount.y - 1, critter.y + direction.y));
                critter.moveTimer = 30 + Math.random() * 60; // Reset timer
            }
            
            // Move towards target
            if (critter.x < critter.targetX) critter.x++;
            else if (critter.x > critter.targetX) critter.x--;
            
            if (critter.y < critter.targetY) critter.y++;
            else if (critter.y > critter.targetY) critter.y--;
        });
    }

    eatCritter(index) {
        const biomeMultiplier = this.biomeSystem.effects[this.biomeSystem.currentBiome].scoreMultiplier;
        const basePoints = 25;
        const points = Math.floor(basePoints * biomeMultiplier * this.gameState.level);
        
        this.gameState.score += points;
        this.showFlashMessage(`+${points} CRITTER BONUS!`);
        
        // Create critter eat effect
        const critter = this.critters[index];
        const centerX = (critter.x * this.gridSize) + (this.gridSize / 2);
        const centerY = (critter.y * this.gridSize) + (this.gridSize / 2);
        
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: 0.025,
                color: '#ff8800',
                size: Math.random() * 3 + 2
            });
        }
        
        this.critters.splice(index, 1);
        
        if (this.settings.sound) {
            this.playSound('critter');
        }
    }

    // Special Food System
    eatSpecialFood() {
        const biomeMultiplier = this.biomeSystem.effects[this.biomeSystem.currentBiome].scoreMultiplier;
        const basePoints = 50;
        const points = Math.floor(basePoints * biomeMultiplier * this.gameState.level);
        
        this.gameState.score += points;
        this.showFlashMessage(`+${points} STAR FOOD BONUS!`);
        
        // Create special food effect
        const centerX = (this.specialFood.x * this.gridSize) + (this.gridSize / 2);
        const centerY = (this.specialFood.y * this.gridSize) + (this.gridSize / 2);
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                decay: 0.02,
                color: '#ffff00',
                size: Math.random() * 4 + 2
            });
        }
        
        this.specialFood = null;
        
        // Maybe generate a new special food
        this.maybeGenerateSpecialFood();
        
        if (this.settings.sound) {
            this.playSound('eat');
        }
    }

    // Enhanced Drawing Methods
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            const x = obstacle.x * this.gridSize;
            const y = obstacle.y * this.gridSize;
            
            this.ctx.fillStyle = '#666666';
            this.ctx.shadowColor = '#aaaaaa';
            this.ctx.shadowBlur = 8;
            
            // Draw as rounded rectangle
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // Add inner glow
            this.ctx.fillStyle = '#999999';
            this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
            
            this.ctx.shadowBlur = 0;
        });
    }

    drawCritters() {
        this.critters.forEach(critter => {
            const x = critter.x * this.gridSize;
            const y = critter.y * this.gridSize;
            const centerX = x + this.gridSize / 2;
            const centerY = y + this.gridSize / 2;
            
            this.ctx.fillStyle = '#ff8800';
            this.ctx.shadowColor = '#ff8800';
            this.ctx.shadowBlur = 12;
            
            // Draw as circle
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, (this.gridSize / 2) - 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add animated pulse effect
            const pulseSize = Math.sin(Date.now() * 0.01) * 2 + 2;
            this.ctx.fillStyle = '#ffaa33';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        });
    }

    drawSpecialFood() {
        if (!this.specialFood) return;
        
        const x = this.specialFood.x * this.gridSize;
        const y = this.specialFood.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        
        this.specialFood.glowPhase += 0.2;
        this.specialFood.rotation += 0.1;
        const glow = Math.sin(this.specialFood.glowPhase) * 0.5 + 0.5;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.specialFood.rotation);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 20 + glow * 15;
        
        // Draw star shape
        this.ctx.beginPath();
        const points = 5;
        const outerRadius = (this.gridSize / 2) - 2;
        const innerRadius = outerRadius * 0.4;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }

    drawBiomeParticles() {
        if (this.settings.particles === 'off') return;
        
        this.biomeParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life * 0.6;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 8;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    // Mobile Touch Controls System
    initializeMobileControls() {
        // Detect mobile device
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        // Mobile touch controls state
        this.touchControls = {
            startX: 0,
            startY: 0,
            isScrolling: false,
            threshold: 50, // Minimum swipe distance
            allowedTime: 300, // Maximum swipe time
            startTime: 0
        };
        
        // Show mobile controls if on mobile
        if (this.isMobile) {
            this.showMobileControls();
        }
        
        // Bind touch events
        this.bindTouchEvents();
        this.bindMobileButtons();
    }
    
    showMobileControls() {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.classList.add('active');
        }
    }
    
    hideMobileControls() {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.classList.remove('active');
        }
    }
    
    bindTouchEvents() {
        const swipeOverlay = document.querySelector('.swipe-overlay');
        if (!swipeOverlay) return;
        
        // Touch start
        swipeOverlay.addEventListener('touchstart', (e) => {
            if (!this.gameState.isPlaying) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            this.touchControls.startX = touch.clientX;
            this.touchControls.startY = touch.clientY;
            this.touchControls.startTime = Date.now();
            this.touchControls.isScrolling = false;
        }, { passive: false });
        
        // Touch move
        swipeOverlay.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Touch end - detect swipe direction
        swipeOverlay.addEventListener('touchend', (e) => {
            if (!this.gameState.isPlaying || this.touchControls.isScrolling) return;
            
            e.preventDefault();
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const deltaTime = Date.now() - this.touchControls.startTime;
            
            // Check if swipe was quick enough
            if (deltaTime > this.touchControls.allowedTime) return;
            
            const deltaX = endX - this.touchControls.startX;
            const deltaY = endY - this.touchControls.startY;
            
            // Check if swipe was far enough
            if (Math.abs(deltaX) < this.touchControls.threshold && Math.abs(deltaY) < this.touchControls.threshold) return;
            
            // Determine swipe direction
            const currentDir = this.snake.direction;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    // Swipe right
                    if (currentDir.x !== -1) this.snake.nextDirection = {x: 1, y: 0};
                } else {
                    // Swipe left
                    if (currentDir.x !== 1) this.snake.nextDirection = {x: -1, y: 0};
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    // Swipe down
                    if (currentDir.y !== -1) this.snake.nextDirection = {x: 0, y: 1};
                } else {
                    // Swipe up
                    if (currentDir.y !== 1) this.snake.nextDirection = {x: 0, y: -1};
                }
            }
        }, { passive: false });
    }
    
    bindMobileButtons() {
        // Action buttons
        const dashBtn = document.querySelector('.dash-btn');
        const pauseBtn = document.querySelector('.pause-btn');
        
        // Bind action buttons
        if (dashBtn) {
            dashBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.gameState.isPlaying || this.gameState.isPaused) return;
                this.activatePhaseDash();
            }, { passive: false });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.gameState.isPlaying) return;
                this.togglePause();
            }, { passive: false });
        }
    }
    
    // Update mobile UI elements
    updateMobileUI() {
        if (!this.isMobile) return;
        
        // Update dash button state
        const dashBtn = document.querySelector('.dash-btn');
        if (dashBtn) {
            const now = Date.now();
            const timeSince = now - this.phaseDash.lastUsed;
            const canDash = timeSince >= this.phaseDash.cooldownTime;
            
            if (canDash) {
                dashBtn.classList.remove('disabled');
            } else {
                dashBtn.classList.add('disabled');
            }
        }
    }
    
    // Override game state changes to handle mobile controls
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.level = 1;
        
        this.snake.body = [{x: 10, y: 10}];
        this.snake.direction = {x: 1, y: 0};
        this.snake.nextDirection = {x: 1, y: 0};
        
        // Reset enhanced features
        this.biomeSystem.currentBiome = 'fire';
        this.biomeSystem.timeRemaining = 20000;
        this.biomeSystem.lastUpdate = Date.now();
        this.phaseDash.lastUsed = 0;
        this.phaseDash.isActive = false;
        
        this.generateFood();
        this.initializeGameEntities();
        this.updateCanvasBiome();
        this.particles = [];
        this.biomeParticles = [];
        
        this.showScreen('game');
        this.updateUI();
        this.updateEnhancedUI();
        this.updateMobileUI();
        
        // Show mobile controls during gameplay
        if (this.isMobile) {
            this.showMobileControls();
        }
        
        this.gameLoop();
    }
    
    gameOver() {
        this.gameState.isPlaying = false;
        this.gameState.gamesPlayed++;
        
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
            localStorage.setItem('neon-serpent-high-score', this.gameState.highScore);
        }
        
        localStorage.setItem('neon-serpent-games-played', this.gameState.gamesPlayed);
        
        this.updateFinalStats();
        this.createGameOverEffect();
        
        if (this.settings.sound) {
            this.playSound('gameOver');
        }
        
        // Hide mobile controls when game ends
        if (this.isMobile) {
            this.hideMobileControls();
        }
        
        setTimeout(() => {
            this.showScreen('gameOver');
        }, 1000);
    }
    
    updateGame() {
        // Update enhanced systems
        this.updateBiomeSystem();
        this.updateCritters();
        this.updateEnhancedUI();
        this.updateMobileUI();
        
        // Update snake direction
        this.snake.direction = {...this.snake.nextDirection};
        
        // Move snake
        const head = {...this.snake.body[0]};
        head.x += this.snake.direction.x;
        head.y += this.snake.direction.y;
        
        // Check wall collision (phase dash allows passing through)
        if (!this.phaseDash.isActive && (head.x < 0 || head.x >= this.tileCount.x || head.y < 0 || head.y >= this.tileCount.y)) {
            this.gameOver();
            return;
        }
        
        // Wrap around walls during phase dash
        if (this.phaseDash.isActive) {
            if (head.x < 0) head.x = this.tileCount.x - 1;
            if (head.x >= this.tileCount.x) head.x = 0;
            if (head.y < 0) head.y = this.tileCount.y - 1;
            if (head.y >= this.tileCount.y) head.y = 0;
        }
        
        // Check obstacle collision (phase dash allows passing through)
        if (!this.phaseDash.isActive) {
            for (let obstacle of this.obstacles) {
                if (head.x === obstacle.x && head.y === obstacle.y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Check self collision (phase dash allows passing through)
        if (!this.phaseDash.isActive) {
            for (let segment of this.snake.body) {
                if (head.x === segment.x && head.y === segment.y) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        this.snake.body.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        }
        // Check special food collision
        else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.eatSpecialFood();
        }
        // Check critter collision
        else {
            let ateCreature = false;
            for (let i = this.critters.length - 1; i >= 0; i--) {
                const critter = this.critters[i];
                if (head.x === critter.x && head.y === critter.y) {
                    this.eatCritter(i);
                    ateCreature = true;
                    break;
                }
            }
            
            if (!ateCreature) {
                this.snake.body.pop();
            }
        }
        
        // Update particles
        this.updateParticles();
        
        this.updateUI();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NeonSerpent();
});
