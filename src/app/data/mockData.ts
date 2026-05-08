// Mock data for the Fleet Management System

export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'ev' | 'drone';
  status: 'on-route' | 'delayed' | 'idle';
  lat: number;
  lng: number;
  driverId: string;
  driverName: string;
  batteryLevel?: number;
  fuelLevel?: number;
  currentLoad: number;
  maxLoad: number;
  routeStopIds: string[];
}

export type DeliveryStopType =
  | 'depot'
  | 'residential'
  | 'commercial'
  | 'office'
  | 'industrial'
  | 'landmark';

export interface DeliveryStop {
  id: string;
  name: string;
  nameAr: string;
  address: string;
  lat: number;
  lng: number;
  status: 'pending' | 'completed' | 'current';
  type: DeliveryStopType;
  scheduledTime: string;
  actualTime: string | null;
  estimatedTime?: string;
  packageCount?: number;
}

export interface Route {
  id: string;
  vehicleId: string;
  driverId: string;
  stops: DeliveryStop[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'active' | 'completed' | 'planned';
}

export interface KPIData {
  totalCost: number;
  co2Emissions: number;
  fleetUtilization: number;
  workloadFairness: number;
}

// Mock Vehicles — positioned near their first assigned delivery stop in Dammam, KSA.
// Each vehicle carries a `routeStopIds` list (distinct across vehicles); the last
// id is the vehicle's final destination.
export const mockVehicles: Vehicle[] = [
  {
    id: 'V001',
    name: 'Truck-01',
    type: 'truck',
    status: 'on-route',
    lat: 26.4000,
    lng: 50.0680,
    driverId: 'D001',
    driverName: 'Ahmed Al-Rashid',
    fuelLevel: 75,
    currentLoad: 850,
    maxLoad: 1000,
    routeStopIds: ['S003', 'S009', 'S010'],
  },
  {
    id: 'V002',
    name: 'EV-02',
    type: 'ev',
    status: 'on-route',
    lat: 26.4352,
    lng: 50.1082,
    driverId: 'D002',
    driverName: 'Mohammed Al-Saud',
    batteryLevel: 68,
    currentLoad: 600,
    maxLoad: 800,
    routeStopIds: ['S004', 'S005', 'S006', 'S008'],
  },
  {
    id: 'V003',
    name: 'Truck-03',
    type: 'truck',
    status: 'idle',
    lat: 26.4620,
    lng: 50.0000,
    driverId: 'D003',
    driverName: 'Khalid Al-Mansour',
    fuelLevel: 92,
    currentLoad: 0,
    maxLoad: 1000,
    routeStopIds: ['S007', 'S011', 'S015'],
  },
  {
    id: 'V004',
    name: 'EV-04',
    type: 'ev',
    status: 'delayed',
    lat: 26.4330,
    lng: 50.1050,
    driverId: 'D004',
    driverName: 'Fahad Al-Najjar',
    batteryLevel: 45,
    currentLoad: 720,
    maxLoad: 800,
    routeStopIds: ['S014', 'S019', 'S020'],
  },
  {
    id: 'V005',
    name: 'Truck-05',
    type: 'truck',
    status: 'on-route',
    lat: 26.4400,
    lng: 50.1045,
    driverId: 'D005',
    driverName: 'Omar Al-Qassim',
    fuelLevel: 58,
    currentLoad: 900,
    maxLoad: 1000,
    routeStopIds: ['S012', 'S013', 'S016'],
  },
  {
    id: 'V006',
    name: 'EV-06',
    type: 'ev',
    status: 'idle',
    lat: 26.4000,
    lng: 50.1400,
    driverId: 'D006',
    driverName: 'Abdullah Al-Farsi',
    batteryLevel: 88,
    currentLoad: 0,
    maxLoad: 800,
    routeStopIds: ['S017', 'S018', 'S020'],
  },
];

// Validated 20-stop dataset for Dammam, KSA — no duplicate coordinates.
// S013 lat offset by +0.0015 from S003 (both Al Faisaliyah district) so markers
// don't stack on the map.
export const mockDeliveryStops: DeliveryStop[] = [
  // --- DEPOTS ---
  { id: 'S001', name: 'SPL Central Post Office', nameAr: 'مكتب بريد الدمام المركزي', address: '9th Street, Al Adamah, Dammam 32241', lat: 26.4352, lng: 50.1082, status: 'completed', scheduledTime: '08:00', actualTime: '08:00', type: 'depot' },
  { id: 'S002', name: 'SPL Al Itisalat Branch', nameAr: 'مكتب بريد حي الاتصالات', address: '18th Street, Al Itisalat, Dammam 32257', lat: 26.4073, lng: 50.0828, status: 'completed', scheduledTime: '08:30', actualTime: '08:35', type: 'depot' },

  // --- RESIDENTIAL ---
  { id: 'S003', name: 'Al Faisaliyah District', nameAr: 'حي الفيصلية', address: 'Al Faisaliyah, Dammam 32272', lat: 26.3972, lng: 50.0650, status: 'completed', scheduledTime: '09:00', actualTime: '09:05', type: 'residential' },
  { id: 'S004', name: 'Uhud District', nameAr: 'حي أحد', address: 'Uhud, Dammam', lat: 26.4133, lng: 50.0407, status: 'current', scheduledTime: '09:30', actualTime: null, type: 'residential' },
  { id: 'S005', name: 'Al Nakhil Neighborhood', nameAr: 'حي النخيل', address: 'Al Nakhil, Dammam 32244', lat: 26.4417, lng: 50.0934, status: 'pending', scheduledTime: '10:00', actualTime: null, type: 'residential' },
  { id: 'S006', name: 'Al Khalij Neighborhood', nameAr: 'حي الخليج', address: 'Al Khalij, Dammam 32425', lat: 26.4462, lng: 50.0920, status: 'pending', scheduledTime: '10:20', actualTime: null, type: 'residential' },
  { id: 'S007', name: 'Dahiyat Al Malik Fahd North', nameAr: 'ضاحية الملك فهد الشمالية', address: 'Dahiyat Al Malik Fahd, Dammam 32512', lat: 26.4658, lng: 49.9976, status: 'pending', scheduledTime: '10:45', actualTime: null, type: 'residential' },
  { id: 'S008', name: 'Ash Shati Waterfront', nameAr: 'حي الشاطئ الشرقي', address: 'Ash Shati Ash Sharqi, Dammam 32412', lat: 26.4731, lng: 50.1306, status: 'pending', scheduledTime: '11:10', actualTime: null, type: 'residential' },
  { id: 'S009', name: 'An Nada District', nameAr: 'حي الندى', address: 'Al Nada District, Dammam 32271', lat: 26.3747, lng: 50.0758, status: 'pending', scheduledTime: '11:35', actualTime: null, type: 'residential' },

  // --- COMMERCIAL ---
  { id: 'S010', name: 'Al Othaim Mall', nameAr: 'العثيم مول', address: 'Prince Mohammed Bin Fahd Rd, Al Shifa, Dammam 32236', lat: 26.3999, lng: 50.1166, status: 'pending', scheduledTime: '12:00', actualTime: null, type: 'commercial' },
  { id: 'S011', name: '9th Street Retail Strip', nameAr: 'شارع التاسع التجاري', address: '9th Street, Al Adamah, Dammam 32241', lat: 26.4418, lng: 50.1078, status: 'pending', scheduledTime: '12:25', actualTime: null, type: 'commercial' },
  { id: 'S012', name: 'Al Souk Market Area', nameAr: 'منطقة سوق الدمام', address: 'Al Souk, central Dammam 32242', lat: 26.4400, lng: 50.1045, status: 'pending', scheduledTime: '12:45', actualTime: null, type: 'commercial' },
  { id: 'S013', name: 'Al Faisaliyah Square (Danube)', nameAr: 'ميدان الفيصلية — دانوب', address: 'King Fahd Rd, Al Faisaliyah, Dammam 32272', lat: 26.3987, lng: 50.0650, status: 'pending', scheduledTime: '13:05', actualTime: null, type: 'commercial' },

  // --- OFFICE / BUSINESS ---
  { id: 'S014', name: 'Central Dammam Business Core', nameAr: 'قلب الأعمال بوسط الدمام', address: 'King Saud St, Dammam 32242', lat: 26.4344, lng: 50.1033, status: 'pending', scheduledTime: '13:25', actualTime: null, type: 'office' },
  { id: 'S015', name: 'Al Rabi Office Area', nameAr: 'مكاتب حي الربيع', address: 'Al Rabi, Dammam 32241', lat: 26.4404, lng: 50.1143, status: 'pending', scheduledTime: '13:45', actualTime: null, type: 'office' },
  { id: 'S016', name: 'Al Gazaz Commercial & Office', nameAr: 'حي الغزّاز التجاري', address: 'Al Gazaz, Dammam 32248', lat: 26.4357, lng: 50.0943, status: 'pending', scheduledTime: '14:05', actualTime: null, type: 'office' },

  // --- INDUSTRIAL ---
  { id: 'S017', name: 'Industrial Area No. 1', nameAr: 'المنطقة الصناعية الأولى', address: 'Industrial Area No. 1, Dammam 32234', lat: 26.3968, lng: 50.1404, status: 'pending', scheduledTime: '14:30', actualTime: null, type: 'industrial' },
  { id: 'S018', name: 'King Abdulaziz Port — Truck Gate', nameAr: 'ميناء الملك عبدالعزيز — بوابة الشاحنات', address: 'King Abdul Aziz Seaport, Dammam 32211', lat: 26.4886, lng: 50.2011, status: 'pending', scheduledTime: '15:00', actualTime: null, type: 'industrial' },

  // --- MIXED USE / LANDMARKS ---
  { id: 'S019', name: 'King Fahad Specialist Hospital', nameAr: 'مستشفى الملك فهد التخصصي', address: 'Omar Bin Thabet St, Al Muraikabat, Dammam 32253', lat: 26.4111, lng: 50.1011, status: 'pending', scheduledTime: '15:20', actualTime: null, type: 'landmark' },
  { id: 'S020', name: 'IAU East Campus', nameAr: 'جامعة الإمام عبدالرحمن — الحرم الشرقي', address: 'Rakkah, Dammam 34221', lat: 26.3979, lng: 50.1982, status: 'pending', scheduledTime: '15:45', actualTime: null, type: 'landmark' },
];

// Mock KPI Data
export const mockKPIData: KPIData = {
  totalCost: 45280,
  co2Emissions: 2847,
  fleetUtilization: 73,
  workloadFairness: 0.82,
};

// Mock Analytics Data - Cost vs CO2 over time
export const mockCostCO2Data = [
  { date: 'Jan', cost: 42000, co2: 2950 },
  { date: 'Feb', cost: 41500, co2: 2820 },
  { date: 'Mar', cost: 43200, co2: 2900 },
  { date: 'Apr', cost: 44800, co2: 3100 },
  { date: 'May', cost: 45280, co2: 2847 },
];

// Mock Fleet Utilization Over Time
export const mockUtilizationData = [
  { time: '00:00', utilization: 45 },
  { time: '04:00', utilization: 38 },
  { time: '08:00', utilization: 68 },
  { time: '12:00', utilization: 82 },
  { time: '16:00', utilization: 75 },
  { time: '20:00', utilization: 58 },
];

// Mock Driver Workload Distribution
export const mockWorkloadData = [
  { driver: 'Ahmed', deliveries: 42, hours: 38 },
  { driver: 'Mohammed', deliveries: 38, hours: 36 },
  { driver: 'Khalid', deliveries: 45, hours: 40 },
  { driver: 'Fahad', deliveries: 40, hours: 37 },
  { driver: 'Omar', deliveries: 43, hours: 39 },
  { driver: 'Abdullah', deliveries: 39, hours: 35 },
];

// Mock Notifications
export interface Notification {
  id: string;
  type: 'route-update' | 'delay' | 'message';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: 'N001',
    type: 'route-update',
    title: 'Route Updated',
    message: 'Your delivery route has been optimized. Check the new sequence.',
    time: '10 min ago',
    read: false,
  },
  {
    id: 'N002',
    type: 'message',
    title: 'Message from Dispatcher',
    message: 'Please prioritize deliveries in Al Malqa District today.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'N003',
    type: 'delay',
    title: 'Traffic Alert',
    message: 'Heavy traffic reported on King Fahd Road. Consider alternate route.',
    time: '2 hours ago',
    read: true,
  },
];

// Mock Driver Performance
export interface DriverPerformance {
  totalDeliveries: number;
  onTimeRate: number;
  efficiency: number;
  workloadBalance: number;
}

export const mockDriverPerformance: DriverPerformance = {
  totalDeliveries: 156,
  onTimeRate: 94,
  efficiency: 87,
  workloadBalance: 82,
};
