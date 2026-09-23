"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import {
  Activity, AlertTriangle, CheckCircle2, ChevronRight,
  RefreshCw, RotateCcw, Footprints, TrendingUp, TrendingDown,
  ShieldCheck, Zap, Heart, Wind, Flame, Gauge, Stethoscope, Thermometer, Droplet
} from 'lucide-react';
import { getSessions, recordSession, resetSessions } from '../api/apiClient';

// ─── Custom chart tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3.5 shadow-xl border border-slate-200 text-sm z-50 min-w-[180px]">
      <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Session #{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 text-xs font-medium">{entry.name}:</span>
            </div>
            <span className="font-bold text-slate-900 text-xs">
              {entry.value}
              {entry.name === 'Heart Rate' ? ' bpm' : entry.name === 'Cadence' ? ' spm' : entry.name === 'Temperature' ? '°C' : entry.name === 'Glucose' ? ' mg/dL' : '%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Risk level badge ────────────────────────────────────────────────────────
const RiskBadge = ({ level }) => {
  const cfg = {
    Low:      { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Moderate: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
    High:     { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500'     },
  };
  const c = cfg[level] || cfg.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {level} Risk
    </span>
  );
};

// ─── Explainability factor row ───────────────────────────────────────────────
const FactorRow = ({ factor }) => {
  const isRisk = factor.direction === 'risk';
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          {isRisk
            ? <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
            : <TrendingUp   className="w-4 h-4 text-emerald-500 shrink-0" />
          }
          <div>
            <span className="text-xs font-semibold text-slate-800">{factor.name}</span>
            {factor.category && (
              <span className="ml-2 text-[10px] text-slate-400 font-mono uppercase">
                [{factor.category}]
              </span>
            )}
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0
          ${isRisk ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          {isRisk ? '↑ Risk' : '↓ Risk'}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${isRisk ? 'bg-rose-400' : 'bg-emerald-400'}`}
          style={{ width: `${Math.min(factor.weight, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{factor.detail}</p>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const GaitSessionPanel = () => {
  const [sessions, setSessions]             = useState([]);
  const [latestSession, setLatestSession]   = useState(null);
  const [explainability, setExplainability] = useState(null);
  const [recording, setRecording]           = useState(false);
  const [cooldown, setCooldown]             = useState(false);
  const [error, setError]                   = useState(null);
  const [activeLines, setActiveLines]       = useState({
    symmetryScore: true,
    fallRiskScore: true,
    heartRate:     true,
    spo2:          false,
    temperature:   false,
    glucose:       false,
  });

  // Load existing sessions on mount
  const loadSessions = useCallback(async () => {
    try {
      const res = await getSessions();
      if (res.data.sessions?.length) {
        setSessions(res.data.sessions);
        setLatestSession(res.data.sessions[res.data.sessions.length - 1]);
      }
    } catch {
      // backend may not be running yet
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleRecord = async () => {
    if (recording || cooldown) return;
    setRecording(true);
    setError(null);
    try {
      const res = await recordSession();
      const { session, explainability: xai } = res.data;
      setSessions(prev => {
        const next = [...prev, session];
        return next.length > 30 ? next.slice(-30) : next;
      });
      setLatestSession(session);
      setExplainability(xai);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 1000);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not reach backend metrics service.');
    } finally {
      setRecording(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetSessions();
      setSessions([]);
      setLatestSession(null);
      setExplainability(null);
    } catch {
      setSessions([]);
      setLatestSession(null);
      setExplainability(null);
    }
  };

  const toggleLine = (key) =>
    setActiveLines(prev => ({ ...prev, [key]: !prev[key] }));

  // Map sessions into chart-friendly shape
  const chartData = sessions.map(s => ({
    session:         s.sessionId,
    'Gait Symmetry': s.symmetryScore,
    'Fall Risk':     s.fallRiskScore,
    'Heart Rate':    s.heartRate,
    'SpO2':         s.spo2,
    'Temperature':   s.temperature,
    'Glucose':       s.glucose,
  }));

  return (
    <div className="space-y-6">

      {/* ── Header row ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Metrics Service · Full-Spectrum Health & Biomechanical Engine
            </p>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Virtual Patient Digital Twin Vitals</h2>
          <p className="text-sm text-slate-500 mt-1">
            Correlating walking mechanics, cardiovascular hemodynamics, pulmonary saturation, and metabolic vitals.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          title="Reset session history"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Record New Session button ── */}
      <button
        id="gait-record-session-btn"
        onClick={handleRecord}
        disabled={recording || cooldown}
        className={`w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-5 font-bold text-lg transition-all duration-200 shadow-xl
          ${recording || cooldown
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white shadow-emerald-200'
          }`}
      >
        {recording ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Synchronizing All Digital Twin Vitals…
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Record New Rehabilitation & Vital Session
            <span className="ml-1 text-sm font-normal opacity-80">
              {sessions.length > 0 ? `(Session ${sessions.length + 1})` : '(Session 1)'}
            </span>
          </>
        )}
      </button>

      {/* ── Multi-Metric Trend Chart ── */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Multi-System Vital Trajectory
            {sessions.length > 0 && (
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded)
              </span>
            )}
          </h3>

          {/* Metric Toggle Filters */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'Gait Symmetry', color: '#10b981', stateKey: 'symmetryScore' },
              { key: 'Fall Risk',     color: '#f43f5e', stateKey: 'fallRiskScore' },
              { key: 'Heart Rate',    color: '#0284c7', stateKey: 'heartRate' },
              { key: 'SpO2',          color: '#8b5cf6', stateKey: 'spo2' },
              { key: 'Temperature',   color: '#f59e0b', stateKey: 'temperature' },
              { key: 'Glucose',       color: '#06b6d4', stateKey: 'glucose' },
            ].map(({ key, color, stateKey }) => {
              const on = activeLines[stateKey];
              return (
                <button
                  key={key}
                  onClick={() => toggleLine(stateKey)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-semibold transition
                    ${on ? 'text-white border-transparent' : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  style={on ? { backgroundColor: color } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? 'white' : color }} />
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Activity className="w-10 h-10 mb-2 opacity-30 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-600">No session telemetry recorded yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Record New Rehabilitation & Vital Session" above to start.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="session"
                  tickLine={false} axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => `S${v}`}
                />
                <YAxis
                  domain={[20, 125]}
                  tickLine={false} axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={80} stroke="#cbd5e1" strokeDasharray="4 4"
                  label={{ value: 'Target Symmetry (80%)', position: 'right', fill: '#94a3b8', fontSize: 10 }} />
                {activeLines.symmetryScore && (
                  <Line type="monotone" dataKey="Gait Symmetry" stroke="#10b981" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }} />
                )}
                {activeLines.fallRiskScore && (
                  <Line type="monotone" dataKey="Fall Risk" stroke="#f43f5e" strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }} />
                )}
                {activeLines.heartRate && (
                  <Line type="monotone" dataKey="Heart Rate" stroke="#0284c7" strokeWidth={2}
                    dot={{ r: 3.5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5 }} />
                )}
                {activeLines.spo2 && (
                  <Line type="monotone" dataKey="SpO2" stroke="#8b5cf6" strokeWidth={2}
                    dot={{ r: 3, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5 }} />
                )}
                {activeLines.temperature && (
                  <Line type="monotone" dataKey="Temperature" stroke="#f59e0b" strokeWidth={2}
                    dot={{ r: 3, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5 }} />
                )}
                {activeLines.glucose && (
                  <Line type="monotone" dataKey="Glucose" stroke="#06b6d4" strokeWidth={2}
                    dot={{ r: 3, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Latest session detailed breakdown: 4 Grid Sections ── */}
      {latestSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* 1. Biomechanical Mobility */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Footprints className="w-4 h-4 text-emerald-600" />
              Gait & Mobility
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Symmetry',  value: latestSession.symmetryScore + '%', color: latestSession.symmetryScore >= 80 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Fall Risk', value: latestSession.fallRiskScore + '%',  color: latestSession.fallRiskScore < 45 ? 'text-emerald-600' : 'text-rose-600' },
                { label: 'Cadence',   value: latestSession.cadence + ' spm',    color: 'text-slate-800' },
                { label: 'Stride',    value: latestSession.strideLength + ' m', color: 'text-slate-800' },
                { label: 'Speed',     value: latestSession.walkingSpeed + ' m/s', color: 'text-slate-800' },
                { label: 'Dominance', value: latestSession.dominantSide,         color: 'text-indigo-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{label}</p>
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Cardiovascular & Hemodynamics */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-500" />
              Cardio & Hemodynamics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Heart Rate',  value: latestSession.heartRate + ' bpm', color: latestSession.heartRate > 100 ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Blood Press', value: latestSession.bloodPressure,      color: 'text-slate-800' },
                { label: 'MAP (Mean)',  value: latestSession.map + ' mmHg',      color: 'text-slate-800' },
                { label: 'Shock Index', value: latestSession.shockIndex,         color: latestSession.shockIndex > 0.8 ? 'text-rose-600' : 'text-emerald-600' },
                { label: 'Card. Stress',value: latestSession.cardiacStress + '%', color: 'text-sky-600' },
                { label: 'ECG Rhythm',  value: latestSession.ecgStatus.split(' ')[0], color: 'text-indigo-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{label}</p>
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pulmonary & Metabolic Vitals */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Thermometer className="w-4 h-4 text-amber-500" />
              Pulmonary & Metabolic
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'SpO2 Sat',   value: latestSession.spo2 + '%',         color: latestSession.spo2 >= 96 ? 'text-emerald-600' : 'text-rose-600' },
                { label: 'Resp Rate',  value: latestSession.respiratoryRate + ' /min', color: 'text-slate-800' },
                { label: 'Core Temp',  value: latestSession.temperature + '°C', color: latestSession.temperature > 37.1 ? 'text-amber-600' : 'text-slate-800' },
                { label: 'Glucose',    value: latestSession.glucose + ' mg/dL', color: 'text-cyan-700' },
                { label: 'Calories',   value: latestSession.caloriesBurned + ' kcal', color: 'text-orange-600' },
                { label: 'Exertion',   value: latestSession.exertionIndex + '%', color: 'text-sky-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{label}</p>
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. AI Explainability & Synthesis */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-1 text-xs uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  Clinical AI XAI
                </h3>
                {explainability && (
                  <div className="flex items-center gap-1">
                    <RiskBadge level={explainability.riskLevel} />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {explainability.confidenceScore}%
                    </span>
                  </div>
                )}
              </div>

              {explainability?.clinicalRecommendation && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2 mb-2 text-[11px] text-indigo-900 leading-snug font-medium">
                  {explainability.clinicalRecommendation}
                </div>
              )}

              {explainability ? (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                  {explainability.factors.slice(0, 4).map((f, i) => (
                    <FactorRow key={i} factor={f} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 text-slate-400">
                  <CheckCircle2 className="w-6 h-6 mb-1 opacity-30" />
                  <p className="text-xs">Record a session to view reasoning.</p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Session #{latestSession.sessionId}</span>
              <span>{new Date(latestSession.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default GaitSessionPanel;
