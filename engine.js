/**
 * LIVING WORLD ENGINE — Canvas Animation Engine (engine.js)
 * Implements Device-Pixel-Ratio (DPR) retina scaling, procedural water systems (waterfall and river),
 * flocking birds, wind-influenced cherry blossom petals, hovering butterflies, night-spawn fireflies,
 * weather particle overlay, and real-time lighting system.
 * Adds custom animals (fox, squirrel, koi fish), mist, splash particles, and river ripples.
 */

class LivingWorldEngine {
    constructor() {
        this.baseImage = document.getElementById('base-image');
        this.treeLeft = document.getElementById('tree-left-sway');
        this.treeRight = document.getElementById('tree-right-sway');
        
        this.waterCanvas = document.getElementById('water-canvas');
        this.physicsCanvas = document.getElementById('physics-canvas');
        this.galaxyCanvas = document.getElementById('galaxy-canvas');
        
        this.wCtx = this.waterCanvas.getContext('2d');
        this.pCtx = this.physicsCanvas.getContext('2d');
        this.gCtx = this.galaxyCanvas.getContext('2d');
        
        this.dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Environment state
        this.windSpeed = 1.0;
        this.targetWindSpeed = 1.0;
        this.timeOfDay = 0.5; // 0.0 - 1.0
        this.isNight = false;
        this.weatherMode = 'clear'; // clear, rain, snow, fog, storm

        // Season setting based on current month
        const currentMonth = new Date().getMonth();
        if (currentMonth >= 11 || currentMonth <= 1) {
            this.season = 'WINTER';
        } else if (currentMonth >= 2 && currentMonth <= 4) {
            this.season = 'SPRING';
        } else if (currentMonth >= 5 && currentMonth <= 7) {
            this.season = 'SUMMER';
        } else {
            this.season = 'AUTUMN';
        }

        // Add season class to world element
        const worldEl = document.getElementById('world');
        if (worldEl) {
            worldEl.classList.add(`season-${this.season.toLowerCase()}`);
        }

        this.rainbowAlpha = 0;
        this.prevWeatherMode = 'clear';

        // Initialize Climate Variables
        this.temperature = 22;
        this.targetTemperature = 22;
        this.humidity = 45;
        this.targetHumidity = 45;
        this.pressure = 1018;
        this.targetPressure = 1018;
        this.climateTimer = 0;
        this.riverRise = 0;
        this.targetRiverRise = 0;

        // Mascot cursor trails
        this.mascotParticles = [];
        this.mascotX = 0;
        this.mascotY = 0;
        
        // Parallax coordinates
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.cursorActiveX = 0;
        this.cursorActiveY = 0;
        this.mouseActive = false;
        
        // Entities pools
        this.waterParticles = [];
        this.splashParticles = [];
        this.mistParticles = [];
        this.ripples = [];
        this.petals = [];
        this.birds = [];
        this.butterflies = [];
        this.fireflies = [];
        this.stars = [];
        
        // Wildlife animals
        this.koi = null;
        this.squirrel = null;
        this.fox = null;
        
        // Weather entities
        this.rainDrops = [];
        this.snowFlakes = [];
        this.lightningFlash = 0;
        this.galaxyRot = 0;
        
        this.lastTime = performance.now();
        this.init();
        this.bindEvents();
        this.animate();
    }
    
    init() {
        this.resize();
        
        // Populate static entities
        this.initStars();
        
        // Initialize water particles (300 particles for dense waterfall & river)
        for (let i = 0; i < 300; i++) {
            const p = new WaterParticle(this.width, this.height);
            p.y = Math.random() * this.height;
            this.waterParticles.push(p);
        }
        
        // Initialize sakura petals
        for (let i = 0; i < 150; i++) {
            this.petals.push(new Petal(this.width, this.height));
        }
        
        // Initialize flocking birds
        for (let i = 0; i < 8; i++) {
            this.birds.push(new Bird(this.width, this.height));
        }
        
        // Initialize butterflies
        for (let i = 0; i < 6; i++) {
            this.butterflies.push(new Butterfly(this.width, this.height));
        }
        
        // Initialize fireflies
        for (let i = 0; i < 40; i++) {
            this.fireflies.push(new Firefly(this.width, this.height));
        }
        
        // Initialize Wildlife
        this.koi = new KoiFish(this.width, this.height);
        this.squirrel = new Squirrel(this.width, this.height);
        this.fox = new Fox(this.width, this.height);
    }
    
    initStars() {
        this.stars = [];
        const count = 700;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width * 2 - this.width / 2,
                y: Math.random() * this.height * 2 - this.height / 2,
                size: Math.random() * 1.5,
                alpha: Math.random()
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX / window.innerWidth) - 0.5;
            this.targetMouseY = (e.clientY / window.innerHeight) - 0.5;
            
            this.cursorActiveX = e.clientX;
            this.cursorActiveY = e.clientY;
            this.mouseActive = true;
            
            // Mouse hover ripples in river zones (Y: 72% to 98%)
            if (this.cursorActiveY > this.height * 0.72 && this.cursorActiveY < this.height * 0.98) {
                if (Math.random() < 0.18) {
                    this.spawnRipple(this.cursorActiveX, this.cursorActiveY, 5, 0.8, 30);
                }
            }
        });
        
        window.addEventListener('mouseleave', () => {
            this.mouseActive = false;
        });
        
        // Handle file loading for background artwork
        const upload = document.getElementById('image-upload');
        if (upload) {
            upload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const url = `url('${event.target.result}')`;
                        this.baseImage.style.backgroundImage = url;
                        this.treeLeft.style.backgroundImage = url;
                        this.treeRight.style.backgroundImage = url;
                        
                        const helpText = document.getElementById('help-text');
                        if (helpText) helpText.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        [this.waterCanvas, this.physicsCanvas, this.galaxyCanvas].forEach(c => {
            c.width = this.width * this.dpr;
            c.height = this.height * this.dpr;
            c.getContext('2d').setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        });
        
        this.initStars();
        this.drawGalaxy();
    }
    
    setWeather(mode) {
        if ((this.weatherMode === 'rain' || this.weatherMode === 'storm') && mode === 'clear') {
            this.rainbowAlpha = 1.0;
        }
        this.prevWeatherMode = this.weatherMode;
        
        this.weatherMode = mode;
        this.rainDrops = [];
        this.snowFlakes = [];
        
        const worldEl = document.getElementById('world');
        if (worldEl) {
            if (mode === 'rain' || mode === 'storm') {
                worldEl.classList.add('wet-sheen');
            } else {
                worldEl.classList.remove('wet-sheen');
            }
        }
        
        if (mode === 'storm') {
            this.targetWindSpeed = 4.2;
            this.targetTemperature = 12;
            this.targetHumidity = 98;
            this.targetPressure = 988;
            this.targetRiverRise = 8;
        } else if (mode === 'rain') {
            this.targetWindSpeed = 2.0;
            this.targetTemperature = 14;
            this.targetHumidity = 92;
            this.targetPressure = 998;
            this.targetRiverRise = 4;
        } else if (mode === 'snow') {
            this.targetWindSpeed = 1.2;
            this.targetTemperature = -2;
            this.targetHumidity = 85;
            this.targetPressure = 1005;
            this.targetRiverRise = 0;
        } else if (mode === 'fog') {
            this.targetWindSpeed = 0.5;
            this.targetTemperature = 8;
            this.targetHumidity = 96;
            this.targetPressure = 1010;
            this.targetRiverRise = 0;
        } else { // clear
            this.targetWindSpeed = 1.0;
            this.targetTemperature = 22;
            this.targetHumidity = 45;
            this.targetPressure = 1018;
            this.targetRiverRise = 0;
        }
    }
    
    setTimeOfDay(timeVal) {
        this.timeOfDay = timeVal;
        this.updateLighting();
    }
    
    updateLighting() {
        const atmosphere = document.getElementById('atmosphere');
        const sunFlare = document.getElementById('sun-flare');
        const phaseDisplay = document.getElementById('phase-display');
        
        if (!atmosphere || !sunFlare) return;
        
        const hour = this.timeOfDay * 24;
        
        if (hour >= 5 && hour < 8) {
            if (phaseDisplay) phaseDisplay.innerText = "Dawn";
            atmosphere.style.background = "linear-gradient(to bottom, rgba(255, 154, 158, 0.45) 0%, rgba(254, 207, 239, 0.3) 100%)";
            atmosphere.style.opacity = "0.4";
            sunFlare.style.background = "radial-gradient(circle, rgba(255, 235, 180, 0.5) 0%, transparent 60%)";
            sunFlare.style.opacity = "0.7";
            this.galaxyCanvas.style.opacity = "0";
            this.isNight = false;
        } 
        else if (hour >= 8 && hour < 17) {
            if (phaseDisplay) phaseDisplay.innerText = "Midday";
            atmosphere.style.background = "transparent";
            atmosphere.style.opacity = "0";
            sunFlare.style.background = "radial-gradient(circle, rgba(255, 245, 200, 0.4) 0%, transparent 60%)";
            sunFlare.style.opacity = "0.85";
            this.galaxyCanvas.style.opacity = "0";
            this.isNight = false;
        } 
        else if (hour >= 17 && hour < 19.5) {
            if (phaseDisplay) phaseDisplay.innerText = "Dusk";
            atmosphere.style.background = "linear-gradient(to bottom, rgba(255, 126, 95, 0.55), rgba(254, 180, 123, 0.4))";
            atmosphere.style.opacity = "0.5";
            sunFlare.style.background = "radial-gradient(circle, rgba(255, 100, 50, 0.6) 0%, transparent 60%)";
            sunFlare.style.opacity = "0.95";
            this.galaxyCanvas.style.opacity = "0.05";
            this.isNight = false;
        } 
        else {
            if (phaseDisplay) phaseDisplay.innerText = "Nightfall";
            atmosphere.style.background = "rgba(5, 8, 20, 0.72)";
            atmosphere.style.opacity = "0.75";
            sunFlare.style.opacity = "0";
            this.galaxyCanvas.style.opacity = "0.85";
            this.isNight = true;
        }
    }
    
    drawGalaxy() {
        this.gCtx.clearRect(0, 0, this.width, this.height);
        this.gCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        
        this.stars.forEach(s => {
            const twinkle = Math.sin(Date.now() * 0.002 + s.alpha * 100) * 0.3 + 0.7;
            this.gCtx.globalAlpha = s.alpha * twinkle;
            this.gCtx.beginPath();
            this.gCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.gCtx.fill();
        });
        this.gCtx.globalAlpha = 1.0;
    }
    
    spawnRipple(x, y, size = 10, speed = 1, maxRadius = 45) {
        this.ripples.push(new Ripple(x, y, size, speed, maxRadius));
    }
    
    animate() {
        const now = performance.now();
        let dt = (now - this.lastTime) / 16.666;
        if (dt > 3.0) dt = 3.0; // Clamp delta time to avoid physics explosion
        this.lastTime = now;

        this.windSpeed += (this.targetWindSpeed - this.windSpeed) * 0.03 * dt;
        
        // Easing climate parameters
        this.temperature += (this.targetTemperature - this.temperature) * 0.005 * dt;
        this.humidity += (this.targetHumidity - this.humidity) * 0.005 * dt;
        this.pressure += (this.targetPressure - this.pressure) * 0.005 * dt;
        this.riverRise += (this.targetRiverRise - this.riverRise) * 0.01 * dt;
        
        // Mascot spark coordinates tracking
        if (this.mouseActive) {
            if (this.mascotX === 0 && this.mascotY === 0) {
                this.mascotX = this.cursorActiveX;
                this.mascotY = this.cursorActiveY;
            }
            this.mascotX += (this.cursorActiveX - this.mascotX) * 0.12;
            this.mascotY += (this.cursorActiveY - this.mascotY) * 0.12;
            
            if (Math.random() < 0.38) {
                this.mascotParticles.push({
                    x: this.mascotX + (Math.random() - 0.5) * 6,
                    y: this.mascotY + (Math.random() - 0.5) * 6,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -Math.random() * 0.6 - 0.2,
                    size: Math.random() * 2 + 1.2,
                    alpha: 1.0,
                    color: `rgba(${230 + Math.round(Math.random() * 25)}, ${180 + Math.round(Math.random() * 50)}, 40, `
                });
            }
        }
        
        // Climate barometer telemetry dispatch
        this.climateTimer++;
        if (this.climateTimer >= 60) {
            this.climateTimer = 0;
            // Introduce micro-fluctuations
            const deltaTemp = (Math.random() - 0.5) * 0.2;
            const deltaHumid = (Math.random() - 0.5) * 0.8;
            const deltaPress = (Math.random() - 0.5) * 0.6;
            
            this.temperature = Math.max(-5, Math.min(38, this.temperature + deltaTemp));
            this.humidity = Math.max(10, Math.min(100, this.humidity + deltaHumid));
            this.pressure = Math.max(980, Math.min(1040, this.pressure + deltaPress));
            
            window.dispatchEvent(new CustomEvent('climateupdate', {
                detail: {
                    temp: Math.round(this.temperature),
                    humid: Math.round(this.humidity),
                    press: Math.round(this.pressure),
                    season: this.season
                }
            }));
        }

        // Update CSS variables for wind sways dynamically
        const swayDurLeft = 14 / this.windSpeed;
        const swayDurRight = 11 / this.windSpeed;
        const swayAngleLeft = 0.6 * this.windSpeed;
        const swayAngleRight = -0.8 * this.windSpeed;
        
        document.documentElement.style.setProperty('--sway-duration-left', `${swayDurLeft}s`);
        document.documentElement.style.setProperty('--sway-duration-right', `${swayDurRight}s`);
        document.documentElement.style.setProperty('--sway-angle-left', `${swayAngleLeft}deg`);
        document.documentElement.style.setProperty('--sway-angle-right', `${swayAngleRight}deg`);

        this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
        
        const tiltX = this.mouseX * 15;
        const tiltY = this.mouseY * 15;
        
        const transformString = `scale(1.03) translate(${tiltX}px, ${tiltY}px)`;
        this.baseImage.style.transform = transformString;
        this.treeLeft.style.transform = `${transformString} rotate(0.4deg)`;
        this.treeRight.style.transform = `${transformString} rotate(-0.5deg)`;
        
        if (this.isNight) {
            this.galaxyRot += 0.015;
            this.galaxyCanvas.style.transform = `scale(1.25) translate(${tiltX * 0.5}px, ${tiltY * 0.5}px) rotate(${this.galaxyRot}deg)`;
        } else {
            this.galaxyCanvas.style.transform = `scale(1.25) translate(${tiltX * 0.5}px, ${tiltY * 0.5}px)`;
        }
        
        this.wCtx.clearRect(0, 0, this.width, this.height);
        this.pCtx.clearRect(0, 0, this.width, this.height);
        
        this.wCtx.save();
        this.wCtx.translate(tiltX * 0.9, tiltY * 0.9);
        
        this.pCtx.save();
        this.pCtx.translate(tiltX * 1.0, tiltY * 1.0);
        
        // ripples
        this.ripples.forEach((r, idx) => {
            r.update(dt);
            r.draw(this.wCtx);
            if (r.alpha <= 0) this.ripples.splice(idx, 1);
        });
        
        // Waterfall Base Splash & Mist triggers
        const splashZoneY = this.height * 0.72;
        
        this.waterParticles.forEach(p => {
            p.update(this.width, this.height, this.windSpeed, dt);
            
            if (p.isFall && p.y + p.vy * dt >= splashZoneY) {
                if (Math.random() < 0.45) {
                    this.splashParticles.push(new SplashParticle(p.x, splashZoneY));
                }
                if (Math.random() < 0.25) {
                    this.mistParticles.push(new MistParticle(p.x, splashZoneY));
                }
                if (Math.random() < 0.08) {
                    this.spawnRipple(p.x, splashZoneY, 4, 0.5, 24);
                }
            }
            p.draw(this.wCtx);
        });
        
        this.splashParticles.forEach((sp, idx) => {
            sp.update(dt);
            sp.draw(this.wCtx);
            if (sp.alpha <= 0) this.splashParticles.splice(idx, 1);
        });
        
        this.mistParticles.forEach((m, idx) => {
            m.update(dt);
            m.draw(this.wCtx);
            if (m.alpha <= 0) this.mistParticles.splice(idx, 1);
        });
        
        // Petals
        this.petals.forEach(pt => {
            pt.update(this.width, this.height, this.windSpeed, this.mouseX, dt);
            pt.draw(this.pCtx, this.isNight, this.season);
        });
        
        // Birds
        this.birds.forEach(b => {
            b.update(this.width, this.height, dt);
            b.draw(this.pCtx, this.isNight);
        });
        
        // Butterflies
        if (!this.isNight) {
            this.butterflies.forEach(bf => {
                bf.update(this.width, this.height, this.cursorActiveX, this.cursorActiveY, dt);
                bf.draw(this.pCtx);
            });
        }
        
        // Fireflies
        if (this.isNight) {
            this.fireflies.forEach(f => {
                f.update(this.width, this.height, dt);
                f.draw(this.pCtx);
            });
        }
        
        // Animals
        if (this.koi) {
            this.koi.update(this.width, this.height, (x, y) => {
                this.spawnRipple(x, y, 6, 0.7, 45);
                for (let i = 0; i < 8; i++) {
                    this.splashParticles.push(new SplashParticle(x, y));
                }
            }, dt);
            this.koi.draw(this.wCtx);
        }
        
        if (this.squirrel) {
            this.squirrel.update(this.width, this.height, dt);
            this.squirrel.draw(this.pCtx);
        }
        
        if (this.fox) {
            this.fox.update(this.width, this.height, dt);
            this.fox.draw(this.pCtx);
        }
        
        // Draw Mascot Spark cursor trail
        if (this.mouseActive) {
            this.pCtx.save();
            this.pCtx.beginPath();
            this.pCtx.arc(this.mascotX, this.mascotY, 3.5, 0, Math.PI * 2);
            this.pCtx.fillStyle = 'rgba(252, 211, 77, 0.9)';
            this.pCtx.shadowBlur = 10;
            this.pCtx.shadowColor = 'rgba(252, 211, 77, 1)';
            this.pCtx.fill();
            this.pCtx.restore();
        }

        this.mascotParticles.forEach((mp, idx) => {
            mp.x += mp.vx * dt;
            mp.y += mp.vy * dt;
            mp.alpha -= 0.018 * dt;
            
            this.pCtx.beginPath();
            this.pCtx.arc(mp.x, mp.y, mp.size, 0, Math.PI * 2);
            this.pCtx.fillStyle = `${mp.color}${mp.alpha})`;
            this.pCtx.fill();
            
            if (mp.alpha <= 0) {
                this.mascotParticles.splice(idx, 1);
            }
        });
        
        this.drawWeather();
        
        this.wCtx.restore();
        this.pCtx.restore();
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawWeather() {
        if (this.weatherMode === 'rain' || this.weatherMode === 'storm') {
            this.pCtx.strokeStyle = 'rgba(174, 207, 238, 0.45)';
            this.pCtx.lineWidth = 1.2;
            
            if (this.rainDrops.length < 150) {
                this.rainDrops.push({
                    x: Math.random() * this.width * 1.5 - this.width * 0.25,
                    y: -20,
                    length: Math.random() * 20 + 12,
                    speed: Math.random() * 8 + 12
                });
            }
            
            this.rainDrops.forEach(rd => {
                rd.y += rd.speed;
                rd.x += this.windSpeed * 1.5;
                
                this.pCtx.beginPath();
                this.pCtx.moveTo(rd.x, rd.y);
                this.pCtx.lineTo(rd.x + (this.windSpeed * 0.4), rd.y + rd.length);
                this.pCtx.stroke();
                
                if (rd.y > this.height * 0.72 && rd.y < this.height && Math.random() < 0.08) {
                    this.spawnRipple(rd.x, rd.y, 2, 0.6, 12);
                }
                
                if (rd.y > this.height) {
                    rd.y = -20;
                    rd.x = Math.random() * this.width * 1.5 - this.width * 0.25;
                }
            });
            
            if (this.weatherMode === 'storm') {
                if (this.lightningFlash > 0) {
                    this.lightningFlash -= 0.05;
                    this.pCtx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.7})`;
                    this.pCtx.fillRect(0, 0, this.width, this.height);
                } else if (Math.random() < 0.003) {
                    this.lightningFlash = 1.0;
                    window.dispatchEvent(new CustomEvent('lightning'));
                }
            }
        } 
        
        else if (this.weatherMode === 'snow') {
            this.pCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            if (this.snowFlakes.length < 80) {
                this.snowFlakes.push({
                    x: Math.random() * this.width,
                    y: -10,
                    size: Math.random() * 2.5 + 1.0,
                    speed: Math.random() * 0.8 + 0.6,
                    osc: Math.random() * 100,
                    oscSpeed: Math.random() * 0.02 + 0.01
                });
            }
            
            this.snowFlakes.forEach(sf => {
                sf.osc += sf.oscSpeed;
                sf.y += sf.speed;
                sf.x += Math.sin(sf.osc) * 0.6 + this.windSpeed * 0.2;
                
                this.pCtx.beginPath();
                this.pCtx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
                this.pCtx.fill();
                
                if (sf.y > this.height) {
                    sf.y = -10;
                    sf.x = Math.random() * this.width;
                }
            });
        } 
        
        else if (this.weatherMode === 'fog') {
            const fog = this.pCtx.createLinearGradient(0, this.height * 0.35, 0, this.height);
            fog.addColorStop(0, 'rgba(230, 232, 245, 0)');
            fog.addColorStop(0.5, 'rgba(220, 222, 238, 0.15)');
            fog.addColorStop(1, 'rgba(210, 212, 230, 0.45)');
            
            this.pCtx.fillStyle = fog;
            this.pCtx.fillRect(0, this.height * 0.35, this.width, this.height * 0.65);
        }

        // Draw post-rain Rainbow arc
        if (this.rainbowAlpha > 0) {
            this.rainbowAlpha -= 0.0008 * dt;
            if (this.rainbowAlpha < 0) this.rainbowAlpha = 0;
            
            if (this.rainbowAlpha > 0) {
                this.pCtx.save();
                const centerX = this.width * 0.5;
                const centerY = this.height * 1.5;
                const innerRadius = this.height * 0.95;
                const outerRadius = this.height * 1.15;
                
                const grad = this.pCtx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
                grad.addColorStop(0, `rgba(255, 99, 99, ${this.rainbowAlpha * 0.18})`);
                grad.addColorStop(0.18, `rgba(255, 175, 75, ${this.rainbowAlpha * 0.18})`);
                grad.addColorStop(0.36, `rgba(255, 255, 100, ${this.rainbowAlpha * 0.18})`);
                grad.addColorStop(0.54, `rgba(100, 255, 100, ${this.rainbowAlpha * 0.18})`);
                grad.addColorStop(0.72, `rgba(100, 150, 255, ${this.rainbowAlpha * 0.18})`);
                grad.addColorStop(0.9, `rgba(180, 100, 255, ${this.rainbowAlpha * 0.12})`);
                grad.addColorStop(1.0, `rgba(255, 255, 255, 0)`);
                
                this.pCtx.fillStyle = grad;
                this.pCtx.beginPath();
                this.pCtx.arc(centerX, centerY, outerRadius, Math.PI, 2 * Math.PI);
                this.pCtx.arc(centerX, centerY, innerRadius, 2 * Math.PI, Math.PI, true);
                this.pCtx.closePath();
                this.pCtx.fill();
                this.pCtx.restore();
                
                // Spawn rising steam particles from river mist
                if (Math.random() < 0.15 * dt) {
                    const steamX = this.width * 0.35 + Math.random() * (this.width * 0.25);
                    const steamY = this.height * 0.76 + Math.random() * (this.height * 0.15);
                    this.mistParticles.push(new MistParticle(steamX, steamY));
                }
            }
        }
    }
}

// Waterfall Water Particle
class WaterParticle {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.init();
    }
    
    init() {
        this.isFall = Math.random() > 0.3;
        this.isFoam = Math.random() < 0.22;
        
        if (this.isFall) {
            this.x = this.w * 0.285 + Math.random() * (this.w * 0.04);
            this.y = this.h * 0.35 + Math.random() * (this.h * 0.08);
            this.vy = Math.random() * 5 + 4;
            this.vx = (Math.random() - 0.5) * 0.18;
            this.length = Math.random() * 22 + 10;
            this.alpha = Math.random() * 0.45 + 0.15;
        } else {
            this.progress = 0;
            this.curveSpeed = Math.random() * 0.004 + 0.0015;
            this.offsetY = (Math.random() - 0.5) * (this.h * 0.04);
            this.length = Math.random() * 12 + 6;
            this.alpha = Math.random() * 0.35 + 0.05;
            this.updateRiverPosition();
        }
    }
    
    updateRiverPosition() {
        const p0 = { x: this.w * 0.30, y: this.h * 0.72 };
        const p1 = { x: this.w * 0.46, y: this.h * 0.86 };
        const p2 = { x: this.w * 0.62, y: this.h * 1.05 };
        
        const t = this.progress;
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        
        const rise = (window.worldEngine ? window.worldEngine.riverRise : 0);
        this.x = uu * p0.x + 2 * u * t * p1.x + tt * p2.x;
        this.y = uu * p0.y + 2 * u * t * p1.y + tt * p2.y + this.offsetY - rise;
    }
    
    update(w, h, wind, dt = 1) {
        this.w = w;
        this.h = h;
        
        if (this.isFall) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            
            if (this.y > this.h * 0.72) {
                this.isFall = false;
                this.progress = 0;
                this.length = 6;
            }
        } else {
            this.progress += this.curveSpeed * (wind * 0.2 + 0.8) * dt;
            this.updateRiverPosition();
            
            if (this.progress > 1.0) {
                this.init();
            }
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        if (this.isFall) {
            ctx.strokeStyle = `rgba(230, 245, 255, ${this.alpha})`;
            ctx.lineWidth = 1.8;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - this.length);
        } else {
            ctx.strokeStyle = this.isFoam ? `rgba(255, 255, 255, ${this.alpha * 1.25})` : `rgba(165, 218, 255, ${this.alpha})`;
            ctx.lineWidth = this.isFoam ? 1.6 : 1.1;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - (this.length * 1.8), this.y - (this.length * 0.45));
        }
        ctx.stroke();
    }
}

// Splash
class SplashParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -Math.random() * 3.5 - 1.5;
        this.gravity = 0.18;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.8 + 0.2;
    }
    update(dt = 1) {
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha -= 0.025 * dt;
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(240, 248, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Mist
class MistParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 45;
        this.y = y + (Math.random() - 0.5) * 15;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -Math.random() * 0.4 - 0.2;
        this.size = Math.random() * 12 + 8;
        this.alpha = Math.random() * 0.2 + 0.05;
    }
    update(dt = 1) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha -= 0.0022 * dt;
        this.size += 0.06 * dt;
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(240, 245, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Ripple
class Ripple {
    constructor(x, y, size = 10, speed = 1, maxRadius = 45) {
        this.x = x;
        this.y = y;
        this.radius = size;
        this.speed = speed;
        this.maxRadius = maxRadius;
        this.alpha = 1.0;
    }
    update(dt = 1) {
        this.radius += this.speed * dt;
        this.alpha = 1 - (this.radius / this.maxRadius);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(230, 245, 255, ${this.alpha * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Sakura Petal
class Petal {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * this.h;
    }
    
    reset() {
        this.x = Math.random() * this.w * 1.2;
        this.y = -20;
        this.size = Math.random() * 4 + 2.2;
        this.baseVx = - (Math.random() * 1.3 + 0.6);
        this.vy = Math.random() * 0.8 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.06;
        this.osc = Math.random() * 100;
        this.oscSpeed = Math.random() * 0.02 + 0.01;
        this.isFlower = Math.random() < 0.15;
    }
    
    update(w, h, wind, mouseX, dt = 1) {
        this.w = w;
        this.h = h;
        
        this.osc += this.oscSpeed * dt;
        this.x += ((this.baseVx * wind) + Math.sin(this.osc) * 1.2 - (mouseX * 2)) * dt;
        this.y += this.vy * (wind * 0.2 + 0.8) * dt;
        this.angle += this.spin * dt;
        
        if (this.y > this.h + 20 || this.x < -20 || this.x > this.w + 20) {
            this.reset();
        }
    }
    
    draw(ctx, isNight, season) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        let baseColor = isNight ? 'rgba(170, 100, 140, 0.7)' : 'rgba(240, 175, 200, 0.9)';
        if (season === 'AUTUMN') {
            baseColor = isNight ? 'rgba(160, 60, 20, 0.75)' : 'rgba(225, 105, 25, 0.9)';
        } else if (season === 'SUMMER') {
            baseColor = isNight ? 'rgba(40, 120, 60, 0.75)' : 'rgba(85, 190, 75, 0.9)';
        } else if (season === 'WINTER') {
            baseColor = 'rgba(220, 240, 255, 0.85)';
        }
        
        if (this.isFlower && season === 'SPRING') {
            ctx.fillStyle = baseColor;
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 5);
                ctx.beginPath();
                ctx.ellipse(0, this.size * 0.75, this.size * 0.5, this.size * 0.85, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = isNight ? '#eab308' : '#facc15';
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.bezierCurveTo(this.size, -this.size / 2, this.size, this.size / 2, 0, this.size / 2);
            ctx.bezierCurveTo(-this.size, this.size / 2, -this.size, -this.size / 2, 0, -this.size / 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Flocking Bird
class Bird {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.x = Math.random() * this.w;
    }
    
    reset() {
        this.x = -50;
        this.y = Math.random() * (this.h * 0.28) + (this.h * 0.08);
        this.size = Math.random() * 1.8 + 1.2;
        this.speed = Math.random() * 1.1 + 0.6;
        this.flap = Math.random() * Math.PI * 2;
        this.yOffset = Math.random() * 100;
    }
    
    update(w, h, dt = 1) {
        this.w = w;
        this.h = h;
        
        this.x += this.speed * dt;
        this.y += Math.sin(this.x * 0.008 + this.yOffset) * 0.22 * dt;
        this.flap += 0.14 * this.speed * dt;
        
        if (this.x > this.w + 50) {
             this.reset();
        }
    }
    
    draw(ctx, isNight) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = isNight ? 'rgba(12, 12, 25, 0.85)' : 'rgba(38, 42, 48, 0.8)';
        ctx.lineWidth = 1.5;
        
        const wingY = Math.sin(this.flap) * this.size * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.size, -wingY, -this.size * 2, -wingY * 0.5);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.size, -wingY, this.size * 2, -wingY * 0.5);
        ctx.stroke();
        ctx.restore();
    }
}

// Butterfly
class Butterfly {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.x = Math.random() * this.w * 0.6 + this.w * 0.3;
        this.y = Math.random() * this.h * 0.3 + this.h * 0.65;
    }
    
    reset() {
        this.x = Math.random() * this.w;
        this.y = this.h * 0.7 + Math.random() * (this.h * 0.2);
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 1.6 + 1.2;
        this.phase = Math.random() * Math.PI * 2;
        this.color = `hsl(${Math.random() * 30 + 15}, 90%, 75%)`;
    }
    
    update(w, h, mX, mY, dt = 1) {
        this.w = w;
        this.h = h;
        
        this.phase += 0.08 * dt;
        this.x += (this.vx + Math.sin(this.phase) * 0.4) * dt;
        this.y += (this.vy + Math.cos(this.phase) * 0.4) * dt;
        
        const dx = mX - this.x;
        const dy = mY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
            this.vx -= (dx / dist) * 0.15 * dt;
            this.vy -= (dy / dist) * 0.15 * dt;
        } else {
            this.vx += (Math.random() - 0.5) * 0.08 * dt;
            this.vy += (Math.random() - 0.5) * 0.08 * dt;
        }
        
        this.vx = Math.max(Math.min(this.vx, 1.4), -1.4);
        this.vy = Math.max(Math.min(this.vy, 1.4), -1.4);
        
        if (this.x < this.w * 0.1) this.vx += 0.1 * dt;
        if (this.x > this.w * 0.95) this.vx -= 0.1 * dt;
        if (this.y < this.h * 0.6) this.vy += 0.1 * dt;
        if (this.y > this.h * 0.95) this.vy -= 0.1 * dt;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;
        
        const flap = Math.abs(Math.sin(this.phase * 3.5)) * 0.8 + 0.2;
        
        ctx.beginPath();
        ctx.ellipse(-1.5, 0, this.size, this.size * flap, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(1.5, 0, this.size, this.size * flap, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Firefly
class Firefly {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
    }
    
    reset() {
        this.x = this.w * 0.62 + Math.random() * (this.w * 0.32);
        this.y = this.h * 0.56 + Math.random() * (this.h * 0.18);
        this.vx = (Math.random() - 0.5) * 0.22;
        this.vy = (Math.random() - 0.5) * 0.22;
        this.life = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.04 + 0.02;
    }
    
    update(w, h, dt = 1) {
        this.w = w;
        this.h = h;
        
        this.life += this.pulseSpeed * dt;
        this.x += (this.vx + Math.sin(this.life) * 0.15) * dt;
        this.y += (this.vy + Math.cos(this.life) * 0.15) * dt;
        
        if (this.x < this.w * 0.58 || this.x > this.w * 0.98) this.vx *= -1;
        if (this.y < this.h * 0.5 || this.y > this.h * 0.76) this.vy *= -1;
    }
    
    draw(ctx) {
        const glowAlpha = (Math.sin(this.life) + 1) / 2;
        if (glowAlpha < 0.05) return;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 90, ${glowAlpha * 0.85})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(180, 255, 90, 1)';
        ctx.fill();
        ctx.restore();
    }
}

// Koi Fish
class KoiFish {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
    }
    
    reset() {
        this.pctX = 0.42 + Math.random() * 0.14;
        this.pctY = 0.86;
        this.x = this.w * this.pctX;
        this.y = this.h * this.pctY;
        this.startX = this.x;
        this.startY = this.y;
        this.vx = (Math.random() - 0.5) * 1.6;
        this.vy = -Math.random() * 4.5 - 3.5;
        this.gravity = 0.2;
        this.size = Math.random() * 4 + 2.8;
        this.angle = 0;
        this.active = false;
        this.timer = Math.random() * 500 + 400;
    }
    
    update(w, h, onSplash, dt = 1) {
        this.w = w;
        this.h = h;
        
        if (!this.active) {
            this.x = this.w * this.pctX;
            this.y = this.h * this.pctY;
            this.startX = this.x;
            this.startY = this.y;
            this.timer -= dt;
            if (this.timer <= 0) {
                this.active = true;
                onSplash(this.x, this.y);
            }
            return;
        }
        
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle = Math.atan2(this.vy, this.vx);
        
        if (this.vy > 0 && this.y >= this.startY) {
            onSplash(this.x, this.startY);
            this.reset();
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = 'rgba(240, 110, 35, 0.95)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 2.2, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-this.size * 2.2, 0);
        ctx.lineTo(-this.size * 3.0, -this.size * 0.65);
        ctx.lineTo(-this.size * 2.7, 0);
        ctx.lineTo(-this.size * 3.0, this.size * 0.65);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Squirrel
class Squirrel {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
    }
    
    reset() {
        this.x = this.w * 0.13;
        this.y = this.h * 0.76;
        this.targetY = this.y;
        this.state = 'idle';
        this.speed = 1.3;
        this.size = 2.4;
        this.timer = Math.random() * 250 + 100;
    }
    
    update(w, h, dt = 1) {
        this.w = w;
        this.h = h;
        this.x = this.w * 0.13;
        
        if (this.state === 'idle') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = 'climbing';
                this.targetY = this.h * (0.45 + Math.random() * 0.28);
                this.speed = (this.targetY < this.y) ? -1.2 : 1.2;
            }
        } else if (this.state === 'climbing') {
            this.y += this.speed * dt;
            if ((this.speed > 0 && this.y >= this.targetY) || (this.speed < 0 && this.y <= this.targetY)) {
                this.y = this.targetY;
                this.state = 'idle';
                this.timer = Math.random() * 250 + 80;
            }
            if (this.y < this.h * 0.44) { this.y = this.h * 0.44; this.state = 'idle'; }
            if (this.y > this.h * 0.78) { this.y = this.h * 0.78; this.state = 'idle'; }
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = 'rgba(142, 88, 40, 0.85)';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(this.speed > 0 ? -this.size : this.size, -this.size * 0.5, this.size, this.size * 1.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Fox
class Fox {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
    }
    
    reset() {
        this.state = 'hidden';
        this.x = this.w * 0.44;
        this.y = this.h * 0.82;
        this.vx = 0.7;
        this.size = 3.2;
        this.timer = Math.random() * 1000 + 600;
    }
    
    update(w, h, dt = 1) {
        this.w = w;
        this.h = h;
        
        const bridgeCurve = (x) => {
            const startX = this.w * 0.45;
            const endX = this.w * 0.75;
            if (x < startX || x > endX) return this.h * 0.84;
            
            const midX = (startX + endX) / 2;
            const h_offset = midX;
            const k = this.h * 0.762;
            const startY = this.h * 0.84;
            const a = (startY - k) / Math.pow(startX - h_offset, 2);
            return a * Math.pow(x - h_offset, 2) + k;
        };
        
        if (this.state === 'hidden') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = 'walking';
                this.x = this.w * 0.43;
                this.vx = 0.65;
            }
            return;
        }
        
        this.x += this.vx * dt;
        this.y = bridgeCurve(this.x);
        
        if (this.x > this.w * 0.76) {
            this.reset();
        }
    }
    
    draw(ctx) {
        if (this.state === 'hidden') return;
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = 'rgba(230, 95, 25, 0.9)';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 1.8, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.size * 1.5, -this.size * 0.5, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.size * 1.3, -this.size * 0.9);
        ctx.lineTo(this.size * 1.5, -this.size * 1.6);
        ctx.lineTo(this.size * 1.7, -this.size * 0.9);
        ctx.closePath();
        ctx.fill();
        
        ctx.ellipse(-this.size * 2, this.size * 0.3, this.size * 1.2, this.size * 0.6, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-this.size * 2.8, this.size * 0.7, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
    window.worldEngine = new LivingWorldEngine();
});
