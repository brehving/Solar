/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Info,
  Layers,
  Table,
  LineChart,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  Zap,
  ChevronLeft,
  Cpu,
  Sun,
  Battery,
  Sliders,
  CheckCircle2,
  XCircle,
  Activity,
  Gauge,
  IndianRupee
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PackageExplorerProps {
  onBack: () => void;
}

// ==========================================
// STATIC PORTFOLIO DATA (Synchronized)
// ==========================================
export interface PortfolioModel {
  id: string;
  num: number;
  badge: string;
  name: string;
  subtitle: string;
  features: string[];
  targetUsers: string[];
  benefits: string;
  hasBattery: boolean;
  hasSolar: boolean;
  hasMppt: boolean;
  hasAcCharging: boolean;
  hasSwappableBattery: boolean;
}

export const PORTFOLIO_MODELS: PortfolioModel[] = [
  {
    id: 'model-1',
    num: 1,
    badge: 'Solar Ready DC Bus',
    name: 'Model 1: AC/DC Only',
    subtitle: 'Direct high-efficiency DC operation with zero battery overhead.',
    features: [
      '48V DC Native Architecture',
      'No Battery Included',
      'No Solar Panel Included',
      'Highest Conversion Efficiency',
      'Direct DC Hybrid Operation'
    ],
    targetUsers: ['Existing Solar Owners', 'DC Microgrid Operators', 'Budget Conscious Buyers'],
    benefits: 'Bypasses standard AC conversion losses. Plugs directly into your existing solar array or battery setups.',
    hasBattery: false,
    hasSolar: false,
    hasMppt: false,
    hasAcCharging: true,
    hasSwappableBattery: false,
  },
  {
    id: 'model-2',
    num: 2,
    badge: 'Integrated Power Protection',
    name: 'Model 2: Battery Integrated',
    subtitle: 'Built-in Lithium buffer to absorb immediate power grid fluctuations.',
    features: [
      'Internal Battery Pack',
      'Sleek AC Grid Charging',
      '3-4 Hour Autonomous Backup',
      'Automatic Failover Relays'
    ],
    targetUsers: ['Frequent Power Cut Areas', 'Residential Apartments', 'Offices & Classrooms'],
    benefits: 'Maintains active internal room ventilation even when city grids go dark. Automatically tops up over night.',
    hasBattery: true,
    hasSolar: false,
    hasMppt: false,
    hasAcCharging: true,
    hasSwappableBattery: false,
  },
  {
    id: 'model-3',
    num: 3,
    badge: 'Commercial Duty Cycle',
    name: 'Model 3: Swappable Battery',
    subtitle: 'Industrial dual-bay slide hot-swappable continuous cooling setup.',
    features: [
      'Removable Battery Module',
      'Hot Swap Dual-Bay Support',
      'Continuous 24/7 Run potential',
      'Heavy-duty Commercial Chassis'
    ],
    targetUsers: ['Shops & Boutiques', 'Street Retail Kiosks', 'Outdoor Food Stalls'],
    benefits: 'Swap depleted cartridges with fully charged ones in 5 seconds. Ideal for heavy operational business environments.',
    hasBattery: true,
    hasSolar: false,
    hasMppt: false,
    hasAcCharging: true,
    hasSwappableBattery: true,
  },
  {
    id: 'model-4',
    num: 4,
    badge: 'Daylight Autonomy',
    name: 'Model 4: Solar Direct',
    subtitle: 'High-performance solar monocrystalline package with zero battery costs.',
    features: [
      'Solar Panel Included in bundle',
      'Direct Solar-to-Fan Operation',
      'No Battery Lifespan Cost',
      'Peak Daylight Performance cycles'
    ],
    targetUsers: ['Daytime Workshops', 'Farms & Agricultural Sheds', 'Rooftop Cafes'],
    benefits: 'Perfect synergy of thermal demands. Higher sunny intensity directly powers maximum CFM airflow when heat peaks.',
    hasBattery: false,
    hasSolar: true,
    hasMppt: true,
    hasAcCharging: false,
    hasSwappableBattery: false,
  },
  {
    id: 'model-5',
    num: 5,
    badge: 'Ultimate Grid Independence',
    name: 'Model 5: Solar + Battery Premium',
    subtitle: 'Our flagship 100% off-grid cooling machine with complete automation.',
    features: [
      '120W PV Mono Panel Bundled',
      'Internal Backup Battery Included',
      'High-speed MPPT Charging Core',
      'Fully Autonomous Off-Grid Logics'
    ],
    targetUsers: ['Off-Grid Eco Cabins', 'Remote Rural Areas', 'Premium Green Tech Enthusiasts'],
    benefits: 'Operates 100% independently from utility networks. Standardizes daytime sun, charges buffers, cools nighttimes.',
    hasBattery: true,
    hasSolar: true,
    hasMppt: true,
    hasAcCharging: true,
    hasSwappableBattery: false,
  }
];

export interface SizeSpecification {
  id: string;
  name: string;
  powerDraw: number;
  voltage: string;
  waterTank: number;
  airflow: number;
  application: string;
}

export const SIZE_SPECIFICATIONS: SizeSpecification[] = [
  {
    id: '12-inch',
    name: '12-Inch Compact DC Cooler',
    powerDraw: 40,
    voltage: '48V DC Standard',
    waterTank: 35,
    airflow: 2200,
    application: 'Personal Room / Workspace / Study Den'
  },
  {
    id: '14-inch',
    name: '14-Inch Medium DC Cooler',
    powerDraw: 70,
    voltage: '48V DC Standard',
    waterTank: 48,
    airflow: 3500,
    application: 'Master Bedroom / Living Area / Residential Hallway'
  },
  {
    id: '16-inch',
    name: '16-Inch High-Efficiency Cooler',
    powerDraw: 113,
    voltage: '48V DC Standard',
    waterTank: 55,
    airflow: 4000,
    application: 'Commercial Stores / Public Shops / Large Open Arena'
  }
];

// Comprehensive Pricing Matrix
const PRICING_MATRIX: Record<string, Record<string, { mrp: number; dealerPrice: number; distributorPrice: number; manufacturingCost: number }>> = {
  '12-inch': {
    'model-1': { mrp: 13900, dealerPrice: 11500, distributorPrice: 9900, manufacturingCost: 6500 },
    'model-2': { mrp: 18500, dealerPrice: 15500, distributorPrice: 13500, manufacturingCost: 9200 },
    'model-3': { mrp: 21900, dealerPrice: 18005, distributorPrice: 15900, manufacturingCost: 11200 },
    'model-4': { mrp: 19900, dealerPrice: 16500, distributorPrice: 14500, manufacturingCost: 10000 },
    'model-5': { mrp: 27900, dealerPrice: 23200, distributorPrice: 20500, manufacturingCost: 14500 }
  },
  '14-inch': {
    'model-1': { mrp: 16900, dealerPrice: 13900, distributorPrice: 12200, manufacturingCost: 7900 },
    'model-2': { mrp: 21500, dealerPrice: 17800, distributorPrice: 15500, manufacturingCost: 10900 },
    'model-3': { mrp: 25900, dealerPrice: 21200, distributorPrice: 18850, manufacturingCost: 13200 },
    'model-4': { mrp: 23900, dealerPrice: 19500, distributorPrice: 17200, manufacturingCost: 12100 },
    'model-5': { mrp: 33900, dealerPrice: 27900, distributorPrice: 24700, manufacturingCost: 17400 }
  },
  '16-inch': {
    'model-1': { mrp: 19900, dealerPrice: 16500, distributorPrice: 14500, manufacturingCost: 9500 },
    'model-2': { mrp: 24900, dealerPrice: 20500, distributorPrice: 17900, manufacturingCost: 12500 },
    'model-3': { mrp: 29900, dealerPrice: 24500, distributorPrice: 21500, manufacturingCost: 15500 },
    'model-4': { mrp: 27900, dealerPrice: 22800, distributorPrice: 19900, manufacturingCost: 13900 },
    'model-5': { mrp: 39900, dealerPrice: 32500, distributorPrice: 28800, manufacturingCost: 20500 }
  }
};

export function PackageExplorer({ onBack }: PackageExplorerProps) {
  // Page structure tabs as requested
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'pricing' | 'market' | 'bom'>('overview');

  const [isMobile, setIsMobile] = useState<boolean>(false);
  React.useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Unified selections
  const [selectedSize, setSelectedSize] = useState<string>('14-inch');
  const [selectedModelId, setSelectedModelId] = useState<string>('model-5');

  // Simulation parameters for Overview panel
  const [solarSunIntensity, setSolarSunIntensity] = useState<number>(85); // 0% to 100%
  const [coolerSpeedStep, setCoolerSpeedStep] = useState<number>(3); // 1 = eco, 2 = standard, 3 = max turbo

  // Derived specifications
  const activeSizeSpec = useMemo(() => {
    return SIZE_SPECIFICATIONS.find(s => s.id === selectedSize) || SIZE_SPECIFICATIONS[1];
  }, [selectedSize]);

  const activeModel = useMemo(() => {
    return PORTFOLIO_MODELS.find(m => m.id === selectedModelId) || PORTFOLIO_MODELS[4];
  }, [selectedModelId]);

  // Pricing info
  const activePricing = useMemo(() => {
    const sizeMap = PRICING_MATRIX[selectedSize] || PRICING_MATRIX['14-inch'];
    const prices = sizeMap[selectedModelId] || sizeMap['model-5'];
    const directProfit = prices.mrp - prices.manufacturingCost;
    const profitMargin = Math.round((directProfit / prices.mrp) * 100);
    return {
      ...prices,
      profit: directProfit,
      marginPercent: profitMargin
    };
  }, [selectedSize, selectedModelId]);

  // Dynamic BOM Components list mapped directly to the active model selected
  const bomComponents = useMemo(() => {
    // Base Model 1 components
    const baseComponents = [
      {
        icon: '🌪',
        name: 'BLDC Motor',
        spec: '48V DC Brushless Fan Motor',
        desc: 'Advanced brushless sensory-less rotor designed for quiet continuous duty cycles and shockproof low voltage operations.',
        bg: 'from-blue-600/10 to-indigo-600/10 border-blue-500/20 text-blue-300'
      },
      {
        icon: '⚙',
        name: 'Controller PCB',
        spec: 'SmartCore FOC Regulating Board',
        desc: 'Central microprocessor managing wave inverter signals, start-up torque, and multi-rail voltage protective gates.',
        bg: 'from-purple-600/10 to-fuchsia-600/10 border-purple-500/20 text-purple-300'
      },
      {
        icon: '💧',
        name: 'Water Pump',
        spec: '48V Submersible Brushless Pump',
        desc: 'Silent water delivery motor driving moisture saturated columns across physical honeycomb panels.',
        bg: 'from-cyan-600/10 to-sky-600/10 border-sky-500/20 text-sky-300'
      },
      {
        icon: '🔄',
        name: 'Swing Motor',
        spec: 'Louver Swing Stepper Drive',
        desc: 'Micro stepper mechanism controlling multi-directional motorized vent oscillation for wide room distribution.',
        bg: 'from-teal-600/10 to-emerald-600/10 border-teal-500/20 text-teal-300'
      },
      {
        icon: '🔌',
        name: 'Wiring Harness',
        spec: 'Heavy Duty 18AWG Coupled Harness',
        desc: 'Highly insulated flame-retardant silicone cabling pre-routed and coupled with quick connector sockets.',
        bg: 'from-slate-600/10 to-slate-700/10 border-slate-500/20 text-slate-300'
      },
      {
        icon: '🔗',
        name: 'Connectors',
        spec: 'Automotive Quick-Latch Terminal clips',
        desc: 'Secure gold-plated anti-resonant locking male/female connector plugs ensuring uninterrupted current flow.',
        bg: 'from-zinc-650/10 to-stone-650/10 border-zinc-550/20 text-zinc-350'
      }
    ];

    if (selectedModelId === 'model-1') {
      return baseComponents;
    }

    if (selectedModelId === 'model-2') {
      return [
        ...baseComponents,
        {
          icon: '🔋',
          name: 'Battery Pack',
          spec: 'LFP Lithium Buffer Cell Pack',
          desc: 'High density Lithium Iron Phosphate (LiFePO4) 48V pack supporting stable 4000+ depth-of-discharge cycles.',
          bg: 'from-emerald-650/10 to-green-650/10 border-emerald-555/20 text-emerald-400'
        },
        {
          icon: '⚡',
          name: 'AC Charger',
          spec: 'High-current AC power adapter, 48V',
          desc: 'Converts standard high voltage utility currents down to uniform low voltage active system output power.',
          bg: 'from-amber-650/10 to-orange-655/10 border-amber-550/20 text-amber-400'
        },
        {
          icon: '🛡',
          name: 'BMS',
          spec: 'Embedded 16S Battery Manager',
          desc: 'Active cellular balancers protecting battery columns against over-voltage, temperature spikes, or deep drains.',
          bg: 'from-rose-650/10 to-red-650/10 border-rose-550/20 text-rose-400'
        }
      ];
    }

    if (selectedModelId === 'model-3') {
      return [
        ...baseComponents,
        {
          icon: '🔋',
          name: 'Battery Pack',
          spec: 'LFP Lithium Buffer Cell Pack',
          desc: 'High density Lithium Iron Phosphate (LiFePO4) 48V pack supporting stable 4000+ depth-of-discharge cycles.',
          bg: 'from-emerald-650/10 to-green-650/10 border-emerald-555/20 text-emerald-400'
        },
        {
          icon: '⚡',
          name: 'AC Charger',
          spec: 'High-current AC power adapter, 48V',
          desc: 'Converts standard high voltage utility currents down to uniform low voltage active system output power.',
          bg: 'from-amber-650/10 to-orange-655/10 border-amber-555/20 text-amber-400'
        },
        {
          icon: '🛡',
          name: 'BMS',
          spec: 'Embedded 16S Battery Manager',
          desc: 'Active cellular balancers protecting battery columns against over-voltage, temperature spikes, or deep drains.',
          bg: 'from-rose-650/10 to-red-650/10 border-rose-555/20 text-rose-400'
        },
        {
          icon: '🔄',
          name: 'Battery Dock',
          spec: 'Heavy-Duty Sliding Power Dock',
          desc: 'Dual slide-rail power delivery bay configured with self-mating copper contact blades for hotswap capability.',
          bg: 'from-cyan-650/10 to-blue-650/10 border-cyan-555/20 text-cyan-400'
        },
        {
          icon: '🔒',
          name: 'Locking Mechanism',
          spec: 'Steel Spring-Loaded Compression latch',
          desc: 'Heavy physical toggle lock prevent active decoupling or micro-vibrations across battery bays.',
          bg: 'from-orange-655/10 to-yellow-655/10 border-orange-555/20 text-orange-400'
        }
      ];
    }

    if (selectedModelId === 'model-4') {
      return [
        ...baseComponents,
        {
          icon: '☀',
          name: 'Solar Panel',
          spec: '100W PV monocrystalline solar panel',
          desc: 'High-yield Monocrystalline photovoltaic cells capturing ambient sunshine under cloud cover with ease.',
          bg: 'from-amber-600/10 to-yellow-600/10 border-amber-500/20 text-amber-300'
        },
        {
          icon: '⚡',
          name: 'MPPT Controller',
          spec: '48V 10A standard MPPT charging controller',
          desc: 'Tracking converter that captures fluctuating outdoor light ranges and stabilizes them into clean current.',
          bg: 'from-sky-600/10 to-indigo-600/10 border-sky-500/20 text-sky-400'
        },
        {
          icon: '🔗',
          name: 'MC4 Connectors',
          spec: 'IP67 Waterproof Solar Connectors',
          desc: 'Standard outdoor rubber-sealed solar PV terminal plugs configured for weathering the harshest elements.',
          bg: 'from-slate-650/10 to-zinc-650/10 border-slate-555/20 text-slate-300'
        }
      ];
    }

    // Default: model-5
    return [
      ...baseComponents,
      {
        icon: '☀',
        name: 'Solar Panel',
        spec: '120W PV premium monophotovoltaic solar panel',
        desc: 'Flagship tier high-efficiency monocrystalline cells designed for ultimate durability and extreme energy harvesting.',
        bg: 'from-amber-600/10 to-yellow-600/10 border-amber-500/20 text-amber-300'
      },
      {
        icon: '🔋',
        name: 'Battery Pack',
        spec: 'Premium 48V 15Ah LiFePO4 chemical battery',
        desc: 'Premium extra-capacity Lithium battery buffer ensuring all-night thermal comfort and 15Ah of reserves.',
        bg: 'from-emerald-650/10 to-green-650/10 border-emerald-555/20 text-emerald-400'
      },
      {
        icon: '⚡',
        name: 'MPPT',
        spec: '48V Premium Smart MPPT regulator',
        desc: 'Advanced central maximum power tracker with telemetry feedback loops maximizing solar capture in cloudy limits.',
        bg: 'from-sky-600/10 to-indigo-600/10 border-sky-500/20 text-sky-400'
      },
      {
        icon: '⚡',
        name: 'DC-DC Converter',
        spec: 'Buck-Boost High-Efficiency DC-DC Converter',
        desc: 'Regulates dynamic system output voltage line perfectly at 48V DC, protecting motors from drop voltages.',
        bg: 'from-indigo-650/10 to-violet-650/10 border-indigo-555/20 text-indigo-400'
      },
      {
        icon: '🛡',
        name: 'BMS',
        spec: 'Smart Battery Management System',
        desc: 'Active cellular balancers protecting battery columns against over-voltage, temperature spikes, or data leaks.',
        bg: 'from-rose-655/10 to-red-655/10 border-rose-555/25 text-rose-400'
      }
    ];
  }, [selectedModelId]);

  // ==========================================
  // INLINE SVG POLISHED GRAPHICS
  // ==========================================
  const renderCoolerGraphic = (scale: number, isActive: boolean = false, fanPulse: boolean = false) => {
    const sizeMultiplier = scale === 12 ? 0.85 : scale === 16 ? 1.15 : 1.0;
    return (
      <svg
        viewBox="0 0 200 240"
        className={`transition-all duration-500 ease-in-out ${isActive ? 'drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]' : ''}`}
        style={{ transform: `scale(${sizeMultiplier})`, transformOrigin: 'bottom center', width: '130px', height: '160px' }}
      >
        {/* Shroud / Chassis */}
        <rect x="35" y="25" width="130" height="200" rx="16" fill="#0f172a" stroke={isActive ? '#6366f1' : '#334155'} strokeWidth="3" />
        <rect x="40" y="30" width="120" height="190" rx="12" fill="#1e293b" />

        {/* Dashboard */}
        <rect x="44" y="36" width="112" height="28" rx="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx="56" cy="50" r="3" fill="#10b981" />
        <circle cx="66" cy="50" r="3" fill="#38bdf8" />
        <rect x="80" y="44" width="40" height="12" rx="3" fill="#000" stroke="#1e293b" />
        <text x="100" y="53" textAnchor="middle" fontSize="8" fill="#10b981" fontFamily="monospace" fontWeight="bold">
          48V OK
        </text>

        {/* Impeller Grid */}
        <circle cx="100" cy="115" r="42" fill="#020617" stroke="#334155" strokeWidth="2" />
        <line x1="62" y1="115" x2="138" y2="115" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="100" y1="77" x2="100" y2="153" stroke="#1e293b" strokeWidth="1.5" />

        {/* Spinning blades */}
        <g style={{ transform: fanPulse ? 'rotate(180deg)' : 'none', transformOrigin: '100px 115px', transition: 'transform 0.4s ease' }}>
          <path d="M100,115 C100,85 112,85 112,115 Z" fill="#475569" opacity="0.85" />
          <path d="M100,115 C100,145 88,145 88,115 Z" fill="#475569" opacity="0.85" />
          <path d="M100,115 C130,115 130,127 100,115 Z" fill="#334155" opacity="0.85" />
          <path d="M100,115 C70,115 70,103 100,115 Z" fill="#334155" opacity="0.85" />
          <circle cx="100" cy="115" r="8" fill="#334155" stroke="#475569" strokeWidth="1.5" />
        </g>

        {/* Humid Honeycomb Vents */}
        <g stroke="#1e293b" strokeWidth="1" opacity="0.7">
          <line x1="50" y1="175" x2="150" y2="175" />
          <line x1="50" y1="181" x2="150" y2="181" />
          <line x1="50" y1="187" x2="150" y2="187" />
          <line x1="50" y1="193" x2="150" y2="193" />
        </g>

        {/* Water reservoir indicator */}
        <rect x="94" y="202" width="12" height="14" rx="2" fill="#0f172a" />
        <rect x="97" y="204" width="6" height="10" rx="1" fill="#38bdf8" opacity="0.8" />

        {/* Casters */}
        <circle cx="52" cy="230" r="6" fill="#475569" />
        <circle cx="148" cy="230" r="6" fill="#475569" />
      </svg>
    );
  };

  const renderSolarPanelGraphic = () => {
    return (
      <svg viewBox="0 0 160 120" className="w-[100px] h-[75px] drop-shadow-[0_4px_10px_rgba(56,189,248,0.2)]">
        <path d="M40,110 L80,70 L120,110" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
        <line x1="80" y1="70" x2="80" y2="105" stroke="#334155" strokeWidth="5" />
        <polygon points="15,80 145,80 120,20 40,20" fill="#0369a1" stroke="#0ea5e9" strokeWidth="3.5" />
        <polygon points="16,78 144,78 119,22 41,22" fill="#075985" />
        <line x1="52" y1="20" x2="35" y2="80" stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1="80" y1="20" x2="80" y2="80" stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1="108" y1="20" x2="125" y2="80" stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1="33" y1="35" x2="127" y2="35" stroke="#0ea5e9" strokeWidth="1" />
        <line x1="26" y1="50" x2="134" y2="50" stroke="#0ea5e9" strokeWidth="1" />
        <line x1="19" y1="65" x2="141" y2="65" stroke="#0ea5e9" strokeWidth="1" />
      </svg>
    );
  };

  const renderBatteryGraphic = (chargePercent: number = 85, isCharging: boolean = false) => {
    return (
      <svg viewBox="0 0 160 120" className="w-[100px] h-[75px] drop-shadow-[0_4px_10px_rgba(16,185,129,0.2)]">
        <rect x="25" y="30" width="110" height="60" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
        <rect x="135" y="48" width="10" height="24" rx="3" fill="#10b981" />
        <g>
          <rect x="33" y="38" width="20" height="44" rx="3" fill={chargePercent >= 20 ? '#10b981' : '#047857'} />
          <rect x="58" y="38" width="20" height="44" rx="3" fill={chargePercent >= 50 ? '#10b981' : '#047857'} opacity={chargePercent >= 50 ? 1 : 0.25} />
          <rect x="83" y="38" width="20" height="44" rx="3" fill={chargePercent >= 80 ? '#10b981' : '#047857'} opacity={chargePercent >= 80 ? 1 : 0.25} />
          <rect x="108" y="38" width="20" height="44" rx="3" fill={chargePercent >= 95 ? '#10b981' : '#047857'} opacity={chargePercent >= 95 ? 1 : 0.25} />
        </g>
        {isCharging && (
          <path d="M85,42 L72,62 L83,62 L79,78 L92,58 L81,58 Z" fill="#fbbf24" stroke="#000" strokeWidth="1" />
        )}
      </svg>
    );
  };

  // ==========================================
  // HARDWARE BOM HELPER STRUCTURES
  // ==========================================
  const matchedBomSpecs = useMemo(() => {
    switch (selectedModelId) {
      case 'model-1':
        return { total: 8, electrical: 4, mechanical: 4, solar: 0, battery: 0, controllers: 1, label: 'AC / DC Solar-Ready setup' };
      case 'model-2':
        return { total: 10, electrical: 6, mechanical: 4, solar: 0, battery: 1, controllers: 1, label: 'AC Grid & Li-Ion buffer setup' };
      case 'model-3':
        return { total: 11, electrical: 7, mechanical: 4, solar: 0, battery: 2, controllers: 1, label: 'Swappable heavy duty industrial' };
      case 'model-4':
        return { total: 10, electrical: 5, mechanical: 4, solar: 1, battery: 0, controllers: 1, label: 'Photovoltaic green direct-fans' };
      case 'model-5':
      default:
        return { total: 12, electrical: 8, mechanical: 4, solar: 1, battery: 1, controllers: 1, label: 'Flagship offgrid autonomous premium' };
    }
  }, [selectedModelId]);

  const contextualCostBreakdown = useMemo(() => {
    switch (selectedModelId) {
      case 'model-1':
        return [
          { name: 'Motor & Pump System', value: 45, color: '#6366f1' },
          { name: 'Chassis & Vents', value: 35, color: '#8b5cf6' },
          { name: 'Electrical Controls', value: 20, color: '#38bdf8' }
        ];
      case 'model-2':
        return [
          { name: 'Motor & Pump', value: 35, color: '#6366f1' },
          { name: 'Lithium Battery Casing', value: 25, color: '#10b981' },
          { name: 'Control PCB System', value: 20, color: '#38bdf8' },
          { name: 'Chassis Framework', value: 20, color: '#8b5cf6' }
        ];
      case 'model-3':
        return [
          { name: 'Motor & Pump', value: 30, color: '#6366f1' },
          { name: 'Dual Hotswap Packs', value: 38, color: '#10b981' },
          { name: 'Smart Core PCB', value: 18, color: '#38bdf8' },
          { name: 'Commercial Chassis', value: 14, color: '#8b5cf6' }
        ];
      case 'model-4':
        return [
          { name: 'Motor & Pump', value: 35, color: '#6366f1' },
          { name: 'Mono Solar Array', value: 30, color: '#f59e0b' },
          { name: 'Solar Controller PCB', value: 15, color: '#38bdf8' },
          { name: 'Chassis framework', value: 20, color: '#8b5cf6' }
        ];
      case 'model-5':
      default:
        return [
          { name: 'Motor & Pump', value: 25, color: '#6366f1' },
          { name: 'Premium LFP Buffer', value: 30, color: '#10b981' },
          { name: 'Mono Solar Matrix', value: 20, color: '#f59e0b' },
          { name: 'Core PCB MCU', value: 15, color: '#38bdf8' },
          { name: 'Chassis build', value: 10, color: '#8b5cf6' }
        ];
    }
  }, [selectedModelId]);

  const contextualBomParts = useMemo(() => {
    const p1 = selectedSize === '12-inch' ? 'Compact 40W' : selectedSize === '14-inch' ? 'Medium 70W' : 'High-Efficiency 113W';
    
    return [
      {
        name: '☀️ Solar Panel',
        included: activeModel.hasSolar,
        spec: selectedModelId === 'model-4' ? '100W PV monocrystalline' : selectedModelId === 'model-5' ? '120W PV premium monophotovoltaic' : 'N/A (Bypass)',
        qty: activeModel.hasSolar ? 1 : 0,
        desc: activeModel.hasSolar 
          ? `High-voltage monocrystalline photovoltaic panel customized for the ${p1} air cooler fan sweep.`
          : 'Optional accessory backup. This package utilizes standard AC direct input or battery currents instead.'
      },
      {
        name: '⚡ MPPT',
        included: activeModel.hasMppt,
        spec: selectedModelId === 'model-4' ? '48V 10A standard MPPT charging controller' : selectedModelId === 'model-5' ? '48V Premium Smart MPPT, feedback efficiency 99.2%' : 'N/A (Bypass)',
        qty: activeModel.hasMppt ? 1 : 0,
        desc: activeModel.hasMppt
          ? 'Synchronizes peak solar rays and translates sun fluctuations into stable operating currents.'
          : 'Not included. Operating bus is regulated by direct grid input adapters or passive battery buffers.'
      },
      {
        name: '🔋 Battery Pack',
        included: activeModel.hasBattery,
        spec: selectedModelId === 'model-2' ? 'Integrated LFP buffer battery, 11.1V 3Ah' : selectedModelId === 'model-3' ? 'Removable Dual 14.8V 6Ah Slide Pack cartridges' : selectedModelId === 'model-5' ? 'Premium 48V 15Ah LiFePO4 chemical battery' : 'N/A (Bypass)',
        qty: selectedModelId === 'model-3' ? 2 : (activeModel.hasBattery ? 1 : 0),
        desc: activeModel.hasBattery
          ? `High energy-density Lithium buffers designed for persistent quiet nightly cycles without grid availability.`
          : 'Zero-battery, zero maintenance cost design. Operates directly on daylight sunshine or mains power.'
      },
      {
        name: '⚡ DC-DC Converter / AC Charger',
        included: true,
        spec: selectedModelId === 'model-4' ? 'N/A (Green Direct Link Only)' : selectedModelId === 'model-3' ? 'External dual-bay fast-charging deck, 5A 48V' : 'Mains 48V 3A SMPS integrated charging module',
        qty: selectedModelId === 'model-4' ? 0 : 1,
        desc: selectedModelId === 'model-4'
          ? 'No AC charger included. This package operates strictly on 100% green direct photovoltaic currents.'
          : 'Bridges standard high-voltage AC mains power down to safe, shock-free 48V DC bus currents.'
      },
      {
        name: '🧠 Controller PCB',
        included: true,
        spec: selectedModelId === 'model-1' ? 'Zazen Mainboard v1.2, direct DC bus controller' :
              selectedModelId === 'model-2' ? 'SmartCore v2.1 with automatic grid failover relays' :
              selectedModelId === 'model-3' ? 'SmartCore Commercial v2.2 with hot-swap slide logics' :
              selectedModelId === 'model-4' ? 'SmartCore Solar Lite v1.9, direct-air startup' :
              'SmartCore Sovereign Intel Core v3.0, dynamic energy bus regulator',
        qty: 1,
        desc: `Central control processing board managing energy transfers to the ${p1} turbine and pump.`
      },
      {
        name: '🌪 BLDC Motor',
        included: true,
        spec: selectedModelId === 'model-3' ? '48V Premium heavy-duty industrial brushless motor' :
              selectedModelId === 'model-5' ? '48V High Efficiency brushless FOC active motor' :
              '48V Standard brushless quiet fan motor',
        qty: 1,
        desc: `High velocity quiet turbine motor matched perfectly with the ${p1} impeller sweep.`
      },
      {
        name: '💧 Water Pump',
        included: true,
        spec: '48V DC submersible brushless water pump, 5W',
        qty: 1,
        desc: 'Submersible low-decibel water feed driving honeycomb wet pad vaporizations.'
      },
      {
        name: '🔌 Connectors & Wiring',
        included: true,
        spec: selectedModelId === 'model-3' ? 'Quick-slide heavy contacts cartridge assembly' :
              activeModel.hasSolar ? 'IP67 Weatherproof outdoor MC4 cabling + adapters' :
              'Circular coaxial DC power circular plugs + harness',
        qty: 1,
        desc: 'Insulated secure terminal connection wires for safe energy routing.'
      }
    ];
  }, [selectedSize, selectedModelId, activeModel]);

  // Positioning benchmarking charts data
  const positioningRadarData = [
    { subject: 'Tank Vol. (Liters)', Zazen: 98, Competitor_A: 40, Competitor_B: 70 },
    { subject: 'Power Saving', Zazen: 95, Competitor_A: 30, Competitor_B: 20 },
    { subject: 'Low Temp Cooling', Zazen: 88, Competitor_A: 45, Competitor_B: 60 },
    { subject: 'DC Solar Coupling', Zazen: 100, Competitor_A: 10, Competitor_B: 5 },
    { subject: 'Weight & Portability', Zazen: 90, Competitor_A: 60, Competitor_B: 50 },
  ];

  const marketComparativesData = [
    { name: '40W-113W Power (Lower is Better)', Zazen: 70, Competitor_A: 190, Competitor_B: 240 },
    { name: 'Water Tank Volume (Higher is Better)', Zazen: 48, Competitor_A: 18, Competitor_B: 30 },
    { name: 'Run Temperature Autonomy (%)', Zazen: 95, Competitor_A: 15, Competitor_B: 40 },
  ];

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 p-4 sm:p-6 md:p-8 space-y-6 font-mono selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER COCKPIT HUD */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-center mt-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                Interactive Engineering Matrix
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400">HQ Planning Room</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              📦 ZAZEN PORTFOLIO EXPLORER
            </h1>
            <p className="text-xs sm:text-sm text-slate-450 max-w-xl font-normal leading-relaxed">
              Dynamically analyze pricing sheets, dynamic specs, and physical hardware breakdowns across 15 customizable off-grid configuration nodes.
            </p>
          </div>
        </div>

        {/* Dynamic configuration counter */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-505/10 rounded-xl border border-indigo-500/20">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Active Portfolio Nodes</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-450 font-mono">15 Configs</span>
            </div>
            <span className="text-[10px] text-slate-450 leading-none">3 Frame Sizes x 5 Models</span>
          </div>
        </div>
      </header>

      {/* PERSISTENT TOP SELECTION CONTROLLER GRID (Requested Variant Selection) */}
      <div className="bg-[#0b101f] border border-white/5 p-4 sm:p-5 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />
        
        {/* SIZE SELECTOR - 12" / 14" / 16" */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-2">
          <div>
            <label className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block font-bold">1. Select Frame Size</label>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Configure physical dimensions and general airflow rate limits.</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1.5">
            {SIZE_SPECIFICATIONS.map((sz) => {
              const isSelected = selectedSize === sz.id;
              const shortLabel = sz.id === '12-inch' ? '12"' : sz.id === '14-inch' ? '14"' : '16"';
              return (
                <button
                  key={sz.id}
                  onClick={() => setSelectedSize(sz.id)}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/55 to-slate-900 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-black font-mono">{shortLabel} Size</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-70 font-bold">{sz.powerDraw}W Max</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODEL SELECTOR - Model 1 to Model 5 */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5">
          <div>
            <label className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block font-bold">2. Select Power Control System</label>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 font-normal">Choose photovoltaic coupling, grid-failover relays, or battery cartridges.</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1.5">
            {PORTFOLIO_MODELS.map((m) => {
              const isSelected = selectedModelId === m.id;
              const words = m.name.split(':');
              const modelNumber = `Model ${m.num}`;
              const modelShortName = words[1]?.trim() || m.name;
              
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModelId(m.id)}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition h-full ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-850 hover:bg-slate-900 hover:text-white text-slate-400'
                  }`}
                >
                  <span className="text-[11.5px] font-black leading-tight truncate w-full block">{modelShortName}</span>
                  <span className="text-[8.5px] tracking-widest uppercase font-extrabold opacity-60 mt-1 block">{modelNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB SWAP SWITCHER HEADER matching layout requested */}
      <nav className="flex flex-wrap gap-2 border-b border-white/5 pb-1 relative z-10">
        {[
          { id: 'overview', label: 'Product Overview', icon: Layers },
          { id: 'features', label: 'Package Features', icon: Table },
          { id: 'pricing', label: 'Pricing', icon: IndianRupee },
          { id: 'market', label: 'Market Comparison', icon: LineChart },
          { id: 'bom', label: '🔧 Hardware BOM', icon: Cpu }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4.5 py-3 rounded-t-2xl text-[12px] font-extrabold uppercase tracking-widest transition-all gap-2 flex items-center cursor-pointer border-t border-x -mb-1 duration-200 ${
                isSelected
                  ? 'bg-[#080d1a] border-white/5 border-b-[#080d1a] text-amber-400 font-bold shadow-md'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* PORTLET MAIN WORKSPACE */}
      <main className="bg-[#080d1a] border border-white/5 rounded-2xl p-5 sm:p-7 shadow-xl relative min-h-[500px]">
        {/* Glow ambient decoration backgrounds */}
        <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* ========================================================= */}
        {/* TAB 1: PRODUCT OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in relative z-10 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <span className="text-[9.5px] text-indigo-400 font-extrabold uppercase tracking-widest block">Unified Configuration Overview</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  🌐 Zazen Air-Cooled Core Showcase (Active)
                </h2>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-[11.5px] text-indigo-400">
                ACTIVE COCKPIT: <strong className="text-white uppercase font-black">{activeSizeSpec.name} & [Model {activeModel.num}]</strong>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
              Below is the dynamic simulation. Modulate solar irradiation or cooling speed steps. Watch the active solar generation vectors, LFP batteries, and DC brushless motors update in real time based on your configuration parameters.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-stretch">
              
              {/* Left Config Controls Card */}
              <div className="lg:col-span-5 bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] text-indigo-400 tracking-wider font-extrabold block uppercase">Current SPECIFICATION CARD:</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-xl">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest block">Airflow Capacity</span>
                      <span className="text-2xl font-black text-indigo-400 block font-mono">{activeSizeSpec.airflow}</span>
                      <span className="text-[9px] text-slate-400 block italic">m³/hr replacement rate</span>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-xl">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest block">Water Reservoir</span>
                      <span className="text-2xl font-black text-sky-400 block font-mono">{activeSizeSpec.waterTank} Liters</span>
                      <span className="text-[9px] text-slate-400 block italic">Up to 14.5 hr continuous</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-[8.5px] text-slate-500 uppercase font-bold tracking-widest block">System Description & Benefits</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {activeModel.benefits} Perfect for a <strong className="text-indigo-300">{activeSizeSpec.application}</strong>. Low voltage DC safety allows shock-free direct solar coupling.
                    </p>
                  </div>
                </div>

                {/* Simulation controls */}
                <div className="border-t border-slate-850/80 pt-4 space-y-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Active Simulation Modulators</span>
                  
                  {/* Sun Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-amber-400 flex items-center gap-1">☀️ Solar Sunshine level</span>
                      <span className="text-white">{solarSunIntensity}% Strength</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={solarSunIntensity}
                      onChange={(e) => setSolarSunIntensity(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Fan Speed Buttons */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-sky-400">💨 Cooler Target Speed</span>
                      <span className="text-white">Dials Level {coolerSpeedStep} / 3</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl">
                      {['Eco Speed', 'Standard', 'Max Turbo'].map((lbl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCoolerSpeedStep(idx + 1)}
                          className={`p-1.5 rounded-lg text-[9.5px] font-bold uppercase transition text-center cursor-pointer ${
                            coolerSpeedStep === (idx + 1)
                              ? 'bg-sky-505 bg-sky-550 text-slate-950 bg-sky-400 font-extrabold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lbl.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Simulation Flow Schematic */}
              <div className="lg:col-span-7 bg-slate-950/30 border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xs text-indigo-400 font-black uppercase tracking-widest">Active Power Flow Diagram</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dynamic thermodynamic circuit animation based on active selections</p>
                  </div>
                  <Gauge className="w-5 h-5 text-indigo-400" />
                </div>

                {/* Schematic space */}
                <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
                  <div className="aspect-[16/9] min-w-[460px] sm:min-w-0 bg-slate-950 rounded-2xl relative border border-slate-900 flex flex-col justify-between p-4 overflow-hidden">
                    {/* Grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none" />

                    {/* Top Row nodes */}
                    <div className="flex justify-between items-start relative z-10">
                      {/* Solar Panel Box */}
                      <div className={`p-2.5 rounded-xl border text-center transition w-[130px] ${
                        activeModel.hasSolar
                          ? 'bg-amber-950/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] opacity-100'
                          : 'bg-slate-900/60 border-slate-850 text-slate-600 opacity-30 line-through'
                      }`}>
                        <Sun className="w-5 h-5 mx-auto mb-1 animate-[pulse_2s_infinite]" />
                        <span className="text-[9px] font-extrabold uppercase block">Solar PV Generation</span>
                        <span className="text-[8.5px] block opacity-85 mt-0.5">
                          {activeModel.hasSolar ? `${Math.round(solarSunIntensity * 1.2)}W Output` : 'Optional PV'}
                        </span>
                      </div>

                      {/* Central Bus Switch */}
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center w-[130px] relative">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-widest">REGULATOR BUS</span>
                        <span className="text-[10.5px] text-indigo-400 font-black block mt-0.5">48V DC Standard</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Current: Stable</span>
                      </div>

                      {/* Battery Storage Box */}
                      <div className={`p-2.5 rounded-xl border text-center transition w-[130px] ${
                        activeModel.hasBattery
                          ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] opacity-100'
                          : 'bg-slate-900/60 border-slate-850 text-slate-600 opacity-30 line-through'
                      }`}>
                        <Battery className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-[9px] font-extrabold uppercase block">LFP Storage Buffer</span>
                        <span className="text-[8.5px] block opacity-85 mt-0.5">
                          {activeModel.hasBattery ? 'Buffered 48.2V Ready' : 'Optional LFP'}
                        </span>
                      </div>
                    </div>

                    {/* Flow pipeline diagram lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 450 250">
                        {/* Solar grid flow */}
                        <path
                          d="M100,55 L220,105"
                          fill="none"
                          stroke={activeModel.hasSolar && solarSunIntensity > 15 ? '#fbbf24' : '#1e293b'}
                          strokeWidth="2.5"
                          strokeDasharray="6, 6"
                          className={activeModel.hasSolar && solarSunIntensity > 15 ? 'animate-[dash_1s_linear_infinite]' : ''}
                        />

                        {/* Battery grid flow */}
                        <path
                          d="M350,55 L230,105"
                          fill="none"
                          stroke={activeModel.hasBattery ? '#10b981' : '#1e293b'}
                          strokeWidth="2.5"
                          strokeDasharray="6, 6"
                          className={activeModel.hasBattery ? 'animate-[dash_1s_linear_infinite]' : ''}
                        />

                        {/* Bus to Fan line */}
                        <path
                          d="M225,140 L225,185"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="3.5"
                          strokeDasharray="8, 8"
                          className="animate-[dash_1.5s_linear_infinite]"
                        />
                        
                        <style dangerouslySetInnerHTML={{ __html: `
                          @keyframes dash {
                            to {
                              stroke-dashoffset: -20;
                            }
                          }
                        ` }} />
                      </svg>
                    </div>

                    {/* Bottom Fan Shroud Component */}
                    <div className="flex justify-center relative z-10">
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl w-[200px] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          {renderCoolerGraphic(12, true, coolerSpeedStep > 1)}
                        </div>
                        <div className="text-left leading-tight font-mono">
                          <span className="text-[9.5px] font-black text-white block uppercase">Chassis Fan Load</span>
                          <span className="text-[8.5px] text-slate-400 block mt-0.5">
                            Draw: {Math.round(activeSizeSpec.powerDraw * (coolerSpeedStep * 0.33))}W Peak
                          </span>
                          <span className="text-[8.5px] text-emerald-400 font-extrabold block mt-0.5">Turbine Engaged</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">Dynamic Cost Estimations</span>
                    <span className="text-[12.5px] font-extrabold text-white mt-1 block">
                      {activeModel.hasSolar ? '₹0.00 / hour (100% Free Solar Direct-Drive)' : '₹0.48 / hour (Mains Auxiliary Backup)'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-black text-[9px] uppercase tracking-wider">
                    Green Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PACKAGE FEATURES */}
        {/* ========================================================= */}
        {activeTab === 'features' && (
          <div className="space-y-6 animate-fade-in relative z-10 w-full">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9.5px] text-indigo-400 font-extrabold uppercase tracking-widest block font-bold">Side-By-Side Feature Verification</span>
              <h2 className="text-xl font-bold text-white mt-1">
                ⚙️ Specifications Matrix & Package Benefits
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              Compare architectural parameters and system features of all models side by side. The row matching your selected configuration is highlighted.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-stretch">
              
              {/* Feature comparison table */}
              <div className="md:col-span-8 bg-slate-950/40 border border-white/5 p-4 rounded-2xl overflow-x-auto">
                {isMobile ? (
                  <div className="space-y-4">
                    {PORTFOLIO_MODELS.map((item) => {
                      const isSelected = item.id === selectedModelId;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedModelId(item.id)}
                          className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3.5 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/20 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                              : 'bg-slate-950/80 border-slate-900/40 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">{item.badge}</span>
                              <h4 className="text-sm font-extrabold text-white mt-0.5">{item.name}</h4>
                            </div>
                            {isSelected && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500 text-slate-950 uppercase tracking-wider">
                                Selected
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 font-sans leading-relaxed">
                            {item.subtitle}
                          </p>

                          <div className="grid grid-cols-3 gap-2.5 pt-1.5 border-t border-white/5 text-[10px] font-mono">
                            <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                              <span className="text-slate-500 uppercase text-[8px] block">Solar Ready</span>
                              <span className={`font-bold mt-1 ${item.hasSolar ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.hasSolar ? 'Supported' : 'No'}
                              </span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                              <span className="text-slate-500 uppercase text-[8px] block">LFP Battery</span>
                              <span className={`font-bold mt-1 ${item.hasBattery ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.hasBattery ? 'Supported' : 'No'}
                              </span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                              <span className="text-slate-500 uppercase text-[8px] block">AC Charge</span>
                              <span className={`font-bold mt-1 ${item.hasAcCharging ? 'text-emerald-400' : 'text-rose-450'}`}>
                                {item.hasAcCharging ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="min-w-[500px] space-y-2 font-mono">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-slate-500 py-2 border-b border-white/5 px-2 bg-slate-900/30">
                      <div className="col-span-5 text-left text-indigo-400">System Integration Model</div>
                      <div className="col-span-2 text-center">Solar Ready</div>
                      <div className="col-span-2 text-center">LFP Battery</div>
                      <div className="col-span-3 text-center">AC Auxiliary charging</div>
                    </div>

                    {PORTFOLIO_MODELS.map((item) => {
                      const isSelected = item.id === selectedModelId;
                      return (
                        <div
                          key={item.id}
                          className={`grid grid-cols-12 gap-2 items-center text-center p-3 rounded-xl border transition ${
                            isSelected
                              ? 'bg-indigo-950/20 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                              : 'bg-slate-950/80 border-slate-900/40 hover:border-slate-800'
                          }`}
                        >
                          <div className="col-span-5 text-left flex flex-col justify-center">
                            <span className="font-extrabold text-[12px] text-white block">
                              {item.name} {isSelected && <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500 text-slate-950 ml-1.5 uppercase tracking-wide">Selected</span>}
                            </span>
                            <span className="text-[9px] text-slate-455 truncate block font-light mt-0.5">{item.badge}</span>
                          </div>

                          {/* Solar Direct Support */}
                          <div className="col-span-2 flex justify-center">
                            <span className={`p-1 rounded-md flex items-center justify-center ${item.hasSolar ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'} w-6 h-6 text-xs font-black`}>
                              {item.hasSolar ? '✓' : '✕'}
                            </span>
                          </div>

                          {/* Battery buffer */}
                          <div className="col-span-2 flex justify-center">
                            <span className={`p-1 rounded-md flex items-center justify-center ${item.hasBattery ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'} w-6 h-6 text-xs font-black`}>
                              {item.hasBattery ? '✓' : '✕'}
                            </span>
                          </div>

                          {/* AC charging */}
                          <div className="col-span-3 flex justify-center text-[10px] uppercase font-bold text-slate-300">
                            {item.hasAcCharging ? (
                              <span className="text-emerald-450 border border-emerald-500/20 bg-emerald-500/10 rounded px-2 py-0.5 text-[8px]">Active grid charging</span>
                            ) : (
                              <span className="text-slate-500 border border-slate-850 bg-slate-900 rounded px-2 py-0.5 text-[8px]">Daylight Only PV</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Model Focus card */}
              <div className="md:col-span-4 bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">Active Package Specifications</span>
                  <p className="text-xs text-white uppercase font-black tracking-wider leading-relaxed">{activeModel.name}</p>
                  <p className="text-[11px] text-slate-400 font-normal leading-relaxed">{activeModel.subtitle}</p>
                  
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[8px] text-slate-500 uppercase font-black block tracking-widest">Key Feature Tags</span>
                    {activeModel.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5 text-[10px] text-slate-300 leading-normal">
                        <span className="text-indigo-400 font-extrabold">&#8250;</span>
                        <span className="font-normal">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1 text-left">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-widest">Compatible Environments</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {activeModel.targetUsers.map((user, uIdx) => (
                      <span key={uIdx} className="px-1.5 py-0.5 bg-slate-950 rounded text-[9px] text-slate-300 border border-slate-850">
                        {user}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PRICING */}
        {/* ========================================================= */}
        {activeTab === 'pricing' && (
          <div className="space-y-6 animate-fade-in relative z-10 w-full">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9.5px] text-[#38bdf8] font-extrabold uppercase tracking-widest block font-bold">Dynamic Commercial Sales COGS</span>
              <h2 className="text-xl font-bold text-white mt-1">
                📊 Commercial Distributor & Profitability Analysis
              </h2>
            </div>

            <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
              Dynamically verify dealer transfers, dealership structures, unit gross margins, and manufacturing material cost COGS calibrated based on your active frame dimensions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-stretch">
              
              {/* Cost matrix cards */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-5 gap-3">
                {PORTFOLIO_MODELS.map((item) => {
                  const specPrices = PRICING_MATRIX[selectedSize]?.[item.id] || { mrp: 19900, dealerPrice: 16500, distributorPrice: 14500, manufacturingCost: 9500 };
                  const netProfitValue = specPrices.mrp - specPrices.manufacturingCost;
                  const marginPercentVal = Math.round((netProfitValue / specPrices.mrp) * 100);
                  const isCurMatch = item.id === selectedModelId;

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between transition ${
                        isCurMatch
                          ? 'bg-indigo-950/20 border-indigo-500 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-900 text-slate-300 hover:border-slate-850'
                      }`}
                    >
                      <div className="space-y-3 font-mono">
                        <span className="text-[7.5px] bg-slate-900 px-1 py-0.5 border border-slate-800 rounded font-black text-slate-400 block tracking-widest uppercase mb-1">Model 0{item.num}</span>
                        <h4 className="text-[11.5px] font-black leading-tight truncate">{item.name.split(':')[1]?.trim() || item.name}</h4>
                        
                        <div className="pt-2 space-y-1.5 text-[10.5px]">
                          <div className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                            <span className="text-slate-500 font-bold">MRP Cost:</span>
                            <span className="text-emerald-450 font-black">₹{specPrices.mrp.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                            <span className="text-slate-505 font-bold">Dealer:</span>
                            <span className="text-white">₹{specPrices.dealerPrice.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                            <span className="text-slate-500 font-bold">Distributor:</span>
                            <span className="text-white">₹{specPrices.distributorPrice.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="flex justify-between items-baseline">
                            <span className="text-rose-455 font-bold block">Mfg COGS:</span>
                            <span className="text-rose-400">₹{specPrices.manufacturingCost.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedModelId(item.id)}
                        className={`w-full py-1.5 rounded-lg mt-3 text-[9px] font-black uppercase transition cursor-pointer text-center ${
                          isCurMatch
                            ? 'bg-indigo-600 text-white border border-indigo-400/20'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isCurMatch ? '✓ Matching' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Focus pricing breakdown analysis */}
              <div className="md:col-span-4 bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-4 font-mono">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">Selected Pricing COGS Breakdown</span>
                  
                  <div className="space-y-1 bg-slate-900/60 p-4 border border-slate-850 rounded-xl">
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-black block">Active Assembly MRP</span>
                    <span className="text-3xl font-black text-emerald-455 block">₹{activePricing.mrp.toLocaleString('en-IN')}</span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Calculated dynamically for selected {activeSizeSpec.id === '12-inch' ? '12"' : activeSizeSpec.id === '14-inch' ? '14"' : '16"'} frame.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/40 p-3.5 border border-slate-850/80 rounded-xl">
                      <span className="text-[8px] text-slate-550 uppercase tracking-widest block">Net COGS cost</span>
                      <span className="text-md font-black text-rose-400 block">₹{activePricing.manufacturingCost.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-slate-900/40 p-3.5 border border-slate-850/80 rounded-xl">
                      <span className="text-[8px] text-slate-550 uppercase tracking-widest block">Gross Profit</span>
                      <span className="text-md font-black text-emerald-400 block">₹{activePricing.profit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-extrabold">Gross Profit Margin:</span>
                    <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900 font-black rounded">{activePricing.marginPercent}%</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal font-sans italic">
                  * All margins account for default logistics clearances, heavy-duty honeycomb filters, brushless DC core system and integrated electronics boards.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MARKET COMPARISON */}
        {/* ========================================================= */}
        {activeTab === 'market' && (
          <div className="space-y-6 animate-fade-in relative z-10 w-full">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9.5px] text-indigo-400 font-extrabold uppercase tracking-widest block font-bold">Zazen vs Competitors Benchmarks</span>
              <h2 className="text-xl font-bold text-white mt-1">
                📈 Intelligent Autonomy Advantages & Market Analysis
              </h2>
            </div>

            <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
              Compare direct-PV turbine advantages against traditional generic household AC coolers. Our brushless motors leverage higher air circulation volumes while consuming only 25% of grid currents.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Radar advantage chart */}
              <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] text-slate-455 font-extrabold uppercase tracking-wider block text-center">
                    SPECIFICATION AUTONOMY VALUES (Higher is Better)
                  </span>
                  <div className="h-[250px] mt-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={positioningRadarData}>
                        <PolarGrid stroke="#334155" opacity={0.6} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: '9px' }} />
                        <PolarRadiusAxis stroke="#334155" angle={30} domain={[0, 100]} />
                        <Radar name="Zazen Brushless DC" dataKey="Zazen" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                        <Radar name="Competitor Brand A" dataKey="Competitor_A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                        <Radar name="Competitor Brand B" dataKey="Competitor_B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-sans text-center mt-3">
                  💡 Zero power-transfer losses on 48V direct buses ensure highly robust motor and pump operational safety.
                </p>
              </div>

              {/* Bar comparison dynamic index */}
              <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] text-slate-455 font-extrabold uppercase tracking-wider block text-center">
                    DIRECT METRIC COMPARATIVES (Zazen vs Generic Brands)
                  </span>

                  <div className="h-[250px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketComparativesData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: '9px' }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: '9px' }} />
                        <ChartTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '9.5px' }} />
                        <Bar dataKey="Zazen" name="Zazen Turbine Solution" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Competitor_A" name="Generic AC Cooler A" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Competitor_B" name="Generic AC Cooler B" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/60 p-3 rounded-xl flex justify-between items-center text-xs mt-3 leading-none">
                  <span className="text-slate-300 font-extrabold uppercase text-[10px]">Zazen Energy Savings index:</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-black text-[9.5px] uppercase">
                    3.4x Greener
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: HARDWARE BOM (Drill-down contextual BOM Explorer) */}
        {/* ========================================================= */}
        {activeTab === 'bom' && (
          <div className="space-y-6 animate-fade-in relative z-10 w-full font-mono">
            
            {/* Tab header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div>
                <span className="text-[9.5px] text-amber-400 font-extrabold uppercase tracking-widest block font-bold">🔧 Technical Exploded Drill Down</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  🔧 Zazen Contextual Bill of Materials (BOM)
                </h2>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11.5px] text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Selected Assembly: <strong className="text-white uppercase font-black">{activeModel.name.split(':')[0]}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              This drill-down displays the hardware architecture schematic and physical components configured for <strong className="text-white uppercase">{activeSizeSpec.name} ({activeModel.name.split(':')[0]})</strong>. Use selectors above to watch specifications adapt dynamically.
            </p>

            {/* VISUAL ARCHITECTURE DIAGRAM WITH POWER FLOW */}
            <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-xs text-indigo-400 font-black uppercase tracking-widest font-mono">⚡ Hardware Architecture & Power Flow Diagram</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">High-fidelity schematic visualizing flow paths, active and bypassed regulation nodes</p>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-3 py-8 bg-[#020617]/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 pointer-events-none" />
                
                {/* Solar Node */}
                <div className={`flex flex-col items-center p-3.5 rounded-xl border w-full sm:w-32 text-center transition duration-300 ${
                  activeModel.hasSolar 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-600 opacity-25'
                }`}>
                  <span className="text-2xl">☀</span>
                  <span className="text-[10px] font-black tracking-widest mt-1.5 uppercase">Solar</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-bold">{activeModel.hasSolar ? 'GENERATING' : 'OFFLINE'}</span>
                </div>

                {/* Flow 1 */}
                <div className="flex items-center justify-center w-8 h-8 lg:w-12 lg:h-8 flex-shrink-0">
                  <svg className="w-full h-full rotate-90 lg:rotate-0" viewBox="0 0 100 24">
                    <path
                      d="M0,12 L90,12 M80,6 L90,12 L80,18"
                      fill="none"
                      stroke={activeModel.hasSolar ? '#f59e0b' : '#1e293b'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={activeModel.hasSolar ? '6, 6' : 'none'}
                    >
                      {activeModel.hasSolar && (
                        <animate attributeName="stroke-dashoffset" values="12;0" dur="0.8s" repeatCount="indefinite" />
                      )}
                    </path>
                  </svg>
                </div>

                {/* MPPT Node */}
                <div className={`flex flex-col items-center p-3.5 rounded-xl border w-full sm:w-32 text-center transition duration-300 ${
                  activeModel.hasMppt 
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-600 opacity-25'
                }`}>
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-black tracking-widest mt-1.5 uppercase">MPPT</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-bold">{activeModel.hasMppt ? 'REGULATING' : 'BYPASSED'}</span>
                </div>

                {/* Flow 2 */}
                <div className="flex items-center justify-center w-8 h-8 lg:w-12 lg:h-8 flex-shrink-0">
                  <svg className="w-full h-full rotate-90 lg:rotate-0" viewBox="0 0 100 24">
                    <path
                      d="M0,12 L90,12 M80,6 L90,12 L80,18"
                      fill="none"
                      stroke={activeModel.hasMppt ? '#38bdf8' : '#1e293b'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={activeModel.hasMppt ? '6, 6' : 'none'}
                    >
                      {activeModel.hasMppt && (
                        <animate attributeName="stroke-dashoffset" values="12;0" dur="0.8s" repeatCount="indefinite" />
                      )}
                    </path>
                  </svg>
                </div>

                {/* Battery Node */}
                <div className={`flex flex-col items-center p-3.5 rounded-xl border w-full sm:w-32 text-center transition duration-300 ${
                  activeModel.hasBattery 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-450 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-900/40 border-slate-850 text-slate-600 opacity-25'
                }`}>
                  <span className="text-2xl">🔋</span>
                  <span className="text-[10px] font-black tracking-widest mt-1.5 uppercase">Battery</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-bold">{activeModel.hasBattery ? 'BUFFERING' : 'BYPASSED'}</span>
                </div>

                {/* Flow 3 */}
                <div className="flex items-center justify-center w-8 h-8 lg:w-12 lg:h-8 flex-shrink-0">
                  <svg className="w-full h-full rotate-90 lg:rotate-0" viewBox="0 0 100 24">
                    <path
                      d="M0,12 L90,12 M80,6 L90,12 L80,18"
                      fill="none"
                      stroke={activeModel.hasBattery ? '#10b981' : '#6366f1'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="6, 6"
                    >
                      <animate attributeName="stroke-dashoffset" values="12;0" dur="0.8s" repeatCount="indefinite" />
                    </path>
                  </svg>
                </div>

                {/* DC Bus Node */}
                <div className="flex flex-col items-center p-3.5 rounded-xl border w-full sm:w-32 text-center transition duration-300 bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-black tracking-widest mt-1.5 uppercase">DC Bus</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-bold">48V ACTIVE</span>
                </div>

                {/* Flow 4 */}
                <div className="flex items-center justify-center w-8 h-8 lg:w-12 lg:h-8 flex-shrink-0">
                  <svg className="w-full h-full rotate-90 lg:rotate-0" viewBox="0 0 100 24">
                    <path
                      d="M0,12 L90,12 M80,6 L90,12 L80,18"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="6, 6"
                    >
                      <animate attributeName="stroke-dashoffset" values="12;0" dur="0.8s" repeatCount="indefinite" />
                    </path>
                  </svg>
                </div>

                {/* Cooler Node */}
                <div className="flex flex-col items-center p-3.5 rounded-xl border w-full sm:w-32 text-center transition duration-300 bg-sky-500/10 border-sky-400/50 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                  <span className="text-2xl animate-[spin_4s_linear_infinite] inline-block">🌪</span>
                  <span className="text-[10px] font-black tracking-widest mt-1.5 uppercase">Cooler</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-bold">DISCHARGING</span>
                </div>
              </div>
            </div>

            {/* COMPONENT CARDS GRID */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-light border-white/5 pb-2">
                <h3 className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest font-mono">🔧 VISUAL ASSEMBLY MODULES</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Exploded tech module cards displaying physical core elements for the selected {activeModel.name.split(':')[0]}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-5 min-[2100px]:grid-cols-6 gap-5">
                {bomComponents.map((component, index) => (
                  <div
                    key={index}
                    className={`flex flex-col justify-between p-5 rounded-2xl border bg-slate-950/40 hover:bg-[#070b19] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 group bg-gradient-to-br ${component.bg}`}
                  >
                    <div>
                      {/* Large Icon Container */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#020617]/80 border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:border-indigo-500/50 transition">
                          {component.icon}
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-505 bg-indigo-500/10 text-indigo-405 text-indigo-400 border border-indigo-505 border-indigo-500/25 font-bold uppercase">
                          ACTIVE
                        </span>
                      </div>

                      {/* Header and Spec */}
                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5 group-hover:text-indigo-300 transition">
                          {component.icon} {component.name}
                        </h4>
                        <p className="text-[10px] text-indigo-400 font-extrabold font-mono mt-1 tracking-wider uppercase">
                          SPEC: {component.spec}
                        </p>
                      </div>

                      {/* Short Description */}
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans mt-3">
                        {component.desc}
                      </p>
                    </div>

                    {/* Technical Tag Footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>ZAZEN SPEC v2.6</span>
                      <span className="font-bold text-[9.5px] text-emerald-400">✓ INCLUDED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER COCKPIT */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono border-t border-slate-900 pt-5 text-slate-500 text-center sm:text-left">
        <div>
          <span>Zazen portfolio specifications, pricing, bill of materials (BOM), and parameters synced successfully.</span>
        </div>
        <div className="flex gap-4 font-light">
          <span>Active frame standard: 48V DC IEC-60034</span>
          <span>© 2026 Zazen Solutions Group Inc.</span>
        </div>
      </footer>

    </div>
  );
}
