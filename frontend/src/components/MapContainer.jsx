import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import { Filter, Layers, AlertCircle, ShieldAlert, Bus as BusIcon, RefreshCw } from 'lucide-react';

// Custom Leaflet icons generator
const createCustomIcon = (color, shape = 'circle') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="#000000" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const createBusIcon = () => {
  return L.divIcon({
    className: 'bus-leaflet-marker',
    html: `<div style="background-color: #3B82F6; width: 22px; height: 22px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(59,130,246,0.8);"><span style="color: white; font-size: 10px; font-weight: bold;">🚌</span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const MapContainer = () => {
  const [incidents, setIncidents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilter !== 'All' && inc.issue_type.toLowerCase() !== activeFilter.toLowerCase().replace(' ', '_')) {
      if (activeFilter === 'Critical' && inc.severity !== 'critical') return false;
      if (activeFilter === 'Resolved' && inc.status !== 'RESOLVED') return false;
      if (activeFilter === 'Potholes' && inc.issue_type !== 'pothole') return false;
      if (activeFilter === 'Accidents' && inc.issue_type !== 'accident') return false;
      if (activeFilter === 'Road Damage' && inc.issue_type !== 'road_damage') return false;
    }
    if (severityFilter !== 'All' && inc.severity.toLowerCase() !== severityFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const centerLat = buses[0]?.latitude || 31.6340;
  const centerLng = buses[0]?.longitude || 74.8723;

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl glass-panel">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-gray-900/90 backdrop-blur-md p-2 rounded-xl border border-gray-800 text-xs shadow-xl">
        <span className="flex items-center text-gray-400 font-semibold px-2">
          <Filter className="w-3.5 h-3.5 mr-1 text-blue-400" /> Filter:
        </span>
        {['All', 'Potholes', 'Accidents', 'Road Damage', 'Critical', 'Resolved'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              activeFilter === cat
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-gray-700 mx-1" />

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value="All">All Severity</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button onClick={fetchMapData} className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Stats Counter Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-gray-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-800 text-xs flex items-center space-x-4 shadow-xl">
        <div>
          <span className="text-gray-400 block text-[10px]">ACTIVE BUSES</span>
          <span className="font-bold text-blue-400 text-sm">🚌 {buses.length}</span>
        </div>
        <div className="h-6 w-[1px] bg-gray-800" />
        <div>
          <span className="text-gray-400 block text-[10px]">MAP INCIDENTS</span>
          <span className="font-bold text-red-400 text-sm">📍 {filteredIncidents.length}</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <LeafletMap center={[centerLat, centerLng]} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Bus Markers */}
        {buses.map((bus) => (
          <Marker key={bus.bus_code} position={[bus.latitude, bus.longitude]} icon={createBusIcon()}>
            <Popup>
              <div className="p-1 text-gray-900 font-sans text-xs">
                <div className="font-bold text-blue-600 text-sm">{bus.bus_code}</div>
                <div className="text-gray-600">Route: {bus.route_id} | Driver: {bus.driver_name}</div>
                <div className="mt-1 font-semibold text-gray-700">Speed: {bus.speed_kmh} km/h</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">AI Device: Jetson Orin ONLINE</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Markers */}
        {filteredIncidents.map((inc) => {
          const color =
            inc.severity === 'critical'
              ? '#EF4444'
              : inc.severity === 'high'
              ? '#F97316'
              : inc.severity === 'medium'
              ? '#EAB308'
              : '#10B981';

          return (
            <React.Fragment key={inc.incident_code}>
              <Circle
                center={[inc.latitude, inc.longitude]}
                radius={inc.severity === 'critical' ? 120 : 80}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.25 }}
              />
              <Marker position={[inc.latitude, inc.longitude]} icon={createCustomIcon(color)}>
                <Popup>
                  <div className="p-1 text-gray-900 text-xs w-52">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-red-600">{inc.incident_code}</span>
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200">{inc.severity}</span>
                    </div>
                    <div className="font-semibold capitalize text-gray-800">{inc.issue_type.replace('_', ' ')}</div>
                    <div className="text-[11px] text-gray-600 mt-0.5">{inc.location_name}</div>

                    {inc.multi_bus_verified && (
                      <div className="mt-1 text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded flex items-center">
                        ✓ MULTI-BUS VERIFIED ({inc.confirmations_count} buses)
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-gray-500">Confidence: {int(inc.confidence*100)}%</div>
                    
                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="mt-2 w-full py-1 bg-blue-600 text-white rounded font-bold text-[11px]"
                    >
                      View Incident Details
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

const int = (val) => Math.round(val);

export default MapContainer;
