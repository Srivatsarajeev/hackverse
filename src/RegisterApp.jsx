import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Custom Canvas Component for Cyberpunk Rain + Embers/Particles Background
const CyberCanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const drops = [];
    const maxDrops = 80;
    
    const particles = [];
    const maxParticles = 40;

    class Drop {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -100 - 20;
        this.speed = Math.random() * 6 + 5;
        this.length = Math.random() * 20 + 10;
        this.opacity = Math.random() * 0.35 + 0.15;
      }

      update() {
        this.y += this.speed;
        if (this.y > height) {
          this.reset();
        }
      }

      draw() {
        ctx.strokeStyle = `rgba(255, 0, 60, ${this.opacity})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = Math.random() * -1.2 - 0.4;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.wobble = Math.random() * 0.04;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * this.wobble) * 0.3;
        
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.size > 2) {
          ctx.shadowColor = '#ff003c';
          ctx.shadowBlur = 4;
          ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity * 0.4})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    for (let i = 0; i < maxDrops; i++) {
      drops.push(new Drop());
    }
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(4, 0, 10, 0.22)';
      ctx.fillRect(0, 0, width, height);

      drops.forEach((drop) => {
        drop.update();
        drop.draw();
      });

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="rain-canvas" />;
};

export default function RegisterApp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    alternatePhoneSame: true,
    alternatePhone: '',
    dob: '',
    gender: 'Male',
    country: 'India',
    state: '',
    city: '',
    occupation: 'College Student',
    collegeName: '',
    collegeCountry: 'India',
    collegeState: '',
    collegeCity: '',
    degree: '',
    stream: '',
    passoutYear: '2026',
    githubUrl: '',
    linkedinUrl: '',
    termsAccepted: true,
    communicationsAccepted: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const timeStr = d.toLocaleTimeString() + ' // ' + d.toLocaleDateString();
      setCurrentTime(timeStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your Full Name.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your Email Address.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Please enter your WhatsApp Number.';
    } else if (!/^\+?\d{7,15}$/.test(formData.whatsapp.replace(/[\s-()]/g, ''))) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp Number.';
    }

    if (!formData.alternatePhoneSame) {
      if (!formData.alternatePhone.trim()) {
        newErrors.alternatePhone = 'Please enter your Alternate Number.';
      } else if (!/^\+?\d{7,15}$/.test(formData.alternatePhone.replace(/[\s-()]/g, ''))) {
        newErrors.alternatePhone = 'Please enter a valid Alternate Number.';
      }
    }

    if (!formData.dob) {
      newErrors.dob = 'Please enter your Date of Birth.';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16 || age > 24) {
        newErrors.dob = 'Eligibility: You need to be between age group 16 to 24 to register.';
      }
    }

    if (!formData.gender) newErrors.gender = 'Please select your Gender.';
    if (!formData.country.trim()) newErrors.country = 'Please enter your Country.';
    if (!formData.state.trim()) newErrors.state = 'Please enter your State.';
    if (!formData.city.trim()) newErrors.city = 'Please enter your City.';
    
    if (formData.occupation === 'College Student') {
      if (!formData.collegeName.trim()) newErrors.collegeName = 'Please enter your College Name.';
      if (!formData.collegeCountry.trim()) newErrors.collegeCountry = 'Please enter your College Country.';
      if (!formData.collegeState.trim()) newErrors.collegeState = 'Please enter your College State.';
      if (!formData.collegeCity.trim()) newErrors.collegeCity = 'Please enter your College City.';
      if (!formData.degree.trim()) newErrors.degree = 'Please enter your Degree.';
      if (!formData.stream.trim()) newErrors.stream = 'Please enter your Stream / Specialization.';
      if (!formData.passoutYear) newErrors.passoutYear = 'Please select your Passout Year.';
    }

    if (!formData.githubUrl.trim()) {
      newErrors.githubUrl = 'Please enter your GitHub Profile URL.';
    } else if (!/^https?:\/\//i.test(formData.githubUrl)) {
      newErrors.githubUrl = 'URL must include http:// or https://';
    }

    if (!formData.linkedinUrl.trim()) {
      newErrors.linkedinUrl = 'Please enter your LinkedIn Profile URL.';
    } else if (!/^https?:\/\//i.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'URL must include http:// or https://';
    }

    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms & Conditions.';
    if (!formData.communicationsAccepted) newErrors.communicationsAccepted = 'You must accept the Communications consent.';

    setErrors(newErrors);

    const firstError = Object.keys(newErrors)[0];
    if (firstError) {
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const submitSequenceSteps = [
    'CONNECTING TO HACKVERSE MAIN CORE...',
    'REGISTERING SQUAD BIOMETRICS...',
    'SECURING PROJECT INDEX DATA...',
    'TRANSMISSION COMPLETED SUCCESSFULLY.'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStep(0);

    try {
      const res = await axios.post("http://localhost:8000/api/register", {
        fullName: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        alternatePhoneSame: formData.alternatePhoneSame,
        alternatePhone: formData.alternatePhoneSame ? "" : formData.alternatePhone,
        dob: formData.dob,
        gender: formData.gender,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        occupation: formData.occupation,
        collegeName: formData.collegeName,
        collegeCountry: formData.collegeCountry,
        collegeState: formData.collegeState,
        collegeCity: formData.collegeCity,
        degree: formData.degree,
        stream: formData.stream,
        passoutYear: formData.passoutYear,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        termsAccepted: formData.termsAccepted,
        communicationsAccepted: formData.communicationsAccepted
      });

      if (res.data.success) {
        const stepIntervals = [500, 1000, 1500, 2000];
        stepIntervals.forEach((time, index) => {
          setTimeout(() => {
            setSubmitStep(index);
            if (index === submitSequenceSteps.length - 1) {
              setTimeout(() => {
                setTeamId(res.data.teamId);
                setIsSubmitting(false);
                setSubmitted(true);
              }, 400);
            }
          }, time);
        });
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      const errMsg = err.response?.data?.detail || "Mainframe synchronization breach. Try again later.";
      setErrors(prev => ({ ...prev, fullName: errMsg }));
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      whatsapp: '',
      alternatePhoneSame: true,
      alternatePhone: '',
      dob: '',
      gender: 'Male',
      country: 'India',
      state: '',
      city: '',
      occupation: 'College Student',
      collegeName: '',
      collegeCountry: 'India',
      collegeState: '',
      collegeCity: '',
      degree: '',
      stream: '',
      passoutYear: '2026',
      githubUrl: '',
      linkedinUrl: '',
      termsAccepted: true,
      communicationsAccepted: true,
    });
    setErrors({});
    setSubmitted(false);
    setTeamId('');
  };

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8 font-rajdhani text-white overflow-hidden bg-cyberDark">
      {/* Dynamic particles and scanline */}
      <CyberCanvasBackground />
      <div className="absolute inset-0 bg-hologram-pattern opacity-30 pointer-events-none z-0"></div>
      <div className="scanline"></div>

      <div className="relative max-w-3xl mx-auto z-10">
        
        {/* Simple & Clean Premium Futuristic Header */}
        <header className="text-center mb-10 select-none">
          <div className="inline-block relative">
            <div className="absolute -top-1 -left-4 w-2 h-8 bg-cyberRed transform -skew-x-12"></div>
            <div className="absolute -top-1 -right-4 w-2 h-8 bg-cyberRed transform -skew-x-12"></div>
            
            <p className="font-mono text-cyberRed text-[0.65rem] uppercase tracking-[0.3em] mb-0.5 font-bold">
              [ SECURE MAINFRAME ENROLLMENT ]
            </p>
            <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white tracking-widest mb-1 drop-shadow-[0_0_12px_#ff003c]">
              HACK4SOC 3.0
            </h1>
          </div>
          
          <p className="font-orbitron text-cyberRed text-base md:text-lg tracking-[0.2em] font-medium uppercase">
            Tech with Human Touch
          </p>
          
          <div className="w-32 h-[1px] bg-cyberRed/30 mx-auto my-2 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyberDark border border-cyberRed rotate-45"></div>
          </div>
          
          <p className="font-rajdhani text-zinc-400 text-xs tracking-[0.15em] uppercase font-bold italic mb-0.5">
            “Code with Honor. Build the Future.”
          </p>
          <div className="flex justify-center items-center gap-1.5 text-[10px] text-cyberRed/80 tracking-widest font-mono">
            <span className="w-1.5 h-1.5 bg-cyberRed animate-ping rounded-full"></span>
            <span>ENTER NEO TOKYO</span>
          </div>
        </header>

        {/* Success / Decrypted Screen */}
        {submitted ? (
          <div className="glassmorphism max-w-xl mx-auto p-6 md:p-8 rounded-lg border-2 border-cyberRed relative animate-[fadeIn_0.4s_ease-out] shadow-cyberGlowHeavy">
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cyberRed/10 border-2 border-cyberRed rounded-full mx-auto flex items-center justify-center mb-5 relative animate-pulse">
                <span className="font-orbitron text-cyberRed text-2xl font-bold">✓</span>
                <div className="absolute inset-0 rounded-full border border-cyberRed animate-ping opacity-45"></div>
              </div>

              <h2 className="font-orbitron font-extrabold text-2xl md:text-3xl text-white tracking-widest uppercase mb-1">
                REGISTRATION DECRYPTED
              </h2>
              <p className="font-mono text-cyberRed text-xs tracking-[0.3em] uppercase mb-5 animate-pulse">
                // Welcome to Hack4Soc 3.0 //
              </p>

              <div className="border border-cyberRed/30 bg-[#04000a]/90 p-5 rounded mb-6 relative font-mono text-left text-zinc-300">
                <div className="absolute top-2 right-3 text-[9px] text-zinc-500 font-mono">NEO TOKYO LINK SECURED</div>
                <div className="mb-1 text-zinc-400 text-[10px] tracking-wider">YOUR PARTICIPANT SECURITY ID:</div>
                
                <div className="font-orbitron text-2xl md:text-3xl text-cyberRed font-black tracking-widest border-b border-cyberRed/20 pb-2 mb-3 animate-pulse">
                  {teamId}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div><span className="text-zinc-500">OPERATOR:</span> <span className="text-white font-bold">{formData.fullName}</span></div>
                  <div><span className="text-zinc-500">EMAIL:</span> <span className="text-white">{formData.email}</span></div>
                  <div><span className="text-zinc-500">WHATSAPP:</span> <span className="text-white">{formData.whatsapp}</span></div>
                  <div><span className="text-zinc-500">DEGREE:</span> <span className="text-white">{formData.degree || "N/A"}</span></div>
                  <div><span className="text-zinc-500">COLLEGE:</span> <span className="text-white">{formData.collegeName || "N/A"}</span></div>
                  <div><span className="text-zinc-500">GRADUATION:</span> <span className="text-white">{formData.passoutYear || "N/A"}</span></div>
                </div>
              </div>

              <p className="text-zinc-400 text-xs md:text-sm mb-6 leading-relaxed max-w-md mx-auto">
                Your biometrics and academic telemetry have been uploaded to the Hack4Soc mainframe. Keep your blades sharp and your code clean. Honor awaits you.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="font-orbitron text-xs tracking-widest text-white px-6 py-2.5 bg-cyberRed shadow-cyberGlow border border-cyberRed hover:bg-transparent hover:text-cyberRed hover:shadow-cyberGlowHeavy transition duration-300 transform hover:scale-105"
                >
                  Register Another Account
                </button>
                <a
                  href="index.html"
                  className="font-orbitron text-xs tracking-widest text-zinc-400 border border-zinc-700 px-5 py-2.5 hover:bg-zinc-900 hover:text-white transition duration-300 flex items-center"
                >
                  Back to HQ
                </a>
              </div>
            </div>
          </div>
        ) : (
          
          /* SingleCentered Focused Holographic Terminal Panel */
          <form onSubmit={handleSubmit} className="glassmorphism p-6 md:p-8 rounded-lg shadow-cyber relative border border-cyberRed/20 hover:border-cyberRed/35 transition-all duration-500">
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            
            {/* Header Data Output Bar */}
            <div className="mb-6 pb-2 border-b border-cyberRed/20 flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none">
              <span>TERMINAL ID: H4S-3.0-REGISTRAR</span>
              <span className="text-cyberRed font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyberRed rounded-full animate-ping"></span>
                CONNECTED // ENCRYPTED_TUNNEL
              </span>
            </div>

            {/* SECTION 1: PERSONAL PARTICIPANT PROFILE */}
            <div className="mb-8">
              <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                I. Personal Identity Vector
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Full Name <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name as it appears on official docs"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.fullName ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.fullName && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Email Address <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. pilot@neotokyo.io"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.email ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.email && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.email}
                    </span>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    WhatsApp Number <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded">
                      +91
                    </span>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="WhatsApp Mobile Number"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.whatsapp ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                  </div>
                  {errors.whatsapp && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.whatsapp}
                    </span>
                  )}
                </div>

                {/* WhatsApp Checkbox */}
                <div className="md:col-span-2 flex items-center gap-2 py-1 select-none">
                  <input
                    type="checkbox"
                    id="alternatePhoneSame"
                    name="alternatePhoneSame"
                    checked={formData.alternatePhoneSame}
                    onChange={handleInputChange}
                    className="accent-cyberRed w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="alternatePhoneSame" className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider cursor-pointer">
                    Alternate number is same as WhatsApp number
                  </label>
                </div>

                {/* Alternate Number */}
                {!formData.alternatePhoneSame && (
                  <div className="md:col-span-2 animate-[fadeIn_0.3s_ease-out]">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      Alternate Phone Number <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded">
                        +91
                      </span>
                      <input
                        type="text"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        placeholder="Alternate Mobile Number"
                        className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                          errors.alternatePhone ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                        }`}
                      />
                    </div>
                    {errors.alternatePhone && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.alternatePhone}
                      </span>
                    )}
                  </div>
                )}

                {/* Date of Birth */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Date of Birth <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.dob ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  <span className="block mt-1 font-mono text-[8px] text-zinc-500 uppercase tracking-wider">
                    Eligibility: You need to be between age group 16 to 24 to be a part of this initiative.
                  </span>
                  {errors.dob && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.dob}
                    </span>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Gender <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 outline-none focus:border-cyberRed transition-all duration-300 rounded"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Country <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 focus:border-cyberRed outline-none transition-all duration-300 rounded"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    State / Province <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter State"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.state ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.state && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.state}
                    </span>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    City <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter City"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.city ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.city && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.city}
                    </span>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Occupation <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 outline-none focus:border-cyberRed transition-all duration-300 rounded"
                  >
                    <option value="College Student">College Student</option>
                    <option value="Working Professional">Working Professional</option>
                  </select>
                </div>

              </div>
            </div>

            {/* SECTION 2: ACADEMIC DETAILS */}
            {formData.occupation === 'College Student' && (
              <div className="mb-8 animate-[fadeIn_0.4s_ease-out]">
                <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                  II. Academic & Technical Intelligence
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* College Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      College Name <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      placeholder="Enter full college name"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.collegeName ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    {errors.collegeName && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.collegeName}
                      </span>
                    )}
                  </div>

                  {/* College Country */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      College Country <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeCountry"
                      value={formData.collegeCountry}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 focus:border-cyberRed outline-none transition-all duration-300 rounded"
                    />
                  </div>

                  {/* College State */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      College State <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeState"
                      value={formData.collegeState}
                      onChange={handleInputChange}
                      placeholder="College State"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.collegeState ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    {errors.collegeState && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.collegeState}
                      </span>
                    )}
                  </div>

                  {/* College City */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      College City <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeCity"
                      value={formData.collegeCity}
                      onChange={handleInputChange}
                      placeholder="College City"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.collegeCity ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    {errors.collegeCity && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.collegeCity}
                      </span>
                    )}
                  </div>

                  {/* Degree */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      Degree / Program <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleInputChange}
                      placeholder="e.g. B.E / B.Tech / BCA"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.degree ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    {errors.degree && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.degree}
                      </span>
                    )}
                  </div>

                  {/* Stream */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      Stream / Specialization <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="stream"
                      value={formData.stream}
                      onChange={handleInputChange}
                      placeholder="e.g. Computer Science"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.stream ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    {errors.stream && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.stream}
                      </span>
                    )}
                  </div>

                  {/* Passout Year */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      Passout Year <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <select
                      name="passoutYear"
                      value={formData.passoutYear}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 outline-none focus:border-cyberRed transition-all duration-300 rounded"
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>

                  {/* Github Profile */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      Github Profile Link <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/your_username"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.githubUrl ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    <span className="block mt-1 font-mono text-[8px] text-zinc-500 uppercase tracking-wider">
                      URL must include https or http , example: https://github.com/sample_user
                    </span>
                    {errors.githubUrl && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.githubUrl}
                      </span>
                    )}
                  </div>

                  {/* LinkedIn Profile */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                      LinkedIn Profile Link <span className="text-cyberRed font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/your_username"
                      className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                        errors.linkedinUrl ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                      }`}
                    />
                    <span className="block mt-1 font-mono text-[8px] text-zinc-500 uppercase tracking-wider">
                      URL must include https or http , example: https://linkedin.com/in/sample_user
                    </span>
                    {errors.linkedinUrl && (
                      <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                        ⚠️ {errors.linkedinUrl}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* SECTION 3: CONSENT DIRECTIVES */}
            <div className="mb-8">
              <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                III. Core Directives & Consents
              </div>
              
              <div className="space-y-3 font-mono text-[10px] text-zinc-400 select-none">
                
                {/* Terms and conditions */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="accent-cyberRed w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="termsAccepted" className="uppercase tracking-wider leading-relaxed cursor-pointer">
                    * By registering you accept the <span className="text-cyberRed font-bold underline cursor-pointer">Terms & Conditions</span> of Hack4Soc 3.0
                  </label>
                </div>
                {errors.termsAccepted && (
                  <span className="block font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                    ⚠️ {errors.termsAccepted}
                  </span>
                )}

                {/* Communications consent */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="communicationsAccepted"
                    name="communicationsAccepted"
                    checked={formData.communicationsAccepted}
                    onChange={handleInputChange}
                    className="accent-cyberRed w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="communicationsAccepted" className="uppercase tracking-wider leading-relaxed cursor-pointer">
                    * By registering, you consent to receive updates and communications related to this initiative.
                  </label>
                </div>
                {errors.communicationsAccepted && (
                  <span className="block font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                    ⚠️ {errors.communicationsAccepted}
                  </span>
                )}

              </div>
            </div>

            {/* Red holographic submit button */}
            <div className="pt-4 relative select-none">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative py-4 bg-cyberRed hover:bg-[#990024] font-orbitron font-extrabold text-base tracking-[0.2em] uppercase text-white shadow-cyberGlow hover:shadow-[0_0_40px_rgba(255,0,60,0.9)] border border-cyberRed transition-all duration-300 hover:scale-[1.01] transform active:scale-95 group overflow-hidden"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite_linear]"></span>
                {isSubmitting ? 'ESTABLISHING CORE LINK...' : 'INITIATE REGISTRATION PROTOCOL'}
              </button>
              
              <div className="absolute -bottom-5 left-0 right-0 flex justify-between font-mono text-[8px] text-zinc-600 px-1">
                <span>SYSTEM_STATUS: CONFIRMED</span>
                <span>TIME: {currentTime || 'SECURE_ROUTE'}</span>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* Submission compilation overlay screen */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-cyberDark/95 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="glassmorphism max-w-sm w-full p-6 rounded-lg border border-cyberRed relative shadow-cyberGlowHeavy">
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>

            <div className="text-center font-mono">
              <div className="text-cyberRed text-lg font-bold font-orbitron tracking-wider mb-2 uppercase animate-pulse">
                // COMPILING BLUEPRINT //
              </div>
              
              <div className="w-full h-3 bg-zinc-900 border border-cyberRed/30 p-0.5 rounded overflow-hidden mb-4 relative">
                <div 
                  className="h-full bg-cyberRed transition-all duration-300 ease-out shadow-[0_0_6px_#ff003c]" 
                  style={{ width: `${(submitStep + 1) * 25}%` }}
                ></div>
              </div>

              <div className="bg-black/90 p-3 border border-zinc-800 rounded text-left text-[10px] space-y-1.5 max-h-[120px] overflow-hidden text-zinc-400 select-none">
                {submitSequenceSteps.slice(0, submitStep + 1).map((step, idx) => (
                  <div key={idx} className={`${idx === submitStep ? 'text-cyberRed font-bold animate-pulse' : 'text-green-500'}`}>
                    &gt; {step}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center items-center gap-1.5 text-[9px] text-zinc-500 tracking-wider">
                <span className="w-1.5 h-1.5 bg-cyberRed rounded-full animate-ping"></span>
                <span>SECURE BROADCAST ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
