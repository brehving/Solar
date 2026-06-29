/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
  Cell,
} from 'recharts';
import { 
  Sun, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Activity, 
  Gauge, 
  Wind,
  Shuffle,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Minimize
} from 'lucide-react';
import { 
  generateSinglePanelCurve, 
  generateComparisonCurve, 
  getIrradianceForTime, 
  calculateOperatingState,
  calculateMinIrradianceForFullSpeed
} from '../utils/solarCalculations';

interface SizingChartsProps {
  panelWattage: number;
  currentIrradiance: number;
  coolerWattage: number;
  availablePower: number;
  mpptEfficiency: number;
  simulatedHour?: number;
  setSimulatedHour?: (hour: number) => void;
  setIrradiancePercent?: (irr: number) => void;
  setIsTimeSimActive?: (active: boolean) => void;
}

export function SizingCharts({
  panelWattage,
  currentIrradiance,
  coolerWattage,
  availablePower,
  mpptEfficiency,
  simulatedHour = 12,
  setSimulatedHour,
  setIrradiancePercent,
  setIsTimeSimActive,
}: SizingChartsProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Navigation Tabs: 'design' (solar curves, crossover, panel size limits) or 'daily' (solar/fan timeline logs)
  const [activeTab, setActiveTab] = useState<'design' | 'daily'>('design');
  const [designSubTab, setDesignSubTab] = useState<'panel-output' | 'crossover' | 'limits'>('crossover');
  const [dailySubTab, setDailySubTab] = useState<'solar-profile' | 'fan-speed' | 'timeline'>('timeline');

  // Core calculus data curves
  const singlePanelData = useMemo(() => {
    return generateSinglePanelCurve(panelWattage, coolerWattage, mpptEfficiency);
  }, [panelWattage, coolerWattage, mpptEfficiency]);

  const comparisonData = useMemo(() => {
    return generateComparisonCurve(coolerWattage, mpptEfficiency);
  }, [coolerWattage, mpptEfficiency]);

  // Hourly Performance Calculations (Hour 6 AM to 6 PM)
  const dailySimulationData = useMemo(() => {
    const data = [];
    for (let hr = 6; hr <= 18; hr++) {
      const irr = getIrradianceForTime(hr);
      const state = calculateOperatingState(panelWattage, irr, coolerWattage, mpptEfficiency);
      const label = hr === 12 ? '12 PM' : hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
      data.push({
        hour: hr,
        timeLabel: label,
        irradiance: irr,
        'Available PV Power (W)': state.availablePower,
        'Cooler Requirement (W)': state.coolerLoad,
        'Fan Speed (%)': state.fanSpeed,
        mode: state.mode,
      });
    }
    return data;
  }, [panelWattage, coolerWattage, mpptEfficiency]);

  // Sizing Feasibility Study Bar Data
  const sizingLimitsData = useMemo(() => {
    const sizes = [50, 75, 100, 150, 200];
    return sizes.map(size => {
      const minIrr = calculateMinIrradianceForFullSpeed(size, coolerWattage, mpptEfficiency);
      const isFeasible = minIrr !== 'unreachable';
      return {
        panelSize: `${size}W`,
        sizeVal: size,
        'Min Irradiance for Full Speed (%)': isFeasible ? (minIrr as number) : 100,
        isFeasible,
        displayLabel: isFeasible ? `${minIrr}%` : 'Incompatible',
      };
    });
  }, [coolerWattage, mpptEfficiency]);

  // Power Balance calculations
  const balance = Math.round((availablePower - coolerWattage) * 10) / 10;
  const balanceStatus = balance >= 0 ? 'surplus' : balance >= -10 ? 'low-balanced' : 'deficit';

  // Highlight regions for Crossover limits
  // Full Speed Region: power available >= coolerWattage
  // Reduced Speed Region: power available >= 25% of coolerWattage and < coolerWattage
  // Shutdown Region: power available < 25% of coolerWattage
  const regions = useMemo(() => {
    const minIrrForFull = calculateMinIrradianceForFullSpeed(panelWattage, coolerWattage, mpptEfficiency);
    const minIrrForLow = calculateMinIrradianceForFullSpeed(panelWattage, coolerWattage * 0.25, mpptEfficiency);
    
    const shutdownEnd = minIrrForLow === 'unreachable' ? 100 : Math.min(100, minIrrForLow as number);
    const reducedEnd = minIrrForFull === 'unreachable' ? 100 : Math.min(100, minIrrForFull as number);
    
    return {
      shutdownEnd,
      reducedEnd,
      isUnreachable: minIrrForFull === 'unreachable',
    };
  }, [panelWattage, coolerWattage, mpptEfficiency]);

  // Sync state helpers when clicking elements
  const syncToHour = (hour: number, irradiance: number) => {
    if (setSimulatedHour && setIrradiancePercent && setIsTimeSimActive) {
      setSimulatedHour(hour);
      setIrradiancePercent(irradiance);
      setIsTimeSimActive(true);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-8" id="advanced-charts-card-mobile">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <Activity className="w-6 h-6 text-indigo-500 animate-[pulse_2s_infinite]" />
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">Solar Curves & Simulation Hub</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Advanced engineering curves & daylight simulation</p>
          </div>
        </div>

        {/* Chart 1: Power Crossover Analysis */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider block">1. Power Crossover Analysis</span>
            <h4 className="text-base font-black text-slate-900 mt-1">Usable DC Power vs Cooler Load Threshold</h4>
          </div>
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            <span className="font-extrabold text-slate-950">Interpretation:</span> Blue line represents your <span className="font-bold text-indigo-600 font-mono">{panelWattage}W Panel</span>. Red dashed line is the fixed <span className="font-bold text-rose-600 font-mono">{coolerWattage}W load</span>.
          </div>
          <div className="h-[440px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={singlePanelData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="irradiance" unit="%" fontSize={9} stroke="#94a3b8" tickLine={false} label={{ value: 'Sun Irradiance (%)', position: 'bottom', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis unit="W" fontSize={9} stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <ReferenceArea {...({ x1: 0, x2: regions.shutdownEnd, fill: "rgba(244, 63, 94, 0.05)" } as any)} />
                <ReferenceArea {...({ x1: regions.shutdownEnd, x2: regions.reducedEnd, fill: "rgba(234, 179, 8, 0.05)" } as any)} />
                <ReferenceArea {...({ x1: regions.reducedEnd, x2: 100, fill: "rgba(16, 185, 129, 0.05)" } as any)} />
                <Line type="monotone" name="Usable Power" dataKey="Power Produced (W)" stroke="#4f46e5" strokeWidth={3} dot={false} />
                <ReferenceLine y={coolerWattage} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Cooler Load', position: 'insideTopLeft', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Multi-Panel Output Study */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider block">2. Multi-Panel Output Study</span>
            <h4 className="text-base font-black text-slate-900 mt-1">Usable Wattage Across Standard Sizes</h4>
          </div>
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            Compare options side-by-side to evaluate shading and cloudy day tolerance.
          </div>
          <div className="h-[440px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="irradiance" unit="%" fontSize={9} stroke="#94a3b8" tickLine={false} label={{ value: 'Sun Irradiance (%)', position: 'bottom', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis unit="W" fontSize={9} stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <Line type="monotone" dataKey="50W Panel" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="75W Panel" stroke="#f59e0b" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="100W Panel" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="150W Panel" stroke="#a855f7" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="200W Panel" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <ReferenceLine y={coolerWattage} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                <Legend verticalAlign="bottom" height={44} iconSize={10} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '15px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Minimum Irradiance per Size */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider block">3. Min Irradiance for Full Speed</span>
            <h4 className="text-base font-black text-slate-900 mt-1">Irradiance (%) Required for Peak Fan RPM</h4>
          </div>
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            Lower irradiance threshold means the cooler stays active longer throughout the day.
          </div>
          <div className="h-[440px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizingLimitsData} margin={{ top: 20, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="panelSize" fontSize={9} stroke="#94a3b8" tickLine={false} label={{ value: 'Standard Solar Arrays', position: 'bottom', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis fontSize={9} stroke="#94a3b8" tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <Bar name="Min Sun Needed (%)" dataKey="Min Irradiance for Full Speed (%)" radius={[6, 6, 0, 0]} maxBarSize={30}>
                  {sizingLimitsData.map((entry, idx) => {
                    const isActive = entry.sizeVal === panelWattage;
                    return (
                      <Cell key={idx} fill={isActive ? '#4f46e5' : entry.isFeasible ? '#10b981' : '#f43f5e'} />
                    );
                  })}
                </Bar>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daylight Mode Timeline */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider block">4. Direct-PV Operational Timeline</span>
            <h4 className="text-base font-black text-slate-900 mt-1">Hour-by-hour forecast (6:00 AM - 6:00 PM)</h4>
          </div>
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            Tap any hour slot to synchronize conditions with the main calculator workspace.
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dailySimulationData.map(pt => {
              const isSelected = simulatedHour === pt.hour;
              let modeStyle = '';
              if (pt.mode === 'Full Speed') modeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              else if (pt.mode === 'Normal Mode') modeStyle = 'bg-sky-50 text-sky-800 border-sky-200';
              else if (pt.mode === 'Eco Mode') modeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
              else if (pt.mode === 'Low Mode') modeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
              else modeStyle = 'bg-rose-50 text-rose-800 border-rose-100';

              return (
                <button
                  key={pt.hour}
                  onClick={() => syncToHour(pt.hour, pt.irradiance)}
                  className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${modeStyle} ${
                    isSelected ? 'ring-2 ring-indigo-500 font-bold shadow-md scale-[1.01]' : 'opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[9px] font-bold text-slate-500">
                    <span>{pt.timeLabel}</span>
                    <span>{pt.irradiance}% Sun</span>
                  </div>
                  <div className="font-extrabold text-sm mt-1.5 truncate">{pt.mode}</div>
                  <div className="text-[9px] font-mono mt-1.5 flex justify-between items-center opacity-85">
                    <span>{pt['Available PV Power (W)']}W</span>
                    <span>Fan: {pt['Fan Speed (%)']}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 5: Daily Available Power Profile */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider block">5. Daily Available Power Profile</span>
            <h4 className="text-base font-black text-slate-900 mt-1">Chronological Solar Production vs Load</h4>
          </div>
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            Daily curve showing direct-drive solar production versus steady cooler power demand.
          </div>
          <div className="h-[440px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySimulationData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" fontSize={9} stroke="#94a3b8" tickLine={false} label={{ value: 'Daylight Hour Profile', position: 'bottom', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis unit="W" fontSize={9} stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <Line type="monotone" name="Solar Power Available" dataKey="Available PV Power (W)" stroke="#f59e0b" strokeWidth={3} dot={false} />
                <ReferenceLine y={coolerWattage} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Cooler Demand', position: 'insideTopLeft', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Dynamic Fan Speed Adaptation */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider block">6. Fan Speed Adaptation</span>
            <h4 className="text-base font-black text-slate-900 mt-1">Throttling Response under Daylight Cycle</h4>
          </div>
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            Micro-grid output throttling curve over standard daylight operational window.
          </div>
          <div className="h-[440px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySimulationData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" fontSize={9} stroke="#94a3b8" tickLine={false} label={{ value: 'Daylight Hour Profile', position: 'bottom', offset: 10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis unit="%" fontSize={9} stroke="#94a3b8" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <Line type="step" name="Fan Speed (%)" dataKey="Fan Speed (%)" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-900 text-white rounded-3xl p-5.5 space-y-3 font-mono text-xs border border-slate-800 shadow-md">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Micro-Grid Status Summary</div>
          <div className="flex justify-between items-center text-sm font-extrabold border-b border-slate-800 pb-2.5">
            <span>Power Balance:</span>
            <span className={balance >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {balance >= 0 ? `+${balance}W Surplus` : `${balance}W Deficit`}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
            Solar direct drive controllers operate at {Math.round(mpptEfficiency * 100)}% peak MPPT tracking optimization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full" id="advanced-charts-card">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500 animate-[pulse_2s_infinite]" />
            Solar Sizing & Simulation Hub
          </h3>
          <p className="text-xs text-slate-500">
            Advanced engineering curves and time-modulation telemetry plots
          </p>
        </div>

        {/* Level 1 Navigation Tabs: Sizing vs Dynamic Simulation */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'design'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            PV Layout Study
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Daylight Simulation
          </button>
        </div>
      </div>

      {/* Level 2 Sub-Navigational Dials based on active parent tab */}
      <div className="flex flex-wrap gap-2 mb-4">
        {activeTab === 'design' ? (
          <>
            <button
              onClick={() => setDesignSubTab('crossover')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                designSubTab === 'crossover'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              1. Power Crossover Zones
            </button>
            <button
              onClick={() => setDesignSubTab('panel-output')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                designSubTab === 'panel-output'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              2. PV Output Curves (Standard Panels)
            </button>
            <button
              onClick={() => setDesignSubTab('limits')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                designSubTab === 'limits'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              3. Min Irradiance Required (%)
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setDailySubTab('timeline')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                dailySubTab === 'timeline'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              1. Mode Timeline (Sunrise-Sunset)
            </button>
            <button
              onClick={() => setDailySubTab('solar-profile')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                dailySubTab === 'solar-profile'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              2. Available Power Profile
            </button>
            <button
              onClick={() => setDailySubTab('fan-speed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                dailySubTab === 'fan-speed'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              3. Dynamic Fan Speed Adaptation
            </button>
          </>
        )}
      </div>

      {/* Render Area */}
      <div className="flex-1 flex flex-col justify-between" style={{ minHeight: '320px' }}>
        
        {/* TAB 1A: COOLER LOAD VS AVAILABLE POWER AND CROSSOVER POINT */}
        {activeTab === 'design' && designSubTab === 'crossover' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 bg-slate-50 border border-slate-250/60 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-705">
              <HelpCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Power Crossover Analysis:</span> The blue curve charts output for your selected <span className="font-semibold text-indigo-950 font-mono">{panelWattage}W Panel</span>. The red dashed line highlights the steady <span className="font-semibold text-rose-600">{coolerWattage}W load</span>. Shaded regions specify operational states automatically.
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={singlePanelData}
                  margin={{ top: 15, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="irradiance" 
                    unit="%" 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'Sun Irradiance Factor (%)', position: 'bottom', offset: -5, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    unit="W" 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'Usable DC Power (Watts)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  
                  {/* Shaded Background Regions representing motor states */}
                  <ReferenceArea
                    {...({
                      x1: 0,
                      x2: regions.shutdownEnd,
                      fill: "rgba(239, 68, 68, 0.04)",
                      label: { value: 'Shutdown', position: 'insideBottomLeft', fill: '#ef4444', fontSize: 9, fontWeight: 600, opacity: 0.8 }
                    } as any)}
                  />
                  {regions.shutdownEnd < regions.reducedEnd && (
                    <ReferenceArea
                      {...({
                        x1: regions.shutdownEnd,
                        x2: regions.reducedEnd,
                        fill: "rgba(245, 158, 11, 0.04)",
                        label: { value: 'Reduced Speed (Low/Eco/Normal)', position: 'insideBottom', fill: '#f59e0b', fontSize: 9, fontWeight: 600, opacity: 0.8 }
                      } as any)}
                    />
                  )}
                  {regions.reducedEnd < 100 && (
                    <ReferenceArea
                      {...({
                        x1: regions.reducedEnd,
                        x2: 100,
                        fill: "rgba(16, 185, 129, 0.04)",
                        label: { value: 'Full Speed Possible', position: 'insideBottomRight', fill: '#10b981', fontSize: 9, fontWeight: 600, opacity: 0.8 }
                      } as any)}
                    />
                  )}

                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                    formatter={(value: any, name: string) => [`${value} W`, name]}
                    labelFormatter={(irr) => `Irradiance Level: ${irr}%`}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />

                  {/* Available Power Curve */}
                  <Line
                    type="monotone"
                    dataKey="Available Power (W)"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                    name={`${panelWattage}W Panel Output (W)`}
                  />

                  {/* Cooler target load line */}
                  <ReferenceLine 
                    y={coolerWattage} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ value: `${coolerWattage}W Cooler Requirement`, position: 'top', fill: '#b91c1c', fontSize: 9, fontWeight: 700 }} 
                  />

                  {/* Dynamic tracking dot representing active irradiance */}
                  <ReferenceDot
                    x={currentIrradiance}
                    y={availablePower}
                    r={7}
                    fill="#eab308"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={{ value: 'Active Status', position: 'top', fill: '#a16207', fontSize: 9, fontWeight: 700 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 1B: SOLAR PANEL OUTPUT VS IRRADIANCE (COMPARE RATED SIZES) */}
        {activeTab === 'design' && designSubTab === 'panel-output' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-705">
              <Shuffle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Multi-Panel Output Study:</span> Charts of generated wattage as weather transitions from overcast (left) to clear midday peak (right). Compare options to evaluate shading tolerance buffers.
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData}
                  margin={{ top: 15, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="irradiance" 
                    unit="%" 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'Sun Irradiance Factor (%)', position: 'bottom', offset: -5, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    unit="W" 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'Usable DC Power Output (Watts)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                    formatter={(value: any, name: string) => [`${value} W`, name]}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                  
                  <Line type="monotone" dataKey="50W Panel" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
                  <Line type="monotone" dataKey="75W Panel" stroke="#f59e0b" strokeWidth={1.5} />
                  <Line type="monotone" dataKey="100W Panel" stroke="#0ea5e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="150W Panel" stroke="#a855f7" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="200W Panel" stroke="#10b981" strokeWidth={3} />
                  
                  {/* Load reference line */}
                  <ReferenceLine 
                    y={coolerWattage} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ value: `${coolerWattage}W Threshold`, position: 'bottom', fill: '#ef4444', fontSize: 9, fontWeight: 700 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 1C: PANEL SIZE VS MIN IRRADIANCE REQUIRED */}
        {activeTab === 'design' && designSubTab === 'limits' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-705">
              <Cpu className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Minimum Irradiance per Size:</span> Compares how much solar intensity (sunlight percentage) each standardized panel size needs to start operating the selected <span className="font-mono text-xs font-semibold">{coolerWattage}W cooler</span> on **Full Speed**. Smaller values mean the cooler achieves full speed earlier in the morning and holds it longer into evening!
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sizingLimitsData}
                  margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="panelSize" fontSize={10} stroke="#94a3b8" tickLine={false} />
                  <YAxis 
                    unit="%" 
                    domain={[0, 100]} 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'Sunshine Intensity Required (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    formatter={(value: any, name: string, props: any) => {
                      const item = props.payload;
                      return [item.isFeasible ? `${value}% Irradiance` : 'Not Feasible (Underpowered)', 'Requires'];
                    }}
                  />
                  <Bar dataKey="Min Irradiance for Full Speed (%)" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {sizingLimitsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.sizeVal === panelWattage
                            ? '#4f46e5' // active selection: indigo
                            : !entry.isFeasible 
                            ? 'rgba(239, 68, 68, 0.3)' // incompatible: soft red
                            : 'rgba(16, 185, 129, 0.7)' // compatible: soft green
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-bold mt-2 font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#4f46e5] rounded" /> Your Active Selection</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[rgba(16,185,129,0.7)] rounded" /> Feasible at Sun Level</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[rgba(239,68,68,0.3)] rounded" /> Max Sun Power Insufficient (&gt;100%)</span>
            </div>
          </div>
        )}

        {/* TAB 2A: DAILY SOLAR SIMULATION HARVEST ENERGETICS */}
        {activeTab === 'daily' && dailySubTab === 'solar-profile' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-705">
              <TrendingUp className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Daylight Power Harvest (6:00 AM - 6:00 PM):</span> Simulates generated wattage throughout the day based on the solar arc trajectory. Tap on any hour point on the curve to lock the simulator's telemetry dials to that exact time.
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySimulationData}
                  margin={{ top: 15, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timeLabel" fontSize={10} stroke="#94a3b8" tickLine={false} />
                  <YAxis 
                    unit="W" 
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'DC Power Produced (Watts)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                    formatter={(value: any, name: string) => [`${value} W`, name]}
                  />
                  <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />

                  {/* Power curve */}
                  <Line
                    type="monotone"
                    dataKey="Available PV Power (W)"
                    stroke="#f59e0b"
                    strokeWidth={3.5}
                    activeDot={{ r: 6 }}
                  />

                  {/* Cooler minimum load line */}
                  <ReferenceLine 
                    y={coolerWattage} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ value: `Required: ${coolerWattage}W`, position: 'bottom', fill: '#ef4444', fontSize: 9, fontWeight: 600 }} 
                  />

                  {/* Time tracker sync indicator dot */}
                  <ReferenceDot
                    x={simulatedHour === 12 ? '12 PM' : simulatedHour > 12 ? `${simulatedHour - 12} PM` : `${simulatedHour} AM`}
                    y={availablePower}
                    r={6.5}
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2B: FAN SPEED VS TIME (ADAPTABILITY CURVE) */}
        {activeTab === 'daily' && dailySubTab === 'fan-speed' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-705">
              <Wind className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-slate-900">Dynamic Fan Adaptability:</span> Maps ventilation fan speed (%) variations as the micro-grid controller modulates voltages. Notice how the brushless DC motor handles twilight drop-offs dynamically instead of stopping, protecting pump health.
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySimulationData}
                  margin={{ top: 15, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timeLabel" fontSize={10} stroke="#94a3b8" tickLine={false} />
                  <YAxis 
                    unit="%" 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]}
                    fontSize={10} 
                    stroke="#94a3b8" 
                    tickLine={false}
                    label={{ value: 'Fan RPM Operating Capacity (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                    formatter={(value: any, name: string, props: any) => {
                      const payload = props.payload;
                      return [`${value}% (Mode: ${payload.mode})`, 'Ventilation Speed'];
                    }}
                  />
                  
                  {/* Fan Speed curve */}
                  <Line
                    type="step"
                    dataKey="Fan Speed (%)"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ stroke: '#0284c7', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 6 }}
                    name="Air Speed RPM (%)"
                  />

                  {/* Sync Tracker indicator */}
                  <ReferenceDot
                    x={simulatedHour === 12 ? '12 PM' : simulatedHour > 12 ? `${simulatedHour - 12} PM` : `${simulatedHour} AM`}
                    y={dailySimulationData.find(d => d.hour === simulatedHour)?.['Fan Speed (%)'] || 0}
                    r={6}
                    fill="#4f46e5"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2C: PERFORMANCE TIMELINE */}
        {activeTab === 'daily' && dailySubTab === 'timeline' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="mb-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-705">
              <Cpu className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Direct-PV Operational Timeline:</span> Chronological forecast of controller states from 6:00 AM to 6:00 PM. Directly correlates solar panel size to hour-by-hour output. **Click any time slot** below to quickly inspect those simulated conditions.
              </div>
            </div>

            {/* Custom Horizontal Timeline Nodes */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 py-2">
              {dailySimulationData.map(pt => {
                const isSelected = simulatedHour === pt.hour;
                
                // Color map for modes
                let modeStyle = '';
                if (pt.mode === 'Full Speed') modeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/50';
                else if (pt.mode === 'Normal Mode') modeStyle = 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/50';
                else if (pt.mode === 'Eco Mode') modeStyle = 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/50';
                else if (pt.mode === 'Low Mode') modeStyle = 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/50';
                else modeStyle = 'bg-rose-50 text-rose-800 border-rose-100 hover:bg-rose-100/50';

                return (
                  <button
                    key={pt.hour}
                    onClick={() => syncToHour(pt.hour, pt.irradiance)}
                    className={`p-3 rounded-xl border text-left transition-all ${modeStyle} ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 font-bold shadow-sm scale-[1.02]' : 'opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold text-slate-500">
                      <span>{pt.timeLabel}</span>
                      <span>{pt.irradiance}% Sun</span>
                    </div>
                    <div className="font-black text-xs mt-1 truncate">{pt.mode}</div>
                    <div className="text-[10px] font-mono mt-1 flex justify-between items-center opacity-85">
                      <span>Fan: {pt['Fan Speed (%)']}%</span>
                      <span>{pt['Available PV Power (W)']}W</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-center text-xs text-slate-650 flex items-center justify-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
              <span>Interactive: Click on any hourly micro-card above to dynamically adjust panel solar exposure.</span>
            </div>
          </div>
        )}

        {/* Dynamic active power balance gauge footer summary for direct context */}
        <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
          
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Instantaneous Micro-Grid State:</span>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded-md font-mono font-bold border text-[11px] ${
                balanceStatus === 'surplus' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : balanceStatus === 'low-balanced'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {balanceStatus === 'surplus' ? `Surplus: +${balance} W` : balanceStatus === 'low-balanced' ? `Balanced / Buffer Low: ${balance} W` : `Deficit: ${balance} W`}
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                {mpptEfficiency < 1.0 ? '95% Controller Active' : 'No Line Loss'}
              </span>
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[10px] text-right">
            Solar direct controllers bypass battery cycle losses. Sizing reference is 2026 UTC standard.
          </div>
        </div>

      </div>

    </div>
  );
}
