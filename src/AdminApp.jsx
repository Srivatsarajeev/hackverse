import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

// Canvas falling particles for Admin Console
const AdminCanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const maxParticles = 60;
    const particles = [];

    class CodeParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.vy = 1 + Math.random() * 2;
        this.size = 1 + Math.random() * 2;
        this.char = Math.random() > 0.5 ? '1' : '0';
        this.opacity = 0.15 + Math.random() * 0.35;
      }
      update() {
        this.y += this.vy;
        if (this.y > height) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
        ctx.font = `${this.size * 5}px monospace`;
        ctx.fillText(this.char, this.x, this.y);
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new CodeParticle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(4, 0, 10, 0.25)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
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

export default function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  // Dashboard Stats & Registrations
  const [stats, setStats] = useState({ total: 0, gender_counts: {}, passout_counts: {} });
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedPassoutYear, setSelectedPassoutYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Modals & Details View
  const [activeParticipant, setActiveParticipant] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [systemAlert, setSystemAlert] = useState('');

  // 1. Fetch Stats & Registrations
  const fetchDashboardData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      // Fetch Stats
      const statsRes = await axios.get(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.success) {
        setStats({
          total: statsRes.data.total,
          gender_counts: statsRes.data.gender_counts || {},
          passout_counts: statsRes.data.passout_counts || {}
        });
      }

      // Fetch Registrations
      const regRes = await axios.get(`${API_BASE}/api/admin/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          gender: selectedGender,
          passout_year: selectedPassoutYear,
          page,
          limit
        }
      });
      if (regRes.data.success) {
        setRegistrations(regRes.data.data);
        setTotalPages(regRes.data.pages);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        handleLogout();
        triggerAlert("Security session expired. Please re-authenticate.");
      } else {
        triggerAlert("Mainframe error. Could not retrieve registrations.");
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, search, selectedGender, selectedPassoutYear, page]);

  // 2. Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter credential signatures.");
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    setShowAccessDenied(false);

    try {
      const res = await axios.post(`${API_BASE}/api/admin/login`, {
        username,
        password
      });
      if (res.data.success && res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
        setToken(res.data.token);
        setPage(1);
      }
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.detail || "Mainframe database connection breach.");
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 2500);
    } finally {
      setLoginLoading(false);
    }
  };

  // 3. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setUsername('');
    setPassword('');
    setRegistrations([]);
    setStats({ total: 0, gender_counts: {}, passout_counts: {} });
  };

  // 4. Handle Deleting registration
  const handleDeleteRegistration = async (participantId) => {
    try {
      const res = await axios.delete(`${API_BASE}/api/admin/registrations/${participantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        triggerAlert(`Participant ${participantId} has been purged from the database.`);
        setShowDeleteConfirm(null);
        setActiveParticipant(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      triggerAlert("De-registration sequence aborted. Mainframe error.");
    }
  };

  // 5. Trigger System Alert Flash
  const triggerAlert = (msg) => {
    setSystemAlert(msg);
    setTimeout(() => setSystemAlert(''), 4000);
  };

  // 6. Secure CSV and Excel Export Downloads
  const downloadReport = async (format) => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const fileType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = format === 'csv' ? '.csv' : '.xlsx';
      
      const blob = new Blob([res.data], { type: fileType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `hack4soc_roster${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      triggerAlert(` Roster list compiled in ${format.toUpperCase()} format and downloaded successfully.`);
    } catch (err) {
      console.error(err);
      triggerAlert(`Fail to build export file in ${format.toUpperCase()} format.`);
    }
  };

  return (
    <div className="relative min-h-screen py-8 px-4 md:px-8 font-rajdhani text-white bg-cyberDark overflow-hidden select-none">
      {/* Background elements */}
      <AdminCanvasBackground />
      <div className="absolute inset-0 bg-hologram-pattern opacity-15 pointer-events-none z-0"></div>
      <div className="scanline"></div>

      {/* System alert notification */}
      {systemAlert && (
        <div className="fixed top-6 right-6 z-50 glassmorphism border border-cyberRed px-6 py-3 rounded text-xs font-mono tracking-widest text-cyberRed animate-[shimmer_1.5s_infinite_linear] shadow-cyberGlowHeavy">
          ⚠️ // MAIN CONSOLE UPDATE //: {systemAlert}
        </div>
      )}

      {/* ACCESS DENIED ALARM POPUP */}
      {showAccessDenied && (
        <div className="fixed inset-0 z-50 bg-[#ff003c]/20 backdrop-blur-md flex items-center justify-center animate-pulse">
          <div className="bg-[#04000a] border-4 border-cyberRed p-8 text-center rounded-lg shadow-cyberGlowHeavy max-w-sm w-full mx-4">
            <div className="text-6xl text-cyberRed font-bold mb-4 font-orbitron animate-bounce">⚡</div>
            <h2 className="text-3xl font-orbitron font-black text-cyberRed tracking-wider mb-2">ACCESS DENIED</h2>
            <p className="font-mono text-zinc-400 text-xs uppercase tracking-widest leading-relaxed">
              Mainframe security breach. Credentials signature invalid. Access blocked by security countermeasures.
            </p>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* LOGIN SCREEN IF NOT AUTHENTICATED */}
        {!token ? (
          <div className="min-h-[80vh] flex flex-col justify-center items-center">
            
            <header className="text-center mb-8">
              <h1 className="font-orbitron font-black text-3xl md:text-4xl text-white tracking-widest mb-1 drop-shadow-[0_0_12px_#ff003c]">
                HACK4SOC 3.0
              </h1>
              <p className="font-mono text-cyberRed text-[0.65rem] uppercase tracking-[0.3em] font-bold">
                [ NEO TOKYO // CENTRAL MAINFRAME ]
              </p>
            </header>

            <form onSubmit={handleLogin} className="glassmorphism max-w-sm w-full p-6 md:p-8 rounded-lg border-2 border-cyberRed/30 relative shadow-cyberGlow">
              <div className="cyber-corner cyber-corner-tl"></div>
              <div className="cyber-corner cyber-corner-tr"></div>
              <div className="cyber-corner cyber-corner-bl"></div>
              <div className="cyber-corner cyber-corner-br"></div>

              <div className="text-center border-b border-cyberRed/20 pb-4 mb-6 font-mono text-[10px] text-zinc-500">
                ⚠️ SECURE LOGON SEQUENCE : SHADOW_CTRL
              </div>

              {loginError && (
                <div className="bg-cyberRed/10 border border-cyberRed/40 p-2.5 rounded text-[10px] font-mono text-cyberRed uppercase mb-4 text-center leading-tight">
                  ❌ {loginError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Operator Identity
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Username"
                    disabled={loginLoading}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 focus:border-cyberRed outline-none transition-all duration-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    Hologram Access Key
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Access Password"
                    disabled={loginLoading}
                    className="w-full bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-2.5 border border-zinc-800 focus:border-cyberRed outline-none transition-all duration-300 rounded"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full relative py-3 bg-cyberRed hover:bg-[#990024] font-orbitron font-extrabold text-xs tracking-[0.2em] uppercase text-white shadow-cyberGlow border border-cyberRed transition-all duration-300 transform active:scale-95 overflow-hidden"
              >
                {loginLoading ? "Synchronizing mainframe..." : "Authenticate Access"}
              </button>
            </form>

            <footer className="mt-8 text-center text-[9px] font-mono text-zinc-600">
              WARNING: UNAUTHORIZED ACCESS IS LOGGED IN THE MAIN DATA CHANNELS
            </footer>

          </div>
        ) : (
          
          /* ADMINISTRATIVE MAIN COMMAND CENTER DISPLAY */
          <div className="space-y-6">
            
            {/* Header console bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#04000a]/80 p-4 border border-cyberRed/25 rounded relative glassmorphism">
              <div className="cyber-corner cyber-corner-tl"></div>
              <div className="cyber-corner cyber-corner-tr"></div>
              <div className="cyber-corner cyber-corner-bl"></div>
              <div className="cyber-corner cyber-corner-br"></div>

              <div className="mb-2 md:mb-0 text-center md:text-left select-none">
                <div className="font-mono text-cyberRed text-[0.6rem] uppercase tracking-[0.2em] font-bold">
                  // DEPLOYED MAIN CORE CONTROL PANEL
                </div>
                <h1 className="font-orbitron font-black text-2xl text-white tracking-widest drop-shadow-[0_0_8px_#ff003c]">
                  HACK4SOC 3.0 MAIN DECRYPTION
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-500 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded uppercase">
                  📡 OPERATOR: <span className="text-cyberRed font-bold">SUPERADMIN</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="font-orbitron text-[10px] tracking-widest text-white border border-cyberRed px-4 py-1.5 hover:bg-cyberRed hover:shadow-cyberGlow transition duration-300"
                >
                  De-Authorize Session
                </button>
              </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              
              {/* Total Card */}
              <div className="md:col-span-2 glassmorphism border border-cyberRed/20 p-4 rounded relative flex flex-col justify-center items-center min-h-[120px]">
                <div className="cyber-corner cyber-corner-tl"></div>
                <div className="cyber-corner cyber-corner-tr"></div>
                <div className="absolute top-2 left-3 font-mono text-[9px] text-zinc-500 tracking-wider">TOTAL REGISTRATIONS</div>
                <div className="font-orbitron text-4xl font-black text-cyberRed animate-pulse drop-shadow-[0_0_12px_#ff003c] mt-2">
                  {stats.total}
                </div>
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1">operators connected</p>
              </div>

              {/* Gender Breakdown Breakdown */}
              <div className="md:col-span-2 glassmorphism border border-zinc-800/80 p-4 rounded relative flex flex-col justify-between min-h-[120px]">
                <div className="absolute top-2 left-3 font-mono text-[9px] text-zinc-500 tracking-wider">GENDER BREAKDOWN</div>
                <div className="grid grid-cols-2 gap-2 mt-5 text-center font-mono">
                  {Object.entries(stats.gender_counts || {}).map(([g, count]) => (
                    <div key={g} className="bg-zinc-950/70 p-1 border border-zinc-900 rounded">
                      <span className="text-[8px] text-zinc-500 block truncate uppercase">{g}</span>
                      <strong className="text-xs text-white font-orbitron">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passout Breakdown */}
              <div className="md:col-span-2 glassmorphism border border-zinc-800/80 p-4 rounded relative flex flex-col justify-between min-h-[120px]">
                <div className="absolute top-2 left-3 font-mono text-[9px] text-zinc-500 tracking-wider">PASSOUT COHORTS</div>
                <div className="grid grid-cols-3 gap-1 mt-5 text-center font-mono">
                  {Object.entries(stats.passout_counts || {}).slice(0, 6).map(([year, count]) => (
                    <div key={year} className="bg-zinc-950/70 p-1 border border-zinc-900 rounded">
                      <span className="text-[8px] text-zinc-500 block">{year}</span>
                      <strong className="text-[10px] text-cyberRed font-bold font-orbitron">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MAIN DATA SECTION */}
            <div className="glassmorphism p-5 rounded-lg border border-cyberRed/20 relative shadow-cyber">
              <div className="cyber-corner cyber-corner-tl"></div>
              <div className="cyber-corner cyber-corner-tr"></div>
              <div className="cyber-corner cyber-corner-bl"></div>
              <div className="cyber-corner cyber-corner-br"></div>

              {/* Filters & Actions Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5 pb-4 border-b border-zinc-800">
                
                {/* Search Inputs */}
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search name, email, WhatsApp, college..."
                    className="bg-zinc-950/90 text-white font-mono text-xs px-3 py-2 border border-zinc-800 focus:border-cyberRed outline-none transition rounded w-full md:w-64"
                  />

                  {/* Gender filter */}
                  <select
                    value={selectedGender}
                    onChange={(e) => { setSelectedGender(e.target.value); setPage(1); }}
                    className="bg-zinc-950/90 text-white font-mono text-xs px-3 py-2 border border-zinc-800 focus:border-cyberRed outline-none transition rounded cursor-pointer"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>

                  {/* Passout year filter */}
                  <select
                    value={selectedPassoutYear}
                    onChange={(e) => { setSelectedPassoutYear(e.target.value); setPage(1); }}
                    className="bg-zinc-950/90 text-white font-mono text-xs px-3 py-2 border border-zinc-800 focus:border-cyberRed outline-none transition rounded cursor-pointer"
                  >
                    <option value="">All Passout Years</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => downloadReport('csv')}
                    disabled={registrations.length === 0}
                    className="font-orbitron text-[10px] tracking-widest text-white border border-zinc-700 bg-zinc-950 px-4 py-2 hover:border-cyberRed hover:bg-[#ff003c]/5 hover:shadow-cyberGlow transition duration-300 disabled:opacity-40"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={() => downloadReport('excel')}
                    disabled={registrations.length === 0}
                    className="font-orbitron text-[10px] tracking-widest text-white border border-zinc-700 bg-zinc-950 px-4 py-2 hover:border-cyberRed hover:bg-[#ff003c]/5 hover:shadow-cyberGlow transition duration-300 disabled:opacity-40"
                  >
                    📊 Export Excel (.xlsx)
                  </button>
                </div>

              </div>

              {/* Data Grid Table */}
              <div className="overflow-x-auto">
                {dataLoading ? (
                  <div className="text-center py-16 font-mono text-zinc-500 animate-pulse tracking-widest text-xs">
                    ⚡ SYNCHRONIZING WITH CENTRAL HACK4SOC DATABASE...
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-16 font-mono text-zinc-500 uppercase tracking-widest text-xs">
                    📡 No participant signals detected in the mainframe.
                  </div>
                ) : (
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-cyberRed/30 text-cyberRed text-[9px] uppercase tracking-widest">
                        <th className="py-3 px-3">Participant ID</th>
                        <th className="py-3 px-3">Full Name</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">WhatsApp</th>
                        <th className="py-3 px-3">College</th>
                        <th className="py-3 px-3">Passout</th>
                        <th className="py-3 px-3 text-center">Control Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((p) => (
                        <tr 
                          key={p.participantId}
                          className="border-b border-zinc-900 hover:bg-[#ff003c]/5 transition duration-200 cursor-pointer"
                          onClick={() => setActiveParticipant(p)}
                        >
                          <td className="py-3.5 px-3 text-cyberRed font-bold font-orbitron">{p.participantId}</td>
                          <td className="py-3.5 px-3 font-semibold text-white">{p.fullName}</td>
                          <td className="py-3.5 px-3 text-zinc-300">{p.email}</td>
                          <td className="py-3.5 px-3 text-zinc-400">{p.whatsapp}</td>
                          <td className="py-3.5 px-3 text-zinc-300 truncate max-w-[150px]">{p.collegeName || "N/A"}</td>
                          <td className="py-3.5 px-3">
                            <span className="inline-block px-2 py-0.5 border border-zinc-800 bg-zinc-950/60 rounded text-[9px] uppercase tracking-wider font-bold">
                              {p.passoutYear || "N/A"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center items-center gap-3">
                              <button
                                onClick={() => setActiveParticipant(p)}
                                className="text-zinc-400 hover:text-white px-2 py-0.5 border border-zinc-800 hover:border-zinc-500 rounded text-[10px] uppercase font-bold"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(p.participantId)}
                                className="text-cyberRed hover:text-red-500 px-2 py-0.5 border border-cyberRed/30 hover:border-cyberRed rounded text-[10px] uppercase font-bold"
                              >
                                Purge
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center font-mono mt-5 pt-4 border-t border-zinc-900 select-none">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                    Showing Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="border border-zinc-800 px-3 py-1 rounded text-[10px] hover:border-cyberRed transition disabled:opacity-40"
                    >
                      &larr; PREV
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="border border-zinc-800 px-3 py-1 rounded text-[10px] hover:border-cyberRed transition disabled:opacity-40"
                    >
                      NEXT &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* PARTICIPANT BLUEPRINT MODAL PANEL */}
            {activeParticipant && (
              <div className="fixed inset-0 z-40 bg-[#04000a]/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glassmorphism max-w-2xl w-full p-6 md:p-8 border border-cyberRed rounded-lg relative max-h-[85vh] overflow-y-auto shadow-cyberGlowHeavy animate-[fadeIn_0.3s_ease-out]">
                  <div className="cyber-corner cyber-corner-tl"></div>
                  <div className="cyber-corner cyber-corner-tr"></div>
                  <div className="cyber-corner cyber-corner-bl"></div>
                  <div className="cyber-corner cyber-corner-br"></div>

                  <div className="flex justify-between items-start border-b border-cyberRed/20 pb-3 mb-5 font-mono">
                    <div>
                      <span className="text-cyberRed font-bold font-orbitron text-lg block">{activeParticipant.participantId}</span>
                      <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">// Hack4Soc Mainframe dossier</span>
                    </div>
                    <button
                      onClick={() => setActiveParticipant(null)}
                      className="text-zinc-500 hover:text-white text-xl font-bold cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="space-y-5 text-left font-mono">
                    {/* Basic specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/70 p-4 border border-zinc-900 rounded text-xs leading-relaxed">
                      <div>
                        <span className="text-zinc-500 uppercase block mb-0.5">Operator Name</span>
                        <strong className="text-white text-sm">{activeParticipant.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase block mb-0.5">Date of Birth / Gender</span>
                        <strong className="text-white text-sm">{activeParticipant.dob} ({activeParticipant.gender})</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase block mb-0.5">Location Vector</span>
                        <strong className="text-white text-sm">{activeParticipant.city}, {activeParticipant.state}, {activeParticipant.country}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase block mb-0.5">Occupation Status</span>
                        <strong className="text-cyberRed font-bold text-sm uppercase">{activeParticipant.occupation}</strong>
                      </div>
                    </div>

                    {/* Academic Profile */}
                    {activeParticipant.occupation === 'College Student' && (
                      <div className="text-xs">
                        <span className="text-cyberRed font-orbitron uppercase tracking-widest font-bold block mb-2">Academic Credentials:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#04000a]/80 p-4 border border-zinc-900 rounded">
                          <div className="md:col-span-2">
                            <span className="text-zinc-500">COLLEGE Name:</span> <strong className="text-white block mt-0.5">{activeParticipant.collegeName}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500">COLLEGE Location:</span> <strong className="text-zinc-300 block">{activeParticipant.collegeCity}, {activeParticipant.collegeState}, {activeParticipant.collegeCountry}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500">DEGREE & Stream:</span> <strong className="text-zinc-300 block">{activeParticipant.degree} - {activeParticipant.stream}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500">PASSOUT GRADUATION YEAR:</span> <strong className="text-cyberRed block">{activeParticipant.passoutYear}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Channels */}
                    <div className="text-xs">
                      <span className="text-cyberRed font-orbitron uppercase tracking-widest font-bold block mb-2">Comms & Broadcast Channels:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-[#04000a]/80 p-4 border border-zinc-900 rounded">
                        <div><span className="text-zinc-500">PRIMARY EMAIL:</span> <a href={`mailto:${activeParticipant.email}`} className="text-white underline hover:text-cyberRed block mt-0.5">{activeParticipant.email}</a></div>
                        <div><span className="text-zinc-500">WHATSAPP MOBILE:</span> <a href={`https://wa.me/${activeParticipant.whatsapp}`} target="_blank" rel="noreferrer" className="text-white underline hover:text-cyberRed block mt-0.5">{activeParticipant.whatsapp}</a></div>
                        {!activeParticipant.alternatePhoneSame && activeParticipant.alternatePhone && (
                          <div className="md:col-span-2"><span className="text-zinc-500">ALTERNATE MOBILE:</span> <strong className="text-zinc-300 block">{activeParticipant.alternatePhone}</strong></div>
                        )}
                      </div>
                    </div>

                    {/* Developer Profiles */}
                    <div className="text-xs">
                      <span className="text-cyberRed font-orbitron uppercase tracking-widest font-bold block mb-2">Cyber Intelligence Vector links:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeParticipant.githubUrl && (
                          <a
                            href={activeParticipant.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 border border-zinc-800 bg-zinc-950/60 hover:border-cyberRed hover:bg-cyberRed/5 transition rounded text-center block"
                          >
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-1">GitHub Interface</span>
                            <span className="text-white font-bold text-xs truncate block">{activeParticipant.githubUrl}</span>
                          </a>
                        )}
                        {activeParticipant.linkedinUrl && (
                          <a
                            href={activeParticipant.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 border border-zinc-800 bg-zinc-950/60 hover:border-cyberRed hover:bg-cyberRed/5 transition rounded text-center block"
                          >
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-1">LinkedIn Signal</span>
                            <span className="text-white font-bold text-xs truncate block">{activeParticipant.linkedinUrl}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Consents vectors */}
                    <div className="text-[10px] text-zinc-500 border-t border-zinc-900 pt-3">
                      <div>// termsAccepted: <span className={activeParticipant.termsAccepted ? "text-green-500 font-bold" : "text-cyberRed font-bold"}>{activeParticipant.termsAccepted ? "TRUE" : "FALSE"}</span></div>
                      <div>// communicationsAccepted: <span className={activeParticipant.communicationsAccepted ? "text-green-500 font-bold" : "text-cyberRed font-bold"}>{activeParticipant.communicationsAccepted ? "TRUE" : "FALSE"}</span></div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span>SIGNUP DATE PROTOCOL: {new Date(activeParticipant.timestamp).toLocaleString()}</span>
                      <button
                        onClick={() => setShowDeleteConfirm(activeParticipant.participantId)}
                        className="text-cyberRed hover:text-red-500 border border-cyberRed/30 hover:border-cyberRed px-4 py-2 font-bold uppercase rounded transition"
                      >
                        Purge Operator
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* DELETE PURGE CONFIRM MODAL */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 bg-[#04000a]/95 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#04000a] border-2 border-cyberRed p-6 text-center rounded shadow-cyberGlowHeavy max-w-sm w-full relative">
                  <h3 className="text-lg font-orbitron font-extrabold text-cyberRed uppercase tracking-wider mb-2">Purge Request</h3>
                  <p className="font-mono text-xs text-zinc-400 leading-relaxed mb-6 uppercase">
                    Are you absolutely sure you want to permanently erase operator <strong className="text-white">{showDeleteConfirm}</strong> from the database? This action is irreversible.
                  </p>
                  <div className="flex gap-4 justify-center font-orbitron text-xs">
                    <button
                      onClick={() => handleDeleteRegistration(showDeleteConfirm)}
                      className="px-5 py-2 bg-cyberRed hover:bg-[#990024] text-white shadow-cyberGlow transition duration-300 font-bold uppercase"
                    >
                      PURGE DATA
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-5 py-2 border border-zinc-700 text-zinc-400 hover:text-white transition duration-300 font-bold uppercase"
                    >
                      ABORT
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
