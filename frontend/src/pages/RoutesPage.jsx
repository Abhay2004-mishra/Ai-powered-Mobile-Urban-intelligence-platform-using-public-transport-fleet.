import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Route, MapPin, Bus } from 'lucide-react';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    api.get('/api/routes').then(res => setRoutes(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center">
            <Route className="w-5 h-5 text-cyan-400 mr-2" />
            City Transit Network & Road Coverage Matrix
          </h1>
          <p className="text-xs text-gray-400">Routes continuously monitored by public transport buses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((r) => (
          <div key={r.route_code} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-black text-cyan-400 text-base">{r.route_code}</span>
                <h3 className="text-xs font-bold text-gray-200">{r.route_name}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                {r.coverage_percent}% COVERED
              </span>
            </div>

            <div className="text-xs text-gray-400 space-y-1 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
              <div>Start: <strong className="text-gray-200">{r.start_point}</strong></div>
              <div>Destination: <strong className="text-gray-200">{r.end_point}</strong></div>
              <div>Total Distance: <strong className="text-blue-300">{r.distance_km} km</strong></div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
              <span>Assigned Buses: <strong className="text-white">{r.assigned_buses_count} Buses</strong></span>
              <span>Daily Trips: <strong className="text-emerald-400">{r.daily_trips}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesPage;
