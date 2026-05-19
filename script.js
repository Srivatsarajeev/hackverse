/* 
   HACKVERSE 2.0 - SHARED JAVASCRIPT
*/

document.addEventListener('DOMContentLoaded', () => {
    const createSamuraiWelcomeIntro = () => {
        const pageName = window.location.pathname.split('/').pop();
        const isHomePage = pageName === '' || pageName === 'index.html';
        if (!isHomePage) return;
        if (localStorage.getItem('hackverse_intro_complete') === 'true') return;
        if (document.querySelector('.hackverse-intro')) return;

        // Dynamic style injection for custom cursor blinking and button hover states
        const customStyle = document.createElement('style');
        customStyle.innerHTML = `
            @keyframes cursor-blink { 50% { opacity: 0; } }
            .intro-skip-btn:hover {
                background: rgba(255, 0, 60, 0.2) !important;
                border-color: #ff003c !important;
                box-shadow: 0 0 10px rgba(255, 0, 60, 0.5) !important;
            }
        `;
        document.head.appendChild(customStyle);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const intro = document.createElement('section');
        intro.className = 'hackverse-intro hackverse-intro--waiting';
        intro.setAttribute('aria-label', 'Welcome to Hackverse');
        intro.innerHTML = `
            <div class="intro-grid" aria-hidden="true"></div>
            <div class="intro-energy intro-energy-a" aria-hidden="true"></div>
            <div class="intro-energy intro-energy-b" aria-hidden="true"></div>
            <div class="intro-stage">
                <div class="intro-samurai" aria-hidden="true">
                    <div class="samurai-shadow"></div>
                    <div class="samurai-body">
                        <div class="samurai-head">
                            <div class="samurai-helmet"></div>
                            <div class="samurai-mask"></div>
                        </div>
                        <div class="samurai-shoulders"></div>
                        <div class="samurai-chest"></div>
                        <div class="samurai-arm samurai-arm-left"></div>
                        <div class="samurai-arm samurai-arm-right"></div>
                        <div class="samurai-laptop">
                            <div class="laptop-screen">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div class="laptop-base"></div>
                        </div>
                        <div class="samurai-skirt"></div>
                        <div class="samurai-leg samurai-leg-left"></div>
                        <div class="samurai-leg samurai-leg-right"></div>
                        <div class="samurai-katana"></div>
                    </div>
                </div>
                <div class="intro-dialogue" role="status" aria-live="polite">
                    <span class="intro-label">SYSTEM GREETING</span>
                    <strong>Welcome to Hackverse</strong>
                    <small>Code with honor. Build the future.</small>
                </div>
                <div class="intro-cue" aria-hidden="true">Click anywhere to initialize</div>
                <button class="intro-skip-btn" style="position: absolute; bottom: 30px; right: 30px; background: rgba(0,0,0,0.7); border: 1px solid rgba(255,0,60,0.25); color: #fff; padding: 7px 18px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 2px; cursor: pointer; z-index: 100; transition: all 0.2s; outline: none;">SKIP [ESC]</button>
            </div>
        `;

        document.body.classList.add('hackverse-intro-active');
        document.body.prepend(intro);

        let closed = false;
        let closeTimer;
        let introStarted = false;
        let audioContext;
        let flickerInterval;

        const finishIntro = () => {
            if (closed) return;
            closed = true;
            
            window.clearTimeout(closeTimer);
            clearInterval(flickerInterval);
            document.removeEventListener('keydown', handleKeyPress);
            
            // Clean up voice synthesis and AudioContext
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (audioContext) {
                audioContext.close().catch(() => {});
            }

            // Save in localStorage so it plays strictly once
            localStorage.setItem('hackverse_intro_complete', 'true');

            intro.classList.add('hackverse-intro--exit');
            document.body.classList.remove('hackverse-intro-active');
            document.body.classList.add('hackverse-page-live');
            window.setTimeout(() => intro.remove(), 850);
        };

        const handleKeyPress = (event) => {
            if (event.key === 'Escape') {
                finishIntro();
            }
        };

        const triggerRedNeonFlicker = () => {
            const dialogue = intro.querySelector('.intro-dialogue');
            const samurai = intro.querySelector('.intro-samurai');
            
            flickerInterval = setInterval(() => {
                const isGlowing = Math.random() > 0.15;
                if (dialogue) {
                    if (isGlowing) {
                        dialogue.style.textShadow = '0 0 20px #ff003c, 0 0 45px #ff003c';
                        dialogue.style.borderColor = '#ff003c';
                        dialogue.style.opacity = '1';
                    } else {
                        dialogue.style.textShadow = 'none';
                        dialogue.style.borderColor = 'rgba(255, 0, 60, 0.1)';
                        dialogue.style.opacity = '0.38';
                    }
                }
                if (samurai) {
                    samurai.style.filter = isGlowing
                        ? 'drop-shadow(0 0 28px rgba(255, 0, 60, 0.48))'
                        : 'drop-shadow(0 0 8px rgba(255, 0, 60, 0.15))';
                }
            }, 70);
        };

        const playFuturisticIntroSounds = () => {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            audioContext = new AudioCtx();
            const now = audioContext.currentTime;

            // Master Volume 35%
            const masterGain = audioContext.createGain();
            masterGain.gain.setValueAtTime(0.35, now);
            masterGain.connect(audioContext.destination);

            // 1. Deep Atmospheric Reese Drone (Triangle + detuned Sawtooths at 55Hz)
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const filter = audioContext.createBiquadFilter();
            const droneGain = audioContext.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(55, now);
            osc1.detune.setValueAtTime(-9, now);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(55, now);
            osc2.detune.setValueAtTime(9, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(80, now);
            filter.frequency.exponentialRampToValueAtTime(340, now + 1.2);
            filter.frequency.exponentialRampToValueAtTime(100, now + 3.8);
            filter.Q.setValueAtTime(8, now);

            // Smooth fade-in (0.5s) and fade-out (1.2s)
            droneGain.gain.setValueAtTime(0, now);
            droneGain.gain.linearRampToValueAtTime(0.38, now + 0.5);
            droneGain.gain.setValueAtTime(0.38, now + 2.5);
            droneGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(droneGain);
            droneGain.connect(masterGain);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 3.8);
            osc2.stop(now + 3.8);

            // 2. High-Tech Glitch Audio Effects scheduled dynamically
            const glitchTimes = [0.2, 0.8, 1.4, 2.2, 2.9];
            glitchTimes.forEach(t => {
                const startTime = now + t;
                const glitchDuration = Math.random() * 0.14 + 0.05;

                if (Math.random() > 0.45) {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(Math.random() * 1800 + 700, startTime);
                    osc.frequency.exponentialRampToValueAtTime(Math.random() * 100 + 40, startTime + glitchDuration);

                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + glitchDuration);

                    osc.connect(gain);
                    gain.connect(masterGain);
                    osc.start(startTime);
                    osc.stop(startTime + glitchDuration);
                } else {
                    const bufferSize = audioContext.sampleRate * glitchDuration;
                    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }

                    const noise = audioContext.createBufferSource();
                    noise.buffer = buffer;

                    const highpass = audioContext.createBiquadFilter();
                    highpass.type = 'highpass';
                    highpass.frequency.value = 3200;

                    const gain = audioContext.createGain();
                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + glitchDuration);

                    noise.connect(highpass);
                    highpass.connect(gain);
                    gain.connect(masterGain);

                    noise.start(startTime);
                    noise.stop(startTime + glitchDuration);
                }
            });
        };

        const playHackerStyleVoice = () => {
            if (!('speechSynthesis' in window)) return;
            const synth = window.speechSynthesis;
            synth.cancel();

            const utter = new SpeechSynthesisUtterance('Welcome to the Hackverse.');
            
            const selectVoice = () => {
                const voices = synth.getVoices();
                const male = voices.find(v => 
                    v.name.toLowerCase().includes('david') || 
                    v.name.toLowerCase().includes('male') || 
                    v.name.toLowerCase().includes('google us english') ||
                    v.lang.startsWith('en')
                );
                if (male) utter.voice = male;
            };

            selectVoice();
            if (synth.onvoiceschanged !== undefined) {
                synth.onvoiceschanged = selectVoice;
            }

            // High Pitch, Robotic Cyberpunk voice config (Volume around 35%)
            utter.pitch = 1.35;
            utter.rate = 0.82;
            utter.volume = 0.35;
            
            synth.speak(utter);
        };

        const beginIntroTimeline = () => {
            if (introStarted || closed) return;
            introStarted = true;
            
            intro.classList.remove('hackverse-intro--waiting');
            intro.classList.add('hackverse-intro--active');

            // Show updated diagnostic terminal animations inside the dialog box
            const dialogue = intro.querySelector('.intro-dialogue');
            if (dialogue) {
                dialogue.innerHTML = `
                    <span class="intro-label" style="color: #ff003c; font-weight: bold; letter-spacing: 0.35em;">HV_SECURE_CHANNEL</span>
                    <strong style="color: #ff003c; font-size: clamp(2rem, 5vw, 4rem); text-transform: uppercase;">ACCESS GRANTED</strong>
                    <small style="color: #00ffcc; letter-spacing: 0.25em; font-family: 'JetBrains Mono', monospace; font-weight: bold; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        ENTERING HACKVERSE
                        <span style="animation: cursor-blink 0.8s infinite; background: #00ffcc; display: inline-block; width: 8px; height: 15px; margin-left: 2px; vertical-align: middle;"></span>
                    </small>
                `;
            }

            // Sync the red neon flicker
            triggerRedNeonFlicker();

            // Web Audio Synthesis & Speech Synthesis Playback
            playFuturisticIntroSounds();
            playHackerStyleVoice();

            closeTimer = window.setTimeout(finishIntro, reduceMotion ? 1600 : 3800); // under 4s duration
        };

        const startIntroSequence = () => {
            if (introStarted || closed) return;
            beginIntroTimeline();
        };

        // Attach listeners
        intro.addEventListener('pointerdown', (e) => {
            if (e.target.classList.contains('intro-skip-btn')) return;
            startIntroSequence();
        });
        intro.addEventListener('click', (e) => {
            if (e.target.classList.contains('intro-skip-btn')) return;
            startIntroSequence();
        });
        
        const skipBtn = intro.querySelector('.intro-skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                finishIntro();
            });
        }

        document.addEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', startIntroSequence, { once: true });
        window.addEventListener('beforeunload', finishIntro, { once: true });

        // Auto-run if user is already interactive, else wait for gesture
        startIntroSequence();

        intro.addEventListener('animationend', event => {
            if (event.animationName === 'samurai-arrive' && introStarted && !closed) {
                window.clearTimeout(closeTimer);
                closeTimer = window.setTimeout(finishIntro, reduceMotion ? 900 : 2200);
            }
        });
    };

    createSamuraiWelcomeIntro();

    const createKiteSky = () => {
        if (document.querySelector('.kite-sky')) return;

        const kiteSky = document.createElement('div');
        kiteSky.className = 'kite-sky';
        kiteSky.setAttribute('aria-hidden', 'true');

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const kiteCount = isMobile ? 3 : 7;
        const paths = isMobile
            ? [
                ['-22vw', '16vh', '46vw', '7vh', '116vw', '20vh', '16s', '-2s'],
                ['-28vw', '42vh', '44vw', '30vh', '118vw', '46vh', '21s', '-8s'],
                ['-20vw', '72vh', '50vw', '62vh', '120vw', '74vh', '24s', '-14s'],
            ]
            : [
                ['-16vw', '14vh', '36vw', '8vh', '116vw', '20vh', '18s', '-1s'],
                ['-24vw', '30vh', '48vw', '16vh', '120vw', '34vh', '24s', '-7s'],
                ['-18vw', '50vh', '42vw', '42vh', '118vw', '56vh', '21s', '-12s'],
                ['-26vw', '68vh', '56vw', '54vh', '122vw', '70vh', '28s', '-18s'],
                ['-18vw', '82vh', '38vw', '72vh', '116vw', '84vh', '31s', '-23s'],
                ['-30vw', '22vh', '64vw', '34vh', '124vw', '18vh', '27s', '-16s'],
                ['-20vw', '62vh', '68vw', '48vh', '118vw', '38vh', '35s', '-28s'],
            ];

        for (let index = 0; index < kiteCount; index += 1) {
            const kite = document.createElement('div');
            kite.className = 'kite-model';
            const path = paths[index];
            kite.style.setProperty('--kite-start-x', path[0]);
            kite.style.setProperty('--kite-start-y', path[1]);
            kite.style.setProperty('--kite-mid-x', path[2]);
            kite.style.setProperty('--kite-mid-y', path[3]);
            kite.style.setProperty('--kite-end-x', path[4]);
            kite.style.setProperty('--kite-end-y', path[5]);
            kite.style.setProperty('--kite-duration', path[6]);
            kite.style.setProperty('--kite-delay', path[7]);
            if (!isMobile) {
                kite.style.setProperty('--kite-size', `${78 + (index % 3) * 16}px`);
            }

            kite.innerHTML = `
                <div class="kite-model__body">
                    <div class="kite-model__face"></div>
                </div>
                <div class="kite-model__tail">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            kiteSky.appendChild(kite);
        }

        document.body.prepend(kiteSky);
    };

    createKiteSky();

    const enableSmoothPageTransitions = () => {
        document.body.classList.add('page-ready');

        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

            link.addEventListener('click', event => {
                const url = new URL(link.href, window.location.href);
                const isInternal = url.origin === window.location.origin;
                const opensNewContext = link.target && link.target !== '_self';
                const samePageAnchor = url.pathname === window.location.pathname && url.hash;
                if (!isInternal || opensNewContext || samePageAnchor || event.metaKey || event.ctrlKey || event.shiftKey) return;

                event.preventDefault();
                document.body.classList.add('page-leaving');
                window.setTimeout(() => {
                    window.location.href = url.href;
                }, 300);
            });
        });
    };

    enableSmoothPageTransitions();

    const enableScrollReveals = () => {
        const revealTargets = document.querySelectorAll('.container, .card, .grid > *, .page-title, .page-subtitle, footer, .countdown-wrap, .faq-item, section, form');
        revealTargets.forEach(target => target.classList.add('scroll-3d'));

        if (!('IntersectionObserver' in window)) {
            revealTargets.forEach(target => target.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        revealTargets.forEach(target => observer.observe(target));
    };

    enableScrollReveals();

    const enableCardTilt = () => {
        if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('pointermove', event => {
                const rect = card.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
                card.style.setProperty('--tilt-x', `${y.toFixed(2)}deg`);
                card.style.setProperty('--tilt-y', `${x.toFixed(2)}deg`);
            });

            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    };

    enableCardTilt();

    // Mobile Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = 'auto';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Active Link Highlight
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop() || 
            (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Countdown Timer Logic (if on timeline page)
    const countdownEl = document.querySelector('.countdown-wrap');
    if (countdownEl) {
        const targetDate = new Date('May 30, 2026 00:00:00').getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                document.getElementById('days').textContent = days.toString().padStart(2, '0');
                document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
            }
        };

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // FAQ Accordion Logic (if on faq page)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all
            faqItems.forEach(i => i.classList.remove('open'));
            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
});
