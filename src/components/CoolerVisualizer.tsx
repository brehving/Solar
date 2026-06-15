/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Wind, Droplets, ShieldAlert, Cpu } from 'lucide-react';
import { CalculationResult } from '../types';

interface CoolerVisualizerProps {
  stats: CalculationResult;
  coolerName: string;
}

export function CoolerVisualizer({ stats, coolerName }: CoolerVisualizerProps) {
  const { fanSpeed, pumpSpeed, mode } = stats;

  // Determine fan rotation duration based on speed
  let duration = 0;
  if (fanSpeed === 100) duration = 0.6;
  else if (fanSpeed === 75) duration = 1.0;
  else if (fanSpeed === 50) duration = 1.6;
  else if (fanSpeed === 25) duration = 2.8;

  // Sound levels description
  const fanNoiseDesc = 
    fanSpeed === 100 ? 'Whisper-High (45 dB)' :
    fanSpeed === 75 ? 'Humming-Med (38 dB)' :
    fanSpeed === 50 ? 'Gentle Breeze (30 dB)' :
    fanSpeed === 25 ? 'Silent-Low (22 dB)' : 'Noiseless (Off)';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden" id="cooler-visualizer-card">
      {/* Background glow effects based on mode */}
      <div 
        className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl transition-all duration-700 opacity-20 ${
          mode === 'Full Speed' ? 'bg-emerald-500' :
          mode === 'Normal Mode' ? 'bg-sky-500' :
          mode === 'Eco Mode' ? 'bg-blue-500' :
          mode === 'Low Mode' ? 'bg-amber-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex items-center justify-between mb-8 z-10 relative">
        <div>
          <span className="text-sm uppercase font-black text-indigo-400/90 tracking-widest block">Device Telemetry</span>
          <h3 className="text-2xl font-black text-slate-100 mt-1">{coolerName}</h3>
        </div>
        <div className={`px-4.5 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider ${
          mode === 'Full Speed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
          mode === 'Normal Mode' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
          mode === 'Eco Mode' ? 'bg-blue-500/10 text-blue-400 border border-sky-500/20' :
          mode === 'Low Mode' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {mode}
        </div>
      </div>

      {/* Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Animated Fan Visual */}
        <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-slate-800/60 rounded-xl p-8 relative">
          <div className="relative w-44 h-44 flex items-center justify-center border-4 border-slate-800 rounded-full bg-slate-950 shadow-inner">
            {/* Outer Ring ticks */}
            <div className="absolute inset-0 border border-dashed border-slate-700/40 rounded-full animate-spin [animation-duration:60s]" />
            
            {/* Rotating Fan Blades and Hub */}
            {duration > 0 ? (
              <motion.div
                className="relative w-36 h-36 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: duration,
                }}
              >
                {/* 3 Blades */}
                <div className="absolute w-7 h-32 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full opacity-90" />
                <div className="absolute w-7 h-32 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full rotate-120 opacity-90" />
                <div className="absolute w-7 h-32 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full rotate-240 opacity-90" />
                
                {/* Core hub */}
                <div className="absolute w-12 h-12 bg-slate-200 rounded-full border-2 border-slate-400 shadow-md flex items-center justify-center">
                  <div className="w-5 h-5 bg-slate-600 rounded-full" />
                </div>
              </motion.div>
            ) : (
              <div className="relative w-36 h-36 flex items-center justify-center opacity-40">
                <div className="absolute w-7 h-32 bg-slate-700 rounded-full" />
                <div className="absolute w-7 h-32 bg-slate-700 rounded-full rotate-120" />
                <div className="absolute w-7 h-32 bg-slate-700 rounded-full rotate-240" />
                <div className="absolute w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center">
                  <div className="w-5 h-5 bg-slate-900 rounded-full" />
                </div>
              </div>
            )}

            {/* Direction Arrows Indicator */}
            {duration > 0 && (
              <div className="absolute -bottom-1 text-xs text-sky-400 font-mono flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 font-bold shadow-md">
                <Wind className="w-3.5 h-3.5 animate-pulse" />
                {fanSpeed}% RPM
              </div>
            )}
          </div>
          <span className="text-sm text-slate-350 font-black tracking-wide font-mono mt-4">Wind Velocity Control</span>
        </div>

        {/* Pump & Cooling Telemetry */}
        <div className="space-y-5">
          {/* Fan speed bar */}
          <div className="bg-slate-950/30 p-5 border border-slate-800/40 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-black text-slate-300 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-400" /> Ventilation Fan
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-sky-400">{fanSpeed}% Speed</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-sky-500 to-sky-400 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${fanSpeed}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-mono">
              <span>{fanNoiseDesc}</span>
              <span>Direct-DC Drive</span>
            </div>
          </div>

          {/* Water Pump controller state */}
          <div className="bg-slate-950/30 p-5 border border-slate-800/40 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-black text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400" /> Evaporative Pump
              </span>
              <span className={`text-sm sm:text-base font-black font-mono ${pumpSpeed === 'Off' ? 'text-slate-500' : 'text-blue-400'}`}>
                {pumpSpeed}
              </span>
            </div>
            
            {/* Water flow visualizer animation if pump is running */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden relative">
              {pumpSpeed !== 'Off' ? (
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Fluid particle stream inside progress bar */}
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] bg-[length:50px_100%] animate-[shimmer_1.5s_infinite]" />
                </motion.div>
              ) : (
                <div className="bg-slate-700 h-2.5 w-0 rounded-full" />
              )}
            </div>

            {/* Safety/Voltage threshold info */}
            <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-550">
              {stats.availablePower < stats.coolerLoad * 0.5 ? (
                <div className="flex items-center gap-1.5 text-amber-500/90 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Stall protection active (Pump disabled &lt;50% power)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400 font-bold font-mono">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Submersible pump operation stabilized</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
