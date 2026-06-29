/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useMemo, useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Info, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Table, 
  Scaling, 
  Clock,
  Gauge, 
  Compass,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Activity
} from 'lucide-react';
import { CoolerModel, OperatingMode } from '../types';
import { 
  calculateMinIrradianceForFullSpeed, 
  getIrradianceForTime, 
  calculateOperatingState 
} from '../utils/solarCalculations';

interface SizingDiagnosticsProps {
  panelWattage: number;
  cooler: CoolerModel;
  irradiance: number;
  mpptEfficiency: number;
}

export function SizingDiagnostics({ 
  panelWattage, 
  cooler, 
  irradiance, 
  mpptEfficiency 
}: SizingDiagnosticsProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const peakPower = panelWattage;
  const load = cooler.wattage;
  
  // Power produced under current conditions
  const actualPowerProduced = Math.round(peakPower * (irradiance / 100) * mpptEfficiency * 10) / 10;
  const powerBalance = Math.round((actualPowerProduced - load) * 10) / 10;

  // Determination of Sizing adequacy at peak midday (100% irradiance)
  const peakUsablePower = peakPower * mpptEfficiency;
  const peakSizingRatio = peakUsablePower / load;

  let sizingStatus: 'under' | 'good' | 'generous' = 'good';
  let statusColor = '';
  let statusText = '';
  let adviceText = '';

  if (peakSizingRatio < 1.0) {
    sizingStatus = 'under';
    statusColor = 'bg-amber-50 border-amber-200 text-amber-900';
    statusText = 'Under-sized Solar Panel Arrangement';
    adviceText = `The current ${panelWattage}W panel is undersized for a ${load}W cooler. Even at peak midday sun output (100%), it only delivers up to ${Math.round(peakUsablePower)}W of usable power. The cooler cannot achieve full speed, and the system is prone to frequent shutdowns. Upgrade to at least a ${Math.round((load / mpptEfficiency) * 1.2)}W panel for standard operation.`;
  } else if (peakSizingRatio >= 1.0 && peakSizingRatio <= 1.4) {
    sizingStatus = 'good';
    statusColor = 'bg-emerald-50 border-emerald-200 text-emerald-900';
    statusText = 'Balanced Solar Sizing Match';
    adviceText = `Optimal setup! The ${panelWattage}W solar panel is a great fit for your ${load}W cooler load under peak sunshine, providing high fan RPMs. As light fades, the system transitions autonomously into Eco or Low mode to prevent pump motor stalling.`;
  } else {
    sizingStatus = 'generous';
    statusColor = 'bg-indigo-50 border-indigo-200 text-indigo-900';
    statusText = 'Generous Solar Headroom Offset';
    adviceText = `High shading buffer! The selected ${panelWattage}W panel features a ${Math.round((peakSizingRatio - 1) * 100)}% peak safety margin. This margin filters out cloud turbulence and allows the ventilation turbine to achieve full operational speeds at lower irradiance levels (down to ${Math.round(calculateMinIrradianceForFullSpeed(panelWattage, load, mpptEfficiency) as number)}% sun intensity).`;
  }

  // 1. Recommended Panel Sizes (theoretical vs 20% engineering buffer)
  const peakTheorMinPanel = Math.round(load / mpptEfficiency);
  const peakRecPanel = Math.round(peakTheorMinPanel * 1.2);

  const irrFraction = irradiance / 100;
  let currentTheorMinPanel = 'N/A';
  let currentRecPanel = 'N/A';
  if (irrFraction > 0.05) {
    const theorVal = Math.round(load / (irrFraction * mpptEfficiency));
    currentTheorMinPanel = `${theorVal}W`;
    currentRecPanel = `${Math.round(theorVal * 1.2)}W`;
  } else {
    currentTheorMinPanel = 'N/A (Irradiance too low)';
    currentRecPanel = 'N/A (Needs solar input)';
  }

  // 2. Panel Size vs Minimum Irradiance Required list
  const standardPanels = [50, 75, 100, 150, 200];
  const comparisonResults = standardPanels.map(size => {
    const minIrr = calculateMinIrradianceForFullSpeed(size, load, mpptEfficiency);
    return {
      size,
      threshold: minIrr === 'unreachable' ? 'Insufficient Capacity' : `${minIrr}% Sun`
    };
  });

  // 3. Daily Solar Modulation Profiler statistics
  // Evaluates hour profile from 6 AM to 6 PM (13 daylight hours)
  const dailyProfileStats = useMemo(() => {
    let fullHours = 0;
    let modulatedHours = 0;
    let shutdownHours = 0;

    for (let hr = 6; hr <= 18; hr++) {
      const irr = getIrradianceForTime(hr);
      const state = calculateOperatingState(panelWattage, irr, load, mpptEfficiency);
      if (state.mode === 'Full Speed') {
        fullHours++;
      } else if (state.mode === 'Shutdown') {
        shutdownHours++;
      } else {
        modulatedHours++;
      }
    }

    return {
      fullHours,
      modulatedHours,
      shutdownHours,
      totalActiveHours: fullHours + modulatedHours,
    };
  }, [panelWattage, load, mpptEfficiency]);

  // 4. Full-Speed Feasibility Status Definition (from three requested stages)
  const feasibilityStatus = useMemo(() => {
    if (actualPowerProduced >= load) {
      return {
        stage: '✅ Full Speed Possible' as const,
        color: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
        textColor: 'text-emerald-700',
        bullets: 'Full direct DC power match achieved. Fan and pump operating at 100% efficiency. Sizing headroom is completely stable.',
      };
    } else if (actualPowerProduced >= load * 0.25) {
      return {
        stage: '⚠ Reduced Speed Required' as const,
        color: 'bg-amber-500/10 text-amber-800 border-amber-300',
        textColor: 'text-amber-700',
        bullets: 'Insufficient weather power for peak. Micro-grid controller is modulating fan/pump output to protect elements from stalling.',
      };
    } else {
      return {
        stage: '❌ Insufficient Solar Power' as const,
        color: 'bg-rose-500/10 text-rose-800 border-rose-300',
        textColor: 'text-rose-700',
        bullets: 'Irradiance level drops below the 25% safety line. Evaporator pump and ventilation motor shut down to preserve circuits.',
      };
    }
  }, [actualPowerProduced, load]);

  // 5. Dial Gauge parameters for SVG Power Balance arc representation
  // Represents power balance ranging from -120W (full deficit) to +120W (full surplus)
  const gaugeNeedleRotation = useMemo(() => {
    const cappedBalance = Math.max(-120, Math.min(120, powerBalance));
    // Translate -120..120 range (240 span) to gauge angle of -90deg to +90deg (180 span)
    return (cappedBalance / 120) * 90;
  }, [powerBalance]);

  const pointerColor = powerBalance >= 0 ? '#10b981' : powerBalance >= -15 ? '#eab308' : '#ef4444';

  if (isMobile) {
    return (
      <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]" id="diagnostics-card-mobile">
        {/* Title & Description */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Engineering Status
          </span>
          <h3 className="text-3xl font-black text-slate-950 uppercase leading-none">
            Diagnostics
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Professional sizing metrics, feasibility thresholds, and comparative solar modeling optimized for mobile devices.
          </p>
        </div>

        {/* PV Sizing Adequacy & Advice */}
        <div className={`border p-6 rounded-3xl flex flex-col gap-4 transition-colors ${statusColor}`}>
          <div className="flex items-center gap-3">
            {sizingStatus === 'under' ? (
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            )}
            <span className="text-xs uppercase font-mono font-black tracking-widest text-indigo-700">
              PV Micro-Grid Analysis
            </span>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-950 text-base">{statusText}</h4>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">{adviceText}</p>
          </div>
        </div>

        {/* Recommended Sizing Specifications (Current vs Peak) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
              <Scaling className="w-5 h-5 text-indigo-500" />
              Sizing Recommendations
            </h4>
            <p className="text-xs text-slate-500">Calculated panel requirements with 20% engineering buffer.</p>
          </div>
          
          <div className="space-y-4">
            {/* Peak Sizing Column */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block border-b border-slate-200/60 pb-2">At Clear Day Peak (100% Sun)</span>
              <div className="mt-3.5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-sans font-semibold">Theoretical Min:</span>
                  <span className="font-black text-slate-900 text-sm">{peakTheorMinPanel} W</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5 font-bold">
                  <span className="text-indigo-650 font-sans font-black">Recommended (+20%):</span>
                  <span className="text-indigo-700 text-base font-black">{peakRecPanel} W</span>
                </div>
              </div>
            </div>

            {/* Current Sizing Column */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block border-b border-slate-200/60 pb-2">At Current Sun ({irradiance}% Sun)</span>
              <div className="mt-3.5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-sans font-semibold">Theoretical Min:</span>
                  <span className="font-black text-slate-900 text-sm">{currentTheorMinPanel}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5 font-bold">
                  <span className="text-indigo-650 font-sans font-black">Recommended (+20%):</span>
                  <span className="text-indigo-700 text-base font-black">{currentRecPanel}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            * Formula accounts for ambient temp coefficient losses and wiring voltage drops.
          </p>
        </div>

        {/* Feasibility Status Dashboard */}
        <div className={`border rounded-3xl p-6 flex flex-col gap-4 ${feasibilityStatus.color}`} id="feasibility-status-dashboard-mobile">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono font-black tracking-widest text-slate-500 block">Operation Feasibility Status</span>
            <h4 className="text-lg font-black text-slate-900">{feasibilityStatus.stage}</h4>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">
              {feasibilityStatus.bullets}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200/40 mt-1 flex items-center justify-between text-xs font-mono font-extrabold text-slate-800">
            <span>Usable PV: {actualPowerProduced} W</span>
            <span>Rotor Load: {load} W</span>
          </div>
        </div>

        {/* Circular SVG Needle Power Gauge */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-center text-white relative overflow-hidden" id="power-balance-gauge-box-mobile">
          <span className="text-xs uppercase font-mono font-black text-slate-400 mb-4 z-10 tracking-widest">Power Balance Meter</span>
          
          <div className="relative w-44 h-28 flex items-center justify-center">
            {/* SVG Arc Dial */}
            <svg className="w-full h-full" viewBox="0 0 100 50">
              {/* Deficit Area Arc (Red) */}
              <path d="M 10 50 A 40 40 0 0 1 50 10" fill="none" stroke="#ef4444" strokeWidth="6" opacity="0.8" />
              {/* Surplus Area Arc (Green) */}
              <path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="6" opacity="0.8" />
              {/* 0 line */}
              <line x1="50" y1="10" x2="50" y2="15" stroke="#ffffff" strokeWidth="1.5" />
              
              {/* Indicator needle */}
              <line 
                x1="50" 
                y1="50" 
                x2="50" 
                y2="15" 
                stroke={pointerColor} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                transform={`rotate(${gaugeNeedleRotation}, 50, 50)`}
                style={{ transformOrigin: '50px 50px', transition: 'transform 0.8s' }}
              />
              <circle cx="50" cy="50" r="5" fill="#334155" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
            
            <span className="absolute bottom-0 left-0 text-[10px] font-mono text-slate-400 font-bold">-120W</span>
            <span className="absolute bottom-0 right-0 text-[10px] font-mono text-slate-400 font-bold">+120W</span>
            <span className="absolute top-1 text-xs font-mono text-slate-350 font-bold">0</span>
          </div>

          <div className="text-center mt-4 z-10">
            <span className={`text-xl font-black font-mono block ${powerBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {powerBalance >= 0 ? `+${powerBalance} W Surplus` : `${powerBalance} W Deficit`}
            </span>
            <span className="text-xs text-slate-400 font-mono block mt-1.5">Live Generation vs. Load Delta</span>
          </div>
        </div>

        {/* Engineering Sizing Insights List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4" id="engineering-insights-panel-mobile">
          <h4 className="text-base font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
            <FileCheck className="w-5 h-5 text-amber-505" />
            Engineering Sizing Insights
          </h4>
          
          <div className="space-y-4">
            <div className="bg-slate-850 p-4.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono block">expected solar limits</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Minimum solar intensity needed for the {cooler.name} is calculated to be <strong className="text-white font-mono">{calculateMinIrradianceForFullSpeed(panelWattage, load, mpptEfficiency) === 'unreachable' ? 'Unreachable' : `${calculateMinIrradianceForFullSpeed(panelWattage, load, mpptEfficiency)}% sun`}</strong> to run on Full Speed.
              </p>
            </div>

            <div className="bg-slate-850 p-4.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="text-[9px] text-emerald-400 font-bold uppercase font-mono block">solar duty profile</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                The ventilation turbine operates for <strong className="text-white font-mono">{dailyProfileStats.totalActiveHours} out of 13 daylight hours</strong>. Specifically, operating on <strong>Full Speed for {dailyProfileStats.fullHours} hours</strong>, modulating in <strong>conservation states for {dailyProfileStats.modulatedHours} hours</strong>, and in <strong>safety shutdown for {dailyProfileStats.shutdownHours} hours</strong>.
              </p>
            </div>

            <div className="bg-slate-850 p-4.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="text-[9px] text-amber-400 font-bold uppercase font-mono block">load feasibility</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {powerBalance >= 0 ? `Direct power match: system is currently operating in equilibrium (at ${irradiance}% brightness), comfortably powering both the centrifugal turbine and submersible disperser.` : `The current irradiance output requires motor speed throttles to avoid stalling the water pump, running on a calculated fan reduction coefficient.`}
              </p>
            </div>
          </div>
        </div>

        {/* Comparative Matrix Study */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Table className="w-5 h-5 text-emerald-500" />
            Array Thresholds
          </h4>
          <p className="text-xs text-slate-505 leading-relaxed font-medium">
            Operational sunrise threshold: shows the minimum sunshine brightness level needed for each standard panel size to sustain the {cooler.name} ({load}W) on peak Fan Speed.
          </p>

          <div className="space-y-4" id="comparative-matrix-mobile">
            {comparisonResults.map(result => {
              const isActive = result.size === panelWattage;
              const isUnder = result.threshold === 'Insufficient Capacity';
              return (
                <div 
                  key={result.size}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">
                        {result.size}W Solar Panel
                      </span>
                    </div>
                    {isActive && (
                      <span className="bg-indigo-600 text-white text-[9px] font-mono uppercase font-black tracking-widest px-2 py-1 rounded-md">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3.5 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-450 font-mono uppercase text-[9px] font-extrabold tracking-wider">
                      Min Sun Irradiance Needed:
                    </span>
                    <span className={`font-mono font-black text-sm ${isUnder ? 'text-amber-600' : 'text-indigo-950'}`}>
                      {result.threshold}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md flex flex-col space-y-8" id="diagnostics-card">
      
      {/* Title & Description */}
      <div>
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-600 animate-[spin_12s_linear_infinite]" />
          Systems Engineering Diagnostics
        </h3>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          Professional sizing metrics, feasibility thresholds, and comparative solar modeling
        </p>
      </div>

      {/* PV Sizing Adequacy & Advice */}
      <section className={`border p-6 rounded-xl flex items-start gap-4 transition-colors ${statusColor}`}>
        {sizingStatus === 'under' ? (
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
        ) : (
          <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
        )}
        <div className="space-y-1.5 flex-1">
          <span className="text-xs uppercase font-mono font-black tracking-widest opacity-80 block text-indigo-700">PV Micro-Grid Analysis</span>
          <h4 className="font-extrabold text-slate-950 text-sm sm:text-base">{statusText}</h4>
          <p className="text-sm leading-relaxed opacity-95">{adviceText}</p>
        </div>
      </section>

      {/* Recommended Sizing Specifications (Current vs Peak) */}
      <section className="bg-slate-50 border border-slate-150 rounded-xl p-6.5 space-y-4">
        <h4 className="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200/60 pb-3">
          <Scaling className="w-5 h-5 text-indigo-500" />
          Recommended Panel Sizing Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Peak Sizing Column */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block border-b border-slate-100 pb-2">At Clear Day Peak (100% Irradiance)</span>
            <div className="mt-3 space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-sans font-medium">Theoretical Min:</span>
                <span className="font-black text-slate-900 text-base">{peakTheorMinPanel} W</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5 font-bold">
                <span className="text-indigo-600 font-sans font-black">Recommended (+20%):</span>
                <span className="text-indigo-700 text-lg font-black">{peakRecPanel} W</span>
              </div>
            </div>
          </div>

          {/* Current Sizing Column */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block border-b border-slate-100 pb-2">At Current Sun ({irradiance}% Irradiance)</span>
            <div className="mt-3 space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-sans font-medium">Theoretical Min:</span>
                <span className="font-black text-slate-900 text-base">{currentTheorMinPanel}</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5 font-bold">
                <span className="text-indigo-600 font-sans font-black">Recommended (+20%):</span>
                <span className="text-indigo-700 text-lg font-black">{currentRecPanel}</span>
              </div>
            </div>
          </div>

        </div>

        <p className="text-xs text-slate-500 leading-relaxed italic pt-2">
          Formula: Required Panel = Cooler Load / (Irradiance Fraction * MPPT Efficiency). Sizing includes standard 20% safety margin factor for ambient temperature coefficient losses and wiring voltage drops.
        </p>
      </section>

      {/* Grid: Feasibility Status + Power Balance SVG Dial Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Feasibility Status Dashboard */}
        <section className={`md:col-span-7 border rounded-xl p-6.5 flex flex-col justify-between ${feasibilityStatus.color}`} id="feasibility-status-dashboard">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono font-black tracking-widest text-slate-500 block">Operation Feasibility Status</span>
            <h4 className={`text-base sm:text-lg font-black ${feasibilityStatus.textColor}`}>{feasibilityStatus.stage}</h4>
            <p className="text-sm leading-relaxed text-slate-700 pt-1">
              {feasibilityStatus.bullets}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200/40 mt-4 flex items-center justify-between text-xs sm:text-sm font-mono font-extrabold text-slate-700">
            <span>Usable PV: {actualPowerProduced} W</span>
            <span>Rotor Load: {load} W</span>
          </div>
        </section>

        {/* Circular SVG Needle Power Gauge */}
        <section className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-white relative overflow-hidden" id="power-balance-gauge-box">
          <span className="text-xs uppercase font-mono font-black text-slate-400 mb-2 z-10 self-center tracking-widest">Power Balance Meter</span>
          
          <div className="relative w-36 h-24 flex items-center justify-center mt-1">
            {/* SVG Arc Dial */}
            <svg className="w-full h-full" viewBox="0 0 100 50">
              {/* Deficit Area Arc (Red) */}
              <path d="M 10 50 A 40 40 0 0 1 50 10" fill="none" stroke="#ef4444" strokeWidth="6" opacity="0.8" />
              {/* Surplus Area Arc (Green) */}
              <path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="6" opacity="0.8" />
              {/* 0 line */}
              <line x1="50" y1="10" x2="50" y2="15" stroke="#ffffff" strokeWidth="1.5" />
              
              {/* Indicator needle */}
              <line 
                x1="50" 
                y1="50" 
                x2="50" 
                y2="15" 
                stroke={pointerColor} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                transform={`rotate(${gaugeNeedleRotation}, 50, 50)`}
                style={{ transformOrigin: '50px 50px', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              {/* Core dial center cap */}
              <circle cx="50" cy="50" r="5" fill="#334155" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
            
            {/* Legend Bounds */}
            <span className="absolute bottom-0 left-0 text-[10px] font-mono text-slate-400 font-bold">-120W</span>
            <span className="absolute bottom-0 right-0 text-[10px] font-mono text-slate-400 font-bold">+120W</span>
            <span className="absolute top-1 left-1.5/2 text-xs font-mono text-slate-350 font-bold">0</span>
          </div>

          <div className="text-center mt-3 z-10">
            <span className={`text-base sm:text-lg font-black font-mono block ${powerBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {powerBalance >= 0 ? `+${powerBalance} W Surplus` : `${powerBalance} W Deficit`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block leading-none mt-1.5">Available vs. Load Delta</span>
          </div>
        </section>

      </div>

      {/* Engineering Insights & Daily Operating Profile */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6.5 text-white space-y-4" id="engineering-insights-panel">
        <h4 className="text-base font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
          <FileCheck className="w-5 h-5 text-amber-505" />
          Engineering Sizing Insights Panel
        </h4>
        
        <ul className="space-y-3 text-slate-200 text-xs sm:text-sm">
          <li className="flex items-start gap-2.5 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
            <span>
              <strong>Expected Sun Exposure limits:</strong> Minimum solar intensity needed for the {cooler.name} is calculated to be <strong className="text-white font-mono text-[13px]">{calculateMinIrradianceForFullSpeed(panelWattage, load, mpptEfficiency) === 'unreachable' ? 'Unreachable at current panel size' : `${calculateMinIrradianceForFullSpeed(panelWattage, load, mpptEfficiency)}% irradiance`}</strong> to run on Full Speed.
            </span>
          </li>
          
          <li className="flex items-start gap-2.5 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
            <span>
              <strong>Daily Solar Duty Profile:</strong> Based on standard sunrise-to-sunset trajectories: the ventilation turbine operates for <strong className="text-white font-mono text-[13px]">{dailyProfileStats.totalActiveHours} out of 13 daylight hours</strong>. Specifically, operating on <strong>Full Speed for {dailyProfileStats.fullHours} hours</strong>, modulating in <strong>conservation speed states for {dailyProfileStats.modulatedHours} hours</strong>, and in <strong>safety shutdown for {dailyProfileStats.shutdownHours} hours</strong>.
            </span>
          </li>

          <li className="flex items-start gap-2.5 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
            <span>
              <strong>Micro-Grid Load Feasibility:</strong> {powerBalance >= 0 ? `Direct power match: system is currently operating in equilibrium (at ${irradiance}% brightness), comfortably powering both the centrifugal turbine and submersible disperser.` : `The current irradiance output requires motor speed throttles to avoid stalling the water pump, running on a calculated fan reduction coefficient.`}
            </span>
          </li>
        </ul>
      </section>

      {/* Comparative Matrix Study */}
      <section className="bg-white border border-slate-150 rounded-xl p-6">
        <h4 className="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 mb-2.5 border-b border-slate-100 pb-2.5">
          <Table className="w-5 h-5 text-emerald-500" />
          Comparative Array Threshold Matrix
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
          Operational sunrise threshold: shows the minimum sunshine brightness level needed for each standard panel size to sustain the {cooler.name} ({load}W) on peak Fan Speed.
        </p>

        {isMobile ? (
          <div className="space-y-4" id="comparative-matrix-mobile">
            {comparisonResults.map(result => {
              const isActive = result.size === panelWattage;
              const isUnder = result.threshold === 'Insufficient Capacity';
              return (
                <div 
                  key={result.size}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isActive ? 'bg-indigo-600' : 'bg-slate-305'}`}>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">
                        {result.size}W Solar Panel
                      </span>
                    </div>
                    {isActive && (
                      <span className="bg-indigo-600 text-white text-[9px] font-mono uppercase font-black tracking-widest px-2 py-1 rounded-md">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3.5 pt-3 border-t border-slate-205/60 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono uppercase text-[9px] font-bold tracking-wider">
                      Min Sun Irradiance Needed:
                    </span>
                    <span className={`font-mono font-black text-sm ${isUnder ? 'text-amber-600' : 'text-indigo-950'}`}>
                      {result.threshold}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-150">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                  <th className="py-3 px-4">Solar Panel (Watts)</th>
                  <th className="py-3 px-4 text-right">Min Sun Irradiance Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonResults.map(result => {
                  const isActive = result.size === panelWattage;
                  const isUnder = result.threshold === 'Insufficient Capacity';
                  return (
                    <tr 
                      key={result.size}
                      className={`transition-colors font-mono text-[12px] sm:text-[13px] ${isActive ? 'bg-indigo-50/70 font-bold text-indigo-950 border-l-2 border-indigo-600' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="py-3 px-4 flex items-center gap-2 font-sans text-sm font-semibold">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        {result.size} W Array
                        {isActive && <span className="bg-indigo-150 text-indigo-805 text-[10px] px-2 py-0.5 font-mono rounded-full font-bold">Selected</span>}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isUnder ? 'text-amber-600' : 'text-slate-800'}`}>
                        {result.threshold}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
