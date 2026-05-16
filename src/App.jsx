import React, { useEffect, useState } from 'react';

function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [activeFaq, setActiveFaq] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [isExplored, setIsExplored] = useState(false);

  useEffect(() => {
    const targetDate = new Date('May 30, 2026 00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExplore = () => {
    setIsExplored(true);
    setTimeout(() => setShowNotif(true), 1000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  if (!isExplored) {
    return (
      <div className="intro-screen">
        <div className="site-bg"></div>
        <div className="scanlines"></div>
        <div className="intro-content">
          <p className="intro-presents">DEPT. OF MCA PRESENTS</p>
          <h1 className="intro-title">HACKVERSE 2.0</h1>
          <p className="intro-powered">Powered by</p>
          <h2 className="intro-team">HACKVERSE TEAM</h2>
          <button className="explore-btn" onClick={handleExplore}>
            Explore More &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background Elements */}
      <div className="site-bg"></div>
      <div className="rain-overlay"></div>
      <div className="scanlines"></div>

      {/* Simple Notification Banner */}
      {showNotif && (
        <div className="notif-banner">
          <span>REGISTRATIONS OPENING SOON — STAY TUNED</span>
          <button onClick={() => setShowNotif(false)}>×</button>
        </div>
      )}

      {/* Hero Section - Samurai Theme */}
      <section className="hero">
        {/* Holographic Screens */}
        <div className="hologram-screen screen-1">
          <p>// INITIALIZING SYSTEM...</p>
          <p>{'>'} LOADING CORE MODULES</p>
          <p>{'>'} SECURITY CHECK: OK</p>
          <p>{'>'} DATA ENCRYPTION: ACTIVE</p>
        </div>
        <div className="hologram-screen screen-2">
          <pre style={{ fontSize: '0.4rem' }}>
{`def build_future():
    while true:
        code_with_honor()
        build_the_future()`}
          </pre>
        </div>
        <div className="hologram-screen screen-3">
          <p>UPLINK: ESTABLISHED</p>
          <p>LATENCY: 12ms</p>
          <p>PACKETS: 100% RECEIVED</p>
        </div>

        <div className="v-sign left">ネオ東京</div>
        <div className="v-sign right">ハック 2.0</div>

        <h2 className="japanese-title">ハックバース 2.0</h2>
        <p className="event-meta">2026 CYBERNETIC HACKATHON // BANGALORE x NEO TOKYO // MAY</p>
        <h1 className="glitch-text" data-text="HACKVERSE 2.0">HACKVERSE 2.0</h1>
        <p className="tagline">TECH WITH HUMAN TOUCH</p>

        <div className="quotes">
          <p>"Code with Honor. Build the Future."</p>
          <p>Where sleepless minds engineer tomorrow.</p>
        </div>

        <a href="#countdown" className="btn-initialize">INITIALIZE PROTOCOL</a>
      </section>

      {/* Info Panels */}
      <section id="countdown">
        <div className="grid-container">
           <div className="card">
              <h3>ONLINE ROUND</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron' }}>27th MAY</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>The preliminary digital pitch phase. Present your neural concepts to the high command from anywhere in the world.</p>
           </div>
           <div className="card">
              <h3>OFFLINE FINALE</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron' }}>30th MAY</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>The grand physical standoff. The top 20 chosen teams will breach the perimeter at the Dept. of MCA for the final build.</p>
           </div>
           <div className="card">
              <h3>VENUE</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron' }}>Dept. of MCA</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>BMSIT&M, Yelahanka. Bangalore 560064. An authorized high-security innovation zone.</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--primary-red)', marginTop: '1rem', fontWeight: 800 }}>ACCESS PROTOCOLS REQUIRED</p>
           </div>
           <div className="card">
              <h3>ELIGIBILITY</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron' }}>2–4 MEMBERS</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '0.5rem' }}>Open to all current BCA and MCA students. Assemble your tactical unit and prepare for deployment.</p>
           </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 className="section-title">INITIALIZATION COMMENCES</h2>
          <div className="countdown-wrap horizontal-countdown">
            <div className="countdown-item">
              <span>{timeLeft.days.toString().padStart(2, '0')}</span>
              <span className="unit">Days</span>
            </div>
            <div className="countdown-item">
              <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="unit">Hours</span>
            </div>
            <div className="countdown-item">
              <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="unit">Minutes</span>
            </div>
            <div className="countdown-item">
              <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="unit">Seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Directive */}
      <section id="about" className="about-section">
        <div className="about-text" style={{ maxWidth: '100%', flex: 'none', textAlign: 'center' }}>
          <h2 className="section-title">MISSION DIRECTIVE</h2>
          <p style={{ fontSize: '1.5rem', lineHeight: 1.8, color: '#fff', fontWeight: 400, fontFamily: 'Rajdhani', margin: '0 auto', maxWidth: '900px' }}>
            Hackverse 2.0 is a <span style={{ color: 'var(--primary-red)', fontWeight: 700 }}>two-stage inter-college hackathon</span> challenging innovators to build meaningful technology. This edition calls you to tackle real-world problems across six high-impact domains. Whether designing for a rural classroom or an urban clinic — <span style={{ borderBottom: '2px solid var(--primary-red)' }}>your code has a consequence.</span>
          </p>
        </div>
      </section>

      <section style={{ padding: '50px 5vw' }}>
        <div className="grid-container">
           {[
             { id: '01', title: 'AI & MACHINE LEARNING', desc: 'Engineer explainable AI tools to eliminate bias in high-stakes automated decision-making. Build trust in the neural networks of the future.' },
             { id: '02', title: 'EDUCATION TECH', desc: 'Design adaptive, holographic learning platforms that personalize the educational experience for students in resource-scarce environments.' },
             { id: '03', title: 'HEALTHCARE', desc: 'Forge low-cost diagnostics and mental health support systems. Use code to bridge the gap in healthcare accessibility for underserved districts.' },
             { id: '04', title: 'GENDER EQUALITY', desc: 'Develop tactical solutions promoting safety, equal opportunity, and digital inclusion. Secure the rights of all citizens in the cyber-metropolis.' },
             { id: '05', title: 'AGRITECH', desc: 'Build autonomous crop monitoring and supply-chain transparency systems. Empower smallholder farmers with the power of high-tech data.' },
             { id: '06', title: 'OPEN INNOVATION', desc: 'The wild card. Build any solution creating profound social, environmental, or civic impact. Your vision. Your rules. Your rebellion.' }
           ].map((district) => (
             <div key={district.id} className="card">
                <p style={{ color: 'var(--primary-red)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.8rem', letterSpacing: '2px' }}>DISTRICT // {district.id}</p>
                <h3>{district.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', lineHeight: 1.6 }}>{district.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Rewards */}
      <section id="rewards">
        <h2 className="section-title">BOUNTY BOARD</h2>
        <div className="grid-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>2ND PLACE</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron' }}>₹12,000</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '1rem' }}>SILVER PROTOCOL REWARD</p>
          </div>
          <div className="card highlight" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem' }}>1ST PLACE</h3>
            <p style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary-red)', fontFamily: 'Orbitron' }}>₹20,000</p>
            <p style={{ fontSize: '1rem', color: '#fff', marginTop: '1rem', fontWeight: 800, letterSpacing: '4px' }}>CHAMPION BOUNTY</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>3RD PLACE</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', fontFamily: 'Orbitron' }}>₹8,000</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '1rem' }}>BRONZE PROTOCOL REWARD</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <h2 className="section-title">INTEL QUERY</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {[
            { q: "What exactly is Hackverse 2.0?", a: "Hackverse 2.0 is a high-octane inter-college hackathon hosted by the Dept. of MCA at BMSIT&M. It's a two-stage battle of wits where ancient discipline meets futuristic innovation. We challenge BCA and MCA students to build meaningful, human-centered technology that solves real-world problems in the cyber-metropolis." },
            { q: "Who is authorized to participate?", a: "Participation is exclusively open to currently enrolled BCA and MCA students from any recognized college. Whether you are a lone-wolf coder or a tactical team player, as long as you're a student in these streams, you're eligible to join the rebellion." },
            { q: "What are the tactical constraints on team size?", a: "Tactical units must consist of 2 to 4 members. We believe in the power of synergy—diverse skill sets coming together to breach complex problems. Choose your teammates wisely." },
            { q: "Will there be sustenance and connectivity provided?", a: "AFFIRMATIVE. We provide high-speed tactical Wi-Fi and full sustenance (meals and snacks) throughout the duration of the offline finale. All these resources are PROVIDED AT NO COST to the participants. Focus on your code; we'll handle the logistics." },
            { q: "Where and when is the final standoff?", a: "The final offline build-off will take place on May 30, 2026, at the Dept. of MCA, BMSIT&M, Yelahanka, Bangalore. Only the top 20 teams from the preliminary online pitch will be authorized to enter the venue." },
            { q: "What is the bounty for success?", a: "The high command has authorized a total prize pool of ₹40,000. The breakdown is as follows: 1st Place - ₹20,000, 2nd Place - ₹12,000, and 3rd Place - ₹8,000. Additionally, top performers gain massive industry exposure and networking opportunities." }
          ].map((item, idx) => (
            <div key={idx} className="faq-box" onClick={() => toggleFaq(idx)}>
              <div className="faq-q">
                {item.q}
                <span>{activeFaq === idx ? '−' : '+'}</span>
              </div>
              {activeFaq === idx && <div className="faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Command Center */}
      <section id="command">
        <h2 className="section-title">COMMAND CENTER</h2>
        <div className="grid-container">
           <div className="card">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>FACULTY COMMAND</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-red)' }}>Dr. M Sridevi</p>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Head of Department</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-red)', marginTop: '1.5rem' }}>Mr. Dwarakanath G V</p>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Assistant Professor</p>
           </div>
           <div className="card">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>STUDENT OPS</h3>
              <div className="ops-grid">
                 {[
                   { name: 'Srigouri', phone: '8123280889' },
                   { name: 'Chetan', phone: '9515997994' },
                   { name: 'Shehnaaz', phone: '8971388110' },
                   { name: 'Gnanesh', phone: '9535197496' }
                 ].map((stud) => (
                   <div key={stud.name} className="ops-item">
                      <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stud.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--primary-red)' }}>{stud.phone}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 20px', borderTop: '2px solid var(--primary-red)' }}>
        <h2 style={{ fontSize: '3rem', color: 'var(--primary-red)', fontFamily: 'Bebas Neue', marginBottom: '2rem' }}>JOIN THE REBELLION</h2>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" className="btn-initialize" style={{ background: 'var(--primary-red)', color: '#fff' }}>REGISTRATION LINK</a>
          <a href="#" className="btn-initialize">WHATSAPP GROUP</a>
        </div>
      </section>

      <footer>
        <p style={{ fontWeight: 600, letterSpacing: '4px', color: 'var(--text-gray)' }}>
          MADE BY <span style={{ color: 'var(--primary-red)' }}>DEPT. OF MCA</span>
        </p>
        <p style={{ opacity: 0.3, fontSize: '0.8rem', marginTop: '1rem' }}>
          © 2026 HACKVERSE 2.0 // BMSIT&M // ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
}

export default App;
