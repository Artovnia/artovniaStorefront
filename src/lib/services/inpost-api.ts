"use client"

// Environment detection
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const NGROK_URL = process.env.NEXT_PUBLIC_NGROK_URL;
const IS_NGROK = !!NGROK_URL;

// API tokens
const GEOWIDGET_TOKEN = process.env.NEXT_PUBLIC_GEOWIDGET_TOKEN || "";

// InPost Geowidget URLs - Using Sandbox Environment
const GEOWIDGET_CSS_URL = "https://sandbox-easy-geowidget-sdk.easypack24.net/inpost-geowidget.css";
const GEOWIDGET_JS_URL = "https://sandbox-easy-geowidget-sdk.easypack24.net/inpost-geowidget.js";

export interface InpostParcelData {
  machineId: string;
  machineName: string;
  machineAddress: string;
  machinePostCode: string;
  machineCity: string;
}

export function getTokensStatus() {
  return {
    geowidgetTokenAvailable: GEOWIDGET_TOKEN.length > 0,
    environment: IS_DEVELOPMENT ? 'development' : 'production',
    usingNgrok: IS_NGROK,
    ngrokUrl: NGROK_URL,
    geowidgetToken: GEOWIDGET_TOKEN
  };
}

// Load the geowidget resources
let resourcesLoaded = false;
let loadingPromise: Promise<boolean> | null = null;

export function loadGeowidgetResources(): Promise<boolean> {
  if (resourcesLoaded) {
    return Promise.resolve(true);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  if (!GEOWIDGET_TOKEN) {
    console.warn('No geowidget token available');
    return Promise.resolve(false);
  }

  loadingPromise = new Promise((resolve) => {
    let cssLoaded = false;
    let jsLoaded = false;
    let resolved = false;

    const checkBothLoaded = () => {
      if (cssLoaded && jsLoaded && !resolved) {
        resolved = true;
        resourcesLoaded = true;
        console.log('InPost Geowidget resources loaded successfully');
        
        // Set up global callback function for point selection
        (window as any).onPointSelect = (point: any) => {
          console.log('Global onPointSelect called:', point);
          const callback = (window as any).__inpostPointCallback;
          if (callback) {
            handlePointData(point, callback);
          }
        };
        
        resolve(true);
      }
    };

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = GEOWIDGET_CSS_URL;
    cssLink.onload = () => {
      cssLoaded = true;
      checkBothLoaded();
    };
    cssLink.onerror = () => {
      if (!resolved) {
        resolved = true;
        console.error('Failed to load InPost Geowidget CSS');
        resolve(false);
      }
    };
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = GEOWIDGET_JS_URL;
    script.defer = true;
    script.onload = () => {
      jsLoaded = true;
      // Add a small delay to ensure the custom element is registered
      setTimeout(checkBothLoaded, 200);
    };
    script.onerror = () => {
      if (!resolved) {
        resolved = true;
        console.error('Failed to load InPost Geowidget JS');
        resolve(false);
      }
    };
    document.head.appendChild(script);

    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('InPost Geowidget resources load timeout');
        resolve(false);
      }
    }, 15000);
  });

  return loadingPromise;
}

// Enhanced point selection handler setup
export function setupPointSelectionHandler(callback: (point: any) => void): void {
  console.log('Setting up point selection handler');
  
  // Store callback
  (window as any).__inpostPointCallback = callback;
  
  // Remove existing listeners
  document.removeEventListener('onpointselect', handlePointSelectionEvent);
  document.removeEventListener('onPointSelect', handlePointSelectionEvent);
  document.removeEventListener('pointselected', handlePointSelectionEvent);
  
  // Add multiple event listeners for different possible event names
  document.addEventListener('onpointselect', handlePointSelectionEvent);
  document.addEventListener('onPointSelect', handlePointSelectionEvent);
  document.addEventListener('pointselected', handlePointSelectionEvent);
  
  console.log('Point selection handlers attached');
}

function handlePointSelectionEvent(event: any): void {
  console.log('Point selection event received:', event.type, event);
  const callback = (window as any).__inpostPointCallback;
  if (callback && event.detail) {
    handlePointData(event.detail, callback);
  }
}

function handlePointData(point: any, callback: (point: InpostParcelData) => void): void {
  console.log('Processing point data:', point);
  
  try {
    // Handle different possible point data structures
    const parcelData: InpostParcelData = {
      machineId: point.name || point.point_id || point.id || point.code || 'unknown',
      machineName: point.name || point.point_id || point.id || point.code || 'Unknown',
      machineAddress: getAddress(point),
      machinePostCode: getPostCode(point),
      machineCity: getCity(point)
    };
    
    console.log('Converted parcel data:', parcelData);
    callback(parcelData);
  } catch (error) {
    console.error('Error processing point data:', error);
  }
}

function getAddress(point: any): string {
  return point.address?.street || 
         point.address?.line1 || 
         point.address_details?.street || 
         point.location?.address || 
         point.street ||
         'Unknown address';
}

function getPostCode(point: any): string {
  return point.address?.post_code || 
         point.address?.zipcode || 
         point.address_details?.post_code || 
         point.location?.post_code ||
         point.post_code ||
         '00-000';
}

function getCity(point: any): string {
  return point.address?.city || 
         point.address_details?.city || 
         point.location?.city ||
         point.city ||
         'Unknown city';
}

// Cleanup function
export function cleanupGeowidget(): void {
  document.removeEventListener('onpointselect', handlePointSelectionEvent);
  document.removeEventListener('onPointSelect', handlePointSelectionEvent);
  document.removeEventListener('pointselected', handlePointSelectionEvent);
  delete (window as any).__inpostPointCallback;
  delete (window as any).onPointSelect;
}

// Search functions with mock data for production
let searchTimeout: NodeJS.Timeout;

export async function searchParcelMachines(query: string): Promise<InpostParcelData[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  return new Promise((resolve) => {
    searchTimeout = setTimeout(async () => {
      try {
        const results = getMockParcelMachines(query);
        resolve(results);
      } catch (error) {
        console.warn("Search failed, using mock data:", error);
        resolve(getMockParcelMachines(query));
      }
    }, 300);
  });
}

export async function getNearbyParcelMachines(
  latitude?: number, 
  longitude?: number, 
  maxDistance: number = 10
): Promise<InpostParcelData[]> {
  try {
    return getMockNearbyParcelMachines();
  } catch (error) {
    console.warn("Nearby search failed, using mock data:", error);
    return getMockNearbyParcelMachines();
  }
}

function getMockParcelMachines(query: string): InpostParcelData[] {
  const mockData = [
    { machineId: "WAW001", machineName: "WAW001", machineAddress: "ul. Marszałkowska 1", machinePostCode: "00-001", machineCity: "Warszawa" },
    { machineId: "WAW002", machineName: "WAW002", machineAddress: "ul. Nowy Świat 15", machinePostCode: "00-029", machineCity: "Warszawa" },
    { machineId: "WAW003", machineName: "WAW003", machineAddress: "ul. Krakowskie Przedmieście 5", machinePostCode: "00-068", machineCity: "Warszawa" },
    { machineId: "WAW004", machineName: "WAW004", machineAddress: "ul. Chmielna 73", machinePostCode: "00-801", machineCity: "Warszawa" },
    { machineId: "WAW005", machineName: "WAW005", machineAddress: "ul. Żurawia 32/34", machinePostCode: "00-515", machineCity: "Warszawa" },
    { machineId: "KRK001", machineName: "KRK001", machineAddress: "ul. Floriańska 20", machinePostCode: "31-021", machineCity: "Kraków" },
    { machineId: "KRK002", machineName: "KRK002", machineAddress: "ul. Grodzka 15", machinePostCode: "31-006", machineCity: "Kraków" },
    { machineId: "KRK003", machineName: "KRK003", machineAddress: "ul. Szewska 10", machinePostCode: "31-009", machineCity: "Kraków" },
    { machineId: "KRK004", machineName: "KRK004", machineAddress: "ul. Starowiślna 30", machinePostCode: "31-032", machineCity: "Kraków" },
    { machineId: "GDN001", machineName: "GDN001", machineAddress: "ul. Długa 10", machinePostCode: "80-827", machineCity: "Gdańsk" },
    { machineId: "GDN002", machineName: "GDN002", machineAddress: "ul. Piwna 5", machinePostCode: "80-831", machineCity: "Gdańsk" },
    { machineId: "GDN003", machineName: "GDN003", machineAddress: "ul. Mariacka 47", machinePostCode: "80-833", machineCity: "Gdańsk" },
    { machineId: "WRO001", machineName: "WRO001", machineAddress: "ul. Świdnicka 5", machinePostCode: "50-068", machineCity: "Wrocław" },
    { machineId: "WRO002", machineName: "WRO002", machineAddress: "ul. Rynek 10", machinePostCode: "50-101", machineCity: "Wrocław" },
    { machineId: "WRO003", machineName: "WRO003", machineAddress: "ul. Kazimierza Wielkiego 15", machinePostCode: "50-077", machineCity: "Wrocław" },
    { machineId: "POZ001", machineName: "POZ001", machineAddress: "ul. Święty Marcin 1", machinePostCode: "61-803", machineCity: "Poznań" },
    { machineId: "POZ002", machineName: "POZ002", machineAddress: "ul. Paderewskiego 8", machinePostCode: "61-770", machineCity: "Poznań" },
    { machineId: "POZ003", machineName: "POZ003", machineAddress: "ul. Półwiejska 42", machinePostCode: "61-888", machineCity: "Poznań" },
    { machineId: "LDZ001", machineName: "LDZ001", machineAddress: "ul. Piotrkowska 15", machinePostCode: "90-102", machineCity: "Łódź" },
    { machineId: "LDZ002", machineName: "LDZ002", machineAddress: "ul. Narutowicza 20", machinePostCode: "90-135", machineCity: "Łódź" },
    { machineId: "LDZ003", machineName: "LDZ003", machineAddress: "ul. Żeromskiego 116", machinePostCode: "90-549", machineCity: "Łódź" }
  ];
  
  const lowerQuery = query.toLowerCase();
  const filtered = mockData.filter(item => 
    item.machineCity.toLowerCase().includes(lowerQuery) ||
    item.machineAddress.toLowerCase().includes(lowerQuery) ||
    item.machinePostCode.includes(lowerQuery) ||
    item.machineName.toLowerCase().includes(lowerQuery)
  );
  
  console.log(`Search for "${query}" returned ${filtered.length} results`);
  return filtered;
}

function getMockNearbyParcelMachines(): InpostParcelData[] {
  const nearby = [
    { machineId: "NEAR001", machineName: "NEAR001", machineAddress: "ul. Pobliska 1", machinePostCode: "00-001", machineCity: "Warszawa" },
    { machineId: "NEAR002", machineName: "NEAR002", machineAddress: "ul. Bliska 5", machinePostCode: "00-005", machineCity: "Warszawa" },
    { machineId: "NEAR003", machineName: "NEAR003", machineAddress: "ul. Sąsiedzka 10", machinePostCode: "00-010", machineCity: "Warszawa" },
    { machineId: "NEAR004", machineName: "NEAR004", machineAddress: "ul. Obok 25", machinePostCode: "00-025", machineCity: "Warszawa" }
  ];
  
  console.log(`Nearby search returned ${nearby.length} results`);
  return nearby;
}