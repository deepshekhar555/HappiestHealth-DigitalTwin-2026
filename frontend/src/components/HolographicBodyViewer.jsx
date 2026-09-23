"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw, ZoomIn, ZoomOut, Eye, Move, Maximize2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  X, AlertCircle, Heart, Wind, Brain, Activity, Bone, Pill, Info
} from 'lucide-react';

// ─── Medical Issue Data tied to body regions ───────────────────────────────────
const MEDICAL_ISSUES = {
  head: {
    label: 'Cranial Region',
    cx: 50, cy: 7,
    issues: ['Migraine (Chronic)', 'Hypertension-related Headache'],
    severity: 'moderate',
    treatment: 'Sumatriptan 50mg PRN · Beta-blocker prophylaxis',
    icon: Brain,
    detail: 'Recurrent migraine episodes. MRI shows no structural lesion. Blood pressure-linked cephalgia noted at systolic >140 mmHg.',
  },
  chest: {
    label: 'Cardiothoracic Region',
    cx: 50, cy: 33,
    issues: ['Coronary Artery Disease (CAD)', 'Arrhythmia Risk'],
    severity: 'high',
    treatment: 'Aspirin 75mg · Metoprolol 25mg · Statin therapy',
    icon: Heart,
    detail: 'EF 52%, mild LV hypertrophy. Shock Index 0.81. Cardiac stress index elevated during ambulation. ECG: intermittent sinus tachycardia.',
  },
  lungs: {
    label: 'Pulmonary Region',
    cx: 38, cy: 30,
    issues: ['Exercise-induced Desaturation', 'SpO2 monitoring required'],
    severity: 'moderate',
    treatment: 'Bronchodilator PRN · SpO2 monitoring every session',
    icon: Wind,
    detail: 'SpO2 dips to 96.2% during ambulation. Respiratory rate 21/min post-exertion. No resting hypoxia. Pulmonary diffusion capacity borderline.',
  },
  abdomen: {
    label: 'Abdominal / Metabolic Region',
    cx: 50, cy: 47,
    issues: ['Type 2 Diabetes (Controlled)', 'Elevated Post-activity Glucose'],
    severity: 'moderate',
    treatment: 'Metformin 500mg Twice Daily · Dietary monitoring',
    icon: Activity,
    detail: 'Glucose 118 mg/dL post-ambulation. HbA1c 7.1%. Insulin sensitivity improving with walking therapy. Visceral adiposity noted.',
  },
  rightKnee: {
    label: 'Right Knee (Post-operative)',
    cx: 58, cy: 70,
    issues: ['Post-arthroscopy Gait Asymmetry', 'Knee Flexion Limitation'],
    severity: 'high',
    treatment: 'Physiotherapy 3×/week · NSAIDs PRN · Compression brace',
    icon: Bone,
    detail: 'Right knee arthroscopy (2021). Gait symmetry 67–74% (target >80%). Stride length 1.12m (reduced). Dominant weight-bearing: Left. Ongoing rehabilitation.',
  },
  leftLeg: {
    label: 'Left Lower Limb',
    cx: 43, cy: 72,
    issues: ['Compensatory Weight Overloading', 'Risk of Secondary Strain'],
    severity: 'moderate',
    treatment: 'Balance training · Bilateral resistance exercises',
    icon: Activity,
    detail: 'Left limb compensating for right knee asymmetry. Increased ground-reaction force detected. Cadence 92 spm — below target (95-115 spm).',
  },
  bloodPressure: {
    label: 'Vascular System',
    cx: 30, cy: 40,
    issues: ['Hypertension (Grade 1)', 'MAP elevation post-ambulation'],
    severity: 'moderate',
    treatment: 'Amlodipine 5mg · Dietary sodium restriction · Walk therapy',
    icon: Activity,
    detail: 'Walking BP: 130/84 mmHg. MAP 99 mmHg. Shock Index 0.81. Risk of end-organ damage if unmanaged. Lifestyle modification ongoing.',
  },
};

const SEVERITY_COLORS = {
  high: { ring: '#ef4444', glow: 'rgba(239,68,68,0.6)', pulse: '#fee2e2', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 border-rose-300' },
  moderate: { ring: '#f59e0b', glow: 'rgba(245,158,11,0.5)', pulse: '#fef3c7', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-300' },
  low: { ring: '#10b981', glow: 'rgba(16,185,129,0.4)', pulse: '#d1fae5', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};

const VIEWS = [
  { id: 'front', label: 'Front', icon: ChevronUp },
  { id: 'back', label: 'Back', icon: ChevronDown },
  { id: 'left', label: 'Left', icon: ChevronLeft },
  { id: 'right', label: 'Right', icon: ChevronRight },
  { id: 'upper', label: 'Upper', icon: ZoomIn },
  { id: 'lower', label: 'Lower', icon: ZoomOut },
];

// ─── Animated holographic body SVG ────────────────────────────────────────────
const HoloBody = ({ activeHotspot, onHotspotHold, onHotspotRelease, view }) => {
  const holdTimers = useRef({});

  const getTransform = () => {
    switch (view) {
      case 'back':    return 'scaleX(-1)';
      case 'left':    return 'perspective(400px) rotateY(-30deg)';
      case 'right':   return 'perspective(400px) rotateY(30deg)';
      case 'upper':   return 'scale(1.3) translateY(15%)';
      case 'lower':   return 'scale(1.3) translateY(-18%)';
      default:        return 'none';
    }
  };

  const startHold = useCallback((key) => {
    holdTimers.current[key] = setTimeout(() => {
      onHotspotHold(key);
    }, 150);
  }, [onHotspotHold]);

  const endHold = useCallback((key) => {
    clearTimeout(holdTimers.current[key]);
    onHotspotRelease(key);
  }, [onHotspotRelease]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0a1628 0%, #020812 100%)' }}>

      {/* Grid overlay for AR feel */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* Scan line animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[scanLine_4s_linear_infinite]" />
      </div>

      {/* Holographic body SVG */}
      <div className="relative z-10 transition-transform duration-700 ease-in-out"
        style={{ transform: getTransform(), width: 220, height: 480 }}>
        <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(0,200,255,0.6)]">

          <defs>
            <filter id="holo-glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0066ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#001aff" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="innerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0000ff" stopOpacity="0.04" />
            </linearGradient>
            {/* Pulse rings for each severity */}
            <radialGradient id="highPulse">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="modPulse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Body segments with cyan outline + translucent fill */}
          {/* Head */}
          <ellipse cx="50" cy="8" rx="8" ry="9" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.5" filter="url(#holo-glow)" />
          {/* Neck */}
          <rect x="46" y="17" width="8" height="5" rx="1" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Torso */}
          <path d="M32 22 Q26 30 27 50 L73 50 Q74 30 68 22 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.5" filter="url(#holo-glow)" />
          {/* Lower torso */}
          <path d="M27 50 L30 68 L70 68 L73 50 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.5" />
          {/* Left upper arm */}
          <path d="M32 23 L22 25 L20 46 L28 46 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Left lower arm */}
          <path d="M20 46 L18 48 L16 70 L24 70 L28 46 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Left hand */}
          <ellipse cx="20" cy="73" rx="4" ry="5" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Right upper arm */}
          <path d="M68 23 L78 25 L80 46 L72 46 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Right lower arm */}
          <path d="M80 46 L82 48 L84 70 L76 70 L72 46 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Right hand */}
          <ellipse cx="80" cy="73" rx="4" ry="5" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Left thigh */}
          <path d="M30 68 L28 68 L25 100 L38 100 L38 68 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.5" filter="url(#holo-glow)" />
          {/* Left shin */}
          <path d="M25 100 L24 102 L22 135 L36 135 L38 100 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Left foot */}
          <ellipse cx="29" cy="138" rx="8" ry="3.5" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Right thigh */}
          <path d="M70 68 L72 68 L75 100 L62 100 L62 68 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.5" filter="url(#holo-glow)" />
          {/* Right shin */}
          <path d="M75 100 L76 102 L78 135 L64 135 L62 100 Z" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />
          {/* Right foot */}
          <ellipse cx="71" cy="138" rx="8" ry="3.5" fill="url(#innerGrad)" stroke="url(#bodyGrad)" strokeWidth="0.4" />

          {/* Body circuit lines (AR detail) */}
          <line x1="50" y1="17" x2="50" y2="68" stroke="#00d4ff" strokeWidth="0.3" strokeOpacity="0.4" strokeDasharray="2,3" />
          <line x1="32" y1="35" x2="68" y2="35" stroke="#00d4ff" strokeWidth="0.2" strokeOpacity="0.3" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="#00d4ff" strokeWidth="0.2" strokeOpacity="0.3" />

          {/* Hotspot dots */}
          {Object.entries(MEDICAL_ISSUES).map(([key, data]) => {
            const sev = SEVERITY_COLORS[data.severity];
            const isActive = activeHotspot === key;
            return (
              <g key={key}
                onMouseDown={() => startHold(key)}
                onMouseUp={() => endHold(key)}
                onMouseLeave={() => endHold(key)}
                onTouchStart={() => startHold(key)}
                onTouchEnd={() => endHold(key)}
                style={{ cursor: 'pointer' }}>
                {/* Outer pulsing ring */}
                <circle
                  cx={data.cx} cy={data.cy} r={isActive ? 8 : 6}
                  fill="none"
                  stroke={sev.ring}
                  strokeWidth={isActive ? 1.5 : 0.8}
                  strokeOpacity={isActive ? 1 : 0.7}
                  className={isActive ? '' : 'animate-ping'}
                  style={{ animationDuration: '1.8s' }}
                />
                {/* Inner dot */}
                <circle
                  cx={data.cx} cy={data.cy} r={isActive ? 4 : 2.5}
                  fill={sev.ring}
                  fillOpacity={isActive ? 1 : 0.85}
                  filter="url(#holo-glow)"
                />
                {/* Plus cross indicator */}
                <line x1={data.cx - 3} y1={data.cy} x2={data.cx + 3} y2={data.cy} stroke={sev.ring} strokeWidth="0.6" strokeOpacity="0.9" />
                <line x1={data.cx} y1={data.cy - 3} x2={data.cx} y2={data.cy + 3} stroke={sev.ring} strokeWidth="0.6" strokeOpacity="0.9" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* AR corner brackets */}
      {['tl','tr','bl','br'].map(pos => (
        <div key={pos} className={
          `absolute w-8 h-8 border-cyan-400/60 ${
            pos === 'tl' ? 'top-4 left-4 border-t-2 border-l-2' :
            pos === 'tr' ? 'top-4 right-4 border-t-2 border-r-2' :
            pos === 'bl' ? 'bottom-4 left-4 border-b-2 border-l-2' :
            'bottom-4 right-4 border-b-2 border-r-2'
          }`}
        />
      ))}

      {/* AR status bar */}
      <div className="absolute top-3 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur border border-cyan-500/30 rounded-full px-4 py-1 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-300">BIOTWIN · HOLOGRAPHIC BODY SIM · {view.toUpperCase()} VIEW</span>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

// ─── Medical Issue Popup ──────────────────────────────────────────────────────
const IssuePopup = ({ issue, onClose }) => {
  if (!issue) return null;
  const data = MEDICAL_ISSUES[issue];
  const sev = SEVERITY_COLORS[data.severity];
  const Icon = data.icon;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm rounded-2xl"
      onClick={onClose}>
      <div className="relative w-full max-w-xs mx-4 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl shadow-cyan-900/50"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #0a1128 100%)' }}
        onClick={e => e.stopPropagation()}>

        {/* Top glow bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${sev.ring}, transparent)` }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `rgba(${data.severity === 'high' ? '239,68,68' : '245,158,11'},0.15)`, border: `1px solid ${sev.ring}` }}>
                <Icon className="w-5 h-5" style={{ color: sev.ring }} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 mb-0.5">
                  {data.label}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.badge}`}>
                  {data.severity.toUpperCase()} SEVERITY
                </span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Issues */}
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/60 mb-2">Diagnosed Conditions</p>
            {data.issues.map((issue, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sev.ring }} />
                <span className="text-xs font-semibold text-white">{issue}</span>
              </div>
            ))}
          </div>

          {/* Clinical detail */}
          <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 mb-4">
            <p className="text-[10px] text-cyan-400/60 font-mono uppercase mb-1">Clinical Notes</p>
            <p className="text-xs text-slate-300 leading-relaxed">{data.detail}</p>
          </div>

          {/* Treatment */}
          <div className="rounded-xl overflow-hidden border border-emerald-500/30"
            style={{ background: 'rgba(16,185,129,0.08)' }}>
            <div className="px-3 py-1.5 border-b border-emerald-500/20 flex items-center gap-1.5">
              <Pill className="w-3 h-3 text-emerald-400" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Treatment Protocol</p>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-xs font-semibold text-emerald-300">{data.treatment}</p>
            </div>
          </div>
        </div>

        {/* Bottom scan effect */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />
      </div>
    </div>
  );
};

// ─── Holographic Body Viewer (Main Component) ─────────────────────────────────
const HolographicBodyViewer = ({ patient }) => {
  const [activeView, setActiveView] = useState('front');
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [pinnedHotspot, setPinnedHotspot] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotating, setRotating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const rotateInterval = useRef(null);
  const viewOrder = ['front', 'right', 'back', 'left'];

  // Auto rotation
  useEffect(() => {
    if (autoRotate) {
      rotateInterval.current = setInterval(() => {
        setActiveView(prev => {
          const idx = viewOrder.indexOf(prev);
          return viewOrder[(idx + 1) % viewOrder.length];
        });
      }, 2500);
    }
    return () => clearInterval(rotateInterval.current);
  }, [autoRotate]);

  const handleHold = (key) => {
    setActiveHotspot(key);
    setPinnedHotspot(key);
  };

  const handleRelease = () => {
    setActiveHotspot(null);
  };

  const closePopup = () => {
    setPinnedHotspot(null);
    setActiveHotspot(null);
  };

  const issues = Object.values(MEDICAL_ISSUES);
  const highCount = issues.filter(i => i.severity === 'high').length;
  const modCount = issues.filter(i => i.severity === 'moderate').length;

  return (
    <div className="rounded-2xl overflow-hidden border border-cyan-900/50 shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #060e1c 0%, #020810 100%)' }}>

      {/* Top header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 text-xs font-bold font-mono tracking-wider">
              HOLOGRAPHIC BODY SIMULATION
            </span>
          </div>
          <span className="text-slate-600 text-xs">|</span>
          <span className="text-slate-400 text-xs font-mono">
            {patient?.name || 'John Doe'} · {patient?.age || '55'}y
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-bold bg-rose-950/50 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{highCount} Critical
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-950/50 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{modCount} Moderate
          </span>
        </div>
      </div>

      <div className="flex gap-0">

        {/* LEFT: View controls */}
        <div className="flex flex-col items-center justify-center gap-2 px-3 py-6 border-r border-cyan-900/30 bg-black/30">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => { setActiveView(v.id); setAutoRotate(false); }}
              title={v.label}
              className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 border text-[10px] font-bold font-mono ${
                activeView === v.id
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                  : 'bg-black/30 border-slate-700/40 text-slate-500 hover:border-cyan-700/50 hover:text-cyan-500'
              }`}>
              <v.icon className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none">{v.label.slice(0,1)}</span>
            </button>
          ))}
          <div className="h-px w-6 bg-cyan-900/50 my-1" />
          <button
            onClick={() => setAutoRotate(r => !r)}
            title="Auto Rotate"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
              autoRotate
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-black/30 border-slate-700/40 text-slate-500 hover:border-emerald-700/40'
            }`}>
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/30 border border-slate-700/40 text-slate-500 hover:border-cyan-700/40 hover:text-cyan-500 transition">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/30 border border-slate-700/40 text-slate-500 hover:border-cyan-700/40 hover:text-cyan-500 transition">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CENTER: Body viewer */}
        <div className="flex-1 relative" style={{ minHeight: 520 }}>
          <div className="w-full h-full" style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s', transformOrigin: 'center' }}>
            <HoloBody
              activeHotspot={activeHotspot}
              onHotspotHold={handleHold}
              onHotspotRelease={handleRelease}
              view={activeView}
            />
          </div>
          {/* Popup overlay */}
          {pinnedHotspot && <IssuePopup issue={pinnedHotspot} onClose={closePopup} />}
        </div>

        {/* RIGHT: Issue list */}
        <div className="w-44 flex flex-col gap-1 px-2 py-4 border-l border-cyan-900/30 bg-black/30 overflow-y-auto"
          style={{ maxHeight: 520 }}>
          <p className="text-[9px] font-mono uppercase tracking-widest text-cyan-500/50 px-1 mb-1">Issue Map</p>
          {Object.entries(MEDICAL_ISSUES).map(([key, data]) => {
            const sev = SEVERITY_COLORS[data.severity];
            return (
              <button
                key={key}
                onClick={() => { setPinnedHotspot(key); setActiveHotspot(key); }}
                className={`text-left p-2 rounded-xl border transition-all group ${
                  activeHotspot === key || pinnedHotspot === key
                    ? 'border-cyan-500/60 bg-cyan-950/40'
                    : 'border-slate-800/60 bg-black/20 hover:border-slate-600/60'
                }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                  <span className="text-[10px] font-bold text-slate-300 leading-tight">{data.label}</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight pl-3.5">{data.issues[0]}</p>
              </button>
            );
          })}
          <p className="text-[9px] text-slate-600 text-center mt-2 font-mono px-1">
            Click a hotspot or press + hold on the body
          </p>
        </div>
      </div>

      {/* Bottom instruction bar */}
      <div className="px-5 py-2.5 border-t border-cyan-900/30 bg-black/40 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-mono">
          <span className="text-cyan-500">●</span> Press + hold red/amber dots on body to inspect · Click issue list to pin popup
        </p>
        <p className="text-[10px] text-slate-600 font-mono">
          {zoom.toFixed(1)}× zoom · {activeView.toUpperCase()} VIEW
        </p>
      </div>
    </div>
  );
};

export default HolographicBodyViewer;
