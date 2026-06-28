import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Layers,
  Zap,
  Sun,
  Search,
  Eye,
  Check,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  Printer,
  Loader2,
  Wrench,
  ThumbsUp,
  Battery,
  ShieldAlert,
  Sliders,
  IndianRupee,
  Activity,
  FileText,
  X,
  Play,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ComponentItem, CATEGORIES, CategoryType } from './BOMTypes';
import { ALL_COMPONENTS } from './BOMComponentData';
import { COOLER_MODELS } from '../utils/solarCalculations';

interface SizingBOMGeneratorProps {
  panelWattage: number;
  setPanelWattage?: (w: number) => void;
  activeCooler: {
    id: string;
    name: string;
    size: number;
    wattage: number;
  };
  setSelectedCoolerId?: (id: string) => void;
  mpptEnabled: boolean;
  setMpptEnabled?: (b: boolean) => void;
  irradiancePercent: number;
  setIrradiancePercent?: (p: number) => void;
}

const STEPS = [
  { id: 1, name: 'Cooler Configuration', desc: 'Select fan sweeps size and load specs' },
  { id: 2, name: 'Solar Module', desc: 'Select solar panel wattage and voltage' },
  { id: 3, name: 'Battery Pack', desc: 'Select battery nominal voltage and capacity' },
  { id: 4, name: 'Charge Controller', desc: 'Select solar charger and MPPT limits' },
  { id: 5, name: 'DC-DC Converter', desc: 'Select step-down or bypass regulator' },
  { id: 6, name: 'Motor Controller', desc: 'Select motor driver commutation gates' },
  { id: 7, name: 'Main Motor', desc: 'Select main blower DC motor load' },
  { id: 8, name: 'Water Pump', desc: 'Select evaporative water circulation pump' },
  { id: 9, name: 'Swing Motor', desc: 'Select directional louvre swing driver' },
  { id: 10, name: 'Sensors & Electronics', desc: 'Select telemetry and system modules' },
  { id: 11, name: 'Review Generated BOM', desc: 'Verify all selected parts, quantities and notes' },
  { id: 12, name: 'View Cost Summary', desc: 'Analyze total cost of goods, taxes and margins' }
];

export function SizingBOMGenerator({
  panelWattage,
  setPanelWattage,
  activeCooler,
  setSelectedCoolerId,
  mpptEnabled,
  setMpptEnabled,
  irradiancePercent,
  setIrradiancePercent
}: SizingBOMGeneratorProps) {
  // Current active step of the wizard (1-indexed)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Active sub-category filter for Step 10 (Sensors & Electronics)
  const [step10SubCat, setStep10SubCat] = useState<CategoryType>('Sensors');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL');
  const [filterOnlyCompatible, setFilterOnlyCompatible] = useState<boolean>(true);

  // Active Selected Components (Category -> Component ID)
  const [selectedComponents, setSelectedComponents] = useState<Record<CategoryType, string>>({
    'Solar Module': 'solar-renogy-100w',
    'Battery Pack': 'batt-lifepo4-12v-100',
    'Solar Charge Controller': 'scc-renogy-rover-30a',
    'DC-DC Converter': 'dcdc-not-needed',
    'Motor Controller': 'mctrl-brushed-12v-40a',
    'Main Motor': 'motor-brushed-12v-80w',
    'Water Pump': 'pump-dc-12v-5w',
    'Swing Motor': 'swing-servo-5v',
    'Sensors': 'sensor-sht31',
    'Controller PCB': 'pcb-esp32-wroom',
    'Protection Circuit': 'prot-fuse-block',
    'Connectors & Wiring': 'conn-xt60-pack'
  });

  // Numeric quantities (Component ID -> Qty)
  const [componentQuantities, setComponentQuantities] = useState<Record<string, number>>({});
  
  // Financial customization
  const [markupRate, setMarkupRate] = useState<number>(18); // Tariff / Local Tax %
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(30); // Target Gross Margin %

  // Custom engineering notes (Component ID -> Custom text)
  const [customBOMNotes, setCustomBOMNotes] = useState<Record<string, string>>({});

  // Active spec explorer detail ID for side-drawer
  const [explorerDetailId, setExplorerDetailId] = useState<string | null>(null);
  const [specTab, setSpecTab] = useState<'SPEC' | 'DIAGRAM'>('SPEC');
  const [exportingType, setExportingType] = useState<string | null>(null);

  // ---------------------------------------------------------
  // Synced Initialization based on Active Cooler
  // ---------------------------------------------------------
  useEffect(() => {
    if (activeCooler.size === 12) {
      setSelectedComponents({
        'Solar Module': 'solar-renogy-100w',
        'Battery Pack': 'batt-lifepo4-12v-100',
        'Solar Charge Controller': 'scc-renogy-rover-30a',
        'DC-DC Converter': 'dcdc-not-needed',
        'Motor Controller': 'mctrl-brushed-12v-40a',
        'Main Motor': 'motor-brushed-12v-80w',
        'Water Pump': 'pump-dc-12v-5w',
        'Swing Motor': 'swing-servo-5v',
        'Sensors': 'sensor-sht31',
        'Controller PCB': 'pcb-esp32-wroom',
        'Protection Circuit': 'prot-fuse-block',
        'Connectors & Wiring': 'conn-xt60-pack'
      });
    } else if (activeCooler.size === 14) {
      setSelectedComponents({
        'Solar Module': 'solar-renogy-200w',
        'Battery Pack': 'batt-lifepo4-24v-50',
        'Solar Charge Controller': 'scc-victron-smart-100-30',
        'DC-DC Converter': 'dcdc-buck-24v-12v-10a',
        'Motor Controller': 'mctrl-bldc-24v-20a',
        'Main Motor': 'motor-bldc-24v-150w',
        'Water Pump': 'pump-dc-24v-15w',
        'Swing Motor': 'swing-sync-12v',
        'Sensors': 'sensor-ina226',
        'Controller PCB': 'pcb-rp2040-pico',
        'Protection Circuit': 'prot-fuse-block',
        'Connectors & Wiring': 'conn-silicone-12awg'
      });
    } else {
      setSelectedComponents({
        'Solar Module': 'solar-sunpower-400w',
        'Battery Pack': 'batt-lifepo4-48v-50',
        'Solar Charge Controller': 'scc-victron-smart-150-45',
        'DC-DC Converter': 'dcdc-buck-48v-24v-15a',
        'Motor Controller': 'mctrl-bldc-48v-30a',
        'Main Motor': 'motor-bldc-48v-350w',
        'Water Pump': 'pump-dc-24v-15w',
        'Swing Motor': 'swing-stepper-12v',
        'Sensors': 'sensor-ina226',
        'Controller PCB': 'pcb-custom-esp32',
        'Protection Circuit': 'prot-mcb-dc-63a',
        'Connectors & Wiring': 'conn-xt90-pack'
      });
    }
  }, [activeCooler.size]);

  // ---------------------------------------------------------
  // Intelligent Auto-Resolver when Battery Pack Changes
  // ---------------------------------------------------------
  useEffect(() => {
    const batteryId = selectedComponents['Battery Pack'];
    const battery = ALL_COMPONENTS.find(c => c.id === batteryId);
    if (!battery) return;

    const battVolt = parseFloat(battery.electricalRatings.voltage) || 12;

    setSelectedComponents(prev => {
      const next = { ...prev };
      let changed = false;

      CATEGORIES.forEach(cat => {
        if (cat === 'Battery Pack') return;
        
        const currentId = prev[cat];
        const currentItem = ALL_COMPONENTS.find(c => c.id === currentId);
        if (!currentItem) return;

        let isCompatible = true;

        if (cat === 'Solar Charge Controller') {
          if (battVolt === 48 && currentId !== 'scc-victron-smart-150-45') isCompatible = false;
          if (battVolt === 24 && currentId === 'scc-generic-pwm-20a') isCompatible = false;
        }

        if (cat === 'Motor Controller') {
          if (battVolt === 48 && currentId !== 'mctrl-bldc-48v-30a') isCompatible = false;
          if (battVolt === 12 && currentId === 'mctrl-bldc-48v-30a') isCompatible = false;
        }

        if (cat === 'Main Motor') {
          const mVolt = parseFloat(currentItem.specs['Rated Voltage'] || currentItem.electricalRatings.voltage) || 12;
          if (battVolt !== mVolt) isCompatible = false;
        }

        if (cat === 'DC-DC Converter') {
          if (battVolt === 48 && currentId === 'dcdc-not-needed') isCompatible = false;
          if (battVolt === 24 && currentId === 'dcdc-buck-48v-24v-15a') isCompatible = false;
          if (battVolt === 12 && currentId.includes('buck-24v')) isCompatible = false;
        }

        if (!isCompatible) {
          const size = battVolt === 48 ? 16 : battVolt === 24 ? 14 : 12;
          const rec = getRecommendation(cat, size);
          if (rec.id && rec.id !== currentId) {
            next[cat] = rec.id;
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [selectedComponents['Battery Pack']]);

  // Determine Category for step
  const getCategoryForStep = (step: number): CategoryType | null => {
    if (step === 2) return 'Solar Module';
    if (step === 3) return 'Battery Pack';
    if (step === 4) return 'Solar Charge Controller';
    if (step === 5) return 'DC-DC Converter';
    if (step === 6) return 'Motor Controller';
    if (step === 7) return 'Main Motor';
    if (step === 8) return 'Water Pump';
    if (step === 9) return 'Swing Motor';
    if (step === 10) return step10SubCat;
    return null;
  };

  const activeCategory = useMemo(() => {
    return getCategoryForStep(activeStep) || 'Solar Module';
  }, [activeStep, step10SubCat]);

  // Get active selected components list
  const activeComponentsList = useMemo(() => {
    return CATEGORIES.map(cat => {
      const selectedId = selectedComponents[cat];
      return ALL_COMPONENTS.find(item => item.id === selectedId) || null;
    }).filter(Boolean) as ComponentItem[];
  }, [selectedComponents]);

  // ---------------------------------------------------------
  // Intelligent Compatibility & Recommendation Rules
  // ---------------------------------------------------------
  const checkCompatibility = (item: ComponentItem): { compatible: boolean; reason?: string } => {
    const currentBatteryId = selectedComponents['Battery Pack'];
    const currentBattery = ALL_COMPONENTS.find(c => c.id === currentBatteryId);
    
    const currentSccId = selectedComponents['Solar Charge Controller'];
    const currentScc = ALL_COMPONENTS.find(c => c.id === currentSccId);

    const currentMctrlId = selectedComponents['Motor Controller'];
    const currentMctrl = ALL_COMPONENTS.find(c => c.id === currentMctrlId);

    const currentMotorId = selectedComponents['Main Motor'];
    const currentMotor = ALL_COMPONENTS.find(c => c.id === currentMotorId);

    const battVolt = currentBattery ? parseFloat(currentBattery.electricalRatings.voltage) : 12;

    // SCC VS BATTERY VOLTAGE
    if (item.category === 'Solar Charge Controller') {
      if (battVolt === 48 && item.id !== 'scc-victron-smart-150-45') {
        return { compatible: false, reason: '48V battery systems require high-voltage charge controllers like Victron SmartSolar 150/45.' };
      }
      if (battVolt === 24 && item.id === 'scc-generic-pwm-20a') {
        return { compatible: false, reason: '24V charging requires stable MPPT tracking limits. PWM is unsafe for lithium at 24V.' };
      }
    }

    // SOLAR MODULE VS SCC VOC LIMITS
    if (item.category === 'Solar Module') {
      const voc = parseFloat(item.specs['Open-Circuit Voltage (Voc)'] || '0');
      if (currentScc && currentScc.id === 'scc-generic-pwm-20a' && voc > 30) {
        return { compatible: false, reason: `Panel Voc (${voc}V) exceeds PWM controller max limit (30V).` };
      }
    }

    // MOTOR CONTROLLER VS BATTERY VOLTAGE
    if (item.category === 'Motor Controller') {
      if (battVolt === 48 && item.id !== 'mctrl-bldc-48v-30a') {
        return { compatible: false, reason: '48V battery line exceeds voltage ratings of smaller motor drivers.' };
      }
      if (battVolt === 12 && item.id === 'mctrl-bldc-48v-30a') {
        return { compatible: false, reason: 'Kelly sinusoidal controller requires at least 24V nominal start voltage to boot.' };
      }
    }

    // MOTOR CONTROLLER VS MAIN MOTOR DRIVING TECH
    if (item.category === 'Main Motor') {
      const motorType = item.specs['Motor Type'] || '';
      const isBldcMotor = motorType.includes('Brushless') || motorType.includes('BLDC');
      
      if (currentMctrl) {
        const isBldcController = currentMctrl.specs['Motor Compatibility']?.includes('BLDC') || currentMctrl.id.includes('bldc');
        if (isBldcMotor && !isBldcController) {
          return { compatible: false, reason: 'BLDC motor requires a 3-phase BLDC controller. Brushed drivers cannot commute BLDC coils.' };
        }
        if (!isBldcMotor && isBldcController) {
          return { compatible: false, reason: 'Brushed motor is incompatible with BLDC controllers which require hall-sensor feedback loops.' };
        }
      }
    }

    // AUX PUMP / SWING MOTOR WITHOUT STEP DOWN
    if (item.category === 'DC-DC Converter') {
      if (battVolt === 48 && item.id === 'dcdc-not-needed') {
        return { compatible: false, reason: 'Running auxiliary 12V/24V pump or swing controls directly on 48V without step-down is an overvoltage hazard.' };
      }
      if (battVolt === 24 && item.id === 'dcdc-buck-48v-24v-15a') {
        return { compatible: false, reason: 'Step-down converter requires at least 30V input. Input is insufficient from 24V.' };
      }
      if (battVolt === 12 && item.id.includes('buck-24v')) {
        return { compatible: false, reason: 'Buck converter requires 24V nominal input. Input is insufficient from 12V.' };
      }
    }

    return { compatible: true };
  };

  // Live warning list
  const liveDiagnosticsWarnings = useMemo(() => {
    const warnings: string[] = [];

    const solar = activeComponentsList.find(c => c.category === 'Solar Module');
    const battery = activeComponentsList.find(c => c.category === 'Battery Pack');
    const scc = activeComponentsList.find(c => c.category === 'Solar Charge Controller');
    const dcdc = activeComponentsList.find(c => c.category === 'DC-DC Converter');
    const mctrl = activeComponentsList.find(c => c.category === 'Motor Controller');
    const motor = activeComponentsList.find(c => c.category === 'Main Motor');
    const pump = activeComponentsList.find(c => c.category === 'Water Pump');
    const swing = activeComponentsList.find(c => c.category === 'Swing Motor');

    const battVolt = battery ? parseFloat(battery.electricalRatings.voltage) : 12;

    if (solar && scc) {
      const voc = parseFloat(solar.specs['Open-Circuit Voltage (Voc)'] || '0');
      const maxVocLimit = scc.id === 'scc-generic-pwm-20a' ? 30 : scc.id.includes('150') ? 150 : 100;
      if (voc > maxVocLimit) {
        warnings.push(`⚠ Volt Leak: ${solar.name} Voc (${voc}V) exceeds ${scc.name} limit (${maxVocLimit}V).`);
      }
    }

    if (battery && mctrl) {
      if (battVolt === 48 && mctrl.id !== 'mctrl-bldc-48v-30a') {
        warnings.push(`⚠ Voltage Mismatch: ${mctrl.name} does not support 48V operating lines from ${battery.name}.`);
      }
      if (battVolt === 12 && mctrl.id === 'mctrl-bldc-48v-30a') {
        warnings.push(`⚠ Startup Lockout: ${mctrl.name} requires at least 24V to start internal logic gates.`);
      }
    }

    if (mctrl && motor) {
      const isMotorBldc = (motor.specs['Motor Type'] || '').includes('Brushless') || motor.id.includes('bldc');
      const isControllerBldc = (mctrl.specs['Motor Compatibility'] || '').includes('BLDC') || mctrl.id.includes('bldc');
      if (isMotorBldc && !isControllerBldc) {
        warnings.push(`⚠ Commutation Fault: Sinusoidal BLDC motor (${motor.name}) cannot be driven by brushed driver (${mctrl.name}).`);
      }
      if (!isMotorBldc && isControllerBldc) {
        warnings.push(`⚠ Commutation Fault: Brushed motor (${motor.name}) cannot match 3-phase BLDC controller (${mctrl.name}).`);
      }
    }

    if (battery && dcdc) {
      if (battVolt === 48 && dcdc.id === 'dcdc-not-needed') {
        warnings.push(`⚠ Overvoltage Hazard: 48V bus connected directly to auxiliary 12V/24V pump & swing motors with no step-down!`);
      }
      if (battVolt === 24 && dcdc.id === 'dcdc-not-needed' && (pump?.id.includes('12v') || swing?.id.includes('5v') || swing?.id.includes('12v'))) {
        warnings.push(`⚠ Overvoltage Risk: 12V auxiliary components are connected directly to 24V bus without a buck regulator.`);
      }
    }

    return warnings;
  }, [activeComponentsList]);

  // Dynamic recommendations mapper
  const getRecommendation = (category: CategoryType, size: number): { id: string; name: string; reason: string } => {
    if (size === 12) {
      if (category === 'Solar Module') return { id: 'solar-renogy-100w', name: 'Renogy 100W Panel', reason: 'Sufficient wattage for 60W loads and fits a 12V bus.' };
      if (category === 'Battery Pack') return { id: 'batt-lifepo4-12v-100', name: 'LiFePO4 12V 100Ah Pack', reason: 'High-density backup storage perfectly sized for 12V.' };
      if (category === 'Solar Charge Controller') return { id: 'scc-renogy-rover-30a', name: 'Renogy Rover 30A MPPT', reason: 'Maximum tracking efficiency for 12V/100W panels.' };
      if (category === 'DC-DC Converter') return { id: 'dcdc-not-needed', name: 'Direct System Bus (No Converter)', reason: 'No converter needed since auxiliary parts run directly on native 12V.' };
      if (category === 'Motor Controller') return { id: 'mctrl-brushed-12v-40a', name: 'Cytron Brushed 12V 40A', reason: 'Sturdy driver matching brushed Johnson Electric load.' };
      if (category === 'Main Motor') return { id: 'motor-brushed-12v-80w', name: 'Johnson Electric 12V 80W PMDC', reason: 'Cost-efficient brushed starting torque for 12" fans.' };
      if (category === 'Water Pump') return { id: 'pump-dc-12v-5w', name: 'JT-180 Brushless 12V Pump', reason: 'Minimal 4.8W consumption, perfect for smaller coolers.' };
      if (category === 'Swing Motor') return { id: 'swing-servo-5v', name: 'TowerPro MG996R 5V Servo', reason: 'High positioning torque for precise damper steering.' };
      if (category === 'Sensors') return { id: 'sensor-sht31', name: 'Sensirion SHT31-D', reason: 'Highly accurate relative temperature/humidity monitor.' };
      if (category === 'Controller PCB') return { id: 'pcb-esp32-wroom', name: 'Espressif ESP32-WROOM MCU', reason: 'Inexpensive dual-core brain with Wi-Fi & Bluetooth.' };
      if (category === 'Protection Circuit') return { id: 'prot-fuse-block', name: '6-Way Fuse Block', reason: 'Simple reliable over-current protection.' };
      if (category === 'Connectors & Wiring') return { id: 'conn-xt60-pack', name: 'XT60 High-Current Packs', reason: 'Standard reliable low resistance connections.' };
    } else if (size === 14) {
      if (category === 'Solar Module') return { id: 'solar-renogy-200w', name: 'Renogy 200W Panel', reason: 'Delivers optimal power throughput matching 110W cooler loads.' };
      if (category === 'Battery Pack') return { id: 'batt-lifepo4-24v-50', name: 'LiFePO4 24V 50Ah Pack', reason: 'Halves line current losses with stable 24V supply.' };
      if (category === 'Solar Charge Controller') return { id: 'scc-victron-smart-100-30', name: 'Victron SmartSolar 100/30', reason: 'Premium ultra-fast MPPT with Bluetooth telemetry.' };
      if (category === 'DC-DC Converter') return { id: 'dcdc-buck-24v-12v-10a', name: 'Daygreen 24V to 12V Buck', reason: 'Safely steps down 24V main bus to run 12V swing motor.' };
      if (category === 'Motor Controller') return { id: 'mctrl-bldc-24v-20a', name: 'JY01 BLDC Driver Board 20A', reason: 'Reliable sensorless BLDC speed commuter.' };
      if (category === 'Main Motor') return { id: 'motor-bldc-24v-150w', name: 'Golden Motor 24V 150W BLDC', reason: 'Quiet and highly efficient brushless ventilation.' };
      if (category === 'Water Pump') return { id: 'pump-dc-24v-15w', name: 'JT-550 High-Flow 24V Pump', reason: '1000 L/H capacity to saturate 14" cooling pads.' };
      if (category === 'Swing Motor') return { id: 'swing-sync-12v', name: 'Tyco 12V Synchronous Motor', reason: 'Spins continuously for automated louver sweep cycles.' };
      if (category === 'Sensors') return { id: 'sensor-ina226', name: 'INA226 Power Monitor', reason: 'Tracks precise voltage & current up to 15A over I2C.' };
      if (category === 'Controller PCB') return { id: 'pcb-rp2040-pico', name: 'Raspberry Pi Pico RP2040', reason: 'Stable multi-GPIO microcontroller board.' };
      if (category === 'Protection Circuit') return { id: 'prot-fuse-block', name: '6-Way Fuse Block', reason: 'Reliable automotive blade fuse protection.' };
      if (category === 'Connectors & Wiring') return { id: 'conn-silicone-12awg', name: 'Silicone 12AWG Wiring', reason: 'High-flexibility robust wiring bundle.' };
    } else {
      if (category === 'Solar Module') return { id: 'solar-sunpower-400w', name: 'SunPower Maxeon 3 400W', reason: 'Copper-backed industrial cell with unmatched shading buffer.' };
      if (category === 'Battery Pack') return { id: 'batt-lifepo4-48v-50', name: 'LiFePO4 48V 50Ah Smart Module', reason: 'Smart CAN telemetry with 2560Wh capacity.' };
      if (category === 'Solar Charge Controller') return { id: 'scc-victron-smart-150-45', name: 'Victron SmartSolar 150/45', reason: 'Heavy-duty commercial MPPT designed for 48V banks.' };
      if (category === 'DC-DC Converter') return { id: 'dcdc-buck-48v-24v-15a', name: 'Daygreen 48V to 24V Step-Down', reason: 'Safely steps down 48V primary line to run auxiliary 24V water pumps.' };
      if (category === 'Motor Controller') return { id: 'mctrl-bldc-48v-30a', name: 'Kelly KLS-S 48V FOC', reason: 'Field Oriented Control for ultra-silent BLDC operation.' };
      if (category === 'Main Motor') return { id: 'motor-bldc-48v-350w', name: 'AmpFlow 48V 350W BLDC', reason: 'Extreme continuous blower power for heavy duty cooling.' };
      if (category === 'Water Pump') return { id: 'pump-dc-24v-15w', name: 'JT-550 High-Flow 24V Pump', reason: 'Submersible centrifugal pump with excellent pressure head.' };
      if (category === 'Swing Motor') return { id: 'swing-stepper-12v', name: 'NEMA 17 Stepper Motor 12V', reason: 'Micro-stepped precision for continuous horizontal sway.' };
      if (category === 'Sensors') return { id: 'sensor-ina226', name: 'INA226 Power Monitor', reason: 'Highly reliable bidirectional real-time current tracker.' };
      if (category === 'Controller PCB') return { id: 'pcb-custom-esp32', name: 'Custom Industrial Dual-Rail ESP32', reason: 'Features optoisolated inputs and high power relays.' };
      if (category === 'Protection Circuit') return { id: 'prot-mcb-dc-63a', name: 'DIN-Rail DC MCB 63A', reason: 'Dual pole mechanical breaker for high voltage arrays.' };
      if (category === 'Connectors & Wiring') return { id: 'conn-xt90-pack', name: 'XT90 Anti-Spark Connectors', reason: 'Shielded high-voltage connectors for 48V systems.' };
    }
    return { id: '', name: '', reason: '' };
  };

  const currentRecommendation = useMemo(() => {
    return getRecommendation(activeCategory, activeCooler.size);
  }, [activeCategory, activeCooler.size]);

  // Adopt all recommended components to resolve alerts
  const handleAdoptAllCompat = () => {
    setSelectedComponents(prev => {
      const next = { ...prev };
      CATEGORIES.forEach(cat => {
        next[cat] = getRecommendation(cat, activeCooler.size).id;
      });
      return next;
    });
  };

  // ---------------------------------------------------------
  // Live Electronics Metric Estimations
  // ---------------------------------------------------------
  const liveCalculatedMetrics = useMemo(() => {
    let motorWatts = 0;
    let pumpWatts = 0;
    let swingWatts = 0;
    let baseSensorPcbWatts = 1.5;

    const mainMotor = activeComponentsList.find(c => c.category === 'Main Motor');
    const pump = activeComponentsList.find(c => c.category === 'Water Pump');
    const swing = activeComponentsList.find(c => c.category === 'Swing Motor');
    const pcb = activeComponentsList.find(c => c.category === 'Controller PCB');

    if (mainMotor) {
      const ratedPower = parseFloat(mainMotor.specs['Rated Power'] || '0');
      motorWatts = ratedPower > 0 ? ratedPower : 80;
    }
    if (pump) {
      const powerStr = pump.specs['Power Consumption'] || pump.specs['Power'] || '0';
      const power = parseFloat(powerStr.replace(/[^0-9.]/g, '')) || 0;
      pumpWatts = power > 0 ? power : 5;
    }
    if (swing) {
      const powerStr = swing.specs['Power Consumption'] || swing.specs['Power'] || '0';
      const power = parseFloat(powerStr.replace(/[^0-9.]/g, '')) || 0;
      swingWatts = power > 0 ? power : 3;
    }
    if (pcb) {
      const staticPower = pcb.id === 'pcb-custom-esp32' ? 1.8 : 0.25;
      baseSensorPcbWatts = staticPower;
    }

    const motorQty = componentQuantities[mainMotor?.id || ''] || 1;
    const pumpQty = componentQuantities[pump?.id || ''] || 1;
    const swingQty = componentQuantities[swing?.id || ''] || 1;

    const totalContinuousWatts = (motorWatts * motorQty) + (pumpWatts * pumpQty) + (swingWatts * swingQty) + baseSensorPcbWatts;

    let totalBatteryWh = 0;
    let isLeadAcid = false;
    const battery = activeComponentsList.find(c => c.category === 'Battery Pack');
    if (battery) {
      const energyStr = battery.specs['Energy'] || '0';
      const energy = parseFloat(energyStr.replace(/[^0-9.]/g, '')) || 1280;
      totalBatteryWh = energy;
      isLeadAcid = battery.id.includes('lead');
    }

    const usableBatteryWh = isLeadAcid ? totalBatteryWh * 0.5 : totalBatteryWh * 1.0;
    const estBackupHours = totalContinuousWatts > 0 ? usableBatteryWh / totalContinuousWatts : 0;

    let selectedSolarWatts = 0;
    const solarModule = activeComponentsList.find(c => c.category === 'Solar Module');
    if (solarModule) {
      const powerStr = solarModule.specs['Rated Power'] || '0';
      const power = parseFloat(powerStr.replace(/[^0-9.]/g, '')) || 100;
      selectedSolarWatts = power;
    }

    const solarQty = componentQuantities[solarModule?.id || ''] || 1;
    const activeSolarThroughput = selectedSolarWatts * solarQty * (irradiancePercent / 100);
    const solarChargingMarginWatts = activeSolarThroughput - totalContinuousWatts;

    return {
      totalContinuousWatts,
      usableBatteryWh,
      estBackupHours,
      activeSolarThroughput,
      solarChargingMarginWatts
    };
  }, [activeComponentsList, componentQuantities, irradiancePercent]);

  // ---------------------------------------------------------
  // Pricing & Financial calculations
  // ---------------------------------------------------------
  const bomFinancialSummary = useMemo(() => {
    const listWithPrices = activeComponentsList.map(comp => {
      const qty = componentQuantities[comp.id] !== undefined ? componentQuantities[comp.id] : 1;
      const unitCost = comp.price;
      const totalCost = unitCost * qty;
      const noteOverride = customBOMNotes[comp.id] !== undefined ? customBOMNotes[comp.id] : comp.notes;

      return {
        ...comp,
        qty,
        unitCost,
        totalCost,
        finalNote: noteOverride
      };
    });

    const rawMaterialsTotal = listWithPrices.reduce((sum, item) => sum + item.totalCost, 0);
    const taxesAndTariffs = Math.round(rawMaterialsTotal * (markupRate / 100));
    const totalCOGS = rawMaterialsTotal + taxesAndTariffs;

    const marginMSRPMultiplier = 1 / (1 - targetMarginPercent / 100);
    const suggestedMSRP = Math.round(totalCOGS * marginMSRPMultiplier);
    const estimatedGrossProfit = suggestedMSRP - totalCOGS;

    return {
      listWithPrices,
      rawMaterialsTotal,
      taxesAndTariffs,
      totalCOGS,
      suggestedMSRP,
      estimatedGrossProfit
    };
  }, [activeComponentsList, componentQuantities, customBOMNotes, markupRate, targetMarginPercent]);

  // Category based financial breakdown
  const categoryFinancialBreakdown = useMemo(() => {
    let solar = 0;
    let battery = 0;
    let motor = 0;
    let sensors = 0;
    let accessories = 0;

    bomFinancialSummary.listWithPrices.forEach(item => {
      if (item.category === 'Solar Module' || item.category === 'Solar Charge Controller') {
        solar += item.totalCost;
      } else if (item.category === 'Battery Pack' || item.category === 'DC-DC Converter') {
        battery += item.totalCost;
      } else if (item.category === 'Motor Controller' || item.category === 'Main Motor' || item.category === 'Water Pump' || item.category === 'Swing Motor') {
        motor += item.totalCost;
      } else if (item.category === 'Sensors' || item.category === 'Controller PCB') {
        sensors += item.totalCost;
      } else {
        accessories += item.totalCost;
      }
    });

    const total = solar + battery + motor + sensors + accessories;

    return [
      { name: 'Solar', cost: solar, color: 'bg-amber-500', barColor: '#f59e0b', icon: Sun },
      { name: 'Battery Storage', cost: battery, color: 'bg-emerald-500', barColor: '#10b981', icon: Battery },
      { name: 'Motor Drive', cost: motor, color: 'bg-blue-500', barColor: '#3b82f6', icon: Cpu },
      { name: 'Sensors & Logic', cost: sensors, color: 'bg-purple-500', barColor: '#a855f7', icon: Sliders },
      { name: 'Accessories', cost: accessories, color: 'bg-slate-500', barColor: '#64748b', icon: Layers }
    ].map(cat => ({
      ...cat,
      percentage: total > 0 ? Math.round((cat.cost / total) * 100) : 0
    }));
  }, [bomFinancialSummary]);

  // Filter components in currently active category list
  const filteredCatalogItems = useMemo(() => {
    return ALL_COMPONENTS.filter(item => {
      if (item.category !== activeCategory) return false;

      // Filter compatibility toggle
      if (filterOnlyCompatible) {
        const { compatible } = checkCompatibility(item);
        if (!compatible) return false;
      }

      // Brand Filter
      if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) return false;

      // Voltage Filter
      if (selectedVoltage !== 'ALL') {
        const voltUpper = item.electricalRatings.voltage.toUpperCase();
        if (selectedVoltage === '12V' && !voltUpper.includes('12V') && !voltUpper.includes('11.1V')) return false;
        if (selectedVoltage === '24V' && !voltUpper.includes('24V') && !voltUpper.includes('25.6V')) return false;
        if (selectedVoltage === '48V' && !voltUpper.includes('48V') && !voltUpper.includes('51.2V')) return false;
      }

      // Availability Filter
      if (selectedAvailability !== 'ALL' && item.availability !== selectedAvailability) return false;

      // Search keyword filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesPart = item.partNumber.toLowerCase().includes(q);
        const matchesDesc = item.shortDesc.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesPart && !matchesDesc) return false;
      }

      return true;
    });
  }, [activeCategory, filterOnlyCompatible, selectedBrand, selectedVoltage, selectedAvailability, searchQuery, selectedComponents]);

  // Unique brands within current category
  const categoryBrandsList = useMemo(() => {
    const brands = new Set<string>();
    ALL_COMPONENTS.forEach(item => {
      if (item.category === activeCategory) {
        brands.add(item.brand);
      }
    });
    return Array.from(brands);
  }, [activeCategory]);

  // Adjust quantities
  const handleSetQuantity = (id: string, action: 'inc' | 'dec') => {
    const current = componentQuantities[id] !== undefined ? componentQuantities[id] : 1;
    let next = action === 'inc' ? current + 1 : current - 1;
    if (next < 1) next = 1;
    setComponentQuantities(prev => ({
      ...prev,
      [id]: next
    }));
  };

  const handleUpdateBOMNote = (id: string, text: string) => {
    setCustomBOMNotes(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const handleSelectComponent = (category: CategoryType, id: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: id
    }));
  };

  // Technical Drawing SVG blueprints
  const renderTechnicalBlueprint = (comp: ComponentItem) => {
    if (comp.category === 'Solar Module') {
      return (
        <svg className="w-full h-32 text-blue-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="25" y="15" width="110" height="90" rx="3" fill="#0f172a" stroke="currentColor" strokeWidth="1.5" />
          <line x1="25" y1="37" x2="135" y2="37" stroke="currentColor" strokeWidth="0.5" />
          <line x1="25" y1="60" x2="135" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="25" y1="82" x2="135" y2="82" stroke="currentColor" strokeWidth="0.5" />
          <line x1="47" y1="15" x2="47" y2="105" stroke="currentColor" strokeWidth="0.5" />
          <line x1="80" y1="15" x2="80" y2="105" stroke="currentColor" strokeWidth="0.5" />
          <line x1="113" y1="15" x2="113" y2="105" stroke="currentColor" strokeWidth="0.5" />
          <text x="80" y="65" fill="white" fontSize="8" fontFamily="monospace" textAnchor="middle" strokeWidth="0" className="opacity-85 font-black">{comp.specs['Rated Power'] || '100W'}</text>
        </svg>
      );
    }
    if (comp.category === 'Battery Pack') {
      return (
        <svg className="w-full h-32 text-emerald-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="30" y="25" width="100" height="70" rx="6" fill="#0f172a" stroke="currentColor" strokeWidth="1.5" />
          <rect x="45" y="15" width="16" height="10" fill="#ef4444" rx="1" />
          <text x="53" y="22" fill="white" fontSize="8" fontFamily="monospace" textAnchor="middle" strokeWidth="0">+</text>
          <rect x="99" y="15" width="16" height="10" fill="#3b82f6" rx="1" />
          <text x="107" y="22" fill="white" fontSize="8" fontFamily="monospace" textAnchor="middle" strokeWidth="0">-</text>
          <rect x="42" y="45" width="76" height="30" rx="3" fill="#1e293b" stroke="#059669" />
          <text x="80" y="62" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle" strokeWidth="0">INTEGRATED BMS</text>
        </svg>
      );
    }
    return (
      <svg className="w-full h-32 text-slate-400" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="35" y="25" width="90" height="70" rx="6" fill="#0f172a" stroke="currentColor" />
        <circle cx="80" cy="60" r="15" stroke="currentColor" strokeDasharray="2,2" />
        <text x="80" y="63" fill="currentColor" fontSize="7.5" fontFamily="monospace" textAnchor="middle" strokeWidth="0">{comp.brand.toUpperCase()}</text>
      </svg>
    );
  };

  // Export CSV report
  const handleExportData = (type: 'csv' | 'report') => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      if (type === 'csv') {
        const headers = ['Category', 'Manufacturer', 'Model/Part Number', 'Quantity', 'Unit Cost (₹)', 'Total Cost (₹)', 'Specs Summary'];
        const rows = bomFinancialSummary.listWithPrices.map(item => [
          item.category,
          item.brand,
          item.partNumber,
          item.qty,
          item.unitCost,
          item.totalCost,
          Object.entries(item.specs).map(([k,v]) => `${k}: ${v}`).join(' | ')
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SolarCooler_ElectricalBOM_${activeCooler.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.print();
      }
    }, 1000);
  };

  const activeExplorerItem = useMemo(() => {
    return ALL_COMPONENTS.find(c => c.id === explorerDetailId) || null;
  }, [explorerDetailId]);

  return (
    <div id="solar-electronics-bom-console" className="space-y-6">
      
      {/* 1. COMPACT FIXED COSTING BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase font-mono font-bold tracking-wider">
              Step {activeStep} of 12: {STEPS[activeStep - 1].name}
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
              {STEPS[activeStep - 1].desc}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-400 uppercase block">Current BOM Cost</span>
              <span className="text-lg md:text-xl font-black text-emerald-400">
                ₹{bomFinancialSummary.rawMaterialsTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-400 uppercase block">System Load</span>
              <span className="text-sm md:text-base font-bold text-slate-200">
                {liveCalculatedMetrics.totalContinuousWatts.toFixed(1)} W
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-400 uppercase block">Battery Backup</span>
              <span className="text-sm md:text-base font-bold text-slate-200">
                {liveCalculatedMetrics.estBackupHours > 99 ? 'Continuous' : `${liveCalculatedMetrics.estBackupHours.toFixed(1)} hrs`}
              </span>
            </div>
          </div>
        </div>

        {/* GUIDED HORIZONTAL STEPS TIMELINE */}
        <div className="mt-6 border-t border-slate-800 pt-4 overflow-x-auto scrollbar-none flex items-center gap-2 min-w-0">
          {STEPS.map((step) => {
            const isCompleted = step.id < activeStep;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition cursor-pointer font-bold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : isCompleted
                    ? 'bg-emerald-950/40 border border-emerald-900 text-emerald-400'
                    : 'bg-slate-850 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center bg-black/25 text-[10px]">
                  {step.id}
                </span>
                <span className="truncate max-w-[100px] sm:max-w-none">{step.name}</span>
                {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COMPATIBILITY ALARMS BANNER PANEL */}
      {liveDiagnosticsWarnings.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 font-mono text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[11px] uppercase tracking-wider text-rose-950">Active Sizing & Compatibility Alarms</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-800 font-medium">
                {liveDiagnosticsWarnings.map((warn, index) => (
                  <li key={index}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={handleAdoptAllCompat}
            className="flex-shrink-0 bg-rose-950 hover:bg-rose-900 text-white font-mono text-[10px] font-black px-3 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 text-rose-300" />
            AUTO-RESOLVE ALL
          </button>
        </div>
      )}

      {/* 3. WIZARD STEP WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Vertical Stepper (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col space-y-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-6">
          <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-2 mb-2">
            Configuration Steps
          </h4>
          <div className="space-y-1">
            {STEPS.map((step) => {
              const isCompleted = step.id < activeStep;
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isCompleted
                      ? 'text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] flex-shrink-0 ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {step.id}
                    </span>
                    <span className="truncate">{step.name}</span>
                  </div>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          
          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] font-mono mt-2">
            <div className="flex justify-between items-center text-slate-500">
              <span>BOM Cost:</span>
              <span className="font-extrabold text-emerald-600 font-mono">
                ₹{bomFinancialSummary.rawMaterialsTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Alarms:</span>
              <span className={`font-extrabold ${liveDiagnosticsWarnings.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {liveDiagnosticsWarnings.length} Active
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE STEP CONTROLS */}
        <div className="col-span-1 lg:col-span-9 bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-6">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
          
          {/* STEP 1: COOLER CONFIGURATION */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Step 1: Base DC Cooler Tuning
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Adjust standard load variables below to pre-calibrate matching solar arrays and battery chemical cells.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COOLER_MODELS.map(model => {
                  const isSelected = activeCooler.id === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedCoolerId?.(model.id)}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-350 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`text-[9px] font-mono uppercase tracking-wider block ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                          Sweep Diameter
                        </span>
                        <h5 className="text-lg font-extrabold tracking-tight">{model.size}" Axial Fan</h5>
                        <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {model.name}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-dashed border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-mono">Rated Load:</span>
                        <strong className="text-sm font-mono text-emerald-400">{model.wattage}W</strong>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SLIDERS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-700 font-bold uppercase tracking-wider">Solar panel output</label>
                    <span className="font-mono text-indigo-700 font-extrabold">{panelWattage}W</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    value={panelWattage}
                    onChange={(e) => setPanelWattage?.(Number(e.target.value))}
                    className="w-full accent-blue-650 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block font-mono">Theoretical range: 20W - 400W</span>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-700 font-bold uppercase tracking-wider">Solar Irradiance</label>
                    <span className="font-mono text-indigo-700 font-extrabold">{irradiancePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={irradiancePercent}
                    onChange={(e) => setIrradiancePercent?.(Number(e.target.value))}
                    className="w-full accent-blue-650 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                    <button onClick={() => setIrradiancePercent?.(100)} className="bg-white border border-slate-200 rounded py-0.5 hover:bg-slate-100">100%</button>
                    <button onClick={() => setIrradiancePercent?.(80)} className="bg-white border border-slate-200 rounded py-0.5 hover:bg-slate-100">80%</button>
                    <button onClick={() => setIrradiancePercent?.(40)} className="bg-white border border-slate-200 rounded py-0.5 hover:bg-slate-100">40%</button>
                    <button onClick={() => setIrradiancePercent?.(15)} className="bg-white border border-slate-200 rounded py-0.5 hover:bg-slate-100">15%</button>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-700 font-bold uppercase tracking-wider block">Charge Optimization</label>
                  </div>
                  <button
                    onClick={() => setMpptEnabled?.(!mpptEnabled)}
                    className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold font-mono transition flex items-center justify-between cursor-pointer ${
                      mpptEnabled
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>MPPT Charge algorithm</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] ${mpptEnabled ? 'bg-blue-600 text-white' : 'bg-slate-150 text-slate-500'}`}>
                      {mpptEnabled ? 'Active (95%)' : 'Bypass (100%)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEPS 2 TO 10: COMPONENT CATALOG SELECTOR */}
          {activeStep >= 2 && activeStep <= 10 && (
            <div className="space-y-6">
              
              {/* STEP 10 SUB-CATEGORY SWITCHER */}
              {activeStep === 10 && (
                <div className="border-b border-slate-100 pb-3 flex flex-wrap gap-1.5">
                  {(['Sensors', 'Controller PCB', 'Protection Circuit', 'Connectors & Wiring'] as CategoryType[]).map(subCat => (
                    <button
                      key={subCat}
                      onClick={() => setStep10SubCat(subCat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        step10SubCat === subCat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-150 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
              )}

              {/* LIVE RECOMMENDATION CALLOUT */}
              {currentRecommendation.id && (
                <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                      <ThumbsUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-900">
                        System Recommendation
                      </h5>
                      <p className="text-[12px] text-indigo-800 font-sans mt-0.5 font-medium leading-relaxed">
                        We recommend the <strong className="text-indigo-950">{currentRecommendation.name}</strong> because {currentRecommendation.reason}
                      </p>
                    </div>
                  </div>

                  {selectedComponents[activeCategory] !== currentRecommendation.id ? (
                    <button
                      onClick={() => handleSelectComponent(activeCategory, currentRecommendation.id)}
                      className="bg-indigo-700 hover:bg-indigo-650 text-white font-mono text-[11px] font-black px-4 py-2.5 rounded-xl transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/10"
                    >
                      <Check className="w-4 h-4" />
                      Apply Recommended Part
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Optimally Match Setup
                    </span>
                  )}
                </div>
              )}

              {/* CATALOG FILTER PANEL */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                    <Sliders className="w-4 h-4 text-blue-500" />
                    <span>BROWSE {activeCategory.toUpperCase()} FILES</span>
                  </div>
                  
                  <label className="flex items-center gap-2 text-xs font-mono text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterOnlyCompatible}
                      onChange={(e) => setFilterOnlyCompatible(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    Only compatible components
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, brand, part..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 outline-none text-slate-850 placeholder-slate-400 focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 cursor-pointer focus:border-blue-500"
                  >
                    <option value="ALL">All Brands</option>
                    {categoryBrandsList.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={selectedVoltage}
                    onChange={(e) => setSelectedVoltage(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 cursor-pointer focus:border-blue-500"
                  >
                    <option value="ALL">All Voltages</option>
                    <option value="12V">12V nominal</option>
                    <option value="24V">24V nominal</option>
                    <option value="48V">48V nominal</option>
                  </select>

                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-slate-700 cursor-pointer focus:border-blue-500"
                  >
                    <option value="ALL">All Stocks</option>
                    <option value="In Stock">In Stock Only</option>
                    <option value="Low Stock">Low Stock Only</option>
                  </select>
                </div>
              </div>

              {/* CARD GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCatalogItems.length === 0 ? (
                  <div className="col-span-2 bg-slate-50 border border-slate-150 rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
                    No matching parts in catalog. Try loosening filter constraints.
                  </div>
                ) : (
                  filteredCatalogItems.map(item => {
                    const isSelected = selectedComponents[activeCategory] === item.id;
                    const { compatible, reason } = checkCompatibility(item);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border transition-all p-4.5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md ${
                          isSelected
                            ? 'border-blue-500 ring-1 ring-blue-550/20 bg-blue-50/5'
                            : !compatible
                            ? 'border-slate-150 opacity-60'
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div>
                              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                                {item.brand}
                              </span>
                              <h5 className="font-extrabold text-slate-900 text-[13.5px] mt-0.5 leading-tight">
                                {item.name}
                              </h5>
                              <span className="text-[9.5px] font-mono text-slate-400 block mt-0.5">
                                SKU: {item.partNumber}
                              </span>
                            </div>
                            <span
                              className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                item.availability === 'In Stock'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}
                            >
                              {item.availability}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-sans mt-2.5 leading-relaxed line-clamp-2">
                            {item.shortDesc}
                          </p>

                          {/* DETAILS GRID */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 text-[10px] font-mono">
                            {Object.entries(item.specs).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex flex-col min-w-0">
                                <span className="text-slate-400 text-[8.5px] uppercase block leading-none">{key}:</span>
                                <span className="text-slate-800 font-bold truncate mt-0.5 block">{value}</span>
                              </div>
                            ))}
                          </div>

                          {!compatible && (
                            <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[9.5px] font-mono text-rose-800 leading-normal flex items-start gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                              <span><strong>Incompatible:</strong> {reason}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1.5 gap-2">
                          <div>
                            <span className="text-[8.5px] font-mono text-slate-400 uppercase block leading-none">Est. Unit Cost:</span>
                            <span className="text-base font-mono font-black text-slate-900 mt-1 block">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setExplorerDetailId(item.id)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 p-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden md:inline">Inspect</span>
                            </button>

                            {isSelected ? (
                              <span className="bg-emerald-500 text-white font-mono text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold shadow-sm">
                                <Check className="w-4 h-4 stroke-[3]" />
                                Selected
                              </span>
                            ) : (
                              <button
                                disabled={!compatible}
                                onClick={() => handleSelectComponent(activeCategory, item.id)}
                                className={`font-mono text-xs px-3.5 py-2 rounded-xl transition font-bold flex items-center gap-1.5 cursor-pointer ${
                                  compatible 
                                    ? 'bg-blue-600 hover:bg-blue-550 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                }`}
                              >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                Add to BOM
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* NEXT STEP HIGHLIGHT GUIDE PANEL */}
              {selectedComponents[activeCategory] && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/40 border border-blue-150 p-4.5 rounded-2xl mt-4 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                      <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                    </div>
                    <div className="text-xs font-sans">
                      <p className="font-extrabold text-slate-800">Category Configured Successfully!</p>
                      <p className="text-slate-500 mt-0.5 font-medium">
                        Selected: <strong className="text-slate-900 font-bold">{ALL_COMPONENTS.find(c => c.id === selectedComponents[activeCategory])?.name}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-black px-4.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Proceed to Step {activeStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STEP 11: REVIEW GENERATED BOM */}
          {activeStep === 11 && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Step 11: Bill of Materials Checklist
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Adjust target component counts and save engineering design notes before checkout.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600">
                  <label className="flex items-center gap-1.5">
                    <span>Tax/Tariffs:</span>
                    <input
                      type="number"
                      value={markupRate}
                      onChange={(e) => setMarkupRate(parseFloat(e.target.value) || 0)}
                      className="w-12 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none font-bold text-center text-slate-800"
                    />
                    <span>%</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span>Target Margin:</span>
                    <input
                      type="number"
                      value={targetMarginPercent}
                      onChange={(e) => setTargetMarginPercent(parseFloat(e.target.value) || 0)}
                      className="w-12 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none font-bold text-center text-slate-800"
                    />
                    <span>%</span>
                  </label>
                </div>
              </div>

              {/* MOBILE STACKED LIST */}
              <div className="block lg:hidden space-y-4">
                {bomFinancialSummary.listWithPrices.map(item => (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">{item.name}</span>
                        <span className="text-[9.5px] text-slate-400 uppercase tracking-widest block mt-0.5">{item.category}</span>
                      </div>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                        {item.partNumber}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-200/60 py-2.5">
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase block">Unit Price</span>
                        <span className="text-sm font-bold text-slate-800">₹{item.unitCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase block">Total Price</span>
                        <span className="text-sm font-black text-slate-950">₹{item.totalCost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[9px] uppercase">Qty:</span>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => handleSetQuantity(item.id, 'dec')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                          <span className="w-4 font-black text-slate-850 text-center text-xs">{item.qty}</span>
                          <button
                            onClick={() => handleSetQuantity(item.id, 'inc')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setExplorerDetailId(item.id)}
                        className="text-blue-600 hover:text-blue-500 font-semibold cursor-pointer text-xs"
                      >
                        Inspect SKU
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-slate-250/50">
                      <span className="text-slate-400 text-[9px] uppercase block mb-1">Design Comments</span>
                      <input
                        type="text"
                        value={item.finalNote}
                        onChange={(e) => handleUpdateBOMNote(item.id, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 placeholder-slate-450 text-[11px] outline-none focus:border-blue-500"
                        placeholder="Add comments..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP RESPONSIVE TABLE */}
              <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs font-mono min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px] font-bold tracking-wider">
                      <th className="p-3 pl-4">Component Subsystem</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Model SKU</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Price</th>
                      <th className="p-3 max-w-[200px]">Design Notes</th>
                      <th className="p-3 text-center pr-4">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bomFinancialSummary.listWithPrices.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 pl-4 font-sans">
                          <span className="font-extrabold text-slate-900 text-xs block">{item.name}</span>
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">{item.category}</span>
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{item.brand}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                            {item.partNumber}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                            <button
                              onClick={() => handleSetQuantity(item.id, 'dec')}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5 stroke-[3]" />
                            </button>
                            <span className="w-4 font-black text-slate-850 text-center">{item.qty}</span>
                            <button
                              onClick={() => handleSetQuantity(item.id, 'inc')}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5 stroke-[3]" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right text-slate-600 font-bold">₹{item.unitCost.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-slate-950 font-black">₹{item.totalCost.toLocaleString('en-IN')}</td>
                        <td className="p-3 max-w-[200px] text-slate-400 italic text-[10.5px]">
                          <input
                            type="text"
                            value={item.finalNote}
                            onChange={(e) => handleUpdateBOMNote(item.id, e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-250 focus:border-blue-500 py-0.5 outline-none text-slate-700 placeholder-slate-400 truncate"
                            placeholder="Engineering comments..."
                          />
                        </td>
                        <td className="p-3 text-center pr-4">
                          <button
                            onClick={() => setExplorerDetailId(item.id)}
                            className="text-blue-600 hover:text-blue-500 font-semibold cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => handleExportData('csv')}
                  disabled={exportingType !== null}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 font-mono text-xs text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition disabled:opacity-50 font-bold"
                >
                  {exportingType === 'csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />}
                  Export CSV Report
                </button>
                <button
                  onClick={() => handleExportData('report')}
                  disabled={exportingType !== null}
                  className="bg-blue-600 hover:bg-blue-550 font-mono text-xs text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition disabled:opacity-50 font-bold shadow-md shadow-blue-900/10"
                >
                  {exportingType === 'report' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                  Print Specifications
                </button>
              </div>
            </div>
          )}

          {/* STEP 12: VIEW COST SUMMARY */}
          {activeStep === 12 && (
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Step 12: Commercial Cost Summary
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Comprehensive pricing breakdowns, supplier markup structures, and overall profitability.
                </p>
              </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Raw Wholesales Cost</span>
                  <span className="text-2xl font-black font-mono block text-slate-900">
                    ₹{bomFinancialSummary.rawMaterialsTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">Total net sum of raw material selections</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Consolidated COGS</span>
                  <span className="text-2xl font-black font-mono block text-blue-600">
                    ₹{bomFinancialSummary.totalCOGS.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">Includes +{markupRate}% local taxes & tariffs</span>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-emerald-50 p-5 rounded-2xl border border-blue-150 space-y-1.5 shadow-xs">
                  <span className="text-[10px] text-indigo-700 uppercase font-mono font-bold block">Suggested MSRP Sale</span>
                  <span className="text-3xl font-black font-mono block text-emerald-600">
                    ₹{bomFinancialSummary.suggestedMSRP.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-550 block leading-tight">
                    Yields <strong className="text-emerald-700">₹{bomFinancialSummary.estimatedGrossProfit.toLocaleString('en-IN')}</strong> gross profit ({targetMarginPercent}% target margin)
                  </span>
                </div>
              </div>

              {/* COMPREHENSIVE COST GROUP BREAKDOWN */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6.5 space-y-5">
                <h5 className="text-xs font-mono font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Layers className="w-4 h-4 text-slate-550" />
                  Cost Breakdown by Component Category
                </h5>

                {/* HORIZONTAL STACKED PROGRESS PERCENT BAR */}
                <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden">
                  {categoryFinancialBreakdown.map((cat, i) => {
                    if (cat.cost === 0) return null;
                    return (
                      <div
                        key={i}
                        className={cat.color}
                        style={{ width: `${cat.percentage}%` }}
                        title={`${cat.name}: ${cat.percentage}% (₹${cat.cost.toLocaleString('en-IN')})`}
                      />
                    );
                  })}
                </div>

                {/* DETAILED LEDGER GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-3">
                  {categoryFinancialBreakdown.map((cat, i) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${cat.color} text-white`}>
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                        </div>
                        <div>
                          <span className="text-sm font-black font-mono text-slate-900 block">₹{cat.cost.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{cat.percentage}% of total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPLETION ENCOURAGEMENT BOX */}
              <div className="p-5 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-950 flex items-start gap-4 shadow-2xs">
                <div className="p-2 bg-emerald-500 text-white rounded-xl">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h5 className="text-sm font-extrabold uppercase tracking-wide">System Configuration Fully Calibrated</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed mt-1 font-medium">
                    This solar DC evaporative micro-grid setup is fully configured with optimal backup battery storage, matched motor controllers, and direct DC bus accessories. Outstanding alerts have been fully resolved. You can now download the parts procurement list above.
                  </p>
                </div>
              </div>
            </div>
          )}

          </motion.div>
          </AnimatePresence>

          {/* BOTTOM NAVIGATION ACTIONS */}
          <div className="pt-6 border-t border-slate-150 flex items-center justify-between gap-4">
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {activeStep < 12 ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActiveStep(1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-550 text-white rounded-xl transition font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
              >
                Re-Configure from Step 1
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 5. SPEC DETAILS SIDE DRAWER OVERLAY */}
      <AnimatePresence>
        {activeExplorerItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setExplorerDetailId(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-full md:max-w-lg bg-white shadow-2xl z-50 flex flex-col justify-between border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-950 text-white flex-shrink-0">
                <div>
                  <span className="text-[8.5px] font-mono text-blue-400 font-black uppercase tracking-widest block">
                    {activeExplorerItem.category} &middot; Technical Datasheet
                  </span>
                  <h4 className="text-md font-extrabold tracking-tight mt-0.5 text-slate-100">
                    {activeExplorerItem.name}
                  </h4>
                  <span className="text-xs font-mono text-slate-400 block mt-1">
                    Part ID: {activeExplorerItem.partNumber}
                  </span>
                </div>
                <button
                  onClick={() => setExplorerDetailId(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                
                {/* Visual Blueprint Section */}
                <div className="bg-[#0b0f19] border border-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden min-h-[160px]">
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] font-mono text-slate-500 uppercase tracking-widest">
                    CAD Schematic Symbol Reference
                  </span>
                  {renderTechnicalBlueprint(activeExplorerItem)}
                </div>

                <div className="border-b border-slate-100 pb-2.5 flex gap-4 text-xs font-mono font-bold text-slate-400">
                  <button
                    onClick={() => setSpecTab('SPEC')}
                    className={`pb-1 transition cursor-pointer ${specTab === 'SPEC' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-700'}`}
                  >
                    Full Specifications
                  </button>
                  <button
                    onClick={() => setSpecTab('DIAGRAM')}
                    className={`pb-1 transition cursor-pointer ${specTab === 'DIAGRAM' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-700'}`}
                  >
                    Datasheet Preview
                  </button>
                </div>

                {specTab === 'SPEC' ? (
                  <div className="space-y-5">
                    {/* KEY ELECTRICAL RATINGS */}
                    <div>
                      <h5 className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider mb-2.5">
                        Electrical Ratings & Tolerances
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 text-[8.5px] uppercase block leading-none">Nominal Volt:</span>
                          <strong className="text-slate-800 block mt-1">{activeExplorerItem.electricalRatings.voltage}</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 text-[8.5px] uppercase block leading-none">Peak Current:</span>
                          <strong className="text-slate-800 block mt-1">{activeExplorerItem.electricalRatings.current || 'N/A'}</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 text-[8.5px] uppercase block leading-none">Power Duty:</span>
                          <strong className="text-slate-800 block mt-1">{activeExplorerItem.electricalRatings.power || 'N/A'}</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 text-[8.5px] uppercase block leading-none">Efficiency:</span>
                          <strong className="text-emerald-600 block mt-1">{activeExplorerItem.electricalRatings.efficiency || '95%'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* COMPLETE SPEC TABLE */}
                    <div>
                      <h5 className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider mb-2.5">
                        Technical Specifications Detail
                      </h5>
                      <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs font-mono">
                        {Object.entries(activeExplorerItem.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-2.5 hover:bg-slate-50 transition">
                            <span className="text-slate-400 font-medium">{key}</span>
                            <span className="text-slate-850 font-bold text-right">{value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between p-2.5 hover:bg-slate-50 transition">
                          <span className="text-slate-400 font-medium">Mechanical Dimensions</span>
                          <span className="text-slate-850 font-bold text-right">{activeExplorerItem.dimensions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl text-xs leading-relaxed text-blue-900">
                        <strong className="font-mono uppercase text-[9.5px] block text-blue-950 mb-1">
                          Typical Subsystem Integration:
                        </strong>
                        {activeExplorerItem.typicalApplications}
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs text-slate-600 leading-relaxed">
                        <strong className="font-mono uppercase text-[9.5px] block text-slate-800 mb-1">
                          CAD Engineering Integration Notes:
                        </strong>
                        {activeExplorerItem.notes}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-900">
                    <div className="border-b border-emerald-950 pb-2 mb-3 text-emerald-500 uppercase tracking-widest text-center text-xs font-black">
                      ** SYSTEM DATASHEET REPORT **
                    </div>
                    {activeExplorerItem.datasheetPreview}
                  </div>
                )}

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
                <div className="text-left font-mono">
                  <span className="text-[9px] text-slate-400 uppercase block">Est. Wholesale cost</span>
                  <span className="text-lg font-black text-slate-900">₹{activeExplorerItem.price.toLocaleString('en-IN')}</span>
                </div>
                
                <button
                  onClick={() => setExplorerDetailId(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition shadow-sm"
                >
                  Close Spec Sheet
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
