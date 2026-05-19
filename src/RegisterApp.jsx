import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Procedural Matrix Digital Rain Component for Immersive Background
const CyberCanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const columns = Math.floor(canvas.width / 20) + 1;
    const yPositions = Array(columns).fill(0);

    const draw = () => {
      ctx.fillStyle = 'rgba(4, 0, 10, 0.15)'; // Dark purple space trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 0, 60, 0.35)'; // Red neon rain drops
      ctx.font = '12px monospace';

      for (let i = 0; i < yPositions.length; i++) {
        const text = String.fromCharCode(33 + Math.floor(Math.random() * 93));
        const x = i * 20;
        const y = yPositions[i];

        ctx.fillText(text, x, y);

        if (y > 100 + Math.random() * 10000) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += 20;
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="rain-canvas" />;
};

export default function RegisterApp() {
  const [formData, setFormData] = useState({
    collegeName: '',
    teamName: '',
    fullName: '',
    whatsapp: '',
    alternatePhone: '',
    degree: '', // BCA or MCA option
    teamSize: 2, // min 2 max 4 option
    member2Name: '',
    member2Phone: '',
    member3Name: '',
    member3Phone: '',
    member4Name: '',
    member4Phone: '',
    idCardFileUrl: '',
    idCardFileName: '',
    paymentUtr: '',
    paymentReceiptUrl: '',
    paymentReceiptName: '',
    domain: 'AI IN OPEN INNOVATION',
    projectTitle: '',
    problemStatement: '',
    proposedSolution: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  const [idCardFile, setIdCardFile] = useState(null);
  const [paymentReceiptFile, setPaymentReceiptFile] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setIdCardFile(file);
    setFormData((prev) => ({
      ...prev,
      idCardFileName: file?.name || '',
    }));
    if (errors.idCardFile) {
      setErrors((prev) => ({ ...prev, idCardFile: '' }));
    }
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPaymentReceiptFile(file);
    setFormData((prev) => ({
      ...prev,
      paymentReceiptName: file?.name || '',
    }));
    if (errors.paymentReceiptFile) {
      setErrors((prev) => ({ ...prev, paymentReceiptFile: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'Please enter your College Name.';
    }
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Please enter a secure Team Name.';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter Team Leader name.';
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Please enter Leader Phone Number.';
    } else if (!/^\+?\d{7,15}$/.test(formData.whatsapp.replace(/[\s-()]/g, ''))) {
      newErrors.whatsapp = 'Please enter a valid Phone Number.';
    }

    if (formData.alternatePhone.trim() && !/^\+?\d{7,15}$/.test(formData.alternatePhone.replace(/[\s-()]/g, ''))) {
      newErrors.alternatePhone = 'Please enter a valid Alternate Phone Number.';
    }

    if (!formData.degree) {
      newErrors.degree = 'Please select BCA or MCA option.';
    }

    const tSize = parseInt(formData.teamSize);

    // Dynamic Team Member Validations based on Selected Size
    if (tSize >= 2) {
      if (!formData.member2Name.trim()) {
        newErrors.member2Name = 'Please enter second member name.';
      }
      if (!formData.member2Phone.trim()) {
        newErrors.member2Phone = 'Please enter second member phone number.';
      } else if (!/^\+?\d{7,15}$/.test(formData.member2Phone.replace(/[\s-()]/g, ''))) {
        newErrors.member2Phone = 'Please enter a valid phone number.';
      }
    }

    if (tSize >= 3) {
      if (!formData.member3Name.trim()) {
        newErrors.member3Name = 'Please enter third member name.';
      }
      if (!formData.member3Phone.trim()) {
        newErrors.member3Phone = 'Please enter third member phone number.';
      } else if (!/^\+?\d{7,15}$/.test(formData.member3Phone.replace(/[\s-()]/g, ''))) {
        newErrors.member3Phone = 'Please enter a valid phone number.';
      }
    }

    if (tSize >= 4) {
      if (!formData.member4Name.trim()) {
        newErrors.member4Name = 'Please enter fourth member name.';
      }
      if (!formData.member4Phone.trim()) {
        newErrors.member4Phone = 'Please enter fourth member phone number.';
      } else if (!/^\+?\d{7,15}$/.test(formData.member4Phone.replace(/[\s-()]/g, ''))) {
        newErrors.member4Phone = 'Please enter a valid phone number.';
      }
    }

    if (!idCardFile) {
      newErrors.idCardFile = 'Please upload merged college ID cards.';
    } else if (!/\.(pdf|jpg|jpeg|png|webp)$/i.test(idCardFile.name)) {
      newErrors.idCardFile = 'Upload IDs in PDF, JPG, PNG, or WEBP formats.';
    } else if (idCardFile.size > 10 * 1024 * 1024) {
      newErrors.idCardFile = 'File size limit is 10MB.';
    }

    if (!formData.paymentUtr.trim()) {
      newErrors.paymentUtr = 'Please enter your 12-digit transaction UTR number.';
    } else if (formData.paymentUtr.trim().length < 6) {
      newErrors.paymentUtr = 'Please enter a valid UTR / transaction ID.';
    }

    if (!paymentReceiptFile) {
      newErrors.paymentReceiptFile = 'Please upload a transaction proof receipt.';
    } else if (!/\.(pdf|jpg|jpeg|png|webp)$/i.test(paymentReceiptFile.name)) {
      newErrors.paymentReceiptFile = 'Upload transaction proof in PDF, JPG, PNG, or WEBP.';
    } else if (paymentReceiptFile.size > 10 * 1024 * 1024) {
      newErrors.paymentReceiptFile = 'Receipt proof file must be under 10MB.';
    }

    // Project Concept Validations
    if (!formData.domain) {
      newErrors.domain = 'Please select a hackathon domain.';
    }
    if (!formData.projectTitle || !formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Please enter your project title.';
    }
    if (!formData.problemStatement || !formData.problemStatement.trim()) {
      newErrors.problemStatement = 'Please enter your domain problem statement.';
    } else if (formData.problemStatement.trim().length < 10) {
      newErrors.problemStatement = 'Problem statement description is too short (min 10 chars).';
    }
    if (!formData.proposedSolution || !formData.proposedSolution.trim()) {
      newErrors.proposedSolution = 'Please describe your proposed solution.';
    } else if (formData.proposedSolution.trim().length < 10) {
      newErrors.proposedSolution = 'Proposed solution description is too short (min 10 chars).';
    }

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
    'Connecting to registration database...',
    'Uploading merged student college IDs...',
    'Uploading transaction receipt proof...',
    'Verifying payment UTR records...',
    'Registration successfully authorized!'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStep(0);
    setSubmitError('');

    try {
      const apiUrl = import.meta.env.PROD ? "" : "http://localhost:8000";
      
      let idCardFileUrl = '';
      let idCardFileName = '';
      let paymentReceiptUrl = '';
      let paymentReceiptName = '';

      // 1. Upload Merged College IDs
      if (idCardFile) {
        const uploadData = new FormData();
        uploadData.append('file', idCardFile);
        const uploadRes = await axios.post(`${apiUrl}/api/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        idCardFileUrl = uploadRes.data.url || '';
        idCardFileName = uploadRes.data.filename || idCardFile.name;
      }

      // 2. Upload Payment Proof Screenshot
      if (paymentReceiptFile) {
        const uploadData = new FormData();
        uploadData.append('file', paymentReceiptFile);
        const uploadRes = await axios.post(`${apiUrl}/api/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        paymentReceiptUrl = uploadRes.data.url || '';
        paymentReceiptName = uploadRes.data.filename || paymentReceiptFile.name;
      }

      // 3. Register Participant Team in backend database
      const res = await axios.post(`${apiUrl}/api/register`, {
        collegeName: formData.collegeName,
        teamName: formData.teamName,
        fullName: formData.fullName,
        whatsapp: formData.whatsapp,
        alternatePhone: formData.alternatePhone,
        degree: formData.degree,
        teamSize: parseInt(formData.teamSize),
        member2Name: formData.member2Name,
        member2Phone: formData.member2Phone,
        member3Name: formData.member3Name,
        member3Phone: formData.member3Phone,
        member4Name: formData.member4Name,
        member4Phone: formData.member4Phone,
        idCardFileUrl,
        idCardFileName,
        paymentUtr: formData.paymentUtr,
        paymentReceiptUrl,
        paymentReceiptName,
        // Optional parameters populated with system defaults for backwards database safety
        email: null,
        dob: "2000-01-01",
        gender: "Prefer not to say",
        country: "India",
        state: "Karnataka",
        city: "Bangalore",
        occupation: "College Student",
        collegeCountry: "India",
        collegeState: "Karnataka",
        collegeCity: "Bangalore",
        stream: "Computer Applications",
        yearOfStudy: "1st Year",
        passoutYear: "2026",
        domain: formData.domain,
        projectTitle: formData.projectTitle,
        problemStatement: formData.problemStatement,
        proposedSolution: formData.proposedSolution,
        technologiesUsed: "",
        githubUrl: "",
        linkedinUrl: "",
        termsAccepted: true,
        communicationsAccepted: true
      });

      if (res.data.success) {
        submitSequenceSteps.forEach((_, index) => {
          setTimeout(() => {
            setSubmitStep(index);
            if (index === submitSequenceSteps.length - 1) {
              setTimeout(() => {
                setTeamId(res.data.teamId);
                setIsSubmitting(false);
                setSubmitted(true);
              }, 400);
            }
          }, 450 + index * 450);
        });
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      const errMsg = err.response?.data?.detail || "Something went wrong. UTR may have already been registered, or check your internet connection.";
      setSubmitError(errMsg);
    }
  };

  const handleReset = () => {
    setFormData({
      collegeName: '',
      teamName: '',
      fullName: '',
      whatsapp: '',
      alternatePhone: '',
      degree: '',
      teamSize: 2,
      member2Name: '',
      member2Phone: '',
      member3Name: '',
      member3Phone: '',
      member4Name: '',
      member4Phone: '',
      idCardFileUrl: '',
      idCardFileName: '',
      paymentUtr: '',
      paymentReceiptUrl: '',
      paymentReceiptName: '',
      domain: 'AI IN OPEN INNOVATION',
      projectTitle: '',
      problemStatement: '',
      proposedSolution: '',
    });
    setErrors({});
    setSubmitError('');
    setSubmitted(false);
    setTeamId('');
    setIdCardFile(null);
    setPaymentReceiptFile(null);
  };

  const tSize = parseInt(formData.teamSize);

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8 font-rajdhani text-white overflow-hidden bg-cyberDark">
      <CyberCanvasBackground />
      <div className="absolute inset-0 bg-hologram-pattern opacity-30 pointer-events-none z-0"></div>
      <div className="scanline"></div>

      <div className="relative max-w-3xl mx-auto z-10">
        
        {/* Header Section */}
        <header className="text-center mb-10 select-none">
          <div className="inline-block relative">
            <div className="absolute -top-1 -left-4 w-2 h-8 bg-cyberRed transform -skew-x-12"></div>
            <div className="absolute -top-1 -right-4 w-2 h-8 bg-cyberRed transform -skew-x-12"></div>
            
            <p className="font-mono text-cyberRed text-[0.65rem] uppercase tracking-[0.3em] mb-0.5 font-bold">
              [ HACKATHON REGISTRATION ]
            </p>
            <h1 className="font-orbitron font-black text-4xl md:text-5xl text-white tracking-widest mb-1 drop-shadow-[0_0_12px_#ff003c]">
              HACKVERSE 2.0
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
            <span>SECURE ENCRYPTED CHANNEL</span>
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
                REGISTRATION SUCCESSFUL!
              </h2>
              <p className="font-mono text-cyberRed text-xs tracking-[0.3em] uppercase mb-5 animate-pulse">
                // Welcome to Hackverse 2.0 //
              </p>

              <div className="border border-cyberRed/30 bg-[#04000a]/90 p-5 rounded mb-6 relative font-mono text-left text-zinc-300">
                <div className="absolute top-2 right-3 text-[9px] text-zinc-500 font-mono">REGISTRATION COMPLETED</div>
                <div className="mb-1 text-zinc-400 text-[10px] tracking-wider">YOUR TEAM ID:</div>
                
                <div className="font-orbitron text-2xl md:text-3xl text-cyberRed font-black tracking-widest border-b border-cyberRed/20 pb-2 mb-3 animate-pulse">
                  {teamId}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-rajdhani">
                  <div><span className="text-zinc-500 uppercase">Team Name:</span> <span className="text-white font-bold">{formData.teamName}</span></div>
                  <div><span className="text-zinc-500 uppercase">College:</span> <span className="text-white font-bold">{formData.collegeName}</span></div>
                  <div><span className="text-zinc-500 uppercase">Leader Name:</span> <span className="text-white">{formData.fullName}</span></div>
                  <div><span className="text-zinc-500 uppercase">Leader Phone:</span> <span className="text-white">{formData.whatsapp}</span></div>
                  <div><span className="text-zinc-500 uppercase">Leader Alt Phone:</span> <span className="text-white">{formData.alternatePhone || "N/A"}</span></div>
                  <div><span className="text-zinc-500 uppercase">Course Selection:</span> <span className="text-white font-semibold text-cyberRed">{formData.degree}</span></div>
                  <div><span className="text-zinc-500 uppercase">Team Size:</span> <span className="text-white">{formData.teamSize} Member(s)</span></div>
                  
                  {tSize >= 2 && (
                    <>
                      <div><span className="text-zinc-500 uppercase">Member 2 Name:</span> <span className="text-white">{formData.member2Name}</span></div>
                      <div><span className="text-zinc-500 uppercase">Member 2 Phone:</span> <span className="text-white">{formData.member2Phone}</span></div>
                    </>
                  )}
                  {tSize >= 3 && (
                    <>
                      <div><span className="text-zinc-500 uppercase">Member 3 Name:</span> <span className="text-white">{formData.member3Name}</span></div>
                      <div><span className="text-zinc-500 uppercase">Member 3 Phone:</span> <span className="text-white">{formData.member3Phone}</span></div>
                    </>
                  )}
                  {tSize >= 4 && (
                    <>
                      <div><span className="text-zinc-500 uppercase">Member 4 Name:</span> <span className="text-white">{formData.member4Name}</span></div>
                      <div><span className="text-zinc-500 uppercase">Member 4 Phone:</span> <span className="text-white">{formData.member4Phone}</span></div>
                    </>
                  )}
                  <div className="md:col-span-2 border-t border-cyberRed/15 pt-2 mt-1">
                    <span className="text-zinc-500 uppercase">Payment UTR ID:</span> <span className="text-green-400 font-mono font-bold tracking-widest">{formData.paymentUtr}</span>
                  </div>
                </div>
              </div>

              <p className="text-zinc-400 text-xs md:text-sm mb-4 leading-relaxed max-w-md mx-auto">
                Your group registration has been successfully encrypted and recorded in our database! Join the official community server to complete onboarding.
              </p>

              <div className="mb-6 flex justify-center">
                <a 
                  href="https://chat.whatsapp.com/BetZx9khk8eDJeYseRxQTP" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-orbitron font-bold text-xs tracking-widest text-[#25D366] border-2 border-[#25D366] px-5 py-2.5 hover:bg-[#25D366]/10 transition-colors rounded shadow-[0_0_10px_rgba(37,211,102,0.3)]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  JOIN WHATSAPP COMMUNITY
                </a>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="font-orbitron text-xs tracking-widest text-white px-6 py-2.5 bg-cyberRed shadow-cyberGlow border border-cyberRed hover:bg-transparent hover:text-cyberRed hover:shadow-cyberGlowHeavy transition duration-300 transform hover:scale-105"
                >
                  Register Another Team
                </button>
                <a
                  href="index.html"
                  className="font-orbitron text-xs tracking-widest text-zinc-400 border border-zinc-700 px-5 py-2.5 hover:bg-zinc-900 hover:text-white transition duration-300 flex items-center"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        ) : (
          
          /* Focused Holographic Team Terminal Panel */
          <form onSubmit={handleSubmit} className="glassmorphism p-6 md:p-8 rounded-lg shadow-cyber relative border border-cyberRed/20 hover:border-cyberRed/35 transition-all duration-500">
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            
            {submitError && (
              <div className="mb-6 p-4 bg-cyberRed/15 border border-cyberRed/65 text-cyberRed text-xs font-mono rounded flex items-start gap-2 animate-[fadeIn_0.3s_ease-out]">
                <span className="font-bold flex-shrink-0">⚠️</span>
                <span>{submitError}</span>
              </div>
            )}
            
            {/* Header Data Output Bar */}
            <div className="mb-6 pb-2 border-b border-cyberRed/20 flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none">
              <span>TEAM INTAKE FORM v2.2</span>
              <span className="text-cyberRed font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyberRed rounded-full animate-ping"></span>
                SECURE CONSOLE ACTIVE
              </span>
            </div>

            {/* SECTION 1: TEAM & COLLEGE PROFILE */}
            <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                1. Team & College Profile
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Team Name */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Team Name <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    placeholder="Enter unique team tag"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.teamName ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.teamName && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.teamName}
                    </span>
                  )}
                </div>

                {/* College Name */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    College Name <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    placeholder="e.g. BMSITM"
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

                {/* BCA or MCA Select Option */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Course / Option Selection <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(p => ({ ...p, degree: 'BCA' }));
                        setErrors(p => ({ ...p, degree: '' }));
                      }}
                      className={`py-2.5 font-orbitron font-bold text-xs tracking-widest uppercase border transition-all duration-300 ${
                        formData.degree === 'BCA'
                          ? 'bg-cyberRed text-white border-cyberRed shadow-cyberGlow'
                          : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      BCA Option
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(p => ({ ...p, degree: 'MCA' }));
                        setErrors(p => ({ ...p, degree: '' }));
                      }}
                      className={`py-2.5 font-orbitron font-bold text-xs tracking-widest uppercase border transition-all duration-300 ${
                        formData.degree === 'MCA'
                          ? 'bg-cyberRed text-white border-cyberRed shadow-cyberGlow'
                          : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      MCA Option
                    </button>
                  </div>
                  {errors.degree && (
                    <span className="block mt-1.5 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.degree}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* SECTION 2: TEAM MEMBERS */}
            <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                2. Team Members Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Team Size Selector (min 1, max 4 option) */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Team Size Selection <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData(p => ({ ...p, teamSize: val }));
                    }}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 outline-none focus:border-cyberRed transition-all duration-300 rounded"
                  >
                    <option value={2}>2 Members (Duo Operations)</option>
                    <option value={3}>3 Members (Trio Operations)</option>
                    <option value={4}>4 Members (Squad Operations)</option>
                  </select>
                </div>

                {/* Team Leader Name */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Team Leader Name <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter leader full name"
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

                {/* Leader Phone (WhatsApp) */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Leader Phone Number <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded select-none">
                      +91
                    </span>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="WhatsApp Mobile"
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

                {/* Leader Alternative Phone */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Alternative Phone Number of Leader <span className="text-zinc-500">(Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded select-none">
                      +91
                    </span>
                    <input
                      type="text"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      placeholder="Alternate Mobile"
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

                {/* CONDITIONAL SECTION: MEMBER 2 DETAILS */}
                {tSize >= 2 && (
                  <div className="md:col-span-2 border border-cyberRed/20 bg-cyberRed/[0.02] p-4 rounded mt-2 space-y-4 animate-[fadeIn_0.4s_ease-out]">
                    <div className="font-orbitron text-xs text-cyberRed font-bold uppercase tracking-wider">// Member 02 Credentials</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                          Other Member Name <span className="text-cyberRed font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          name="member2Name"
                          value={formData.member2Name}
                          onChange={handleInputChange}
                          placeholder="Enter second member name"
                          className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                            errors.member2Name ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                          }`}
                        />
                        {errors.member2Name && (
                          <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                            ⚠️ {errors.member2Name}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                          Other Member Phone <span className="text-cyberRed font-bold">*</span>
                        </label>
                        <div className="flex gap-2">
                          <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded select-none">
                            +91
                          </span>
                          <input
                            type="text"
                            name="member2Phone"
                            value={formData.member2Phone}
                            onChange={handleInputChange}
                            placeholder="Second member WhatsApp"
                            className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                              errors.member2Phone ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                            }`}
                          />
                        </div>
                        {errors.member2Phone && (
                          <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                            ⚠️ {errors.member2Phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL SECTION: MEMBER 3 DETAILS */}
                {tSize >= 3 && (
                  <div className="md:col-span-2 border border-cyberRed/20 bg-cyberRed/[0.02] p-4 rounded mt-2 space-y-4 animate-[fadeIn_0.4s_ease-out]">
                    <div className="font-orbitron text-xs text-cyberRed font-bold uppercase tracking-wider">// Member 03 Credentials</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                          Third Member Name <span className="text-cyberRed font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          name="member3Name"
                          value={formData.member3Name}
                          onChange={handleInputChange}
                          placeholder="Enter third member name"
                          className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                            errors.member3Name ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                          }`}
                        />
                        {errors.member3Name && (
                          <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                            ⚠️ {errors.member3Name}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                          Third Member Phone <span className="text-cyberRed font-bold">*</span>
                        </label>
                        <div className="flex gap-2">
                          <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded select-none">
                            +91
                          </span>
                          <input
                            type="text"
                            name="member3Phone"
                            value={formData.member3Phone}
                            onChange={handleInputChange}
                            placeholder="Third member WhatsApp"
                            className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                              errors.member3Phone ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                            }`}
                          />
                        </div>
                        {errors.member3Phone && (
                          <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                            ⚠️ {errors.member3Phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL SECTION: MEMBER 4 DETAILS */}
                {tSize >= 4 && (
                  <div className="md:col-span-2 border border-cyberRed/20 bg-cyberRed/[0.02] p-4 rounded mt-2 space-y-4 animate-[fadeIn_0.4s_ease-out]">
                    <div className="font-orbitron text-xs text-cyberRed font-bold uppercase tracking-wider">// Member 04 Credentials</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                          Fourth Member Name <span className="text-cyberRed font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          name="member4Name"
                          value={formData.member4Name}
                          onChange={handleInputChange}
                          placeholder="Enter fourth member name"
                          className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                            errors.member4Name ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                          }`}
                        />
                        {errors.member4Name && (
                          <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                            ⚠️ {errors.member4Name}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                          Fourth Member Phone <span className="text-cyberRed font-bold">*</span>
                        </label>
                        <div className="flex gap-2">
                          <span className="flex items-center bg-zinc-950/85 px-3 border border-zinc-800 text-xs text-zinc-500 font-mono rounded select-none">
                            +91
                          </span>
                          <input
                            type="text"
                            name="member4Phone"
                            value={formData.member4Phone}
                            onChange={handleInputChange}
                            placeholder="Fourth member WhatsApp"
                            className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                              errors.member4Phone ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                            }`}
                          />
                        </div>
                        {errors.member4Phone && (
                          <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                            ⚠️ {errors.member4Phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* SECTION 3: PROJECT CONCEPT DETAILS */}
            <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                3. Project Concept Details
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Domain Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Combat Domain / District Selection <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 outline-none focus:border-cyberRed transition-all duration-300 rounded"
                  >
                    <option value="AI IN AGRICULTURE">DISTRICT // 01 : AI IN AGRICULTURE</option>
                    <option value="AI IN HEALTHCARE">DISTRICT // 02 : AI IN HEALTHCARE</option>
                    <option value="AI IN EDUCATION TECH">DISTRICT // 03 : AI IN EDUCATION TECH</option>
                    <option value="AI IN GENDER EQUALITY">DISTRICT // 04 : AI IN GENDER EQUALITY</option>
                    <option value="AI IN OPEN INNOVATION">DISTRICT // 05 : AI IN OPEN INNOVATION</option>
                  </select>
                </div>

                {/* Project Title */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Project / Solution Title <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    placeholder="Enter project name or tactical project handle"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.projectTitle ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.projectTitle && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.projectTitle}
                    </span>
                  )}
                </div>

                {/* Problem Statement */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Domain Problem Statement <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Identify the core social, environmental, or civic problem statement you are tackling..."
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded resize-none ${
                      errors.problemStatement ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.problemStatement && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.problemStatement}
                    </span>
                  )}
                </div>

                {/* Proposed Solution */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Proposed Futuristic Solution <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <textarea
                    name="proposedSolution"
                    value={formData.proposedSolution}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Provide a breakdown of your proposed tech tool, adaptive logic, or architecture solution..."
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded resize-none ${
                      errors.proposedSolution ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.proposedSolution && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.proposedSolution}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: VERIFICATION & DEPOSITS */}
            <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-cyberRed font-orbitron text-sm font-bold tracking-wider mb-4 border-l-2 border-cyberRed pl-2 uppercase">
                4. Identity Upload & Payment Info
              </div>

              {/* College ID Upload (Merged all members) */}
              <div className="mb-6">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                  College ID Card Upload <span className="text-cyberRed font-bold">*</span>
                </label>
                <input
                  type="file"
                  name="idCardFile"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded file:mr-4 file:border-0 file:bg-cyberRed file:px-3 file:py-1.5 file:font-orbitron file:text-[10px] file:uppercase file:tracking-widest file:text-white ${
                    errors.idCardFile ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                  }`}
                />
                <span className="block mt-1 font-mono text-[8px] text-zinc-500 uppercase tracking-wider leading-relaxed">
                  ⚠️ Note: Merges all group members' college ID cards into a single PDF or image, and upload. Accept: PDF, JPG, PNG, WEBP. Max 10MB.
                </span>
                {errors.idCardFile && (
                  <span className="block mt-1.5 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                    ⚠️ {errors.idCardFile}
                  </span>
                )}
              </div>

              {/* BANK DETAILS GLOWING CARD */}
              <div className="border border-cyberRed/30 bg-[#0f0015]/95 p-5 rounded-lg mb-6 relative shadow-cyberGlow">
                <div className="absolute top-2.5 right-3 text-[8px] font-mono text-cyberRed tracking-widest animate-pulse">[ INITIATION DEPOSIT CHANNELS ]</div>
                <h4 className="font-orbitron text-xs font-bold text-white mb-3 uppercase tracking-wider">🏦 Indian Bank Official Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono text-zinc-300">
                  <div className="md:col-span-2 border-b border-cyberRed/20 pb-2 mb-1">
                    <span className="text-cyberRed font-bold text-sm uppercase">Registration Fee:</span> <span className="text-green-400 font-black text-sm tracking-wider bg-zinc-950 px-2.5 py-1 rounded border border-green-500/30">₹500 / Team</span>
                  </div>
                  <div><span className="text-zinc-500">Account Holder:</span> <span className="text-white font-bold">Principal, BMSITM</span></div>
                  <div><span className="text-zinc-500">SB Account No:</span> <span className="text-white font-bold text-green-400 tracking-wider">21096732049</span></div>
                  <div><span className="text-zinc-500">IFSC Code:</span> <span className="text-white font-bold text-green-400">IDIB000A682</span></div>
                  <div><span className="text-zinc-500">Bank Name:</span> <span className="text-white">Indian Bank</span></div>
                  <div><span className="text-zinc-500">Branch Name:</span> <span className="text-white">Avalahalli Bangalore - 560064</span></div>
                  <div><span className="text-zinc-500">E-mail Contact:</span> <span className="text-white">accountsdept@bmsit.in</span></div>
                  <div className="md:col-span-2 border-t border-cyberRed/20 pt-2 mt-1">
                    <span className="text-cyberRed font-bold">UPI ID:</span> <span className="text-green-400 font-bold tracking-widest bg-zinc-950/80 px-2 py-0.5 rounded border border-green-500/20">BMSIT@indianbk</span>
                  </div>
                </div>
              </div>

              {/* UTR Input & Screenshot Proof */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* UTR ID */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Payment ID UTR (12-Digit code) <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="paymentUtr"
                    value={formData.paymentUtr}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit transaction UTR"
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded ${
                      errors.paymentUtr ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.paymentUtr && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.paymentUtr}
                    </span>
                  )}
                </div>

                {/* Receipt Screenshot Upload */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Payment Receipt Proof Upload <span className="text-cyberRed font-bold">*</span>
                  </label>
                  <input
                    type="file"
                    name="paymentReceiptFile"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleReceiptFileChange}
                    className={`w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border outline-none transition-all duration-300 rounded file:mr-4 file:border-0 file:bg-cyberRed file:px-3 file:py-1.5 file:font-orbitron file:text-[10px] file:uppercase file:tracking-widest file:text-white ${
                      errors.paymentReceiptFile ? 'border-cyberRed bg-cyberRed/5' : 'border-zinc-800 focus:border-cyberRed'
                    }`}
                  />
                  {errors.paymentReceiptFile && (
                    <span className="block mt-1 font-mono text-[9px] text-cyberRed uppercase tracking-wide">
                      ⚠️ {errors.paymentReceiptFile}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Terms and Consent Checkbox */}
            <div className="mb-6 select-none font-mono text-[10px] text-zinc-400 space-y-1">
              <div>* By registering, your team agrees to participate with honor and maintain the ethical hacker conduct directives.</div>
            </div>

            {/* Red Submit Button */}
            <div className="pt-4 relative select-none">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative py-4 bg-cyberRed hover:bg-[#990024] font-orbitron font-extrabold text-base tracking-[0.2em] uppercase text-white shadow-cyberGlow hover:shadow-[0_0_40px_rgba(255,0,60,0.9)] border border-cyberRed transition-all duration-300 hover:scale-[1.01] transform active:scale-95 group overflow-hidden"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite_linear]"></span>
                {isSubmitting ? 'SECURELY RECORDING TEAM...' : 'AUTHORIZE REGISTRATION'}
              </button>
              
              <div className="absolute -bottom-5 left-0 right-0 flex justify-between font-mono text-[8px] text-zinc-600 px-1">
                <span>SYSTEM STATUS: CONSOLE SECURED</span>
                <span>SYSTEM TIME: {currentTime || 'ESTABLISHED'}</span>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* Submission Compilation Progress Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-cyberDark/95 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="glassmorphism max-w-sm w-full p-6 rounded-lg border border-cyberRed relative shadow-cyberGlowHeavy">
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>

            <div className="text-center font-mono">
              <div className="text-cyberRed text-lg font-bold font-orbitron tracking-wider mb-2 uppercase animate-pulse">
                // COMPILING TRANSMISSION //
              </div>
              
              <div className="w-full h-3 bg-zinc-900 border border-cyberRed/30 p-0.5 rounded overflow-hidden mb-4 relative">
                <div 
                  className="h-full bg-cyberRed transition-all duration-300 ease-out shadow-[0_0_6px_#ff003c]" 
                  style={{ width: `${((submitStep + 1) / submitSequenceSteps.length) * 100}%` }}
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
                <span>TRANSMITTING VIA ENCRYPTED HACKVERSE VPN</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
