import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Smartphone,
  CheckCircle2,
  Circle,
  Clock,
  Droplets,
  Edit3,
  ListTodo,
  Video,
  X,
  RefreshCw,
  Zap,
  Calendar
} from 'lucide-react';
import MediaLensTracker from './MediaLensTracker.jsx';

const INITIAL_SHOTS = [
  // LOBBY & PRE-SERVICE
  { id: 'lobby-ext', category: 'Lobby & Pre-Service', label: 'Building Exterior (People walking in, showing building footprint)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'lobby-greet', category: 'Lobby & Pre-Service', label: 'People being greeted & welcomed by smiling volunteers', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'lobby-life', category: 'Lobby & Pre-Service', label: 'Lobby Life (Broad overview, motion, high energy, laughing)', isCoLab: false, device: 'Main Cam & Phone', captured: false },
  { id: 'lobby-coffee', category: 'Lobby & Pre-Service', label: 'Authentic Connections (Close-ups of coffee conversations & hugs)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'lobby-family', category: 'Lobby & Pre-Service', label: 'Diverse Families (Young, old, multi-ethnic walking together)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'lobby-kids', category: 'Lobby & Pre-Service', label: 'Kids & Youth (Running, playing, high-fiving volunteers)', isCoLab: false, device: 'My Phone (Video)', captured: false },

  // WORSHIP
  { id: 'worship-team', category: 'Worship & Atmosphere', label: 'Worship Team Close-ups (Vocalists, musicians showing emotion)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'worship-crowd', category: 'Worship & Atmosphere', label: 'Congregation Response (Hands lifted high, wide/medium angle)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'worship-lights', category: 'Worship & Atmosphere', label: 'Atmosphere (Clean frame of stage lighting & haze)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },

  // STAGE / TEACHING
  { id: 'stage-pastors', category: 'Teaching & Stage', label: 'Pastors on stage (Aim for smiles and high-energy expressions)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'stage-impact', category: 'Teaching & Stage', label: 'Wide room impact shot (Framed from back, full focused room)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },

  // SOCIAL MEDIA (VERTICAL / SHORT)
  { id: 'social-vibe', category: 'Social Media Video (Vertical)', label: 'Vibe Check (Snappy panning shots of crowd, smiles, high-fives)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'social-tracking', category: 'Social Media Video (Vertical)', label: 'Action Tracking (Walk/move smoothly with a subject in action)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'social-clap', category: 'Social Media Video (Vertical)', label: 'Worship Clapping (Tempo, crowd rhythm, clapping hands)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'social-huddle', category: 'Social Media Video (Vertical)', label: 'Volunteer Huddle (Teams praying or laughing together pre-service)', isCoLab: true, device: 'My Phone & Cam', captured: false },
  { id: 'social-exit', category: 'Social Media Video (Vertical)', label: 'Post-service Exits (Joyful chats walking out of the building)', isCoLab: false, device: 'My Phone (Video)', captured: false }
];

// const springTransition = { type: "spring", stiffness: 300, damping: 25 };

export default function App() {
  const [activeService, setActiveService] = useState('9am');

  const [serviceData, setServiceData] = useState(() => {
    // Attempt to load from localStorage first
    const saved = localStorage.getItem('church-media-state');
    if (saved) return JSON.parse(saved);
    
    return {
      '9am': { shots: JSON.parse(JSON.stringify(INITIAL_SHOTS)), baptisms: [], notes: '' },
      '11am': { shots: JSON.parse(JSON.stringify(INITIAL_SHOTS)), baptisms: [], notes: '' }
    };
  });

  const [activeTab, setActiveTab] = useState('checklist');
  const [newShotText, setNewShotText] = useState('');
  const [newShotCategory, setNewShotCategory] = useState('Lobby & Pre-Service');
  const [newBaptismName, setNewBaptismName] = useState('');
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Save state to local storage on change
  useEffect(() => {
    localStorage.setItem('church-media-state', JSON.stringify(serviceData));
  }, [serviceData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedSeconds = () => {
    const start = new Date(currentTime);
    start.setHours(activeService === '9am' ? 9 : 11, 0, 0, 0);
    return Math.floor((currentTime - start) / 1000);
  };

  const formatTime = (totalSeconds) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const hrs = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    
    let formattedMins = hrs > 0 ? String(mins).padStart(2, '0') : String(mins);
    let result = `${hrs > 0 ? String(hrs) + ':' : ''}${formattedMins}:${String(secs).padStart(2, '0')}`;
    
    return isNegative ? `-${result}` : result;
  };

  const currentData = serviceData[activeService];

  const toggleShot = (shotId) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Small haptic feedback
    }
    setServiceData(prev => {
      const updatedShots = prev[activeService].shots.map(s => 
        s.id === shotId ? { ...s, captured: !s.captured } : s
      );
      return { ...prev, [activeService]: { ...prev[activeService], shots: updatedShots } };
    });
  };

  const addCustomShot = (e) => {
    e.preventDefault();
    if (!newShotText.trim()) return;

    const newShot = {
      id: `custom-${Date.now()}`,
      category: newShotCategory,
      label: newShotText.trim(),
      isCoLab: false,
      device: 'Main Cam & Phone',
      captured: false
    };

    setServiceData(prev => ({
      ...prev,
      [activeService]: {
        ...prev[activeService],
        shots: [...prev[activeService].shots, newShot]
      }
    }));
    setNewShotText('');
  };

  const toggleBaptismMedia = (id, field) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]);
    }
    setServiceData(prev => {
      const updatedBaps = prev[activeService].baptisms.map(b => 
        b.id === id ? { ...b, [field]: !b[field] } : b
      );
      return { ...prev, [activeService]: { ...prev[activeService], baptisms: updatedBaps } };
    });
  };

  const addBaptism = (e) => {
    e.preventDefault();
    const name = newBaptismName.trim() || `Candidate ${currentData.baptisms.length + 1}`;
    const newBap = { id: Date.now(), name, photo: false, video: false };

    setServiceData(prev => ({
      ...prev,
      [activeService]: {
        ...prev[activeService],
        baptisms: [...prev[activeService].baptisms, newBap]
      }
    }));
    setNewBaptismName('');
  };

  const removeBaptism = (id) => {
    setServiceData(prev => ({
      ...prev,
      [activeService]: {
        ...prev[activeService],
        baptisms: prev[activeService].baptisms.filter(b => b.id !== id)
      }
    }));
  };

  const handleNotesChange = (text) => {
    setServiceData(prev => ({ ...prev, [activeService]: { ...prev[activeService], notes: text } }));
  };

  const resetServiceData = () => {
    if (window.confirm(`Are you sure you want to reset all progress for the ${activeService.toUpperCase()} service?`)) {
      setServiceData(prev => ({
        ...prev,
        [activeService]: { shots: JSON.parse(JSON.stringify(INITIAL_SHOTS)), baptisms: [], notes: '' }
      }));
    }
  };

  const totalShots = currentData.shots.length;
  const capturedShots = currentData.shots.filter(s => s.captured).length;
  const completionPercent = totalShots > 0 ? Math.round((capturedShots / totalShots) * 100) : 0;

  const totalBaptisms = currentData.baptisms.length;
  const completedBaptisms = currentData.baptisms.filter(b => b.photo && b.video).length;

  const categories = [...new Set(INITIAL_SHOTS.map(s => s.category))];

  return (
    <div className={`min-h-screen pb-20 overflow-x-hidden font-sans selection:bg-cyan-500/30 transition-colors duration-500 ${
      activeTab === 'lens-tracker' ? 'bg-[#0F0F0F] text-[#f3f4f6]' : 'text-slate-100'
    }`}>
      
      {/* Background Ambience */}
      {activeTab === 'lens-tracker' ? (
        <div className="fixed inset-0 z-[-1] bg-[#0F0F0F] pointer-events-none transition-all duration-500">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
      ) : (
        <div className="fixed inset-0 z-[-1] bg-slate-950 pointer-events-none transition-all duration-500">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-cyan-500/20">
              <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white font-outfit">Media<span className="text-cyan-400">Companion</span></h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Live Shooting Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Service Toggle */}
            <div className="bg-slate-900/80 border border-slate-700/50 p-1 rounded-xl flex items-center">
              {['9am', '11am'].map(srv => (
                <button 
                  key={srv}
                  onClick={() => setActiveService(srv)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeService === srv ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {activeService === srv && (
                    <motion.div layoutId="service-bubble" className="absolute inset-0 bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/20" style={{ zIndex: -1 }} />
                  )}
                  {srv}
                </button>
              ))}
            </div>

            {/* Run-Time Clock */}
            <div className="flex items-center gap-2 border px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-all duration-300 bg-slate-900/80 border-slate-700/50 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span className="w-[4.5rem] text-center">{formatTime(getElapsedSeconds())}</span>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-cyan-400 mb-4">
                <ListTodo className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">Shot Progress</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white font-outfit">{completionPercent}%</span>
                <span className="text-sm font-medium text-slate-400">({capturedShots} / {totalShots})</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" 
                />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 mb-4">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">Baptisms Tracked</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white font-outfit">{completedBaptisms} / {totalBaptisms}</span>
                <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">Ready</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 font-medium leading-relaxed">
                Aim for high-shutter stills + vertical clips. Don't run long videos.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-5 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Zap className="w-4 h-4 fill-indigo-400" />
                <span className="text-xs font-bold tracking-widest uppercase">Focus Objective</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Gather <strong className="text-white">JOY</strong> & <strong className="text-white">LIFE</strong>. Zoom in on real emotional expressions, smiles, clapping, and raised hands.
              </p>
            </div>
            <button 
              onClick={resetServiceData}
              className="mt-4 flex items-center gap-1.5 w-fit text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-colors uppercase tracking-wider relative z-10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset {activeService} Log
            </button>
          </motion.div>

        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'checklist', label: 'Shot List', icon: <Camera className="w-4 h-4" />, count: `${capturedShots}/${totalShots}` },
            { id: 'baptisms', label: 'Baptisms', icon: <Droplets className="w-4 h-4" />, count: `${completedBaptisms}/${totalBaptisms}` },
            { id: 'lens-tracker', label: 'Lens Tracker', icon: <Calendar className="w-4 h-4" />, count: null },
            { id: 'notes', label: 'Notepad', icon: <Edit3 className="w-4 h-4" />, count: currentData.notes ? 'Saved' : null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 pt-2 px-5 text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== null && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content Panels */}
        <AnimatePresence mode="wait">
          
          {/* CHECKLIST */}
          {activeTab === 'checklist' && (
            <motion.div 
              key="checklist"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-panel rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  <span>= Special Co-Lab Targets</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-cyan-950/50 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-semibold flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Main Cam</span>
                  <span className="bg-indigo-950/50 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-semibold flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Mobile</span>
                </div>
              </div>

              {categories.map(category => {
                const categoryShots = currentData.shots.filter(s => s.category === category);
                if (categoryShots.length === 0) return null;

                return (
                  <div key={category} className="glass-card rounded-3xl overflow-hidden shadow-lg border border-white/5">
                    
                    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                      <h3 className="font-extrabold text-sm tracking-wider uppercase text-white font-outfit flex items-center gap-2.5">
                        <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
                        {category}
                      </h3>
                      <span className="text-[10px] font-mono text-cyan-200 font-bold bg-cyan-950/50 border border-cyan-500/20 px-3 py-1 rounded-full">
                        {categoryShots.filter(s => s.captured).length}/{categoryShots.length}
                      </span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {categoryShots.map(shot => (
                        <div 
                          key={shot.id} 
                          onClick={() => toggleShot(shot.id)}
                          className={`group p-5 flex items-start justify-between gap-4 cursor-pointer transition-all duration-300 hover:bg-white/[0.03] ${
                            shot.captured ? 'bg-black/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4 max-w-[85%]">
                            <button className={`mt-0.5 shrink-0 transition-transform duration-300 active:scale-90 ${shot.captured ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                              {shot.captured ? <CheckCircle2 className="w-6 h-6 fill-cyan-950" /> : <Circle className="w-6 h-6" />}
                            </button>

                            <div className="space-y-1.5">
                              <p className={`text-sm leading-relaxed transition-colors duration-300 ${shot.captured ? 'text-slate-500' : 'text-slate-200 font-medium group-hover:text-white'}`}>
                                {shot.label}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {shot.isCoLab && (
                                  <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                                    ⭐ Co-Lab
                                  </span>
                                )}
                                <span className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded border ${
                                  shot.device.includes('Phone') 
                                    ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/20' 
                                    : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/20'
                                }`}>
                                  {shot.device.includes('Phone') ? <Smartphone className="w-2.5 h-2.5" /> : <Camera className="w-2.5 h-2.5" />}
                                  {shot.device}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <form onSubmit={addCustomShot} className="glass-card p-6 rounded-3xl shadow-lg border border-white/5">
                <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                  <span className="bg-white/10 p-1.5 rounded-lg"><Edit3 className="w-4 h-4 text-cyan-400" /></span>
                  Add Personal Checkpoint
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input 
                    type="text" 
                    value={newShotText}
                    onChange={(e) => setNewShotText(e.target.value)}
                    placeholder="e.g. Catch the 11AM walkup response..."
                    className="bg-slate-900/50 border border-slate-700/50 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all md:col-span-2 placeholder:text-slate-600"
                  />
                  <select 
                    value={newShotCategory}
                    onChange={(e) => setNewShotCategory(e.target.value)}
                    className="bg-slate-900/50 border border-slate-700/50 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                >
                  Insert Custom Target
                </button>
              </form>
            </motion.div>
          )}

          {/* BAPTISMS */}
          {activeTab === 'baptisms' && (
            <motion.div key="baptisms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
                <div className="bg-white/5 px-6 py-5 border-b border-white/5 backdrop-blur-md">
                  <h3 className="font-bold text-sm text-white uppercase flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Baptism Roster ({currentData.baptisms.length})
                  </h3>
                </div>

                {currentData.baptisms.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Droplets className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-sm font-medium text-white">No candidates listed for {activeService}.</p>
                    <p className="text-xs mt-2">Add names below to track capture state.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    <AnimatePresence>
                      {currentData.baptisms.map(bap => {
                        const finished = bap.photo && bap.video;
                        return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={bap.id} 
                            className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-500 ${
                              finished ? 'bg-emerald-500/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                finished ? 'bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'
                              }`}>
                                {finished ? <CheckCircle2 className="w-5 h-5" /> : <Droplets className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold text-base text-white font-outfit">{bap.name}</p>
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${finished ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {finished ? '⭐ Ready for Post-Process' : 'Pending Capture'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleBaptismMedia(bap.id, 'photo')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-300 active:scale-95 ${
                                  bap.photo 
                                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25' 
                                    : 'bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/50'
                                }`}
                              >
                                <Camera className="w-4 h-4" /> Photo
                              </button>

                              <button
                                onClick={() => toggleBaptismMedia(bap.id, 'video')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-300 active:scale-95 ${
                                  bap.video 
                                    ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/25' 
                                    : 'bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-white hover:border-indigo-500/50'
                                }`}
                              >
                                <Video className="w-4 h-4" /> Video
                              </button>

                              <button 
                                onClick={() => removeBaptism(bap.id)}
                                className="p-2.5 ml-1 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <form onSubmit={addBaptism} className="glass-card p-6 rounded-3xl shadow-lg border border-white/5">
                <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                  <span className="bg-white/10 p-1.5 rounded-lg"><Droplets className="w-4 h-4 text-emerald-400" /></span>
                  Register Candidate
                </h4>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newBaptismName}
                    onChange={(e) => setNewBaptismName(e.target.value)}
                    placeholder="e.g. Dave Harrison..."
                    className="bg-slate-900/50 border border-slate-700/50 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 flex-1 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-sm px-6 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                  >
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* LENS TRACKER */}
          {activeTab === 'lens-tracker' && (
            <motion.div
              key="lens-tracker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MediaLensTracker />
            </motion.div>
          )}

          {/* NOTES */}
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6 rounded-3xl shadow-xl border border-white/5">
              <div className="mb-5">
                <h3 className="font-black text-lg text-white font-outfit flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-400" /> Live Scratchpad
                </h3>
                <p className="text-sm text-slate-400 mt-2">Jot down timestamps, camera settings, lens ideas, or reminders. Saves automatically.</p>
              </div>

              <textarea
                value={currentData.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="e.g. 
- 9:14 AM: Got perfect worship wide-angle
- Swap to 70-200mm lens for baptisms
- Mirrorless battery at 30%..."
                rows={10}
                className="w-full bg-slate-900/80 border border-slate-700/50 text-white text-sm p-5 rounded-2xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 font-mono leading-relaxed resize-none transition-all placeholder:text-slate-600"
              />

              <div className="flex justify-between items-center text-xs mt-4">
                <span className="text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-saving locally</span>
                <button 
                  onClick={() => {
                    if (window.confirm('Clear all notes?')) handleNotesChange('');
                  }}
                  className="text-slate-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider"
                >
                  Clear Notes
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

    </div>
  );
}
