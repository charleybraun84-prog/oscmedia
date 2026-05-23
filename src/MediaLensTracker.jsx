import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckSquare, 
  Square,
  Sparkles,
  Settings,
  RefreshCw,
  Info,
  Droplet,
  Heart,
  Camera,
  Layers,
  Sliders,
  AlertCircle
} from 'lucide-react';

// Pre-defined checklists and tips for each photography event type
const EVENT_GEAR_CONFIG = {
  BAPTISM: {
    badgeText: 'Baptism Event',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    icon: <Droplet className="w-5 h-5 text-blue-400" />,
    checklist: [
      'Fast Wide-to-Standard Zoom (e.g. 24-70mm f/2.8)',
      'Waterproof Camera Shield',
      'Polarizer Lens Filter',
      'High Action Shutter (1/500s+)'
    ],
    strategyTip: 'Maintain 45-degree angle; capture immersion rise.'
  },
  DEDICATION: {
    badgeText: 'Dedication Ceremony',
    badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    icon: <Heart className="w-5 h-5 text-purple-400" />,
    checklist: [
      'Portrait Prime (e.g. 85mm f/1.4)',
      'Electronic Silent Shutter',
      'Ambient Light Exposure Profiles',
      'Continuous AF Tracking'
    ],
    strategyTip: 'Prioritize candid profiles; use telephoto to avoid disruption.'
  },
  DEFAULT: {
    badgeText: 'Media Assignment',
    badgeClass: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    icon: <Camera className="w-5 h-5 text-zinc-400" />,
    checklist: [
      'Secondary Camera Body',
      'Dual Slot Caching',
      'Microfiber Cloth'
    ],
    strategyTip: 'Arrive 20 minutes early; pre-set custom Kelvin balance.'
  }
};

// Generate realistic mock calendar events relative to the current date/time
const generateMockEvents = () => {
  const now = new Date();
  
  // Format dates: event 1 today, event 2 tomorrow, event 3 day after, etc.
  const dateToday = new Date(now);
  dateToday.setHours(10, 0, 0, 0);

  const dateTodayLater = new Date(now);
  dateTodayLater.setHours(14, 30, 0, 0);

  const dateTomorrow = new Date(now);
  dateTomorrow.setDate(now.getDate() + 1);
  dateTomorrow.setHours(9, 30, 0, 0);

  const dateWeekend = new Date(now);
  dateWeekend.setDate(now.getDate() + 2);
  dateWeekend.setHours(11, 0, 0, 0);

  return [
    {
      id: 'mock-bap-1',
      summary: 'OSC Media - Baptism: Harrison Family',
      description: 'Photography session for the baptism of the Harrison family. Focus on immersion moments and the surrounding emotional support from relatives.',
      location: 'Baptistry Pool / Main Auditorium',
      start: { dateTime: dateToday.toISOString() },
      end: { dateTime: new Date(dateToday.getTime() + 45 * 60000).toISOString() }
    },
    {
      id: 'mock-rehearsal',
      summary: 'OSC Media - Worship Team Rehearsal',
      description: 'Capture candid profiles of vocalists and instrumentalists. Practice slow pans for vertical videos, testing ambient light conditions.',
      location: 'Stage / Sanctuary',
      start: { dateTime: dateTodayLater.toISOString() },
      end: { dateTime: new Date(dateTodayLater.getTime() + 60 * 60000).toISOString() }
    },
    {
      id: 'mock-ded-1',
      summary: 'OSC Media - Dedication: Chloe Madison',
      description: 'Dedication service. Quiet environment required. Capture interactions with parents and baby without using flashes or making mechanical shutter noise.',
      location: 'Main Sanctuary Stage',
      start: { dateTime: dateTomorrow.toISOString() },
      end: { dateTime: new Date(dateTomorrow.getTime() + 30 * 60000).toISOString() }
    },
    {
      id: 'mock-bap-2',
      summary: 'OSC Media - Baptism: Sarah Jenkins',
      description: 'Baptism capture during 11AM service. High volume event, speed is key. Ensure shield is on and double-check exposure settings under stage lights.',
      location: 'Baptistry Pool',
      start: { dateTime: dateWeekend.toISOString() },
      end: { dateTime: new Date(dateWeekend.getTime() + 45 * 60000).toISOString() }
    },
    {
      id: 'mock-unrelated', // Unrelated event that should be filtered out by logic
      summary: 'Staff Leadership Sync Meeting',
      description: 'Weekly team check-in.',
      location: 'Office Conference Room',
      start: { dateTime: dateTomorrow.toISOString() },
      end: { dateTime: new Date(dateTomorrow.getTime() + 60 * 60000).toISOString() }
    }
  ];
};

export default function MediaLensTracker() {
  // Google API Settings
  const [clientId, setClientId] = useState(() => localStorage.getItem('lens-tracker-client-id') || '');
  const [calendarId, setCalendarId] = useState(() => localStorage.getItem('lens-tracker-calendar-id') || 'primary');
  const [demoMode, setDemoMode] = useState(() => {
    const saved = localStorage.getItem('lens-tracker-demo-mode');
    // If client ID hasn't been set, default to Demo Mode to provide immediate interactive feedback
    return saved !== null ? JSON.parse(saved) : (localStorage.getItem('lens-tracker-client-id') ? false : true);
  });

  // Authorization and Fetching States
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('lens-tracker-access-token') || '');
  const [tokenExpiry, setTokenExpiry] = useState(() => parseInt(localStorage.getItem('lens-tracker-token-expiry') || '0', 10));
  
  // Keep isAuthorized in state and set it asynchronously inside useEffect to avoid render impurity issues
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  
  // UI Panels
  const [showSettings, setShowSettings] = useState(false);
  
  // Data States
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  // Custom checklist state stored by event ID
  const [eventChecklists, setEventChecklists] = useState(() => {
    const saved = localStorage.getItem('lens-tracker-checklists');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist checklists to localStorage on change
  useEffect(() => {
    localStorage.setItem('lens-tracker-checklists', JSON.stringify(eventChecklists));
  }, [eventChecklists]);

  // Validate current token expiry asynchronously to satisfy render purity rules
  useEffect(() => {
    const isTokenValid = !!(accessToken && tokenExpiry > Date.now());
    const timer = setTimeout(() => {
      setIsAuthorized(isTokenValid);
    }, 0);
    return () => clearTimeout(timer);
  }, [accessToken, tokenExpiry]);

  // Core Processing: Filter (prefix match), Clean Prefix, and Sort chronologically
  const processAndSetEvents = React.useCallback((rawEvents) => {
    // 1. Filtering: summary strictly starts with "OSC Media - "
    const filtered = rawEvents.filter(event => 
      event.summary && typeof event.summary === 'string' && event.summary.startsWith('OSC Media - ')
    );

    // 2. Transformation & Formatting
    const transformed = filtered.map(event => {
      // Clean title: Strip prefix
      const cleanedTitle = event.summary.replace(/^OSC Media -\s*/, '');
      const parsedStart = new Date(event.start.dateTime || event.start.date);
      const parsedEnd = event.end ? new Date(event.end.dateTime || event.end.date) : null;
      
      return {
        ...event,
        cleanedTitle,
        parsedStart,
        parsedEnd
      };
    });

    // 3. Sorting: Chronologically by start date/time
    transformed.sort((a, b) => a.parsedStart.getTime() - b.parsedStart.getTime());

    setEvents(transformed);
    
    // Select first event if none selected or if previous selection is not in list
    if (transformed.length > 0) {
      setSelectedEventId(prevSelectedId => {
        const matchExists = transformed.some(e => e.id === prevSelectedId);
        return matchExists ? prevSelectedId : transformed[0].id;
      });
    } else {
      setSelectedEventId(null);
    }
  }, []);

  // Google Calendar API Fetch Method
  const fetchGoogleCalendarEvents = React.useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const nowString = new Date().toISOString();
      // Fetch up to 100 events from calendar
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(nowString)}&orderBy=startTime&singleEvents=true&maxResults=100`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          setAccessToken('');
          setTokenExpiry(0);
          localStorage.removeItem('lens-tracker-access-token');
          localStorage.removeItem('lens-tracker-token-expiry');
          throw new Error('Google authorization token expired. Please reconnect.');
        }
        const errDetails = await response.json();
        throw new Error(errDetails.error?.message || `API Error (Status ${response.status})`);
      }

      const data = await response.json();
      processAndSetEvents(data.items || []);
    } catch (err) {
      console.error('Google Calendar Fetch Error:', err);
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, calendarId, processAndSetEvents]);

  // Load Google Identity Services SDK
  useEffect(() => {
    // Only load if not already present
    if (window.google?.accounts?.oauth2) {
      setTimeout(() => setGsiLoaded(true), 0);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGsiLoaded(true);
    };
    script.onerror = () => {
      setErrorMsg('Failed to load Google Identity Services SDK.');
    };
    document.body.appendChild(script);

    return () => {
      // Clean up if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch / load events based on mode and authorization state
  useEffect(() => {
    let active = true;

    if (demoMode) {
      setTimeout(() => {
        if (!active) return;
        setIsLoading(true);
        setErrorMsg(null);
        setTimeout(() => {
          if (!active) return;
          const mockData = generateMockEvents();
          processAndSetEvents(mockData);
          setIsLoading(false);
        }, 500);
      }, 0);
    } else if (isAuthorized) {
      setTimeout(() => {
        if (!active) return;
        fetchGoogleCalendarEvents();
      }, 0);
    } else {
      setTimeout(() => {
        if (!active) return;
        setEvents([]);
        setSelectedEventId(null);
      }, 0);
    }

    return () => {
      active = false;
    };
  }, [demoMode, isAuthorized, fetchGoogleCalendarEvents, processAndSetEvents]);

  // Connect Google Calendar (OAuth 2.0 Implicit Flow)
  const handleConnectCalendar = () => {
    if (!gsiLoaded || !window.google?.accounts?.oauth2) {
      setErrorMsg('Google Identity Services SDK is not loaded yet. Please wait a moment.');
      return;
    }

    if (!clientId.trim()) {
      setErrorMsg('Please configure a valid Google Client ID in settings.');
      setShowSettings(true);
      return;
    }

    setErrorMsg(null);
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
            setAccessToken(tokenResponse.access_token);
            setTokenExpiry(expiryTime);
            localStorage.setItem('lens-tracker-access-token', tokenResponse.access_token);
            localStorage.setItem('lens-tracker-token-expiry', expiryTime.toString());
            setDemoMode(false);
            localStorage.setItem('lens-tracker-demo-mode', 'false');
            
            // Success - Close settings panel and trigger fetch
            setShowSettings(false);
          } else {
            setErrorMsg('OAuth response did not contain an access token.');
          }
        },
        error_callback: (err) => {
          console.error('OAuth token client error:', err);
          setErrorMsg(`Authorization Error: ${err.message || 'Unknown'}`);
        }
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error('Error starting Google auth flow:', err);
      setErrorMsg(`Authorization process failed to start: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    setAccessToken('');
    setTokenExpiry(0);
    localStorage.removeItem('lens-tracker-access-token');
    localStorage.removeItem('lens-tracker-token-expiry');
    setEvents([]);
    setSelectedEventId(null);
  };

  // Save Client Credentials and configs
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('lens-tracker-client-id', clientId);
    localStorage.setItem('lens-tracker-calendar-id', calendarId);
    setShowSettings(false);
  };

  // Toggle checklist item completion
  const handleToggleChecklistItem = (eventId, item) => {
    setEventChecklists(prev => {
      const currentList = prev[eventId] || {};
      const updated = {
        ...prev,
        [eventId]: {
          ...currentList,
          [item]: !currentList[item]
        }
      };
      return updated;
    });
  };

  // Determine configuration details of current event
  const getEventConfig = (title = '') => {
    const uppercaseTitle = title.toUpperCase();
    if (uppercaseTitle.includes('BAPTISM')) {
      return EVENT_GEAR_CONFIG.BAPTISM;
    } else if (uppercaseTitle.includes('DEDICATION')) {
      return EVENT_GEAR_CONFIG.DEDICATION;
    }
    return EVENT_GEAR_CONFIG.DEFAULT;
  };

  // Calculated Metrics
  const totalMediaDates = events.length;
  const totalBaptisms = events.filter(e => e.cleanedTitle.toUpperCase().includes('BAPTISM')).length;
  const totalDedications = events.filter(e => e.cleanedTitle.toUpperCase().includes('DEDICATION')).length;

  // Selected event object details
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedEventConfig = selectedEvent ? getEventConfig(selectedEvent.cleanedTitle) : EVENT_GEAR_CONFIG.DEFAULT;

  // Formatting date string nicely
  const formatDateHeader = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatEventTime = (event) => {
    if (!event.parsedStart) return '';
    const startStr = event.parsedStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (event.parsedEnd) {
      const endStr = event.parsedEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${startStr} - ${endStr}`;
    }
    return startStr;
  };

  return (
    <div className="text-[#f3f4f6] font-sans selection:bg-blue-600/30 bg-[#0F0F0F] relative">
      
      {/* Dynamic Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center justify-between mb-5 border-b border-[#2A2A2A] pb-3">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-blue-500" />
                  API Settings
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Google OAuth Client ID
                  </label>
                  <input 
                    type="text" 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter client-id.apps.googleusercontent.com"
                    className="w-full bg-black/40 border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-700 text-white font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                    Set up in Google Cloud Console with authorized JS origins representing this origin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Calendar ID
                  </label>
                  <input 
                    type="text" 
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                    placeholder="primary"
                    className="w-full bg-black/40 border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="toggle-demo"
                      checked={demoMode}
                      onChange={(e) => {
                        setDemoMode(e.target.checked);
                        localStorage.setItem('lens-tracker-demo-mode', JSON.stringify(e.target.checked));
                      }}
                      className="rounded border-[#2A2A2A] text-blue-600 focus:ring-blue-500 bg-black/20"
                    />
                    <label htmlFor="toggle-demo" className="text-xs font-bold text-zinc-300 cursor-pointer">
                      Use Mock Demo Mode
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-colors"
                  >
                    Save Config
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6 pt-2 pb-6">
        
        {/* Module Control / OAuth State Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2.5 rounded-xl border border-blue-500/20">
              <Sliders className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Media Lens Tracker
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                  demoMode 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : isAuthorized 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {demoMode ? 'Demo Mode' : isAuthorized ? 'Live Connected' : 'Unconnected'}
                </span>
              </h2>
              <p className="text-[11px] text-[#A0A0A0]">
                {demoMode 
                  ? 'Simulating Google Calendar endpoints' 
                  : isAuthorized 
                    ? `Authorized Calendar: ${calendarId}` 
                    : 'Configure settings and connect to sync your photography events.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (demoMode) {
                  // Refresh mock events
                  setIsLoading(true);
                  setTimeout(() => {
                    processAndSetEvents(generateMockEvents());
                    setIsLoading(false);
                  }, 400);
                } else if (isAuthorized) {
                  fetchGoogleCalendarEvents();
                }
              }}
              disabled={isLoading || (!isAuthorized && !demoMode)}
              className="p-2.5 bg-black/40 hover:bg-black/80 border border-[#2A2A2A] rounded-xl text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Refresh events"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-black/40 hover:bg-black/80 border border-[#2A2A2A] rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <Settings className="w-4 h-4" /> Setup
            </button>

            {demoMode ? (
              <button
                type="button"
                onClick={() => {
                  setDemoMode(false);
                  localStorage.setItem('lens-tracker-demo-mode', 'false');
                  if (clientId) {
                    handleConnectCalendar();
                  } else {
                    setErrorMsg('Please save a Client ID in Settings first to connect.');
                    setShowSettings(true);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all"
              >
                Go Live
              </button>
            ) : isAuthorized ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectCalendar}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-blue-500/20"
              >
                Connect API
              </button>
            )}
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider mr-1.5">Error:</span>
              {errorMsg}
            </div>
            <button type="button" onClick={() => setErrorMsg(null)} className="ml-auto text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300">
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Top Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600/5 rounded-full blur-xl group-hover:bg-blue-600/10 transition-all pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A0A0A0]">Total Media Dates</span>
              <span className="text-3xl font-black text-white mt-3 font-outfit">{totalMediaDates}</span>
              <div className="w-full bg-[#2A2A2A] h-1 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-blue-500 w-full" />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A0A0A0] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Total Baptisms
              </span>
              <span className="text-3xl font-black text-white mt-3 font-outfit">{totalBaptisms}</span>
              <div className="w-full bg-[#2A2A2A] h-1 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-blue-400 transition-all duration-500" 
                  style={{ width: `${totalMediaDates > 0 ? (totalBaptisms / totalMediaDates) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A0A0A0] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Total Dedications
              </span>
              <span className="text-3xl font-black text-white mt-3 font-outfit">{totalDedications}</span>
              <div className="w-full bg-[#2A2A2A] h-1 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-purple-400 transition-all duration-500" 
                  style={{ width: `${totalMediaDates > 0 ? (totalDedications / totalMediaDates) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Main Workspace (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Timeline) */}
          <div className="lg:col-span-7 space-y-4 max-h-[600px] overflow-y-auto pr-1 select-none custom-scrollbar">
            <div className="sticky top-0 z-10 bg-[#0F0F0F] pb-2 border-b border-[#2A2A2A] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Photography Obligation Timeline
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                Sorted Chronologically
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#A0A0A0]">Retrieving agenda items...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl space-y-3">
                <Calendar className="w-10 h-10 text-zinc-700 mx-auto" />
                <p className="text-sm font-bold text-white">No upcoming obligations found</p>
                <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto leading-relaxed">
                  Only calendar events matching the prefix <code className="text-blue-400 font-mono">"OSC Media - "</code> will populate in this timeline.
                </p>
                {!isAuthorized && !demoMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setDemoMode(true);
                      localStorage.setItem('lens-tracker-demo-mode', 'true');
                    }}
                    className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Load Demo Mock Data
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const isSelected = event.id === selectedEventId;
                  const config = getEventConfig(event.cleanedTitle);
                  
                  return (
                    <motion.div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      whileHover={{ x: 2 }}
                      className={`p-5 rounded-2xl cursor-pointer border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#1A1A1A] border-blue-500/50 shadow-md shadow-blue-500/5' 
                          : 'bg-[#1A1A1A]/60 border-[#2A2A2A] hover:bg-[#1A1A1A] hover:border-zinc-700'
                      }`}
                    >
                      {/* Left Accent indicator for active selection */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide shrink-0 ${config.badgeClass}`}>
                            {config.badgeText}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {formatDateHeader(event.parsedStart)}
                          </span>
                        </div>

                        <h4 className={`text-base font-bold transition-colors ${
                          isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'
                        }`}>
                          {event.cleanedTitle}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-[#A0A0A0]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{formatEventTime(event)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="truncate max-w-[200px]">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (Details & Checklist - Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[20px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              Obligation Checklist & Strategy
            </h3>

            {selectedEvent ? (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-6">
                
                {/* Event Summary Card */}
                <div className="space-y-3 pb-5 border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedEventConfig.badgeClass}`}>
                      {selectedEventConfig.icon}
                      {selectedEventConfig.badgeText}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white leading-tight font-outfit">
                    {selectedEvent.cleanedTitle}
                  </h3>

                  <div className="space-y-1 text-xs text-[#A0A0A0]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span>{formatDateHeader(selectedEvent.parsedStart)} @ {formatEventTime(selectedEvent)}</span>
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-[#2A2A2A]/40 mt-2 italic">
                      "{selectedEvent.description}"
                    </p>
                  )}
                </div>

                {/* Checklist (Interactive & Persisted) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    Required Gear Checklist
                  </h4>
                  
                  <div className="space-y-2">
                    {selectedEventConfig.checklist.map((item, index) => {
                      const eventChecklistState = eventChecklists[selectedEvent.id] || {};
                      const isChecked = !!eventChecklistState[item];

                      return (
                        <div 
                          key={index}
                          onClick={() => handleToggleChecklistItem(selectedEvent.id, item)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                            isChecked 
                              ? 'bg-blue-600/5 border-blue-500/20 text-zinc-400' 
                              : 'bg-black/20 border-[#2A2A2A] text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          <button 
                            type="button"
                            className={`shrink-0 transition-colors ${isChecked ? 'text-blue-500' : 'text-zinc-600'}`}
                          >
                            {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                          <span className={`text-xs font-medium ${isChecked ? 'line-through text-zinc-500' : ''}`}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strategy Tip (Dynamic Tip Display) */}
                <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-500/10 p-4 rounded-xl space-y-1.5 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <Sparkles className="w-16 h-16 text-blue-400" />
                  </div>
                  <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Expert Strategy Tip
                  </h5>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {selectedEventConfig.strategyTip}
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 text-center text-zinc-500 space-y-2">
                <Info className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">No event selected</p>
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Select an upcoming photography event from the timeline list to review required equipment checklists and strategic recommendations.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
