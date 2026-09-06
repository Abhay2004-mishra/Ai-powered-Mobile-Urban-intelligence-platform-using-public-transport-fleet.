import React, { useEffect, useState, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import { 
  Filter, 
  Layers, 
  AlertCircle, 
  ShieldAlert, 
  Bus as BusIcon, 
  RefreshCw, 
  Maximize2, 
  Navigation, 
  MapPin, 
  Eye, 
  CheckCircle2, 
  Compass,
  Sparkles,
  Search
} from 'lucide-react';

// Free, High-Resolution Basemap Tile Providers (NO API KEY REQUIRED & NO WATERMARKS)
const BASEMAP_TILES = {
  streets: {
    name: 'Clear Streets (OSM)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    description: 'Crisp, high-contrast roads, street names, intersections, and landmarks.'
  },
  esriStreet: {
    name: 'ArcGIS World Navigation',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ',
    maxZoom: 19,
    description: 'Detailed municipal transit topography & urban street grid.'
  },
  satellite: {
    name: 'Satellite Aerial Hybrid',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 18,
    description: 'Real-world satellite photography of asphalt roads & physical environment.'
  },
  darkCanvas: {
    name: 'Tactical Dark (No Watermark)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
    description: 'High-contrast dark command center map with zero watermark.'
  }
};

// Preset Regional Transit Corridors
const REGION_PRESETS = [
  { name: 'Amritsar Transit Corridor (Default)', lat: 31.6340, lng: 74.8723, zoom: 11 },
  { name: 'Delhi NCR Municipal Belt', lat: 28.6139, lng: 77.2090, zoom: 11 },
  { name: 'Mumbai Transit Network', lat: 19.0760, lng: 72.8777, zoom: 11 },
  { name: 'Bengaluru Smart Corridor', lat: 12.9716, lng: 77.5946, zoom: 11 }
];

// Helper: Custom High-Visibility Hazard Markers
const createHazardIcon = (type, severity) => {
  let emoji = '⚠️';
  let bgColor = '#F59E0B'; // amber
  let glowColor = 'rgba(245, 158, 11, 0.7)';

  if (type === 'pothole') {
    emoji = '🕳️';
    bgColor = severity === 'critical' ? '#EF4444' : '#F97316';
    glowColor = severity === 'critical' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(249, 115, 22, 0.7)';
  } else if (type === 'accident') {
    emoji = '🚨';
    bgColor = '#DC2626';
    glowColor = 'rgba(220, 38, 38, 0.9)';
  } else if (type === 'obstacle' || type === 'traffic_congestion') {
    emoji = '🚧';
    bgColor = '#EAB308';
    glowColor = 'rgba(234, 179, 8, 0.8)';
  } else if (type === 'road_damage' || type === 'road_crack') {
    emoji = '⚡';
    bgColor = '#8B5CF6';
    glowColor = 'rgba(139, 92, 246, 0.8)';
  }

  const isCritical = severity === 'critical';

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
        ${isCritical ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${glowColor}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background-color: ${bgColor}; 
          border: 2px solid #FFFFFF; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 12px ${glowColor}; 
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

// Helper: Custom High-Visibility Bus Fleet Markers
const createBusFleetIcon = (busCode, speed) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          background-color: #0284C7; 
          color: white; 
          padding: 2px 6px; 
          border-radius: 6px; 
          border: 1.5px solid #FFFFFF; 
          display: flex; 
          align-items: center; 
          gap: 3px; 
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.8);
          font-family: sans-serif;
        ">
          <span style="font-size: 12px;">🚌</span>
          <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">${busCode}</span>
        </div>
        <div style="
          background-color: #0F172A; 
          color: #38BDF8; 
          font-size: 8px; 
          font-weight: 700; 
          padding: 1px 4px; 
          border-radius: 4px; 
          margin-top: 1px; 
          border: 1px solid #1E293B;
          font-family: monospace;
        ">
          ${speed || 35} km/h
        </div>
      </div>
    `,
    iconSize: [68, 36],
    iconAnchor: [34, 18],
    popupAnchor: [0, -20]
  });
};

// Map Controller for Auto-Fit & Dynamic Panning
const MapViewportController = ({ fitTrigger, buses, incidents, targetCenter }) => {
  const map = useMap();

  // Handle targetCenter changes (e.g., jump to current location or city preset)
  useEffect(() => {
    if (targetCenter) {
      map.flyTo([targetCenter.lat, targetCenter.lng], targetCenter.zoom || 13, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, map]);

  // Handle "Fit All" trigger
  useEffect(() => {
    if (!fitTrigger) return;

    const points = [];
    buses.forEach((b) => {
      if (b.latitude && b.longitude) points.push([b.latitude, b.longitude]);
    });
    incidents.forEach((inc) => {
      if (inc.latitude && inc.longitude) points.push([inc.latitude, inc.longitude]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [fitTrigger, buses, incidents, map]);

  return null;
};

const MapContainer = () => {
  const [incidents, setIncidents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basemapStyle, setBasemapStyle] = useState('streets'); // 'streets', 'esriStreet', 'satellite', 'darkCanvas'
  const [fitTrigger, setFitTrigger] = useState(0);
  const [targetCenter, setTargetCenter] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const { activeFilter, setActiveFilter, severityFilter, setSeverityFilter, setSelectedIncident } = useDemo();

  const fetchMapData = async () => {
    try {
      const [incRes, busRes] = await Promise.all([
        api.get('/api/incidents'),
        api.get('/api/buses')
      ]);
      setIncidents(incRes.data);
      setBuses(busRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filter Incidents Cleanly
  const filteredIncidents = incidents.filter((inc) => {
    const type = (inc.issue_type || '').toLowerCase();
    const severity = (inc.severity || '').toLowerCase();
    const status = inc.status || '';

    // Category filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Potholes' && type !== 'pothole') return false;
      if (activeFilter === 'Accidents' && type !== 'accident') return false;
      if (activeFilter === 'Road Damage' && !['road_damage', 'road_crack'].includes(type)) return false;
      if (activeFilter === 'Obstacles' && !['obstacle', 'traffic_congestion'].includes(type)) return false;
      if (activeFilter === 'Critical' && severity !== 'critical') return false;
      if (activeFilter === 'Resolved' && status !== 'RESOLVED') return false;
    }

    // Severity level filter
    if (severityFilter !== 'All' && severity !== severityFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Fit All Fleet & Hazards
  const handleFitAll = () => {
    setFitTrigger((prev) => prev + 1);
  };

  // Browser Real-Time Geolocation (Jump to User's Current City)
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by browser');
      return;
    }
    setLocationStatus('Locating your GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setTargetCenter({ lat: latitude, lng: longitude, zoom: 14 });
        setLocationStatus(`Locked: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        setTimeout(() => setLocationStatus(''), 3000);
      },
      (err) => {
        console.warn(err);
        setLocationStatus('Permission denied or GPS unavailable');
        setTimeout(() => setLocationStatus(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Initial center coordinates (Amritsar Transit Corridor default)
  const centerLat = 31.6340;
  const centerLng = 74.8723;
  const activeBasemap = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.streets;

  const potholeCount = incidents.filter(i => i.issue_type === 'pothole').length;
  const accidentCount = incidents.filter(i => i.issue_type === 'accident').length;
  const obstacleCount = incidents.filter(i => ['obstacle', 'traffic_congestion'].includes(i.issue_type)).length;

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl bg-[#070b14]">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800 text-xs shadow-2xl pointer-events-auto">
          <span className="flex items-center text-gray-400 font-bold px-2 text-[11px]">
            <Filter className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Filter:
          </span>
          {[
            { id: 'All', label: 'All Hazards' },
            { id: 'Potholes', label: `🕳️ Potholes (${potholeCount})` },
            { id: 'Accidents', label: `🚨 Accidents (${accidentCount})` },
            { id: 'Obstacles', label: `🚧 Obstacles (${obstacleCount})` },
            { id: 'Road Damage', label: '⚡ Cracks' },
            { id: 'Critical', label: 'Critical' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-2.5 py-1.5 rounded-xl transition text-[11px] font-bold ${
                activeFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-gray-200 text-xs font-semibold rounded-xl px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Severity</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={fetchMapData}
            title="Refresh Live Telemetry"
            className="p-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Map Basemap Switcher & View Everywhere Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800 text-xs shadow-2xl pointer-events-auto">
          {/* Fit All Fleet & Hazards Button */}
          <button
            onClick={handleFitAll}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[11px] transition shadow-md flex items-center space-x-1.5"
            title="Automatically zoom to fit all buses and road hazards in view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit All ({buses.length} Buses, {filteredIncidents.length} Hazards)</span>
          </button>

          {/* Current Location GPS Jump */}
          <button
            onClick={handleDetectCurrentLocation}
            className="px-2.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition flex items-center space-x-1"
            title="Locate my real-time GPS position"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>My Location</span>
          </button>

          {/* Basemap Style Selector */}
          <div className="flex items-center space-x-1 pl-1 border-l border-gray-800">
            <span className="text-[10px] text-gray-500 font-bold uppercase hidden sm:inline px-1">Map:</span>
            {[
              { id: 'streets', label: 'Streets (Clear)' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'darkCanvas', label: 'Dark' },
              { id: 'esriStreet', label: 'Topo' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setBasemapStyle(st.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  basemapStyle === st.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Status Notification for GPS */}
      {locationStatus && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-gray-900/95 border border-cyan-500 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Bottom Floating Stats Bar */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-gray-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-800 text-xs flex items-center space-x-4 shadow-2xl pointer-events-auto">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-gray-500 block text-[9px] uppercase font-mono">LIVE TRANSIT FLEET</span>
            <span className="font-extrabold text-white text-xs">🚌 {buses.length} Buses Sensing</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-gray-800" />

        <div>
          <span className="text-gray-500 block text-[9px] uppercase font-mono">MAP HAZARDS</span>
          <span className="font-extrabold text-amber-400 text-xs">📍 {filteredIncidents.length} Visible</span>
        </div>

        <div className="h-6 w-[1px] bg-gray-800" />

        <div>
          <span className="text-gray-500 block text-[9px] uppercase font-mono">BASEMAP</span>
          <span className="font-bold text-cyan-300 text-[10px]">{activeBasemap.name}</span>
        </div>
      </div>

      {/* Main Leaflet Map Engine */}
      <LeafletMap 
        center={[centerLat, centerLng]} 
        zoom={11} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        {/* Dynamic Viewport Controller */}
        <MapViewportController
          fitTrigger={fitTrigger}
          buses={buses}
          incidents={filteredIncidents}
          targetCenter={targetCenter}
        />

        {/* Crisp, Free Basemap Tile Layer with ZERO Watermarks */}
        <TileLayer
          key={basemapStyle}
          attribution={activeBasemap.attribution}
          url={activeBasemap.url}
          maxZoom={activeBasemap.maxZoom}
        />

        {/* Bus Fleet Markers */}
        {buses.map((bus) => (
          <Marker 
            key={bus.bus_code} 
            position={[bus.latitude, bus.longitude]} 
            icon={createBusFleetIcon(bus.bus_code, bus.speed_kmh)}
          >
            <Popup>
              <div className="p-2 text-gray-900 font-sans text-xs w-60">
                <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                  <div className="font-black text-blue-600 text-sm flex items-center">
                    <span className="mr-1">🚌</span> {bus.bus_code}
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {bus.status}
                  </span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div>Route: <strong className="text-gray-900">{bus.route_id}</strong></div>
                  <div>Driver: <strong className="text-gray-900">{bus.driver_name || 'Gurpreet Singh'}</strong></div>
                  <div>Current Speed: <strong className="text-blue-700 font-mono">{bus.speed_kmh} km/h</strong></div>
                  <div>GPS: <span className="font-mono text-[10px] text-gray-600">{bus.latitude?.toFixed(4)}, {bus.longitude?.toFixed(4)}</span></div>
                  <div className="text-[10px] text-emerald-700 font-bold pt-1 border-t flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    NVIDIA Jetson Edge Inference Active
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Road Hazard Incidents (Potholes, Accidents, Obstacles, Cracks) */}
        {filteredIncidents.map((inc) => {
          const type = (inc.issue_type || '').toLowerCase();
          const severity = (inc.severity || '').toLowerCase();
          const isPothole = type === 'pothole';
          const isAccident = type === 'accident';

          const radius = isAccident ? 180 : (isPothole ? 120 : 90);
          const circleColor = isAccident ? '#DC2626' : (isPothole ? '#F97316' : '#8B5CF6');

          return (
            <React.Fragment key={inc.incident_code || inc.id}>
              {/* Radius Circle representing hazard impact zone */}
              <Circle
                center={[inc.latitude, inc.longitude]}
                radius={radius}
                pathOptions={{ 
                  color: circleColor, 
                  fillColor: circleColor, 
                  fillOpacity: 0.25,
                  weight: 2
                }}
              />

              {/* High-visibility Marker Pin */}
              <Marker 
                position={[inc.latitude, inc.longitude]} 
                icon={createHazardIcon(type, severity)}
              >
                <Popup>
                  <div className="p-2 text-gray-900 text-xs w-64">
                    <div className="flex justify-between items-center mb-1.5 border-b pb-1">
                      <span className="font-black text-red-600 text-sm">{inc.incident_code}</span>
                      <span className={`uppercase text-[9px] font-bold px-2 py-0.5 rounded ${
                        severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {severity}
                      </span>
                    </div>

                    <div className="font-bold text-gray-900 text-xs capitalize flex items-center">
                      <span className="mr-1">{isPothole ? '🕳️' : (isAccident ? '🚨' : '🚧')}</span>
                      {type.replace('_', ' ')}
                    </div>

                    <div className="text-[11px] text-gray-600 mt-1">{inc.location_name}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      GPS: {inc.latitude?.toFixed(4)}, {inc.longitude?.toFixed(4)}
                    </div>

                    {inc.multi_bus_verified && (
                      <div className="mt-1.5 text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
                        MULTI-BUS VERIFIED ({inc.confirmations_count} buses)
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-gray-600 flex justify-between">
                      <span>AI Model Confidence:</span>
                      <strong className="text-gray-900">{Math.round((inc.confidence || 0.9) * 100)}%</strong>
                    </div>

                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow transition"
                    >
                      Inspect Hazard Details & Dispatch
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;
