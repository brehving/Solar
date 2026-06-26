import { ComponentItem } from './BOMTypes';

export const ALL_COMPONENTS: ComponentItem[] = [
  // 1. Solar Module
  {
    id: 'solar-renogy-100w',
    partNumber: 'RNG-100D-SS',
    name: 'Renogy 100W Monocrystalline Solar Panel',
    category: 'Solar Module',
    brand: 'Renogy',
    price: 5500,
    shortDesc: 'Compact high-efficiency monocrystalline PV panel, ideal for small-scale 12V battery charging systems.',
    availability: 'In Stock',
    specs: {
      'Rated Power': '100W',
      'Open-Circuit Voltage (Voc)': '22.3V',
      'Short-Circuit Current (Isc)': '5.86A',
      'Optimum Operating Voltage (Vmp)': '18.6V',
      'Optimum Operating Current (Imp)': '5.38A',
      'Module Efficiency': '21.0%',
      'Cell Type': 'Monocrystalline Silicon',
      'Junction Box': 'IP65 Rated with MC4 Connectors',
      'Max Series Fuse': '15A'
    },
    electricalRatings: {
      voltage: '18.6V Vmp',
      current: '5.38A Imp',
      power: '100W',
      efficiency: '21.0%'
    },
    dimensions: '1062 x 530 x 35 mm',
    typicalApplications: '12V off-grid portable solar applications and minor cooling projects.',
    datasheetPreview: 'RENOGY CLASS-A HIGH-EFFICIENCY CELL TECHNOLOGY\n- Temp. Coefficient (Pmax): -0.37%/°C\n- Temp. Coefficient (Voc): -0.28%/°C\n- Bypass diodes pre-installed in IP65 junction box to reduce power drop caused by shade.',
    notes: 'Sturdy anodized aluminium frame. Excellent mechanical load resistance up to 5400 Pa.'
  },
  {
    id: 'solar-renogy-200w',
    partNumber: 'RNG-200D-SS',
    name: 'Renogy 200W 24V Monocrystalline Solar Panel',
    category: 'Solar Module',
    brand: 'Renogy',
    price: 9800,
    shortDesc: 'Mid-sized 24V monocrystalline panel delivering higher current density and power throughput.',
    availability: 'In Stock',
    specs: {
      'Rated Power': '200W',
      'Open-Circuit Voltage (Voc)': '45.4V',
      'Short-Circuit Current (Isc)': '5.74A',
      'Optimum Operating Voltage (Vmp)': '37.6V',
      'Optimum Operating Current (Imp)': '5.32A',
      'Module Efficiency': '22.0%',
      'Cell Type': 'Monocrystalline Silicon',
      'Junction Box': 'IP67 Rated with MC4 Connectors',
      'Max Series Fuse': '15A'
    },
    electricalRatings: {
      voltage: '37.6V Vmp',
      current: '5.32A Imp',
      power: '200W',
      efficiency: '22.0%'
    },
    dimensions: '1490 x 680 x 35 mm',
    typicalApplications: '24V off-grid battery charging, hybrid solar-powered coolers and active ventilation rigs.',
    datasheetPreview: 'RENOGY PRO-SERIES MONO PV CELL AT 37.6V\n- Temp. Coefficient (Pmax): -0.36%/°C\n- Low-iron tempered glass for high transmissivity.\n- Anti-reflective hydrophobic coating to prevent dust buildup.',
    notes: 'Optimally matched with MPPT charge controllers to run 24V native DC motors.'
  },
  {
    id: 'solar-sunpower-400w',
    partNumber: 'SPR-MAX3-400',
    name: 'SunPower Maxeon 3 400W High-Efficiency Solar Panel',
    category: 'Solar Module',
    brand: 'SunPower',
    price: 19500,
    shortDesc: 'Premium copper-backed Maxeon cells delivering industry-leading durability and power density.',
    availability: 'Low Stock',
    specs: {
      'Rated Power': '400W',
      'Open-Circuit Voltage (Voc)': '75.6V',
      'Short-Circuit Current (Isc)': '6.58A',
      'Optimum Operating Voltage (Vmp)': '65.8V',
      'Optimum Operating Current (Imp)': '6.08A',
      'Module Efficiency': '22.6%',
      'Cell Type': 'Maxeon Monocrystalline (Copper Backing)',
      'Junction Box': 'IP68 Rated with locking MC4',
      'Max Series Fuse': '20A'
    },
    electricalRatings: {
      voltage: '65.8V Vmp',
      current: '6.08A Imp',
      power: '400W',
      efficiency: '22.6%'
    },
    dimensions: '1690 x 1046 x 40 mm',
    typicalApplications: 'High-power 48V native setups, commercial evaporative chillers and heavy desert installations.',
    datasheetPreview: 'SUNPOWER MAXEON TECHNOLOGY GEN III CELL\n- Built on solid copper base for ultimate crack/corrosion immunity.\n- Rated for lowest degradation rate in solar: 0.2% per year over 25 years.\n- Outstanding performance in high temperature micro-climates.',
    notes: 'Premium high-voltage output requiring high Voc MPPT charger tolerance.'
  },

  // 2. Battery Pack
  {
    id: 'batt-lifepo4-12v-100',
    partNumber: 'LFP-12100-BMS',
    name: 'LiFePO4 12V 100Ah Deep Cycle Battery Pack',
    category: 'Battery Pack',
    brand: 'Redodo',
    price: 18500,
    shortDesc: 'Highly reliable Lithium Iron Phosphate pack featuring 4000+ deep cycles and integrated 100A BMS.',
    availability: 'In Stock',
    specs: {
      'Nominal Voltage': '12.8V',
      'Capacity': '100Ah',
      'Energy': '1280Wh',
      'Cycle Life': '4000+ Cycles at 100% DoD',
      'Integrated BMS': '100A Continuous Discharge',
      'Max Charge Current': '50A',
      'Cell Configuration': '4S1P Prismatic Cells',
      'Weight': '11.0 kg'
    },
    electricalRatings: {
      voltage: '12.8V',
      current: '100A Max Discharge',
      power: '1280Wh Capacity'
    },
    dimensions: '329 x 172 x 214 mm',
    typicalApplications: '12V system battery backups, camping accessories, and portable evaporative cooler grids.',
    datasheetPreview: 'LFP ACTIVE PASS-THROUGH BATTERY SPEC\n- Nominal Charging Cut-off: 14.6V\n- Low-Temp Charging Cut-off: 0°C (Automatic Protection)\n- Over-discharge, Over-current and Short-circuit hardware trip points.',
    notes: 'Extremely lightweight compared to Lead-Acid counterparts, offering 100% usable capacity without degrading.'
  },
  {
    id: 'batt-lifepo4-24v-50',
    partNumber: 'LFP-24050-BMS',
    name: 'LiFePO4 24V 50Ah Deep Cycle Battery Pack',
    category: 'Battery Pack',
    brand: 'Redodo',
    price: 19500,
    shortDesc: '24V LFP battery pack optimizing copper routing by halving current draw for 1280Wh energy capacity.',
    availability: 'In Stock',
    specs: {
      'Nominal Voltage': '25.6V',
      'Capacity': '50Ah',
      'Energy': '1280Wh',
      'Cycle Life': '4000+ Cycles at 100% DoD',
      'Integrated BMS': '50A Continuous Discharge',
      'Max Charge Current': '25A',
      'Cell Configuration': '8S1P Prismatic Cells',
      'Weight': '11.5 kg'
    },
    electricalRatings: {
      voltage: '25.6V',
      current: '50A Max Discharge',
      power: '1280Wh Capacity'
    },
    dimensions: '329 x 172 x 214 mm',
    typicalApplications: '24V native brushless motors and medium cooler configurations.',
    datasheetPreview: 'LFP 8-SERIES SAFETY STANDARDS\n- Nominal Charging Cut-off: 29.2V\n- Low temperature heater pads NOT integrated; do not charge under 0°C.',
    notes: 'Allows using thinner, lower-gauge distribution wires across the chassis.'
  },
  {
    id: 'batt-lifepo4-48v-50',
    partNumber: 'LFP-48050-SMART',
    name: 'LiFePO4 48V 50Ah Smart Battery Module',
    category: 'Battery Pack',
    brand: 'Epoch Batteries',
    price: 48000,
    shortDesc: 'Premium 48V telecom-grade energy storage module with high-capacity smart BMS and CAN/RS485 telemetry.',
    availability: 'Low Stock',
    specs: {
      'Nominal Voltage': '51.2V',
      'Capacity': '50Ah',
      'Energy': '2560Wh',
      'Cycle Life': '5000+ Cycles at 80% DoD',
      'Integrated BMS': '100A Continuous with Smart Bus',
      'Max Charge Current': '50A',
      'Cell Configuration': '16S1P Grade-A Cells',
      'Weight': '22.0 kg'
    },
    electricalRatings: {
      voltage: '51.2V',
      current: '100A Max Discharge',
      power: '2560Wh Capacity'
    },
    dimensions: '442 x 400 x 133 mm (3U Rack)',
    typicalApplications: 'High-capacity 48V systems, industrial multi-day off-grid coolers and heavy telecom equipment.',
    datasheetPreview: 'EPOCH 48V SMART MODULAR COMPLIANCE\n- Real-time cell balancing, SoC and SoH analytics over CAN Bus.\n- Built-in heating elements enabling charging down to -20°C.',
    notes: 'Top tier safety and life cycle. Perfect match for high-voltage DC brushless blower motors.'
  },
  {
    id: 'batt-liion-12v-50',
    partNumber: 'NMC-12050-SLIM',
    name: 'Lithium-Ion NMC 12V 50Ah Slimline Pack',
    category: 'Battery Pack',
    brand: 'Generic OEM',
    price: 11500,
    shortDesc: 'Ultra-compact and lightweight NMC battery pack, ideal for portable high-density designs.',
    availability: 'In Stock',
    specs: {
      'Nominal Voltage': '11.1V',
      'Capacity': '50Ah',
      'Energy': '555Wh',
      'Cycle Life': '1000 Cycles at 80% DoD',
      'Integrated BMS': '40A Continuous',
      'Max Charge Current': '20A',
      'Cell Configuration': '3S20P 18650 Cells',
      'Weight': '4.5 kg'
    },
    electricalRatings: {
      voltage: '11.1V',
      current: '40A Max Discharge',
      power: '555Wh Capacity'
    },
    dimensions: '220 x 140 x 95 mm',
    typicalApplications: 'Lightweight hand-held coolers, portable test fixtures, and low-footprint power banks.',
    datasheetPreview: 'HIGH ENERGY DENSITY LITHIUM NICKEL COBALT\n- Working Voltage: 9.0V to 12.6V\n- High temperature protection cuts off discharging above 60°C.',
    notes: 'Very high power density, but significantly shorter lifecycle than LiFePO4 cells.'
  },
  {
    id: 'batt-lead-12v-100',
    partNumber: 'AGM-12100-HD',
    name: 'Lead Acid AGM 12V 100Ah Deep Cycle Battery',
    category: 'Battery Pack',
    brand: 'Mighty Max',
    price: 9500,
    shortDesc: 'Traditional sealed AGM lead-acid battery. Extremely heavy but highly cost-efficient.',
    availability: 'In Stock',
    specs: {
      'Nominal Voltage': '12.0V',
      'Capacity': '100Ah',
      'Energy': '1200Wh (600Wh usable at 50% DoD)',
      'Cycle Life': '500 Cycles at 50% DoD',
      'Integrated BMS': 'None (Requires manual over-discharge limit)',
      'Max Charge Current': '30A',
      'Cell Configuration': 'Sealed Lead-Acid 6-Cell',
      'Weight': '30.2 kg'
    },
    electricalRatings: {
      voltage: '12.0V',
      current: '300A Cold Cranking',
      power: '1200Wh Gross'
    },
    dimensions: '307 x 168 x 215 mm',
    typicalApplications: 'Budget stationary backup grids and heavy localized cooling installations.',
    datasheetPreview: 'SLA DEEP-CYCLE STORAGE PROTOCOLS\n- Recommended Charge: Constant Voltage 14.4V float 13.6V\n- Note: Avoid discharging below 11.5V to prevent permanent sulfation.',
    notes: 'Extremely heavy (30kg). Usable capacity is practically restricted to 50Ah to prevent catastrophic damage.'
  },

  // 3. Solar Charge Controller
  {
    id: 'scc-renogy-rover-30a',
    partNumber: 'ROV-30A-MPPT',
    name: 'Renogy Rover 30A MPPT Charge Controller',
    category: 'Solar Charge Controller',
    brand: 'Renogy',
    price: 6500,
    shortDesc: 'Affordable MPPT controller with multi-stage smart tracking, LCD screen and auto-sensing system voltages.',
    availability: 'In Stock',
    specs: {
      'Charging Technology': 'Maximum Power Point Tracking (MPPT)',
      'Rated Charge Current': '30A',
      'Max PV Input Voltage (Voc)': '100V DC',
      'Battery System Voltage': '12V / 24V Auto-Sense',
      'Max PV Input Power': '400W (12V) / 800W (24V)',
      'Tracking Efficiency': '99%',
      'Conversion Efficiency': '98%',
      'Self-Consumption': '< 100mA'
    },
    electricalRatings: {
      voltage: '12V/24V Output',
      current: '30A Output',
      power: 'Max 800W PV',
      efficiency: '98%'
    },
    dimensions: '210 x 151 x 60 mm',
    typicalApplications: 'Medium capacity solar panels and 12V or 24V battery charge loops.',
    datasheetPreview: 'RENOGY ROVER MPPT ALGORITHM DEPLOYMENT\n- Auto-saves daily history statistics.\n- Selectable presets for Gel, Sealed, Flooded and Lithium profiles.',
    notes: 'Compact unit with an integrated cooling heatsink. Lacks Bluetooth out of the box (requires dongle).'
  },
  {
    id: 'scc-victron-smart-100-30',
    partNumber: 'SCC-10030-BLU',
    name: 'Victron SmartSolar MPPT 100/30 Charge Controller',
    category: 'Solar Charge Controller',
    brand: 'Victron Energy',
    price: 12500,
    shortDesc: 'Ultra-fast MPPT controller with built-in Bluetooth, yielding maximum charge efficiency and cloud telemetry.',
    availability: 'In Stock',
    specs: {
      'Charging Technology': 'Ultra-Fast MPPT',
      'Rated Charge Current': '30A',
      'Max PV Input Voltage (Voc)': '100V DC',
      'Battery System Voltage': '12V / 24V Auto-Sense',
      'Max PV Input Power': '440W (12V) / 880W (24V)',
      'Tracking Efficiency': '99.5%',
      'Conversion Efficiency': '98.5%',
      'Self-Consumption': '< 15mA'
    },
    electricalRatings: {
      voltage: '12V/24V Output',
      current: '30A Output',
      power: 'Max 880W PV',
      efficiency: '98.5%'
    },
    dimensions: '130 x 186 x 70 mm',
    typicalApplications: 'Professional off-grid installations, IoT-enabled solar systems and advanced coolers.',
    datasheetPreview: 'VICTRON SMARTSOLAR TELEMETRY PROTOCOL\n- Integrated VE.Direct pinout and VictronConnect Bluetooth module.\n- High-velocity MPP scanning even during rapid cloud shifts.',
    notes: 'Extremely efficient with very low self-discharge rates. Outstanding 5-year warranty.'
  },
  {
    id: 'scc-victron-smart-150-45',
    partNumber: 'SCC-15045-PRO',
    name: 'Victron SmartSolar MPPT 150/45 Charge Controller',
    category: 'Solar Charge Controller',
    brand: 'Victron Energy',
    price: 24500,
    shortDesc: 'Heavy-duty commercial charge controller supporting high voltage PV arrays up to 150V Voc and 48V systems.',
    availability: 'Low Stock',
    specs: {
      'Charging Technology': 'Ultra-Fast MPPT',
      'Rated Charge Current': '45A',
      'Max PV Input Voltage (Voc)': '150V DC',
      'Battery System Voltage': '12V / 24V / 48V Auto-Sense',
      'Max PV Input Power': '650W (12V) / 1300W (24V) / 2600W (48V)',
      'Tracking Efficiency': '99.6%',
      'Conversion Efficiency': '99.0%',
      'Self-Consumption': '< 10mA'
    },
    electricalRatings: {
      voltage: '12V/24V/48V Output',
      current: '45A Output',
      power: 'Max 2600W PV',
      efficiency: '99.0%'
    },
    dimensions: '150 x 186 x 70 mm',
    typicalApplications: 'High-power 48V battery systems, large commercial cooling systems, and multi-panel PV arrays.',
    datasheetPreview: 'VICTRON 150V VOC PRO ALGORITHM\n- Handles high-voltage series connected solar panel matrices.\n- Electronic short-circuit and over-temperature safety limits.',
    notes: 'Premium commercial grade, suited for large 48V battery banks and powerful BLDC motors.'
  },
  {
    id: 'scc-generic-pwm-20a',
    partNumber: 'PWM-20A-G1',
    name: 'Generic 20A PWM Solar Charge Controller',
    category: 'Solar Charge Controller',
    brand: 'Generic OEM',
    price: 1200,
    shortDesc: 'Simple pulse-width modulation controller. Cost-efficient but yields lower charging efficiency.',
    availability: 'In Stock',
    specs: {
      'Charging Technology': 'Pulse-Width Modulation (PWM)',
      'Rated Charge Current': '20A',
      'Max PV Input Voltage (Voc)': '30V DC (12V Batt) / 55V DC (24V Batt)',
      'Battery System Voltage': '12V / 24V Auto-Sense',
      'Max PV Input Power': '240W (12V) / 480W (24V)',
      'Tracking Efficiency': 'N/A (Non-MPPT)',
      'Conversion Efficiency': '82%',
      'Self-Consumption': '< 25mA'
    },
    electricalRatings: {
      voltage: '12V/24V Output',
      current: '20A Output',
      power: 'Max 480W PV',
      efficiency: '82%'
    },
    dimensions: '133 x 70 x 35 mm',
    typicalApplications: 'Low-cost entry-level solar kits, backup lighting systems, and experimental rigs.',
    datasheetPreview: 'PWM DUAL-USB INTERFACE INTEGRATION\n- Integrated dual 5V 2A USB ports for phone charging.\n- Standard 3-stage charging: Bulk, Boost and Float.',
    notes: 'Low charging efficiency because it drags the solar panel voltage down to the battery voltage, discarding excess power.'
  },

  // 4. DC-DC Converter
  {
    id: 'dcdc-buck-24v-12v-10a',
    partNumber: 'DG-B-2412-10',
    name: 'Daygreen 24V to 12V 10A Buck Converter',
    category: 'DC-DC Converter',
    brand: 'Daygreen',
    price: 1250,
    shortDesc: 'Step-down converter delivering stable 12V DC output from a 24V battery source, with IP68 waterproof rating.',
    availability: 'In Stock',
    specs: {
      'Converter Type': 'Buck (Step-Down) Non-Isolated',
      'Input Voltage Range': '18V - 35V DC',
      'Output Voltage': '12.0V DC (Fixed)',
      'Continuous Output Current': '10A',
      'Rated Output Power': '120W',
      'Conversion Efficiency': '96%',
      'Waterproof Rating': 'IP68 Epoxy Encapsulated',
      'Heat Dissipation': 'Die-cast Aluminium Enclosure'
    },
    electricalRatings: {
      voltage: '24V to 12V',
      current: '10A Output',
      power: '120W Rated',
      efficiency: '96%'
    },
    dimensions: '74 x 74 x 32 mm',
    typicalApplications: 'Powering 12V DC water pumps and sensors from a primary 24V battery bank.',
    datasheetPreview: 'DAYGREEN MILITARY-GRADE STEP-DOWN COMPLIANCE\n- Full protection: Over-voltage, Over-current, Short-circuit, Over-temp.\n- Mean Time Between Failures (MTBF): > 100,000 hours.',
    notes: 'Extremely durable. Epoxied aluminum shell makes it perfect for humid evaporative cooler cabinets.'
  },
  {
    id: 'dcdc-boost-12v-24v-10a',
    partNumber: 'DG-B-1224-10',
    name: 'Daygreen 12V to 24V 10A Boost Converter',
    category: 'DC-DC Converter',
    brand: 'Daygreen',
    price: 1850,
    shortDesc: 'Step-up converter to run 24V DC motor loads efficiently from a standard 12V battery system.',
    availability: 'In Stock',
    specs: {
      'Converter Type': 'Boost (Step-Up) Non-Isolated',
      'Input Voltage Range': '9V - 20V DC',
      'Output Voltage': '24.0V DC (Fixed)',
      'Continuous Output Current': '10A',
      'Rated Output Power': '240W',
      'Conversion Efficiency': '95%',
      'Waterproof Rating': 'IP68 Epoxy Encapsulated',
      'Heat Dissipation': 'Finned Aluminium Case'
    },
    electricalRatings: {
      voltage: '12V to 24V',
      current: '10A Output',
      power: '240W Rated',
      efficiency: '95%'
    },
    dimensions: '100 x 80 x 39 mm',
    typicalApplications: 'Running heavy 24V brushless main motors from a cost-effective 12V battery array.',
    datasheetPreview: 'HIGH-POWER STEP-UP CONVERTER CODE\n- High surge capability: supports motor initial start currents up to 15A.\n- Auto-shutoff when battery input falls below 8.5V to prevent deep discharge.',
    notes: 'Requires adequate ventilation as boost conversion generates substantial localized heat at maximum load.'
  },
  {
    id: 'dcdc-buckboost-9v36v-12v',
    partNumber: 'BB-93612-08',
    name: 'Buck-Boost Stable 12V Regulator',
    category: 'DC-DC Converter',
    brand: 'Generic OEM',
    price: 2450,
    shortDesc: 'Wide range buck-boost regulator delivering precise 12.0V output regardless of battery voltage fluctuations.',
    availability: 'In Stock',
    specs: {
      'Converter Type': 'Buck-Boost (Automatic Step-Up/Down)',
      'Input Voltage Range': '9V - 36V DC',
      'Output Voltage': '12.0V DC (Fixed)',
      'Continuous Output Current': '8A',
      'Rated Output Power': '96W',
      'Conversion Efficiency': '94%',
      'Waterproof Rating': 'IP67 Dust & Splashing Proof',
      'Heat Dissipation': 'Aluminium plate heatsink'
    },
    electricalRatings: {
      voltage: '9-36V to 12V',
      current: '8A Output',
      power: '96W Rated',
      efficiency: '94%'
    },
    dimensions: '74 x 74 x 32 mm',
    typicalApplications: 'Powering sensitive electronics (such as ESP32, STM32, or high-accuracy humidity sensors).',
    datasheetPreview: 'AUTOMATIC SEAMLESS BUCK-BOOST TRANSLATION\n- Excellent for handling extreme battery voltage sagging under heavy motor starts.\n- High-frequency switching ripple: < 50mVp-p.',
    notes: 'Solves the issue where 12V LFP batteries dip under load and cause microcontrollers to crash/brownout.'
  },
  {
    id: 'dcdc-buck-48v-24v-15a',
    partNumber: 'DG-B-4824-15',
    name: 'Daygreen 48V to 24V 15A Step-Down Converter',
    category: 'DC-DC Converter',
    brand: 'Daygreen',
    price: 3200,
    shortDesc: 'High-current 360W buck converter to step down 48V primary power grids for 24V system accessories.',
    availability: 'In Stock',
    specs: {
      'Converter Type': 'Buck (Step-Down) Non-Isolated',
      'Input Voltage Range': '30V - 60V DC',
      'Output Voltage': '24.0V DC (Fixed)',
      'Continuous Output Current': '15A',
      'Rated Output Power': '360W',
      'Conversion Efficiency': '97%',
      'Waterproof Rating': 'IP68 Epoxy Encapsulated',
      'Heat Dissipation': 'Heavily Finned Die-cast Aluminium Case'
    },
    electricalRatings: {
      voltage: '48V to 24V',
      current: '15A Output',
      power: '360W Rated',
      efficiency: '97%'
    },
    dimensions: '100 x 80 x 39 mm',
    typicalApplications: 'Powering 24V auxiliary blowers and high-flow water pumps from a 48V telecom-grade battery bank.',
    datasheetPreview: 'HIGH POWER INDUSTRIAL CONVERTER INTERCONNECT\n- Incorporates synchronous rectification technology to minimize heat output.\n- Input transient reverse polarity protection built in.',
    notes: 'Premium converter, highly efficient and stable. Ideal for large system integration.'
  },
  {
    id: 'dcdc-not-needed',
    partNumber: 'SYS-BUS-DIRECT',
    name: 'Direct System Bus (No Converter)',
    category: 'DC-DC Converter',
    brand: 'Generic OEM',
    price: 0,
    shortDesc: 'Bypass connection to run all components directly from matching primary system voltage lines.',
    availability: 'In Stock',
    specs: {
      'Converter Type': 'Direct Copper Connection (No conversion)',
      'Input Voltage Range': '12V / 24V / 48V',
      'Output Voltage': 'Direct Bypass',
      'Continuous Output Current': 'N/A',
      'Rated Output Power': 'N/A',
      'Conversion Efficiency': '100% (Zero Conversion Loss)',
      'Waterproof Rating': 'N/A',
      'Heat Dissipation': 'None Required'
    },
    electricalRatings: {
      voltage: 'System Bus Voltage',
      current: 'Direct Current',
      power: 'Direct Power',
      efficiency: '100%'
    },
    dimensions: 'N/A',
    typicalApplications: 'Systems where solar, batteries, and all motor loads share identical nominal voltages.',
    datasheetPreview: 'DIRECT METALLIC INTERCONNECT\n- Eliminates conversion losses completely.\n- Simplifies wire routing and reduces Bill of Materials costs.',
    notes: 'Ensure all downstream devices match battery operating voltages.'
  },

  // 5. Motor Controller
  {
    id: 'mctrl-bldc-48v-30a',
    partNumber: 'KLS4830S',
    name: 'Kelly KLS-S 24V-48V 30A BLDC Motor Controller',
    category: 'Motor Controller',
    brand: 'Kelly Controls',
    price: 7800,
    shortDesc: 'Programmable sinusoidal motor controller supporting regenerative braking and high-speed brushless motors.',
    availability: 'In Stock',
    specs: {
      'Motor Compatibility': 'Brushless DC (BLDC) with Hall Sensors',
      'Nominal Voltage Range': '24V - 48V DC',
      'Max Peak Current': '100A (30s peak)',
      'Continuous Phase Current': '30A',
      'PWM Frequency': '20 kHz',
      'Control Mode': 'Sinusoidal FOC (Field Oriented Control)',
      'Communication Interface': 'RS232 / CAN Bus / UART',
      'Protection Features': 'Over-temp, Over-volt, Under-volt, Rotor stall lockout'
    },
    electricalRatings: {
      voltage: '24V - 48V DC',
      current: '30A Continuous',
      power: 'Max 1500W',
      efficiency: '97%'
    },
    dimensions: '108 x 78 x 43 mm',
    typicalApplications: 'Driving 24V or 48V high-torque BLDC main blower fans with smooth rotational speed profiles.',
    datasheetPreview: 'KELLY KLS-S FOC ALGORITHM STANDARDS\n- Configurable via PC or Android app (via Bluetooth adapter).\n- Multi-stage thermal fallback protection to protect power MOSFETs.',
    notes: 'Premium FOC controller, providing ultra-silent motor operations (no high-frequency motor whining).'
  },
  {
    id: 'mctrl-bldc-24v-20a',
    partNumber: 'JY01-BLDC-G2',
    name: 'JY01 Brushless Motor Driver Board (24V 20A)',
    category: 'Motor Controller',
    brand: 'Generic OEM',
    price: 1650,
    shortDesc: 'Affordable, compact bare PCB driver board for sensorless or sensored brushless DC fans and motors.',
    availability: 'In Stock',
    specs: {
      'Motor Compatibility': 'BLDC (Sensored / Sensorless)',
      'Nominal Voltage Range': '12V - 36V DC',
      'Max Peak Current': '25A',
      'Continuous Current': '20A',
      'PWM Support': '1 kHz - 20 kHz Analog/PWM input',
      'Control Mode': 'Trapezoidal commutation',
      'Communication Interface': 'None (Direct analogue control pins)',
      'Protection Features': 'Over-current protection, rotor stall locking'
    },
    electricalRatings: {
      voltage: '12V - 36V DC',
      current: '20A Continuous',
      power: 'Max 480W',
      efficiency: '93%'
    },
    dimensions: '63 x 45 x 18 mm',
    typicalApplications: 'Direct driver for medium-scale 24V brushless axial fans and blower systems.',
    datasheetPreview: 'JY01 INTEGRATED SENSORLESS STARTUP COMPLIANCE\n- Supports tachometer pulse output for closed-loop RPM monitoring.\n- Simple potentiometer hookup for manual velocity setting.',
    notes: 'Bare PCB without enclosure. Requires mounting on a metal heatsink for continuous operation above 10A.'
  },
  {
    id: 'mctrl-brushed-12v-40a',
    partNumber: 'MDD10A-MD',
    name: 'Cytron Smart Brushed DC Motor Driver (12V-24V 40A)',
    category: 'Motor Controller',
    brand: 'Cytron',
    price: 2450,
    shortDesc: 'Dual-channel high current brushed DC driver board with lock-antiphase and sign-magnitude PWM modes.',
    availability: 'In Stock',
    specs: {
      'Motor Compatibility': 'Brushed DC Motors',
      'Nominal Voltage Range': '5V - 30V DC',
      'Max Peak Current': '80A (10s peak)',
      'Continuous Current': '40A',
      'PWM Support': 'Up to 20 kHz PWM inputs',
      'Control Mode': 'Dual H-Bridge MOSFET gating',
      'Communication Interface': 'TTL Serial / PWM / Analog Control',
      'Protection Features': 'Over-current limiting with red status LED'
    },
    electricalRatings: {
      voltage: '5V - 30V DC',
      current: '40A Continuous',
      power: 'Max 960W',
      efficiency: '96%'
    },
    dimensions: '84 x 59 x 20 mm',
    typicalApplications: 'Powering 12V brushed blower motors and high-current mechanical swings.',
    datasheetPreview: 'CYTRON MDD10A SMART SERIES\n- Features manual push-buttons for on-board testing of motor spin direction.\n- Solid state H-bridge provides extremely fast response speeds.',
    notes: 'Great driver for robust brushed DC motors. Lacks CAN bus, but works flawlessly with ESP32/Pico PWM pins.'
  },

  // 6. Main Motor
  {
    id: 'motor-bldc-48v-350w',
    partNumber: 'AF-M48350-BL',
    name: 'AmpFlow 48V 350W Brushless DC Motor',
    category: 'Main Motor',
    brand: 'AmpFlow',
    price: 8900,
    shortDesc: 'High efficiency, high torque industrial-grade brushless motor engineered for heavy-duty fan blades.',
    availability: 'In Stock',
    specs: {
      'Motor Type': 'Brushless DC (BLDC) Inner Rotor',
      'Rated Voltage': '48V DC',
      'Rated Power': '350W',
      'Rated RPM': '3000 RPM',
      'Rated Torque': '1.11 Nm',
      'Rated Current': '8.2 A',
      'Peak Current': '24.0 A',
      'Peak Efficiency': '88%',
      'Bearing Type': 'Double Sealed Ball Bearings',
      'Shaft Diameter': '10 mm with keyway'
    },
    electricalRatings: {
      voltage: '48V DC',
      current: '8.2A Rated',
      power: '350W Continuous',
      efficiency: '88%'
    },
    dimensions: '80 x 80 x 120 mm',
    typicalApplications: 'Primary air blower for commercial evaporative coolers or large-scale exhaust setups.',
    datasheetPreview: 'AMPFLOW BLDC HIGH TORQUE SPEC SHEET\n- Dual-direction spin. Neodymium magnets (NdFeB) for compact size.\n- Integrated temperature sensor to signal controller during thermal stress.',
    notes: 'Outstanding power-to-weight ratio. Must be paired with a compatible brushless motor controller.'
  },
  {
    id: 'motor-bldc-24v-150w',
    partNumber: 'GM-M24150-BL',
    name: 'Golden Motor 24V 150W Brushless DC Motor',
    category: 'Main Motor',
    brand: 'Golden Motor',
    price: 4800,
    shortDesc: 'Highly reliable 24V brushless motor offering high efficiency, quiet operation and long service life.',
    availability: 'In Stock',
    specs: {
      'Motor Type': 'Brushless DC (BLDC) Inner Rotor',
      'Rated Voltage': '24V DC',
      'Rated Power': '150W',
      'Rated RPM': '2500 RPM',
      'Rated Torque': '0.57 Nm',
      'Rated Current': '7.4 A',
      'Peak Efficiency': '85%',
      'Bearing Type': 'Sealed Precision Bearings',
      'Shaft Diameter': '8 mm with D-cut'
    },
    electricalRatings: {
      voltage: '24V DC',
      current: '7.4A Rated',
      power: '150W Continuous',
      efficiency: '85%'
    },
    dimensions: '70 x 70 x 95 mm',
    typicalApplications: 'Medium duty axial fans, multi-speed evaporative blowers and custom fan manifolds.',
    datasheetPreview: 'GOLDEN MOTOR COMPACT HIGH VELOCITY DATA\n- Low electromagnetic interference (EMI).\n- Fully balanced rotor to eliminate structural cabinet vibrations.',
    notes: 'Extremely quiet. Works beautifully with standard 24V LFP batteries and basic BLDC drivers.'
  },
  {
    id: 'motor-brushed-12v-80w',
    partNumber: 'JE-M12080-BR',
    name: 'Johnson Electric 12V 80W Brushed DC Motor',
    category: 'Main Motor',
    brand: 'Johnson Electric',
    price: 2450,
    shortDesc: 'Classic carbon-brushed DC motor delivering solid starting torque at an entry-level price point.',
    availability: 'In Stock',
    specs: {
      'Motor Type': 'Permanent Magnet Brushed DC (PMDC)',
      'Rated Voltage': '12V DC',
      'Rated Power': '80W',
      'Rated RPM': '2000 RPM',
      'Rated Torque': '0.38 Nm',
      'Rated Current': '8.9 A',
      'Peak Efficiency': '78%',
      'Bearing Type': 'Sintered Bronze Sleeve Bearings',
      'Shaft Diameter': '6.35 mm (1/4") shaft'
    },
    electricalRatings: {
      voltage: '12V DC',
      current: '8.9A Rated',
      power: '80W Continuous',
      efficiency: '78%'
    },
    dimensions: '60 x 60 x 85 mm',
    typicalApplications: 'Small portable cooling fans, air circulation pumps, and active cabinet venting.',
    datasheetPreview: 'JOHNSON ELECTRIC CARBON BRUSH MATRIX\n- Replaceable brushes for extended mechanical life.\n- High starting torque allows starting under high static loads.',
    notes: 'Simple to drive (can run directly off a 12V battery with a simple switch or cheap brushed ESC).'
  },

  // 7. Water Pump
  {
    id: 'pump-dc-12v-5w',
    partNumber: 'JT-180-12',
    name: 'JT-180 Miniature Brushless Water Pump (12V)',
    category: 'Water Pump',
    brand: 'Generic OEM',
    price: 450,
    shortDesc: 'Compact submersible or inline water pump running on brushless magnetic drive, highly energy efficient.',
    availability: 'In Stock',
    specs: {
      'Pump Mechanism': 'Brushless Magnetic Drive Centrifugal',
      'Operating Voltage': '12V DC',
      'Max Flow Rate': '350 Liters/Hour (1.54 GPM)',
      'Max Static Head': '2.0 meters (6.5 feet)',
      'Rated Current': '0.40 A',
      'Power Consumption': '4.8W',
      'Waterproof Rating': 'IP68 Submersible',
      'Lifespan': '> 30,000 hours'
    },
    electricalRatings: {
      voltage: '12V DC',
      current: '0.40A',
      power: '4.8W',
      efficiency: '89%'
    },
    dimensions: '55 x 38 x 42 mm',
    typicalApplications: 'Circulating water to wet cooling pads in portable 1.0 Ton evaporative coolers.',
    datasheetPreview: 'JT-180 SUBMERSED FLUID FLUX\n- Designed for continuous 24/7 quiet operation (< 35 dBA).\n- Note: Centrifugal pump cannot self-prime; must be submersed in water.',
    notes: 'Zero mechanical seal friction, eliminating water leak points. Consumes tiny solar load.'
  },
  {
    id: 'pump-dc-24v-15w',
    partNumber: 'JT-550-24',
    name: 'JT-550 High-Flow Brushless Pump (24V)',
    category: 'Water Pump',
    brand: 'Generic OEM',
    price: 1250,
    shortDesc: 'Higher voltage, heavy-flow submersible pump designed for bigger water distribution systems.',
    availability: 'In Stock',
    specs: {
      'Pump Mechanism': 'Brushless Magnetic Centrifugal',
      'Operating Voltage': '24V DC',
      'Max Flow Rate': '1000 Liters/Hour (4.4 GPM)',
      'Max Static Head': '5.0 meters (16.4 feet)',
      'Rated Current': '0.60 A',
      'Power Consumption': '14.4W',
      'Waterproof Rating': 'IP68 Submersible',
      'Inlet / Outlet Size': '12 mm outer diameter'
    },
    electricalRatings: {
      voltage: '24V DC',
      current: '0.60A',
      power: '14.4W',
      efficiency: '91%'
    },
    dimensions: '82 x 48 x 52 mm',
    typicalApplications: 'Large commercial cooling pad supply, multi-stage filtration loops, and tall vertical risers.',
    datasheetPreview: 'JT-550 CALIBRATED PRESSURE HEAD\n- High torque impeller prevents clogging from minor scale buildup.\n- Safe for operation with saline or grey water spray.',
    notes: 'Very high flow for its small 15W rating, ensuring fast pad saturation during peak heat periods.'
  },
  {
    id: 'pump-dc-12v-15w',
    partNumber: 'SF-DP12-15',
    name: 'SEAFLO Positive Displacement Diaphragm Pump (12V)',
    category: 'Water Pump',
    brand: 'SEAFLO',
    price: 2450,
    shortDesc: 'Self-priming positive displacement diaphragm pump delivering high pressure for misting nozzles.',
    availability: 'In Stock',
    specs: {
      'Pump Mechanism': '3-Chamber Positive Displacement Diaphragm',
      'Operating Voltage': '12V DC',
      'Max Flow Rate': '450 Liters/Hour (1.2 GPM)',
      'Max Pressure': '35 PSI (2.4 Bar)',
      'Rated Current': '1.25 A',
      'Power Consumption': '15W',
      'Waterproof Rating': 'IP66 Dust & Splash Proof',
      'Self-Priming': 'Up to 1.8m (6 feet) dry lift'
    },
    electricalRatings: {
      voltage: '12V DC',
      current: '1.25A',
      power: '15W',
      efficiency: '80%'
    },
    dimensions: '160 x 100 x 60 mm',
    typicalApplications: 'Running high-pressure water misting nozzles to boost evaporative efficiency in low humidity.',
    datasheetPreview: 'SEAFLO 21-SERIES DIAPHRAGM MANUAL\n- Capable of running dry without damage.\n- Integrated pressure demand switch turns pump off automatically at high pressure limits.',
    notes: 'Self-priming ability allows placing the pump above the water level for easier dry-access servicing.'
  },

  // 8. Swing Motor
  {
    id: 'swing-servo-5v',
    partNumber: 'MG996R-SG',
    name: 'TowerPro MG996R High-Torque Metal Gear Servo',
    category: 'Swing Motor',
    brand: 'TowerPro',
    price: 450,
    shortDesc: 'Classic metal gear servo with high positioning torque, ideal for precise damper steering.',
    availability: 'In Stock',
    specs: {
      'Motor Type': 'Coreless Brushed DC with Metal Gearbox',
      'Operating Voltage': '4.8V - 6.6V DC',
      'Stall Torque': '1.1 Nm (at 6.0V)',
      'Rotation Angle': '0° to 180° Configurable',
      'Speed': '60° in 0.16 seconds',
      'Average Current': '0.50 A',
      'Control Protocol': 'PWM Duty Cycle (50Hz standard)',
      'Feedback Type': 'Potentiometer internal position'
    },
    electricalRatings: {
      voltage: '5V DC',
      current: '0.50A Average',
      power: '2.5W',
      efficiency: '75%'
    },
    dimensions: '40.7 x 19.7 x 42.9 mm',
    typicalApplications: 'Steering internal directional air louvers or louvre sweep cycles in smart coolers.',
    datasheetPreview: 'MG996R POSITIONING MATRIX\n- All steel gears for extreme wear resistance.\n- Standard 3-pin connector (VCC, GND, PWM Signal).',
    notes: 'Needs stable 5V rail. Avoid running directly off noisy 12V system rails. Position controllable directly via microcontroller.'
  },
  {
    id: 'swing-stepper-12v',
    partNumber: 'N17-40-S',
    name: 'NEMA 17 Hybrid Stepper Motor (12V)',
    category: 'Swing Motor',
    brand: 'Generic OEM',
    price: 950,
    shortDesc: 'Precise bipolar stepper motor, ideal for quiet, continuous, and micro-stepped swing motions.',
    availability: 'In Stock',
    specs: {
      'Motor Type': 'Bipolar Stepper (1.8°/step, 200 steps/rev)',
      'Operating Voltage': '12V DC (Nominal)',
      'Holding Torque': '0.40 Nm',
      'Rated Current': '1.50 A per phase',
      'Phase Resistance': '1.6 Ohms',
      'Phase Inductance': '3.2 mH',
      'Rotation Angle': '360° Continuous Rotation',
      'Connector': '4-Pin JST PH Female'
    },
    electricalRatings: {
      voltage: '12V DC',
      current: '1.50A per phase',
      power: '6.0W',
      efficiency: '85%'
    },
    dimensions: '42 x 42 x 40 mm',
    typicalApplications: 'High-accuracy continuous sweep grids, dynamic custom cooling manifolds.',
    datasheetPreview: 'NEMA 17 BIPOLAR CALIBRATED STEP\n- Double shaft option. Step accuracy ±5%.\n- Temperature rise max 80°C under full continuous hold.',
    notes: 'Requires a stepper driver chip (like A4988 or TMC2208) to trigger step/direction signals from controller.'
  },
  {
    id: 'swing-sync-12v',
    partNumber: 'TYC-50-12V',
    name: 'Tyco 12V DC Synchronous Oscillation Motor',
    category: 'Swing Motor',
    brand: 'Generic OEM',
    price: 650,
    shortDesc: 'AC-style low RPM gearbox synchronous motor running on 12V DC, ideal for auto-swing structures.',
    availability: 'In Stock',
    specs: {
      'Motor Type': 'Permanent Magnet DC Geared Swing',
      'Operating Voltage': '12V DC',
      'Speed': '5 to 6 RPM',
      'Output Torque': '0.80 Nm',
      'Power Consumption': '3.0W',
      'Rotation Angle': '90° Mechanical Sweep Arm Built-in',
      'Rotation Direction': 'CW / CCW (Automatic reverse upon stall limit)',
      'Shaft Type': '7 mm Flat D-shaft'
    },
    electricalRatings: {
      voltage: '12V DC',
      current: '0.25A',
      power: '3.0W',
      efficiency: '70%'
    },
    dimensions: '50 x 50 x 24 mm',
    typicalApplications: 'Traditional continuous left-to-right auto-swing louvres with no programming required.',
    datasheetPreview: 'TYC-50 DC OSICLLATING GEARBOX\n- Heavy-duty nylon gearbox for near silent running.\n- Zero controller code required: spins continuously when 12V is applied.',
    notes: 'Super simple deployment. Connects directly to main 12V load output without complex microcontroller drivers.'
  },

  // 9. Sensors
  {
    id: 'sensor-sht31',
    partNumber: 'SHT31-D-SENS',
    name: 'Sensirion SHT31-D Temp/Humidity Sensor',
    category: 'Sensors',
    brand: 'Sensirion',
    price: 450,
    shortDesc: 'Highly accurate, chemically resistive sensor to monitor dry bulb and wet bulb temperatures.',
    availability: 'In Stock',
    specs: {
      'Sensor Type': 'Digital Temperature & Relative Humidity',
      'Temperature Accuracy': '±0.2°C (range 0°C to 90°C)',
      'Humidity Accuracy': '±2% RH (range 0% to 100% RH)',
      'Interface': 'I2C (Address 0x44 or 0x45)',
      'Supply Voltage': '2.4V to 5.5V DC',
      'Response Time': '8 seconds (t63%)',
      'Filter': 'PTFE membrane cover for water protection'
    },
    electricalRatings: {
      voltage: '3.3V / 5V DC',
      current: '2.0mA',
      power: '0.01W',
      efficiency: '100%'
    },
    dimensions: '18 x 16 x 3 mm',
    typicalApplications: 'Measuring real-time relative humidity to calculate evaporative cooling efficacy.',
    datasheetPreview: 'SHT31 CHIP-SCALE TEMPERATURE SPEC\n- Fully calibrated and linearized digital output.\n- Chemically resistive to chlorine and alkaline mineral scaling.',
    notes: 'The industry standard for accurate environmental measurements. Placed in the inlet air corridor.'
  },
  {
    id: 'sensor-ultrasonic',
    partNumber: 'MB-1013-LV',
    name: 'MaxBotix Ultrasonic Water Level Transceiver',
    category: 'Sensors',
    brand: 'MaxBotix',
    price: 2450,
    shortDesc: 'Acoustic rangefinder to measure water reservoir level accurately, preventing dry pump runs.',
    availability: 'In Stock',
    specs: {
      'Sensor Type': 'Acoustic Ultrasonic Distance Sensor',
      'Resolution': '1 mm',
      'Sensing Range': '30 cm to 500 cm (11.8" to 196")',
      'Accuracy': '±1% of reading',
      'Supply Voltage': '2.7V to 5.5V DC',
      'Average Current': '3.1mA',
      'Output Formats': 'Analogue Voltage, Pulse Width, Serial TTL'
    },
    electricalRatings: {
      voltage: '5V DC',
      current: '3.1mA',
      power: '0.015W',
      efficiency: '100%'
    },
    dimensions: '22 x 20 x 25 mm',
    typicalApplications: 'Continuous water depth monitoring to automatically trigger water refill valves or shut down dry pumps.',
    datasheetPreview: 'MAXBOTIX MB1013 ACOUSTIC FILTER\n- Narrow beam angle to avoid reading container side-wall rib reflections.\n- Auto-compensation for changes in humidity and air temp.',
    notes: 'Must be mounted at the top of the reservoir tank looking downward.'
  },
  {
    id: 'sensor-ina219',
    partNumber: 'INA219-PWR',
    name: 'INA219 High-Side DC Power & Current Monitor',
    category: 'Sensors',
    brand: 'Texas Instruments',
    price: 220,
    shortDesc: 'I2C-based power monitor measuring battery voltage and system current up to 3.2A with a 0.1 Ohm shunt.',
    availability: 'In Stock',
    specs: {
      'Sensor Type': 'High-Side Current & Voltage Sensor',
      'Bus Voltage Range': '0V to 26V DC',
      'Max Measurable Current': '±3.2A',
      'Measurement Resolution': '0.8 mA',
      'Interface': 'I2C bus (Multi-address compatible)',
      'Supply Voltage': '3.0V to 5.5V DC',
      'Shunt Resistor': '0.1 Ohm alloy resistor'
    },
    electricalRatings: {
      voltage: '3.3V / 5V DC',
      current: '1.0mA',
      power: '0.005W',
      efficiency: '99%'
    },
    dimensions: '22 x 20 x 4 mm',
    typicalApplications: 'Real-time telemetry to track power usage from small fans and sensors.',
    datasheetPreview: 'TI INA219 SMART SHUNT PROTOCOL\n- Directly outputs power in milliwatts over I2C.\n- High precision alloy shunt prevents calibration drift.',
    notes: 'Simple to deploy, but current is strictly limited to 3.2A. Exceeding this will burn out the shunt.'
  },
  {
    id: 'sensor-ina226',
    partNumber: 'INA226-PRO',
    name: 'INA226 High-Current Power Monitor (36V 15A)',
    category: 'Sensors',
    brand: 'Texas Instruments',
    price: 480,
    shortDesc: 'Premium power monitoring chip with ultra-low shunt resistance, tracking high currents up to 15A.',
    availability: 'In Stock',
    specs: {
      'Sensor Type': 'Bidirectional Current & Power Monitor',
      'Bus Voltage Range': '0V to 36V DC',
      'Max Measurable Current': '±15.0A (Scaleable with custom shunt)',
      'Measurement Resolution': '0.1 mA',
      'Interface': 'I2C (Up to 16 programmable addresses)',
      'Shunt Resistor': '0.01 Ohm copper-manganese shunt',
      'Bus Voltage Accuracy': '0.1% Max Deviation'
    },
    electricalRatings: {
      voltage: '3.3V / 5V DC',
      current: '1.0mA',
      power: '0.005W',
      efficiency: '99.5%'
    },
    dimensions: '22 x 20 x 4 mm',
    typicalApplications: 'Tracking solar generation, battery status, and motor draw in 24V setups.',
    datasheetPreview: 'INA226 CHIP-SCALE TELEMETRY CODES\n- Built-in programmable conversion time and alert pinouts.\n- Capable of measuring shunt voltage down to 10 microvolts.',
    notes: 'Superior current capabilities. Perfect for tracking real-time motor efficiency.'
  },

  // 10. Controller PCB
  {
    id: 'pcb-esp32-wroom',
    partNumber: 'ESP32-WROOM-32E',
    name: 'Espressif ESP32-WROOM MCU Board',
    category: 'Controller PCB',
    brand: 'Espressif Systems',
    price: 350,
    shortDesc: 'Highly popular dual-core microcontroller with built-in Wi-Fi and Bluetooth, perfect for IoT coolers.',
    availability: 'In Stock',
    specs: {
      'Processor': 'Xtensa Dual-Core 32-bit LX6 (240 MHz)',
      'GPIO Pin Count': '26 Pin Out',
      'On-Board Flash': '4 MB',
      'Connectivity': 'Wi-Fi 802.11 b/g/n & Bluetooth v4.2 BR/EDR/BLE',
      'ADC Resolution': '12-bit (Multi-channel)',
      'Operating Voltage': '3.3V DC (IO Level)',
      'Input Voltage (USB)': '5.0V DC'
    },
    electricalRatings: {
      voltage: '3.3V DC',
      current: '80mA (Peak 240mA during Wi-Fi transmission)',
      power: '0.26W',
      efficiency: '95%'
    },
    dimensions: '48 x 28 x 12 mm',
    typicalApplications: 'Hosting wireless dashboards, local webservers, and PID environmental loop controls.',
    datasheetPreview: 'ESPRESSIF ESP32 IOT ARCHITECTURE\n- Low-power sleep modes down to 15 microamps.\n- Built-in hardware PWM generators and I2C controllers.',
    notes: 'Outstanding firmware community. Allows remote monitoring via mobile phones.'
  },
  {
    id: 'pcb-rp2040-pico',
    partNumber: 'RP2-PICO-W',
    name: 'Raspberry Pi Pico W',
    category: 'Controller PCB',
    brand: 'Raspberry Pi',
    price: 580,
    shortDesc: 'Excellent dual ARM Cortex-M0+ microcontroller with smart PIO state machines and Wi-Fi interface.',
    availability: 'In Stock',
    specs: {
      'Processor': 'Dual ARM Cortex-M0+ (133 MHz)',
      'GPIO Pin Count': '26 Pin Out',
      'On-Board Flash': '2 MB',
      'Connectivity': 'Single-band 2.4GHz Wi-Fi (Infineon CYW43439)',
      'Programmable IO': '8 State-machine PIO Blocks',
      'ADC Resolution': '12-bit (3 Channels)',
      'Operating Voltage': '3.3V DC'
    },
    electricalRatings: {
      voltage: '3.3V DC',
      current: '45mA',
      power: '0.15W',
      efficiency: '96%'
    },
    dimensions: '51 x 21 x 4 mm',
    typicalApplications: 'Industrial real-time control, high-speed PWM motor pacing, and educational coding.',
    datasheetPreview: 'RP2040 SMART PIO ARCHITECTURE\n- PIO allows executing high frequency subroutines without CPU load.\n- Dual-core setup allows splitting sensor reads and motor loops.',
    notes: 'No built-in Bluetooth (Wi-Fi only on this model). Extremely cheap and reliable.'
  },
  {
    id: 'pcb-stm32-bluepill',
    partNumber: 'STM32F103-BP',
    name: 'STM32F103C8T6 Blue Pill MCU Board',
    category: 'Controller PCB',
    brand: 'STMicroelectronics',
    price: 390,
    shortDesc: 'Rugged 32-bit ARM Cortex-M3 board with high-speed ADC converters and hardware CAN Bus support.',
    availability: 'In Stock',
    specs: {
      'Processor': 'ARM Cortex-M3 (72 MHz)',
      'GPIO Pin Count': '32 Pin Out',
      'On-Board Flash': '64 KB',
      'Connectivity': 'Hardware CAN 2.0B, USB 2.0 FS, SPI, I2C, USART',
      'ADC Resolution': '12-bit (10 Channels)',
      'Operating Voltage': '3.3V DC',
      'Timers': '4-channel advanced motor control timers'
    },
    electricalRatings: {
      voltage: '3.3V DC',
      current: '35mA',
      power: '0.11W',
      efficiency: '97%'
    },
    dimensions: '53 x 22 x 5 mm',
    typicalApplications: 'Noise-resistant industrial control, CAN-bus integration, and fast closed-loop motor driving.',
    datasheetPreview: 'STM32 HIGH-SPEED MOTOR ENCODER CODES\n- Advanced timers support hardware quadrature encoders.\n- Superior electrical noise and ESD tolerance.',
    notes: 'Requires an external programmer (like ST-Link v2) to flash firmware. No wireless connectivity.'
  },
  {
    id: 'pcb-custom-esp32',
    partNumber: 'CC-ESP32-S3',
    name: 'Custom Industrial Solar Cooler Controller PCB',
    category: 'Controller PCB',
    brand: 'Zazen Solar',
    price: 3200,
    shortDesc: 'All-in-one controller board integrating ESP32-S3, power monitor, relay gate drivers, and screw terminals.',
    availability: 'Low Stock',
    specs: {
      'Processor': 'Xtensa Dual-Core 32-bit ESP32-S3 (240 MHz)',
      'GPIO Pin Count': '18 Industrial Screw Terminals',
      'On-Board Flash': '8 MB with 2MB PSRAM',
      'Power Input': '12V / 24V DC Wide Input Range',
      'On-board Power Monitor': 'Integrated INA226 (measures battery voltage/current)',
      'Gate Drivers': '3 Opto-isolated high-side MOSFET ports (up to 15A continuous)',
      'Connectivity': 'Dual-band Wi-Fi, BLE 5.0, RS485 Transceiver'
    },
    electricalRatings: {
      voltage: '12V - 24V DC Input',
      current: '150mA base (Supports driving external loads up to 15A)',
      power: '1.8W static',
      efficiency: '92% buck conversion efficiency'
    },
    dimensions: '100 x 85 x 20 mm',
    typicalApplications: 'Professional off-grid evaporative coolers, custom smart solar applications.',
    datasheetPreview: 'ZAZEN INDUSTRIAL SMART COOLER BOARD SPEC\n- Features high-current screw terminal blocks for secure connections.\n- Built-in TVS transient surge protection diodes and auto-resettable fuses.',
    notes: 'Highly professional, rugged design. Avoids loose breadboard jumpers and wire nests completely.'
  },

  // 11. Protection Circuit
  {
    id: 'prot-fuse-block',
    partNumber: 'FB-ATO-06',
    name: '6-Way ATO Safety Fuse Block with LED indicators',
    category: 'Protection Circuit',
    brand: 'Blue Sea Systems',
    price: 850,
    shortDesc: 'Automotive fuse holder featuring blown-fuse warning LEDs and a clear protective cover.',
    availability: 'In Stock',
    specs: {
      'Circuit Type': '6-Circuit common bus terminal block',
      'Maximum Voltage': '32V DC',
      'Maximum Current': '30A per circuit (100A total panel)',
      'Fuse Style': 'Standard ATO / ATC Blade Fuses',
      'Screw Terminals': '#8-32 Screws with captive star washers',
      'Ground Bus': 'None (Requires separate ground block)'
    },
    electricalRatings: {
      voltage: '32V DC Max',
      current: '30A Max per circuit',
      power: 'N/A (Passive)'
    },
    dimensions: '85 x 65 x 38 mm',
    typicalApplications: 'Isolating and protecting individual loads (fans, water pumps, controller) with matching fuses.',
    datasheetPreview: 'BLUE SEA 5025 COMPLIANT CIRCUITS\n- Red LED lights up immediately when a fuse blows.\n- Ignition protected - safe for locations near battery gasses.',
    notes: 'Provides a highly professional safety foundation. Fuses are sold separately.'
  },
  {
    id: 'prot-mcb-dc-63a',
    partNumber: 'MCB-DC-2P-63',
    name: 'Midnite Solar 2-Pole 63A DC MCB',
    category: 'Protection Circuit',
    brand: 'Midnite Solar',
    price: 1450,
    shortDesc: 'Industrial-grade DIN-rail mounted DC circuit breaker, serving as a main battery disconnect switch.',
    availability: 'In Stock',
    specs: {
      'Breaker Type': 'Miniature Circuit Breaker (MCB) 2-Pole',
      'Operating Voltage': '125V DC Max',
      'Rated Current': '63A',
      'Interrupt Capacity': '10,000 Amps',
      'Mounting Type': 'Standard 35mm DIN Rail',
      'Wire Range': '14 AWG to 2 AWG'
    },
    electricalRatings: {
      voltage: '125V DC Max',
      current: '63A Trip Rating',
      power: 'N/A (Passive)'
    },
    dimensions: '79 x 35 x 75 mm',
    typicalApplications: 'Main power isolation switch, placed directly between battery bank and system bus.',
    datasheetPreview: 'MIDNITE SOLAR 2-POLE MAGNETIC TRIP\n- Magnetic-thermal mechanism prevents nuisance tripping in hot climates.\n- Bi-directional terminal ratings.',
    notes: 'An essential safety component for high-power (24V or 48V) battery packs.'
  },
  {
    id: 'prot-tvs-diode-pack',
    partNumber: 'TVS-SMAJ-KIT',
    name: 'TVS Transient Surge Protection Diode Pack',
    category: 'Protection Circuit',
    brand: 'Littelfuse',
    price: 350,
    shortDesc: 'Silicon transient voltage suppressors, protecting sensitive microcontroller pins from motor inductive surges.',
    availability: 'In Stock',
    specs: {
      'Diode Types': 'Bidirectional TVS Diodes (SMAJ15CA / SMAJ30CA / SMAJ58CA)',
      'Response Time': '< 1.0 picosecond',
      'Peak Pulse Power': '400 Watts (10/1000us pulse)',
      'Clamping Voltages': 'Calibrated for 12V, 24V or 48V bus systems',
      'Reverse Standoff Volt': '15V / 30V / 58V'
    },
    electricalRatings: {
      voltage: 'Up to 58V Stand-off',
      current: 'N/A',
      power: '400W Pulse Limit'
    },
    dimensions: 'SMD Package',
    typicalApplications: 'Protecting ESP32 and sensor pins from voltage spikes when water pumps or fan motors are turned on/off.',
    datasheetPreview: 'LITTELFUSE SMAJ SERIES CODES\n- Low incremental surge resistance.\n- High reliability and thermal resistance.',
    notes: 'Should be soldered as close as possible to the input pins of sensitive microcontrollers.'
  },

  // 12. Connectors & Wiring
  {
    id: 'conn-xt60-pack',
    partNumber: 'AM-XT60H-M',
    name: 'Amass XT60-H Connectors (5 Pairs)',
    category: 'Connectors & Wiring',
    brand: 'Amass',
    price: 450,
    shortDesc: 'Authentic Amass gold-plated bullet connectors with safety sheaths, ideal for secure battery connections.',
    availability: 'In Stock',
    specs: {
      'Connector Type': 'Male/Female High-Current Bullet Connector',
      'Rated Current': '30A Continuous',
      'Peak Current': '60A Max Pulse (< 2 mins)',
      'Material': 'Gold-Plated Brass and High-temp Nylon Casing',
      'Compatible Wire Gauge': '12 AWG - 14 AWG',
      'Contact Resistance': '0.55 milliohms'
    },
    electricalRatings: {
      voltage: '500V DC Max',
      current: '30A Continuous / 60A Peak',
      power: 'N/A'
    },
    dimensions: '16 x 16 x 8 mm (per pair)',
    typicalApplications: 'Quick-disconnect battery lines, main solar panel feeds, and high-current motor power cables.',
    datasheetPreview: 'AMASS XT60-H CONNECTOR MECHANICAL SPEC\n- Includes back sheaths, removing the need for heat-shrink tubing over solder joints.\n- Polarized housing prevents reverse polarity plugging.',
    notes: 'The gold standard for reliable, high-current, vibrating applications.'
  },
  {
    id: 'conn-xt90-pack',
    partNumber: 'AM-XT90S-AS',
    name: 'Amass XT90-S Anti-Spark Connectors (3 Pairs)',
    category: 'Connectors & Wiring',
    brand: 'Amass',
    price: 750,
    shortDesc: 'Heavy-duty connectors with integrated anti-spark resistors, preventing arcing during connection.',
    availability: 'In Stock',
    specs: {
      'Connector Type': 'Male/Female Anti-Spark Connector',
      'Rated Current': '45A Continuous',
      'Peak Current': '90A Max Pulse',
      'Anti-Spark System': 'Integrated pre-charge resistor in female housing',
      'Compatible Wire Gauge': '8 AWG - 10 AWG',
      'Contact Resistance': '0.30 milliohms'
    },
    electricalRatings: {
      voltage: '500V DC Max',
      current: '45A Continuous / 90A Peak',
      power: 'N/A'
    },
    dimensions: '22 x 20 x 10 mm (per pair)',
    typicalApplications: 'Connecting high-voltage 48V battery modules to prevent scary connector arcing and damage.',
    datasheetPreview: 'XT90S PATENDED ANTI-SPARK TECHNOLOGY\n- Step-one contact routes current through a 5.1 Ohm resistor to pre-charge capacitor banks.\n- Prevents pin erosion from electric arcs.',
    notes: 'Highly recommended for 24V or 48V systems containing big capacitive motor controllers.'
  },
  {
    id: 'conn-silicone-12awg',
    partNumber: 'SIL-12AWG-10',
    name: '12 AWG Superflex Silicone Wire (5m Red + 5m Black)',
    category: 'Connectors & Wiring',
    brand: 'BNTECHGO',
    price: 1150,
    shortDesc: 'Ultra-flexible 12 gauge stranded tinned copper wire with high temperature resistant silicone insulation.',
    availability: 'In Stock',
    specs: {
      'Wire Type': 'High-Stranded Flexible Silicone Cable',
      'Conductor Gauge': '12 AWG (3.31 mm² area)',
      'Strand Count': '680 strands of 0.08 mm tinned copper',
      'Insulation Material': 'High-temp Silicone Rubber',
      'Temperature Rating': '-60°C to +200°C',
      'Rated Current Limit': '88 Amps continuous peak',
      'Outer Diameter': '4.5 mm'
    },
    electricalRatings: {
      voltage: '600V Max Rating',
      current: '88A Rating in open air',
      power: 'N/A'
    },
    dimensions: '10 meters total length (5m Red, 5m Black)',
    typicalApplications: 'Heavy motor phase wires, battery distribution trunks, and general high-current distribution.',
    datasheetPreview: 'BNTECHGO SUPERFLEX CABLE STANDARD\n- Stranded tinned copper prevents oxidation and corrosion in humid air.\n- Extremely flexible - bends easily around tight cabinet corners.',
    notes: 'Much easier to route than stiff PVC insulation wire. Highly durable.'
  },
  {
    id: 'conn-jst-ph2-kit',
    partNumber: 'JST-PH-20-KIT',
    name: 'JST-PH 2.0mm Sensor Connector Kit (120 Pcs)',
    category: 'Connectors & Wiring',
    brand: 'Generic OEM',
    price: 550,
    shortDesc: 'A complete assortment of 2.0mm pitch terminal housings, crimps, and board headers.',
    availability: 'In Stock',
    specs: {
      'Connector Pitch': '2.0 mm',
      'Housing Sizes': '2-Pin, 3-Pin, 4-Pin, 5-Pin, 6-Pin housings',
      'Maximum Voltage': '100V AC/DC',
      'Maximum Current': '2.0A continuous',
      'Contact Material': 'Phosphor Bronze tin-plated',
      'Housing Material': 'Nylon66 UL94V-0'
    },
    electricalRatings: {
      voltage: '100V Max',
      current: '2.0A Max',
      power: 'N/A'
    },
    dimensions: 'Storage box: 130 x 65 x 22 mm',
    typicalApplications: 'Terminating environmental sensors and low-power servo swing connections.',
    datasheetPreview: 'JST-PH COMPACT CRIMP CONNECTOR STANDARDS\n- Ideal for low profile wire-to-board interconnects.\n- Friction locking mechanism prevents vibration disconnects.',
    notes: 'Requires a specialized JST crimping tool (like PA-09 or SN-28B) to attach terminals to wire.'
  }
];
