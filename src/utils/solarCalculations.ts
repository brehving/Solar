/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoolerModel, CalculationResult, OperatingMode } from '../types';

export const COOLER_MODELS: CoolerModel[] = [
  { id: '12-inch', name: '12" Compact DC Cooler', size: 12, wattage: 40 },
  { id: '14-inch', name: '14" Medium DC Cooler', size: 14, wattage: 70 },
  { id: '16-inch', name: '16" High-Efficiency DC Cooler', size: 16, wattage: 113 },
];

// Irradiance profile lookup from 6 AM to 6 PM (Hour 6 to 18)
export const TIME_IRRADIANCE_PROFILE: { [hour: number]: number } = {
  6: 10,  // 6:00 AM
  8: 30,  // 8:00 AM
  10: 70, // 10:00 AM
  12: 100,// 12:00 PM
  14: 90, // 2:00 PM
  16: 60, // 4:00 PM
  18: 10, // 6:00 PM
};

/**
 * Linearly interpolates the solar irradiance percentage based on the simulated hour of the day
 */
export function getIrradianceForTime(hour: number): number {
  if (hour <= 6) return 10;
  if (hour >= 18) return 10;

  const times = [6, 8, 10, 12, 14, 16, 18];
  
  let lowerHour = 6;
  let upperHour = 18;

  for (let i = 0; i < times.length - 1; i++) {
    if (hour >= times[i] && hour <= times[i + 1]) {
      lowerHour = times[i];
      upperHour = times[i + 1];
      break;
    }
  }

  const lowerIrr = TIME_IRRADIANCE_PROFILE[lowerHour];
  const upperIrr = TIME_IRRADIANCE_PROFILE[upperHour];
  const fraction = (hour - lowerHour) / (upperHour - lowerHour);
  
  return Math.round(lowerIrr + fraction * (upperIrr - lowerIrr));
}

/**
 * Calculates the operational state of a DC Cooler given PV settings and MPPT efficiency
 */
export function calculateOperatingState(
  panelWattage: number,
  irradiancePercent: number,
  coolerWattage: number,
  mpptEfficiency: number = 0.95
): CalculationResult {
  // Available power = Panel Power * (Irradiance / 100) * MPPT Efficiency
  const availablePower = Math.round((panelWattage * irradiancePercent / 100) * mpptEfficiency * 10) / 10;
  const powerBalance = Math.round((availablePower - coolerWattage) * 10) / 10;
  const percentageOfLoad = coolerWattage > 0 ? (availablePower / coolerWattage) * 100 : 100;

  let mode: OperatingMode = 'Shutdown';
  let fanSpeed = 0;
  let pumpSpeed: CalculationResult['pumpSpeed'] = 'Off';

  // Control logic guidelines:
  // Available power >= load -> Full Speed
  // Available power >= 75% -> Normal
  // Available power >= 50% -> Eco
  // Available power >= 25% -> Low
  // Else -> Shutdown
  if (availablePower >= coolerWattage) {
    mode = 'Full Speed';
    fanSpeed = 100;
    pumpSpeed = 'Full (100%)';
  } else if (availablePower >= coolerWattage * 0.75) {
    mode = 'Normal Mode';
    fanSpeed = 75;
    pumpSpeed = 'High (75%)';
  } else if (availablePower >= coolerWattage * 0.50) {
    mode = 'Eco Mode';
    fanSpeed = 50;
    pumpSpeed = 'Medium (50%)';
  } else if (availablePower >= coolerWattage * 0.25) {
    mode = 'Low Mode';
    fanSpeed = 25;
    pumpSpeed = 'Off'; // Safe stall-prevention for submersible pump
  } else {
    mode = 'Shutdown';
    fanSpeed = 0;
    pumpSpeed = 'Off';
  }

  return {
    availablePower,
    coolerLoad: coolerWattage,
    powerBalance,
    mode,
    fanSpeed,
    pumpSpeed,
    percentageOfLoad: Math.round(percentageOfLoad),
  };
}

/**
 * Computes the minimum irradiance % required for a panel to run a cooler load at 100% capacity
 */
export function calculateMinIrradianceForFullSpeed(
  panelPower: number,
  coolerLoad: number,
  mpptEfficiency: number
): number | 'unreachable' {
  // coolerLoad <= panelPower * (irr / 100) * mpptEfficiency
  // irr >= (coolerLoad / (panelPower * mpptEfficiency)) * 100
  if (panelPower <= 0 || mpptEfficiency <= 0) return 'unreachable';
  const minIrr = (coolerLoad / (panelPower * mpptEfficiency)) * 100;
  if (minIrr > 100) return 'unreachable';
  return Math.round(minIrr * 10) / 10;
}

// Generate data points for the Irradiance vs Available Power chart (0% to 100%)
export function generateSinglePanelCurve(
  panelWattage: number, 
  limitLoad: number,
  mpptEfficiency: number = 0.95
) {
  const data = [];
  for (let irr = 0; irr <= 100; irr += 10) {
    const power = (panelWattage * irr / 100) * mpptEfficiency;
    data.push({
      irradiance: irr,
      'Available Power (W)': Math.round(power * 10) / 10,
      'Cooler Requirement': limitLoad,
    });
  }
  return data;
}

// Generate data points for comparison with standard sizes [50, 75, 100, 150, 200]
export function generateComparisonCurve(
  coolerWattage: number,
  mpptEfficiency: number = 0.95
) {
  const data = [];
  for (let irr = 0; irr <= 100; irr += 10) {
    data.push({
      irradiance: irr,
      '50W Panel': Math.round(((50 * irr / 100) * mpptEfficiency) * 10) / 10,
      '75W Panel': Math.round(((75 * irr / 100) * mpptEfficiency) * 10) / 10,
      '100W Panel': Math.round(((100 * irr / 100) * mpptEfficiency) * 10) / 10,
      '150W Panel': Math.round(((150 * irr / 100) * mpptEfficiency) * 10) / 10,
      '200W Panel': Math.round(((200 * irr / 100) * mpptEfficiency) * 10) / 10,
      'Cooler Load Threshold': coolerWattage,
    });
  }
  return data;
}
