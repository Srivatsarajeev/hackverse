/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./mission.html",
    "./districts.html",
    "./bounty.html",
    "./timeline.html",
    "./command.html",
    "./faq.html",
    "./register.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberRed: '#ff003c',
        cyberRedDim: 'rgba(255, 0, 60, 0.25)',
        cyberRedDark: '#990024',
        cyberDark: '#04000a',
        cyberCard: 'rgba(10, 0, 15, 0.85)',
        cyberGray: '#888888',
        cyberDim: '#444444',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        cyber: '0 0 12px rgba(255, 0, 60, 0.3)',
        cyberGlow: '0 0 20px rgba(255, 0, 60, 0.5)',
        cyberGlowHeavy: '0 0 35px rgba(255, 0, 60, 0.8)',
      },
      backgroundImage: {
        'hologram-pattern': "radial-gradient(circle, rgba(255,0,60,0.1) 0%, transparent 80%)",
      }
    },
  },
  plugins: [],
}
