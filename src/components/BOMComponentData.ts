import { ComponentItem } from './BOMTypes';

export const ALL_COMPONENTS: ComponentItem[] = [
  // 1. COMPRESSORS (Models: Danfoss SC15G, SC18CL, NLX15KK, FR8.5CL; Emerson ZP31K5E, AFE12C4E; Tecumseh AE4440Y, TYA2438YKES; Secop BD35F, BD50F, FR10G; Copeland ZP24K5E-PFV, CR32K6-PFV)
  {
    id: 'comp-danfoss-sc15g',
    partNumber: 'DF-SC15G-002',
    name: 'Danfoss SC15G Hermetic Reciprocating Compressor',
    category: 'Compressor',
    brand: 'Danfoss',
    price: 6800,
    shortDesc: 'Reliable hermetic compressor engineered for high back pressure refrigeration and industrial liquid chillers.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '1.20 Ton (14,400 BTU/h)',
      'Rated Power': '450 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R134a',
      'COP': '1.55 W/W',
      'Temp Range': '-15°C to +15°C',
      'Current Draw': '2.14 A',
      'Weight': '13.1 kg',
      'Mounting Type': 'Spring Grommet base',
      'Noise Level': '48 dBA'
    },
    material: 'Forged Cast Iron Shell',
    efficiency: 'COP 1.55 (Standard High-Back)',
    voltage: '220-240V AC 50Hz',
    powerRating: '450W',
    dimensions: '250 x 180 x 210 mm',
    powerConsumption: '450W continuous load',
    recommendedApp: 'Medium-cabinet hybrid compressor-assisted direct expansions.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Standard residential thermal workload. Base bracket fits standard 4-bolt mounts.'
  },
  {
    id: 'comp-danfoss-sc18cl',
    partNumber: 'DF-SC18CL-005',
    name: 'Danfoss SC18CL Heavy-Duty Chiller Compressor',
    category: 'Compressor',
    brand: 'Danfoss',
    price: 8200,
    shortDesc: 'LBP/MBP multi-refrigerant reciprocating compressor designed for high torque industrial duty cycles.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '1.55 Ton (18,600 BTU/h)',
      'Rated Power': '580 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R404A / R507',
      'COP': '1.62 W/W',
      'Temp Range': '-35°C to -10°C',
      'Current Draw': '3.10 A',
      'Weight': '13.7 kg',
      'Mounting Type': 'Heavy duty base plate',
      'Noise Level': '52 dBA'
    },
    material: 'Thickened Steel Enclosure',
    efficiency: 'COP 1.62 (Low-Temp High-Torque)',
    voltage: '220V AC 50/60Hz',
    powerRating: '580W',
    dimensions: '255 x 180 x 215 mm',
    powerConsumption: '580W continuous load',
    recommendedApp: 'High thermal mass desert hybrid chillers and cold stores.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Requires R404A refrigerant pipelines. Excellent performance in extremely low ambient ranges.'
  },
  {
    id: 'comp-danfoss-nlx15kk',
    partNumber: 'DF-NLX15KK-001',
    name: 'Danfoss NLX15KK Ultra-Low Energy Compressor',
    category: 'Compressor',
    brand: 'Danfoss',
    price: 9500,
    shortDesc: 'Variable speed ultra-high COP compressor using ecological Isobutane refrigerant for minimal solar load.',
    availability: 'Low Stock',
    specs: {
      'Cooling Capacity': '1.0 Ton (12,000 BTU/h)',
      'Rated Power': '320 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R600a',
      'COP': '1.82 W/W',
      'Temp Range': '-30°C to -5°C',
      'Current Draw': '1.45 A',
      'Weight': '11.2 kg',
      'Mounting Type': 'Direct rubber damper',
      'Noise Level': '44 dBA'
    },
    material: 'Alloy Core Shell',
    efficiency: 'COP 1.82 (Eco High-COP)',
    voltage: '220-240V AC 50Hz',
    powerRating: '320W',
    dimensions: '240 x 175 x 200 mm',
    powerConsumption: '320W continuous load',
    recommendedApp: 'High efficiency Solar direct-drive hybrid systems with R600a safety vents.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Saves 30% solar wattage compared to standard reciprocating components.'
  },
  {
    id: 'comp-danfoss-fr8.5cl',
    partNumber: 'DF-FR85CL-009',
    name: 'Danfoss FR8.5CL Compact Commercial Compressor',
    category: 'Compressor',
    brand: 'Danfoss',
    price: 5500,
    shortDesc: 'Compact hermetic compressor ideal for commercial water coolers and auxiliary solar expansion coils.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '0.80 Ton (9,600 BTU/h)',
      'Rated Power': '280 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R404A / R134a',
      'COP': '1.40 W/W',
      'Temp Range': '-30°C to +10°C',
      'Current Draw': '1.30 A',
      'Weight': '10.6 kg',
      'Mounting Type': 'Standard Base plate',
      'Noise Level': '46 dBA'
    },
    material: 'Steel Shell & Copper Rotor',
    efficiency: 'COP 1.40 (Utility Classic)',
    voltage: '220V AC 50Hz',
    powerRating: '280W',
    dimensions: '245 x 175 x 205 mm',
    powerConsumption: '280W continuous load',
    recommendedApp: 'Small personal coolers or backup thermal chillers.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Extremely robust, handles voltage sags down to 180V without stalling.'
  },
  {
    id: 'comp-emerson-zp31k5e',
    partNumber: 'EM-ZP31K5E-R410',
    name: 'Emerson Copeland Scroll ZP31K5E Rotary Compressor',
    category: 'Compressor',
    brand: 'Emerson',
    price: 14500,
    shortDesc: 'High efficiency scroll compressor delivering continuous displacement with extreme mechanical reliability.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '2.20 Ton (26,400 BTU/h)',
      'Rated Power': '980 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R410A',
      'COP': '2.64 W/W',
      'Temp Range': '-10°C to +15°C',
      'Current Draw': '4.50 A',
      'Weight': '24.5 kg',
      'Mounting Type': 'Heavy 4-point Flange',
      'Noise Level': '60 dBA'
    },
    material: 'Reinforced Steel Scroll Cap',
    efficiency: 'COP 2.64 (Scroll Industrial High-COP)',
    voltage: '200-230V AC Single Phase',
    powerRating: '980W',
    dimensions: '290 x 240 x 380 mm',
    powerConsumption: '980W continuous load',
    recommendedApp: 'Heavy duty commercial 2.0 Ton air conditioners and high static duct blowers.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['2.0 Ton']
    },
    notes: 'Premium scroll design. Emits zero pulsation vibration. High starting torque.'
  },
  {
    id: 'comp-emerson-afe12c4e',
    partNumber: 'EM-AFE12C4E-002',
    name: 'Emerson Hermetic AFE12C4E Chiller',
    category: 'Compressor',
    brand: 'Emerson',
    price: 8900,
    shortDesc: 'Hermetic reciprocating compressor optimized for cold chain cooling loops and medium scale coolers.',
    availability: 'Low Stock',
    specs: {
      'Cooling Capacity': '1.15 Ton (13,800 BTU/h)',
      'Rated Power': '390 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R134a',
      'COP': '1.50 W/W',
      'Temp Range': '-20°C to +10°C',
      'Current Draw': '1.80 A',
      'Weight': '12.5 kg',
      'Mounting Type': 'Spring Grommet base',
      'Noise Level': '49 dBA'
    },
    material: 'Forged Cast Iron Shell',
    efficiency: 'COP 1.50 (Reliable Classic)',
    voltage: '220V AC 50Hz',
    powerRating: '390W',
    dimensions: '250 x 180 x 220 mm',
    powerConsumption: '390W',
    recommendedApp: 'Hybrid setups demanding high performance stability on R134a pipelines.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Very quiet operation. Features internal thermal overload protector.'
  },
  {
    id: 'comp-tecumseh-ae4440y',
    partNumber: 'TC-AE4440Y-001',
    name: 'Tecumseh AE4440Y High-Back-Pressure Compressor',
    category: 'Compressor',
    brand: 'Tecumseh',
    price: 6200,
    shortDesc: 'High efficiency small casing compressor designed for intensive heat extraction loops.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '1.00 Ton (12,000 BTU/h)',
      'Rated Power': '350 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R134a',
      'COP': '1.51 W/W',
      'Temp Range': '-15°C to +15°C',
      'Current Draw': '1.60 A',
      'Weight': '9.8 kg',
      'Mounting Type': 'Rubber Grommet footers',
      'Noise Level': '47 dBA'
    },
    material: 'Sealed Carbon Steel Pressing',
    efficiency: 'COP 1.51 (HBP Specialty)',
    voltage: '220-240V AC 50Hz',
    powerRating: '350W',
    dimensions: '235 x 170 x 200 mm',
    powerConsumption: '350W',
    recommendedApp: 'Light commercial and household hybrid water cooling systems.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Low starting current. Ideal for locations with weak off-grid AC inverters.'
  },
  {
    id: 'comp-tecumseh-tya2438ykes',
    partNumber: 'TC-TYA2438-004',
    name: 'Tecumseh TYA2438YKES Large Commercial LBP',
    category: 'Compressor',
    brand: 'Tecumseh',
    price: 11000,
    shortDesc: 'Large volume low temperature compressor engineered for commercial multi-evaporator installations.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '1.80 Ton (21,600 BTU/h)',
      'Rated Power': '820 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R404A',
      'COP': '1.58 W/W',
      'Temp Range': '-40°C to -10°C',
      'Current Draw': '3.90 A',
      'Weight': '18.5 kg',
      'Mounting Type': 'Rigid anchor plate',
      'Noise Level': '55 dBA'
    },
    material: 'Alloy Structural Enclosure',
    efficiency: 'COP 1.58 (LBP Powerhouse)',
    voltage: '220V AC 50/60Hz',
    powerRating: '820W',
    dimensions: '280 x 210 x 260 mm',
    powerConsumption: '820W',
    recommendedApp: 'Dual-circuit heavy duty thermal systems under high load limits.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Requires dual ventilation fan modules to cool down the compressor cylinder head.'
  },
  {
    id: 'comp-secop-bd35f',
    partNumber: 'SC-BD35F-DC48',
    name: 'Secop BD35F Brushless DC Micro Compressor',
    category: 'Compressor',
    brand: 'Secop Germany',
    price: 4800,
    shortDesc: 'Hermetic micro-compressor with integrated brushless motor and 12V/24V electronic controller board.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '0.50 Ton (6,000 BTU/h)',
      'Rated Power': '65 Watts',
      'Voltage': '12V/24V DC Native',
      'Refrigerant': 'R134a',
      'COP': '1.45 W/W',
      'Temp Range': '-30°C to +10°C',
      'Current Draw': '5.40 A @ 12V',
      'Weight': '2.2 kg',
      'Mounting Type': 'Integrated mount bracket',
      'Noise Level': '40 dBA'
    },
    material: 'Die-cast Cylinder Housing',
    efficiency: 'COP 1.45 (Ultra-Low Solar DC)',
    voltage: '12V / 24V DC Auto-Selection',
    powerRating: '65W',
    dimensions: '141 x 105 x 115 mm',
    powerConsumption: '45W - 85W dynamic based on RPM',
    recommendedApp: 'Solar direct-drive mobile or compact outdoor off-grid coolers.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Direct photovoltaic hookup possible. Integrated controller protects against low solar panel battery voltages.'
  },
  {
    id: 'comp-secop-bd50f',
    partNumber: 'SC-BD50F-DC48',
    name: 'Secop BD50F Dynamic Travel Cabinet Compressor',
    category: 'Compressor',
    brand: 'Secop Germany',
    price: 5800,
    shortDesc: 'Higher displacement brushless DC compressor supporting wide speed range for immediate cooling.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '0.75 Ton (9,000 BTU/h)',
      'Rated Power': '85 Watts',
      'Voltage': '12V/24V/48V DC Native',
      'Refrigerant': 'R134a / R290',
      'COP': '1.52 W/W',
      'Temp Range': '-30°C to +10°C',
      'Current Draw': '3.50 A @ 24V',
      'Weight': '2.4 kg',
      'Mounting Type': 'Vibration-dampened base',
      'Noise Level': '41 dBA'
    },
    material: 'Cast Iron Block & Copper Windings',
    efficiency: 'COP 1.52 (High Displacement DC)',
    voltage: '12V / 24V / 48V DC Adaptive',
    powerRating: '85W',
    dimensions: '141 x 105 x 120 mm',
    powerConsumption: '50W - 110W active',
    recommendedApp: 'Highly efficient off-grid solar cabins with 12V or 24V auxiliary power grids.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Compatible with EcoMedia SHT31 sensor automation triggers for power savings.'
  },
  {
    id: 'comp-secop-fr10g',
    partNumber: 'SC-FR10G-AC220',
    name: 'Secop FR10G AC-Drive Industrial Compressor',
    category: 'Compressor',
    brand: 'Secop Germany',
    price: 7100,
    shortDesc: 'Heavy-duty reciprocating compressor with high heat absorption curves and cooling reliability.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '1.05 Ton (12,600 BTU/h)',
      'Rated Power': '410 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R134a',
      'COP': '1.38 W/W',
      'Temp Range': '-30°C to +15°C',
      'Current Draw': '2.10 A',
      'Weight': '10.3 kg',
      'Mounting Type': 'Steel flange with rubber grommets',
      'Noise Level': '46 dBA'
    },
    material: 'Forged Cast Iron Shell',
    efficiency: 'COP 1.38 (Utility Workhorse)',
    voltage: '220-240V AC 50Hz',
    powerRating: '410W',
    dimensions: '250 x 180 x 210 mm',
    powerConsumption: '410W',
    recommendedApp: 'Standard dual-evaporative industrial workspaces.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Traditional commercial workhorse. Highly resilient against start-stop stresses.'
  },
  {
    id: 'comp-copeland-cr32k6',
    partNumber: 'CP-CR32K6-PFV',
    name: 'Copeland CR32K6-PFV Commercial Compressor',
    category: 'Compressor',
    brand: 'Copeland',
    price: 12500,
    shortDesc: 'Hermetic reciprocating compressor providing massive volume displacement for broad cooling loads.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '2.00 Ton (24,000 BTU/h)',
      'Rated Power': '920 Watts',
      'Voltage': '220V AC',
      'Refrigerant': 'R22 / R407C',
      'COP': '2.15 W/W',
      'Temp Range': '-10°C to +12°C',
      'Current Draw': '4.80 A',
      'Weight': '21.0 kg',
      'Mounting Type': 'Heavy welded base plate',
      'Noise Level': '58 dBA'
    },
    material: 'Thick Cast Carbon Steel Case',
    efficiency: 'COP 2.15 (Commercial High Displacement)',
    voltage: '208-230V AC Single Phase',
    powerRating: '920W',
    dimensions: '270 x 230 x 340 mm',
    powerConsumption: '920W',
    recommendedApp: 'High velocity commercial chillers and large solar-hybrid agricultural sheds.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Requires dual start capacitors for safe high compression launches. Runs optimally under heavy expansion caps.'
  },
  {
    id: 'comp-highly-dc48',
    partNumber: 'HL-DC48R-TWIN',
    name: 'Highly Rotary Twin-Cylinder BLDC Compressor',
    category: 'Compressor',
    brand: 'Copeland',
    price: 7200,
    shortDesc: 'Modern twin cylinder rotary scroll compressor natively designed for 48V solar battery configurations.',
    availability: 'Low Stock',
    specs: {
      'Cooling Capacity': '1.60 Ton (19,200 BTU/h)',
      'Rated Power': '480 Watts',
      'Voltage': '48V DC Native',
      'Refrigerant': 'R410A / R32',
      'COP': '1.75 W/W',
      'Temp Range': '-15°C to +10°C',
      'Current Draw': '10.0 A',
      'Weight': '3.4 kg',
      'Mounting Type': 'Hanging loop style',
      'Noise Level': '43 dBA'
    },
    material: 'Hardened Anodized Aluminum Enclosure',
    efficiency: 'COP 1.75 (Energy Star BLDC)',
    voltage: '48V DC Native (PWM Driven)',
    powerRating: '480W',
    dimensions: '165 x 120 x 135 mm',
    powerConsumption: '100W - 550W fully variable',
    recommendedApp: 'High efficiency off-grid telecom shelters and desert solar hybrid water systems.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Native 48V DC. Removes inverter losses. Integrates seamlessly with MPPT smart drives.'
  },
  {
    id: 'comp-bypass',
    partNumber: 'BY-COMP-NODE',
    name: 'Compressor Bypass Conduit Node',
    category: 'Compressor',
    brand: 'N/A (Evaporative Design)',
    price: 0,
    shortDesc: 'Direct-air structural layout frame. No compressor required when operating in pure evaporative designs.',
    availability: 'In Stock',
    specs: {
      'Cooling Capacity': '0.00 Ton',
      'Rated Power': '0 Watts',
      'Voltage': 'None',
      'Refrigerant': 'None',
      'COP': 'N/A',
      'Temp Range': '-40°C to +60°C',
      'Current Draw': '0 A',
      'Weight': '0.2 kg',
      'Mounting Type': 'Snap-on bypass grid',
      'Noise Level': '0 dBA'
    },
    material: 'Acetal Resin',
    efficiency: '100% Passive Bypass Flow',
    voltage: 'None',
    powerRating: '0W',
    dimensions: '120 x 120 x 80 mm',
    powerConsumption: '0W',
    recommendedApp: 'Direct and Indirect water evaporation systems where compression cooling is bypassed.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Passive conduit. Excludes heavy electrical or fluid load entirely.'
  },

  // 2. CONDENSER
  {
    id: 'cond-alu-micro',
    partNumber: 'CO-ALM-12PF',
    name: 'Aluminium Microchannel Condenser (12")',
    category: 'Condenser',
    brand: 'SubZero',
    price: 1250,
    shortDesc: 'Ultra light and highly conductive microchannel condenser with dust repellent resin coating.',
    availability: 'In Stock',
    specs: {
      'Tube Area': '0.12 m²',
      'Refrigerant Compatibility': 'R134a / R600a',
      'Row Count': '1 Inline Row',
      'Fin Design': 'Parallel flow multi-louver'
    },
    material: '3003 Grade Aluminum Alloy',
    efficiency: '94% Heat Rejection Efficiency',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '300 x 320 x 20 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Compact hybrid compressors with 12" cabinet dimensions.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Extremely thin profile. High salt spray corrosion resistance (500 hrs ASTM B117).'
  },
  {
    id: 'cond-copper-dual',
    partNumber: 'CO-COP-16DF',
    name: 'Dual-Row Inner-Grooved Copper Condenser',
    category: 'Condenser',
    brand: 'Carrier Industries',
    price: 1950,
    shortDesc: 'Dual rows of grooved copper tubes with mechanical aluminum sine-wave helper fins for max surface exchange.',
    availability: 'In Stock',
    specs: {
      'Tube Area': '0.24 m²',
      'Refrigerant Compatibility': 'Universal (R134a, R410A, R404A)',
      'Row Count': '2 Offset Rows',
      'Fin Design': 'Corrugated inner grooved'
    },
    material: 'Oxygen-Free Copper Tubes & Epoxy Fins',
    efficiency: '97% Thermal Rejection Efficiency',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '360 x 380 x 32 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'High temperature desert zones. Pair with high static CFM fans.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Supports operating pressures up to 45 bar. Ideal for heavy R410A scroll setups.'
  },
  {
    id: 'cond-bypass',
    partNumber: 'BY-COND-NODE',
    name: 'Condenser Bypass Loop (Pure Evaporative)',
    category: 'Condenser',
    brand: 'N/A (Evaporative Design)',
    price: 0,
    shortDesc: 'Fluid loop shunt bypass tube. Condensers are bypassed in water evaporation modes.',
    availability: 'In Stock',
    specs: {
      'Tube Area': '0.00 m²',
      'Refrigerant Compatibility': 'None',
      'Row Count': 'None',
      'Fin Design': 'None'
    },
    material: 'PVC Fitting',
    efficiency: 'N/A',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '100 x 50 x 50 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Evaporative chillers without secondary gas loops.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Bypasses plumbing to avoid pressure drag.'
  },

  // 3. EVAPORATOR
  {
    id: 'evap-honey-12',
    partNumber: 'EV-HON-CEL12',
    name: 'Honeycomb Wet Cooling Pad Alpha (12")',
    category: 'Evaporator',
    brand: 'EcoMedia Labs',
    price: 350,
    shortDesc: 'Phenolic resin impregnated cellulose water media with cross-fluting for water delivery.',
    availability: 'In Stock',
    specs: {
      'Wet Bulb Saturation': '82%',
      'Air Pressure Drop': '15 Pa @ 1.5 m/s',
      'Self-Cleaning Cycle': 'Every 12 hrs'
    },
    material: 'Antimicrobial Cellulose Fiber Paper',
    efficiency: '85% Evaporative Yield',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '300 x 300 x 50 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Standard compact direct evaporative water coolers.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Requires a standard water distributor. Citric-acid washable to strip mineral salts.'
  },
  {
    id: 'evap-honey-16',
    partNumber: 'EV-HON-CEL16',
    name: 'Honeycomb High-Density Pad Beta (16")',
    category: 'Evaporator',
    brand: 'EcoMedia Labs',
    price: 800,
    shortDesc: 'Industrial grade thick evaporation media with extreme structural density for massive air dry scrub.',
    availability: 'In Stock',
    specs: {
      'Wet Bulb Saturation': '88%',
      'Air Pressure Drop': '22 Pa @ 1.5 m/s',
      'Self-Cleaning Cycle': 'Every 8 hrs'
    },
    material: 'Polymer Coated Cellulose Compound',
    efficiency: '91% Evaporative Yield',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '400 x 400 x 100 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'High volume commercial air washers in desert terrains.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Extreme cooling capability under dry conditions. Maximum water holding capacity.'
  },
  {
    id: 'evap-dx-copper-12',
    partNumber: 'EV-DXC-12IN',
    name: 'Direct-Expansion DX Copper Evaporator Coil (12")',
    category: 'Evaporator',
    brand: 'SubZero Cooling',
    price: 2200,
    shortDesc: 'Micro-grooved copper tube direct expansion evaporative coil for auxiliary dry air chillers.',
    availability: 'Low Stock',
    specs: {
      'Expansion Mode': 'Direct expansion dry gas',
      'Circuit LoopCount': '1 Continuous single-pass',
      'Inner tube groove': '0.15 mm helical depth'
    },
    material: 'Deoxidized Copper & Blue-Fin Coated Aluminiums',
    efficiency: 'COP 4.2 heat absorption factor',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '300 x 300 x 40 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Hybrid air chillers pairing up with 0.5 - 1.2 Ton compressors.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Requires skilled refrigeration soldering. Factory pressurized with Nitrogen.'
  },
  {
    id: 'evap-dx-copper-16',
    partNumber: 'EV-DXC-16IN',
    name: 'DX Refined Large Evaporator Coil (16")',
    category: 'Evaporator',
    brand: 'SubZero Cooling',
    price: 3100,
    shortDesc: 'Commercial scale copper gas coil matched with heavy expansion valves and multi-cylinder compressors.',
    availability: 'Backorder',
    specs: {
      'Expansion Mode': 'Direct expansion dry gas',
      'Circuit LoopCount': '2 Parallel multi-pass',
      'Inner tube groove': '0.22 mm helical depth'
    },
    material: 'Copper Coils & Anti-corrosive Epoxy Fins',
    efficiency: 'COP 4.5 heat absorption factor',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '400 x 400 x 50 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Large hybrid climate units in commercial offices. Matches 1.5 - 2.0 Ton compressors.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Designed to prevent ice buildup. High capacity liquid header distributor included.'
  },

  // 4. EXPANSION DEVICE (New Category!)
  {
    id: 'exp-danfoss-tx2',
    partNumber: 'EX-DF-TX2',
    name: 'Danfoss TX2 Thermostatic Expansion Valve',
    category: 'Expansion Device',
    brand: 'Danfoss',
    price: 1200,
    shortDesc: 'Mechanical thermostatic expansion valve with interchangeable orifice assemblies for precise refrigerant dosing.',
    availability: 'In Stock',
    specs: {
      'Valving Class': 'TXV (Thermostatic)',
      'Subzero Rating': 'Down to -40°C',
      'Orifice Support': 'Interchangeable Orifice 01 to 06',
      'Refrigerant': 'R134a'
    },
    material: 'Brass Body & Stainless Steel Power Element',
    efficiency: 'High dynamic control accuracy',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '85 x 60 x 45 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Hybrid compressors setups utilizing R134a. Highly recommended for Secop or Danfoss 12V/220V compressors.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Includes external bulb strap. Solder style inlet (3/8") and outlet (1/2") connections.'
  },
  {
    id: 'exp-emerson-trae',
    partNumber: 'EX-EM-TRAE',
    name: 'Emerson TRAE Large Expansion Valve',
    category: 'Expansion Device',
    brand: 'Emerson',
    price: 2200,
    shortDesc: 'High-capacity, double-seat balanced port expansion-valve designed for commercial industrial scroll refrigeration.',
    availability: 'In Stock',
    specs: {
      'Valving Class': 'TXV Balanced Port',
      'Subzero Rating': 'Down to -45°C',
      'Refrigerant': 'R410A / R404A',
      'Equalizer Style': 'External equalization (1/4" flare)'
    },
    material: 'Cast Brass Body & Copper Bulb wire',
    efficiency: 'Industrial heavy duty load damping',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '110 x 75 x 55 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Copeland hermetic scroll setups running on R410A or high capacity Danfoss chillers.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Requires dual flare connector tools. Ensures evaporator stays fully flooded without liquid slug back.'
  },
  {
    id: 'exp-carel-e2v',
    partNumber: 'EX-CR-E2V',
    name: 'Carel E2V Proportional Electronic Expansion Valve',
    category: 'Expansion Device',
    brand: 'Carel',
    price: 3800,
    shortDesc: 'High-precision micro-step electronic expansion valve driving dynamic proportional refrigerant flow.',
    availability: 'Low Stock',
    specs: {
      'Valving Class': 'EEV (Electronic stepper)',
      'Drive Steps': '480 Full Steps',
      'Response Time': '0.15 seconds',
      'Refrigerant': 'Universal / Adaptive'
    },
    material: 'Stainless Steel needle & copper connections',
    efficiency: '99% Perfect Evaporator Flooding',
    voltage: '12V DC (From Smart Controller)',
    powerRating: '8.4 Watts (During transition)',
    dimensions: '120 x 40 x 30 mm',
    powerConsumption: '1.5 Watts average holding',
    recommendedApp: 'Premium smart climatic chambers and automated off-grid solar-cooling projects.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Requires connection to a Smart Controller with EEV step module. Delivers peak performance.'
  },
  {
    id: 'exp-cap-036',
    partNumber: 'EX-CAP-036',
    name: 'Standard Copper Capillary Tube Mesh',
    category: 'Expansion Device',
    brand: 'Supreme',
    price: 150,
    shortDesc: 'A fixed restriction capillary roll made of pure copper, perfect for simple budget applications.',
    availability: 'In Stock',
    specs: {
      'Valving Class': 'Fixed Capillary',
      'Tube Inner Diameter': '0.036 inches (0.91 mm)',
      'Active Length': '1.50 meters',
      'Refrigerant': 'R134a / R600a'
    },
    material: 'Oxygen-Free Copper Capillary',
    efficiency: 'Static expansion behavior',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '1.5 meter coiled length',
    powerConsumption: '0 Watts',
    recommendedApp: 'Low cost mobile hybrid coolers matching the tiny Secop BD35F compressor.',
    combat: {
      coolerTypes: ['Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'No moving parts. Vulnerable to grid debris; installation of an inline mesh filter-dryer is mandatory.'
  },
  {
    id: 'exp-bypass',
    partNumber: 'BY-EXP-NODE',
    name: 'Expansion Device Bypass Conduit',
    category: 'Expansion Device',
    brand: 'N/A (Evaporative Design)',
    price: 0,
    shortDesc: 'Structural bypass conduit. No expansion device is required in purely evaporative cooling models.',
    availability: 'In Stock',
    specs: {
      'Valving Class': 'Passive Bypass',
      'Refrigerant': 'None',
      'Operating Mode': 'Dry Air Vent'
    },
    material: 'Polycarbonate Union fitting',
    efficiency: 'N/A',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '60 x 20 x 20 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Pure direct and indirect evaporative solutions.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Zero mechanical pressure loss. Used to neatly patch blank expander slots on the casing.'
  },

  // 5. FANS
  {
    id: 'fan-axial-12',
    partNumber: 'FN-AXL-12IP',
    name: '12" High-Velocity DC Axial Fan (40W)',
    category: 'Fans',
    brand: 'Delta Electronics',
    price: 1150,
    shortDesc: 'IP68 certified water-proof, salt-spray proof brushless DC fan designed for high humidity evaporative channels.',
    availability: 'In Stock',
    specs: {
      'Airflow Output': '950 CFM',
      'Shaft Speed': '1500 - 2400 RPM',
      'Rotor Profile': '7 Sickle-curved blades',
      'Operating Noise': '42 dBA'
    },
    material: 'Glass Fiber Reinforced PBT Composite',
    efficiency: '91% Brushless DC Motor Eff.',
    voltage: '48V DC Native (Handles 36-60V)',
    powerRating: '40W Max',
    dimensions: '300 x 300 x 80 mm',
    powerConsumption: '10W - 40W dynamic speed',
    recommendedApp: 'Direct solar agricultural ducts or residential compact chambers.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Features a 4-wire PWM feedback controller, enabling intelligent thermal speed syncing.'
  },
  {
    id: 'fan-axial-14',
    partNumber: 'FN-AXL-14PF',
    name: '14" Aerofoil Sweep DC Axial Fan (70W)',
    category: 'Fans',
    brand: 'Delta Electronics',
    price: 1600,
    shortDesc: 'Optimized sweep balance fan featuring wide profile aerofoil blades to eliminate high-pitched motor whistle.',
    availability: 'In Stock',
    specs: {
      'Airflow Output': '1450 CFM',
      'Shaft Speed': '1200 - 2000 RPM',
      'Rotor Profile': '5 Aerofoil sweep blades',
      'Operating Noise': '45 dBA'
    },
    material: 'Anodized Aluminum Blades & PBT Hub',
    efficiency: '93% Brushless DC Motor Eff.',
    voltage: '48V DC Native',
    powerRating: '70W Max',
    dimensions: '350 x 350 x 90 mm',
    powerConsumption: '20W - 70W variable',
    recommendedApp: 'Desert coolers requiring flat performance delivery over long continuous operation.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [14],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Extremely well-balanced. Ideal for mounting flush behind wet honeycomb cooling media.'
  },
  {
    id: 'fan-centrif-16',
    partNumber: 'FN-CNF-16HE',
    name: '16" Extreme Static Centrifugal Fan (113W)',
    category: 'Fans',
    brand: 'Nidec Japan',
    price: 2300,
    shortDesc: 'Backward-curved high static radial blower designed to push massive CFM behind thick wet media.',
    availability: 'In Stock',
    specs: {
      'Airflow Output': '2150 CFM',
      'Shaft Speed': '1800 RPM Constant',
      'Rotor Profile': 'Backward-curved radial wheel',
      'Operating Noise': '56 dBA'
    },
    material: 'Industrial Galvanized Steel Ring',
    efficiency: '94.8% Brushless Motor Module',
    voltage: '48V DC Native',
    powerRating: '113W Max',
    dimensions: '400 x 400 x 120 mm',
    powerConsumption: '40W - 113W dynamic load',
    recommendedApp: 'Duct climate setups, commercial workspaces with heavy mechanical air drag.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [16],
      insulationThicknesses: ['15mm', '20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Superb performance overcoming high air resistance. Slightly louder sound footprint.'
  },
  {
    id: 'fan-sanyo-silent',
    partNumber: 'FN-SAN-SL16',
    name: 'Sanyo Denki Silent 16" Magnetic Aero Fan',
    category: 'Fans',
    brand: 'Sanyo Denki Japan',
    price: 3100,
    shortDesc: 'Whisper quiet dual-ball magnetic levitation bracket fan supplying vast air volumes under low noise limits.',
    availability: 'Low Stock',
    specs: {
      'Airflow Output': '2350 CFM',
      'Shaft Speed': '800 - 1950 RPM',
      'Rotor Profile': '9 Silent Aerofoil blades',
      'Operating Noise': '34 dBA'
    },
    material: 'Polycarbonate Composite & Magnetic Rings',
    efficiency: '96% Magnetic Levitated Motor Hub',
    voltage: '48V DC Native',
    powerRating: '120W Max',
    dimensions: '400 x 400 x 100 mm',
    powerConsumption: '35W - 120W adjustable',
    recommendedApp: 'Premium residential hybrid units and offices requiring zero motor hum.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Zero friction magnetic bearings allow for an estimated 100,000 hour lifepan.'
  },

  // 6. CABINET MATERIAL
  {
    id: 'cab-abs-12',
    partNumber: 'CA-ABS-12IN',
    name: 'Reinforced UV-Stabilized ABS Cabinet',
    category: 'Cabinet Material',
    brand: 'Supreme Polymers',
    price: 1500,
    shortDesc: 'High durability snap-together ABS polymer frame with heavy internal anti-microbial water pan.',
    availability: 'In Stock',
    specs: {
      'Water Reservoir': '45 Liters',
      'Impact Strength': '38 kJ/m²',
      'UV Shielding': 'UV-12 Rating (12 Yrs)'
    },
    material: 'UV-Stabilized Polycarbonate ABS Resins',
    efficiency: 'Ultra light shell, Rust-proof forever',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '520 x 480 x 680 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Compact residential and home office transportable solar setups.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12],
      insulationThicknesses: ['10mm', '20mm'],
      coolingCapacities: ['1.0 Ton']
    },
    notes: 'Lightweight. Highly localized dampening of high frequency motor noise.'
  },
  {
    id: 'cab-galv-14',
    partNumber: 'CA-G90-14ST',
    name: 'Galvanized G90 Steel Structural Casing',
    category: 'Cabinet Material',
    brand: 'Tata Steel',
    price: 2800,
    shortDesc: 'Zinc primed mechanical casing formed from high density steel coils, painted with glossy epoxy powder.',
    availability: 'In Stock',
    specs: {
      'Water Reservoir': '80 Liters',
      'Shell Thickness': '1.2 mm G90',
      'Corrosion Class': 'C4 High protection class'
    },
    material: 'Tata G90 Hot-Dip Galvanized Iron Sheets',
    efficiency: 'Extreme mechanical rigidity',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '650 x 600 x 850 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Industrial shopfloors or agricultural yards exposed to high physical abuse.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Includes structural lifting eyes. Needs heavy duty lockable caster wheels.'
  },
  {
    id: 'cab-ss304-large',
    partNumber: 'CA-304-16SS',
    name: 'Marine Grade 304 Stainless Cabinet',
    category: 'Cabinet Material',
    brand: 'Jindal Steel',
    price: 5500,
    shortDesc: 'TIG-welded, highly polished stainless steel framework designed for zero rust despite continuous moisture spray.',
    availability: 'Backorder',
    specs: {
      'Water Reservoir': '120 Liters',
      'Steel Grade': 'Sourced 304 Austenitic',
      'Nickel Yield Ratio': '8.15% Nickel'
    },
    material: 'AISI 304 Food-Grade Stainless Steel',
    efficiency: 'Lifelong structural integrity',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '750 x 700 x 1000 mm',
    powerConsumption: '0 Watts',
    recommendedApp: 'Premium medical labs, high salinity coastal environments, or clean pharma sites.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [14, 16],
      insulationThicknesses: ['20mm', '30mm'],
      coolingCapacities: ['1.5 Ton', '2.0 Ton']
    },
    notes: 'Extremely sanitary, easily sterilized. High reflective finish restricts solar heat soak.'
  },

  // 7. INSULATION
  {
    id: 'ins-pe-10',
    partNumber: 'IN-PEH-10X',
    name: '10mm Polyethylene Closed-Cell Foam Sheet',
    category: 'Insulation',
    brand: 'Supreme Industries',
    price: 450,
    shortDesc: 'Lightweight polyolefin underlay with cross-linked cells and double-sided solar grade aluminum foils.',
    availability: 'In Stock',
    specs: {
      'Thermal Conductivity': '0.032 W/mK',
      'Water Absorption Ratio': '< 0.05% by Volume',
      'Vapor Resistance': 'R-3.2 Metric'
    },
    material: 'Cross-Linked Polyethylene Foam & Foil',
    efficiency: 'R-3.2 Good thermal block',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '2000 x 1000 x 10 mm Roll',
    powerConsumption: 'None',
    recommendedApp: 'Direct-evaporation personal cabinets with light thermal mass constraints.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton']
    },
    notes: 'Includes integrated heavy contact dry adhesive. Quick to cut and wrap.'
  },
  {
    id: 'ins-rubber-20',
    partNumber: 'IN-ELM-20X',
    name: '20mm Elastomeric Nitrile Rubber Sheet',
    category: 'Insulation',
    brand: 'K-Flex Italy',
    price: 750,
    shortDesc: 'Extremely flexible synthetic elastomeric nitrile foam sheet displaying superb thermal barrier specs in humid channels.',
    availability: 'In Stock',
    specs: {
      'Thermal Conductivity': '0.028 W/mK',
      'Water Absorption Ratio': '< 0.01% by Volume',
      'Vapor Resistance': 'R-5.5 High barrier'
    },
    material: 'Flexible Nitrile Rubber foam',
    efficiency: 'R-5.5 Excellent thermal isolation',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '1500 x 1000 x 20 mm Sheet',
    powerConsumption: 'None',
    recommendedApp: 'Premium hybrid air handlers, completely sealing dynamic condensation lines.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['20mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Highly resistant to fungal and mold blooms. Class 0 fire safety rating.'
  },
  {
    id: 'ins-poly-30',
    partNumber: 'IN-PIR-30X',
    name: '30mm Rigid Polyisocyanurate (PIR) Board',
    category: 'Insulation',
    brand: 'Thermax India',
    price: 1200,
    shortDesc: 'Ultra high efficiency rigid PIR structural board faced on both sides with lock woven fiberglass skins.',
    availability: 'In Stock',
    specs: {
      'Thermal Conductivity': '0.021 W/mK',
      'Water Absorption Ratio': '< 0.002% by Volume',
      'Vapor Resistance': 'R-8.5 Commercial Shield'
    },
    material: 'Polyisocyanurate Core & Woven Glass Foil',
    efficiency: 'R-8.5 Maximal Thermal Decoupling',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '1200 x 600 x 30 mm Board',
    powerConsumption: 'None',
    recommendedApp: 'Industrial cooling vaults or heavy dessert containers directly facing sun heat.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Extremely rigid. Helps brace galvanized sheets, structurally reinforcing broad side cabinets.'
  },

  // 8. CONTROLLER
  {
    id: 'ctrl-mppt-250w',
    partNumber: 'CT-MPT-250A',
    name: 'Zazen Solar-Direct MPPT Hub Controller',
    category: 'Controller',
    brand: 'Zazen Climate Labs',
    price: 1350,
    shortDesc: 'Basic solar tracker containing 250W MPPT solar battery controller with dual variable output rails.',
    availability: 'In Stock',
    specs: {
      'Tracking Algorithm': 'Ultra-fast variable MPPT',
      'Solar Input Limit': '95 Volts VOC Max',
      'Auxiliary Relay Output': '2x Independent DC Switches'
    },
    material: 'FR4 Multi-Layer Board with Heatsink',
    efficiency: '98% Solar tracking efficiency',
    voltage: '12V / 24V Auto-Select',
    powerRating: '250W Sourced',
    dimensions: '120 x 85 x 35 mm',
    powerConsumption: '1.2 Watts standby draw',
    recommendedApp: 'Affordable compact household direct solar coolers with 12V elements.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Features onboard high temperature cut-off logic. Simple screw terminal connections.'
  },
  {
    id: 'ctrl-nordic-smart',
    partNumber: 'CT-NDS-BT99',
    name: 'Tri-Mode Adaptive Smart Controller with BT',
    category: 'Controller',
    brand: 'Nordic Semiconductor',
    price: 2450,
    shortDesc: 'Industrial IoT hub with built-in Bluetooth 5.2 mesh, executing variable PWM loops across fans and pumps.',
    availability: 'In Stock',
    specs: {
      'Tracking Algorithm': 'Multi-phase predictive MPPT',
      'Solar Input Limit': '150 Volts VOC Max',
      'Wireless Control': 'BLE 5.2 / 2.4G Wifi Integrated'
    },
    material: 'Premium FR4 Matte Black PCB & Alloys',
    efficiency: '99% System Synchronization rate',
    voltage: '48V Native (Handles 12-80V)',
    powerRating: '400W Peak',
    dimensions: '140 x 95 x 40 mm',
    powerConsumption: '2.4 Watts continuous logger',
    recommendedApp: 'Premium automated off-grid towers and hybrid units demanding real-time app telemetry.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Includes external MODBUS RJ45 socket and terminal slots for step control of electronic expansion valves (EEV).'
  },

  // 9. SENSORS
  {
    id: 'sens-sht31-temp',
    partNumber: 'SE-SHT-31HY',
    name: 'Sensirion SHT31 Air Condition Sensor Node',
    category: 'Sensors',
    brand: 'Sensirion Swiss',
    price: 350,
    shortDesc: 'High reliability solid-state microchip sensor tracking inlet humidity and dry temp levels.',
    availability: 'In Stock',
    specs: {
      'Humidity Precision': '+/- 2% RH relative',
      'Temperature Precision': '+/- 0.2°C absolute',
      'Bus Communication': 'I2C protocol interface'
    },
    material: 'Silicon Microchip & PTFE Vapor Hood',
    efficiency: 'Factory pre-calibrated',
    voltage: '3.3V - 5.0V DC input',
    powerRating: '0.01 Watts',
    dimensions: '15 x 15 x 5 mm Module',
    powerConsumption: '0.005 Watts',
    recommendedApp: 'Continuous real-time optimization of wet-bulb/dry-bulb evaporation efficiency.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Protective membrane allows placement directly inside high airflow wet paths without condensation failure.'
  },
  {
    id: 'sens-ultra-level',
    partNumber: 'SE-MBU-LVL9',
    name: 'Ultrasonic Submersible Water Level Module',
    category: 'Sensors',
    brand: 'MaxBotix USA',
    price: 425,
    shortDesc: 'Sealed waterproof ultrasonic transceiver detecting depth of water pan to disable pump dry run.',
    availability: 'In Stock',
    specs: {
      'Detection Limit': '2 cm to 150 cm depth',
      'Sound Beam Width': 'Minimal tight angle dispersion',
      'Ingress Protection': 'IP67 Submersible face'
    },
    material: 'Corrosion-proof Polycarbonate Ring',
    efficiency: '99% depth precision',
    voltage: '5V DC',
    powerRating: '0.1 Watts',
    dimensions: '35 x 20 x 20 mm',
    powerConsumption: '0.08 Watts',
    recommendedApp: 'Automated water tank level indicators and protective low water shutdowns.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Connects directly to the Nordic smart controller. Sends automated trip warning if water is low.'
  },

  // 10. LIGHTING
  {
    id: 'light-led-3w',
    partNumber: 'LI-OSM-3WLB',
    name: 'IP65 Low-Draw Ambient LED Lightbar',
    category: 'Lighting',
    brand: 'Osram Opto',
    price: 180,
    shortDesc: 'High efficiency linear light strip throwing rich diffuse glow for status indicator or interior light.',
    availability: 'In Stock',
    specs: {
      'Luminous Flux': '320 Lumens output',
      'Color Temperature': '4000K Neutral daylight',
      'Vapor Shielding': 'IP65 Extruded silicone'
    },
    material: 'High diffusion clear elastomer',
    efficiency: '110 lm/W high lighting yield',
    voltage: '12V DC Sourced',
    powerRating: '3 Watts',
    dimensions: '300 x 10 x 5 mm',
    powerConsumption: '3 Watts operating load',
    recommendedApp: 'Interior diagnostics light or night visibility lighting loops.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Impervious to high ambient humidity. Includes heavy 3M backing tape.'
  },
  {
    id: 'light-uvc',
    partNumber: 'LI-PHL-8WUV',
    name: 'Philips UVC Antimicrobial Sanitizer Tube',
    category: 'Lighting',
    brand: 'Philips Holland',
    price: 980,
    shortDesc: 'Cold-cathode ultraviolet germicidal tube radiating intense 253.7nm light inside water pan.',
    availability: 'In Stock',
    specs: {
      'Spectral Peak': '253.7 nm (UVC band)',
      'UV Output Power': '2.1 Watts active radiant',
      'Life hours': '9,000 hrs rating'
    },
    material: 'Fused pure quartz glass tube',
    efficiency: '99.9% Microbial sterilization',
    voltage: '24V DC ballast integrated',
    powerRating: '8 Watts',
    dimensions: '210 x 16 x 16 mm',
    powerConsumption: '8 Watts continuous',
    recommendedApp: 'Anti-algae, anti-bacterial protection in health clinic solar coolers and offices.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Must be shielded from user eyes. Highly efficient at blocking biological slime on wet cellulose media.'
  },

  // 11. ELECTRICAL COMPONENTS
  {
    id: 'elec-all-xt60',
    partNumber: 'EL-AMS-12AWG',
    name: '12AWG Heavy Copper Wire Harness & XT60',
    category: 'Electrical Components',
    brand: 'Amass Connectors',
    price: 250,
    shortDesc: 'Silicone insulated high-flex solar wiring loom complete with spark-free XT60 connectors.',
    availability: 'In Stock',
    specs: {
      'Wire Metric': '12 AWG copper core x2',
      'Conductor Resistance': '< 0.004 Ohms per meter',
      'Current Limit': '30 Amps continuous'
    },
    material: 'Silicone Sheath & Oxygen-Free copper strings',
    efficiency: '99.9% Power delivery index',
    voltage: '600V Max',
    powerRating: '1.2 kW',
    dimensions: '1.5 meter total cable',
    powerConsumption: 'Negligible micro-heat scale',
    recommendedApp: 'Safe off-grid connections between solar panels, storage, and controllers.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Fully flame retardant. Extremely flexible, doesn\'t crack in sub-zero winters.'
  },
  {
    id: 'elec-bre-box',
    partNumber: 'EL-SNE-MCB32',
    name: 'IP67 Weatherproof DC Breaker box',
    category: 'Electrical Components',
    brand: 'Schneider Electric',
    price: 450,
    shortDesc: 'Hermetic circuit protection board enclosing a 32A DIN-mounted solar DC miniature circuit breaker.',
    availability: 'In Stock',
    specs: {
      'Trip Current': '32 Amps continuous',
      'Surge Rating': '6.0 kA mechanical',
      'Sealing Rating': 'IP67 fully sealed'
    },
    material: 'High-Impact Flame-Retardant ABS Base',
    efficiency: 'Instantly breaks in <10ms on shorts',
    voltage: '12V - 500V DC Sourced',
    powerRating: 'None',
    dimensions: '160 x 120 x 95 mm Box',
    powerConsumption: '0 Watts',
    recommendedApp: 'Safe outdoor agricultural yards where solar arrays can suffer high voltage lightning surges.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Includes integrated cable packing glands. Standard DIN-rail mount interior.'
  },

  // 12. ACCESSORIES
  {
    id: 'acc-cast-set',
    partNumber: 'AC-REX-ROLL5',
    name: 'Rexello Heavy Caster Roller Set (x4)',
    category: 'Accessories',
    brand: 'Rexello Castors',
    price: 200,
    shortDesc: 'Four premium 360-degree swiveling rollers including two locking foot tabs to anchor the unit.',
    availability: 'In Stock',
    specs: {
      'Swivel Type': 'Smooth dual-ball tracks',
      'Load Boundary': '120 kg mechanical total',
      'Locking System': 'Dual wheel tread locks'
    },
    material: 'Deep zinc plated steel structures & low friction Polyurethane',
    efficiency: 'Minimal rolling resistance rolling core',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '75 x 50 x 60 mm Base',
    powerConsumption: 'None',
    recommendedApp: 'Portable water cooling units that undergo daily indoor relocation.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Soft compound tread prevents any scratching or squeaking on hard marble levels.'
  },
  {
    id: 'acc-active-carb',
    partNumber: 'AC-3M-CARB22',
    name: '3M Scent-Control Active Carbon Pre-Filter',
    category: 'Accessories',
    brand: '3M India Sourced',
    price: 350,
    shortDesc: 'Porous carbon composite block panel acting as an air intake pre-filter scrubbing particulate matter and odor.',
    availability: 'In Stock',
    specs: {
      'Pore Clearance': '15 Microns standard mesh',
      'Odor scrubbing': '93% efficiency rating',
      'Average lifepan': '6 Months variable use'
    },
    material: 'Activated premium coconut shell carbon block',
    efficiency: 'Filters 92.5% dust and mold spores',
    voltage: 'None',
    powerRating: 'None',
    dimensions: '300 x 300 x 12 mm Sheet',
    powerConsumption: 'None',
    recommendedApp: 'Damp coolers working inside smoky kitchens, roadside retail spaces, or offices.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative', 'Hybrid Compressor-Assisted'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Highly recommended to keep cellulose pad from clogging with fine mud dust over autumn.'
  },
  {
    id: 'acc-pump-12v',
    partNumber: 'AC-SZ-PUMP12',
    name: 'SubZero 12V Hydro-Cooling Pump Module',
    category: 'Accessories',
    brand: 'SubZero',
    price: 650,
    shortDesc: 'A high-rise submersible brushless water pump featuring ceramic shaft to circulate water over cellulose wet pad.',
    availability: 'In Stock',
    specs: {
      'Flow Rate': '8.0 Liters/min (LPM)',
      'Pressure Head': '2.2 meters max rise',
      'Shaft Core': 'Ceramic wear-free magnetic shaft'
    },
    material: 'Epoxy-Sealed Polycarbonate casing',
    efficiency: '92% Hydraulic Power ratio',
    voltage: '12V DC',
    powerRating: '12 Watts',
    dimensions: '80 x 50 x 55 mm',
    powerConsumption: '12 Watts',
    recommendedApp: 'Wet-bulb evaporative delivery and dynamic water cycling loops.',
    combat: {
      coolerTypes: ['Pure Evaporative Direct', 'Indirect Evaporative'],
      cabinetSizes: [12, 14, 16],
      insulationThicknesses: ['10mm', '20mm', '30mm'],
      coolingCapacities: ['1.0 Ton', '1.5 Ton', '2.0 Ton']
    },
    notes: 'Dry run protection support via level sensor pairing. Runs cold with zero hum.'
  }
];
