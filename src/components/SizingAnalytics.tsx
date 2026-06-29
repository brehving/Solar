/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
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
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import { 
  Sun, 
  Cpu, 
  Wind, 
  ShieldCheck, 
  Percent, 
  Gauge, 
  Zap,
  Info,
  Clock,
  Award,
  Compass,
  LineChart as LucideLineChart
} from 'lucide-react';
import { CoolerModel, OperatingMode } from '../types';
import { 
  calculateMinIrradianceForFullSpeed, 
  calculateOperatingState 
} from '../utils/solarCalculations';

interface SizingAnalyticsProps {
  panelWattage: number;
  currentIrradiance: number;
  coolerWattage: number;
  activeCooler: CoolerModel;
  availablePower: number;
  mpptEfficiency: number;
  simulatedHour?: number;
  setSimulatedHour?: (hour: number) => void;
  setIrradiancePercent?: (irr: number) => void;
  setIsTimeSimActive?: (active: boolean) => void;
}

export function SizingAnalytics({
  panelWattage,
  currentIrradiance,
  coolerWattage,
  activeCooler,
  availablePower,
  mpptEfficiency,
  simulatedHour = 12,
  setSimulatedHour,
  setIrradiancePercent,
  setIsTimeSimActive,
}: SizingAnalyticsProps) {

  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Daily profile values as requested:
  // 6 AM: 10%, 8 AM: 30%, 10 AM: 70%, 12 PM: 100%, 2 PM: 90%, 4 PM: 60%, 6 PM: 10%
  const dailyProfile = useMemo(() => [
    { time: '6 AM', hour: 6, irradiance: 10 },
    { time: '8 AM', hour: 8, irradiance: 30 },
    { time: '10 AM', hour: 10, irradiance: 70 },
    { time: '12 PM', hour: 12, irradiance: 100 },
    { time: '2 PM', hour: 14, irradiance: 90 },
    { time: '4 PM', hour: 16, irradiance: 60 },
    { time: '6 PM', hour: 18, irradiance: 10 },
  ], []);

  // Sync state helper to update simulated hour and solar exposure instantly
  const handleTimeSlotSync = (hour: number, irr: number) => {
    if (setSimulatedHour && setIrradiancePercent && setIsTimeSimActive) {
      setSimulatedHour(hour);
      setIrradiancePercent(irr);
      setIsTimeSimActive(true);
    }
  };

  // Calculations for current moment metrics
  const calculatedState = useMemo(() => {
    return calculateOperatingState(panelWattage, currentIrradiance, coolerWattage, mpptEfficiency);
  }, [panelWattage, currentIrradiance, coolerWattage, mpptEfficiency]);

  const powerBalance = calculatedState.powerBalance;
  
  const minIrrForFullSpeed = useMemo(() => {
    return calculateMinIrradianceForFullSpeed(panelWattage, coolerWattage, mpptEfficiency);
  }, [panelWattage, coolerWattage, mpptEfficiency]);

  const recPanelSizeCurrent = useMemo(() => {
    if (currentIrradiance > 5) {
      const theoretical = coolerWattage / ((currentIrradiance / 100) * mpptEfficiency);
      return Math.round(theoretical * 1.2);
    }
    return 0;
  }, [coolerWattage, currentIrradiance, mpptEfficiency]);

  const recPanelSizePeak = useMemo(() => {
    const theoretical = coolerWattage / mpptEfficiency;
    return Math.round(theoretical * 1.2);
  }, [coolerWattage, mpptEfficiency]);

  // DATASET 1: Solar Panel Output vs Irradiance for [50W, 75W, 100W, 150W, 200W]
  const outputVsIrradianceData = useMemo(() => {
    const arr = [];
    for (let irr = 0; irr <= 100; irr += 10) {
      arr.push({
        irradiance: irr,
        '50W Panel': Math.round((50 * (irr / 100) * mpptEfficiency) * 10) / 10,
        '75W Panel': Math.round((75 * (irr / 100) * mpptEfficiency) * 10) / 10,
        '100W Panel': Math.round((100 * (irr / 100) * mpptEfficiency) * 10) / 10,
        '150W Panel': Math.round((150 * (irr / 100) * mpptEfficiency) * 10) / 10,
        '200W Panel': Math.round((200 * (irr / 100) * mpptEfficiency) * 10) / 10,
      });
    }
    return arr;
  }, [mpptEfficiency]);

  // DATASET 2: Panel Size vs Minimum Irradiance Required (for 50W, 75W, 100W, 150W, 200W)
  const panelLimitsData = useMemo(() => {
    const sizes = [50, 75, 100, 150, 200];
    return sizes.map(size => {
      // Minimum Irradiance Required (%) = (Cooler Load / Panel Size) * 100
      // accounts for MPPT efficiency multiplier as premium engineering standard
      const floatIrr = (coolerWattage / (size * mpptEfficiency)) * 100;
      const roundedIrr = Math.round(floatIrr * 10) / 10;
      const isUnreachable = roundedIrr > 100;
      return {
        panelSizeLabel: `${size}W`,
        panelSizeVal: size,
        'Min Irradiance Needed (%)': isUnreachable ? 100 : roundedIrr,
        actualVal: roundedIrr,
        isUnreachable,
        displayLabel: isUnreachable ? 'Insufficient Peak capacity' : `${roundedIrr}%`,
      };
    });
  }, [coolerWattage, mpptEfficiency]);

  // DATASET 3: Daily Solar Availability Simulation (Based on requested profile curves)
  const dailyAvailabilityData = useMemo(() => {
    return dailyProfile.map(pt => {
      const activePower = Math.round((panelWattage * (pt.irradiance / 100) * mpptEfficiency) * 10) / 10;
      return {
        ...pt,
        'Available PV Power (W)': activePower,
        'Current Selected Panel Rated (W)': panelWattage,
        'Reference Cooler Wattage (W)': coolerWattage,
      };
    });
  }, [dailyProfile, panelWattage, coolerWattage, mpptEfficiency]);

  // DATASET 4: Fan Speed vs Time
  const dailyFanSpeedData = useMemo(() => {
    return dailyProfile.map(pt => {
      const stepAvailablePower = (panelWattage * (pt.irradiance / 100) * mpptEfficiency);
      
      // Control Logic:
      // Available Power >= 100% Load -> Fan = 100%
      // Available Power >= 75% Load -> Fan = 75%
      // Available Power >= 50% Load -> Fan = 50%
      // Available Power >= 25% Load -> Fan = 25%
      // Below 25% Load -> Fan = 0%
      let fanSpeed = 0;
      let modeText: OperatingMode = 'Shutdown';
      
      if (stepAvailablePower >= coolerWattage) {
        fanSpeed = 100;
        modeText = 'Full Speed';
      } else if (stepAvailablePower >= coolerWattage * 0.75) {
        fanSpeed = 75;
        modeText = 'Normal Mode';
      } else if (stepAvailablePower >= coolerWattage * 0.50) {
        fanSpeed = 50;
        modeText = 'Eco Mode';
      } else if (stepAvailablePower >= coolerWattage * 0.25) {
        fanSpeed = 25;
        modeText = 'Low Mode';
      } else {
        fanSpeed = 0;
        modeText = 'Shutdown';
      }

      return {
        ...pt,
        'Fan Speed (%)': fanSpeed,
        mode: modeText,
        'Power (W)': Math.round(stepAvailablePower * 10) / 10,
      };
    });
  }, [dailyProfile, panelWattage, coolerWattage, mpptEfficiency]);

  // DATASET 5: Power Balance Analysis over Irradiance Spectrum (0% to 100%)
  const powerBalanceSpectrumData = useMemo(() => {
    const arr = [];
    for (let irr = 0; irr <= 100; irr += 10) {
      const stepPower = (panelWattage * (irr / 100) * mpptEfficiency);
      const stepBalance = Math.round((stepPower - coolerWattage) * 10) / 10;
      arr.push({
        irradiance: irr,
        'Power Balance (W)': stepBalance,
        'Usable PV Power (W)': Math.round(stepPower * 10) / 10,
        'Cooler Load Threshold (W)': coolerWattage,
      });
    }
    return arr;
  }, [panelWattage, coolerWattage, mpptEfficiency]);

  // Boundaries of the Operational Regions for the selected Solar Panel
  const operationalRegions = useMemo(() => {
    const fullSpeedIrrVal = calculateMinIrradianceForFullSpeed(panelWattage, coolerWattage, mpptEfficiency);
    const reducedSpeedMinIrrVal = calculateMinIrradianceForFullSpeed(panelWattage, coolerWattage * 0.25, mpptEfficiency);
    
    const shutdownRightLimit = reducedSpeedMinIrrVal === 'unreachable' ? 100 : Math.min(100, reducedSpeedMinIrrVal as number);
    const reducedRightLimit = fullSpeedIrrVal === 'unreachable' ? 100 : Math.min(100, fullSpeedIrrVal as number);

    return {
      shutdownEnd: shutdownRightLimit,
      reducedEnd: reducedRightLimit,
      isUnreachable: fullSpeedIrrVal === 'unreachable',
    };
  }, [panelWattage, coolerWattage, mpptEfficiency]);

  // Compute Daily Statistics for the Expected Mode Breakdown
  const expectedDaytimePerformance = useMemo(() => {
    let fullSpeedCount = 0;
    let normalSpeedCount = 0;
    let ecoSpeedCount = 0;
    let lowSpeedCount = 0;
    let shutdownCount = 0;

    dailyFanSpeedData.forEach(d => {
      if (d['Fan Speed (%)'] === 100) fullSpeedCount++;
      else if (d['Fan Speed (%)'] === 75) normalSpeedCount++;
      else if (d['Fan Speed (%)'] === 50) ecoSpeedCount++;
      else if (d['Fan Speed (%)'] === 25) lowSpeedCount++;
      else shutdownCount++;
    });

    const activeModCount = normalSpeedCount + ecoSpeedCount + lowSpeedCount;

    return {
      fullHours: fullSpeedCount * 2,
      modulatedHours: activeModCount * 2,
      shutdownHours: shutdownCount * 2,
      activeModPercentage: Math.round(((fullSpeedCount + activeModCount) / dailyFanSpeedData.length) * 100),
      isFeasible: fullSpeedCount > 0 || activeModCount > 0,
    };
  }, [dailyFanSpeedData]);

  // Determine standard colors based on current moment balance status
  const balanceStateTheme = useMemo(() => {
    if (powerBalance > 10) {
      return {
        border: 'border-emerald-250 bg-emerald-50/40 text-emerald-950',
        text: 'text-emerald-700 font-bold',
        statusDesc: 'Positive Surplus',
      };
    } else if (powerBalance >= -15) {
      return {
        border: 'border-amber-250 bg-amber-50/40 text-amber-950',
        text: 'text-amber-700 font-bold',
        statusDesc: 'Near Balance',
      };
    } else {
      return {
        border: 'border-rose-250 bg-rose-50/40 text-rose-950',
        text: 'text-rose-700 font-bold',
        statusDesc: 'Energy Deficit',
      };
    }
  }, [powerBalance]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm print:break-inside-avoid" id="solar-simulation-analytics-section">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div id="analytics-intro-text">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Compass className="w-5 h-5 text-white animate-[spin_10s_linear_infinite]" />
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Solar Direct Mode Simulation Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-505 mt-1.5 leading-relaxed font-normal">
            High-fidelity interactive engineering telemetry workspace illustrating solar micro-grid interactions, solar-load curves, and fan controller speed modulation.
          </p>
        </div>
        
        {/* Active status indicator badge */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
          <span className="text-[10px] font-bold font-mono text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-155">
            Continuous Calculation Active
          </span>
        </div>
      </div>

      {/* METRIC DASHBOARD WIDGET CARDS ROW */}
      {isMobile ? (
        <div className="flex flex-col gap-6" id="analytics-telemetry-grid-mobile">
          {/* MOBILE CARD 1: SOLAR POWER METRICS */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-650/5 border border-amber-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-pv-power-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
                <Sun className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Available Solar Power</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
                  {calculatedState.availablePower}W
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Panel Capacity: <span className="font-extrabold text-slate-900 font-mono">{panelWattage}W</span> at <span className="font-extrabold text-slate-900 font-mono">{currentIrradiance}%</span> sun intensity.
            </div>
          </div>

          {/* MOBILE CARD 2: COOLER LOAD */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-650/5 border border-indigo-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-cooler-load-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-indigo-500 text-white shadow-md shadow-indigo-500/25">
                <Cpu className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Cooler Load Demand</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
                  {coolerWattage}W
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Target Device: <span className="font-extrabold text-indigo-700">{activeCooler.name}</span>
            </div>
          </div>

          {/* MOBILE CARD 3: POWER BALANCE */}
          <div className={`bg-gradient-to-br ${powerBalance >= 0 ? 'from-emerald-500/10 to-emerald-650/5 border-emerald-500/30' : 'from-rose-500/10 to-rose-655/5 border-rose-500/30'} border rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs`} id="card-power-balance-mobile">
            <div className="flex items-center gap-5">
              <span className={`p-4 rounded-2xl ${powerBalance >= 0 ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-rose-500 shadow-rose-500/25'} text-white shadow-md`}>
                <Zap className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Power Balance (Δ)</span>
                <div className={`text-3xl font-black font-mono mt-0.5 ${powerBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {powerBalance >= 0 ? `+${powerBalance}W` : `${powerBalance}W`}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Operational Status: <span className="font-extrabold text-slate-900">{balanceStateTheme.statusDesc}</span>
            </div>
          </div>

          {/* MOBILE CARD 4: FAN MOTOR SPEED STATE */}
          <div className="bg-gradient-to-br from-sky-500/10 to-sky-650/5 border border-sky-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-fan-speed-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/25 animate-[spin_10s_linear_infinite]">
                <Wind className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Cooling Fan Speed</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
                  {calculatedState.fanSpeed}%
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Throttling Level: <span className="font-extrabold text-slate-900">{calculatedState.mode}</span>
            </div>
          </div>

          {/* MOBILE CARD 5: PUMP SPEED */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-650/5 border border-blue-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-pump-state-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/25">
                <Percent className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Water Pump Speed</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
                  {calculatedState.pumpSpeed}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Supply Integration: <span className="font-extrabold text-slate-900 font-mono">Active direct flow rate</span>
            </div>
          </div>

          {/* MOBILE CARD 6: OPERATING MODE */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-650/5 border border-purple-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-operating-mode-text-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-purple-500 text-white shadow-md shadow-purple-500/25">
                <Gauge className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Operational Mode</span>
                <div className={`text-3xl font-black mt-0.5 ${calculatedState.mode === 'Shutdown' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {calculatedState.mode}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Load Protection: <span className="font-extrabold text-slate-900 font-mono">{calculatedState.percentageOfLoad}% power match</span>
            </div>
          </div>

          {/* MOBILE CARD 7: MINIMUM IRRADIANCE REQUIRED */}
          <div className="bg-gradient-to-br from-teal-500/10 to-teal-655/5 border border-teal-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-min-irr-needed-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/25">
                <Clock className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Min Sun Required</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-0.5">
                  {minIrrForFullSpeed === 'unreachable' ? 'Unreachable' : `${minIrrForFullSpeed}%`}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Necessary threshold for <span className="font-extrabold text-slate-900 font-mono">100% full-speed fan output</span>
            </div>
          </div>

          {/* MOBILE CARD 8: RECOMMENDED SOLAR PANEL SIZE */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-650/5 border border-purple-500/30 rounded-[28px] p-6.5 flex flex-col justify-between shadow-xs" id="card-recommended-panel-mobile">
            <div className="flex items-center gap-5">
              <span className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
                <Award className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block">Best Match Panel</span>
                <div className="text-3xl font-black text-indigo-700 font-mono mt-0.5">
                  {recPanelSizePeak}W
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4.5 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
              Peak Recommendation with <span className="font-extrabold text-indigo-700 font-mono">+20% safety margin</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-8 gap-5" id="analytics-telemetry-grid">
          
          {/* CARD 1: SOLAR POWER METRICS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-pv-power">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Available Solar Power</span>
              <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <Sun className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-xl md:text-2xl font-black text-slate-900 font-mono">
                {calculatedState.availablePower}W
              </div>
              <div className="text-[10.5px] text-slate-500 font-mono mt-1">
                Rated: {panelWattage}W Panel @ {currentIrradiance}% sun
              </div>
            </div>
          </div>

          {/* CARD 2: COOLER LOAD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-cooler-load">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Cooler Load Demand</span>
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Cpu className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-xl md:text-2xl font-black text-slate-900 font-mono">
                {coolerWattage}W
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1 truncate">
                {activeCooler.name}
              </div>
            </div>
          </div>

          {/* CARD 3: POWER BALANCE */}
          <div className={`bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0 ${balanceStateTheme.border}`} id="card-power-balance">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Power Balance (Δ)</span>
              <span className={`p-1.5 rounded-xl ${powerBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <Zap className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className={`text-2xl sm:text-xl md:text-2xl font-black font-mono ${powerBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {powerBalance >= 0 ? `+${powerBalance}W` : `${powerBalance}W`}
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
                Status: {balanceStateTheme.statusDesc}
              </div>
            </div>
          </div>

          {/* CARD 4: FAN MOTOR SPEED STATE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-fan-speed">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Fan Speed</span>
              <span className="p-1.5 rounded-xl bg-sky-50 text-sky-600 animate-[spin_6s_linear_infinite]">
                <Wind className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-xl md:text-2xl font-black text-slate-900 font-mono">
                {calculatedState.fanSpeed}%
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1">
                Mode: {calculatedState.mode}
              </div>
            </div>
          </div>

          {/* CARD 5: PUMP SPEED */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-pump-state">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Pump Speed</span>
              <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                <Percent className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-xl md:text-2xl font-black text-slate-900 font-mono truncate">
                {calculatedState.pumpSpeed}
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1">
                Submersible pump state
              </div>
            </div>
          </div>

          {/* CARD 6: OPERATING MODE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-operating-mode-text">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Operating Mode</span>
              <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <Gauge className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className={`text-2xl sm:text-xl font-black tracking-tight ${calculatedState.mode === 'Shutdown' ? 'text-rose-600' : 'text-slate-900'}`}>
                {calculatedState.mode}
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
                {calculatedState.percentageOfLoad}% power match
              </div>
            </div>
          </div>

          {/* CARD 7: MINIMUM IRRADIANCE REQUIRED FOR FULL SPEED */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-min-irr-needed">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Min Irradiance Needed</span>
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-xl md:text-2xl font-black text-slate-900 font-mono">
                {minIrrForFullSpeed === 'unreachable' ? 'Unreachable' : `${minIrrForFullSpeed}%`}
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1">
                Required for 100% Fan Speed
              </div>
            </div>
          </div>

          {/* CARD 8: RECOMMENDED SOLAR PANEL SIZE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[135px] sm:min-h-0" id="card-recommended-panel">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] text-slate-550 font-bold uppercase tracking-wider">Recommended Panel Size</span>
              <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
                <Award className="w-5 h-5" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-xl md:text-2xl font-black text-indigo-700 font-mono">
                {recPanelSizePeak}W
              </div>
              <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
                Peak recommendation (+20%)
              </div>
            </div>
          </div>

        </div>
      )}

      {/* DASHBOARD CHARTS WORKSPACE GRID (All five charts presented simultaneously) */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'grid-cols-1 lg:grid-cols-2 min-[1600px]:grid-cols-3 gap-8'}`} id="dashboard-charts-grid">
        
        {/* CHART 1: Solar Panel Output vs Irradiance */}
        <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between ${isMobile ? 'h-[440px]' : 'h-[380px]'}`} id="chart-output-vs-irradiance">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">Chart 1: Multi-Line Plot</span>
              <span className="text-[10px] font-mono text-slate-400">Y-Axis: Available Power (W)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">Solar Panel Output vs Irradiance</h3>
          </div>
          
          <div className="flex-1 w-full mt-3 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outputVsIrradianceData} margin={{ top: 10, right: 10, left: -15, bottom: isMobile ? 25 : 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="irradiance" fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="%" interval={isMobile ? 1 : 0} />
                <YAxis fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="W" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', padding: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                  formatter={(value: any, name: string) => [`${value} W`, name]}
                />
                <Legend verticalAlign={isMobile ? "bottom" : "top"} height={isMobile ? 36 : 24} iconSize={8} wrapperStyle={{ fontSize: isMobile ? '10px' : '8px', fontWeight: 'bold', paddingTop: isMobile ? '8px' : '0' }} />
                <Line type="monotone" dataKey="50W Panel" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="75W Panel" stroke="#f59e0b" strokeWidth={1.2} dot={false} />
                <Line type="monotone" dataKey="100W Panel" stroke="#0ea5e9" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="150W Panel" stroke="#a855f7" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="200W Panel" stroke="#10b981" strokeWidth={2.2} dot={false} />
                
                {/* Dynamically highlights currently selected cooler wattage load line */}
                <ReferenceLine 
                  y={coolerWattage} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.5}
                  label={{ value: `${activeCooler.name} (${coolerWattage}W)`, position: 'insideRight', fill: '#ef4444', fontSize: 8, fontWeight: 700 }}
                />

                {/* Marker representing current real-world irradiance moment */}
                <ReferenceDot
                  x={currentIrradiance}
                  y={Math.round((panelWattage * (currentIrradiance / 100) * mpptEfficiency) * 10) / 10}
                  r={5}
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[9px] text-slate-400 mt-1 italic">
            Plots absolute direct direct available solar power output calculated over irradiance fraction values at {Math.round(mpptEfficiency * 100)}% MPPT tracker capacity.
          </div>
        </div>

        {/* CHART 2: Panel Selection Comparison */}
        <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between ${isMobile ? 'h-[440px]' : 'h-[380px]'}`} id="chart-panel-comparison">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">Chart 2: Bar Comparison</span>
              <span className="text-[10px] font-mono text-slate-400">Y-Axis: Min Irradiance Required (%)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">Panel Selection Comparison Matrix</h3>
          </div>
          
          <div className="flex-1 w-full mt-3 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={panelLimitsData} margin={{ top: 10, right: 10, left: -20, bottom: isMobile ? 25 : 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="panelSizeLabel" fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} interval={0} />
                <YAxis fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', padding: '8px' }}
                  formatter={(value: any, name: string, props: any) => {
                    const item = props.payload;
                    return [item.isUnreachable ? 'Insufficient peak capacity' : `${value}% Sun Intensity`, 'Min Irradiance for Full Speed'];
                  }}
                />
                <Bar dataKey="Min Irradiance Needed (%)" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {panelLimitsData.map((entry, idx) => {
                    const isActive = entry.panelSizeVal === panelWattage;
                    return (
                      <Cell
                        key={`cell-${idx}`}
                        fill={
                          isActive 
                            ? '#4f46e5' // Current selected panel: indigo
                            : entry.isUnreachable 
                            ? '#f43f5e' // Unreachable target line: pink-red
                            : '#10b981' // Reachable panels colors: emerald
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[9px] text-slate-400 mt-1 italic flex items-center justify-between">
            <span>Blue bar marks your currently selected solar panel array size.</span>
            <span className="text-rose-600 font-bold">Red triggers unreachable configuration.</span>
          </div>
        </div>

        {/* CHART 3: Daily Solar Simulation */}
        <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between ${isMobile ? 'h-[460px]' : 'h-[380px]'}`} id="chart-daily-simulation">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">Chart 3: Temporal Available Power</span>
              <span className="text-[10px] font-mono text-slate-400">Y-Axis: Solar Power (W)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">Daily Solar Simulation Profile</h3>
          </div>
          
          <div className="flex-1 w-full mt-3 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyAvailabilityData} margin={{ top: 10, right: 10, left: -20, bottom: isMobile ? 25 : 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} />
                <YAxis fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="W" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', padding: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                />
                <Legend verticalAlign={isMobile ? "bottom" : "top"} height={isMobile ? 36 : 24} iconSize={8} wrapperStyle={{ fontSize: isMobile ? '10px' : '8px', fontWeight: 'bold', paddingTop: isMobile ? '8px' : '0' }} />
                <Line 
                  type="monotone" 
                  dataKey="Available PV Power (W)" 
                  stroke="#f59e0b" 
                  strokeWidth={2.2} 
                  activeDot={{ r: 6 }} 
                  name={`PV Yield (${panelWattage}W Panel)`}
                />
                
                {/* Horizontal reference for cooler wattage load */}
                <ReferenceLine 
                  y={coolerWattage} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.2}
                  label={{ value: `Cooler draw: ${coolerWattage}W`, position: 'insideRight', fill: '#ef4444', fontSize: 8, fontWeight: 700 }}
                />

                {/* Highlight point linked to current simulatedHour state */}
                {dailyAvailabilityData.map((d, idx) => {
                  if (d.hour === simulatedHour) {
                    return (
                      <ReferenceDot
                        key={idx}
                        x={d.time}
                        y={d['Available PV Power (W)']}
                        r={5}
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Interactive sync buttons inside card */}
          <div className="mt-2 p-1.5 bg-slate-50 border border-slate-150 rounded-xl" id="time-sync-daily-slots-3">
            <span className="text-[8px] uppercase font-mono font-black text-slate-400 block mb-1">
              Select time slot to sync simulator state:
            </span>
            <div className="flex sm:grid sm:grid-cols-7 gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {dailyProfile.map(pt => {
                const isMatch = pt.hour === simulatedHour;
                return (
                  <button
                    key={pt.hour}
                    onClick={() => handleTimeSlotSync(pt.hour, pt.irradiance)}
                    className={`py-1 flex-1 min-w-[42px] sm:min-w-0 rounded-sm text-[8px] font-mono border font-bold transition-all truncate text-center ${
                      isMatch
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pt.time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 4: Fan Speed Response */}
        <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between ${isMobile ? 'h-[460px]' : 'h-[380px]'}`} id="chart-fan-speed-response">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">Chart 4: Controlled Output Speed</span>
              <span className="text-[10px] font-mono text-slate-400">Y-Axis: Fan Speed (%)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">Fan Speed Response Timeline</h3>
          </div>
          
          <div className="flex-1 w-full mt-3 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyFanSpeedData} margin={{ top: 10, right: 10, left: -20, bottom: isMobile ? 25 : 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} />
                <YAxis fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="%" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', padding: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                  formatter={(value: any, name: string, props: any) => [`${value}% Speed (Mode: ${props.payload.mode})`, name]}
                />
                <Line 
                  type="step" 
                  dataKey="Fan Speed (%)" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6 }}
                  dot={{ fill: '#0ea5e9', stroke: '#0284c7', r: 3 }}
                  name="Ventilation Fan Speed"
                />

                {/* Highlight dot representing active simulatedHour */}
                {dailyFanSpeedData.map((d, idx) => {
                  if (d.hour === simulatedHour) {
                    return (
                      <ReferenceDot
                        key={idx}
                        x={d.time}
                        y={d['Fan Speed (%)']}
                        r={5}
                        fill="#eab308"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Interactive sync buttons inside card */}
          <div className="mt-2 p-1.5 bg-slate-50 border border-slate-150 rounded-xl" id="time-sync-daily-slots-4">
            <span className="text-[8px] uppercase font-mono font-black text-slate-400 block mb-1">
              Select time slot to sync simulator state:
            </span>
            <div className="flex sm:grid sm:grid-cols-7 gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {dailyProfile.map(pt => {
                const isMatch = pt.hour === simulatedHour;
                return (
                  <button
                    key={pt.hour}
                    onClick={() => handleTimeSlotSync(pt.hour, pt.irradiance)}
                    className={`py-1 flex-1 min-w-[42px] sm:min-w-0 rounded-sm text-[8px] font-mono border font-bold transition-all truncate text-center ${
                      isMatch
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pt.time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART 5: Power Balance Analysis (Full width bottom spectrum plot) */}
        <div className={`lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between ${isMobile ? 'h-[460px]' : 'h-[420px]'}`} id="chart-power-balance-analysis">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">Chart 5: Dynamic Equilibrium Spectrum (Watts Delta)</span>
              <span className="text-[10px] font-mono text-slate-400">Y-Axis: Surplus/Deficit Balance (W)</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">Direct Drive Power Balance Analysis</h3>
          </div>
          
          <div className="flex-1 w-full mt-3 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={powerBalanceSpectrumData} margin={{ top: 10, right: 10, left: -20, bottom: isMobile ? 25 : 5 }}>
                <defs>
                  <linearGradient id="balanceSpectrumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="#eab308" stopOpacity={0.06} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="irradiance" fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="%" interval={isMobile ? 1 : 0} />
                <YAxis fontSize={isMobile ? 8 : 9} stroke="#94a3b8" tickLine={false} unit="W" />
                
                {/* Visual zones representing operational states on X axis */}
                <ReferenceArea
                  {...({
                    x1: 0,
                    x2: operationalRegions.shutdownEnd,
                    fill: "rgba(244, 63, 94, 0.05)",
                    label: { value: 'Shutdown (Red Zone)', position: 'insideBottomLeft', fill: '#f43f5e', fontSize: 8, fontWeight: 700 }
                  } as any)}
                />
                {operationalRegions.shutdownEnd < operationalRegions.reducedEnd && (
                  <ReferenceArea
                    {...({
                      x1: operationalRegions.shutdownEnd,
                      x2: operationalRegions.reducedEnd,
                      fill: "rgba(234, 179, 8, 0.05)",
                      label: { value: 'Reduced Speeds (Yellow Zone)', position: 'insideBottom', fill: '#b45309', fontSize: 8, fontWeight: 700 }
                    } as any)}
                  />
                )}
                {operationalRegions.reducedEnd < 100 && (
                  <ReferenceArea
                    {...({
                      x1: operationalRegions.reducedEnd,
                      x2: 100,
                      fill: "rgba(16, 185, 129, 0.05)",
                      label: { value: 'Full Speed Possible (Green Zone)', position: 'insideBottomRight', fill: '#047857', fontSize: 8, fontWeight: 700 }
                    } as any)}
                  />
                )}

                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', padding: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Power Balance (W)') {
                      return [`${value} W (${value >= 0 ? 'Surplus' : 'Deficit'})`, name];
                    }
                    return [`${value} W`, name];
                  }}
                />
                
                {/* Balance Area Curve */}
                <Area
                  type="monotone"
                  dataKey="Power Balance (W)"
                  stroke={powerBalance >= 0 ? "#10b981" : "#f43f5e"}
                  strokeWidth={2.5}
                  fill="url(#balanceSpectrumGradient)"
                  activeDot={{ r: 5 }}
                />
                
                {/* Neutral equilibrium horizontal line */}
                <ReferenceLine 
                  y={0} 
                  stroke="#475569" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3"
                  label={{ value: 'Equilibrium (0W)', position: 'insideTopLeft', fill: '#475569', fontSize: 8, fontWeight: 800 }}
                />

                {/* Pinpoint representing current real-time moment */}
                <ReferenceDot
                  x={currentIrradiance}
                  y={powerBalance}
                  r={6}
                  fill={powerBalance >= 0 ? '#10b981' : '#eab308'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  label={{ value: `Live (${powerBalance}W)`, position: 'top', fill: '#334155', fontSize: 8, fontWeight: 800 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 mt-2 font-normal border-t border-slate-100 pt-2 bg-slate-50/50 p-2 rounded-xl">
            <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Thermodynamic Sizing Balance:</strong> Clear-cut crossover mapping showing exactly where the panel yield meets or drops below load thresholds. Green highlight denotes direct surplus, yellow marks conservation modes, and red denotes water pump protection cutoff state.
            </span>
          </div>
        </div>

      </div>

      {/* THE AUTOMATICALLY GENERATED ENGINEERING INSIGHTS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white space-y-6" id="analytics-insights-panel">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">
              Solar Direct-Drive Engineering Insights Panel
            </h3>
            <p className="text-[10px] text-slate-400">
              Generated automatically over solar micro-grid direct-coupled standards and laws
            </p>
          </div>
        </div>

        <div className={isMobile ? "flex flex-col gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs"} id="insights-analytics-details">
          
          <div className={isMobile ? "space-y-3 bg-slate-850 p-6 rounded-[24px] border border-slate-800" : "space-y-1 bg-slate-850 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors"} id="insight-fullspeed-threshold">
            <span className={isMobile ? "text-[10px] text-amber-450 font-bold uppercase tracking-widest block font-mono" : "text-[9px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono"}>
              01. Full-Speed Threshold
            </span>
            <p className={isMobile ? "font-extrabold text-white text-base leading-normal" : "font-extrabold text-white text-xs mt-1 leading-normal"}>
              Irradiance Level: {minIrrForFullSpeed === 'unreachable' ? 'Not feasible with current panel size' : `${minIrrForFullSpeed}% sunshine`}
            </p>
            <p className={isMobile ? "text-xs text-slate-300 leading-relaxed font-normal pt-1" : "text-[11px] text-slate-400 leading-normal font-normal pt-1.5"}>
              The currently connected {panelWattage}W solar panel requires a minimum sun intensity of {minIrrForFullSpeed === 'unreachable' ? 'unreachable levels' : `${minIrrForFullSpeed}%`} to generate the full {coolerWattage}W load cleanly. Below this brightness, speed is dynamically modulated.
            </p>
          </div>

          <div className={isMobile ? "space-y-3 bg-slate-850 p-6 rounded-[24px] border border-slate-800" : "space-y-1 bg-slate-850 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors"} id="insight-sizing-grade">
            <span className={isMobile ? "text-[10px] text-emerald-450 font-bold uppercase tracking-widest block font-mono" : "text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block font-mono"}>
              02. Recommended Array Size
            </span>
            <p className={isMobile ? "font-extrabold text-white text-base leading-normal" : "font-extrabold text-white text-xs mt-1 leading-normal"}>
              Midday Standard size: {recPanelSizePeak}W Panel
            </p>
            <p className={isMobile ? "text-xs text-slate-300 leading-relaxed font-normal pt-1" : "text-[11px] text-slate-400 leading-normal font-normal pt-1.5"}>
              Based on standard safety factors, a recommended array capacity is {recPanelSizePeak}W. This includes a 20% engineering headroom sizing multiplier to overcome wiring resistance and thermal efficiency drops typical in real-world hot conditions.
            </p>
          </div>

          <div className={isMobile ? "space-y-3 bg-slate-850 p-6 rounded-[24px] border border-slate-800" : "space-y-1 bg-slate-850 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors"} id="insight-day-mode">
            <span className={isMobile ? "text-[10px] text-sky-450 font-bold uppercase tracking-widest block font-mono" : "text-[9px] text-sky-450 font-extrabold uppercase tracking-widest block font-mono"}>
              03. Daylight Performance
            </span>
            <p className={isMobile ? "font-extrabold text-white text-base leading-normal" : "font-extrabold text-white text-xs mt-1 leading-normal"}>
              Active Hours: {expectedDaytimePerformance.fullHours} hrs Full, {expectedDaytimePerformance.modulatedHours} hrs Modulated
            </p>
            <p className={isMobile ? "text-xs text-slate-300 leading-relaxed font-normal pt-1" : "text-[11px] text-slate-400 leading-normal font-normal pt-1.5"}>
              Over a standard daylight curve from 6:00 AM to 6:00 PM, the system operates on Full Speed for {expectedDaytimePerformance.fullHours} hours, in conserved mode for {expectedDaytimePerformance.modulatedHours} hours, and enters a protected safety shutdown for {expectedDaytimePerformance.shutdownHours} hours.
            </p>
          </div>

          <div className={isMobile ? "space-y-3 bg-slate-850 p-6 rounded-[24px] border border-slate-800" : "space-y-1 bg-slate-850 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors"} id="insight-drive-feasibility">
            <span className={isMobile ? "text-[10px] text-indigo-455 font-bold uppercase tracking-widest block font-mono" : "text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest block font-mono"}>
              04. Feasibility Classification
            </span>
            <p className={isMobile ? "font-extrabold text-white text-base leading-normal" : "font-extrabold text-white text-xs mt-1 leading-normal"}>
              Micro-Grid Sizing: {panelWattage < coolerWattage / mpptEfficiency ? 'Throttled / Under-powered' : panelWattage < (coolerWattage / mpptEfficiency) * 1.3 ? 'Sufficient / Well-Balanced' : 'Generous Safety Headroom'}
            </p>
            <p className={isMobile ? "text-xs text-slate-300 leading-relaxed font-normal pt-1" : "text-[11px] text-slate-400 leading-normal font-normal pt-1.5"}>
              {panelWattage < coolerWattage / mpptEfficiency 
                ? "The system is overall under-powered. The solar panel is too small to reach peak performance during optimal sun midday windows. An increase in panel size is highly recommended." 
                : "Excellent match! The system is highly viable for a zero-battery configuration. Shading and overcast tolerances offer a sustainable, reliable operations matrix."}
            </p>
          </div>

          <div className={isMobile ? "space-y-3 bg-slate-850 p-6 rounded-[24px] border border-slate-800" : "space-y-1 bg-slate-850 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors"} id="insight-surplus-analysis">
            <span className={isMobile ? "text-[10px] text-purple-450 font-bold uppercase tracking-widest block font-mono" : "text-[9px] text-purple-400 font-extrabold uppercase tracking-widest block font-mono"}>
              05. Dynamic Balance Analysis
            </span>
            <p className={isMobile ? "font-extrabold text-white text-base leading-normal" : "font-extrabold text-white text-xs mt-1 leading-normal"}>
              {powerBalance >= 0 ? `Active Surplus: ${powerBalance} Watts` : `Active Deficit: ${Math.abs(powerBalance)} Watts`}
            </p>
            <p className={isMobile ? "text-xs text-slate-300 leading-relaxed font-normal pt-1" : "text-[11px] text-slate-400 leading-normal font-normal pt-1.5"}>
              At {currentIrradiance}% sunshine, the solar panel array generates {calculatedState.availablePower}W of power. With {coolerWattage}W motor draw, this produces a {powerBalance >= 0 ? `surplus of +${powerBalance}W` : `deficit of ${powerBalance}W`}. Direct-drive modulation absorbs this cleanly.
            </p>
          </div>

          <div className={isMobile ? "space-y-3 bg-slate-850 p-6 rounded-[24px] border border-slate-800 shadow-2xs" : "space-y-1 bg-slate-850 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors shadow-2xs"} id="insight-engineering-conclusion">
            <span className={isMobile ? "text-[10px] text-amber-455 font-bold uppercase tracking-widest block font-mono" : "text-[9px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono"}>
              06. Direct-PV Sizing Score
            </span>
            <p className={isMobile ? "font-extrabold text-white text-base leading-normal" : "font-extrabold text-white text-xs mt-1 leading-normal"}>
              Efficiency Grade: {panelWattage >= recPanelSizePeak ? 'A+ (Optimal High Headroom)' : panelWattage >= coolerWattage / mpptEfficiency ? 'B (Balanced Peak Cover)' : 'C- (Suboptimal Ventilation)'}
            </p>
            <p className={isMobile ? "text-xs text-slate-300 leading-relaxed font-normal pt-1" : "text-[11px] text-slate-400 leading-normal font-normal pt-1.5"}>
              Direct-DC bypasses standard 20-30% battery charger roundtrip heat loss. Your system currently utilizes optimal MPPT tracker metrics ensuring solar energy conversion at {Math.round(mpptEfficiency * 100)}% efficiency levels.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
