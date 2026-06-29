/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sun, 
  Wind, 
  Activity, 
  Layers, 
  Info, 
  Battery, 
  ShieldCheck, 
  AlertCircle, 
  Play, 
  Gauge, 
  Briefcase, 
  Zap, 
  ShoppingBag, 
  HelpCircle, 
  TrendingUp, 
  Cpu, 
  Sliders, 
  DollarSign,
  Compass,
  FileSpreadsheet,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import sub-components from /src/components
import { SizingAnalytics } from './components/SizingAnalytics';
import { SizingCharts } from './components/SizingCharts';
import { SizingDiagnostics } from './components/SizingDiagnostics';
import { SizingBOMGenerator } from './components/SizingBOMGenerator';
import { BatteryBufferSimulation } from './components/BatteryBufferSimulation';
import { PackageExplorer } from './components/PackageExplorer';
import { CoolerVisualizer } from './components/CoolerVisualizer';

// Import calculations and utilities
import { 
  COOLER_MODELS, 
  calculateOperatingState, 
  getIrradianceForTime, 
  calculateMinIrradianceForFullSpeed, 
  TIME_IRRADIANCE_PROFILE 
} from './utils/solarCalculations';

export default function App() {
  // Input settings & sliders state
  const [selectedCoolerId, setSelectedCoolerId] = useState<string>('14-inch');
  const [panelWattage, setPanelWattage] = useState<number>(100);
  const [irradiancePercent, setIrradiancePercent] = useState<number>(85);
  const [mpptEnabled, setMpptEnabled] = useState<boolean>(true);
  
  // Simulated hour state (synchronized across SizingAnalytics & SizingCharts)
  const [simulatedHour, setSimulatedHour] = useState<number>(12);
  const [isTimeSimActive, setIsTimeSimActive] = useState<boolean>(false);

  // Router-like state to manage current page/tab: 
  // 'calculator' | 'charts' | 'bom' | 'simulation' | 'packages'
  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'bom' | 'simulation' | 'packages'>('calculator');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load selected cooler specifications
  const activeCooler = useMemo(() => {
    return COOLER_MODELS.find(c => c.id === selectedCoolerId) || COOLER_MODELS[0];
  }, [selectedCoolerId]);

  // Derived calculations
  const mpptEfficiency = useMemo(() => (mpptEnabled ? 0.95 : 1.0), [mpptEnabled]);
  const calculationResult = useMemo(() => {
    return calculateOperatingState(panelWattage, irradiancePercent, activeCooler.wattage, mpptEfficiency);
  }, [panelWattage, irradiancePercent, activeCooler.wattage, mpptEfficiency]);

  // Synchronize initial panel sizing when the user pivots cooler size
  useEffect(() => {
    if (selectedCoolerId === '12-inch') {
      setPanelWattage(60);
    } else if (selectedCoolerId === '14-inch') {
      setPanelWattage(110);
    } else {
      setPanelWattage(180);
    }
  }, [selectedCoolerId]);

  // Quick preset shortcuts for weather
  const setWeatherPreset = (percent: number) => {
    setIrradiancePercent(percent);
    setIsTimeSimActive(false);
  };

  // Quick preset shortcuts for panel sizes
  const handlePanelShortcut = (wattage: number) => {
    setPanelWattage(wattage);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Global Header Banner */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 py-3 sm:px-6 sm:py-4.5 shadow-xs">
        <div className="w-full max-w-[95%] xl:max-w-[94%] 2xl:max-w-[1800px] min-[1920px]:max-w-[1920px] min-[2200px]:max-w-[2150px] min-[2560px]:max-w-[95vw] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-mono font-bold tracking-tight shadow-sm text-base sm:text-lg flex-shrink-0">
              ⚡
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 flex-wrap">
                SOLAR DIRECT DRIVE
                <span className="text-[8px] sm:text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-mono font-bold">DC BUS</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Sizing Calculator & Configuration Simulator</p>
            </div>
          </div>

          {/* Right side controls: Hamburger on mobile, Badge+Reset on Desktop */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Low Voltage 48V DC Safe System
              </div>
              <button 
                onClick={() => {
                  setSelectedCoolerId('14-inch');
                  setPanelWattage(110);
                  setIrradiancePercent(85);
                  setMpptEnabled(true);
                  setSimulatedHour(12);
                  setIsTimeSimActive(false);
                  setActiveTab('calculator');
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 px-3 py-1.5 rounded-lg transition-all"
                title="Reset configuration defaults"
              >
                Reset Configuration
              </button>
            </div>
            
            {/* Reset button on mobile */}
            <button
              onClick={() => {
                setSelectedCoolerId('14-inch');
                setPanelWattage(110);
                setIrradiancePercent(85);
                setMpptEnabled(true);
                setSimulatedHour(12);
                setIsTimeSimActive(false);
                setActiveTab('calculator');
              }}
              className="md:hidden px-3.5 py-2 rounded-xl text-slate-650 border border-slate-250 hover:bg-slate-50 text-xs font-black transition-all cursor-pointer min-h-[40px] flex items-center justify-center shadow-xs"
            >
              Reset
            </button>
          </div>
          
        </div>
      </header>

      {/* Main Tabbed Navigation bar for Desktop */}
      <nav className="hidden md:block bg-slate-100 border-b border-slate-200/60 py-2 px-6">
        <div className="w-full max-w-[95%] xl:max-w-[94%] 2xl:max-w-[1800px] min-[1920px]:max-w-[1920px] min-[2200px]:max-w-[2150px] min-[2560px]:max-w-[95vw] mx-auto flex flex-wrap gap-2">
          {[
            { id: 'calculator', label: '⚡ Sizing Calculator', icon: Sliders },
            { id: 'charts', label: '📊 Sizing Curves & Charts', icon: TrendingUp },
            { id: 'bom', label: '📋 BOM Cost Estimator', icon: FileSpreadsheet },
            { id: 'simulation', label: '🔋 Battery Buffer Simulator', icon: Battery },
            { id: 'packages', label: '🎁 Bundle Package Explorer', icon: ShoppingBag }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  // Ensure simulation resets if we switch tabs directly
                  if (tab.id === 'simulation') {
                    setIsTimeSimActive(true);
                  }
                }}
                className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden"
            />
            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[280px] bg-white shadow-2xl z-50 p-6 flex flex-col justify-between md:hidden border-l border-slate-100"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Navigation</h3>
                    <p className="text-[10px] text-slate-400 font-mono">SOLAR DIRECT DC</p>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'calculator', label: 'Sizing Calculator', icon: Sliders },
                    { id: 'charts', label: 'Sizing Curves & Charts', icon: TrendingUp },
                    { id: 'bom', label: 'BOM Cost Estimator', icon: FileSpreadsheet },
                    { id: 'simulation', label: 'Battery Buffer Simulator', icon: Battery },
                    { id: 'packages', label: 'Bundle Package Explorer', icon: ShoppingBag }
                  ].map(tab => {
                    const isSelected = activeTab === tab.id;
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setIsMobileMenuOpen(false);
                          if (tab.id === 'simulation') {
                            setIsTimeSimActive(true);
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-450'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Reset controls inside drawer on mobile */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-[10.5px] font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span>Low Voltage 48V DC Safe System</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCoolerId('14-inch');
                    setPanelWattage(110);
                    setIrradiancePercent(85);
                    setMpptEnabled(true);
                    setSimulatedHour(12);
                    setIsTimeSimActive(false);
                    setActiveTab('calculator');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 rounded-xl transition-all text-center cursor-pointer"
                >
                  Reset Configuration
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <main className={`flex-1 w-full max-w-[95%] xl:max-w-[94%] 2xl:max-w-[1800px] min-[1920px]:max-w-[1920px] min-[2200px]:max-w-[2150px] min-[2560px]:max-w-[95vw] mx-auto px-4 py-6 md:px-6 md:py-12 ${isMobile ? 'pb-24' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-12"
          >

            {/* ========================================================== */}
            {/* TAB: SIZING CALCULATOR PANEL */}
            {/* ========================================================== */}
            {activeTab === 'calculator' && (
              isMobile ? (
                /* REDESIGNED MOBILE WORKSPACE FROM SCRATCH */
                <div className="space-y-10">
                  {/* Mobile header area */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-2">
                    <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">System Configurator</span>
                    <h2 className="text-3xl font-black text-slate-950 uppercase leading-tight">Parameters</h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Tune your solar DC coupling metrics to match BLDC compressor requirements.
                    </p>
                  </div>

                  {/* 1. COOLER SELECTION (FORMS IN MOBILE STYLE) */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">1. DC Fan Sweep Size</h3>
                      <p className="text-xs text-slate-500 font-medium">Select a direct-drive cooling motor load.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {COOLER_MODELS.map(model => {
                        const isSelected = selectedCoolerId === model.id;
                        return (
                          <button
                            key={model.id}
                            onClick={() => setSelectedCoolerId(model.id)}
                            className={`w-full p-5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between min-h-[64px] ${
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💨</span>
                              <div>
                                <span className="text-lg font-black block leading-none">{model.size}" Fan Sweep</span>
                                <span className={`text-xs mt-1.5 block font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                  BLDC Direct Drive
                                </span>
                              </div>
                            </div>
                            <span className="text-base font-black font-mono">
                              {model.wattage}W load
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. SOLAR PANEL OUTPUT SLIDER (MOBILE INPUT STYLE) */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="space-y-1 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">2. Solar Panel Output</h3>
                        <p className="text-xs text-slate-500 font-medium">Configure rated wattage threshold.</p>
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-base font-black px-3 py-1.5 rounded-xl">
                        {panelWattage}W
                      </span>
                    </div>

                    <div className="space-y-4 pt-2">
                      <input
                        type="range"
                        min="20"
                        max="400"
                        value={panelWattage}
                        onChange={(e) => setPanelWattage(Number(e.target.value))}
                        className="w-full accent-indigo-650 h-3 bg-slate-100 rounded-lg cursor-pointer"
                        style={{ height: '12px' }}
                      />
                      
                      <span className="text-xs text-slate-400 font-bold block text-center uppercase tracking-wider">
                        Preset Short-cuts
                      </span>

                      <div className="space-y-3">
                        {[50, 100, 150, 200, 300].map(w => (
                          <button
                            key={w}
                            onClick={() => handlePanelShortcut(w)}
                            className={`w-full py-4 px-5 text-sm rounded-2xl border font-black transition-all min-h-[52px] flex items-center justify-between ${
                              panelWattage === w
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            <span>Standard Solar Size</span>
                            <span className="font-mono text-base font-black">{w} Watts</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. SOLAR IRRADIANCE SLIDER (MOBILE INPUT STYLE) */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="space-y-1 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">3. Solar Irradiance</h3>
                        <p className="text-xs text-slate-500 font-medium">Real-time solar fuel levels.</p>
                      </div>
                      <span className="bg-amber-50/10 border border-amber-500/20 text-amber-700 font-mono text-base font-black px-3 py-1.5 rounded-xl">
                        {irradiancePercent}%
                      </span>
                    </div>

                    <div className="space-y-4 pt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={irradiancePercent}
                        onChange={(e) => {
                          setIrradiancePercent(Number(e.target.value));
                          setIsTimeSimActive(false);
                        }}
                        className="w-full accent-amber-500 h-3 bg-slate-100 rounded-lg cursor-pointer"
                        style={{ height: '12px' }}
                      />
                      
                      <span className="text-xs text-slate-400 font-bold block text-center uppercase tracking-wider">
                        Weather Presets
                      </span>

                      <div className="space-y-3">
                        {[
                          { label: '☀ Direct Sunlight', val: 100, desc: 'Ideal clear solar noon conditions' },
                          { label: '⛅ Light Clouds', val: 80, desc: 'Partially obscured sunshine' },
                          { label: '☁ Heavy Overcast', val: 40, desc: 'Monsoon skies or severe shading' },
                          { label: '⚡ Worst Case Shadow', val: 15, desc: 'Extreme low-light threshold' }
                        ].map(preset => (
                          <button
                            key={preset.val}
                            onClick={() => setWeatherPreset(preset.val)}
                            className={`w-full py-4 px-5 text-left rounded-2xl border font-bold transition-all min-h-[52px] flex items-center justify-between ${
                              irradiancePercent === preset.val
                                ? 'bg-amber-50 border-amber-350 text-amber-800'
                                : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <span className="text-sm font-black block">{preset.label}</span>
                              <span className="text-[11px] text-slate-450 block font-normal mt-0.5">{preset.desc}</span>
                            </div>
                            <span className="font-mono text-sm font-black">{preset.val}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. CHARGE CONTROLLER MODE */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">4. Charge Controller</h3>
                      <p className="text-xs text-slate-500 font-medium">Select DC impedance tracking mode.</p>
                    </div>

                    <button
                      onClick={() => setMpptEnabled(!mpptEnabled)}
                      className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between min-h-[64px] ${
                        mpptEnabled
                          ? 'bg-indigo-650 text-white border-indigo-750 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Cpu className={`w-6 h-6 ${mpptEnabled ? 'text-indigo-200' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-sm font-black block uppercase tracking-tight">MPPT Sizing Mode</span>
                          <span className={`text-[11px] block mt-0.5 font-medium ${mpptEnabled ? 'text-indigo-200' : 'text-slate-500'}`}>
                            Maximizes peak extraction ratios
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs uppercase tracking-wide rounded-lg font-bold font-mono ${mpptEnabled ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {mpptEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </button>
                  </div>

                  {/* 5. TELEMETRY COOLER VISUALIZER RENDER */}
                  <div className="w-full">
                    <CoolerVisualizer stats={calculationResult} coolerName={activeCooler.name} />
                  </div>

                  {/* 6. SIZING DIAGNOSTICS Advisory warnings */}
                  <div className="w-full">
                    <SizingDiagnostics 
                      panelWattage={panelWattage}
                      cooler={activeCooler}
                      irradiance={irradiancePercent}
                      mpptEfficiency={mpptEfficiency}
                    />
                  </div>

                  {/* 7. SIZING ANALYTICS Dashboard metrics and curves */}
                  <div className="w-full">
                    <SizingAnalytics
                      panelWattage={panelWattage}
                      currentIrradiance={irradiancePercent}
                      coolerWattage={activeCooler.wattage}
                      activeCooler={activeCooler}
                      availablePower={calculationResult.availablePower}
                      mpptEfficiency={mpptEfficiency}
                      simulatedHour={simulatedHour}
                      setSimulatedHour={setSimulatedHour}
                      setIrradiancePercent={setIrradiancePercent}
                      setIsTimeSimActive={setIsTimeSimActive}
                    />
                  </div>
                </div>
              ) : (
                /* DESKTOP LAYOUT (REMAINS UNCHANGED) */
                <div className="space-y-12">
                  
                  {/* Visualizer and Slider Grid layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-stretch">
                    
                    {/* Left Column: Interactive Settings Input deck (5 cols) */}
                    <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-8 flex flex-col justify-between shadow-xs space-y-6">
                      
                      <div>
                        <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Input System Tuning</span>
                        <h2 className="text-2xl font-black text-slate-950 mt-0.5 leading-none uppercase">Parameters Deck</h2>
                        <p className="text-xs text-slate-500 mt-1.5 font-medium">Configure solar sizing metrics below and preview immediate efficiency impact.</p>
                      </div>

                      {/* Selector 1: Cooler fan size */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-600 font-bold uppercase tracking-wider block">1. Select DC Fan Sweeps size</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {COOLER_MODELS.map(model => {
                            const isSelected = selectedCoolerId === model.id;
                            return (
                              <button
                                key={model.id}
                                onClick={() => setSelectedCoolerId(model.id)}
                                className={`p-4 sm:p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[48px] ${
                                  isSelected
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                    : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-base font-extrabold tracking-tight block">{model.size}" Fan</span>
                                <span className={`text-[10px] leading-none mt-1 select-none font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {model.wattage}W load
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selector 2: Solar panel wattage slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-600 font-bold uppercase tracking-wider block">2. Solar Panel Output ({panelWattage}W)</label>
                          <span className="font-mono text-slate-500 font-bold">Range: 20-400W</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="400"
                          value={panelWattage}
                          onChange={(e) => setPanelWattage(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                        {/* Short-cuts panel */}
                        <div className="flex flex-wrap gap-2.5 pt-1.5">
                          {[50, 100, 150, 200, 300].map(w => (
                            <button
                              key={w}
                              onClick={() => handlePanelShortcut(w)}
                              className={`px-4 py-2.5 sm:px-2.5 sm:py-1 text-xs sm:text-[10px] rounded-xl sm:rounded border font-bold min-h-[38px] sm:min-h-0 flex items-center justify-center ${
                                panelWattage === w
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {w}W
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selector 3: Solar irradiance slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-600 font-bold uppercase tracking-wider block">3. Solar Irradiance ({irradiancePercent}%)</label>
                          <span className="font-mono text-slate-500 font-bold">Daylight exposure</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={irradiancePercent}
                          onChange={(e) => {
                            setIrradiancePercent(Number(e.target.value));
                            setIsTimeSimActive(false);
                          }}
                          className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                        {/* Weather shortcuts */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5">
                          {[
                            { label: '☀ Direct', val: 100 },
                             { label: '⛅ Light', val: 80 },
                             { label: '☁ Heavy', val: 40 },
                             { label: '⚡ Worst', val: 15 }
                          ].map(preset => (
                            <button
                              key={preset.val}
                              onClick={() => setWeatherPreset(preset.val)}
                              className={`py-3 px-3 sm:py-1.5 rounded-xl sm:rounded text-xs sm:text-[10px] text-center border font-bold min-h-[44px] sm:min-h-0 flex items-center justify-center ${
                                irradiancePercent === preset.val
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selector 4: MPPT mode button */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-600 font-bold uppercase tracking-wider block">4. Charge Controller Mode</label>
                        <button
                          onClick={() => setMpptEnabled(!mpptEnabled)}
                          className={`w-full p-4 sm:p-3.5 rounded-2xl sm:rounded-xl border cursor-pointer text-left transition-all flex items-center justify-between min-h-[52px] ${
                            mpptEnabled
                              ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Zap className={`w-5 h-5 ${mpptEnabled ? 'text-indigo-650' : 'text-slate-400'}`} />
                            <div>
                              <span className="text-xs font-black block">MPPT Optimization (95% efficiency)</span>
                              <span className="text-[10px] text-slate-400 font-medium">Maximizes peak extraction ratios</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wide rounded font-bold ${mpptEnabled ? 'bg-indigo-650 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {mpptEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </button>
                      </div>

                      {/* Integrated Sub-Page Redirections for premium accessibility */}
                      <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-xl space-y-2.5">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">Simulations & Packages</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button 
                            onClick={() => setActiveTab('simulation')}
                            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-center flex items-center justify-center gap-1.5 transition-all text-[11px]"
                          >
                            <Battery className="w-3.5 h-3.5 text-indigo-600" />
                            Buffer Sim
                          </button>
                          <button 
                            onClick={() => setActiveTab('packages')}
                            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-center flex items-center justify-center gap-1.5 transition-all text-[11px]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                            Bundle Packages
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Telemetry Cooler Visualizer Render (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <CoolerVisualizer stats={calculationResult} coolerName={activeCooler.name} />
                    </div>

                  </div>

                  {/* Sizing Diagnostics: Detailed advisory alerts */}
                  <SizingDiagnostics 
                    panelWattage={panelWattage}
                    cooler={activeCooler}
                    irradiance={irradiancePercent}
                    mpptEfficiency={mpptEfficiency}
                  />

                  {/* Sizing Analytics: Interactive charts and timeline logs */}
                  <SizingAnalytics
                    panelWattage={panelWattage}
                    currentIrradiance={irradiancePercent}
                    coolerWattage={activeCooler.wattage}
                    activeCooler={activeCooler}
                    availablePower={calculationResult.availablePower}
                    mpptEfficiency={mpptEfficiency}
                    simulatedHour={simulatedHour}
                    setSimulatedHour={setSimulatedHour}
                    setIrradiancePercent={setIrradiancePercent}
                    setIsTimeSimActive={setIsTimeSimActive}
                  />

                </div>
              )
            )}

            {/* ========================================================== */}
            {/* TAB: ADVANCED CHARTS PANEL */}
            {/* ========================================================== */}
            {activeTab === 'charts' && (
              <div className="space-y-12 bg-white border border-slate-200/80 p-6 sm:p-10 rounded-2xl shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Engineering Diagrams</span>
                  <h2 className="text-3xl font-black text-slate-950 mt-0.5 leading-none uppercase">Sizing Curves</h2>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Verify solar-vs-load intersection bounds, daily exposure ranges, and panel limits.</p>
                </div>
                <SizingCharts
                  panelWattage={panelWattage}
                  currentIrradiance={irradiancePercent}
                  coolerWattage={activeCooler.wattage}
                  availablePower={calculationResult.availablePower}
                  mpptEfficiency={mpptEfficiency}
                  simulatedHour={simulatedHour}
                  setSimulatedHour={setSimulatedHour}
                  setIrradiancePercent={setIrradiancePercent}
                  setIsTimeSimActive={setIsTimeSimActive}
                />
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB: BOM GENERATOR COSTING PANEL */}
            {/* ========================================================== */}
            {activeTab === 'bom' && (
              <div className="space-y-12 bg-white border border-slate-200/80 p-6 sm:p-10 rounded-2xl shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Commercial Procurement</span>
                  <h2 className="text-3xl font-black text-slate-950 mt-0.5 leading-none uppercase">BOM Estimator</h2>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Calculate exact component prices, supplier margins, and trade markups based on sizing configurations.</p>
                </div>
                <SizingBOMGenerator
                  panelWattage={panelWattage}
                  setPanelWattage={setPanelWattage}
                  activeCooler={activeCooler}
                  setSelectedCoolerId={setSelectedCoolerId}
                  mpptEnabled={mpptEnabled}
                  setMpptEnabled={setMpptEnabled}
                  irradiancePercent={irradiancePercent}
                  setIrradiancePercent={setIrradiancePercent}
                />
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB: BATTERY BUFFER SIMULATIONS */}
            {/* ========================================================== */}
            {activeTab === 'simulation' && (
              <div className="space-y-12 bg-white border border-slate-200/80 p-6 sm:p-10 rounded-2xl shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Dynamic Scada Environment</span>
                  <h2 className="text-3xl font-black text-slate-950 mt-0.5 leading-none uppercase">Buffer Simulator</h2>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Simulate weather scenario disruptions, battery charging capacity, and run logging events in real-time.</p>
                </div>
                <BatteryBufferSimulation
                  initialPanelWattage={panelWattage}
                  initialSelectedCoolerId={selectedCoolerId}
                  onBack={() => {
                    setActiveTab('calculator');
                  }}
                />
              </div>
            )}

            {/* ========================================================== */}
            {/* TAB: PREFAB BUNDLED PACKAGES */}
            {/* ========================================================== */}
            {activeTab === 'packages' && (
              <div className="space-y-12 bg-white border border-slate-200/80 p-6 sm:p-10 rounded-2xl shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Bundled Off-Grid Architectures</span>
                  <h2 className="text-3xl font-black text-slate-950 mt-0.5 leading-none uppercase">Bundle Package Explorer</h2>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Explore prepackaged Zazen Series bundles, compare product specs, and check performance ratings.</p>
                </div>
                <PackageExplorer
                  onBack={() => {
                    setActiveTab('calculator');
                  }}
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Bottom Credit strip */}
      <footer className="bg-slate-900 text-slate-500 border-t border-slate-800 py-8 px-6 text-xs font-mono">
        <div className="w-full max-w-[95%] xl:max-w-[94%] 2xl:max-w-[1800px] min-[1920px]:max-w-[1920px] min-[2200px]:max-w-[2150px] min-[2560px]:max-w-[95vw] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span>© 2026 Zazen Climate Labs. Direct DC Coupling Systems.</span>
            <span className="block text-[11px] text-slate-600 mt-0.5">Sizing diagnostics computed according to local atmospheric parameters and high-efficiency BLDC stator engineering norms.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-600">v1.2.4 Stabilized Build</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Navigation Bar for Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-2 py-2 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-safe">
          {[
            { id: 'calculator', label: 'Sizing', icon: Sliders },
            { id: 'charts', label: 'Curves', icon: TrendingUp },
            { id: 'bom', label: 'BOM', icon: FileSpreadsheet },
            { id: 'simulation', label: 'Buffer', icon: Battery },
            { id: 'packages', label: 'Packages', icon: ShoppingBag }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'simulation') {
                    setIsTimeSimActive(true);
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all cursor-pointer min-h-[56px] min-w-[64px] ${
                  isSelected ? 'text-indigo-650 scale-105 font-black' : 'text-slate-450 hover:text-slate-750'
                }`}
              >
                <IconComp className={`w-6 h-6 mb-1 ${isSelected ? 'text-indigo-650 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
