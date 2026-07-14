/**
 * ECOSYSTEM CONTROL & INTERACTIVE SCRIPT (script.js)
 * Coordinates custom cursor, preloader sequences, procedural spatial audio synthesis,
 * HUD menu bindings, modal dialogues, navigation compass rotations, and terminal interpreters.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRELOADER SEQUENCE ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.transform = 'translateY(-100vh)';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 850);
        }, 1800);
    }

    // --- 2. CUSTOM CURSOR TRACKING ---
    const cursor = document.getElementById('custom-cursor');
    const cDot = cursor.querySelector('.cursor-dot');
    const cRing = cursor.querySelector('.cursor-ring');
    let mX = 0, mY = 0;
    let cX = 0, cY = 0;
    
    window.addEventListener('mousemove', (e) => {
        mX = e.clientX;
        mY = e.clientY;
        cDot.style.left = `${mX}px`;
        cDot.style.top = `${mY}px`;
    });
    
    function updateCursor() {
        cX += (mX - cX) * 0.07; // Smooth trailing physics
        cY += (mY - cY) * 0.07;
        cRing.style.left = `${cX}px`;
        cRing.style.top = `${cY}px`;
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Helper to shift cursor colors dynamically
    window.setCursorColor = (color, glow = '') => {
        document.documentElement.style.setProperty('--cursor-color', color);
        if (glow) {
            document.documentElement.style.setProperty('--cursor-glow', glow);
        } else {
            // Compute a default soft glow from the hex color
            if (color.startsWith('#')) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                document.documentElement.style.setProperty('--cursor-glow', `rgba(${r}, ${g}, ${b}, 0.08)`);
            } else {
                document.documentElement.style.setProperty('--cursor-glow', 'rgba(255, 255, 255, 0.05)');
            }
        }
    };

    window.resetCursorColor = () => {
        document.documentElement.style.setProperty('--cursor-color', 'var(--primary)');
        document.documentElement.style.setProperty('--cursor-glow', 'rgba(255, 107, 53, 0.05)');
    };

    const interactables = 'a, button, label, input[type="range"], .hotspot-node, .compass-label';
    document.querySelectorAll(interactables).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering-link'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering-link'));
    });

    // --- 3. WEB AUDIO API SYNTHESIZER ---
    let audioCtx = null;
    let masterGain = null;
    let occlusionFilter = null;
    let waterPanner = null;
    let windGainNode = null;
    let waterGainNode = null;
    let rainGainNode = null;
    let insectGainNode = null;
    let isMuted = true;

    const initAudioEngine = () => {
        if (audioCtx) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        
        occlusionFilter = audioCtx.createBiquadFilter();
        occlusionFilter.type = 'lowpass';
        occlusionFilter.frequency.setValueAtTime(20000, audioCtx.currentTime);
        
        masterGain.connect(occlusionFilter);
        occlusionFilter.connect(audioCtx.destination);
        
        windGainNode = createWindGenerator();
        if (windGainNode) windGainNode.connect(masterGain);
        
        waterGainNode = createWaterGenerator();
        if (waterGainNode) {
            waterPanner = audioCtx.createPanner ? audioCtx.createPanner() : null;
            if (waterPanner) {
                waterPanner.panningModel = 'HRTF';
                waterPanner.distanceModel = 'exponential';
                waterPanner.refDistance = 1;
                waterPanner.maxDistance = 100;
                waterPanner.rolloffFactor = 1.5;
                waterPanner.positionX.setValueAtTime(-3.0, audioCtx.currentTime);
                waterPanner.positionY.setValueAtTime(1.5, audioCtx.currentTime);
                waterPanner.positionZ.setValueAtTime(-1.0, audioCtx.currentTime);
                
                waterGainNode.connect(waterPanner);
                waterPanner.connect(masterGain);
            } else {
                waterGainNode.connect(masterGain);
            }
        }
        
        rainGainNode = createRainGenerator();
        if (rainGainNode) rainGainNode.connect(masterGain);
        
        insectGainNode = createInsectGenerator();
        if (insectGainNode) insectGainNode.connect(masterGain);
        
        syncAudioLevels();
    };

    const createNoiseBuffer = () => {
        const size = 3 * audioCtx.sampleRate;
        const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < size; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const createWindGenerator = () => {
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        noise.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioCtx.currentTime);
        filter.Q.setValueAtTime(2.5, audioCtx.currentTime);
        
        const lfo = audioCtx.createOscillator();
        lfo.frequency.setValueAtTime(0.06, audioCtx.currentTime);
        
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(220, audioCtx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
        
        noise.connect(filter);
        filter.connect(gainNode);
        
        noise.start(0);
        lfo.start(0);
        return gainNode;
    };

    const createWaterGenerator = () => {
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        noise.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(280, audioCtx.currentTime);
        filter.Q.setValueAtTime(1.5, audioCtx.currentTime);
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        
        noise.connect(filter);
        filter.connect(gainNode);
        
        noise.start(0);
        return gainNode;
    };

    const createRainGenerator = () => {
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        noise.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1500, audioCtx.currentTime);
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        
        noise.connect(filter);
        filter.connect(gainNode);
        
        noise.start(0);
        return gainNode;
    };

    const createInsectGenerator = () => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(5800, audioCtx.currentTime);
        
        const mod = audioCtx.createOscillator();
        mod.frequency.setValueAtTime(7.5, audioCtx.currentTime);
        
        const modGain = audioCtx.createGain();
        modGain.gain.setValueAtTime(12, audioCtx.currentTime);
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(gainNode);
        
        osc.start(0);
        mod.start(0);
        return gainNode;
    };

    const triggerThunder = () => {
        if (!audioCtx || isMuted) return;
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = createNoiseBuffer();
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(70, audioCtx.currentTime);
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.85, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 3.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        noise.start(0);
        noise.stop(audioCtx.currentTime + 3.5);
    };

    window.addEventListener('lightning', () => {
        triggerThunder();
    });

    const syncAudioLevels = () => {
        if (!audioCtx) return;
        
        const now = audioCtx.currentTime;
        const engine = window.worldEngine;
        if (!engine) return;
        
        if (rainGainNode) {
            rainGainNode.gain.setValueAtTime(rainGainNode.gain.value, now);
            if (engine.weatherMode === 'rain') {
                rainGainNode.gain.linearRampToValueAtTime(0.15, now + 1.5);
            } else if (engine.weatherMode === 'storm') {
                rainGainNode.gain.linearRampToValueAtTime(0.28, now + 1.0);
            } else {
                rainGainNode.gain.linearRampToValueAtTime(0, now + 2.0);
            }
        }
        
        if (insectGainNode) {
            const vol = engine.isNight ? 0.018 : 0;
            insectGainNode.gain.setValueAtTime(insectGainNode.gain.value, now);
            insectGainNode.gain.linearRampToValueAtTime(vol, now + 2.0);
        }
    };

    const muteToggle = document.getElementById('mute-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    
    if (muteToggle) {
        muteToggle.addEventListener('click', () => {
            initAudioEngine();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            isMuted = !isMuted;
            if (isMuted) {
                muteToggle.innerText = '🔇';
                masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
                masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
            } else {
                muteToggle.innerText = '🔊';
                const v = volumeSlider ? parseFloat(volumeSlider.value) : 0.5;
                masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
                masterGain.gain.linearRampToValueAtTime(v * 0.45, audioCtx.currentTime + 0.3);
            }
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            initAudioEngine();
            const v = parseFloat(e.target.value);
            if (!isMuted && masterGain) {
                masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
                masterGain.gain.linearRampToValueAtTime(v * 0.45, audioCtx.currentTime + 0.15);
            }
        });
    }

    // --- 4. WEATHER & TIME HUD INTERACTION ---
    const weatherButtons = document.querySelectorAll('#weather-widget button');
    const timeSlider = document.getElementById('time-slider');

    weatherButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            weatherButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const mode = btn.getAttribute('data-weather');
            if (window.worldEngine) {
                window.worldEngine.setWeather(mode);
                syncAudioLevels();
            }
            
            initAudioEngine();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        });
    });

    if (timeSlider) {
        timeSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (window.worldEngine) {
                window.worldEngine.setTimeOfDay(val);
                
                const hour = Math.floor(val * 24);
                const min = Math.floor((val * 24 % 1) * 60);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hDisplay = hour % 12 || 12;
                const mDisplay = min < 10 ? '0' + min : min;
                
                document.getElementById('time-display').innerText = `${hDisplay}:${mDisplay} ${ampm} MAN`;
                syncAudioLevels();
            }
            
            initAudioEngine();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        });
    }

    function syncRealTime() {
        if (timeSlider && window.worldEngine) {
            const isManual = document.activeElement === timeSlider;
            if (!isManual) {
                const now = new Date();
                const totalMinutes = now.getHours() * 60 + now.getMinutes();
                const ratio = totalMinutes / 1440;
                
                window.worldEngine.setTimeOfDay(ratio);
                timeSlider.value = ratio.toFixed(2);
                
                const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
                const h = now.getHours() % 12 || 12;
                const m = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
                document.getElementById('time-display').innerText = `${h}:${m} ${ampm} LOC`;
                syncAudioLevels();
            }
        }
    }
    
    setTimeout(() => {
        syncRealTime();
        setInterval(syncRealTime, 20000);
    }, 1000);

    // --- 5. PORTFOLIO GLASSMORPHISM MODALS SYSTEM ---
    const modals = document.querySelectorAll('.glass-modal');
    const hotspotNodes = document.querySelectorAll('.hotspot-node');
    const compassLabels = document.querySelectorAll('.compass-label');
    const pointer = document.querySelector('.compass-pointer');
    
    const openModal = (modalId) => {
        const target = document.getElementById(modalId);
        if (!target) return;
        
        closeAllModals();
        
        target.classList.add('open');
        document.body.classList.add('modal-open');
        
        let rot = 0;
        if (modalId === 'modal-greenhouse') rot = 0;
        else if (modalId === 'modal-projects') rot = 90;
        else if (modalId === 'modal-about') rot = 180;
        else if (modalId === 'modal-skills') rot = 270;
        else if (modalId === 'modal-shrine') rot = 45;
        
        if (pointer) pointer.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
        
        if (audioCtx && occlusionFilter) {
            occlusionFilter.frequency.setValueAtTime(occlusionFilter.frequency.value, audioCtx.currentTime);
            occlusionFilter.frequency.linearRampToValueAtTime(700, audioCtx.currentTime + 0.4);
        }
    };
    
    const closeAllModals = () => {
        modals.forEach(m => m.classList.remove('open'));
        document.body.classList.remove('modal-open');
        
        if (audioCtx && occlusionFilter) {
            occlusionFilter.frequency.setValueAtTime(occlusionFilter.frequency.value, audioCtx.currentTime);
            occlusionFilter.frequency.linearRampToValueAtTime(20000, audioCtx.currentTime + 0.4);
        }
    };
    
    hotspotNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            const modalId = node.getAttribute('data-modal');
            openModal(modalId);
            e.stopPropagation();
        });
    });
    
    compassLabels.forEach(label => {
        label.addEventListener('click', (e) => {
            const modalId = label.getAttribute('data-modal');
            openModal(modalId);
            e.stopPropagation();
        });
    });
    
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeAllModals();
            e.stopPropagation();
        });
    });
    
    modals.forEach(m => {
        m.addEventListener('click', (e) => {
            if (e.target === m) closeAllModals();
        });
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // --- 6. OPERATOR CONSOLE INTERACTIVE TERMINAL ---
    const termTrigger = document.getElementById('terminal-trigger-btn');
    const termModal = document.getElementById('terminal-modal');
    const termClose = termModal.querySelector('.terminal-close-btn');
    const termInput = document.getElementById('terminal-input');
    const termHistory = termModal.querySelector('.terminal-history');

    const terminalCommands = {
        help: 'COMMAND LIST:\n  about     Reveal Sreeshanth Reddy\'s systems design philosophy\n  skills    Technical capabilities, program language stacks\n  projects  Details on VERI, Project S, Solomon X, CDC\n  commit    Override simulated GitHub commit productivity [number]\n  contact   Developer email & coordinate vectors\n  season    Override seasonal settings [winter/spring/summer/autumn]\n  weather   Override weather parameters [clear/rain/snow/fog/storm]\n  time      Shift world lighting dial [morning/noon/sunset/night]\n  wind      Override ecosystem wind force [low/medium/high]\n  spirit    Summon spirit narrator core mascot\n  clear     Purge history buffer',
        about: 'OPERATOR IDENTITY:\nSreeshanth Reddy Namireddy — AI Systems & Infrastructure Builder.\nExplores operating systems, vector memory caches, model runtimes, and local hardware pipelines from first principles.',
        skills: 'CAPABILITIES NODE:\n- Languages: Python, TypeScript, C, C++, SQL. (Learning Go & Rust)\n- Architectures: Distributed agents, Vector embeds, Redis pipelines, WebSockets, Model Context Protocol (MCP).\n- Runtimes: Docker containers, PyTorch tensors, vLLM local scheduling.',
        projects: 'FEATURED PEAKS:\n- [VERI] AI runtime governance with LangGraph risk assessments.\n- [Project S] Multimodal adaptive memory workspace with WebSockets & Redis.\n- [Solomon X] Conversation file workstation utilizing MCP bindings.\n- [CDC] Voice edge assistant running local hardware LLM triggers.',
        contact: 'COORDINATES:\n- Email: sreeshanth.namireddy@outlook.com\n- GitHub: github.com/sreeshanth-reddy\n- Focus: Seeking GSoC Mentorship & Hard Infrastructure Challenges.',
        spirit: 'MASCOT INVOCATION:\n  (•‿•) ELYSIUM SPIRIT CORE v1.0\n  "I glide upon the canvas and track your coordinates. Type commands or hover over the valley nodes to trigger secret lore."'
    };

    if (termTrigger) {
        termTrigger.addEventListener('click', (e) => {
            termModal.classList.add('open');
            document.body.classList.add('modal-open');
            setTimeout(() => termInput.focus(), 150);
            e.stopPropagation();
        });
    }

    if (termClose) {
        termClose.addEventListener('click', (e) => {
            termModal.classList.remove('open');
            document.body.classList.remove('modal-open');
            e.stopPropagation();
        });
    }

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdLine = termInput.value.trim();
                termInput.value = '';
                
                if (cmdLine === '') return;
                
                const promptDiv = document.createElement('div');
                promptDiv.innerHTML = `<span class="text-[#4ade80]">&gt;</span> ${cmdLine}`;
                termHistory.appendChild(promptDiv);
                
                const parts = cmdLine.split(' ');
                const cmd = parts[0].toLowerCase();
                const val = parts[1] ? parts[1].toLowerCase() : '';
                
                if (cmd === 'clear') {
                    termHistory.innerHTML = '';
                    return;
                }
                
                let response = '';
                if (cmd === 'commit') {
                    const count = parseInt(val);
                    if (!isNaN(count) && count >= 0) {
                        if (window.worldEngine) {
                            window.worldEngine.setCommitCount(count);
                            showNarrativeMsg(`Ecosystem updated with GitHub Commits: ${count}`);
                            setTimeout(hideNarrative, 3500);
                        }
                        response = `Ecosystem commit count updated to ${count}. Trees resized, birds flocking scaled.`;
                    } else {
                        response = 'Usage: commit [number]';
                    }
                } else if (cmd === 'season') {
                    if (['winter', 'spring', 'summer', 'autumn'].includes(val)) {
                        if (window.worldEngine) {
                            const prevSeason = window.worldEngine.season.toLowerCase();
                            window.worldEngine.season = val.toUpperCase();
                            const worldEl = document.getElementById('world');
                            if (worldEl) {
                                worldEl.classList.remove(`season-${prevSeason}`);
                                worldEl.classList.add(`season-${val}`);
                            }
                            showNarrativeMsg(`Season overridden to: ${val.toUpperCase()}`);
                            setTimeout(hideNarrative, 3500);
                        }
                        response = `Season successfully set to ${val.toUpperCase()}.`;
                    } else {
                        response = 'Usage: season [winter/spring/summer/autumn]';
                    }
                } else if (cmd === 'weather') {
                    if (['clear', 'rain', 'snow', 'fog', 'storm'].includes(val)) {
                        if (window.worldEngine) {
                            window.worldEngine.setWeather(val);
                            document.querySelectorAll('#weather-widget button').forEach(b => {
                                if (b.getAttribute('data-weather') === val) b.classList.add('active');
                                else b.classList.remove('active');
                            });
                            syncAudioLevels();
                            showNarrativeMsg(`Weather shifted to: ${val.toUpperCase()}`);
                            setTimeout(hideNarrative, 3500);
                        }
                        response = `Weather successfully transitioned to ${val.toUpperCase()}.`;
                    } else {
                        response = 'Usage: weather [clear/rain/snow/fog/storm]';
                    }
                } else if (cmd === 'time') {
                    let ratio = -1;
                    if (val === 'morning') ratio = 0.28;
                    else if (val === 'noon') ratio = 0.5;
                    else if (val === 'sunset') ratio = 0.75;
                    else if (val === 'night') ratio = 0.95;
                    
                    if (ratio >= 0) {
                        if (window.worldEngine) {
                            window.worldEngine.setTimeOfDay(ratio);
                            const tSlider = document.getElementById('time-slider');
                            if (tSlider) tSlider.value = ratio;
                            
                            const hour = Math.floor(ratio * 24);
                            const min = Math.floor((ratio * 24 % 1) * 60);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const hDisplay = hour % 12 || 12;
                            const mDisplay = min < 10 ? '0' + min : min;
                            document.getElementById('time-display').innerText = `${hDisplay}:${mDisplay} ${ampm} MAN`;
                            syncAudioLevels();
                            showNarrativeMsg(`Lighting dial shifted to: ${val.toUpperCase()}`);
                            setTimeout(hideNarrative, 3500);
                        }
                        response = `Lighting dial set to ${val.toUpperCase()}.`;
                    } else {
                        response = 'Usage: time [morning/noon/sunset/night]';
                    }
                } else if (cmd === 'wind') {
                    let speed = -1;
                    if (val === 'low') speed = 0.3;
                    else if (val === 'medium') speed = 1.0;
                    else if (val === 'high') speed = 2.5;
                    
                    if (speed >= 0) {
                        if (window.worldEngine) {
                            window.worldEngine.windSpeed = speed;
                            window.worldEngine.targetWindSpeed = speed;
                            
                            // Adjust CSS variables for tree sways
                            const rootStyles = document.documentElement.style;
                            if (val === 'low') {
                                rootStyles.setProperty('--sway-duration-left', '22s');
                                rootStyles.setProperty('--sway-duration-right', '18s');
                                rootStyles.setProperty('--sway-angle-left', '0.3deg');
                                rootStyles.setProperty('--sway-angle-right', '-0.4deg');
                            } else if (val === 'medium') {
                                rootStyles.setProperty('--sway-duration-left', '14s');
                                rootStyles.setProperty('--sway-duration-right', '11s');
                                rootStyles.setProperty('--sway-angle-left', '0.6deg');
                                rootStyles.setProperty('--sway-angle-right', '-0.8deg');
                            } else if (val === 'high') {
                                rootStyles.setProperty('--sway-duration-left', '7s');
                                rootStyles.setProperty('--sway-duration-right', '5.5s');
                                rootStyles.setProperty('--sway-angle-left', '1.4deg');
                                rootStyles.setProperty('--sway-angle-right', '-1.8deg');
                            }
                            
                            showNarrativeMsg(`Wind force overridden to: ${val.toUpperCase()}`);
                            setTimeout(hideNarrative, 3500);
                        }
                        response = `Wind force successfully set to ${val.toUpperCase()} (${speed}x).`;
                    } else {
                        response = 'Usage: wind [low/medium/high]';
                    }
                } else {
                    response = terminalCommands[cmd] || `Command not recognized: '${cmd}'. Type 'help' for options.`;
                }
                
                const responseDiv = document.createElement('div');
                responseDiv.className = 'text-white/80 whitespace-pre-line border-l border-white/10 pl-2 ml-1 my-1';
                termHistory.appendChild(responseDiv);
                
                typewriter(responseDiv, response);
                
                setTimeout(() => {
                    termHistory.scrollTop = termHistory.scrollHeight;
                }, 50);
            }
        });
    }

    function typewriter(element, text) {
        let i = 0;
        element.innerHTML = '';
        function val() {
            if (i < text.length) {
                const char = text.charAt(i);
                element.innerHTML += char === '\n' ? '<br>' : char;
                i++;
                setTimeout(val, 6);
                termHistory.scrollTop = termHistory.scrollHeight;
            }
        }
        val();
    }

    // --- 7. FLOATING SPIRIT NARRATOR & PHOTO POSTCARD ENGINE ---
    const narratorMessages = {
        'modal-about': "The bridge represents Sreeshanth's transition from core software systems to cognitive intelligence pipelines.",
        'modal-skills': "A cascade of technical competencies: Python, PyTorch, LangGraph, vector caches, and low-latency servers.",
        'modal-projects': "Four core systems architectures reside in the valley: VERI, Project S, Solomon X, and Cognitive Desk Companion.",
        'modal-greenhouse': "Vision Summit: Incubating concepts on decentralized agent runtimes and containerized sandboxes.",
        'modal-contact': "Cosmic Shrine: Establish coordinates via email or download Sreeshanth's professional chronology."
    };

    const narratorBox = document.getElementById('narrator-box');
    const narratorText = document.getElementById('narrator-text');
    let narratorTimeout = null;

    const showNarrative = (key) => {
        const msg = narratorMessages[key];
        if (!msg || !narratorBox || !narratorText) return;
        
        clearTimeout(narratorTimeout);
        narratorBox.classList.remove('hidden');
        
        let idx = 0;
        narratorText.innerHTML = '';
        const type = () => {
            if (idx < msg.length) {
                narratorText.innerHTML += msg.charAt(idx);
                idx++;
                narratorTimeout = setTimeout(type, 12);
            }
        };
        type();
    };

    const showNarrativeMsg = (msg) => {
        if (!narratorBox || !narratorText) return;
        clearTimeout(narratorTimeout);
        narratorBox.classList.remove('hidden');
        narratorText.innerText = msg;
    };

    const hideNarrative = () => {
        clearTimeout(narratorTimeout);
        if (narratorBox) narratorBox.classList.add('hidden');
    };

    const cursorColors = {
        'modal-about': '#ff6b35',      // Amber/Orange
        'modal-skills': '#78dcca',     // Glacial Stream (Teal)
        'modal-projects': '#4ade80',   // Forest Leaf (Green)
        'modal-greenhouse': '#f8d66d', // Volumetric Sun (Yellow)
        'modal-contact': '#b9a7ff',    // Cosmic Shrine (Violet)
        'modal-shrine': '#fbbf24'      // Ancient Gold
    };

    document.querySelectorAll('.hotspot-node').forEach(node => {
        const modalId = node.getAttribute('data-modal');
        node.addEventListener('mouseenter', () => {
            showNarrative(modalId);
            if (window.setCursorColor && cursorColors[modalId]) {
                window.setCursorColor(cursorColors[modalId]);
            }
        });
        node.addEventListener('mouseleave', () => {
            hideNarrative();
            if (window.resetCursorColor) window.resetCursorColor();
        });
    });

    document.querySelectorAll('.compass-label').forEach(label => {
        const modalId = label.getAttribute('data-modal');
        label.addEventListener('mouseenter', () => {
            showNarrative(modalId);
            if (window.setCursorColor && cursorColors[modalId]) {
                window.setCursorColor(cursorColors[modalId]);
            }
        });
        label.addEventListener('mouseleave', () => {
            hideNarrative();
            if (window.resetCursorColor) window.resetCursorColor();
        });
    });

    // Capture snapshot postcard
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const wEngine = window.worldEngine;
            if (!wEngine) return;
            
            showNarrativeMsg("Processing postcard exposure... Please wait.");
            
            let bgUrl = '';
            const bgStyle = wEngine.baseImage.style.backgroundImage;
            if (bgStyle) {
                const match = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match) bgUrl = match[1];
            }
            if (!bgUrl) bgUrl = 'assets/nature_valley.png';
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const offCanvas = document.createElement('canvas');
                offCanvas.width = wEngine.width * wEngine.dpr;
                offCanvas.height = wEngine.height * wEngine.dpr;
                const oCtx = offCanvas.getContext('2d');
                
                // Draw background, water, and physics layers
                oCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
                oCtx.drawImage(wEngine.waterCanvas, 0, 0, offCanvas.width, offCanvas.height);
                oCtx.drawImage(wEngine.physicsCanvas, 0, 0, offCanvas.width, offCanvas.height);
                
                // Draw typographic signature seal
                const scale = wEngine.dpr;
                oCtx.fillStyle = 'rgba(10, 10, 15, 0.75)';
                oCtx.beginPath();
                if (typeof oCtx.roundRect === 'function') {
                    oCtx.roundRect(20 * scale, offCanvas.height - 70 * scale, 330 * scale, 50 * scale, 6 * scale);
                } else {
                    oCtx.rect(20 * scale, offCanvas.height - 70 * scale, 330 * scale, 50 * scale);
                }
                oCtx.fill();
                
                oCtx.fillStyle = '#ff6b35';
                oCtx.font = `bold ${Math.round(11 * scale)}px Courier New`;
                oCtx.fillText("SREESHANTH REDDY NAMIREDDY | LIVING ECOSYSTEM", 32 * scale, offCanvas.height - 48 * scale);
                
                oCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                oCtx.font = `${Math.round(9 * scale)}px Courier New`;
                oCtx.fillText("Captured live at " + new Date().toLocaleString(), 32 * scale, offCanvas.height - 35 * scale);
                
                try {
                    const dataUrl = offCanvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `Sreeshanth_Ecosystem_Snapshot.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    showNarrativeMsg("Postcard captured successfully! Check downloads.");
                } catch (err) {
                    showNarrativeMsg("CORS Exception: Use 'Load Art' locally to save postcards.");
                }
                setTimeout(hideNarrative, 3000);
            };
            img.onerror = () => {
                showNarrativeMsg("Error: Failed to resolve the background artwork asset.");
                setTimeout(hideNarrative, 3000);
            };
            img.src = bgUrl;
        });
    }

    // --- 8. CLIMATE TELEMETRY HUD BINDINGS ---
    window.addEventListener('climateupdate', (e) => {
        const baroTemp = document.getElementById('baro-temp');
        const baroHumid = document.getElementById('baro-humid');
        const baroPress = document.getElementById('baro-press');
        const baroSeason = document.getElementById('baro-season');
        
        if (baroTemp) baroTemp.innerText = `${e.detail.temp}°C`;
        if (baroHumid) baroHumid.innerText = `${e.detail.humid}%`;
        if (baroPress) baroPress.innerText = `${e.detail.press}hPa`;
        if (baroSeason) {
            baroSeason.innerText = e.detail.season;
            if (e.detail.season === 'WINTER') {
                baroSeason.className = 'text-cyan-200';
            } else if (e.detail.season === 'SPRING') {
                baroSeason.className = 'text-pink-300';
            } else if (e.detail.season === 'SUMMER') {
                baroSeason.className = 'text-green-300';
            } else {
                baroSeason.className = 'text-amber-500';
            }
        }
    });

    // --- 9. VISIT MEMORY & ACHIEVEMENT ENGINE ---
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
    localStorage.setItem('visitCount', visitCount);

    const shrineHotspot = document.getElementById('hotspot-shrine');
    
    // Register shrine hover in narratorMessages
    narratorMessages['modal-shrine'] = "Ancient Shrine: A hidden sanctuary unlocked by recurring explorers of Sreeshanth's mind ecosystem.";

    if (visitCount >= 3) {
        if (shrineHotspot) {
            shrineHotspot.classList.remove('hidden');
            shrineHotspot.addEventListener('click', (e) => {
                openModal('modal-shrine');
                e.stopPropagation();
            });
            shrineHotspot.addEventListener('mouseenter', () => showNarrative('modal-shrine'));
            shrineHotspot.addEventListener('mouseleave', hideNarrative);
        }
        setTimeout(() => {
            showNarrativeMsg(`Welcome back Explorer! Visit #${visitCount}. The Secret Ancient Shrine has unlocked at the summit.`);
            setTimeout(hideNarrative, 6000);
        }, 3000);
    } else {
        setTimeout(() => {
            showNarrativeMsg(`Welcome to Elysium! Visit #${visitCount}. Return 3 times to unlock hidden valley coordinates.`);
            setTimeout(hideNarrative, 6000);
        }, 3000);
    }

    // --- 10. SPATIAL LISTENER & CINEMATIC PHOTO MODE CONTROLS ---
    window.addEventListener('mousemove', (e) => {
        if (!audioCtx || isMuted) return;
        const now = audioCtx.currentTime;
        const xVal = (e.clientX / window.innerWidth - 0.5) * 10;
        const yVal = -(e.clientY / window.innerHeight - 0.5) * 10;
        
        if (audioCtx.listener) {
            if (audioCtx.listener.positionX) {
                audioCtx.listener.positionX.setValueAtTime(xVal, now);
                audioCtx.listener.positionY.setValueAtTime(yVal, now);
                audioCtx.listener.positionZ.setValueAtTime(4.5, now);
            } else {
                audioCtx.listener.setPosition(xVal, yVal, 4.5);
            }
        }
    });

    // Custom Key Listeners for Dev Mode (F3) and Photo Mode (P)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
            const pPanel = document.getElementById('photo-panel');
            if (pPanel) pPanel.classList.add('hidden');
        }
        if (e.key === 'F3') {
            e.preventDefault();
            const devOverlay = document.getElementById('dev-overlay');
            if (devOverlay) devOverlay.classList.toggle('hidden');
        }
        if ((e.key === 'p' || e.key === 'P') && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            const pPanel = document.getElementById('photo-panel');
            if (pPanel) pPanel.classList.toggle('hidden');
        }
    });

    // Bind Photo Panel Sliders to WebGL Uniforms
    const photoDof = document.getElementById('photo-dof');
    if (photoDof) {
        photoDof.addEventListener('input', (e) => {
            if (window.worldEngine && window.worldEngine.postMaterial) {
                window.worldEngine.postMaterial.uniforms.uFogDensity.value = parseFloat(e.target.value) / 100;
            }
        });
    }

    const photoExposure = document.getElementById('photo-exposure');
    if (photoExposure) {
        photoExposure.addEventListener('input', (e) => {
            if (window.worldEngine && window.worldEngine.postMaterial) {
                window.worldEngine.postMaterial.uniforms.uExposure.value = parseFloat(e.target.value) / 15;
            }
        });
    }

    const photoCaptureBtn = document.getElementById('photo-capture-btn');
    if (photoCaptureBtn) {
        photoCaptureBtn.addEventListener('click', () => {
            const captureBtn = document.getElementById('capture-postcard-btn');
            if (captureBtn) captureBtn.click();
        });
    }

    const photoCloseBtn = document.getElementById('photo-close-btn');
    if (photoCloseBtn) {
        photoCloseBtn.addEventListener('click', () => {
            const pPanel = document.getElementById('photo-panel');
            if (pPanel) pPanel.classList.add('hidden');
        });
    }
});
