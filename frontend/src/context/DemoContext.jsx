import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { wsService } from '../services/websocket';

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
  const [isDemoRunning, setIsDemoRunning] = useState(true);
  const [demoStep, setDemoStep] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [liveDetections, setLiveDetections] = useState([]);
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    wsService.connect();
    const unsubscribe = wsService.subscribe((event) => {
      if (event.event_type === 'SIH_DEMO_STEP') {
        setDemoStep(event);
      } else if (event.event_type === 'NEW_DETECTION' || event.event_type === 'SIH_TRIGGERED_EVENT') {
        if (event.detection) {
          setLiveDetections((prev) => [event.detection, ...prev.slice(0, 19)]);
        }
        if (event.incident) {
          setLiveIncidents((prev) => [event.incident, ...prev.filter((i) => i.incident_code !== event.incident.incident_code)]);
        }
      } else if (event.event_type === 'LIVE_TELEMETRY') {
        if (event.new_detection) {
          setLiveDetections((prev) => [event.new_detection, ...prev.slice(0, 19)]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerSIHDemoFlow = async () => {
    try {
      await api.post('/api/simulation/sih_demo_flow');
    } catch (e) {
      console.error(e);
    }
  };

  const triggerCustomIncident = async (issueType) => {
    try {
      const res = await api.post('/api/simulation/trigger', { issue_type: issueType });
      return res.data;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoRunning,
        setIsDemoRunning,
        demoStep,
        activeFilter,
        setActiveFilter,
        severityFilter,
        setSeverityFilter,
        liveDetections,
        liveIncidents,
        selectedIncident,
        setSelectedIncident,
        selectedBus,
        setSelectedBus,
        triggerSIHDemoFlow,
        triggerCustomIncident
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
