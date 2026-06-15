import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  FileText,
  Activity,
  Check,
  Copy,
  ChevronRight,
  Cpu,
  Send,
  Terminal,
  ArrowRight,
  Upload,
  Video,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import {
  SERMON_SAMPLES,
  analyzeCustomTranscript,
  runAgentWorkflow,
  syncProductionPipeline
} from '../services/sermonAgent';

export default function SermonAgentTab({ activeService, onSyncClips }) {
  const [selectedPresetId, setSelectedPresetId] = useState(SERMON_SAMPLES[0].id);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('Weekly Sermon Message');
  
  // Settings
  const [clipDuration, setClipDuration] = useState([20, 30]);
  const [targetPlatform, setTargetPlatform] = useState('all');
  const [toneMode, setToneMode] = useState('inspirational');

  // Agent State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Results State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedClips, setSelectedClips] = useState({});
  const [copiedClipId, setCopiedClipId] = useState(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTelemetry, setSyncTelemetry] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Active Peak highlight
  const [activePeakIndex, setActivePeakIndex] = useState(null);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  const handleSelectPreset = (e) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);
    if (presetId !== 'custom') {
      const preset = SERMON_SAMPLES.find(s => s.id === presetId);
      setCustomText('');
    }
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setAgentLogs([]);
    setAnalysisResult(null);
    setSyncSuccess(false);
    setSyncTelemetry(null);
    setAnalysisProgress(0);
    
    let activePreset = null;
    let textToAnalyze = '';
    let titleToAnalyze = '';

    if (selectedPresetId === 'custom') {
      textToAnalyze = customText;
      titleToAnalyze = customTitle;
    } else {
      activePreset = SERMON_SAMPLES.find(s => s.id === selectedPresetId);
      textToAnalyze = activePreset.content;
      titleToAnalyze = activePreset.title;
    }

    if (!textToAnalyze.trim()) {
      alert('Please enter sermon transcript or outline text.');
      setIsAnalyzing(false);
      return;
    }

    let progressIncrement = 100 / 7; // 7 agent steps
    let currentProg = 0;

    runAgentWorkflow(
      textToAnalyze,
      (step) => {
        setCurrentAgent(step.name);
        currentProg += progressIncrement;
        setAnalysisProgress(Math.min(Math.round(currentProg), 100));
        setAgentLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          agent: step.name,
          message: step.log
        }]);
      },
      () => {
        // Complete Callback
        let results;
        if (selectedPresetId === 'custom') {
          results = analyzeCustomTranscript(titleToAnalyze, textToAnalyze);
        } else {
          results = activePreset.analysis;
        }

        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisResult(results);
          // Set all clips to selected by default
          const defaultSelected = {};
          results.clips.forEach(clip => {
            defaultSelected[clip.id] = true;
          });
          setSelectedClips(defaultSelected);
        }, 500);
      }
    );
  };

  const handleToggleClipSelection = (clipId) => {
    setSelectedClips(prev => ({
      ...prev,
      [clipId]: !prev[clipId]
    }));
  };

  const handleCopyCaption = (clipId, captionText) => {
    navigator.clipboard.writeText(captionText);
    setCopiedClipId(clipId);
    setTimeout(() => setCopiedClipId(null), 2000);
  };

  const handleSyncToProduction = async () => {
    if (!analysisResult) return;
    
    const clipsToSync = analysisResult.clips.filter(c => selectedClips[c.id]);
    if (clipsToSync.length === 0) {
      alert('Please select at least one clip to sync.');
      return;
    }

    setIsSyncing(true);
    setSyncSuccess(false);
    
    try {
      const response = await syncProductionPipeline(activeService, clipsToSync);
      setSyncTelemetry(response);
      setSyncSuccess(true);
      
      // Inject into main App PWA Shot List pipeline
      if (onSyncClips) {
        onSyncClips(clipsToSync);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to synchronize production pipeline.');
    } finally {
      setIsSyncing(false);
    }
  };

  // SVG dimensions for the crescendo chart
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = 20;

  // Calculate coordinates for crescendo SVG path
  const getCrescendoCoordinates = () => {
    if (!analysisResult || !analysisResult.crescendos) return [];
    
    const count = analysisResult.crescendos.length;
    const xInterval = (chartWidth - padding * 2) / (count - 1);
    
    return analysisResult.crescendos.map((point, index) => {
      const x = padding + index * xInterval;
      // SVG y increases downwards, so we invert it (higher value = closer to top)
      const usableHeight = chartHeight - padding * 2;
      const y = chartHeight - padding - (point.value / 100) * usableHeight;
      return { x, y, value: point.value, label: point.label, time: point.time };
    });
  };

  const coords = getCrescendoCoordinates();
  
  // Draw SVG lines & areas
  const getLinePath = () => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, index) => {
      return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  };

  const getAreaPath = () => {
    if (coords.length === 0) return '';
    const linePath = getLinePath();
    const first = coords[0];
    const last = coords[coords.length - 1];
    return `${linePath} L ${last.x} ${chartHeight - padding} L ${first.x} ${chartHeight - padding} Z`;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Introduction Banner */}
      <div className="relative overflow-hidden glass-card p-6 rounded-3xl border border-white/5 bg-gradient-to-r from-indigo-950/20 to-slate-900">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
          <div className="bg-gradient-to-tr from-cyan-400 to-indigo-500 p-3.5 rounded-2xl shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white font-outfit uppercase tracking-wider">Sermon Analysis Agent</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Ingest your sermon manuscript or outline. Our multi-agent workflow segments structural shifts, charts emotional engagement peaks, drafts visual directions, and writes social copy.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUT DECK */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Sermon Ingestion
            </h3>
            
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Source</label>
                <select
                  value={selectedPresetId}
                  onChange={handleSelectPreset}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-semibold"
                >
                  {SERMON_SAMPLES.map(sample => (
                    <option key={sample.id} value={sample.id}>
                      {sample.speaker} - "{sample.title}"
                    </option>
                  ))}
                  <option value="custom">✍️ Paste Custom Transcript / Outline...</option>
                </select>
              </div>

              {selectedPresetId === 'custom' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sermon Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      disabled={isAnalyzing}
                      placeholder="e.g. Living in the Light"
                      className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 text-xs px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste Text</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      disabled={isAnalyzing}
                      rows={8}
                      placeholder="Paste sermon manuscript paragraphs or structured outline nodes here..."
                      className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 text-xs p-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-5 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analysis Settings</h4>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Duration</span>
                  <span className="font-mono text-cyan-400 font-bold">20s - 30s</span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Video Format</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {['Vertical (9:16)', 'Landscape (16:9)'].map(format => (
                      <button
                        key={format}
                        type="button"
                        className={`py-2 px-2.5 rounded-lg border text-[10px] font-bold text-center uppercase tracking-wider transition-all ${
                          format.startsWith('Vertical') 
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                            : 'bg-slate-900 border-slate-700/30 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Draft Tone</label>
                  <select
                    value={toneMode}
                    onChange={(e) => setToneMode(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-300 text-[11px] p-2 rounded-lg"
                  >
                    <option value="inspirational">🌟 Inspirational & Uplifting</option>
                    <option value="energetic">⚡ High Energy & Bold</option>
                    <option value="contemplative">🧘 Peaceful & Devotional</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className={`w-full relative py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-950 transition-all shadow-lg active:scale-98 overflow-hidden group ${
                isAnalyzing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400 hover:shadow-cyan-500/20 bg-[size:200%_auto] hover:bg-right'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Agent Ingesting ({analysisProgress}%)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Run Analysis Agent</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* WORKFLOW SIMULATOR TERMINAL */}
        <div className="lg:col-span-2 flex flex-col justify-stretch">
          <div className="glass-card rounded-3xl border border-white/5 bg-slate-950/80 flex-grow flex flex-col min-h-[300px] overflow-hidden shadow-2xl relative">
            
            {/* Terminal Header */}
            <div className="bg-slate-900 border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
                </div>
                <div className="w-px h-3.5 bg-slate-800 mx-1" />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Agent Execution Console
                </span>
              </div>
              
              {isAnalyzing && (
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded font-bold animate-pulse">
                  Agent: {currentAgent}
                </span>
              )}
            </div>

            {/* Terminal Logs */}
            <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-3 min-h-[200px] max-h-[360px] scrollbar-thin">
              {agentLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 py-16 space-y-3.5 text-center">
                  <Cpu className="w-12 h-12 text-slate-800" strokeWidth={1} />
                  <div className="space-y-1">
                    <p className="text-slate-400 font-semibold">Terminal Idle</p>
                    <p className="text-[11px] text-slate-600 max-w-[280px]">Select a sermon source on the left panel and activate the agent to initialize execution.</p>
                  </div>
                </div>
              ) : (
                <>
                  {agentLogs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-white/[0.02] pb-2 last:border-b-0"
                    >
                      <span className="text-slate-500 text-[10px] mr-2">{log.timestamp}</span>
                      <span className="text-indigo-400 font-bold mr-2">[{log.agent}]</span>
                      <span className="text-slate-200 font-medium leading-relaxed">{log.message}</span>
                    </motion.div>
                  ))}
                  
                  {isAnalyzing && (
                    <div className="flex items-center gap-1 text-cyan-400 animate-pulse text-[11px] mt-2 font-bold">
                      <span className="w-1 h-3 bg-cyan-400 animate-blink inline-block" />
                      <span>Agent working... Analyzing content...</span>
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ANALYSIS RESULTS PANEL */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20">
                  <Activity className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-black text-white font-outfit uppercase tracking-wider">Analysis Insights Dashboard</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* TIMELINE & CRESCENDOS CHART */}
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Emotional Crescendos</h4>
                    <p className="text-xs text-slate-400 mt-1">Timeline visualization mapping emotional intensity peaks across the sermon.</p>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative bg-slate-950/40 rounded-2xl border border-white/5 p-4 overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-auto min-w-[500px]"
                    >
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[25, 50, 75, 100].map((level, i) => {
                        const y = chartHeight - padding - (level / 100) * (chartHeight - padding * 2);
                        return (
                          <g key={i}>
                            <line
                              x1={padding}
                              y1={y}
                              x2={chartWidth - padding}
                              y2={y}
                              stroke="rgba(255,255,255,0.03)"
                              strokeWidth={1}
                              strokeDasharray="4 4"
                            />
                            <text
                              x={padding - 5}
                              y={y + 3}
                              fill="rgba(255,255,255,0.15)"
                              fontSize={8}
                              fontFamily="monospace"
                              textAnchor="end"
                            >
                              {level}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      <path
                        d={getAreaPath()}
                        fill="url(#chartGradient)"
                      />

                      {/* Line Path */}
                      <path
                        d={getLinePath()}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth={2.5}
                      />

                      {/* Line Gradient */}
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>

                      {/* Peak Circles */}
                      {coords.map((curr, idx) => {
                        const isHighPeak = curr.value >= 80;
                        const isHighlighted = activePeakIndex === idx;
                        
                        return (
                          <g
                            key={idx}
                            className="cursor-pointer group"
                            onMouseEnter={() => setActivePeakIndex(idx)}
                            onMouseLeave={() => setActivePeakIndex(null)}
                          >
                            <circle
                              cx={curr.x}
                              cy={curr.y}
                              r={isHighlighted ? 6 : (isHighPeak ? 4.5 : 3.5)}
                              fill={isHighlighted ? '#f43f5e' : (isHighPeak ? '#06b6d4' : '#1e293b')}
                              stroke={isHighPeak ? '#ffffff' : '#6366f1'}
                              strokeWidth={1.5}
                              className="transition-all duration-300"
                            />
                            
                            {/* Hover tooltip */}
                            {isHighlighted && (
                              <g>
                                <rect
                                  x={curr.x - 50}
                                  y={curr.y - 30}
                                  width={100}
                                  height={22}
                                  rx={4}
                                  fill="#0f172a"
                                  stroke="rgba(255,255,255,0.1)"
                                  strokeWidth={1}
                                />
                                <text
                                  x={curr.x}
                                  y={curr.y - 16}
                                  fill="#ffffff"
                                  fontSize={8}
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {curr.label} ({curr.value}%)
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Peaks legend list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysisResult.crescendos.filter(c => c.value >= 80).map((peak, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl hover:bg-white/[0.04] transition-all"
                      >
                        <div className="bg-rose-500/10 text-rose-400 font-mono text-[11px] font-bold px-2 py-1.5 rounded-lg border border-rose-500/20">
                          {peak.time}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-snug">{peak.label}</p>
                          <span className="text-[10px] text-cyan-400 font-semibold">{peak.value}% Emotional Climax Intensity</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* THEMES & CALLS TO ACTION */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-5 flex-grow">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Core Themes</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Identified sermon subject areas.</p>
                    </div>

                    <div className="space-y-4">
                      {analysisResult.themes.map((theme, idx) => (
                        <div key={idx} className="space-y-1.5 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-extrabold text-white font-outfit">{theme.name}</span>
                            <div className="flex gap-1.5">
                              {theme.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-mono text-cyan-300 font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            {theme.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Calls to Action (CTA)</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Concrete takeaway directives.</p>
                    </div>

                    <div className="space-y-3.5">
                      {analysisResult.ctas.map((cta, idx) => (
                        <div key={idx} className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-indigo-400 font-semibold font-mono text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Timestamp: {cta.timestamp}
                          </div>
                          <p className="text-slate-300 font-medium italic border-l-2 border-white/10 pl-3 leading-relaxed">
                            "{cta.quote}"
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold bg-white/5 p-2 rounded-lg leading-relaxed">
                            🎯 Action: {cta.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SUGGESTED CLIPS */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Suggested Video Clips (20s - 30s)</h4>
                  <p className="text-xs text-slate-400 mt-1">Select the clips you want to export to the live production shot checklist.</p>
                </div>
                
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {Object.values(selectedClips).filter(Boolean).length} / {analysisResult.clips.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {analysisResult.clips.map((clip) => {
                  const isChecked = selectedClips[clip.id];
                  const isCopied = copiedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      onClick={() => handleToggleClipSelection(clip.id)}
                      className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between group h-full ${
                        isChecked 
                          ? 'border-cyan-500/40 bg-cyan-950/5 shadow-[0_4px_20px_rgba(6,182,212,0.08)]' 
                          : 'border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-3.5">
                        
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              ⏱️ {clip.start} - {clip.end} ({clip.duration}s)
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1.5 leading-snug group-hover:text-cyan-300 transition-colors">
                              {clip.title}
                            </h5>
                          </div>

                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked 
                              ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                              : 'border-slate-600 group-hover:border-slate-500'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                          </div>
                        </div>

                        {/* Quote Box */}
                        <p className="text-xs text-slate-300 italic bg-black/20 p-3 rounded-xl border border-white/5 leading-relaxed">
                          "{clip.quote}"
                        </p>

                        {/* Description */}
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          {clip.description}
                        </p>

                        {/* Visual Themes */}
                        <div className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Suggested Visuals</span>
                          <span className="text-[10px] text-indigo-300 font-semibold leading-relaxed block">
                            🎥 {clip.visualTheme}
                          </span>
                        </div>

                      </div>

                      {/* Clipboard copy caption row */}
                      <div className="border-t border-white/5 pt-3.5 mt-4 flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Social Copy Ready</span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid toggling selection
                            handleCopyCaption(clip.id, clip.draftCaption);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-white hover:border-cyan-500/50'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Caption</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* SYNC PANEL & BACKEND DIAGNOSTICS */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Production Sync Pipeline
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    Synchronize your selected clips directly to the live PWA. This simulates updating the church database, pushing clips to the media crew's active dashboard, and preparing draft exports.
                  </p>
                </div>

                <button
                  onClick={handleSyncToProduction}
                  disabled={isSyncing || Object.values(selectedClips).filter(Boolean).length === 0}
                  className={`px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 whitespace-nowrap ${
                    isSyncing
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-emerald-500/10 hover:shadow-emerald-500/20'
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Syncing Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Sync to Live App ({Object.values(selectedClips).filter(Boolean).length} Clips)</span>
                    </>
                  )}
                </button>
              </div>

              {/* SUCCESS TELEMETRY */}
              <AnimatePresence>
                {syncSuccess && syncTelemetry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-5 space-y-4"
                  >
                    
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                      <div className="bg-emerald-500 text-slate-900 p-1 rounded-full">
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Sync Successful (HTTP 200 OK)</p>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5">
                          Synced successfully with production server. {syncTelemetry.data.syncedCount} clip targets have been injected into the **{activeService.toUpperCase()} Shot List**.
                        </p>
                      </div>
                    </div>

                    {/* Network Logs Terminal */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-white/5 font-mono text-[10px] space-y-3.5 text-slate-400">
                      
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>HTTP Telemetry Log</span>
                        <span className="text-emerald-400">Connected</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-cyan-400 font-bold">{">>> POST /api/production-pipeline/sync"}</p>
                          <p><span className="text-slate-500">Headers:</span> {JSON.stringify(syncTelemetry.telemetry.requestHeaders, null, 2)}</p>
                          <p className="max-h-[120px] overflow-y-auto"><span className="text-slate-500">Payload:</span> {JSON.stringify(syncTelemetry.telemetry.requestBody, null, 2)}</p>
                        </div>
                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                          <p className="text-emerald-400 font-bold">{"<<< HTTP/1.1 200 OK"}</p>
                          <p><span className="text-slate-500">Response Headers:</span> {JSON.stringify(syncTelemetry.headers, null, 2)}</p>
                          <p><span className="text-slate-500">Response Body:</span> {JSON.stringify(syncTelemetry.data, null, 2)}</p>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
