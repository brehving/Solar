import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Battery,
  Sun,
  Zap,
  Wind,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  Printer,
  Hammer,
  AlertCircle,
  Wrench,
  Loader2,
  Lock,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import pricingData from '../pricingDatabase.json';

// Static type definitions for components matching the database
interface DatabaseComponent {
  id: string;
  name: string;
  category: string;
  min_cost: number;
  max_cost: number;
  typical_cost: number;
  supplier_name: string;
  supplier_website: string;
  last_updated: string;
}

interface SizingBOMGeneratorProps {
  panelWattage: number;
  activeCooler: {
    id: string;
    name: string;
    size: number;
    wattage: number;
  };
  mpptEnabled: boolean;
  irradiancePercent: number;
}

// Beautiful count-up value component for pricing metrics
export function AnimatedValue({
  value,
  duration = 400,
  prefix = '',
  suffix = '',
  decimals = 0
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = startValue + progress * (endValue - startValue);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = displayValue.toFixed(decimals);
  return (
    <span>
      {prefix}
      {Number(formatted).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
}

export function SizingBOMGenerator({
  panelWattage,
  activeCooler,
  mpptEnabled,
  irradiancePercent
}: SizingBOMGeneratorProps) {
  // Variant models mapping
  const variantModels = [
    { id: 'model-1', code: 'Model 1', title: 'DC Cooler Only', desc: 'Direct 48V DC ventilation without solar or battery inclusions' },
    { id: 'model-2', code: 'Model 2', title: 'DC Cooler + Battery', desc: 'Integrated 48V motor with internal LiFePO4 battery storage' },
    { id: 'model-3', code: 'Model 3', title: 'DC Cooler + Swappable Battery', desc: 'Dual external cartridge battery module structure' },
    { id: 'model-4', code: 'Model 4', title: 'DC Cooler + Solar Panel', desc: 'Direct PV-to-motor connection with MPPT optimization' },
    { id: 'model-5', code: 'Model 5', title: 'Solar Panel + Battery Premium', desc: 'Full premium off-grid configuration combining PV and battery storage' }
  ];

  // Component configuration state
  const [selectedVariantId, setSelectedVariantId] = useState<string>('model-5');
  const [costTier, setCostTier] = useState<'min_cost' | 'typical_cost' | 'max_cost'>('typical_cost');
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(35);
  const [dailyRuntimeHours, setDailyRuntimeHours] = useState<number>(8);
  const [batteryBackupHours, setBatteryBackupHours] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Sorting columns state
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'cost' | 'contribution'>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Interactive component expanded state
  const [expandedCategories, setExpandedCategories] = useState<{ [category: string]: boolean }>({
    'Motor System': true,
    'Cooling System': true,
    'Battery System': true,
    'Solar System': true,
    'Electronics': true,
    'Mechanical': true
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Map database elements to state
  const database = useMemo(() => pricingData as { [key: string]: DatabaseComponent[] }, []);

  // Compute calculated values dynamically based on sizing parameters and pricing index
  const billOfMaterials = useMemo(() => {
    const isBatteryIncluded = ['model-2', 'model-3', 'model-5'].includes(selectedVariantId);
    const isSolarIncluded = ['model-4', 'model-5'].includes(selectedVariantId);

    // 1. Motor calculations
    const motorSelection = activeCooler.size === 12
      ? database.motor_system.find(m => m.id === 'bldc_motor_40w')
      : activeCooler.size === 14
      ? database.motor_system.find(m => m.id === 'bldc_motor_70w')
      : database.motor_system.find(m => m.id === 'bldc_motor_113w');

    const motorDriver = database.motor_system.find(m => m.id === 'bldc_motor_driver');
    const fanBlade = database.motor_system.find(m => m.id === 'fan_blade_assembly');

    // 2. Cooling assembly calculations
    const padSelection = activeCooler.size === 12
      ? database.cooling_system.find(e => e.id === 'honeycomb_pad_12')
      : activeCooler.size === 14
      ? database.cooling_system.find(e => e.id === 'honeycomb_pad_14')
      : database.cooling_system.find(e => e.id === 'honeycomb_pad_16');

    const waterPump = database.cooling_system.find(e => e.id === 'water_pump_600lph');
    const waterDist = database.cooling_system.find(e => e.id === 'water_distribution');

    // 3. Battery System calculations (Model 2, 3, 5 only)
    // Select battery pack size based on cooler load requirements and backup hours
    const powerW = activeCooler.wattage;
    const requiredBatteryWh = powerW * batteryBackupHours;

    let batteryPack = undefined;
    if (isBatteryIncluded) {
      if (requiredBatteryWh <= 180) {
        batteryPack = database.battery_system.find(b => b.id === 'lifepo4_150wh');
      } else if (requiredBatteryWh <= 350) {
        batteryPack = database.battery_system.find(b => b.id === 'lifepo4_250wh');
      } else {
        batteryPack = database.battery_system.find(b => b.id === 'lifepo4_450wh');
      }
    }

    const bms = isBatteryIncluded
      ? (requiredBatteryWh <= 250
        ? database.battery_system.find(b => b.id === 'bms_4s')
        : database.battery_system.find(b => b.id === 'bms_16s'))
      : undefined;

    const batteryEnclosure = isBatteryIncluded ? database.battery_system.find(b => b.id === 'battery_enclosure') : undefined;
    const batteryConnectors = isBatteryIncluded ? database.battery_system.find(b => b.id === 'connectors_power') : undefined;
    const batteryProtection = isBatteryIncluded ? database.battery_system.find(b => b.id === 'fuse_circuit') : undefined;

    // 4. Solar system calculations (Model 4, 5 only)
    let solarPanel = undefined;
    if (isSolarIncluded) {
      if (panelWattage <= 75) {
        solarPanel = database.solar_system.find(s => s.id === 'mono_panel_50w');
      } else if (panelWattage <= 125) {
        solarPanel = database.solar_system.find(s => s.id === 'mono_panel_100w');
      } else {
        solarPanel = database.solar_system.find(s => s.id === 'mono_panel_150w');
      }
    }

    const solarCharger = isSolarIncluded ? database.solar_system.find(s => s.id === 'mppt_charge_controller') : undefined;
    const mc4Conns = isSolarIncluded ? database.solar_system.find(s => s.id === 'mc4_connectors') : undefined;
    const solarCable = isSolarIncluded ? database.solar_system.find(s => s.id === 'solar_cable_set') : undefined;

    // 5. Electronics
    const mcu = (isSolarIncluded || isBatteryIncluded)
      ? database.electronics.find(el => el.id === 'stm32')
      : database.electronics.find(el => el.id === 'esp32');

    const oledDisplay = database.electronics.find(el => el.id === 'lcd_oled_display');
    const mosfetDriver = database.electronics.find(el => el.id === 'mosfet_driver');
    const regulator = database.electronics.find(el => el.id === 'voltage_regulators');
    const harness = database.electronics.find(el => el.id === 'wiring_harness');
    const pcb = database.electronics.find(el => el.id === 'pcb_mfg');

    // 6. Mechanical System
    const chassis = activeCooler.size === 12
      ? database.mechanical.find(m => m.id === 'plastic_cooler_body_12')
      : activeCooler.size === 14
      ? database.mechanical.find(m => m.id === 'plastic_cooler_body_14')
      : database.mechanical.find(m => m.id === 'plastic_cooler_body_16');

    const fasteners = database.mechanical.find(m => m.id === 'fasteners');
    const packaging = database.mechanical.find(m => m.id === 'packaging_materials');
    const assemblyLabor = database.mechanical.find(m => m.id === 'assembly_labor');

    // Build raw listing with specific quantities and flags
    const activeComponentsList = [
      { comp: motorSelection, qty: 1, required: true },
      { comp: motorDriver, qty: 1, required: true },
      { comp: fanBlade, qty: 1, required: true },
      { comp: padSelection, qty: 3, required: true },
      { comp: waterPump, qty: 1, required: true },
      { comp: waterDist, qty: 1, required: true },
      { comp: batteryPack, qty: selectedVariantId === 'model-3' ? 2 : 1, required: isBatteryIncluded },
      { comp: bms, qty: 1, required: isBatteryIncluded },
      { comp: batteryEnclosure, qty: 1, required: isBatteryIncluded },
      { comp: batteryConnectors, qty: 2, required: isBatteryIncluded },
      { comp: batteryProtection, qty: 1, required: isBatteryIncluded },
      { comp: solarPanel, qty: 1, required: isSolarIncluded },
      { comp: solarCharger, qty: 1, required: isSolarIncluded },
      { comp: mc4Conns, qty: 2, required: isSolarIncluded },
      { comp: solarCable, qty: 1, required: isSolarIncluded },
      { comp: mcu, qty: 1, required: true },
      { comp: oledDisplay, qty: 1, required: true },
      { comp: mosfetDriver, qty: 1, required: true },
      { comp: regulator, qty: 1, required: true },
      { comp: harness, qty: 1, required: true },
      { comp: pcb, qty: 1, required: true },
      { comp: chassis, qty: 1, required: true },
      { comp: fasteners, qty: 1, required: true },
      { comp: packaging, qty: 1, required: true },
      { comp: assemblyLabor, qty: 1, required: true }
    ];

    // Compute dynamic minimum, typical, premium costs of every item
    const parsedItems = activeComponentsList
      .filter(item => item.comp !== undefined && item.required)
      .map(item => {
        const component = item.comp as DatabaseComponent;
        const qty = item.qty;

        const itemMin = component.min_cost * qty;
        const itemTyp = component.typical_cost * qty;
        const itemMax = component.max_cost * qty;

        const currentSelectedCost = costTier === 'min_cost'
          ? itemMin
          : costTier === 'typical_cost'
          ? itemTyp
          : itemMax;

        return {
          id: component.id,
          name: component.name,
          category: component.category,
          qty,
          min_cost: itemMin,
          typical_cost: itemTyp,
          premium_cost: itemMax,
          selected_cost: currentSelectedCost,
          supplier: component.supplier_name,
          website: component.supplier_website,
          last_updated: component.last_updated
        };
      });

    // Total calculations
    const totalBOM = parsedItems.reduce((acc, curr) => acc + curr.selected_cost, 0);

    // Specific category accumulations
    const categoryTotals = parsedItems.reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.selected_cost;
      return acc;
    }, {});

    const batteryCostTotal = categoryTotals['Battery System'] || 0;
    const solarCostTotal = categoryTotals['Solar System'] || 0;
    const electronicsCostTotal = categoryTotals['Electronics'] || 0;
    const mechanicalCostTotal = categoryTotals['Mechanical'] || 0;
    const motorCostTotal = categoryTotals['Motor System'] || 0;
    const coolingCostTotal = categoryTotals['Cooling System'] || 0;

    // Estimate manufacturing overhead, raw packaging, and direct assembling labor (from mechanical)
    const directLaborCost = parsedItems.find(i => i.id === 'assembly_labor')?.selected_cost || 0;
    const estimatedCOGS = totalBOM; // Raw Materials & direct labor base COGS
    const massMgfCostOvh = Math.round(estimatedCOGS * 0.9); // At scale value factor (90% after procurement scaling)

    // Profitability simulations
    const msrpMultiplier = 1 / (1 - targetMarginPercent / 100);
    const suggestedMSRP = Math.round(estimatedCOGS * msrpMultiplier);
    
    // Ratios typical in consumer hardware industries
    const distributorMargin = Math.round(suggestedMSRP * 0.12);
    const retailerMargin = Math.round(suggestedMSRP * 0.18);
    
    const grossProfitVal = suggestedMSRP - estimatedCOGS;
    const netProfitVal = suggestedMSRP - estimatedCOGS - distributorMargin - retailerMargin;
    const netMarginPercent = Math.max(0, Math.round((netProfitVal / suggestedMSRP) * 100));

    return {
      items: parsedItems,
      totalBOM,
      batteryCostTotal,
      solarCostTotal,
      electronicsCostTotal,
      mechanicalCostTotal,
      motorCostTotal,
      coolingCostTotal,
      estimatedCOGS,
      massMgfCostOvh,
      suggestedMSRP,
      distributorMargin,
      retailerMargin,
      grossProfitVal,
      netProfitVal,
      netMarginPercent,
      batteryBackupWh: requiredBatteryWh
    };
  }, [selectedVariantId, costTier, targetMarginPercent, activeCooler, panelWattage, batteryBackupHours, database]);

  // Filtering & Sorting of Items
  const processedItems = useMemo(() => {
    return billOfMaterials.items
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'name') {
          compare = a.name.localeCompare(b.name);
        } else if (sortBy === 'category') {
          compare = a.category.localeCompare(b.category);
        } else if (sortBy === 'cost') {
          compare = a.selected_cost - b.selected_cost;
        } else if (sortBy === 'contribution') {
          compare = a.selected_cost - b.selected_cost;
        }

        return sortOrder === 'desc' ? -compare : compare;
      });
  }, [billOfMaterials.items, searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleSort = (field: 'name' | 'category' | 'cost' | 'contribution') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Prepares charts dataset
  const breakdownChartData = useMemo(() => {
    const colorsList: { [cat: string]: string } = {
      'Motor System': '#6366f1', // Indigo
      'Cooling System': '#06b6d4', // Cyan
      'Battery System': '#10b981', // Emerald
      'Solar System': '#f59e0b', // Amber
      'Electronics': '#38bdf8', // Sky
      'Mechanical': '#ec4899' // Pink
    };

    const categories = ['Motor System', 'Cooling System', 'Battery System', 'Solar System', 'Electronics', 'Mechanical'];
    return categories.map(cat => {
      let val = 0;
      if (cat === 'Motor System') val = billOfMaterials.motorCostTotal;
      if (cat === 'Cooling System') val = billOfMaterials.coolingCostTotal;
      if (cat === 'Battery System') val = billOfMaterials.batteryCostTotal;
      if (cat === 'Solar System') val = billOfMaterials.solarCostTotal;
      if (cat === 'Electronics') val = billOfMaterials.electronicsCostTotal;
      if (cat === 'Mechanical') val = billOfMaterials.mechanicalCostTotal;

      const percentage = billOfMaterials.totalBOM > 0 ? Math.round((val / billOfMaterials.totalBOM) * 100) : 0;

      return {
        name: cat,
        value: val,
        percentage,
        color: colorsList[cat] || '#94a3b8'
      };
    }).filter(d => d.value > 0);
  }, [billOfMaterials]);

  // Export handlers
  const handleExport = (type: 'pdf' | 'csv' | 'excel' | 'report') => {
    setIsExporting(type);

    setTimeout(() => {
      setIsExporting(null);
      if (type === 'pdf' || type === 'report') {
        window.print();
        return;
      }

      // Prepare CSV spreadsheet content
      const headers = [
        'Component', 'Category', 'Quantity', 'Min Cost (INR)', 'Typical Cost (INR)', 'Premium Cost (INR)', 'Selected Cost (INR)', 'Contribution (%)', 'Supplier', 'Last Updated'
      ];

      const rows = billOfMaterials.items.map(item => {
        const percent = billOfMaterials.totalBOM > 0 ? ((item.selected_cost / billOfMaterials.totalBOM) * 100).toFixed(1) : '0';
        return [
          item.name,
          item.category,
          item.qty,
          item.min_cost,
          item.typical_cost,
          item.premium_cost,
          item.selected_cost,
          `${percent}%`,
          item.supplier,
          item.last_updated
        ];
      });

      // Add summary calculations to spreadsheet footer
      const footers = [
        [],
        ['--- FINANCIAL SUMMARY REPORT (Calculated in INR) ---'],
        ['Total Raw Materials BOM Cost', billOfMaterials.totalBOM],
        ['Estimated Mass Mfg Cost (Overhead Reductions)', billOfMaterials.massMgfCostOvh],
        ['Estimated COGS Baseline Value', billOfMaterials.estimatedCOGS],
        ['Suggested MSRP Selling Price', billOfMaterials.suggestedMSRP],
        ['Gross Margin Percentage Selected', `${targetMarginPercent}%`],
        ['Projected Gross Profit Value', billOfMaterials.grossProfitVal],
        ['Target Distribution Channels Portion (30% total)', billOfMaterials.distributorMargin + billOfMaterials.retailerMargin],
        [],
        ['--- CLOUD CALCULATOR SPECIFICATIONS ---'],
        ['Cooler Name', activeCooler.name],
        ['Cooler Watts Load', `${activeCooler.wattage}W`],
        ['Solar Panel Input', `${panelWattage}W`],
        ['Battery Buffer Capacity', `${billOfMaterials.batteryBackupWh}Wh`],
        ['Export Timestamp', new Date().toLocaleString()]
      ];

      const csvSheet = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers, ...rows, ...footers].map(r => r.map(c => `"${c}"`).join(",")).join("\n");

      const uri = encodeURI(csvSheet);
      const tempLink = document.createElement('a');
      tempLink.setAttribute('href', uri);
      tempLink.setAttribute('download', `Zazen_Air_Cooler_Procurement_BOM_${activeCooler.size}in_${type === 'excel' ? 'ExcelSheet' : 'Sheet'}.csv`);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

    }, 1300);
  };

  // Find most expensive components
  const mostExpensiveItems = useMemo(() => {
    return [...billOfMaterials.items]
      .sort((a, b) => b.selected_cost - a.selected_cost)
      .slice(0, 3);
  }, [billOfMaterials.items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8 font-sans pb-24 text-white relative"
    >
      {/* Decorative Blueprint Ambient Overlays */}
      <div className="absolute inset-0 bg-linear-to-b from-indigo-950/10 to-slate-950/40 pointer-events-none rounded-3xl" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* DASHBOARD HERO PANEL */}
      <div className="bg-[#0b1222] border border-slate-850/60 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono px-2.5 py-1 rounded-md font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.08)]">
              <Cpu className="w-3.5 h-3.5" />
              Sovereign Procurement Hub
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2.5 py-1 rounded-md">
              Indian Market Precision (INR ₹)
            </span>
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/25 text-[10px] font-mono px-2 py-0.5 rounded-full">
              Sizing Auto-Synced
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent uppercase leading-none md:text-4xl">
            BOM & Cost Analysis Dashboard
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono max-w-2xl">
            SaaS modeling platform resolving technical component dependencies and supplier cost tiers mapped exclusively to the <span className="text-white font-black">{activeCooler.name} ({activeCooler.size}&quot;)</span>.
          </p>
        </div>

        {/* Global Action Export row */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting !== null}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-850 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {isExporting === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            )}
            Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={isExporting !== null}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-850 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {isExporting === 'excel' ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <FileText className="w-4 h-4 text-sky-400" />
            )}
            Export Excel
          </button>
          <button
            onClick={() => handleExport('report')}
            disabled={isExporting !== null}
            className="flex-1 md:flex-none bg-indigo-650 hover:bg-indigo-600 shadow-[0_4px_20px_rgba(99,102,241,0.25)] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-indigo-500"
          >
            {isExporting === 'report' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            Print Report
          </button>
        </div>
      </div>

      {/* DYNAMIC SIZING SYNC OUTPUT CARD (INFORMATIONAL METADATA STRIP) */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-slate-400 z-10 relative">
        <div className="flex items-center gap-2.5 text-indigo-400">
          <Info className="w-4.5 h-4.5" />
          <span>Sizing inputs locked from current calculator calculations. No re-entry required.</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
          <span>Active Fan: <strong className="text-white">{activeCooler.size}&quot; ({activeCooler.wattage}W)</strong></span>
          <span>•</span>
          <span>Active PV Input: <strong className="text-white">{panelWattage}W</strong></span>
          <span>•</span>
          <span>Buffer Sun: <strong className="text-white">{irradiancePercent}%</strong></span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN FORECASTING ENVIRONMENT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 z-10 relative items-start">
        
        {/* Left Column: Modeling settings & profitability parameters */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* 1. VARIANT PRODUCT SELECTOR */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="border-b border-indigo-950 pb-2">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Product Variants
              </h3>
            </div>
            
            <div className="space-y-2">
              {variantModels.map(v => {
                const isSelected = selectedVariantId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`w-full p-3 text-left border rounded-xl transition-all flex flex-col gap-0.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'border-slate-900 bg-slate-950/20 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                        {v.code}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-slate-800'}`} />
                    </div>
                    <span className="font-extrabold text-[12.5px] text-white tracking-tight mt-1 group-hover:text-indigo-300 transition-colors">
                      {v.title}
                    </span>
                    <span className="text-[9px] text-slate-500 leading-snug mt-1 truncate max-w-[200px]" title={v.desc}>
                      {v.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. COMPONENT COST TIER PLANNERS */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="border-b border-indigo-950 pb-2">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Procurement Cost Grade
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900">
              <button
                onClick={() => setCostTier('min_cost')}
                className={`py-2 px-1 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                  costTier === 'min_cost' ? 'bg-slate-850 text-white' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Min (Basic)
              </button>
              <button
                onClick={() => setCostTier('typical_cost')}
                className={`py-2 px-1 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                  costTier === 'typical_cost' ? 'bg-slate-850 text-white' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Typical
              </button>
              <button
                onClick={() => setCostTier('max_cost')}
                className={`py-2 px-1 rounded-lg text-[10.5px] font-extrabold cursor-pointer transition-all ${
                  costTier === 'max_cost' ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-900/30' : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                Industrial
              </button>
            </div>

            <span className="text-[9.5px] text-slate-500 font-mono italic leading-relaxed block">
              {costTier === 'min_cost' && '* Calculates strictly using lower tolerance IndiaMART listing minimums.'}
              {costTier === 'typical_cost' && '* Baseline midpoint projection typical of standard off-the-shelf bulk sourcing.'}
              {costTier === 'max_cost' && '* High grade, weatherproof, heavy copper premium components optimized for desert environments.'}
            </span>
          </div>

          {/* 3. SIMULATION MARKUP TARGET SLIDER */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="border-b border-indigo-950 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Profitability Target
              </h3>
              <span className="text-xs font-black font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                {targetMarginPercent}% Margin
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="15"
                max="65"
                step="5"
                value={targetMarginPercent}
                onChange={(e) => setTargetMarginPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 accent-indigo-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-500 font-mono">
                <span>Distributor Price (15%)</span>
                <span>MSRP Value (65%)</span>
              </div>
            </div>

            {/* Dynamic Sizing values for runtime sliders */}
            <div className="space-y-4 pt-4 border-t border-indigo-950">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <label>Daily Usage Runtime:</label>
                  <strong className="text-white">{dailyRuntimeHours} Hrs</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="1"
                  value={dailyRuntimeHours}
                  onChange={(e) => setDailyRuntimeHours(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 accent-slate-400 rounded-sm appearance-none cursor-pointer"
                />
              </div>

              {['model-2', 'model-3', 'model-5'].includes(selectedVariantId) && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <label>Battery Backup Target:</label>
                    <strong className="text-emerald-400">{batteryBackupHours} Hrs</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={batteryBackupHours}
                    onChange={(e) => setBatteryBackupHours(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 accent-emerald-500 rounded-sm appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 block leading-tight font-mono">
                    Estimated raw pack size: <strong className="text-slate-350">{billOfMaterials.batteryBackupWh}Wh</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Key KPI, interactive charts, components list */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* PREMIUM BENTO KPIs GRID */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* KPI 1: Estimated COGS */}
            <div className="bg-slate-950/50 p-5 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform pointer-events-none">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Total Raw Material (BOM)</span>
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="mt-4">
                <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
                  <AnimatedValue value={billOfMaterials.totalBOM} prefix="₹" />
                </span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-1">Direct Procurement COGS</span>
              </div>
            </div>

            {/* KPI 2: Suggested Retail MSRP */}
            <div className="bg-linear-to-b from-indigo-950/40 to-slate-950/50 p-5 border border-indigo-950/80 rounded-2xl flex flex-col justify-between hover:border-indigo-900 transition-colors shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform pointer-events-none">
                <DollarSign className="w-12 h-12" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] text-indigo-400 uppercase tracking-widest font-mono font-black block">Suggested MSRP MSRP</span>
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="mt-4">
                <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-indigo-300">
                  <AnimatedValue value={billOfMaterials.suggestedMSRP} prefix="₹" />
                </span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-1">Based on {targetMarginPercent}% profit margin</span>
              </div>
            </div>

            {/* KPI 3: Estimated Mass Manufacturing Overhead Reductions */}
            <div className="bg-slate-950/50 p-5 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform pointer-events-none">
                <Hammer className="w-12 h-12" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Mass Prod cost (Est)</span>
                <Hammer className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-4">
                <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-emerald-400">
                  <AnimatedValue value={billOfMaterials.massMgfCostOvh} prefix="₹" />
                </span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-1">Scaled procurement (-10%)</span>
              </div>
            </div>

            {/* KPI 4: Target Projected Net Profit */}
            <div className="bg-slate-950/50 p-5 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform pointer-events-none">
                <TrendingUp className="w-12 h-12" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Net distributor profit</span>
                <Percent className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-4">
                <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-sky-300">
                  <AnimatedValue value={billOfMaterials.netProfitVal} prefix="₹" />
                </span>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-1">Channel profit margin: {billOfMaterials.netMarginPercent}%</span>
              </div>
            </div>
          </motion.div>

          {/* DYNAMIC DUAL CHARTS PLOT ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* PIE CHART PORTIONS BREAKDOWN */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
              <div className="border-b border-indigo-950 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-xs text-slate-300 font-mono font-extrabold uppercase">Subsystem Portions Breakdown</h3>
                  <p className="text-[9.5px] text-slate-500 mt-1 leading-normal font-mono">Real-time percentage contributions of each subsystem</p>
                </div>
                <span className="text-[9.5px] font-mono bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-emerald-400 uppercase">Proportions</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdownChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {breakdownChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[10.5px] font-mono shadow-2xl">
                                <p className="font-extrabold text-white">{data.name}</p>
                                <p className="text-indigo-400 mt-0.5">Est: ₹{data.value.toLocaleString('en-IN')}</p>
                                <p className="text-slate-400">Share: {data.percentage}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                    <span className="text-slate-500 text-[8.5px] uppercase tracking-widest font-mono font-extrabold">BOM Base</span>
                    <span className="text-md font-black text-white font-mono mt-0.5">₹{billOfMaterials.totalBOM.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 w-full sm:w-auto font-mono text-[9.5px]">
                  {breakdownChartData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-1.5 bg-slate-950/80 rounded-lg border border-slate-900 hover:border-slate-850 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-400 truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <span className="font-extrabold text-white">₹{item.value.toLocaleString('en-IN')} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BAR CHART SUBSYSTEM BUDGETS */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
              <div className="border-b border-indigo-950 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-xs text-slate-300 font-mono font-extrabold uppercase">Subsystem Costs Contrast Analysis</h3>
                  <p className="text-[9.5px] text-slate-500 mt-1 leading-normal font-mono">Comparison of complete subsystem manufacturing thresholds</p>
                </div>
                <span className="text-[9.5px] font-mono bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 text-indigo-400 uppercase">Subtotals</span>
              </div>

              <div className="flex-1 min-h-[180px] flex items-center justify-center py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={breakdownChartData}
                    margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#111827" horizontal={true} vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 8.5, fontFamily: 'monospace' }} />
                    <YAxis stroke="#4b5563" tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 8.5, fontFamily: 'monospace' }} />
                    <RechartsTooltip
                      cursor={{ fill: '#334155', opacity: 0.15 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[10.5px] font-mono shadow-2xl text-left">
                              <p className="font-extrabold text-white">{data.name}</p>
                              <p className="text-indigo-400 mt-0.5">Sourcing Quote: ₹{data.value.toLocaleString('en-IN')}</p>
                              <p className="text-slate-400 font-sans mt-0.5">Optimized against local supplier databases.</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {breakdownChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* CRITICAL SUPPLY RISK ASSESSMENT STRIP */}
          <div className="bg-[#1c1510] border border-amber-900/30 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
            <div className="flex gap-3">
              <span className="text-xl mt-0.5 flex-shrink-0 animate-pulse">⚠️</span>
              <div className="space-y-0.5">
                <span className="font-bold text-amber-500 uppercase tracking-wider font-mono">BOM Cost Drivers & Risks</span>
                <p className="text-slate-400 leading-normal font-mono text-[11px] mt-1">
                  The primary cost drivers are the <span className="text-white font-bold">{mostExpensiveItems[0]?.name}</span> at{' '}
                  <span className="text-amber-500 font-extrabold">₹{mostExpensiveItems[0]?.selected_cost}</span>, followed by{' '}
                  <span className="text-slate-350">{mostExpensiveItems[1]?.name}</span> (₹{mostExpensiveItems[1]?.selected_cost}).
                </p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE COMPONENT DETAILS ACCORDION DIRECTORY */}
          <div className="space-y-4">
            
            {/* SEARCH AND INTERACTIVE FILTERS TOOLBAR */}
            <div className="bg-[#0b1222]/80 p-4 rounded-2xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search specific supplier, component or spec..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-850 bg-slate-950 text-white rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 placeholder-slate-500 uppercase"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                {['All', 'Motor System', 'Cooling System', 'Battery System', 'Solar System', 'Electronics', 'Mechanical'].map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
                        isActive
                          ? 'bg-indigo-650 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-900 hover:bg-slate-900 hover:text-slate-250'
                      }`}
                    >
                      {cat === 'All' ? 'All Subsystems' : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SORTING CONTROLLER PANEL */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-indigo-950/80 pb-2.5">
              <span>Dynamic pricing mappings: {processedItems.length} active nodes</span>
              <div className="flex gap-4">
                <span className="text-[10px] text-slate-600">Sort by:</span>
                <button
                  onClick={() => handleSort('cost')}
                  className={`flex items-center gap-1 font-bold ${sortBy === 'cost' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Cost {sortBy === 'cost' && (sortOrder === 'desc' ? '▼' : '▲')}
                </button>
                <button
                  onClick={() => handleSort('name')}
                  className={`flex items-center gap-1 font-bold ${sortBy === 'name' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Name {sortBy === 'name' && (sortOrder === 'desc' ? '▼' : '▲')}
                </button>
                <button
                  onClick={() => handleSort('category')}
                  className={`flex items-center gap-1 font-bold ${sortBy === 'category' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Category {sortBy === 'category' && (sortOrder === 'desc' ? '▼' : '▲')}
                </button>
              </div>
            </div>

            {/* RENDER DYNAMIC ACCORDIONS GROUPED BY CATEGORY */}
            <div className="space-y-3 font-sans">
              {['Motor System', 'Cooling System', 'Battery System', 'Solar System', 'Electronics', 'Mechanical'].map((catName) => {
                const categoryMatchingItems = processedItems.filter(item => item.category === catName);
                const subCategoryBOMTotal = categoryMatchingItems.reduce((acc, curr) => acc + curr.selected_cost, 0);
                const isExpanded = expandedCategories[catName];
                const activeCount = categoryMatchingItems.length;

                if (categoryMatchingItems.length === 0 && searchQuery !== '') return null;
                if (selectedCategory !== 'All' && selectedCategory !== catName) return null;

                const percentTotal = billOfMaterials.totalBOM > 0
                  ? Math.round((subCategoryBOMTotal / billOfMaterials.totalBOM) * 100)
                  : 0;

                return (
                  <div
                    key={catName}
                    className="border border-slate-900/60 bg-[#070b14]/30 rounded-2xl overflow-hidden shadow-xs"
                  >
                    {/* Header bar */}
                    <button
                      onClick={() => toggleCategory(catName)}
                      className="w-full p-4 flex items-center justify-between text-left bg-[#070b14]/70 border-b border-indigo-950/40 hover:bg-slate-900/30 transition-colors cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {catName === 'Motor System' ? '🌪️' :
                           catName === 'Cooling System' ? '💦' :
                           catName === 'Battery System' ? '🔋' :
                           catName === 'Solar System' ? '☀️' :
                           catName === 'Electronics' ? '📱' : '🔩'}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">{catName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {activeCount} lines mapped • Subtotal quote:{' '}
                            <span className="font-bold text-slate-350">₹{subCategoryBOMTotal.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[9.5px] font-black tracking-widest text-[#a5b4fc] bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded uppercase">
                          {percentTotal}% Share
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </button>

                    {/* Accordion List Body animation */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-slate-950/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryMatchingItems.map((item) => {
                              const contributionVal = billOfMaterials.totalBOM > 0
                                ? ((item.selected_cost / billOfMaterials.totalBOM) * 100).toFixed(1)
                                : '0';
                              const isDriversNode = item.selected_cost > (billOfMaterials.totalBOM * 0.15);

                              return (
                                <motion.div
                                  key={item.id}
                                  whileHover={{ scale: 1.025, y: -2 }}
                                  transition={{ duration: 0.2 }}
                                  className={`p-4 border rounded-xl flex flex-col justify-between min-h-[165px] relative transition-all duration-300 ${
                                    isDriversNode
                                      ? 'bg-linear-to-br from-indigo-950/25 to-slate-950/80 border-indigo-500/50 shadow-[0_4px_16px_rgba(99,102,241,0.06)]'
                                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                                  }`}
                                >
                                  {isDriversNode && (
                                    <span className="absolute -top-2 right-4 bg-indigo-750 border border-indigo-600 px-20 py-0.5 rounded-full text-[8.5px] font-mono tracking-widest font-black text-indigo-200">
                                      MAJOR DRIVER
                                    </span>
                                  )}

                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <span className="text-md p-1.5 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-center w-8 h-8 font-mono">
                                        ⚙️
                                      </span>
                                      <div className="text-right flex flex-col">
                                        <span className="bg-slate-900 border border-slate-850 text-slate-400 font-mono text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">
                                          Qty: {item.qty}
                                        </span>
                                      </div>
                                    </div>

                                    <div>
                                      <h5 className="font-extrabold text-[12.5px] text-white leading-tight">
                                        {item.name}
                                      </h5>
                                      <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500 font-mono">
                                        <span>Supplier:</span>
                                        <a
                                          href={item.website}
                                          target="_blank"
                                          referrerPolicy="no-referrer"
                                          className="text-[#818cf8] hover:underline flex items-center gap-0.5 inline-flex font-bold"
                                        >
                                          {item.supplier}
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-3 border-t border-slate-900/60 mt-4 flex justify-between items-end font-mono">
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-slate-400 uppercase">Contribution</span>
                                      <span className="text-[10.5px] font-extrabold text-slate-300">{contributionVal}%</span>
                                    </div>

                                    <div className="text-right">
                                      <span className="text-[8px] sm:text-[9px] text-slate-500 line-through block font-medium">
                                        ₹{item.min_cost.toLocaleString()} – ₹{item.premium_cost.toLocaleString()}
                                      </span>
                                      <span className="text-[13px] font-black text-white">
                                        ₹{item.selected_cost.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>

          {/* COMMERCIAL VALUE CHAIN SUMMARY */}
          <div className="bg-[#0b1222]/60 border border-slate-850 p-6 rounded-3xl space-y-4">
            <div className="border-b border-indigo-950 pb-2">
              <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider font-mono">Commercial Value Chain Analysis</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Projecting partner distribution metrics and retailer allocations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider font-black block">Procurement Cost</span>
                <span className="text-[14px] font-black text-slate-200 font-mono">₹{billOfMaterials.estimatedCOGS.toLocaleString('en-IN')}</span>
                <span className="text-[8px] text-slate-500 font-mono block">Direct materials + assembly labor</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[8.5px] text-amber-500 uppercase font-mono tracking-wider font-black block">Distributor Cut</span>
                <span className="text-[14px] font-black text-amber-400 font-mono">₹{billOfMaterials.distributorMargin.toLocaleString('en-IN')}</span>
                <span className="text-[8px] text-slate-500 font-mono block">Estimated 12% distribution cut</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[8.5px] text-amber-500 uppercase font-mono tracking-wider font-black block">Retailer Margin Buffer</span>
                <span className="text-[14px] font-black text-amber-400 font-mono">₹{billOfMaterials.retailerMargin.toLocaleString('en-IN')}</span>
                <span className="text-[8px] text-slate-500 font-mono block">Estimated 18% retailer margin</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl space-y-1">
                <span className="text-[8.5px] text-indigo-400 uppercase font-mono tracking-wider font-black block">Gross Profit (Pre-Channel)</span>
                <span className="text-[14px] font-black text-[#a5b4fc] font-mono">₹{billOfMaterials.grossProfitVal.toLocaleString('en-IN')}</span>
                <span className="text-[8px] text-slate-500 font-mono block">Typical Margin: {targetMarginPercent}%</span>
              </div>
              <div className="bg-slate-100 p-3.5 rounded-xl space-y-1 text-slate-950">
                <span className="text-[8.5px] uppercase font-mono tracking-wider font-black block text-slate-600">Net Profit Yield</span>
                <span className="text-[14px] font-black font-mono text-slate-900">₹{billOfMaterials.netProfitVal.toLocaleString('en-IN')}</span>
                <span className="text-[8.5px] text-emerald-700 font-mono font-black block">{billOfMaterials.netMarginPercent}% Net share</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
