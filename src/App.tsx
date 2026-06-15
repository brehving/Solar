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
  FileSpreadsheet
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
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4.5 shadow-xs">
        <div className="w-full max-w-[95%] xl:max-w-[94%] 2xl:max-w-[1800px] min-[1920px]:max-w-[1920px] min-[2200px]:max-w-[2150px] min-[2560px]:max-w-[95vw] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-mono font-bold tracking-tight shadow-sm">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                SOLAR DIRECT DRIVE
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold">DC BUS NATIVE</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Sizing Calculator & Configuration Simulator</p>
            </div>
          </div>

          {/* Core system status badge */}
          <div className="flex items-center gap-3">
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
          
        </div>
      </header>

      {/* Main Tabbed Navigation bar */}
      <nav className="bg-slate-100 border-b border-slate-200/60 py-2 px-6">
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

      {/* Main Body */}
      <main className="flex-1 w-full max-w-[95%] xl:max-w-[94%] 2xl:max-w-[1800px] min-[1920px]:max-w-[1920px] min-[2200px]:max-w-[2150px] min-[2560px]:max-w-[95vw] mx-auto px-6 py-8 md:py-12">
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
              <div className="space-y-12">
                
                {/* Visualizer and Slider Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Interactive Settings Input deck (5 cols) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs space-y-6">
                    
                    <div>
                      <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Input System Tuning</span>
                      <h2 className="text-2xl font-black text-slate-950 mt-0.5 leading-none uppercase">Parameters Deck</h2>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">Configure solar sizing metrics below and preview immediate efficiency impact.</p>
                    </div>

                    {/* Selector 1: Cooler fan size */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-600 font-bold uppercase tracking-wider block">1. Select DC Fan Sweeps size</label>
                      <div className="grid grid-cols-3 gap-2">
                        {COOLER_MODELS.map(model => {
                          const isSelected = selectedCoolerId === model.id;
                          return (
                            <button
                              key={model.id}
                              onClick={() => setSelectedCoolerId(model.id)}
                              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
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
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[50, 100, 150, 200, 300].map(w => (
                          <button
                            key={w}
                            onClick={() => handlePanelShortcut(w)}
                            className={`px-2.5 py-1 text-[10px] rounded border font-bold ${
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
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        {[
                          { label: '☀ Direct', val: 100 },
                          { label: '⛅ Light', val: 80 },
                          { label: '☁ Heavy', val: 40 },
                          { label: '⚡ Worst', val: 15 }
                        ].map(preset => (
                          <button
                            key={preset.val}
                            onClick={() => setWeatherPreset(preset.val)}
                            className={`p-1.5 rounded text-[10px] text-center border font-semibold ${
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
                        className={`w-full p-3.5 rounded-xl border cursor-pointer text-left transition-all flex items-center justify-between ${
                          mpptEnabled
                            ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Zap className={`w-4.5 h-4.5 ${mpptEnabled ? 'text-indigo-650' : 'text-slate-400'}`} />
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
                  activeCooler={activeCooler}
                  mpptEnabled={mpptEnabled}
                  irradiancePercent={irradiancePercent}
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

    </div>
  );
}
