import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Smartphone,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  ListTodo,
  Video,
  X,
  RefreshCw,
  Zap,
  Calendar,
  Sparkles,
  Sliders,
  AlertCircle,
  Copy,
  Image
} from 'lucide-react';
import MediaLensTracker from './MediaLensTracker.jsx';

const INITIAL_SHOTS = [
  // LOBBY & PRE-SERVICE
  { id: 'lobby-ext', category: 'Lobby & Pre-Service', label: 'Building Exterior (People walking in, showing building footprint)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'lobby-greet', category: 'Lobby & Pre-Service', label: 'People being greeted & welcomed by smiling volunteers', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'lobby-life', category: 'Lobby & Pre-Service', label: 'Lobby Life (Broad overview, motion, high energy, laughing)', isCoLab: false, device: 'Main Cam & Phone', captured: false },
  { id: 'lobby-coffee', category: 'Lobby & Pre-Service', label: 'Authentic Connections (Close-ups of coffee conversations & hugs)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'lobby-family', category: 'Lobby & Pre-Service', label: 'Diverse Families (Young, old, multi-ethnic walking together)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'lobby-kids', category: 'Lobby & Pre-Service', label: 'Kids Check-in & Youth (Kids laughing, volunteers printing name tags)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'lobby-desk', category: 'Lobby & Pre-Service', label: 'Welcome Desk (Volunteer giving information packet to new guest)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },

  // WORSHIP
  { id: 'worship-team', category: 'Worship & Atmosphere', label: 'Worship Team Close-ups (Vocalists, musicians showing emotion)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'worship-crowd', category: 'Worship & Atmosphere', label: 'Congregation Response (Hands lifted high, wide/medium angle)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'worship-lights', category: 'Worship & Atmosphere', label: 'Atmosphere (Clean frame of stage lighting & haze)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'worship-silhouette', category: 'Worship & Atmosphere', label: 'Worship Silhouette (Backlit artistic shot of crowd with raised hands)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'worship-detail', category: 'Worship & Atmosphere', label: 'Instrumentalist Close-up (Focus on drum sticks, guitar strings, or keys)', isCoLab: false, device: 'My Phone (Video)', captured: false },

  // STAGE / TEACHING
  { id: 'stage-pastors', category: 'Teaching & Stage', label: 'Pastors on stage (Aim for smiles and high-energy expressions)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'stage-impact', category: 'Teaching & Stage', label: 'Wide room impact shot (Framed from back, full focused room)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'stage-notes', category: 'Teaching & Stage', label: 'Active Note-Taking (Close-up of hands writing on notepad or using church app)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'stage-speaker', category: 'Teaching & Stage', label: 'Speaker Gestures (Close-up of dynamic hand gestures and expressions)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },

  // RESPONSE & BAPTISM
  { id: 'response-prayer', category: 'Response & Post-Service', label: 'Altar Call Response (Wide or medium shot of front response time)', isCoLab: false, device: 'Main Cam (Photo)', captured: false },
  { id: 'response-candid', category: 'Response & Post-Service', label: 'Ministry Prayer (Quiet, respectful shot of team praying with individual)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'response-baptism-rise', category: 'Response & Post-Service', label: 'Baptism Immersion Moment (The splash, the rise, pure joy on face)', isCoLab: true, device: 'Main Cam (Photo)', captured: false },
  { id: 'response-baptism-candid', category: 'Response & Post-Service', label: 'Baptism Celebration (Family clapping, hugging post-immersion)', isCoLab: false, device: 'My Phone (Video)', captured: false },

  // SOCIAL MEDIA (VERTICAL / SHORT)
  { id: 'social-vibe', category: 'Social Media Video (Vertical)', label: 'Vibe Check (Snappy panning shots of crowd, smiles, high-fives)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'social-tracking', category: 'Social Media Video (Vertical)', label: 'Action Tracking (Walk/move smoothly with a subject in action)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'social-clap', category: 'Social Media Video (Vertical)', label: 'Worship Clapping (Tempo, crowd rhythm, clapping hands)', isCoLab: false, device: 'My Phone (Video)', captured: false },
  { id: 'social-huddle', category: 'Social Media Video (Vertical)', label: 'Volunteer Huddle (Teams praying or laughing together pre-service)', isCoLab: true, device: 'My Phone & Cam', captured: false },
  { id: 'social-exit', category: 'Social Media Video (Vertical)', label: 'Post-service Exits (Joyful chats walking out of the building)', isCoLab: false, device: 'My Phone (Video)', captured: false }
];

// const springTransition = { type: "spring", stiffness: 300, damping: 25 };

export default function App() {
  const [activeService, setActiveService] = useState(() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= 10 * 60 + 45 ? '11am' : '9am';
  });

  const [hasAutoSwitched, setHasAutoSwitched] = useState(() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= 10 * 60 + 45;
  });

  const [serviceData, setServiceData] = useState(() => {
    // Attempt to load from localStorage first
    const saved = localStorage.getItem('church-media-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrateShots = (loadedShots) => {
        const loadedMap = new Map(loadedShots.map(s => [s.id, s]));
        return INITIAL_SHOTS.map(initShot => {
          const loaded = loadedMap.get(initShot.id);
          return loaded ? { ...initShot, captured: loaded.captured } : initShot;
        });
      };
      
      if (parsed['9am'] && parsed['11am']) {
        parsed['9am'].shots = migrateShots(parsed['9am'].shots);
        parsed['11am'].shots = migrateShots(parsed['11am'].shots);
        return parsed;
      }
      return parsed;
    }
    
    return {
      '9am': { shots: JSON.parse(JSON.stringify(INITIAL_SHOTS)), baptisms: [], notes: '' },
      '11am': { shots: JSON.parse(JSON.stringify(INITIAL_SHOTS)), baptisms: [], notes: '' }
    };
  });

  const [activeTab, setActiveTab] = useState('checklist');
  const [newShotText, setNewShotText] = useState('');
  const [newShotCategory, setNewShotCategory] = useState('Lobby & Pre-Service');

  // Sandbox State
  const [sandboxSubject, setSandboxSubject] = useState('Worship Leader Close-up (Vocalist showing high emotion)');
  const [sandboxLighting, setSandboxLighting] = useState('Volumetric Stage Spotlights & Heavy Haze');
  const [sandboxAngle, setSandboxAngle] = useState('70mm Portrait (f/2.8 shallow depth-of-field portrait)');
  const [sandboxNuances, setSandboxNuances] = useState('');
  const [sandboxImage, setSandboxImage] = useState('');
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxLoadingMsg, setSandboxLoadingMsg] = useState('Interfacing with server...');
  const [sandboxIsFallback, setSandboxIsFallback] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const runClientSideDemoFallback = (subject, lighting, angle, customNuances, errorContext) => {
    const sub = (subject || '').toLowerCase();
    let imageUrl = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800'; // Default camera lens
    
    if (sub.includes('worship') || sub.includes('sing') || sub.includes('music') || sub.includes('guitar')) {
      imageUrl = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800'; // Worship stage light
    } else if (sub.includes('baptis') || sub.includes('water') || sub.includes('immersion')) {
      imageUrl = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800'; // Stream/Water/Light
    } else if (sub.includes('lobby') || sub.includes('greet') || sub.includes('welcom') || sub.includes('coffee') || sub.includes('people') || sub.includes('family')) {
      imageUrl = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800'; // Smiling people gathering
    } else if (sub.includes('preach') || sub.includes('pastor') || sub.includes('teach') || sub.includes('speaker') || sub.includes('note') || sub.includes('app')) {
      imageUrl = 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800'; // Stage speaker / podium
    }

    const mockPrompt = `[STANDALONE DEMO MODE - ${errorContext}] A professional cinematography capture of ${subject}. Styled with ${lighting} and framed as a ${angle}. Shot on a Nikon Z6 II with a Nikkor Z 24-70mm f/2.8 S lens, focal length at 50mm, f/2.8 aperture for shallow depth-of-field, creamy background bokeh, natural Nikon color science rendering, stage haze. ${customNuances ? 'Creative Nuances: ' + customNuances : ''}`;

    setSandboxImage(imageUrl);
    setSandboxPrompt(mockPrompt);
    setSandboxIsFallback(true);
    
    addToast('Operating in local standalone demo mode (secure backend not detected). Make sure to keep the "npm run dev" terminal running.', 'warning');
  };

  const generateReferenceImage = async () => {
    if (sandboxLoading) return;
    setSandboxLoading(true);
    setSandboxIsFallback(false);

    const messages = [
      'Connecting to secure backend server...',
      'Analyzing composition specifications...',
      'Optimizing scene cinematography blueprint...',
      'Defining camera lens, f-stop and bokeh recommendations...',
      'Structuring AI text instructions...',
      'Interfacing with Google Imagen 4.0 diffusion model...',
      'Generating photorealistic 1:1 preview mockup...',
      'Polishing render output and contrast layers...'
    ];

    let messageIndex = 0;
    setSandboxLoadingMsg(messages[0]);
    const msgInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setSandboxLoadingMsg(messages[messageIndex]);
    }, 1800);

    try {
      const response = await fetch('/api/sandbox/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: sandboxSubject,
          lighting: sandboxLighting,
          angle: sandboxAngle,
          custom_nuances: sandboxNuances
        })
      });

      if (response.status === 404) {
        clearInterval(msgInterval);
        runClientSideDemoFallback(sandboxSubject, sandboxLighting, sandboxAngle, sandboxNuances, 'Backend 404');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      clearInterval(msgInterval);

      if (data.success) {
        setSandboxImage(data.image_data);
        setSandboxPrompt(data.optimized_prompt);
        setSandboxIsFallback(!!data.isFallback);
        
        if (data.isFallback) {
          addToast('Visual generated using high-quality demonstration fallback image.', 'warning');
        } else {
          addToast('Visual composition reference rendered successfully!', 'success');
        }
      } else {
        throw new Error(data.error || 'Server error generating image');
      }
    } catch (error) {
      clearInterval(msgInterval);
      console.error('Sandbox generation error:', error);
      runClientSideDemoFallback(sandboxSubject, sandboxLighting, sandboxAngle, sandboxNuances, 'Backend Offline');
    } finally {
      setSandboxLoading(false);
    }
  };

  
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

  // Automatically switch active service tab to 11AM once time hits 10:45 AM
  useEffect(() => {
    const now = new Date(currentTime);
    const mins = now.getHours() * 60 + now.getMinutes();
    const threshold = 10 * 60 + 45; // 10:45 AM is 645 minutes since midnight

    if (mins >= threshold && !hasAutoSwitched) {
      setActiveService('11am');
      setHasAutoSwitched(true);
      addToast('Auto-switched to the 11:00 AM Service tab.', 'info');
    } else if (mins < threshold && hasAutoSwitched) {
      setHasAutoSwitched(false);
    }
  }, [currentTime, hasAutoSwitched]);

  const getElapsedSeconds = () => {
    const now = new Date(currentTime);
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Find the Sunday of the current week
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDay);
    
    // Start time: 9AM or 11AM on Sunday
    const start = new Date(sunday);
    start.setHours(activeService === '9am' ? 9 : 11, 0, 0, 0);
    
    // End time: 12:30PM on Sunday
    const end = new Date(sunday);
    end.setHours(12, 30, 0, 0);

    // If current time is before the service starts on Sunday
    if (now < start) {
      return 0;
    }
    
    // If current time is after the service ends on Sunday (or any later day in the week)
    if (now > end) {
      return Math.floor((end - start) / 1000);
    }
    
    // Return elapsed seconds during the service window
    return Math.floor((now - start) / 1000);
  };

  const formatTime = (totalSeconds) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const hrs = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    const formatted = `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
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



  const categories = [...new Set(INITIAL_SHOTS.map(s => s.category))];

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden font-sans selection:bg-blue-500/30 bg-[#0F0F0F] text-[#f3f4f6] transition-colors duration-500">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-[-1] bg-[#0F0F0F] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-[#2A2A2A] px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-gradient-to-tr from-blue-600 to-blue-500 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
              <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white font-outfit">OSC Media <span className="text-blue-500">Capture</span></h1>
              <p className="text-[10px] text-[#A0A0A0] font-bold tracking-widest uppercase">Live Agenda & Lens Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Service Toggle */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-1 rounded-xl flex items-center">
              {['9am', '11am'].map(srv => (
                <button 
                  key={srv}
                  onClick={() => setActiveService(srv)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeService === srv ? 'text-white' : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  {activeService === srv && (
                    <motion.div layoutId="service-bubble" className="absolute inset-0 bg-blue-600 rounded-lg shadow-md shadow-blue-500/20" style={{ zIndex: -1 }} />
                  )}
                  {srv}
                </button>
              ))}
            </div>

            {/* Run-Time Clock */}
            <div className="flex items-center gap-2 border px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-all duration-300 bg-[#1A1A1A] border-[#2A2A2A] text-white">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="w-[4.5rem] text-center">{formatTime(getElapsedSeconds())}</span>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-xl group-hover:bg-blue-600/20 transition-all" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-blue-400 mb-4">
                <ListTodo className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">Shot Progress</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white font-outfit">{completionPercent}%</span>
                <span className="text-sm font-medium text-[#A0A0A0]">({capturedShots} / {totalShots})</span>
              </div>
              <div className="w-full bg-[#2A2A2A] h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" 
                />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-950/40 to-[#1A1A1A] border border-blue-500/15 p-5 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Zap className="w-4 h-4 fill-blue-400" />
                <span className="text-xs font-bold tracking-widest uppercase">Focus Objective</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Gather <strong className="text-white">JOY</strong> & <strong className="text-white">LIFE</strong>. Zoom in on real emotional expressions, smiles, clapping, and raised hands.
              </p>
            </div>
            <button 
              onClick={resetServiceData}
              className="mt-4 flex items-center gap-1.5 w-fit text-[10px] font-bold text-[#A0A0A0] hover:text-rose-400 transition-colors uppercase tracking-wider relative z-10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset {activeService} Log
            </button>
          </motion.div>

        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2A2A2A] overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'checklist', label: 'Shot List', icon: <Camera className="w-4 h-4" />, count: `${capturedShots}/${totalShots}` },
            // { id: 'sandbox', label: 'Visual Sandbox', icon: <Sparkles className="w-4 h-4" />, count: null },
            { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" />, count: null },
            { id: 'notes', label: 'Notepad', icon: <Edit3 className="w-4 h-4" />, count: currentData.notes ? 'Saved' : null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 pt-2 px-5 text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== null && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600/20 text-blue-400' : 'bg-[#2A2A2A] text-[#A0A0A0]'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500" />
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
              <div className="glass-panel rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between text-xs text-[#A0A0A0]">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  <span>= Special Co-Lab Targets</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-950/40 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/20 font-semibold flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Main Cam</span>
                  <span className="bg-blue-900/10 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/15 font-semibold flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Mobile</span>
                </div>
              </div>

              {categories.map(category => {
                const categoryShots = currentData.shots.filter(s => s.category === category);
                if (categoryShots.length === 0) return null;

                return (
                  <div key={category} className="glass-card rounded-3xl overflow-hidden shadow-lg border border-[#2A2A2A]">
                    
                    <div className="bg-white/[0.01] px-6 py-4 border-b border-[#2A2A2A] flex justify-between items-center backdrop-blur-md">
                       <h3 className="font-extrabold text-sm tracking-wider uppercase text-white font-outfit flex items-center gap-2.5">
                        <span className="w-1.5 h-4 bg-gradient-to-b from-blue-600 to-blue-500 rounded-full" />
                        {category}
                      </h3>
                      <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-950/40 border border-blue-500/20 px-3 py-1 rounded-full">
                        {categoryShots.filter(s => s.captured).length}/{categoryShots.length}
                      </span>
                    </div>

                    <div className="divide-y divide-[#2A2A2A]">
                      {categoryShots.map(shot => (
                        <div 
                          key={shot.id} 
                          onClick={() => toggleShot(shot.id)}
                          className={`group p-5 flex items-start justify-between gap-4 cursor-pointer transition-all duration-300 hover:bg-white/[0.01] ${
                            shot.captured ? 'bg-black/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4 max-w-[85%]">
                            <button className={`mt-0.5 shrink-0 transition-transform duration-300 active:scale-90 ${shot.captured ? 'text-blue-400' : 'text-[#A0A0A0] group-hover:text-zinc-300'}`}>
                              {shot.captured ? <CheckCircle2 className="w-6 h-6 fill-blue-950" /> : <Circle className="w-6 h-6" />}
                            </button>

                            <div className="space-y-1.5">
                              <p className={`text-sm leading-relaxed transition-colors duration-300 ${shot.captured ? 'text-zinc-500' : 'text-zinc-200 font-medium group-hover:text-white'}`}>
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
                                    ? 'bg-blue-900/10 text-blue-300 border-blue-500/15' 
                                    : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
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

              <form onSubmit={addCustomShot} className="glass-card p-6 rounded-3xl shadow-lg border border-[#2A2A2A]">
                <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                  <span className="bg-white/5 p-1.5 rounded-lg border border-[#2A2A2A]"><Edit3 className="w-4 h-4 text-blue-500" /></span>
                  Add Personal Checkpoint
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input 
                    type="text" 
                    value={newShotText}
                    onChange={(e) => setNewShotText(e.target.value)}
                    placeholder="e.g. Catch the 11AM walkup response..."
                    className="bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all md:col-span-2 placeholder:text-zinc-600"
                  />
                  <select 
                    value={newShotCategory}
                    onChange={(e) => setNewShotCategory(e.target.value)}
                    className="bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm py-3.5 rounded-xl uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                >
                  Insert Custom Target
                </button>
              </form>
            </motion.div>
          )}

          {/* SANDBOX */}
          {activeTab === 'sandbox' && (
            <motion.div 
              key="sandbox"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-card p-6 rounded-3xl border border-[#2A2A2A] space-y-5">
                  <div>
                    <h3 className="font-black text-lg text-white font-outfit flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-blue-500" /> Composition Parameters
                    </h3>
                    <p className="text-xs text-[#A0A0A0] mt-1">Configure the physical environment, lens settings, and subject matter for the AI rendering.</p>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Target Subject</label>
                    <select
                      value={sandboxSubject}
                      onChange={(e) => setSandboxSubject(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option value="Worship Leader Close-up (Vocalist showing high emotion)">Worship Leader Close-up (Vocalist)</option>
                      <option value="Congregation Response (Raised hands, wide-angle stage visual)">Congregation Response (Hands Raised)</option>
                      <option value="Baptism Immersion (Water splash, raw joyful expressions)">Baptism Immersion (Water Splash)</option>
                      <option value="Lobby Volunteer (Friendly greetings, coffee station vibe)">Lobby Volunteer (Warm Welcome)</option>
                      <option value="Teaching Pastor (Dynamic stage gestures, preaching podium)">Teaching Pastor (Preaching stage)</option>
                      <option value="Youth Group Huddle (High-energy laughing and chatting)">Youth Group Huddle (High-energy)</option>
                    </select>
                  </div>

                  {/* Lighting Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Lighting Setup</label>
                    <select
                      value={sandboxLighting}
                      onChange={(e) => setSandboxLighting(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option value="Volumetric Stage Spotlights & Heavy Haze">Volumetric Stage Spots & Heavy Haze</option>
                      <option value="Dramatic High-Contrast Backlit Rim Light">Dramatic High-Contrast Backlit Rim Light</option>
                      <option value="Warm Golden Hour Sunlight Streaming In">Warm Golden Hour Sunlight</option>
                      <option value="Cool Ambient Wash with Neon Highlights">Cool Ambient Wash with Neon Highlights</option>
                      <option value="Bright Natural Clean Morning Light">Bright Natural Clean Morning Light</option>
                    </select>
                  </div>

                  {/* Lens Angle Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Angle & Framing</label>
                    <select
                      value={sandboxAngle}
                      onChange={(e) => setSandboxAngle(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option value="70mm Portrait (f/2.8 shallow depth-of-field portrait)">70mm Portrait (f/2.8 shallow bokeh)</option>
                      <option value="50mm Standard (f/2.8 natural narrative perspective)">50mm Standard (f/2.8 natural narrative)</option>
                      <option value="35mm Storytelling (f/4.0 moderate wide-angle)">35mm Storytelling (f/4.0 moderate wide)</option>
                      <option value="24mm Wide-Angle (f/5.6 deep focus room overview)">24mm Wide-Angle (f/5.6 room overview)</option>
                      <option value="Low-Angle Dynamic (35mm focal length at f/2.8 aperture)">Low-Angle Dynamic (35mm at f/2.8)</option>
                    </select>
                  </div>

                  {/* Creative Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Custom Nuances (Optional)</label>
                    <textarea
                      value={sandboxNuances}
                      onChange={(e) => setSandboxNuances(e.target.value)}
                      placeholder="e.g. Include blurred volunteer badge in foreground, lens flare, film grain, or specific color grading ideas..."
                      rows={3}
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm p-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-600 resize-none"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={generateReferenceImage}
                    disabled={sandboxLoading}
                    className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-4 rounded-xl uppercase tracking-wider transition-all duration-300 shadow-lg ${
                      sandboxLoading
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/25 active:scale-[0.98]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {sandboxLoading ? 'Rendering preview...' : 'Generate Reference Image'}
                  </button>
                </div>
              </div>

              {/* Viewport Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="glass-card rounded-3xl border border-[#2A2A2A] overflow-hidden flex flex-col relative">
                  
                  {/* Header info */}
                  <div className="px-6 py-4 border-b border-[#2A2A2A] flex justify-between items-center bg-white/[0.01]">
                    <h4 className="font-extrabold text-sm tracking-wider uppercase text-white font-outfit flex items-center gap-2">
                      <Image className="w-4 h-4 text-blue-500" />
                      Composition Preview Frame
                    </h4>
                    {sandboxIsFallback && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Demo Mode
                      </span>
                    )}
                  </div>

                  {/* 1:1 Rendering Frame */}
                  <div className="relative aspect-square w-full bg-black/60 flex items-center justify-center overflow-hidden">
                    {sandboxImage ? (
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={sandboxImage}
                        alt="AI Generated Composition Reference"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm">
                        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-full text-zinc-500">
                          <Camera className="w-10 h-10" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-300 font-outfit">Ready to Compose</p>
                        <p className="text-xs text-zinc-500">Select parameters on the left and generate a cinematic reference image to guide your live shot capture.</p>
                      </div>
                    )}

                    {/* Glassmorphic Loading Overlay */}
                    <AnimatePresence>
                      {sandboxLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-5"
                        >
                          {/* Premium Glowing Spinner */}
                          <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                          </div>
                          
                          <div className="space-y-1.5">
                            <p className="text-sm font-bold text-white tracking-wide">{sandboxLoadingMsg}</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Running Imagen Diffusion</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Director's Prompt Card */}
                {sandboxPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-3xl border border-[#2A2A2A] space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        AI Agent Optimized Cinematic Prompt
                      </h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sandboxPrompt);
                          addToast('Optimized prompt copied to clipboard!', 'success');
                        }}
                        className="text-[10px] font-bold text-[#A0A0A0] hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Prompt
                      </button>
                    </div>
                    <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-4 text-xs font-mono text-zinc-300 leading-relaxed max-h-40 overflow-y-auto">
                      {sandboxPrompt}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* CALENDAR */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MediaLensTracker />
            </motion.div>
          )}

          {/* NOTES */}
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6 rounded-3xl shadow-xl border border-[#2A2A2A]">
              <div className="mb-5">
                <h3 className="font-black text-lg text-white font-outfit flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" /> Live Scratchpad
                </h3>
                <p className="text-sm text-[#A0A0A0] mt-2">Jot down timestamps, camera settings, lens ideas, or reminders. Saves automatically.</p>
              </div>

              <textarea
                value={currentData.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="e.g. 
- 9:14 AM: Got perfect worship wide-angle
- Swap to 70-200mm lens for baptisms
- Mirrorless battery at 30%..."
                rows={10}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm p-5 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 font-mono leading-relaxed resize-none transition-all placeholder:text-zinc-600"
              />

              <div className="flex justify-between items-center text-xs mt-4">
                <span className="text-zinc-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-saving locally</span>
                <button 
                  onClick={() => {
                    if (window.confirm('Clear all notes?')) handleNotesChange('');
                  }}
                  className="text-zinc-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider"
                >
                  Clear Notes
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, opacity: 0 }}
              className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 pointer-events-auto border backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-300'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/80 border-amber-500/20 text-amber-300'
                  : toast.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/20 text-rose-300'
                  : 'bg-zinc-950/80 border-zinc-500/20 text-zinc-300'
              }`}
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {toast.type === 'error' && <X className="w-5 h-5 text-rose-400" />}
                {toast.type === 'info' && <Clock className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-[#A0A0A0] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
