"use client";
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  Flame, 
  Wind, 
  Brain, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

export default function LiveTelemetryCommandCenter({ onTriggerConsensus }) {
  const [telemetry, setTelemetry] = useState(null);
  const [activeScenario, setActiveScenario] = useState('01_baseline_stable');
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState(null);

  // Poll live telemetry every 1 second
  useEffect(() => {
    let interval = null;
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/telemetry/live');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setTelemetry(json.data);
            if (json.data.adverseEvaluation?.predictedEvents?.length > 0) {
              setSelectedThreat(json.data.adverseEvaluation.predictedEvents[0]);
            }
          }
        }
      } catch (err) {
        // Fallback simulated tick if API is still connecting
      }
    };

    fetchLive();
    interval = setInterval(fetchLive, 1000);
    return () => clearInterval(interval);
  }, []);

  const switchScenario = async (id) => {
    setActiveScenario(id);
    try {
      await fetch('/api/telemetry/scenario/' + id, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const currentVitals = telemetry?.currentVitals || {
    heartRate: 74,
    systolicBP: 122,
    diastolicBP: 80,
    spo2: 98,
    temperature: 36.8,
    glucose: 104
  };

  const hemo = telemetry?.hemodynamics || {
    map: 94.0,
    shockIndex: 0.61,
    cardiacStress: 14.8,
    heartWorkload: 10836,
    compositeRiskScore: 18.5
  };

  const organs = telemetry?.organHealth || { heart: 95, lungs: 98, brain: 96, kidneys: 92 };
  const adverse = telemetry?.adverseEvaluation || { overallStatus: 'STABLE', predictedEvents: [] };

  const isCritical = adverse.overallStatus === 'CRITICAL';
  const isWarning = adverse.overallStatus === 'WARNING';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 mb-8 backdrop-blur-md">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-rose-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              IoT & Wearable Real-Time Digital Twin
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                1 Hz Continuous Ingestion
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fusing Baseline EHR with High-Frequency Biosensors • Physics-Informed Hemodynamic State Engine
          </p>
        </div>

        {/* SCENARIO SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Simulate Clinical Crisis:</span>
          <select 
            value={activeScenario} 
            onChange={(e) => switchScenario(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="01_baseline_stable">1. Stable Baseline Patient</option>
            <option value="02_acute_cardiac_arrest">2. Impending Cardiac Arrest / MI</option>
            <option value="03_septic_shock_deterioration">3. Septic Shock Progression</option>
            <option value="04_hypertensive_emergency">4. Hypertensive Crisis & Stroke</option>
          </select>
        </div>
      </div>

      {/* ADVERSE EVENT EARLY WARNING BANNER */}
      {adverse.predictedEvents?.length > 0 && (
        <div className={`mt-5 p-4 rounded-xl border flex items-start gap-4 transition-all duration-300 ${
          isCritical 
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
        }`}>
          <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${isCritical ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm tracking-wide flex items-center gap-2">
                {adverse.predictedEvents[0].title}
                <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-black/40 border border-white/10">
                  Risk: {adverse.predictedEvents[0].probability}% • ETA: {adverse.predictedEvents[0].estimatedTimeToEvent}
                </span>
              </h4>
              {onTriggerConsensus && (
                <button
                  onClick={() => onTriggerConsensus(adverse.predictedEvents[0])}
                  className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Summon AI Clinical Board
                </button>
              )}
            </div>
            <p className="text-xs mt-1 text-slate-300 font-mono">
              <strong>Primary Drivers:</strong> {adverse.predictedEvents[0].primaryDrivers.join(' • ')}
            </p>
            <p className="text-xs mt-1 text-slate-200">
              <strong>Actionable Protocol:</strong> {adverse.predictedEvents[0].recommendedAction}
            </p>
          </div>
        </div>
      )}

      {/* VITALS TELEMETRY & HEMODYNAMICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
        {/* HEART RATE */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Heart Rate</span>
            <Heart className={`w-4 h-4 ${currentVitals.heartRate > 100 || currentVitals.heartRate < 60 ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{currentVitals.heartRate}</span>
            <span className="text-xs text-slate-400">bpm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Stress: {hemo.cardiacStress}</div>
        </div>

        {/* BLOOD PRESSURE & MAP */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Arterial Pressure</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{currentVitals.systolicBP}/{currentVitals.diastolicBP}</span>
            <span className="text-xs text-slate-400">mmHg</span>
          </div>
          <div className="text-[10px] text-cyan-300 mt-1 font-mono font-semibold">MAP: {hemo.map} mmHg</div>
        </div>

        {/* SHOCK INDEX */}
        <div className={`border rounded-xl p-3.5 ${
          hemo.shockIndex >= 0.9 
            ? 'bg-rose-950/40 border-rose-600/60' 
            : hemo.shockIndex >= 0.7 
              ? 'bg-amber-950/30 border-amber-600/50' 
              : 'bg-slate-800/80 border-slate-700/60'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Shock Index (HR/SBP)</span>
            <AlertTriangle className={`w-4 h-4 ${hemo.shockIndex >= 0.9 ? 'text-rose-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${hemo.shockIndex >= 0.9 ? 'text-rose-300' : 'text-white'}`}>
              {hemo.shockIndex}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {hemo.shockIndex >= 0.9 ? 'Severe Shock' : hemo.shockIndex >= 0.7 ? 'Elevated' : 'Normal'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Pulse Pres: {hemo.pulsePressure} mmHg</div>
        </div>

        {/* SPO2 */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>O2 Saturation</span>
            <Wind className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${currentVitals.spo2 < 92 ? 'text-rose-400' : 'text-white'}`}>
              {currentVitals.spo2}%
            </span>
            <span className="text-xs text-slate-400">SpO2</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">Resp Rate: {currentVitals.respiratoryRate || 16}/min</div>
        </div>

        {/* CORE TEMP */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Body Temperature</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">{currentVitals.temperature}°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {currentVitals.temperature > 38.0 ? 'Febrile / SIRS' : 'Normothermia'}
          </div>
        </div>

        {/* COMPOSITE RISK GAUGE */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Digital Twin Risk</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-purple-300">{hemo.compositeRiskScore}%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">ML Physics Index</div>
        </div>
      </div>

      {/* DYNAMIC ORGAN SYSTEM VITALITY MATRIX */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Virtual Patient Organ System Vitality (Real-Time Physics Model)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Cardiovascular', key: 'heart', score: organs.heart, icon: Heart, desc: 'Myocardial Perfusion' },
            { name: 'Pulmonary', key: 'lungs', score: organs.lungs, icon: Wind, desc: 'Gas Exchange & SpO2' },
            { name: 'Cerebrovascular', key: 'brain', score: organs.brain, icon: Brain, desc: 'Cerebral Perfusion Pressure' },
            { name: 'Renal / Nephro', key: 'kidneys', score: organs.kidneys, icon: Activity, desc: 'Glomerular Filtration Perfusion' },
          ].map((org) => {
            const isLow = org.score < 60;
            const isMedium = org.score >= 60 && org.score < 85;
            return (
              <div key={org.key} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <org.icon className="w-3.5 h-3.5 text-slate-400" />
                    {org.name}
                  </span>
                  <span className={`text-xs font-bold font-mono ${isLow ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {org.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${isLow ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${org.score}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">{org.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
