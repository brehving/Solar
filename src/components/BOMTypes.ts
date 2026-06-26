export interface ComponentItem {
  id: string;
  partNumber: string;
  name: string;
  category: CategoryType;
  brand: string;
  price: number;
  shortDesc: string;
  availability: 'In Stock' | 'Low Stock' | 'Backorder';
  specs: Record<string, string>;
  electricalRatings: {
    voltage: string;
    current: string;
    power: string;
    efficiency?: string;
  };
  dimensions: string;
  typicalApplications: string;
  datasheetPreview: string;
  notes: string;
}

export const CATEGORIES = [
  'Solar Module',
  'Battery Pack',
  'Solar Charge Controller',
  'DC-DC Converter',
  'Motor Controller',
  'Main Motor',
  'Water Pump',
  'Swing Motor',
  'Sensors',
  'Controller PCB',
  'Protection Circuit',
  'Connectors & Wiring'
] as const;

export type CategoryType = typeof CATEGORIES[number];
