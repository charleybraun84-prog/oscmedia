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

// Helper to parse iCal Date strings to JavaScript Date objects
function parseICalDate(icalStr) {
  if (!icalStr) return null;
  
  // Strip any non-alphanumeric characters
  const cleanStr = icalStr.replace(/[^Z0-9T]/g, '');
  
  if (cleanStr.length >= 8) {
    const year = parseInt(cleanStr.substring(0, 4), 10);
    const month = parseInt(cleanStr.substring(4, 6), 10) - 1; // 0-indexed
    const day = parseInt(cleanStr.substring(6, 8), 10);
    
    if (cleanStr.includes('T')) {
      const tIdx = cleanStr.indexOf('T');
      const hour = parseInt(cleanStr.substring(tIdx + 1, tIdx + 3), 10) || 0;
      const minute = parseInt(cleanStr.substring(tIdx + 3, tIdx + 5), 10) || 0;
      const second = parseInt(cleanStr.substring(tIdx + 5, tIdx + 7), 10) || 0;
      
      if (cleanStr.endsWith('Z')) {
        // UTC Time
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      } else {
        // Local Time
        return new Date(year, month, day, hour, minute, second);
      }
    } else {
      // Date only
      return new Date(year, month, day);
    }
  }
  return null;
}

// Client-side RFC 5545 iCalendar (.ics) plain-text parser
function parseICS(icsText) {
  const lines = icsText.split(/\r?\n/);
  const parsedEvents = [];
  let currentEvent = null;
  
  // Unfold lines: lines starting with a space or tab are continuations of the previous line
  const unfoldedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.substring(1);
      }
    } else {
      unfoldedLines.push(line);
    }
  }

  for (const line of unfoldedLines) {
    if (!line.trim()) continue;
    
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    
    const keyPart = line.substring(0, colonIdx);
    let value = line.substring(colonIdx + 1);
    
    // Clean string escape characters
    value = value
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\n/gi, '\n')
      .replace(/\\\\/g, '\\');

    const key = keyPart.split(';')[0].toUpperCase();

    if (key === 'BEGIN' && value.toUpperCase() === 'VEVENT') {
      currentEvent = {};
    } else if (key === 'END' && value.toUpperCase() === 'VEVENT') {
      if (currentEvent) {
        if (currentEvent.dtstart) {
          currentEvent.start = { dateTime: parseICalDate(currentEvent.dtstart) };
        }
        if (currentEvent.dtend) {
          currentEvent.end = { dateTime: parseICalDate(currentEvent.dtend) };
        }
        currentEvent.id = currentEvent.uid || `event-${Date.now()}-${Math.random()}`;
        parsedEvents.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent) {
      if (key === 'SUMMARY') {
        currentEvent.summary = value;
      } else if (key === 'DESCRIPTION') {
        currentEvent.description = value;
      } else if (key === 'LOCATION') {
        currentEvent.location = value;
      } else if (key === 'DTSTART') {
        currentEvent.dtstart = value;
      } else if (key === 'DTEND') {
        currentEvent.dtend = value;
      } else if (key === 'UID') {
        currentEvent.uid = value;
      }
    }
  }
  return parsedEvents;
}

export default function MediaLensTracker() {
  const defaultIcalUrl = 'https://calendar.google.com/calendar/ical/charley.braun84%40gmail.com/private-74fc89a8c96ffc89bea52a2b70dbc494/basic.ics';

  const [icalUrl, setIcalUrl] = useState(() => {
    const saved = localStorage.getItem('lens-tracker-ical-url');
    if (saved === 'https://calendar.google.com/calendar/ical/4620d5b51abb03fb96d1f3a01f9aa41e292db86f7d311eb0c6c2e4f1deab8ef8%40group.calendar.google.com/private-f8d78fd2bec10632066cf6ecaf25e32f/basic.ics') {
      localStorage.setItem('lens-tracker-ical-url', defaultIcalUrl);
      return defaultIcalUrl;
    }
    return saved || defaultIcalUrl;
  });
  const [demoMode, setDemoMode] = useState(() => {
    const saved = localStorage.getItem('lens-tracker-demo-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
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
      
      let parsedStart = null;
      if (event.start?.dateTime) {
        parsedStart = event.start.dateTime instanceof Date ? event.start.dateTime : new Date(event.start.dateTime);
      }
      let parsedEnd = null;
      if (event.end?.dateTime) {
        parsedEnd = event.end.dateTime instanceof Date ? event.end.dateTime : new Date(event.end.dateTime);
      }
      
      return {
        ...event,
        cleanedTitle,
        parsedStart,
        parsedEnd
      };
    });

    // 3. Filter out past events
    const now = new Date();
    const futureEvents = transformed.filter(event => {
      // Use end time if available, otherwise start time
      const eventTime = event.parsedEnd || event.parsedStart;
      // Keep event if its time is in the future, or if no parsed time available
      return eventTime ? eventTime >= now : true;
    });

    // 4. Sorting: Chronologically by start date/time
    futureEvents.sort((a, b) => {
      const timeA = a.parsedStart ? a.parsedStart.getTime() : 0;
      const timeB = b.parsedStart ? b.parsedStart.getTime() : 0;
      return timeA - timeB;
    });

    setEvents(futureEvents);
    
    // Select first event if none selected or if previous selection is not in list
    if (futureEvents.length > 0) {
      setSelectedEventId(prevSelectedId => {
        const matchExists = futureEvents.some(e => e.id === prevSelectedId);
        return matchExists ? prevSelectedId : futureEvents[0].id;
      });
    } else {
      setSelectedEventId(null);
    }
  }, []);

  // Fetch from Google Calendar iCal private URL feed using CORS proxy
  const fetchCalendarFeed = React.useCallback(async () => {
    if (!icalUrl.trim()) {
      setErrorMsg('Please configure a valid Google Calendar Private iCal URL.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Use our secure serverless backend proxy instead of unreliable public corsproxy.io
      const proxyUrl = `/api/calendar/proxy?url=${encodeURIComponent(icalUrl.trim())}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch iCal feed (Status ${response.status}). If this error persists, verify the Secret iCal URL in Settings.`);
      }

      const text = await response.text();
      const parsedData = parseICS(text);
      processAndSetEvents(parsedData);
    } catch (err) {
      console.error('iCal Feed Fetch Error:', err);
      setErrorMsg(err.message || 'An error occurred while fetching or parsing the calendar feed.');
    } finally {
      setIsLoading(false);
    }
  }, [icalUrl, processAndSetEvents]);

  // Fetch / load events based on mode and URL changes
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
    } else {
      setTimeout(() => {
        if (!active) return;
        fetchCalendarFeed();
      }, 0);
    }

    return () => {
      active = false;
    };
  }, [demoMode, fetchCalendarFeed, processAndSetEvents]);

  // Save Settings callback
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('lens-tracker-ical-url', icalUrl);
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
                  Feed Settings
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
                    Google Calendar Private iCal URL
                  </label>
                  <textarea 
                    rows={5}
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    placeholder="Enter private .ics address"
                    className="w-full bg-black/40 border border-[#2A2A2A] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-700 text-white font-mono resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                    Retrieve this from Google Calendar Settings $\rightarrow$ Integrate Calendar $\rightarrow$ Copy the <strong>Secret address in iCal format</strong>.
                  </p>
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
        
        {/* Module Control / iCal Feed State Bar */}
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
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {demoMode ? 'Demo Mode' : 'Feed Connected'}
                </span>
              </h2>
              <p className="text-[11px] text-[#A0A0A0]">
                {demoMode 
                  ? 'Simulating Google Calendar endpoints' 
                  : 'Displaying events loaded directly from your private iCal address.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (demoMode) {
                  setIsLoading(true);
                  setTimeout(() => {
                    processAndSetEvents(generateMockEvents());
                    setIsLoading(false);
                  }, 400);
                } else {
                  fetchCalendarFeed();
                }
              }}
              disabled={isLoading}
              className="p-2.5 bg-black/40 hover:bg-black/80 border border-[#2A2A2A] rounded-xl text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              title="Sync calendar events"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
              <span>Sync Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-black/40 hover:bg-black/80 border border-[#2A2A2A] rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <Settings className="w-4 h-4" /> Setup Feed
            </button>
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
                {!demoMode && (
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
