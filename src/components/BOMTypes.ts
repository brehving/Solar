export interface ComponentItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  shortDesc: string;
  availability: 'In Stock' | 'Low Stock' | 'Backorder';
  specs: Record<string, string>;
  material: string;
  efficiency: string;
  voltage: string;
  powerRating: string;
  dimensions: string;
  powerConsumption: string;
  recommendedApp: string;
  combat: {
    coolerTypes: string[];
    cabinetSizes: number[];
    insulationThicknesses: string[];
    coolingCapacities: string[];
  };
  notes: string;
}

export const CATEGORIES = [
  'Compressor',
  'Condenser',
  'Evaporator',
  'Expansion Device',
  'Fans',
  'Cabinet Material',
  'Insulation',
  'Controller',
  'Sensors',
  'Lighting',
  'Electrical Components',
  'Accessories'
] as const;

export type CategoryType = typeof CATEGORIES[number];
