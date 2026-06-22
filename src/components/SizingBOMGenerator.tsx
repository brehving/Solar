import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Layers,
  Wind,
  Zap,
  Sun,
  Sliders,
  Search,
  Eye,
  Check,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Loader2,
  Lock,
  Compass,
  Wrench,
  ThumbsUp,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { ComponentItem, CATEGORIES, CategoryType } from './BOMTypes';
import { ALL_COMPONENTS } from './BOMComponentData';

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

export function SizingBOMGenerator({
  panelWattage,
  activeCooler,
  mpptEnabled,
  irradiancePercent
}: SizingBOMGeneratorProps) {
  // ---------------------------------------------------------
  // Configurator Design Constraints (Driven by User & Sync)
  // ---------------------------------------------------------
  const [coolerType, setCoolerType] = useState<string>('Pure Evaporative Direct');
  const [cabinetSize, setCabinetSize] = useState<number>(activeCooler.size);
  const [coolingCapacity, setCoolingCapacity] = useState<string>('1.0 Ton');
  const [insulationThickness, setInsulationThickness] = useState<string>('10mm');

  // Interactive config state
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Compressor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Advanced catalog filters
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');
  const [filterOnlyCompatible, setFilterOnlyCompatible] = useState<boolean>(true);

  // Active Selected Components (Category -> Component ID)
  const [selectedComponents, setSelectedComponents] = useState<Record<string, string>>({
    'Compressor': 'comp-bypass',
    'Condenser': 'cond-bypass',
    'Evaporator': 'evap-honey-12',
    'Expansion Device': 'exp-bypass',
    'Fans': 'fan-axial-12',
    'Insulation': 'ins-pe-10',
    'Cabinet Material': 'cab-abs-12',
    'Controller': 'ctrl-mppt-250w',
    'Sensors': 'sens-sht31-temp',
    'Lighting': 'light-led-3w',
    'Electrical Components': 'elec-all-xt60',
    'Accessories': 'acc-cast-set'
  });

  // Numeric quantities override (Component ID -> Qty)
  const [componentQuantities, setComponentQuantities] = useState<Record<string, number>>({});
  // Sourcing custom markup & mechanical labels
  const [markupRate, setMarkupRate] = useState<number>(18); // GST / Imports Tariff %
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(30); // Target sales gross margin %
  
  // Custom installer/assembly notes (Component ID -> User override string)
  const [customBOMNotes, setCustomBOMNotes] = useState<Record<string, string>>({});

  // Active spec explorer detail component ID
  const [explorerDetailId, setExplorerDetailId] = useState<string | null>(null);
  const [specTab, setSpecTab] = useState<'DATASHEET' | 'CURVE' | 'BLUEPRINT'>('DATASHEET');
  
  // Export trigger
  const [exportingType, setExportingType] = useState<string | null>(null);

  // ---------------------------------------------------------
  // Automatic Syncing when active cooler changes in Parent Tab
  // ---------------------------------------------------------
  useEffect(() => {
    setCabinetSize(activeCooler.size);
    if (activeCooler.size === 12) {
      setCoolerType('Pure Evaporative Direct');
      setCoolingCapacity('1.0 Ton');
      setInsulationThickness('10mm');
      setSelectedComponents(prev => ({
        ...prev,
        'Compressor': 'comp-bypass',
        'Condenser': 'cond-bypass',
        'Evaporator': 'evap-honey-12',
        'Expansion Device': 'exp-bypass',
        'Fans': 'fan-axial-12',
        'Cabinet Material': 'cab-abs-12',
        'Insulation': 'ins-pe-10'
      }));
    } else if (activeCooler.size === 14) {
      setCoolerType('Indirect Evaporative');
      setCoolingCapacity('1.5 Ton');
      setInsulationThickness('20mm');
      setSelectedComponents(prev => ({
        ...prev,
        'Compressor': 'comp-bypass',
        'Condenser': 'cond-bypass',
        'Evaporator': 'evap-honey-16',
        'Expansion Device': 'exp-bypass',
        'Fans': 'fan-axial-14',
        'Cabinet Material': 'cab-galv-14',
        'Insulation': 'ins-rubber-20'
      }));
    } else {
      setCoolerType('Hybrid Compressor-Assisted');
      setCoolingCapacity('2.0 Ton');
      setInsulationThickness('30mm');
      setSelectedComponents(prev => ({
        ...prev,
        'Compressor': 'comp-highly-dc48',
        'Condenser': 'cond-copper-dual',
        'Evaporator': 'evap-dx-copper-16',
        'Expansion Device': 'exp-danfoss-tx2',
        'Fans': 'fan-centrif-16',
        'Cabinet Material': 'cab-ss304-large',
        'Insulation': 'ins-poly-30'
      }));
    }
    // Set active explorer to start on Compressor
    setActiveCategory('Compressor');
    setExplorerDetailId(null);
  }, [activeCooler]);

  // Reset category-specific search/filters on category tab click
  const handleCategoryChange = (cat: CategoryType) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setSelectedBrand('ALL');
    setSelectedVoltage('ALL');
    setSelectedAvailability('ALL');
    setExplorerDetailId(null);
  };

  // ---------------------------------------------------------
  // Core Business/Selection Logic
  // ---------------------------------------------------------
  const currentExplorerItem = useMemo(() => {
    const activeId = explorerDetailId || selectedComponents[activeCategory];
    return ALL_COMPONENTS.find(c => c.id === activeId) || ALL_COMPONENTS.find(c => c.category === activeCategory) || ALL_COMPONENTS[0];
  }, [activeCategory, explorerDetailId, selectedComponents]);

  // Intelligent filter list matching mechanical and thermal requirements
  const checkCompatibility = (comp: ComponentItem): { compatible: boolean; reason?: string } => {
    // A. Cooler Type Compatibility Constraint
    if (comp.category === 'Compressor' || comp.category === 'Condenser') {
      const isBypass = comp.id.includes('bypass') || comp.id.includes('not-needed');
      const isHybridClass = coolerType === 'Hybrid Compressor-Assisted';
      if (isHybridClass && isBypass) {
        return { compatible: false, reason: 'Hybrid mode requires active heat rejection loops.' };
      }
      if (!isHybridClass && !isBypass) {
        return { compatible: false, reason: 'Evaporative cooling uses water spray bypassing gas pumps.' };
      }
    }

    if (comp.category === 'Expansion Device') {
      const isBypass = comp.id === 'exp-bypass';
      const isHybridClass = coolerType === 'Hybrid Compressor-Assisted';
      if (isHybridClass && isBypass) {
        return { compatible: false, reason: 'Hybrid direct expansion requires flow throttling.' };
      }
      if (!isHybridClass && !isBypass) {
        return { compatible: false, reason: 'Bypass conduit required for capillary-less pure evaporative.' };
      }
    }

    // B. Cabinet Boundary Constraint
    if (comp.category === 'Cabinet Material') {
      const is12 = cabinetSize === 12 && comp.id.includes('12');
      const is14 = cabinetSize === 14 && comp.id.includes('14');
      const is16 = cabinetSize === 16 && comp.id.includes('large');
      if (cabinetSize === 12 && !is12) return { compatible: false, reason: 'Casing structural layout configured only for 12" frame.' };
      if (cabinetSize === 14 && !is14) return { compatible: false, reason: 'Casing structural layout configured only for 14" frame.' };
      if (cabinetSize === 16 && !is16) return { compatible: false, reason: 'Casing structural layout configured only for 16" frame.' };
    }

    // C. Evaporator and Fans Alignment
    if (comp.category === 'Evaporator') {
      const isGasEx = comp.id.includes('dx-copper');
      const isHybridClass = coolerType === 'Hybrid Compressor-Assisted';
      if (isHybridClass && !isGasEx) {
        return { compatible: false, reason: 'Hybrid evaporator must be direct gas copper coils.' };
      }
      if (!isHybridClass && isGasEx) {
        return { compatible: false, reason: 'Evaporative mode relies on honeycomb cellulose wet pads.' };
      }
    }

    // D. Fan sizing allocation
    if (comp.category === 'Fans') {
      if (cabinetSize === 12 && comp.id.includes('16')) return { compatible: false, reason: '16" static blowers physically collide with 12" cabinet bounds.' };
      if (cabinetSize === 16 && comp.id.includes('12')) return { compatible: false, reason: '12" fan airflow is mathematically insufficient for 16" system static load.' };
    }

    // E. Controller and EEV constraints
    if (comp.category === 'Expansion Device' && comp.id === 'exp-carel-e2v') {
      const isNordic = selectedComponents['Controller'] === 'ctrl-nordic-smart';
      if (!isNordic) {
        return { compatible: false, reason: 'Stepping electronic valves require Cortex embedded smart relays.' };
      }
    }

    return { compatible: true };
  };

  // Real-time calculated checklist of design validation rules
  const activeCompatibilityWarnings = useMemo(() => {
    const warnings: string[] = [];
    const compId = selectedComponents['Compressor'];
    const condId = selectedComponents['Condenser'];
    const evapId = selectedComponents['Evaporator'];
    const fanId = selectedComponents['Fans'];
    const expId = selectedComponents['Expansion Device'];
    const ctrlId = selectedComponents['Controller'];
    const sensId = selectedComponents['Sensors'];

    const compressor = ALL_COMPONENTS.find(c => c.id === compId);
    const condenser = ALL_COMPONENTS.find(c => c.id === condId);
    const evaporator = ALL_COMPONENTS.find(c => c.id === evapId);
    const fan = ALL_COMPONENTS.find(c => c.id === fanId);
    const expander = ALL_COMPONENTS.find(c => c.id === expId);
    const controller = ALL_COMPONENTS.find(c => c.id === ctrlId);
    const sensor = ALL_COMPONENTS.find(c => c.id === sensId);

    // 1. Airflow insufficiency
    if (fan) {
      const airflowStr = fan.specs['Airflow Output'] || '0 CFM';
      const airflow = parseInt(airflowStr.replace(/[^0-9]/g, '')) || 0;
      if (coolingCapacity === '2.0 Ton' && airflow < 1500) {
        warnings.push('⚠ Airflow is insufficient: 2.0 Ton cooling capacity requires at least 1500 CFM fan delivery.');
      }
      if (condenser && condenser.id === 'cond-copper-dual' && airflow < 1200) {
        warnings.push('⚠ High drag warning: Dual-row copper outer condenser coil induces backpressure requiring 1200+ CFM blades.');
      }
    }

    // 2. Controller sensor mapping
    if (controller && sensor) {
      if (controller.id === 'ctrl-mppt-250w' && sensor.id === 'sens-ultra-level') {
        warnings.push('⚠ Protocol mismatch: Analogue MPPT board lacks high-frequency acoustic transceiver pins for Ultrasonic sensor.');
      }
    }

    // 3. Refrigerant compatibility mismatch
    if (compressor && expander) {
      const compRef = compressor.specs['Refrigerant'] || 'None';
      const expRef = expander.specs['Refrigerant'] || 'None';
      if (compRef !== 'None' && expRef !== 'None' && compRef !== 'Universal' && expRef !== 'Universal' && !compRef.includes(expRef) && !expRef.includes(compRef)) {
        warnings.push(`⚠ Thermal cycle fault: Compressor is running ${compRef} while expansion throttling is calibrated for ${expRef}.`);
      }
    }

    // 4. Overpowered compressor for small solar panels
    if (compressor) {
      const powerStr = compressor.specs['Rated Power'] || '0 Watts';
      const power = parseInt(powerStr.replace(/[^0-9]/g, '')) || 0;
      if (panelWattage > 0 && power > panelWattage * (irradiancePercent / 100)) {
        warnings.push(`⚠ Energy deficit: Configured compressor load (${power}W) exceeds localized active photovoltaic throughput (${Math.round(panelWattage * (irradiancePercent / 100))}W).`);
      }
    }

    // 5. Compressor Capacity Lower Than Design Required
    if (compressor && compressor.id !== 'comp-bypass') {
      const capStr = compressor.specs['Cooling Capacity'] || '0.0 Ton';
      const compCap = parseFloat(capStr.split(' ')[0]) || 0;
      const sysCap = parseFloat(coolingCapacity.split(' ')[0]) || 0;
      if (compCap < sysCap - 0.2) {
        warnings.push(`⚠ Thermal undersize: Selected compressor capacity (${compCap} Ton) falls lower than calculated required system load (${sysCap} Ton).`);
      }
    }

    return warnings;
  }, [selectedComponents, coolingCapacity, panelWattage, irradiancePercent]);

  // ---------------------------------------------------------
  // Expert Sizing Diagnostics & Engineering Recommendations
  // ---------------------------------------------------------
  const engineeringRecommendations = useMemo(() => {
    const recs: Record<string, { name: string; id: string; benefit: string }> = {};

    // 1. Compressor Recommendation
    if (coolerType === 'Hybrid Compressor-Assisted') {
      if (coolingCapacity === '2.0 Ton') {
        recs['Compressor'] = {
          name: 'Emerson Copeland Scroll ZP31K5E Rotary',
          id: 'comp-emerson-zp31k5e',
          benefit: 'Delivers 2.2 Ton displacement required to meet high-volume design boundaries.'
        };
      } else if (coolingCapacity === '1.5 Ton') {
        recs['Compressor'] = {
          name: 'Highly Rotary Twin-Cylinder BLDC',
          id: 'comp-highly-dc48',
          benefit: '48V native DC compressor removing inverter power convert loops.'
        };
      } else {
        recs['Compressor'] = {
          name: 'Danfoss SC15G Hermetic Reciprocating',
          id: 'comp-danfoss-sc15g',
          benefit: 'Optimized budget balance with high temperature reliability.'
        };
      }
    } else {
      recs['Compressor'] = {
        name: 'Compressor Bypass Conduit Node',
        id: 'comp-bypass',
        benefit: 'Correct zero-loss passive conduit for pure evaporative air streams.'
      };
    }

    // 2. Fan Recommendation
    if (cabinetSize === 16) {
      recs['Fans'] = {
        name: 'Sanyo Denki Silent 16" Magnetic Aero Fan',
        id: 'fan-sanyo-silent',
        benefit: 'Combines 2350 CFM throughput with ultra quiet magnetic levitation bearings.'
      };
    } else if (cabinetSize === 14) {
      recs['Fans'] = {
        name: 'Delta 14" Aerofoil Sweep DC Axial',
        id: 'fan-axial-14',
        benefit: 'Excellent static matching for medium air-drag configurations.'
      };
    } else {
      recs['Fans'] = {
        name: 'Delta 12" High-Velocity DC Axial (40W)',
        id: 'fan-axial-12',
        benefit: 'Sealed IP68 dust-proof fan engineered for 12" casings.'
      };
    }

    // 3. Controller Recommendation
    const hasSmartSensors = selectedComponents['Sensors'] === 'sens-ultra-level' || selectedComponents['Expansion Device'] === 'exp-carel-e2v';
    if (hasSmartSensors || cabinetSize === 16) {
      recs['Controller'] = {
        name: 'Nordic Semiconductor Smart BT Adaptive Controller',
        id: 'ctrl-nordic-smart',
        benefit: 'Provides PWM telemetry logic and stepper ports for active electronic expanders.'
      };
    } else {
      recs['Controller'] = {
        name: 'Zazen Solar-Direct MPPT Hub Controller',
        id: 'ctrl-mppt-250w',
        benefit: 'Simple, direct standard tracker matching minor DC power grids.'
      };
    }

    // 4. Condenser Recommendation
    if (coolerType === 'Hybrid Compressor-Assisted') {
      if (coolingCapacity === '2.0 Ton' || coolingCapacity === '1.5 Ton') {
        recs['Condenser'] = {
          name: 'Carrier Dual-Row Inner-Grooved Copper Condenser',
          id: 'cond-copper-dual',
          benefit: 'Dual rows enable sufficient heat reject efficiency matching continuous scroll output.'
        };
      } else {
        recs['Condenser'] = {
          name: 'SubZero Aluminium Microchannel Condenser',
          id: 'cond-alu-micro',
          benefit: 'Parallel flow and low volume profile suits single reciprocating runs.'
        };
      }
    } else {
      recs['Condenser'] = {
        name: 'Condenser Bypass Loop Fitting',
        id: 'cond-bypass',
        benefit: 'Bypasses plumbing to avoid mechanical fluid drag.'
      };
    }

    return recs;
  }, [coolerType, coolingCapacity, cabinetSize, selectedComponents]);

  // Apply advice suggestions directly to active set
  const handleAdoptRecommendation = (cat: string, id: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [cat]: id
    }));
  };

  const handleAdoptAllRecommendations = () => {
    setSelectedComponents(prev => {
      const next = { ...prev };
      Object.entries(engineeringRecommendations).forEach(([cat, val]) => {
        const rec = val as { name: string; id: string; benefit: string };
        next[cat] = rec.id;
      });
      return next;
    });
  };

  // ---------------------------------------------------------
  // Catalog Search Table Filtering
  // ---------------------------------------------------------
  const filteredCatalogItems = useMemo(() => {
    return ALL_COMPONENTS.filter(item => {
      // Must match active category browsing
      if (item.category !== activeCategory) return false;

      // Compatibility toggle filter
      if (filterOnlyCompatible) {
        const { compatible } = checkCompatibility(item);
        if (!compatible) return false;
      }

      // Brand Filter
      if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) return false;

      // Voltage Filter
      if (selectedVoltage !== 'ALL') {
        const itemVolt = item.voltage.toUpperCase();
        if (selectedVoltage === 'DC' && !itemVolt.includes('DC')) return false;
        if (selectedVoltage === 'AC' && !itemVolt.includes('AC')) return false;
        if (selectedVoltage === 'NONE' && itemVolt !== 'NONE') return false;
      }

      // Availability Filter
      if (selectedAvailability !== 'ALL' && item.availability !== selectedAvailability) return false;

      // Search matching Part ID, Model Name, specifications, brand keywords
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesBrand = item.brand.toLowerCase().includes(query);
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesPartNum = item.partNumber.toLowerCase().includes(query);
        const matchesSpecs = Object.entries(item.specs).some(([v]) => v.toLowerCase().includes(query));
        if (!matchesBrand && !matchesName && !matchesPartNum && !matchesSpecs) return false;
      }

      return true;
    });
  }, [activeCategory, filterOnlyCompatible, selectedBrand, selectedVoltage, selectedAvailability, searchQuery, coolerType, cabinetSize, insulationThickness, coolingCapacity, selectedComponents]);

  // Sourced brands matching current subsystem category to populate filter
  const categoryBrands = useMemo(() => {
    const brands = new Set<string>();
    ALL_COMPONENTS.forEach(item => {
      if (item.category === activeCategory) {
        brands.add(item.brand);
      }
    });
    return Array.from(brands);
  }, [activeCategory]);

  // ---------------------------------------------------------
  // Pricing/BOM Calculation Engine
  // ---------------------------------------------------------
  const activeBOMWithPrices = useMemo(() => {
    const itemsList = CATEGORIES.map(cat => {
      const id = selectedComponents[cat];
      const comp = ALL_COMPONENTS.find(c => c.id === id);
      if (!comp) return null;

      const userQty = componentQuantities[comp.id];
      const qty = userQty !== undefined ? userQty : 1;
      const unitCost = comp.price;
      const totalCost = unitCost * qty;
      const baseNote = comp.notes;
      const finalNote = customBOMNotes[comp.id] !== undefined ? customBOMNotes[comp.id] : baseNote;

      return {
        ...comp,
        qty,
        unitCost,
        totalCost,
        finalNote
      };
    }).filter(Boolean) as Array<ComponentItem & { qty: number; unitCost: number; totalCost: number; finalNote: string }>;

    const rawMaterialsTotal = itemsList.reduce((sum, item) => sum + item.totalCost, 0);
    const taxesAndTariffs = Math.round(rawMaterialsTotal * (markupRate / 100));
    const totalCOGS = rawMaterialsTotal + taxesAndTariffs;

    const marginMSRPMultiplier = 1 / (1 - targetMarginPercent / 100);
    const suggestedMSRP = Math.round(totalCOGS * marginMSRPMultiplier);
    const estimatedGrossProfit = suggestedMSRP - totalCOGS;

    const categoryProportions = itemsList.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.totalCost;
      return acc;
    }, {});

    return {
      itemsList,
      rawMaterialsTotal,
      taxesAndTariffs,
      totalCOGS,
      suggestedMSRP,
      estimatedGrossProfit,
      categoryProportions
    };
  }, [selectedComponents, componentQuantities, customBOMNotes, markupRate, targetMarginPercent]);

  // Render chart color slices
  const categoryPalette: Record<string, string> = {
    'Compressor': '#3b82f6',
    'Condenser': '#ef4444',
    'Evaporator': '#10b981',
    'Expansion Device': '#f59e0b',
    'Fans': '#06b6d4',
    'Cabinet Material': '#8b5cf6',
    'Insulation': '#64748b',
    'Controller': '#ec4899',
    'Sensors': '#a855f7',
    'Lighting': '#14b8a6',
    'Electrical Components': '#f97316',
    'Accessories': '#10b981'
  };

  const pieChartData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const value = activeBOMWithPrices.categoryProportions[cat] || 0;
      return {
        name: cat,
        value,
        color: categoryPalette[cat] || '#cbcbcb'
      };
    }).filter(i => i.value > 0);
  }, [activeBOMWithPrices]);

  // Adjust quantities of item mounts
  const adjustQuantity = (id: string, action: 'inc' | 'dec') => {
    const currentQty = componentQuantities[id] !== undefined ? componentQuantities[id] : 1;
    let nextQty = action === 'inc' ? currentQty + 1 : currentQty - 1;
    if (nextQty < 1) nextQty = 1;
    setComponentQuantities(prev => ({
      ...prev,
      [id]: nextQty
    }));
  };

  const updateEngineeringNote = (id: string, text: string) => {
    setCustomBOMNotes(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const handleSelectComponent = (category: string, id: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: id
    }));
  };

  // ---------------------------------------------------------
  // Technical Blueprint & Interactive Vector Visualizer
  // ---------------------------------------------------------
  const renderSVGBlueprint = (comp: ComponentItem) => {
    const baseWidth = 140;
    const baseHeight = 100;
    
    // Custom vector parameters based on dimension properties or SKU ID
    if (comp.category === 'Compressor') {
      const isBypass = comp.id.includes('bypass');
      if (isBypass) {
        return (
          <svg className="w-full h-full text-slate-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="10" y="10" width="140" height="100" strokeDasharray="3,3" rx="4" />
            <line x1="10" y1="10" x2="150" y2="110" />
            <line x1="150" y1="10" x2="10" y2="110" />
            <rect x="50" y="45" width="60" height="30" fill="#0f172a" stroke="currentColor" rx="2" />
            <text x="80" y="64" fill="currentColor" fontSize="8" fontFamily="monospace" textAnchor="middle" strokeWidth="0">BYPASS CONDUIT</text>
          </svg>
        );
      }
      return (
        <svg className="w-full h-full text-indigo-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Blueprint background grid */}
          <line x1="0" y1="60" x2="160" y2="60" stroke="#1e293b" strokeDasharray="2,2"/>
          {/* Main Reciprocating/Scroll Compressor Tank */}
          <rect x="45" y="25" width="70" height="70" rx="35" fill="#0f172a" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="80" cy="25" rx="35" ry="12" fill="#1e293b" stroke="currentColor" />
          {/* Copper pipe lines stubouts */}
          <path d="M40 45 L25 45 L25 35" stroke="currentColor" strokeWidth="2" />
          <path d="M120 55 L135 55 L135 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Base spring mounts */}
          <circle cx="50" cy="98" rx="5" ry="3" fill="currentColor" />
          <circle cx="110" cy="98" rx="5" ry="3" fill="currentColor" />
          <line x1="40" y1="104" x2="120" y2="104" stroke="currentColor" strokeWidth="2" />
          {/* Technical dimensions lines */}
          <line x1="45" y1="15" x2="115" y2="15" stroke="#475569" strokeDasharray="2,2" />
          <path d="M45 15 L50 12 M45 15 L50 18 M115 15 L110 12 M115 15 L110 18" stroke="#475569" />
          <text x="80" y="11" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle" strokeWidth="0">W: {comp.dimensions.split('x')[0] || '240'}mm</text>
          
          <line x1="145" y1="25" x2="145" y2="95" stroke="#475569" strokeDasharray="2,2" />
          <text x="156" y="62" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle" transform="rotate(90 156 62)" strokeWidth="0">H: {comp.dimensions.split('x')[2] || '210mm'}</text>
          
          <text x="80" y="65" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle" strokeWidth="0">COPELAND CORE</text>
        </svg>
      );
    }

    if (comp.category === 'Fans') {
      return (
        <svg className="w-full h-full text-cyan-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Outer Shroud Ring */}
          <circle cx="80" cy="60" r="45" stroke="currentColor" strokeWidth="1.5" fill="#0f172a" />
          <circle cx="80" cy="60" r="10" fill="#1e293b" stroke="currentColor" />
          {/* 4 Bracket Mount points */}
          <rect x="30" y="10" width="100" height="100" stroke="#334155" strokeDasharray="4,4" />
          <circle cx="30" cy="10" r="3" fill="currentColor" />
          <circle cx="130" cy="10" r="3" fill="currentColor" />
          <circle cx="30" cy="110" r="3" fill="currentColor" />
          <circle cx="130" cy="110" r="3" fill="currentColor" />
          {/* Rotor Blades */}
          <path d="M80 50 C75 30, 95 20, 85 15 C75 20, 78 35, 80 50 Z" fill="#0284c7" opacity="0.8"/>
          <path d="M80 70 C85 90, 65 100, 75 105 C85 100, 82 85, 80 70 Z" fill="#0284c7" opacity="0.8"/>
          <path d="M70 60 C50 65, 40 45, 35 55 C40 65, 55 62, 70 60 Z" fill="#0284c7" opacity="0.8"/>
          <path d="M90 60 C110 55, 120 75, 125 65 C120 55, 105 58, 90 60 Z" fill="#0284c7" opacity="0.8"/>
          
          <line x1="80" y1="5" x2="80" y2="115" stroke="#334155" strokeDasharray="1,2" />
          <text x="80" y="117" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle" strokeWidth="0">ROTATION VECTOR CW</text>
          <text x="80" y="63" fill="white" fontSize="6" fontFamily="monospace" textAnchor="middle" strokeWidth="0">BLDC</text>
        </svg>
      );
    }

    if (comp.category === 'Condenser' || comp.category === 'Evaporator') {
      const isCoil = comp.id.includes('copper') || comp.id.includes('dx');
      if (!isCoil) {
        // Resin Honeycomb Cellulose pad visual rendering
        return (
          <svg className="w-full h-full text-emerald-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="30" y="15" width="100" height="90" fill="#0f172a" stroke="currentColor" strokeWidth="1.5" />
            {/* Wavy cross flutes diagonal patterns */}
            <path d="M30 30 L130 50 M30 50 L130 70 M30 70 L130 90 M30 20 L130 40" stroke="#10b981" opacity="0.4" />
            <path d="M130 30 L30 50 M130 50 L30 70 M130 70 L30 90 M130 20 L30 40" stroke="#059669" opacity="0.4" />
            <text x="80" y="112" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle" strokeWidth="0">FLUTE WIDTH: 7mm</text>
            <text x="80" y="62" fill="white" fontSize="7" fontFamily="monospace" textAnchor="middle" strokeWidth="0">ECO-MEDIA PAPER</text>
          </svg>
        );
      }
      return (
        <svg className="w-full h-full text-rose-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Radiator aluminum frame */}
          <rect x="25" y="20" width="110" height="80" fill="#0f172a" stroke="#475569" rx="2" />
          {/* Wavy multi-circuits */}
          <path d="M 35,30 C 50,30 50,45 65,45 C 80,45 80,30 95,30 C 110,30 110,45 125,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M 35,55 C 50,55 50,70 65,70 C 80,70 80,55 95,55 C 110,55 110,70 125,70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M 35,80 C 50,80 50,95 65,95 C 80,95 80,80 95,80 C 110,80 110,95 125,95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* U-bends on sides */}
          <path d="M 125,45 C 130,45 130,55 125,55" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 35,55 C 30,55 30,80 35,80" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 125,70 C 130,70 130,80 125,80" stroke="currentColor" strokeWidth="1.5" />
          
          <text x="80" y="112" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle" strokeWidth="0">COPPER DUO CIRCUIT</text>
        </svg>
      );
    }

    // Default neat electronic/cabinet blueprint block
    return (
      <svg className="w-full h-full text-slate-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="35" y="25" width="90" height="70" rx="6" fill="#0f172a" stroke="currentColor" />
        <circle cx="80" cy="60" r="15" stroke="currentColor" strokeDasharray="2,2" />
        <line x1="35" y1="60" x2="125" y2="60" stroke="#334155" />
        <line x1="80" y1="25" x2="80" y2="95" stroke="#334155" />
        <text x="80" y="63" fill="currentColor" fontSize="7" fontFamily="monospace" textAnchor="middle" strokeWidth="0">{comp.brand.toUpperCase()}</text>
        <text x="80" y="112" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle" strokeWidth="0">SYS SKU // {comp.partNumber}</text>
      </svg>
    );
  };

  // ---------------------------------------------------------
  // Dynamic Simulation Curve SVG charts
  // ---------------------------------------------------------
  const renderSVGCurve = (comp: ComponentItem) => {
    if (comp.category === 'Compressor') {
      const isEco = comp.id.includes('nlx') || comp.id.includes('dc48');
      const peakCop = isEco ? 1.82 : 1.45;
      // High COP curve path (representing COP dropping as Outside Ambient Temp rises from 20°C to 50°C)
      return (
        <svg className="w-full h-44 bg-[#0a0f1d] p-2 border border-slate-800 rounded-lg text-[8px] font-mono" viewBox="0 0 200 120">
          <text x="100" y="12" fill="#94a3b8" fontSize="8" textAnchor="middle" strokeWidth="0">COP vs Outer Ambient Temp (°C)</text>
          {/* Axis markers */}
          <line x1="25" y1="25" x2="25" y2="105" stroke="#475569" />
          <line x1="25" y1="105" x2="190" y2="105" stroke="#475569" />
          
          {/* Grid lines */}
          <line x1="25" y1="50" x2="190" y2="50" stroke="#1e293b" strokeDasharray="1,1" />
          <line x1="25" y1="75" x2="190" y2="75" stroke="#1e293b" strokeDasharray="1,1" />
          <line x1="80" y1="25" x2="80" y2="105" stroke="#1e293b" strokeDasharray="1,1" />
          <line x1="135" y1="25" x2="135" y2="105" stroke="#1e293b" strokeDasharray="1,1" />

          {/* Labels */}
          <text x="15" y="30" fill="#64748b" textAnchor="end">COP {peakCop}</text>
          <text x="15" y="102" fill="#64748b" textAnchor="end">COP 0.5</text>
          <text x="25" y="115" fill="#64748b" textAnchor="middle">20°C</text>
          <text x="80" y="115" fill="#64748b" textAnchor="middle">35°C</text>
          <text x="135" y="115" fill="#64748b" textAnchor="middle">45°C</text>
          <text x="190" y="115" fill="#64748b" textAnchor="middle">55°C</text>

          {/* Interactive Plot Line Curve */}
          <path d="M 25,35 Q 90,55 190,95" fill="none" stroke="#22c55e" strokeWidth="2" />
          <circle cx="80" cy="51" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
          <text x="85" y="47" fill="#60a5fa" fontWeight="bold">Active Peak @ 35°C</text>
        </svg>
      );
    }

    if (comp.category === 'Fans') {
      const airflow = parseInt(comp.specs['Airflow Output'] || '1000') || 1000;
      return (
        <svg className="w-full h-44 bg-[#0a0f1d] p-2 border border-slate-800 rounded-lg text-[8px] font-mono" viewBox="0 0 200 120">
          <text x="100" y="12" fill="#94a3b8" fontSize="8" textAnchor="middle" strokeWidth="0">Static Pressure (Pa) vs Airflow (CFM)</text>
          <line x1="25" y1="25" x2="25" y2="105" stroke="#475569" />
          <line x1="25" y1="105" x2="190" y2="105" stroke="#475569" />

          <text x="15" y="30" fill="#64748b" textAnchor="end">320 Pa</text>
          <text x="15" y="102" fill="#64748b" textAnchor="end">0 Pa</text>
          
          <text x="25" y="115" fill="#64748b" textAnchor="middle">0</text>
          <text x="107" y="115" fill="#64748b" textAnchor="middle">{Math.round(airflow / 2)}</text>
          <text x="190" y="115" fill="#64748b" textAnchor="middle">{airflow}</text>

          {/* Fan curves generally slide downward as pressure resistance increases */}
          <path d="M 25,35 C 70,35 120,65 190,105" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="107" cy="57" r="3" fill="#ec4899" />
          <text x="114" y="55" fill="#f472b6">Selected Load Pt</text>
        </svg>
      );
    }

    // Default general catalog curve (Constant stability factor)
    return (
      <svg className="w-full h-44 bg-[#0a0f1d] p-2 border border-slate-800 rounded-lg text-[8px] font-mono" viewBox="0 0 200 120">
        <text x="100" y="12" fill="#94a3b8" fontSize="8" textAnchor="middle" strokeWidth="0">Thermal Efficiency Curve %</text>
        <line x1="25" y1="25" x2="25" y2="105" stroke="#475569" />
        <line x1="25" y1="105" x2="190" y2="105" stroke="#475569" />
        <text x="15" y="30" fill="#64748b" textAnchor="end">100%</text>
        <text x="15" y="102" fill="#64748b" textAnchor="end">0%</text>
        
        <path d="M 25,45 Q 100,30 190,55" fill="none" stroke="#a855f7" strokeWidth="2" />
        <text x="100" y="80" fill="#64748b" textAnchor="middle">Calibrated Stable Output Zone</text>
      </svg>
    );
  };

  // ---------------------------------------------------------
  // Printable Export or CSV Builder
  // ---------------------------------------------------------
  const handleExportBOM = (type: 'csv' | 'report') => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      if (type === 'csv') {
        const headers = ['Part Number', 'Manufacturer', 'Description', 'Specifications', 'Qty', 'Unit Cost', 'Total Cost', 'Engineering Notes'];
        const rows = activeBOMWithPrices.itemsList.map(item => [
          item.partNumber,
          item.brand,
          item.name,
          Object.entries(item.specs).map(([k,v]) => `${k}: ${v}`).join(' | '),
          item.qty,
          item.unitCost,
          item.totalCost,
          item.finalNote
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Cooler_BOM_Design_${activeCooler.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.print();
      }
    }, 1200);
  };

  return (
    <div id="bom-redesign-console" className="space-y-6">
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-xl text-white gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/10">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">CAD Integration Vault</span>
              <span className="text-[10px] text-slate-500 font-mono">SYS-ID: {activeCooler.id.toUpperCase()}</span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white mt-1">
              Industrial Cooler Component Configurator
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Thermal project workspace for active cooler module: <strong className="text-indigo-400">{activeCooler.name}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => handleExportBOM('csv')}
            disabled={exportingType !== null}
            className="bg-slate-905 hover:bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition disabled:opacity-50 hover:border-slate-700 font-bold"
          >
            {exportingType === 'csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
            Export CSV
          </button>
          <button
            onClick={() => handleExportBOM('report')}
            disabled={exportingType !== null}
            className="bg-indigo-650 hover:bg-indigo-600 font-mono text-xs text-white px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition disabled:opacity-50 font-bold shadow-md shadow-indigo-950/40"
          >
            {exportingType === 'report' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
            Print Spec Sheet
          </button>
        </div>
      </div>

      {/* SYSTEM DESIGN CONTRAINTS dails */}
      <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl shadow-sm">
        <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block mb-2">I. Operating Parameter Board (Sets Thermal Limits)</span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-slate-550 block">COOLING SYSTEM TYPE</span>
            <select
              value={coolerType}
              onChange={(e) => setCoolerType(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-slate-800 font-bold shadow-xs cursor-pointer focus:border-indigo-500 transition"
            >
              <option value="Pure Evaporative Direct">Pure Evaporative Direct</option>
              <option value="Indirect Evaporative">Indirect Evaporative</option>
              <option value="Hybrid Compressor-Assisted">Hybrid Compressor-Assisted</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-slate-550 block">CABINET CASING SIZE</span>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-slate-200 rounded-xl shadow-xs">
              {[12, 14, 16].map(size => {
                const isActive = size === cabinetSize;
                return (
                  <button
                    key={size}
                    onClick={() => setCabinetSize(size)}
                    className={`py-1.5 text-xs font-mono rounded-lg transition-all font-black cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    {size}"
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-slate-550 block">COOLING CAPACITY THRESHOLD</span>
            <select
              value={coolingCapacity}
              onChange={(e) => setCoolingCapacity(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-slate-800 font-bold shadow-xs cursor-pointer focus:border-indigo-500 transition"
            >
              <option value="1.0 Ton">Portable 1.0 Ton Class</option>
              <option value="1.5 Ton">Desert 1.5 Ton Class</option>
              <option value="2.0 Ton">Commercial 2.0 Ton Class</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-slate-550 block">INSULATION FOAM DEPTH</span>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-slate-200 rounded-xl shadow-xs">
              {['10mm', '20mm', '30mm'].map(depth => {
                const isActive = depth === insulationThickness;
                return (
                  <button
                    key={depth}
                    onClick={() => setInsulationThickness(depth)}
                    className={`py-1.5 text-xs font-mono rounded-lg transition-all font-black cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                  >
                    {depth}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* INTELLIGENT RECOMMENDATION & SAFETY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* COMPATIBILITY ALERTS PANEL (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h4 className="text-[11px] font-mono font-black uppercase text-slate-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Live Thermal & Electrical Safety Checks
              </h4>
              <span className="text-[9px] font-mono text-slate-400">Total Warnings: {activeCompatibilityWarnings.length}</span>
            </div>

            <div className="space-y-2.5 scrollbar-thin max-h-[160px] overflow-y-auto pr-1">
              {activeCompatibilityWarnings.length === 0 ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-mono flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold uppercase text-[9.5px]">System Integrity Secure</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">All configured mount dimensions, volt lines, and sensor protocols are 100% compatible with project demands.</p>
                  </div>
                </div>
              ) : (
                activeCompatibilityWarnings.map((warn, index) => (
                  <div key={index} className="p-3 bg-rose-50/70 border border-rose-150 rounded-xl text-rose-900 text-xs font-mono flex items-start gap-2.5 leading-snug">
                    <span className="text-rose-500 flex-shrink-0 text-base leading-none">⚠</span>
                    <span className="text-[10.5px] font-medium">{warn}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {activeCompatibilityWarnings.length > 0 && (
            <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Resolutions: Switch to matching parts or adopt scientific recommendations.</span>
              <button
                onClick={handleAdoptAllRecommendations}
                className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3 h-3 text-indigo-400" />
                AUTO-ADOPT COMPATIBLE SET
              </button>
            </div>
          )}
        </div>

        {/* ENGINEERING SYSTEM RECOMMENDATIONS (col-span-5) */}
        <div className="lg:col-span-5 bg-slate-950 text-white border border-slate-900 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <h4 className="text-[11px] font-mono font-black uppercase text-indigo-400 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Engineering Expert Recommendations
              </h4>
              <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/15">CALCULATED DATA</span>
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
              {Object.entries(engineeringRecommendations).map(([cat, val]) => {
                const rec = val as { name: string; id: string; benefit: string };
                const isSelected = selectedComponents[cat] === rec.id;
                return (
                  <div key={cat} className="text-xs font-mono flex items-start justify-between gap-3 bg-slate-900/60 p-2 border border-slate-900 rounded-xl hover:border-indigo-950 transition">
                    <div className="min-w-0">
                      <span className="text-[8px] text-slate-500 uppercase block leading-none">{cat}:</span>
                      <strong className="text-slate-200 mt-0.5 block truncate text-[11px]">{rec.name}</strong>
                      <span className="text-[9px] text-slate-400 block leading-tight mt-0.5 font-normal">{rec.benefit}</span>
                    </div>
                    {isSelected ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black flex-shrink-0">Adopted</span>
                    ) : (
                      <button
                        onClick={() => handleAdoptRecommendation(cat, rec.id)}
                        className="bg-indigo-650 hover:bg-indigo-600 text-white text-[9px] font-black px-2 py-1 rounded-lg transition-all cursor-pointer flex-shrink-0"
                      >
                        Adopt
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CORE 3-COLUMN CONFIGURATOR CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMN 1: CATEGORY CONSOLE SELECTOR (col-span-3) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-3 rounded-2xl space-y-2.5 shadow-xs">
          <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block px-1">II. Engineering Subsystems</span>
          <div className="space-y-1.5 scrollbar-thin">
            {CATEGORIES.map(cat => {
              const matchesActive = cat === activeCategory;
              const isSelected = selectedComponents[cat] !== undefined;
              const isBypassed = selectedComponents[cat]?.includes('bypass');
              const compObj = ALL_COMPONENTS.find(c => c.id === selectedComponents[cat]);

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition border text-xs flex items-center justify-between cursor-pointer ${
                    matchesActive
                      ? 'bg-slate-950 border-slate-900 text-white shadow-md font-semibold'
                      : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${
                      matchesActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cat === 'Compressor' && <Cpu className="w-3.5 h-3.5" />}
                      {cat === 'Condenser' && <Layers className="w-3.5 h-3.5" />}
                      {cat === 'Evaporator' && <Wind className="w-3.5 h-3.5" />}
                      {cat === 'Expansion Device' && <Sliders className="w-3.5 h-3.5" />}
                      {cat === 'Fans' && <Wind className="w-3.5 h-3.5" />}
                      {cat === 'Cabinet Material' && <Layers className="w-3.5 h-3.5" />}
                      {cat === 'Insulation' && <Layers className="w-3.5 h-3.5" />}
                      {cat === 'Controller' && <Cpu className="w-3.5 h-3.5" />}
                      {cat === 'Sensors' && <Sliders className="w-3.5 h-3.5" />}
                      {cat === 'Lighting' && <Sun className="w-3.5 h-3.5" />}
                      {cat === 'Electrical Components' && <Zap className="w-3.5 h-3.5" />}
                      {cat === 'Accessories' && <Sliders className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0 leading-none">
                      <p className="text-[10.5px] uppercase tracking-wider font-mono truncate">{cat}</p>
                      {compObj && (
                        <span className={`text-[9px] font-mono truncate block mt-0.5 max-w-[130px] font-semibold ${matchesActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                          {isBypassed ? 'Passive Bypass' : compObj.brand}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className={`p-0.5 rounded-full ${matchesActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-150'}`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: DIGIKEY-STYLE ENGINE CATALOG (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CATALOG FILTERS CONTROLS */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div>
                <span className="text-[8px] font-mono text-indigo-600 font-black uppercase tracking-widest block">BROWSE CATALOGUE</span>
                <h3 className="text-md font-black text-slate-900 tracking-tight">{activeCategory} Library</h3>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-slate-500 font-bold">Compatible Only</span>
                <input
                  type="checkbox"
                  checked={filterOnlyCompatible}
                  onChange={(e) => setFilterOnlyCompatible(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Seach Model / SKU..."
                  className="w-full text-xs font-mono font-medium pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition"
                />
              </div>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:border-indigo-500 hover:bg-slate-100 transition"
              >
                <option value="ALL">Filter Brand: ALL</option>
                {categoryBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={selectedVoltage}
                onChange={(e) => setSelectedVoltage(e.target.value)}
                className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:border-indigo-500 hover:bg-slate-100 transition"
              >
                <option value="ALL">Volt Level: ALL</option>
                <option value="DC">DC Input Native</option>
                <option value="AC">AC Input Native</option>
                <option value="NONE">Passive (No power required)</option>
              </select>

              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:border-indigo-500 hover:bg-slate-100 transition"
              >
                <option value="ALL">Delivery status: ALL</option>
                <option value="In Stock">In Stock (Dispatched 48h)</option>
                <option value="Low Stock">Low Stock Limits</option>
                <option value="Backorder">Direct Factory procurement</option>
              </select>
            </div>
            
            <div className="text-[9px] font-mono text-slate-400 flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
              <span>Catalog size: {filteredCatalogItems.length} matching models</span>
              {filterOnlyCompatible && <span className="text-emerald-600 font-bold">✓ Direct filter for compatible sizes</span>}
            </div>
          </div>

          {/* COMPONENT CARDS SCROLL LIST */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
            {filteredCatalogItems.map(item => {
              const isSelected = selectedComponents[item.category] === item.id;
              const matchesActiveExplore = currentExplorerItem && currentExplorerItem.id === item.id;
              const specPreviewKeys = Object.keys(item.specs).slice(0, 3);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setExplorerDetailId(item.id);
                  }}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
                    isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : matchesActiveExplore ? 'border-indigo-400 bg-indigo-50/5' : 'border-slate-200'
                  }`}
                >
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase">
                          {item.brand}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.availability === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-110' :
                          item.availability === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-110' :
                          'bg-rose-50 text-rose-700 border border-rose-110'
                        }`}>
                          {item.availability}
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-xs text-slate-950 leading-snug truncate mt-1">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        SKU: {item.partNumber}
                      </p>
                      <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-relaxed pt-0.5">
                        {item.shortDesc}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2 border border-slate-100">
                      {specPreviewKeys.map(k => (
                        <div key={k} className="text-[9px] font-mono text-center overflow-hidden">
                          <span className="text-slate-400 uppercase text-[7.5px] block truncate">{k}</span>
                          <span className="text-slate-800 font-black block mt-0.5 truncate">{item.specs[k]}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-slate-400 font-mono block">SOURCED ESTIMATE</span>
                        <span className="text-xs font-black font-mono text-slate-950">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setExplorerDetailId(item.id);
                            setSpecTab('DATASHEET');
                          }}
                          className="p-1.5 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-lg transition"
                          title="View Spec Blueprint"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSelectComponent(item.category, item.id)}
                          className={`px-3 py-1.5 text-[9.5px] font-black font-mono rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          {isSelected ? '✓ Mount Locked' : 'Mount to active slot'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: MOUSER-STYLE DETAILED SPECIFICATION DESK (col-span-4) */}
        <div className="lg:col-span-4">
          <div className="bg-slate-950 text-white border border-slate-900 rounded-2xl overflow-hidden shadow-xl space-y-4">
            
            {/* Spec Desk Header */}
            <div className="p-4 border-b border-slate-900 bg-slate-910 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest block">DIGIKEY MASTER SPEC</span>
                <h4 className="text-xs font-mono font-black text-slate-100 truncate max-w-[200px]">{currentExplorerItem.partNumber}</h4>
              </div>
              <span className="text-[9px] bg-slate-900 text-slate-400 font-mono border border-slate-800 px-2.5 py-0.5 rounded">{currentExplorerItem.category}</span>
            </div>

            {/* SVG Visual Stage */}
            <div className="px-4">
              <div className="w-full h-40 bg-[#070b13] border border-slate-850 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-3">
                <div className="absolute top-2 left-2 text-[7px] font-mono text-slate-500 tracking-wider">
                  BLUEPRINT CORE-GRID // SEC-A-1
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  {specTab === 'BLUEPRINT' ? renderSVGBlueprint(currentExplorerItem) : specTab === 'CURVE' ? renderSVGCurve(currentExplorerItem) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-4xl filter drop-shadow-[0_4px_12px_rgba(33,150,243,0.3)] mb-2">
                        {currentExplorerItem.category === 'Compressor' ? '🥫' : 
                         currentExplorerItem.category === 'Condenser' ? '🧬' :
                         currentExplorerItem.category === 'Evaporator' ? '💦' :
                         currentExplorerItem.category === 'Expansion Device' ? '⚙️' :
                         currentExplorerItem.category === 'Fans' ? '🌪️' :
                         currentExplorerItem.category === 'Cabinet Material' ? '📦' :
                         currentExplorerItem.category === 'Insulation' ? '🧱' :
                         currentExplorerItem.category === 'Controller' ? '🛡️' :
                         currentExplorerItem.category === 'Sensors' ? '🌡️' :
                         currentExplorerItem.category === 'Lighting' ? '💡' :
                         currentExplorerItem.category === 'Electrical Components' ? '🔌' : '⚙️'}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{currentExplorerItem.name}</span>
                      <span className="text-[8px] font-mono text-slate-500 mt-0.5">{currentExplorerItem.brand} Standard Catalog</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TAB SELECTORS */}
            <div className="px-4">
              <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 border border-slate-850 rounded-xl">
                {(['DATASHEET', 'CURVE', 'BLUEPRINT'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSpecTab(tab)}
                    className={`py-1.5 text-[9px] font-mono rounded-lg transition-all font-black cursor-pointer ${specTab === tab ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="px-4 pb-4 space-y-4">
              {specTab === 'DATASHEET' && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <strong className="text-xs text-slate-100 block">{currentExplorerItem.brand} Model {currentExplorerItem.name.split(' ').slice(-2).join(' ')}</strong>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-mono">{currentExplorerItem.shortDesc}</p>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-widest border-b border-indigo-950 pb-0.5 mb-1.5">SPECIFICATIONS SENSORY DATA</span>
                    <div className="space-y-1.5 scrollbar-thin max-h-[140px] overflow-y-auto">
                      {Object.entries(currentExplorerItem.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                          <span className="text-slate-500 capitalize text-[9px]">{key}:</span>
                          <span className="text-slate-200 font-bold text-[9.5px] text-right truncate max-w-[150px]">{value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                        <span className="text-slate-500 uppercase text-[9px]">Material Matrix:</span>
                        <span className="text-slate-200 font-bold text-[9.5px] text-right truncate max-w-[150px]">{currentExplorerItem.material}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                        <span className="text-slate-500 uppercase text-[9px]">Continuous Draw:</span>
                        <span className="text-slate-200 font-bold text-[9.5px] text-right">{currentExplorerItem.powerConsumption}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-slate-900 pb-1">
                        <span className="text-slate-500 uppercase text-[9px]">Enclosure Metric:</span>
                        <span className="text-slate-200 font-bold text-[9.5px] text-right">{currentExplorerItem.dimensions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {specTab === 'CURVE' && (
                <div className="space-y-2">
                  <strong className="text-xs text-slate-100 block">Mechanical Modeling Curve</strong>
                  <p className="text-[10px] text-slate-400 leading-normal font-mono">
                    Mathematical simulated behaviour mapping efficiency, heat coefficient, or airflow drops across standard pressure points.
                  </p>
                </div>
              )}

              {specTab === 'BLUEPRINT' && (
                <div className="space-y-2">
                  <strong className="text-xs text-slate-100 block">CAD Orthographic Wireframe</strong>
                  <p className="text-[10px] text-slate-400 leading-normal font-mono">
                    Dimensional standard schematic for sizing validation. Clearance tolerence values: +/- 0.5mm. Labeled for thermal shell mounts.
                  </p>
                </div>
              )}

              <div className="p-3 bg-indigo-950/20 border border-indigo-950/40 rounded-xl space-y-1 text-[10px] font-mono text-indigo-300">
                <span className="uppercase text-[8px] font-extrabold tracking-widest text-indigo-400">RECOMMENDED INTEGRATION SCENARIO</span>
                <p>{currentExplorerItem.recommendedApp}</p>
              </div>

              {/* ACTION: INSTANT CONFIG SELECTION */}
              <div className="pt-2 flex gap-2">
                {selectedComponents[currentExplorerItem.category] === currentExplorerItem.id ? (
                  <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2.5 rounded-xl text-center text-xs font-mono font-black">
                    ✓ Mounted in design sheet
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectComponent(currentExplorerItem.category, currentExplorerItem.id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center transition active:scale-95"
                  >
                    Lock Mount Model
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* FOOTER: CAD UNIFIED BILL OF MATERIALS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5">
        
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <span className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-widest block">III. Engineering Procurement Sheets</span>
            <h4 className="text-md font-black text-slate-900 tracking-tight">Active Sourced Bill of Materials</h4>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <div>
              <span>GST Tariff rate:</span>
              <input
                type="number"
                min="0"
                max="50"
                value={markupRate}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setMarkupRate(isNaN(v) ? 0 : v);
                }}
                className="w-10 bg-slate-50 border border-slate-200 text-center font-bold font-mono rounded-lg text-xs py-1 inline-block ml-1.5 outline-none focus:border-indigo-500 text-slate-850"
              />
              <span className="ml-0.5">%</span>
            </div>

            <div>
              <span>Target Gross Margin:</span>
              <input
                type="number"
                min="5"
                max="80"
                value={targetMarginPercent}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setTargetMarginPercent(isNaN(v) ? 10 : v);
                }}
                className="w-10 bg-slate-50 border border-slate-200 text-center font-bold font-mono rounded-lg text-xs py-1 inline-block ml-1.5 outline-none focus:border-indigo-500 text-slate-850"
              />
              <span className="ml-0.5">%</span>
            </div>
          </div>
        </div>

        {/* PHYSICAL BOM SPREADSHEET TABLE */}
        <div className="overflow-x-auto border border-slate-150 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-155 uppercase text-[9px] tracking-wider">
                <th className="p-3">Part Number</th>
                <th className="p-3">Manufacturer</th>
                <th className="p-3">Selected Model Description</th>
                <th className="p-3">Core Performance Specs</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Sourced (₹)</th>
                <th className="p-3 text-right">Total (₹)</th>
                <th className="p-3 w-44">Thermal & Assembly Design Notes</th>
              </tr>
            </thead>
            <tbody>
              {activeBOMWithPrices.itemsList.map(item => {
                const isBypass = item.id.includes('bypass') || item.id.includes('not-needed');
                const specKeysAndVals = Object.entries(item.specs).slice(0, 3);
                
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="p-3 font-semibold text-indigo-600 truncate max-w-[120px]">{item.partNumber}</td>
                    <td className="p-3 font-bold text-slate-800">{item.brand}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-extrabold text-[12px] text-slate-900 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[240px]">{item.shortDesc}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        {specKeysAndVals.map(([k,v]) => (
                          <div key={k} className="flex gap-1.5">
                            <span className="text-slate-400 capitalize">{k}:</span>
                            <span className="font-semibold text-slate-700">{v}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isBypass && item.price > 0 && (
                          <button
                            onClick={() => adjustQuantity(item.id, 'dec')}
                            className="p-1 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        )}
                        <span className="text-xs font-black min-w-[12px] text-center text-slate-800">
                          {item.qty}
                        </span>
                        {!isBypass && item.price > 0 && (
                          <button
                            onClick={() => adjustQuantity(item.id, 'inc')}
                            className="p-1 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-black text-slate-800">
                      ₹{item.unitCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-black text-indigo-650">
                      ₹{item.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.finalNote}
                        onChange={(e) => updateEngineeringNote(item.id, e.target.value)}
                        placeholder="Add torques, charging tags..."
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white focus:border-indigo-500 outline-none text-[10px] p-1.5 rounded-lg transition"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* COST MATHEMATICS ACCOUNTING BAR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch bg-slate-950 p-5 rounded-2xl text-white">
          
          <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900 pb-3 md:pb-0 pr-0 md:pr-4">
            <div>
              <span className="text-[8px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest block">COST STRUCTURE RADAR</span>
              <h5 className="text-md font-extrabold text-slate-200 mt-1 leading-tight">Design Materials Share</h5>
            </div>

            {pieChartData.length > 0 && (
              <div className="flex items-center gap-4 mt-3">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={28}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[7px] text-slate-500 uppercase">SUM</span>
                    <span className="text-[9px] font-black text-slate-200">₹{activeBOMWithPrices.rawMaterialsTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1 text-[8px] font-mono text-slate-400 max-h-[75px] overflow-y-auto scrollbar-thin">
                  {pieChartData.map((item, index) => {
                    const pct = Math.round((item.value / activeBOMWithPrices.rawMaterialsTotal) * 100);
                    return (
                      <div key={index} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate max-w-[120px]">{item.name} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pl-0 md:pl-2">
            <div className="bg-slate-900/50 p-3.5 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[8px] text-slate-500 uppercase font-black block">RAW SOURCED TOTAL</span>
              <span className="text-base font-black font-mono block text-slate-100">₹{activeBOMWithPrices.rawMaterialsTotal.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 block">Sourced hardware raw sum</span>
            </div>

            <div className="bg-slate-900/50 p-3.5 border border-slate-900 rounded-xl space-y-1">
              <span className="text-[8px] text-slate-500 uppercase font-black block">CONSOLIDATED PROD COGS</span>
              <span className="text-base font-black font-mono block text-indigo-400">₹{activeBOMWithPrices.totalCOGS.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-slate-500 block">Includes +{markupRate}% tariff/tariffs</span>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 p-3.5 border border-indigo-900/30 rounded-xl space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-[8px] text-indigo-400 uppercase font-black block">SUGGESTED SALE MSRP</span>
                <span className="text-lg font-black font-mono block text-emerald-400">₹{activeBOMWithPrices.suggestedMSRP.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[9.5px] font-semibold text-slate-400 block border-t border-slate-900/40 pt-1">
                Yields <strong className="text-emerald-400">₹{activeBOMWithPrices.estimatedGrossProfit.toLocaleString('en-IN')}</strong> gross profit ({targetMarginPercent}% margin)
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
