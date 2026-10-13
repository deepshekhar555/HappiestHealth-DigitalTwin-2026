"use client";
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-2">{String(label).startsWith('Day') ? label : `Day ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-semibold text-slate-900">{Math.round(entry.value)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const OutcomeTrajectoryChart = ({
  trajectory = null,
  hasConsensus = false,
  className = '',
}) => {
  const chartData = Array.isArray(trajectory) ? trajectory : [];

  return (
    <div className={`premium-surface p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Modeled Outcome Trajectory
            </p>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Illustrative projection from the consensus model
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Model output only — this is not measured patient progress or a validated clinical prediction.
          </p>
        </div>
        {hasConsensus && chartData.length > 0 && (
          <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            Model projection
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
              {/* Baseline (Pre-Consensus) Line */}
              <Line
                type="monotone"
                dataKey="Baseline (Pre-Consensus)"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={{ r: 4, fill: '#94a3b8' }}
              />
              {/* Multi-Agent Consensus Protocol Line */}
              <Line
                type="monotone"
                dataKey="Multi-Agent Consensus Protocol"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {hasConsensus ? 'No trajectory data was returned.' : 'Run consensus to request a model projection.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend explanation */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        {chartData.length > 0 && (
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 border-t-2 border-dashed border-slate-400" />
              <span className="text-slate-500">Baseline model</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">Consensus model</span>
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          Higher values are interpreted by this prototype as more favorable model scores. Projections require clinical review and must not be treated as observed outcomes.
        </p>
      </div>
    </div>
  );
};

export default OutcomeTrajectoryChart;
