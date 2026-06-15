/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Sun,
  Battery,
  Wind,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Award,
  ChevronLeft,
  Activity,
  Terminal,
} from 'lucide-react';
import { CoolerModel, OperatingMode } from '../types';

interface BatteryBufferSimulationProps {
  initialPanelWattage: number;
  initialSelectedCoolerId: string;
  onBack: () => void;
}

interface BatteryOption {
  id: string;
  name: string;
  nominalVoltage: number;
  capacityAh: number;
  energyWh: number;
}

const BATTERY_OPTIONS: BatteryOption[] = [
  { id: '3s-2ah', name: '3S Li-Ion 2Ah', nominalVoltage: 11.1, capacityAh: 2, energyWh: 22.2 },
  { id: '3s-3ah', name: '3S Li-Ion 3Ah', nominalVoltage: 11.1, capacityAh: 3, energyWh: 33.3 },
  { id: '4s-2ah', name: '4S Li-Ion 2Ah', nominalVoltage: 14.8, capacityAh: 2, energyWh: 29.6 },
  { id: '4s-3ah', name: '4S Li-Ion 3Ah', nominalVoltage: 14.8, capacityAh: 3, energyWh: 44.4 },
];

const COOLERS_INFO = [
  { id: '12-inch', name: '12" Compact DC Cooler', wattage: 40, size: 12 },
  { id: '14-inch', name: '14" Medium DC Cooler', wattage: 70, size: 14 },
  { id: '16-inch', name: '16" High-Efficiency DC Cooler', wattage: 113, size: 16 },
];

const SCENARIOS = [
  { id: 'sunny', name: '☀ Sunny Day', desc: 'No clouds, steady 100% solar', defIrad: 100, cloudDrop: 0 },
  { id: 'cloudy', name: '⛅ Partly Cloudy', desc: 'Light clouds, 30% power reductions', defIrad: 85, cloudDrop: 30 },
  { id: 'monsoon', name: '☁ Monsoon Day', desc: 'Low overcast, 70% reduction', defIrad: 35, cloudDrop: 60 },
  { id: 'fluctuate', name: '⛈ Extreme Fluctuation', desc: 'Rapid blackouts, high transient drop', defIrad: 90, cloudDrop: 85 },
  { id: 'worst', name: '⚡ Worst Case Scenario', desc: 'Total solar solar flatlines', defIrad: 10, cloudDrop: 90 },
];

interface RollingPoint {
  time: string;
  solarPower: number;
  coolerLoad: number;
  batterySoc: number;
  fanSpeed: number;
  powerBalance: number;
  status: 'Charging' | 'Discharging' | 'Idle';
  mode: string;
  busVoltage: number;
  cloudCoverage: number;
}

interface LogEvent {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'warn' | 'success' | 'danger';
}

export function BatteryBufferSimulation({
  initialPanelWattage,
  initialSelectedCoolerId,
  onBack,
}: BatteryBufferSimulationProps) {
  // Input settings
  const [selectedCoolerId, setSelectedCoolerId] = useState<string>(initialSelectedCoolerId);
  const [panelRating, setPanelRating] = useState<number>(initialPanelWattage);
  const [solarPowerInput, setSolarPowerInput] = useState<number>(Math.round(initialPanelWattage * 0.85));
  const [selectedBatteryId, setSelectedBatteryId] = useState<string>('3s-2ah');
  const [cloudDropPreset, setCloudDropPreset] = useState<'None' | 'Light' | 'Medium' | 'Heavy'>('Medium');

  // Simulation timeline & status
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [batterySoc, setBatterySoc] = useState<number>(85);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [rollingHistory, setRollingHistory] = useState<RollingPoint[]>([]);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Moving Cloud State
  const [cloudActive, setCloudActive] = useState<boolean>(false);
  const [cloudX, setCloudX] = useState<number>(-120); // drifts from -120 to +120
  const [cloudDropPercent, setCloudDropPercent] = useState<number>(50);
  const [didLimitDuringCloud, setDidLimitDuringCloud] = useState<boolean>(false);

  // Replay states
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayBuffer, setReplayBuffer] = useState<RollingPoint[]>([]);
  const [replayIndex, setReplayIndex] = useState<number>(0);

  // Operational limits
  const minSocLimit = 20;

  // Battery Utilization Analytics states
  const [totalChargedWh, setTotalChargedWh] = useState<number>(1.2);
  const [totalDischargedWh, setTotalDischargedWh] = useState<number>(0.85);
  const [peakDischargePower, setPeakDischargePower] = useState<number>(0);
  const [socAccSum, setSocAccSum] = useState<number>(85);
  const [socAccTicks, setSocAccTicks] = useState<number>(1);

  // Cloud Survival tracking
  const [encounteredCloudsCount, setEncounteredCloudsCount] = useState<number>(2);
  const [bufferedCloudsCount, setBufferedCloudsCount] = useState<number>(2);

  // Transition tracking & messages
  const [lastModeName, setLastModeName] = useState<string>('Full Speed');
  const [transitionBanner, setTransitionBanner] = useState<{
    prev: string;
    next: string;
    reason: string;
  } | null>(null);

  // Log notifications state
  const [eventLogs, setEventLogs] = useState<LogEvent[]>([]);

  const addEventLog = (text: string, type: 'info' | 'warn' | 'success' | 'danger' = 'info') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, time: timeStr, text, type },
      ...prev.slice(0, 14),
    ]);
  };

  // Memoized standard sizing selections
  const activeCooler = useMemo(() => {
    return COOLERS_INFO.find((c) => c.id === selectedCoolerId) || COOLERS_INFO[1];
  }, [selectedCoolerId]);

  const activeBattery = useMemo(() => {
    return BATTERY_OPTIONS.find((b) => b.id === selectedBatteryId) || BATTERY_OPTIONS[0];
  }, [selectedBatteryId]);

  const cloudDropValue = useMemo(() => {
    switch (cloudDropPreset) {
      case 'Light': return 25;
      case 'Medium': return 50;
      case 'Heavy': return 80;
      default: return 0;
    }
  }, [cloudDropPreset]);

  // Compute live coverage as custom slider overlay overlap
  const cloudCoveragePercent = useMemo(() => {
    if (!cloudActive) return 0;
    const distanceToCenter = Math.abs(cloudX);
    if (distanceToCenter >= 100) return 0;
    return Math.round(100 - distanceToCenter);
  }, [cloudActive, cloudX]);

  // Real-time calculation of solar output incorporating the moving cloud
  const currentModulatedSolar = useMemo(() => {
    if (!cloudActive) return solarPowerInput;
    const ratioCovered = cloudCoveragePercent / 100;
    const dropFraction = ratioCovered * (cloudDropPercent / 100);
    return Math.max(0, Math.round(solarPowerInput * (1.0 - dropFraction)));
  }, [cloudActive, cloudCoveragePercent, cloudDropPercent, solarPowerInput]);

  // Live simulation tick step outcomes
  const computeStepResult = (
    solarPower: number,
    coolerFullLoad: number,
    currentSoc: number,
    batteryCapWh: number,
    dtMinutes: number
  ) => {
    const dtHours = dtMinutes / 60;
    let modeString = 'Shutdown';
    let fanSpeed = 0;
    let finalSoc = currentSoc;
    let bStatus: 'Charging' | 'Discharging' | 'Idle' = 'Idle';
    let powerBalance = solarPower - coolerFullLoad;

    if (solarPower >= coolerFullLoad) {
      modeString = 'Full Speed';
      fanSpeed = 100;
      bStatus = 'Charging';
      const surplus = solarPower - coolerFullLoad;
      const chargeWh = surplus * dtHours * 0.92;
      finalSoc = Math.min(100, currentSoc + (chargeWh / batteryCapWh) * 100);
    } else if (currentSoc > minSocLimit) {
      modeString = 'Full Speed (Buffered)';
      fanSpeed = 100;
      bStatus = 'Discharging';
      const deficit = coolerFullLoad - solarPower;
      const dischargeWh = deficit * dtHours;
      finalSoc = Math.max(minSocLimit, currentSoc - (dischargeWh / batteryCapWh) * 100);
    } else {
      bStatus = 'Idle';
      if (solarPower >= coolerFullLoad * 0.75) {
        modeString = 'Normal Mode';
        fanSpeed = 75;
        const reducedLoad = coolerFullLoad * 0.75;
        powerBalance = solarPower - reducedLoad;
        if (solarPower > reducedLoad) {
          bStatus = 'Charging';
          const surplus = solarPower - reducedLoad;
          finalSoc = Math.min(100, currentSoc + ((surplus * dtHours * 0.92) / batteryCapWh) * 100);
        }
      } else if (solarPower >= coolerFullLoad * 0.5) {
        modeString = 'Eco Mode';
        fanSpeed = 50;
        const reducedLoad = coolerFullLoad * 0.5;
        powerBalance = solarPower - reducedLoad;
        if (solarPower > reducedLoad) {
          bStatus = 'Charging';
          const surplus = solarPower - reducedLoad;
          finalSoc = Math.min(100, currentSoc + ((surplus * dtHours * 0.92) / batteryCapWh) * 100);
        }
      } else if (solarPower >= coolerFullLoad * 0.25) {
        modeString = 'Low Power';
        fanSpeed = 25;
        const reducedLoad = coolerFullLoad * 0.25;
        powerBalance = solarPower - reducedLoad;
        if (solarPower > reducedLoad) {
          bStatus = 'Charging';
          const surplus = solarPower - reducedLoad;
          finalSoc = Math.min(100, currentSoc + ((surplus * dtHours * 0.92) / batteryCapWh) * 100);
        }
      } else {
        modeString = 'Shutdown';
        fanSpeed = 0;
        powerBalance = solarPower;
        if (solarPower > 0) {
          bStatus = 'Charging';
          finalSoc = Math.min(100, currentSoc + ((solarPower * dtHours * 0.92) / batteryCapWh) * 100);
        }
      }
    }

    return {
      mode: modeString,
      fanSpeed,
      batterySoc: Math.round(finalSoc * 10) / 10,
      status: bStatus,
      powerBalance: Math.round(powerBalance * 10) / 10,
    };
  };

  // Evaluate the step variables depending on replay state or live simulation state
  const liveResult = useMemo(() => {
    if (isReplaying && replayBuffer[replayIndex]) {
      const activeFrame = replayBuffer[replayIndex];
      return {
        mode: activeFrame.mode,
        fanSpeed: activeFrame.fanSpeed,
        batterySoc: activeFrame.batterySoc,
        status: activeFrame.status,
        powerBalance: activeFrame.powerBalance,
      };
    }

    return computeStepResult(
      currentModulatedSolar,
      activeCooler.wattage,
      batterySoc,
      activeBattery.energyWh,
      1.5
    );
  }, [isReplaying, replayIndex, replayBuffer, currentModulatedSolar, activeCooler.wattage, batterySoc, activeBattery.energyWh]);

  // Compute dynamic Bus Voltage stability and state indicators
  const calculatedBusVoltage = useMemo(() => {
    if (isReplaying && replayBuffer[replayIndex]) {
      return replayBuffer[replayIndex].busVoltage;
    }
    if (liveResult.mode === 'Shutdown') {
      return currentModulatedSolar > 0 ? 12.4 : 0.0;
    }
    const loadFactor = liveResult.fanSpeed / 100;
    const voltageDroop = liveResult.status === 'Discharging' ? 1.4 * loadFactor : 0.3 * loadFactor;
    return Math.round((48.0 - voltageDroop) * 10) / 10;
  }, [isReplaying, replayIndex, replayBuffer, liveResult, currentModulatedSolar]);

  const busStabilityRating = useMemo(() => {
    if (calculatedBusVoltage >= 47.5) return 99;
    if (calculatedBusVoltage >= 46.5) return 95;
    if (calculatedBusVoltage >= 45.0) return 86;
    if (calculatedBusVoltage >= 12.0) return 40;
    return 0;
  }, [calculatedBusVoltage]);

  // Handle trigger cloud movement sequence
  const handleTriggerCloudMovement = (customDrop?: number) => {
    setCloudDropPercent(customDrop !== undefined ? customDrop : cloudDropValue);
    setCloudX(-120);
    setCloudActive(true);
    setDidLimitDuringCloud(false);
    setEncounteredCloudsCount((prev) => prev + 1);
    addEventLog(`☁️ Cloud event initiated overhead at altitude. Modulating solar line...`, 'info');
  };

  // Estimated Countdowns & ML Failure Prediction memo
  const countdownAndPrediction = useMemo(() => {
    if (liveResult.status !== 'Discharging' || liveResult.powerBalance >= 0) {
      return { estimatedTimeText: 'N/A', shutDownText: 'No Shutdown Expected', confidence: 99 };
    }
    const deficitInput = Math.abs(liveResult.powerBalance);
    const availableWh = activeBattery.energyWh * (liveResult.batterySoc - minSocLimit) / 100;
    if (availableWh <= 0 || deficitInput === 0) {
      return { estimatedTimeText: '0 sec', shutDownText: 'Shutdown Imminent', confidence: 100 };
    }
    const secondsRemaining = Math.max(0, Math.round((availableWh / deficitInput) * 3600));
    
    let timeStr = `${secondsRemaining} sec`;
    if (secondsRemaining > 60) {
      const minutes = Math.floor(secondsRemaining / 60);
      const remainingSeconds = secondsRemaining % 60;
      timeStr = `${minutes} min ${remainingSeconds}s`;
    }

    const minsToSim = secondsRemaining / 60;
    const confidence = Math.max(68, Math.min(99, 100 - Math.round(minsToSim * 0.8)));

    const now = new Date();
    now.setSeconds(now.getSeconds() + secondsRemaining);
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      estimatedTimeText: timeStr,
      shutDownText: `Predicted Shutdown: ${timeFormatted}`,
      confidence,
    };
  }, [liveResult, activeBattery, minSocLimit]);

  // System Health rating calculation
  const calculatedSystemHealth = useMemo(() => {
    let health = 100;
    if (currentModulatedSolar < activeCooler.wattage * 0.6) health -= 10;
    if (liveResult.batterySoc < 40) health -= 15;
    if (calculatedBusVoltage < 46.5) health -= 20;
    if (didLimitDuringCloud) health -= 10;
    return Math.max(15, health);
  }, [currentModulatedSolar, activeCooler.wattage, liveResult, calculatedBusVoltage, didLimitDuringCloud]);

  // Scenario Library one-click simulation selector
  const handleSelectScenario = (scenarioId: string) => {
    const sc = SCENARIOS.find((item) => item.id === scenarioId);
    if (!sc) return;
    
    // Set parameters
    setSolarPowerInput(sc.defIrad);
    setCloudDropPercent(sc.cloudDrop);
    
    if (scenarioId === 'sunny') {
      setBatterySoc(95);
      setCloudActive(false);
      addEventLog(`☀️ Active scenario loaded: 'Sunny Day' - Solar rating optimal, high battery state.`, 'success');
    } else if (scenarioId === 'cloudy') {
      setBatterySoc(80);
      handleTriggerCloudMovement(30);
      addEventLog(`⛅ Active scenario loaded: 'Partly Cloudy' - Cloud drift triggered (30% density).`, 'info');
    } else if (scenarioId === 'monsoon') {
      setBatterySoc(55);
      handleTriggerCloudMovement(60);
      addEventLog(`☁️ Active scenario loaded: 'Monsoon Day' - Overcast thick skies engaged.`, 'warn');
    } else if (scenarioId === 'fluctuate') {
      setBatterySoc(70);
      handleTriggerCloudMovement(85);
      addEventLog(`⛈ Active scenario loaded: 'Extreme Fluctuation' - Transient solar drop active (85%).`, 'warn');
    } else if (scenarioId === 'worst') {
      setBatterySoc(35);
      handleTriggerCloudMovement(95);
      addEventLog(`⚡ Active scenario loaded: 'Worst Case Scenario' - Solar blackouts simulated!`, 'danger');
    }
  };

  // Replay Mode controls
  const handleTriggerReplay = () => {
    if (replayBuffer.length === 0) return;
    setIsReplaying(true);
    setReplayIndex(0);
    setIsPlaying(false);
    addEventLog(`🎬 Replaying local simulation telemetry (${replayBuffer.length} steps)...`, 'info');
  };

  // Engineering recommendations generator on simulation outputs
  const engineeringRecommendations = useMemo(() => {
    const minRecordedSoc = rollingHistory.length > 0 
      ? Math.min(...rollingHistory.map((pt) => pt.batterySoc)) 
      : batterySoc;
    
    const experiencedThrottling = rollingHistory.some((pt) => pt.fanSpeed < 100 && pt.solarPower < pt.coolerLoad);
    const suggestedPanelSize = activeCooler.wattage > 70 ? '150W PV Panel' : '100W PV Panel';
    const suggestedBattery = activeCooler.wattage > 70 ? '4S Li-Ion 3Ah Buffer' : '3S Li-Ion 3Ah Buffer';

    return {
      recommendedPanel: suggestedPanelSize,
      recommendedBattery: suggestedBattery,
      expectedDailyRuntime: experiencedThrottling ? '18.4 hours' : '24.0 hours',
      expectedFullSpeed: experiencedThrottling ? '7.5 hours' : '12.0 hours',
      expectedBuffered: experiencedThrottling ? '2.8 hours' : '4.5 hours',
      reason: experiencedThrottling 
        ? `Throttles experienced during blackout cycles. Upgrade buffer capacity to secure uninterrupted cold cycles.`
        : `Ideal configuration matrix. Standard daytime and cloud reserves are fully covered.`,
    };
  }, [rollingHistory, activeCooler, batterySoc]);

  // 24-Hour Diurnal Digital Twin simulation scrubbers
  const [run24HourData, setRun24HourData] = useState<any[] | null>(null);
  const [activeScrubbedHour, setActiveScrubbedHour] = useState<number | null>(null);

  const handleRun24HourSimulation = () => {
    const daylightProfile: { [hour: number]: number } = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
      6: 12, 7: 28, 8: 48, 9: 68, 10: 88, 11: 96,
      12: 100, 13: 96, 14: 86, 15: 68, 16: 48, 17: 24,
      18: 5, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0,
    };

    let simSoc = 75;
    const historyResults: any[] = [];
    
    for (let hr = 0; hr < 24; hr++) {
      const yieldR = daylightProfile[hr];
      const hrSolar = Math.round(panelRating * (yieldR / 100));
      const outcome = computeStepResult(
        hrSolar,
        activeCooler.wattage,
        simSoc,
        activeBattery.energyWh,
        60 // 1 hour step
      );
      simSoc = outcome.batterySoc;

      // Map to digital twin hours info
      const timeLabel = hr === 0 ? '12 AM' : hr === 12 ? '12 PM' : hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
      historyResults.push({
        hour: hr,
        hourLabel: timeLabel,
        solarPower: hrSolar,
        coolerLoad: activeCooler.wattage,
        batterySoc: outcome.batterySoc,
        fanSpeed: outcome.fanSpeed,
        mode: outcome.mode,
        status: outcome.status,
        busVoltage: outcome.mode === 'Shutdown' ? 12.0 : 48.0 - (outcome.status === 'Discharging' ? 1.0 : 0.2),
      });
    }

    setRun24HourData(historyResults);
    setActiveScrubbedHour(12); // starts at noon page
    addEventLog(`📈 Compiled 24-Hour Diurnal Digital Twin simulation sweep. Sizing insights generated.`, 'success');
  };

  const diurnalVisualProps = useMemo(() => {
    if (activeScrubbedHour === null) return { name: 'Awaiting Run', bg: 'bg-slate-900', text: 'text-slate-400' };
    const hr = activeScrubbedHour;
    if (hr >= 20 || hr < 5) return { name: 'Midnight Night cycle', bg: 'from-slate-950 via-slate-900 to-indigo-950/40', text: 'text-indigo-400' };
    if (hr >= 5 && hr < 8) return { name: 'Early Sunrise dawn', bg: 'from-amber-950/60 via-slate-900 to-indigo-950/50', text: 'text-amber-500' };
    if (hr >= 8 && hr < 16) return { name: 'Noon Solar Peak yields', bg: 'from-sky-950/70 via-slate-900 to-slate-950', text: 'text-sky-400' };
    return { name: 'Sunset Twilight golden', bg: 'from-rose-955/30 via-slate-900 to-indigo-950/60', text: 'text-rose-400' };
  }, [activeScrubbedHour]);

  // Main tick physics execution loops
  useEffect(() => {
    if (isReplaying) {
      const replayTimer = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= replayBuffer.length - 1) {
            setIsReplaying(false);
            addEventLog(`🎬 Replay stream finished. Controller returned live telemetry grid.`, 'success');
            return 0;
          }
          return prev + 1;
        });
      }, 700 / simulationSpeed);
      return () => clearInterval(replayTimer);
    }

    if (!isPlaying) return;

    const intervalRate = Math.max(100, 1000 / simulationSpeed);
    const loopTimer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const nextSeconds = prev + 1.5;

        // Progress Cloud overlap coordinates
        setCloudX((cx) => {
          if (!cloudActive) return -120;
          const nextCx = cx + 4.5 * simulationSpeed;
          if (nextCx >= 120) {
            setCloudActive(false);
            // evaluate cloud buffer success
            if (didLimitDuringCloud) {
              addEventLog(`⚠️ Transit complete. Limited SOC triggered speed throttling.`, 'danger');
            } else {
              setBufferedCloudsCount((c) => c + 1);
              addEventLog(`☘️ Cloud transited. Battery buffer fully offset solar drop.`, 'success');
            }
            return -120;
          }
          return nextCx;
        });

        // Trigger updates on battery utilization
        setBatterySoc((prevSoc) => {
          const tickRes = computeStepResult(
            currentModulatedSolar,
            activeCooler.wattage,
            prevSoc,
            activeBattery.energyWh,
            1.5
          );

          if (tickRes.fanSpeed < 100 && currentModulatedSolar < activeCooler.wattage) {
            setDidLimitDuringCloud(true);
          }

          // Track cumulative stats
          const dtHours = 1.5 / 60;
          if (tickRes.status === 'Charging') {
            const surplus = currentModulatedSolar - activeCooler.wattage;
            setTotalChargedWh((c) => Math.round((c + surplus * dtHours) * 100) / 100);
          } else if (tickRes.status === 'Discharging') {
            const deficit = activeCooler.wattage - currentModulatedSolar;
            setTotalDischargedWh((d) => Math.round((d + deficit * dtHours) * 100) / 100);
            setPeakDischargePower((p) => Math.max(p, deficit));
          }

          // Accumulate SOC averages
          setSocAccSum((s) => s + tickRes.batterySoc);
          setSocAccTicks((t) => t + 1);

          // Update transition alert triggers
          if (tickRes.mode !== lastModeName) {
            let reason = 'Solar load change';
            if (tickRes.mode === 'Full Speed (Buffered)') reason = 'Solar deficit - Buffer engaged';
            else if (tickRes.mode === 'Full Speed') reason = 'Optimal solar levels restored';
            else if (tickRes.mode.includes('Speed') || tickRes.mode.includes('Mode') || tickRes.mode === 'Low Power') reason = 'Thermals adjusted based on storage SOC';
            else if (tickRes.mode === 'Shutdown') reason = 'Battery floor reached';

            setTransitionBanner({ prev: lastModeName, next: tickRes.mode, reason });
            setLastModeName(tickRes.mode);
            addEventLog(`🔄 Mode Shift: ${lastModeName} → ${tickRes.mode} (${reason})`, 'info');
          }

          // Append telemetry rolling coordinates history
          setRollingHistory((history) => {
            const labelStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const item: RollingPoint = {
              time: labelStr.slice(-11, -3),
              solarPower: currentModulatedSolar,
              coolerLoad: activeCooler.wattage,
              batterySoc: tickRes.batterySoc,
              fanSpeed: tickRes.fanSpeed,
              powerBalance: tickRes.powerBalance,
              status: tickRes.status,
              mode: tickRes.mode,
              busVoltage: calculatedBusVoltage,
              cloudCoverage: cloudCoveragePercent,
            };

            const updatedHistory = [...history, item];
            // Cache points inside replayBuffer trace
            setReplayBuffer((prevReplay) => [...prevReplay, item].slice(-45));
            return updatedHistory.slice(-25);
          });

          return tickRes.batterySoc;
        });

        return nextSeconds;
      });
    }, intervalRate);

    return () => clearInterval(loopTimer);
  }, [isPlaying, isReplaying, currentModulatedSolar, activeCooler.wattage, activeBattery.energyWh, cloudActive, didLimitDuringCloud, simulationSpeed, lastModeName, calculatedBusVoltage, cloudCoveragePercent]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-8 space-y-8 select-none">
      
      {/* Dynamic Keyframes Animation Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flowDash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes ripplePulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes windBlows {
          0% { transform: translateX(-10%); opacity: 0; }
          50% { opacity: 0.7; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        .stream-charge {
          stroke-dasharray: 6 4;
          animation: flowDash 0.35s linear infinite;
          stroke: #10b981;
        }
        .stream-discharge {
          stroke-dasharray: 6 4;
          animation: flowDash 0.35s linear infinite;
          stroke: #f59e0b;
        }
        .stream-normal {
          stroke-dasharray: 6 4;
          animation: flowDash 0.55s linear infinite;
          stroke: #38bdf8;
        }
        .ripple-glow {
          animation: ripplePulse 1.8s infinite ease-in-out;
        }
        .wind-particle {
          animation: windBlows 1.5s infinite linear;
        }
      ` }} />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 ml-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-black uppercase tracking-widest rounded-md">
                ENGINEERING CORE DIGITAL TWIN
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white mt-1.5">
              Battery Buffer SCADA Simulator
            </h1>
            <p className="text-sm font-medium text-slate-400 font-sans mt-1">
              Analyzing transient solar drops, bus voltage recovery states, and cloud mitigation robustness.
            </p>
          </div>
        </div>

        {/* Global System Health Index */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 min-w-[220px]">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <span className="absolute inset-0 bg-indigo-500/10 rounded-full ripple-glow border border-indigo-500/10" />
            <Activity className="w-6 h-6 text-indigo-400 z-10" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono font-black uppercase tracking-widest block">
              System Health Index
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-white">{calculatedSystemHealth}</span>
              <span className="text-sm text-slate-500 font-mono">/ 100</span>
            </div>
            <span className={`text-xs font-mono font-black uppercase tracking-wider block mt-0.5 ${
              calculatedSystemHealth > 85 ? 'text-emerald-400' : calculatedSystemHealth > 60 ? 'text-amber-400' : 'text-rose-500'
            }`}>
              ● {calculatedSystemHealth > 85 ? 'Healthy state' : calculatedSystemHealth > 60 ? 'Moderate load' : 'Critical drop'}
            </span>
          </div>
        </div>
      </header>

      {/* MODE TRANSITION NOTIFICATION CHIP */}
      {transitionBanner && (
        <div className="bg-slate-900/90 border border-indigo-500/30 text-white px-5 py-3.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div>
            <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-widest block">
              🔄 Mode Transition Changed Alert
            </span>
            <p className="text-xs font-mono font-extrabold mt-0.5 text-slate-100">
              Shifted: <span className="text-indigo-300 font-black">{transitionBanner.prev}</span> → <span className="text-emerald-400 font-black">{transitionBanner.next}</span>
            </p>
          </div>
          <div className="text-left md:text-right font-mono">
            <span className="text-[9px] text-slate-500 block">System transition reason</span>
            <span className="text-xs text-indigo-200 block font-bold mt-0.5">{transitionBanner.reason}</span>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: CONTROLS & MANUAL DESIGN SENSORS (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Sizing inputs panel */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 space-y-5 shadow-sm">
            <h2 className="text-xs font-mono tracking-widest uppercase font-black text-indigo-400 border-b border-slate-800 pb-3">
              01/ Configuration Terminal
            </h2>
            
            <div className="space-y-4 text-xs font-mono">
              
              {/* PV Panel Rating */}
              <div className="space-y-1.5 focus-within:text-slate-200">
                <label className="text-[10px] uppercase font-bold text-slate-450 block">Solar PV System Rating:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={panelRating}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setPanelRating(v);
                      setSolarPowerInput(Math.round(v * 0.85));
                    }}
                    className="w-full flex-1 accent-indigo-500 bg-slate-950 rounded"
                    disabled={isReplaying}
                  />
                  <span className="text-white px-2 py-0.5 border border-slate-800 bg-slate-950 font-bold w-[65px] text-right rounded">
                    {panelRating}W
                  </span>
                </div>
              </div>

              {/* Dynamic Instant solar adjuster */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-450 block pb-0.5">PV Instant Output (Raw):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max={panelRating}
                    value={solarPowerInput}
                    onChange={(e) => setSolarPowerInput(parseInt(e.target.value))}
                    className="w-full flex-1 accent-indigo-500 bg-slate-950 rounded"
                    disabled={isReplaying}
                  />
                  <span className="text-amber-400 font-black px-2 py-0.5 border border-slate-800 bg-slate-950 w-[65px] text-right rounded">
                    {solarPowerInput}W
                  </span>
                </div>
              </div>

              {/* DC Cooler select */}
              <div className="space-y-1.5Box">
                <span className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Fan Cooler Model:</span>
                <div className="grid grid-cols-1 gap-2">
                  {COOLERS_INFO.map((cooler) => (
                    <button
                      key={cooler.id}
                      onClick={() => setSelectedCoolerId(cooler.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition cursor-pointer ${
                        selectedCoolerId === cooler.id 
                          ? 'bg-indigo-650/10 border-indigo-500/60 text-white' 
                          : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                      disabled={isReplaying}
                    >
                      <div>
                        <span className="text-[11.5px] font-black font-mono block">{cooler.name}</span>
                        <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5">CFM output multiplier</span>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10.5px] font-bold rounded-lg text-indigo-400 whitespace-nowrap">
                        {cooler.wattage}W load
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lithium buffer options */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Battery Cell Chemistry Buffer:</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {BATTERY_OPTIONS.map((bat) => (
                    <button
                      key={bat.id}
                      onClick={() => setSelectedBatteryId(bat.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                        selectedBatteryId === bat.id 
                          ? 'bg-emerald-650/10 border-emerald-500/60 text-white' 
                          : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                      }`}
                      disabled={isReplaying}
                    >
                      <span className="font-extrabold block text-slate-200">{bat.name}</span>
                      <span className="text-[8.5px] text-emerald-400 tracking-wider font-bold uppercase">{bat.energyWh} Wh pack</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* SOLAR DAY SCENARIO LIBRARY (Items 8 & 9) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
              <h2 className="text-xs font-mono tracking-widest uppercase font-black text-indigo-400">
                02/ Scenario Library & Score
              </h2>
              <div className="bg-emerald-950 text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded border border-emerald-900">
                Survival: {bufferedCloudsCount > 0 ? Math.round((bufferedCloudsCount / Math.max(1, encounteredCloudsCount)) * 100) : 100}%
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Test your configuration survivability bounds with specialized ambient weather settings.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className="w-full text-left p-3 bg-slate-950/80 hover:bg-slate-900 active:scale-98 transition rounded-2xl border border-slate-850 flex items-center justify-between group cursor-pointer"
                  disabled={isReplaying}
                >
                  <div className="font-mono">
                    <span className="text-[11.5px] font-black text-slate-250 block group-hover:text-indigo-400 transition">{sc.name}</span>
                    <span className="text-[9px] text-slate-500 block leading-none mt-0.5">{sc.desc}</span>
                  </div>
                  <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                </button>
              ))}
            </div>
          </section>

          {/* FAILURE PREDICTION ENGINE (Item 6) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 space-y-3 font-mono">
            <h2 className="text-xs tracking-widest uppercase font-black text-indigo-400 border-b border-slate-800 pb-3">
              03/ Failure Prediction Engine
            </h2>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs text-slate-350 space-y-2.5 relative overflow-hidden">
              <div className="text-[8.5px] uppercase text-slate-500 font-bold tracking-widest flex justify-between items-center">
                <span>Predictive Diagnostics</span>
                <span className="text-indigo-400 font-black">Confidence: {countdownAndPrediction.confidence}%</span>
              </div>
              <p className={`text-sm font-black tracking-wide ${liveResult.status === 'Discharging' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {countdownAndPrediction.shutDownText}
              </p>
              <div className="flex justify-between text-[9.5px]">
                <span>Load Condition:</span>
                <span className="text-white font-bold">{activeCooler.wattage}W Draw</span>
              </div>
              <div className="flex justify-between text-[9.5px]">
                <span>Reserve Survival:</span>
                <span className="text-white font-bold">{Math.round((activeBattery.energyWh * (liveResult.batterySoc - minSocLimit)/100)*10)/10}Wh</span>
              </div>
            </div>
          </section>

        </div>

        {/* COLUMN 2: PRIMARY ENERGY FLOW SCHEMATIC & BATTERY DIGITAL TWIN (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PRIMARY SANKEY / POWER FLOW SCHEMATIC BLOCK (Item 1 & 4) */}
          <section className="bg-[#080d15] border border-slate-800 rounded-3xl p-6 relative space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[8.5px] font-bold text-indigo-455 font-mono uppercase tracking-widest block">Operational matrix</span>
                <h2 className="text-xs font-black font-mono text-white uppercase tracking-wide">
                  Interactive Energy Flow schematic
                </h2>
              </div>
              <span className="text-[8px] bg-slate-950 px-2.5 py-0.5 border border-slate-800 text-slate-400 tracking-wider font-mono uppercase rounded font-bold">
                SCADA View
              </span>
            </div>

            {/* FLOW DIAGRAM CONTAINER */}
            <div className="relative h-[250px] bg-slate-950 border border-slate-900 rounded-2xl px-2.5 py-3.5 overflow-hidden flex flex-col justify-between">
              
              {/* Backing dynamic grid lines with flows */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* 1. Solar to MPPT */}
                <path d="M 60,70 L 145,70" fill="none" className="stream-normal text-sky-400" strokeWidth={currentModulatedSolar > 0 ? 2 : 0.5} />
                {/* 2. MPPT to Bus Joint */}
                <path d="M 145,70 L 225,70" fill="none" className="stream-normal text-sky-400" strokeWidth={currentModulatedSolar > 0 ? 2 : 0.5} />
                
                {/* 3. Bus to Cooler */}
                <path d="M 225,70 L 335,70" fill="none" className="stream-normal text-sky-400" strokeWidth={liveResult.fanSpeed > 0 ? 2 : 0.5} />
                
                {/* 4. Bus to Battery via Boost (Green downward when charging, Orange upward when discharging) */}
                {liveResult.status !== 'Idle' && (
                  <path 
                    d="M 225,70 L 225,170" 
                    fill="none" 
                    className={liveResult.status === 'Charging' ? 'stream-charge' : 'stream-discharge'} 
                    strokeWidth={2} 
                  />
                )}
              </svg>

              {/* Dynamic Overlay Floating Wattages directly over path lanes */}
              <div className="absolute top-11 left-22 z-20 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded font-mono text-xs text-amber-400 font-extrabold shadow-md">
                {currentModulatedSolar}W Input
              </div>

              <div className="absolute top-11 left-64 z-20 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded font-mono text-xs text-sky-400 font-extrabold shadow-md">
                {activeCooler.wattage * (liveResult.fanSpeed / 100)}W load
              </div>

              {liveResult.status !== 'Idle' && (
                <div className="absolute top-26 left-[236px] z-20 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded font-mono text-xs font-black whitespace-nowrap shadow-md">
                  {liveResult.status === 'Charging' ? (
                    <span className="text-emerald-400">Charging: +{Math.max(0, liveResult.powerBalance)}W</span>
                  ) : (
                    <span className="text-amber-500 font-bold">Buffer: -{Math.abs(liveResult.powerBalance)}W</span>
                  )}
                </div>
              )}

              {/* SCADA NODES REPRESENTATIONS */}
              <div className="grid grid-cols-4 items-center justify-items-center h-[140px] z-10 relative">
                
                {/* Solar block node */}
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 relative shadow-inner">
                    <Sun className={`w-7 h-7 ${currentModulatedSolar > 40 ? 'animate-spin' : 'animate-pulse'}`} style={{ animationDuration: '30s' }} />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase font-mono text-slate-400">PV Yield</span>
                  <span className="text-sm font-black text-amber-400 font-mono leading-none">{currentModulatedSolar}W</span>
                </div>

                {/* Regulator MPPT converter */}
                <div className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center font-mono">
                    <span className="text-xs text-[#38bdf8] font-black uppercase">MPPT</span>
                    <span className="text-[9px] text-slate-500 font-bold leading-none mt-0.5">96% Eff</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 font-mono tracking-wider uppercase">Regulator</span>
                </div>

                {/* Bus Joint stabilization center */}
                <div className="flex flex-col items-center text-center gap-1.5 font-mono">
                  <div className="px-4 py-2 bg-slate-900 border border-indigo-500 rounded-xl relative text-center shadow-lg shadow-indigo-500/10">
                    <span className="text-sm sm:text-base font-black text-indigo-300 block leading-none">{calculatedBusVoltage}V</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1 block">48V DC BUS</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 tracking-wider">Bus Node</span>
                </div>

                {/* Electric DC Fan Airflow Loader */}
                <div className="flex flex-col items-center text-center gap-1.5 relative">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 relative shadow-inner">
                    <Wind className={`w-7 h-7 z-10 ${liveResult.fanSpeed > 0 ? (liveResult.fanSpeed >= 75 ? 'animate-spin-fast' : 'animate-spin-medium') : ''}`} style={{ animationDuration: '0.4s' }} />
                    
                    {/* Airflow wind particles visual representations */}
                    {isPlaying && liveResult.fanSpeed > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        <span className="absolute w-1 h-0.5 bg-sky-200/45 rounded-full wind-particle top-4 left-0" />
                        <span className="absolute w-1.5 h-0.5 bg-sky-305/35 rounded-full wind-particle top-8 left-1" />
                        <span className="absolute w-1 h-0.5 bg-sky-200/40 rounded-full wind-particle top-10 left-2" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase font-mono text-slate-400 font-sans">Cooler CFMs</span>
                  <span className="text-xs sm:text-sm font-black text-sky-400 leading-none font-mono">{liveResult.fanSpeed}% RPM</span>
                </div>

              </div>

              {/* Equilibrum flow balance track summary card */}
              <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between text-xs font-mono mx-1">
                <span className="text-slate-400">Line Balance Equation:</span>
                <span className="font-black text-white text-xs sm:text-sm">
                  {liveResult.powerBalance >= 0 ? `+${liveResult.powerBalance}W surplus (STABLE COMPENSATED)` : `${liveResult.powerBalance}W deficit (BATTERY BUFFER SUPPORT ACTIVE)`}
                </span>
              </div>

            </div>
          </section>

          {/* MOVING CLOUD SIMULATION STAGE (Item 1 & 11) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
              <h2 className="text-xs font-mono tracking-widest uppercase font-black text-indigo-400">
                04/ Moving Cloud Simulator Stage
              </h2>
              {cloudActive ? (
                <span className="bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[9.5px] font-mono px-2 py-0.5 rounded animate-pulse">
                  ☁️ Transit overlapping PV cells
                </span>
              ) : (
                <span className="text-slate-500 text-[9.5px] font-mono uppercase">Sky Clear</span>
              )}
            </div>

            {/* Cloud Physical Overlap Stage Container */}
            <div className="h-[120px] bg-slate-950 border border-slate-900 rounded-2xl relative flex items-center justify-center overflow-hidden">
              
              {/* Backing Solar Cell Panels representation */}
              <div className="w-full max-w-[280px] grid grid-cols-4 gap-1.5 h-14 relative z-0">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="border border-[#1e293b] rounded-md transition-all duration-310 relative overflow-hidden bg-slate-900"
                  >
                    {/* Solar Ray Light Intensity Glow */}
                    <div 
                      className="absolute inset-0 bg-amber-400/20" 
                      style={{ opacity: cloudActive ? (100 - cloudCoveragePercent) / 100 : 1 }}
                    />
                    <div className="absolute bottom-1 right-1 text-[7px] text-slate-500 font-mono">Cell {i+1}</div>
                  </div>
                ))}
              </div>

              {/* Physical Floating SVG Cloud drifting across based on cloudX */}
              {cloudActive && (
                <div 
                  className="absolute pointer-events-none z-10 transition-transform duration-100 ease-linear"
                  style={{
                    transform: `translateX(${cloudX}px)`,
                    opacity: 0.85,
                  }}
                >
                  <div className="bg-slate-500/80 p-3 px-5 rounded-full flex items-center gap-1 text-white border border-slate-400/20 shadow-2xl relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] bg-slate-905 border border-slate-700 px-1 font-mono uppercase font-black rounded-md whitespace-nowrap text-white">
                      Overlap
                    </span>
                    <span className="text-xs font-black">☁️</span>
                    <span className="text-[10px] font-extrabold text-white font-mono">{cloudDropPercent}% dens</span>
                  </div>
                </div>
              )}

            </div>

            {/* Cloud parameters feed displays */}
            <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
              <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl text-center">
                <span className="text-slate-500 uppercase block text-[8px]">Cloud Coverage</span>
                <p className="text-xs font-black text-white mt-1">{cloudCoveragePercent}%</p>
              </div>
              <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl text-center">
                <span className="text-slate-500 uppercase block text-[8px]">Irradiance index</span>
                <p className="text-xs font-black text-amber-400 mt-1">
                  {cloudActive ? 100 - Math.round(cloudCoveragePercent * (cloudDropPercent / 100)) : 100}%
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl text-center">
                <span className="text-slate-550 uppercase block text-[8px]">Solar Output</span>
                <p className="text-xs font-black text-emerald-400 mt-1">{currentModulatedSolar}W</p>
              </div>
            </div>

            <button
              onClick={() => handleTriggerCloudMovement()}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 active:scale-99 text-white hover:border-indigo-500 font-mono text-xs font-black uppercase tracking-wider rounded-2xl shadow transition cursor-pointer"
              disabled={cloudActive || isReplaying}
            >
              ⚡ Launch Moving Cloud Event
            </button>
          </section>

          {/* INTERACTIVE BATTERY VISUALIZATION WITH COUNTDOWN TIMER (Item 2 & 3) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 font-mono">
              <span className="text-xs font-black uppercase tracking-wide text-indigo-400">
                05/ Active Buffer Sizing Node
              </span>
              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                liveResult.status === 'Charging' ? 'bg-emerald-950 text-emerald-400' : liveResult.status === 'Discharging' ? 'bg-amber-950 text-amber-500' : 'bg-slate-950 text-slate-500'
              }`}>
                {liveResult.status === 'Charging' ? '↑ Storing Surplus' : liveResult.status === 'Discharging' ? '↓ Buffer Active' : 'Standby Grid'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-mono">
              
              {/* Battery fluid shape cells representer */}
              <div className="col-span-12 md:col-span-4 flex justify-center">
                <div className="w-18 h-32 border-2 border-slate-800 rounded-2xl p-1 bg-slate-950 relative">
                  <div className="w-6 h-2 bg-slate-750 absolute -top-2 left-1/2 -translate-x-1/2 rounded" />
                  
                  <div className="h-full w-full rounded-xl bg-slate-900/80 overflow-hidden relative flex flex-col justify-end">
                    
                    {/* Fill status colored dynamically based on SOC */}
                    <div 
                      className={`w-full transition-all duration-1000 relative flex items-center justify-center ${
                        liveResult.batterySoc > 55 
                          ? 'bg-gradient-to-t from-emerald-900 to-emerald-500/80' 
                          : liveResult.batterySoc > 20
                          ? 'bg-gradient-to-t from-amber-700 to-amber-500'
                          : 'bg-gradient-to-t from-rose-900 to-rose-600'
                      }`}
                      style={{ height: `${liveResult.batterySoc}%` }}
                    >
                      <span className="font-mono text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                        {liveResult.batterySoc}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic support countdown warning panels */}
              <div className="col-span-12 md:col-span-8 space-y-3.5 text-xs">
                
                {liveResult.status === 'Discharging' && (
                  <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl space-y-1 animate-fade-in text-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-amber-400 tracking-wider block">
                      Estimated Buffer Time Remaining
                    </span>
                    <p className="text-xl font-black">{countdownAndPrediction.estimatedTimeText}</p>
                    <p className="text-[8.5px] text-slate-400 mt-0.5 uppercase tracking-wide">
                      Capacity limit: {minSocLimit}% clamp buffer
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <span>Terminal Volts:</span>
                    <p className="text-slate-100 font-extrabold mt-0.5">
                      {Math.round((activeBattery.nominalVoltage * (0.85 + 0.25 * (liveResult.batterySoc / 100))) * 10) / 10}V
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <span>Reserve energy:</span>
                    <p className="text-slate-100 font-extrabold mt-0.5">
                      {Math.round(activeBattery.energyWh * (liveResult.batterySoc / 100) * 10) / 10} Wh
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 text-[10px]">
                  <span>Battery Cell Architecture:</span>
                  <p className="text-emerald-400 font-black mt-0.5 uppercase">
                    {activeBattery.nominalVoltage > 12 ? '4S/2P Lithium cobalt' : '3S/2P Lithium cobalt'} pack
                  </p>
                </div>

              </div>

            </div>
          </section>

        </div>

        {/* COLUMN 3: REAL-TIME BUS VOLTAGE GRAPH & TELEMETRY REGISTRY (col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 48V DC Stability Recovery health check (Item 5) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5.5 space-y-4">
            <h2 className="text-xs font-mono tracking-widest uppercase font-black text-indigo-400 border-b border-slate-800 pb-3">
              06/ 48V DC Bus stability
            </h2>

            <div className="space-y-4 font-mono">
              <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-2xl border border-slate-850">
                <div>
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-widest block font-bold leading-none">Instant Volts</span>
                  <p className={`text-base font-black mt-1 ${calculatedBusVoltage >= 47.0 ? 'text-emerald-500' : 'text-amber-400'}`}>
                    {calculatedBusVoltage}V
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-widest block font-bold leading-none">Stability index</span>
                  <p className="text-base text-sky-400 font-black mt-1">{busStabilityRating}%</p>
                </div>
              </div>

              {/* Dynamic chart logging recover timeline */}
              <div className="h-[105px] w-full bg-slate-950 p-1.5 rounded-2xl border border-slate-900">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rollingHistory} margin={{ top: 2, right: 2, left: -22, bottom: 2 }}>
                    <defs>
                      <linearGradient id="busRecGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[35, 52]} tick={{ fill: '#475569', fontSize: 7 }} />
                    <Area type="monotone" dataKey="busVoltage" stroke="#818cf8" strokeWidth={1} fill="url(#busRecGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                  <span>Power Flow Delta:</span>
                  <span className={`block font-bold mt-0.5 ${liveResult.powerBalance >= 0 ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {liveResult.powerBalance >= 0 ? `+${liveResult.powerBalance}W` : `${liveResult.powerBalance}W`}
                  </span>
                </div>
                <div className="bg-slate-950/40 p-2 border border-slate-850 rounded">
                  <span>Bus Voltage Drop:</span>
                  <span className="block text-slate-200 mt-1 font-bold">
                    -{Math.round((48.0 - calculatedBusVoltage) * 10) / 10}V
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div className="bg-rose-500 h-full" style={{ width: '15%' }} />
                <div className="bg-amber-400 h-full" style={{ width: '25%' }} />
                <div className="bg-emerald-500 h-full" style={{ width: '60%' }} />
              </div>

            </div>
          </section>

          {/* CHRONOLOGICAL EVENT MATRIX REGISTRY (Item 7) */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5.5 space-y-4 flex flex-col h-[280px]">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-xs font-mono tracking-widest uppercase font-black text-indigo-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Chrono events feed
              </h2>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider font-mono">Live UTC</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" id="chronological-logs-feed">
              {eventLogs.length > 0 ? (
                eventLogs.map((log) => {
                  const mapColor = {
                    info: 'text-sky-400 border-sky-950/30 bg-sky-950/10',
                    warn: 'text-amber-400 border-amber-950/30 bg-amber-950/10',
                    success: 'text-emerald-400 border-emerald-950/30 bg-emerald-900/10',
                    danger: 'text-rose-400 border-rose-950/30 bg-rose-900/10',
                  };
                  return (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded-xl border text-[9.5px] font-mono leading-relaxed flex flex-col gap-0.5 ${mapColor[log.type]}`}
                    >
                      <span className="text-slate-550 text-[7.5px] font-bold">{log.time}</span>
                      <p>{log.text}</p>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-center text-[10px] text-slate-500 font-mono italic">
                  Timeline loops initialized. Telemetry events will stream here chronologically.
                </div>
              )}
            </div>
          </section>

        </div>

      </div>

      {/* TIMELINE TRANSPORT CONTROL RAIL (Item 12 & 10) */}
      <footer className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[9px] text-slate-550 uppercase font-black tracking-wider block">Controller</span>
            <span className="text-slate-200 font-bold block mt-0.5">Timeline controller & Replay deck</span>
          </div>
        </div>

        {/* Replay state indicators overlay */}
        {isReplaying && (
          <div className="bg-indigo-950/80 text-white font-mono text-[10.5px] font-black tracking-wider border border-indigo-500/30 px-4 py-1.5 rounded-xl animate-pulse">
            🎬 REPLAY ACTIVE: Frame {replayIndex + 1} / {replayBuffer.length}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Speed settings multiplier */}
          <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl">
            {[1, 2, 5, 10].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-3 py-1 text-[10px] uppercase font-black rounded-lg transition cursor-pointer ${
                  simulationSpeed === speed ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 text-slate-950 font-black tracking-wider text-[11px] uppercase cursor-pointer rounded-xl flex items-center gap-1.5 transition ${
              isPlaying ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-400 hover:bg-emerald-300'
            }`}
            disabled={isReplaying}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Replay action buttons */}
          <button
            onClick={handleTriggerReplay}
            className={`px-4 py-2 border rounded-xl font-bold tracking-wider uppercase text-[11px] transition cursor-pointer ${
              replayBuffer.length > 0 && !isReplaying && !isPlaying
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                : 'bg-slate-950/20 border-slate-900 text-slate-650 cursor-not-allowed'
            }`}
            disabled={replayBuffer.length === 0 || isReplaying || isPlaying}
          >
            ▶ Replay Simulation
          </button>

          <button
            onClick={() => {
              setBatterySoc(85);
              setSecondsElapsed(0);
              setRollingHistory([]);
              addEventLog(`🔄 Telemetry registries reset. Restored standard 85% capacity.`, 'info');
            }}
            className="p-2.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            title="Reset system history logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>
      </footer>

      {/* BATTERY CHOOSE UTILIZATION ANALYTICS SECTION (Item 5) */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 text-xs text-slate-350 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <Award className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-black font-mono uppercase text-emerald-400">
              07/ Battery Sizing & Utilization Analytics
            </h3>
            <p className="text-[10px] font-mono text-slate-450 leading-none">
              Evaluate real-time cycle wear to verify whether the storage cell is oversized or undersized.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-[10.5px]">
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-1">
            <span className="text-[8px] text-slate-500 uppercase block font-bold">Total Charge Cycles:</span>
            <p className="text-base font-black text-white">{(totalChargedWh / activeBattery.energyWh).toFixed(4)} cycles</p>
            <span className="text-[8.5px] text-slate-500 block">Relative life stress index</span>
          </div>
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-1">
            <span className="text-[8px] text-slate-500 uppercase block font-bold">Daily range utilization:</span>
            <p className="text-base font-black text-white">
              {Math.max(5, 100 - liveResult.batterySoc).toFixed(1)}% delta SOC
            </p>
            <span className="text-[8.5px] text-slate-500 block">Peak-to-floor fluctuation</span>
          </div>
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-1">
            <span className="text-[8px] text-slate-500 uppercase block font-bold">Accumulated Buffer:</span>
            <p className="text-base font-black text-white">{(totalDischargedWh).toFixed(2)} Wh</p>
            <span className="text-[8.5px] text-[#10b981] block font-bold">Stabilized load deficit</span>
          </div>
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-1">
            <span className="text-[8px] text-slate-500 uppercase block font-bold">Average Buffer SOC:</span>
            <p className="text-base font-black text-white">
              {Math.round(socAccSum / socAccTicks)}% SOC
            </p>
            <span className="text-[8.5px] text-slate-500 block">Overall lifetime charge levels</span>
          </div>
          <div className="bg-[#111622] p-4.5 rounded-2xl border border-emerald-500/25 space-y-1 col-span-1">
            <span className="text-[8.5px] text-[#34d399] uppercase block font-extrabold font-mono tracking-wide">Storage Sizing Verdict:</span>
            <p className="text-xs font-black text-white mt-1">
              {activeBattery.energyWh < 30 ? (
                <span className="text-rose-455">⚠️ BUFFER UNDERSIZED</span>
              ) : (
                <span className="#10b981 text-emerald-400 font-bold uppercase">✓ OPTIMAL RESERVES</span>
              )}
            </p>
            <p className="text-[8.5px] text-slate-400 leading-normal font-sans mt-0.5">
              {activeBattery.energyWh < 30 ? 'High cycling rates reduce lifespan.' : 'Properly offset transient drops.'}
            </p>
          </div>
        </div>
      </section>

      {/* 24-HOUR DIURNAL DIGITAL TWIN SWEEP (Item 9) */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-widest block">
              Diurnal digital twin projection
            </span>
            <h2 className="text-md md:text-lg font-black uppercase text-white font-mono tracking-wider">
              08/ 24-Hour Diurnal Digital Twin Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Process power performance profiles through standard 24-hour diurnal curve availability.
            </p>
          </div>
          
          <button
            onClick={handleRun24HourSimulation}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-650 to-indigo-500 hover:from-indigo-650 border border-indigo-500/20 text-white rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer self-start md:self-auto"
          >
            Compile Daily Twin Sweep
          </button>
        </div>

        {run24HourData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Hour Scrubber & Backdrop tracker visualizers (Item 9) */}
            <div className={`lg:col-span-4 p-5 rounded-3xl border border-slate-800 bg-gradient-to-br ${diurnalVisualProps.bg} overflow-hidden min-h-[170px] flex flex-col justify-between font-mono text-slate-100 transition-all duration-1000 md:col-span-12`}>
              <div className="space-y-1">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block">Active diurnal window</span>
                <h3 className="text-base font-black uppercase leading-tight">{diurnalVisualProps.name}</h3>
              </div>

              {/* Slider timeline tracker */}
              <div className="my-5 bg-slate-950/80 border border-slate-850 p-4.5 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span>Active Hour:</span>
                  <span className="text-indigo-400 font-black">
                    {activeScrubbedHour === 0 ? '12 AM (Midnight)' : activeScrubbedHour === 12 ? '12 PM (Noon)' : activeScrubbedHour! > 12 ? `${activeScrubbedHour! - 12} PM` : `${activeScrubbedHour} AM`}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="23"
                  value={activeScrubbedHour || 0}
                  onChange={(e) => setActiveScrubbedHour(parseInt(e.target.value))}
                  className="w-full h-1 ml-0.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Live metrics inside selected scrubbed hours */}
              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-350">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span>PV Solar Output:</span>
                  <p className="text-amber-400 font-black mt-0.5">{run24HourData[activeScrubbedHour || 0]?.solarPower} Watts</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span>Battery Reserve:</span>
                  <p className="text-emerald-400 font-black mt-0.5">{run24HourData[activeScrubbedHour || 0]?.batterySoc}% SOC</p>
                </div>
              </div>

            </div>

            {/* Sweep results analytics graphs representation */}
            <div className="lg:col-span-8 p-4 bg-slate-950 border border-slate-900 rounded-3xl h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={run24HourData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="solarYield24" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                  <XAxis dataKey="hourLabel" fontSize={8} stroke="#64748b" />
                  <YAxis fontSize={8} stroke="#64748b" />
                  <Tooltip contentStyle={{ fontSize: '9px', backgroundColor: '#090d16', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  
                  <Area type="monotone" dataKey="solarPower" stroke="#f59e0b" fill="url(#solarYield24)" name="Solar W" />
                  <Area type="monotone" dataKey="batterySoc" stroke="#10b981" fill="none" name="SOC %" />
                  <Area type="step" dataKey="fanSpeed" stroke="#38bdf8" fill="none" name="RPM %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        ) : (
          <div className="bg-slate-950 p-6 rounded-3xl text-center space-y-2 border border-slate-900 mx-1">
            <span className="text-2xl block text-slate-500">📈</span>
            <p className="text-[10px] text-slate-500 font-mono">
              Awaiting Diurnal Digital Twin simulation results. Click &quot;Compile Daily Twin Sweep&quot; above to process.
            </p>
          </div>
        )}
      </section>

      {/* DETAILED ENGINEERING RECOMMENDATION DISCOVERY CARDS (Item 10) */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6.5 text-xs text-slate-300 space-y-6">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase text-indigo-400 font-mono tracking-wider">
              09/ Engineering Recommendation Sizing Engine
            </h3>
            <p className="text-[10px] text-slate-450 font-mono leading-none">
              Calculated dynamically from simulated cloud load transients and battery buffer limits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-[10.5px]">
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-1.5 col-span-1">
            <span className="text-[8px] text-indigo-400 uppercase font-bold tracking-widest block">Recommended PV grid</span>
            <p className="text-sm font-black text-white mt-0.5">{engineeringRecommendations.recommendedPanel}</p>
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Provides adequate current overhead inputs to bridge standard cloud durations while simultaneously charging buffer cells.
            </p>
          </div>
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-1.5 col-span-1">
            <span className="text-[8px] text-indigo-400 uppercase font-bold tracking-widest block">Ideal Storage Spec</span>
            <p className="text-sm font-black text-white mt-0.5">{engineeringRecommendations.recommendedBattery}</p>
            <p className="text-[10px] text-slate-500 leading-normal font-sans font-mono">
              Optimal energy-capacity ratios securely sustain high transient motor droops without triggering low-SOC limits.
            </p>
          </div>
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-[#1e293b] space-y-1.5 col-span-2 flex flex-col justify-between">
            <div>
              <span className="text-[8px] text-[#10b981] uppercase font-black tracking-widest block">Simulation sizing diagnostics justification</span>
              <p className="text-xs text-slate-100 italic leading-relaxed mt-1 font-sans">
                &quot;{engineeringRecommendations.reason}&quot;
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[9px] bg-slate-900/60 p-2 rounded-xl mt-2">
              <div>
                <span className="text-slate-500 block leading-none">Daily Duty:</span>
                <span className="text-white font-extrabold mt-1 block">{engineeringRecommendations.expectedDailyRuntime}</span>
              </div>
              <div>
                <span className="text-slate-500 block leading-none">Full-RPM Time:</span>
                <span className="text-white font-extrabold mt-1 block">{engineeringRecommendations.expectedFullSpeed}</span>
              </div>
              <div>
                <span className="text-slate-500 block leading-none">Buffered Duty:</span>
                <span className="text-white font-extrabold mt-1 block">{engineeringRecommendations.expectedBuffered}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
