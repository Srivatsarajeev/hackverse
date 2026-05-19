import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroApp() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [terminalLogs, setTerminalLogs] = useState([])
  const [flickerState, setFlickerState] = useState(true)
  
  const audioCtxRef = useRef(null)
  const duration = 3.6 // Total intro duration in seconds after click

  useEffect(() => {
    // Check if intro has already run
    const hasCompleted = localStorage.getItem('hackverse_intro_complete')
    if (hasCompleted === 'true') {
      setIsCompleted(true)
      document.body.classList.remove('hackverse-intro-active')
      document.body.classList.add('hackverse-page-live')
    } else {
      document.body.classList.add('hackverse-intro-active')
      
      // Auto-add decorative terminal boot lines
      const logLines = [
        'HV_SECURE_CHANNEL: INITIALIZING...',
        'BYPASSING SECURITY FIREWALL... OK',
        'SAMURAI_CORE_LOADED: SUCCESS',
        'ESTABLISHING NEURAL HANDSHAKE...',
        'READY TO DECRYPT...'
      ]
      
      logLines.forEach((line, index) => {
        setTimeout(() => {
          setTerminalLogs(prev => [...prev, line])
        }, index * 250)
      })
    }

    return () => {
      document.body.classList.remove('hackverse-intro-active')
    }
  }, [])

  // Listen for Escape key to skip intro
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isStarted) {
        handleSkip()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isStarted])

  // Rapid neon flicker trigger
  useEffect(() => {
    if (!isStarted) return
    const interval = setInterval(() => {
      setFlickerState(Math.random() > 0.15)
    }, 70)
    return () => clearInterval(interval)
  }, [isStarted])

  const handleStart = async () => {
    setIsStarted(true)
    
    // Initialize Web Audio API Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      const ctx = new AudioContextClass()
      audioCtxRef.current = ctx
      
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.35, ctx.currentTime) // Master volume 35%
      masterGain.connect(ctx.destination)
      
      // 1. Synthesize Deep Futuristic Atmosphere Drone
      playAtmosphericDrone(ctx, masterGain)
      
      // 2. Synthesize Background Glitches
      scheduleCyberGlitches(ctx, masterGain)
    }

    // 3. Futuristic Robotic Voice Intro via SpeechSynthesis
    playRoboticVoice()

    // 4. Timer to complete intro after duration
    setTimeout(() => {
      handleComplete()
    }, duration * 1000)
  }

  const playAtmosphericDrone = (ctx, destination) => {
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    // Fat detuned low Reese synth
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(55, ctx.currentTime) // Low A1
    osc1.detune.setValueAtTime(-9, ctx.currentTime)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(55, ctx.currentTime)
    osc2.detune.setValueAtTime(9, ctx.currentTime)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(70, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.2)
    filter.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + duration)
    filter.Q.setValueAtTime(8, ctx.currentTime)

    // Smooth fade in (0.4s) and fade out (1.2s)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.4)
    gain.gain.setValueAtTime(0.35, ctx.currentTime + duration - 1.2)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(destination)

    osc1.start(ctx.currentTime)
    osc2.start(ctx.currentTime)
    
    osc1.stop(ctx.currentTime + duration)
    osc2.stop(ctx.currentTime + duration)
  }

  const scheduleCyberGlitches = (ctx, destination) => {
    const glitchTimes = [0.2, 0.7, 1.3, 2.1, 2.8]
    
    glitchTimes.forEach(t => {
      const startTime = ctx.currentTime + t
      const glitchDuration = Math.random() * 0.15 + 0.05
      
      // Randomly trigger either a squealing filter sweep or high-frequency digital noise
      if (Math.random() > 0.4) {
        // High frequency digital tone sweep
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(Math.random() * 2000 + 800, startTime)
        osc.frequency.exponentialRampToValueAtTime(Math.random() * 100 + 40, startTime + glitchDuration)
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + glitchDuration)
        
        osc.connect(gain)
        gain.connect(destination)
        osc.start(startTime)
        osc.stop(startTime + glitchDuration)
      } else {
        // Short high-frequency white noise static
        const bufferSize = ctx.sampleRate * glitchDuration
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1
        }
        
        const source = ctx.createBufferSource()
        source.buffer = buffer
        
        const filter = ctx.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 3500
        
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + glitchDuration)
        
        source.connect(filter)
        filter.connect(gain)
        gain.connect(destination)
        
        source.start(startTime)
        source.stop(startTime + glitchDuration)
      }
    })
  }

  const playRoboticVoice = () => {
    if (!('speechSynthesis' in window)) return

    const synth = window.speechSynthesis
    synth.cancel() // Stop any running speech

    const utter = new SpeechSynthesisUtterance('Welcome to the Hackverse.')
    
    // Choose voice: Prioritize high-quality male or futuristic/robotic voices
    const selectVoice = () => {
      const voices = synth.getVoices()
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('google us english') ||
        v.lang.startsWith('en')
      )
      if (maleVoice) {
        utter.voice = maleVoice
      }
    }

    selectVoice()
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = selectVoice
    }

    // Configured for cinematic, robot cyberpunk vibe
    utter.pitch = 1.35   // Slightly high pitch
    utter.rate = 0.82    // Slower, cinematic computer pacing
    utter.volume = 0.35  // Play around 35% volume
    
    synth.speak(utter)
  }

  const handleComplete = () => {
    localStorage.setItem('hackverse_intro_complete', 'true')
    setIsCompleted(true)
    document.body.classList.remove('hackverse-intro-active')
    document.body.classList.add('hackverse-page-live')
  }

  const handleSkip = () => {
    // Cancel voice and audio immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
    }
    handleComplete()
  }

  if (isCompleted) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          scale: 1.06, 
          filter: 'blur(12px)',
          transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } 
        }}
        className="fixed inset-0 z-[99999] bg-[#04000a] text-white flex flex-col justify-center items-center select-none overflow-hidden"
      >
        {/* Cyberpunk Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-70" />
        
        {/* Neon Cyber Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,0,60,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,0,60,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
        
        {/* Matrix digital scanner line */}
        <motion.div 
          animate={{ 
            top: ['0%', '100%', '0%'] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff003c] to-transparent shadow-[0_0_12px_#ff003c] pointer-events-none z-10 opacity-40"
        />

        <AnimatePresence mode="wait">
          {!isStarted ? (
            /* ================= PORTAL BOOT / DECRYPTOR SCREEN ================= */
            <motion.div
              key="boot-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative z-20 flex flex-col items-center max-w-lg w-[90vw] p-8 bg-black/80 border border-[#ff003c]/30 shadow-[0_0_40px_rgba(255,0,60,0.15)] rounded-none"
            >
              {/* Corner Cyber Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff003c]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff003c]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff003c]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff003c]" />
              
              <div className="w-full flex items-center justify-between border-b border-[#ff003c]/20 pb-3 mb-4 text-[#ff003c]/80 text-[10px] tracking-[0.3em] font-mono">
                <span>[ HV_SECURITY_TERMINAL ]</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff003c] animate-pulse" />
                  ENCRYPTED
                </span>
              </div>

              {/* Dynamic Console Logs */}
              <div className="w-full h-32 bg-black/90 p-4 border border-[#ff003c]/10 text-left font-mono text-xs text-[#888] mb-6 overflow-hidden flex flex-col justify-end gap-1">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-[#ff003c]/70">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                <span className="animate-pulse text-[#ff003c]">_</span>
              </div>

              {/* Initialize Cyber Button */}
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-black via-[#ff003c]/20 to-black hover:via-[#ff003c]/40 border-2 border-[#ff003c] text-white tracking-[0.25em] font-bold text-sm shadow-[0_0_20px_rgba(255,0,60,0.3)] hover:shadow-[0_0_35px_rgba(255,0,60,0.6)] transition-shadow duration-300 relative group overflow-hidden"
              >
                {/* Laser hover overlay */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                BYPASS SECURITY SHIELD
              </motion.button>
              
              <p className="mt-4 text-[#555] font-mono text-[9px] tracking-wider uppercase">
                Warning: Audio and system voice initialization requested
              </p>
            </motion.div>
          ) : (
            /* ================= CINEMATIC VOICE FLICKERING SCREEN ================= */
            <motion.div
              key="auth-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-20 flex flex-col items-center justify-center text-center p-6"
            >
              {/* Neon border wrapper that flickers */}
              <div className={`p-12 md:p-20 relative flex flex-col items-center justify-center transition-all duration-75 max-w-2xl w-[90vw] ${
                flickerState 
                  ? 'border-2 border-[#ff003c] shadow-[0_0_50px_rgba(255,0,60,0.4),inset_0_0_30px_rgba(255,0,60,0.2)] bg-black/90'
                  : 'border-2 border-[#ff003c]/15 shadow-none bg-black/60'
              }`}>
                {/* Cyber decorative brackets */}
                <div className="absolute top-[-3px] left-[-3px] w-6 h-6 border-t-4 border-l-4 border-[#ff003c]" />
                <div className="absolute top-[-3px] right-[-3px] w-6 h-6 border-t-4 border-r-4 border-[#ff003c]" />
                <div className="absolute bottom-[-3px] left-[-3px] w-6 h-6 border-b-4 border-l-4 border-[#ff003c]" />
                <div className="absolute bottom-[-3px] right-[-3px] w-6 h-6 border-b-4 border-r-4 border-[#ff003c]" />

                {/* Cyber decorative text */}
                <div className="absolute top-4 text-[#ff003c] font-mono text-[10px] tracking-[0.4em] font-bold">
                  DECRYPTION ACTIVE
                </div>

                {/* Animated "ACCESS GRANTED" (Sync'd Red Neon Flicker) */}
                <motion.h1 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { duration: 0.15, ease: 'easeOut' }
                  }}
                  className={`font-black text-4xl sm:text-6xl md:text-7xl font-sans tracking-[0.1em] uppercase mb-4 transition-all duration-75 select-none ${
                    flickerState 
                      ? 'text-[#ff003c] [text-shadow:0_0_20px_#ff003c,0_0_40px_#ff003c,0_0_80px_#ff003c]'
                      : 'text-[#ff003c]/20 [text-shadow:none]'
                  }`}
                >
                  ACCESS GRANTED
                </motion.h1>

                {/* Animated "ENTERING HACKVERSE" */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { delay: 0.5, duration: 0.4 }
                  }}
                  className="font-mono text-sm sm:text-lg md:text-xl text-[#00ffcc] tracking-[0.25em] flex items-center justify-center gap-1 uppercase"
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 8px rgba(0,255,204,0.8)',
                        '0 0 1px rgba(0,255,204,0.2)',
                        '0 0 8px rgba(0,255,204,0.8)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ENTERING HACKVERSE
                  </motion.span>
                  <motion.span 
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2.5 h-5 bg-[#00ffcc] inline-block"
                  />
                </motion.div>
              </div>

              {/* Skip Intro Button */}
              <motion.button
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                whileHover={{ opacity: 0.9, scale: 1.05 }}
                className="absolute bottom-[-80px] px-6 py-2 border border-white/20 hover:border-[#ff003c] text-xs font-mono tracking-[0.2em] uppercase rounded-none transition-colors"
              >
                SKIP INTRO [ESC]
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
