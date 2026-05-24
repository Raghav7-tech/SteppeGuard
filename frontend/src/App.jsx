import { useState, useEffect } from 'react';
import MapContainerComponent from './components/Map/MapContainer';
import Dashboard from './components/Dashboard/Dashboard';
import RiskMindmap from './components/Mindmap/RiskMindmap';
import FloatingChat from './components/Chat/FloatingChat';
import { Rnd } from 'react-rnd';

function App() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [fires, setFires] = useState([]);
  const [showMindmap, setShowMindmap] = useState(true);
  const [windGrid, setWindGrid] = useState([]);
  const [showWind, setShowWind] = useState(true);

  useEffect(() => {
    if (selectedDistrictId) {
      setShowMindmap(true);
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    // Fetch mock data
    fetch(`https://steppeguard.onrender.com/api/observations?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setDistricts(data.observations);
      })
      .catch(err => console.error("Error fetching data", err));
      
      
    fetch(`https://steppeguard.onrender.com/api/fires?confidence=nominal&timeframe_hours=24&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log("Raw Fire API Response:", data);
        setFires(data.fires || []);
      })
      .catch(err => console.error("Error fetching fires", err));

    fetch('https://steppeguard.onrender.com/api/wind_grid')
      .then(res => res.json())
      .then(data => setWindGrid(data.grid || []))
      .catch(err => console.error("Error fetching wind grid", err));
  }, []);

  const selectedDistrict = districts.find(d => d.district_id === selectedDistrictId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-50 font-sans relative">
      <div className="flex-1 h-full relative z-0">
         <MapContainerComponent 
           districts={districts} 
           fires={fires}
           windGrid={windGrid}
           showWind={showWind}
           onSelectDistrict={setSelectedDistrictId}
           selectedDistrictId={selectedDistrictId}
         />
         <div className="absolute top-4 left-16 z-[1000]">
           <button 
             onClick={() => setShowWind(!showWind)}
             className={`px-4 py-2 rounded font-bold shadow-lg transition-colors border ${
               showWind 
                 ? 'bg-blue-600 border-blue-500 text-white' 
                 : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
             }`}
           >
             Wind View: {showWind ? 'ON' : 'OFF'}
           </button>
         </div>
      </div>
      <div className="w-1/3 min-w-[400px] h-full flex flex-col border-l border-slate-800 z-10 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
         <div className="p-4">
            <Dashboard districts={districts} selectedDistrict={selectedDistrict} onClose={() => setSelectedDistrictId(null)} />
         </div>
      </div>
      {selectedDistrict && showMindmap && (
        <Rnd
          default={{
            x: 20,
            y: 20,
            width: 500,
            height: 400,
          }}
          minWidth={300}
          minHeight={200}
          bounds="window"
          className="z-50 rounded-xl shadow-2xl border border-slate-700 bg-slate-900"
          dragHandleClassName="drag-handle"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div className="drag-handle bg-slate-800 px-4 py-2 cursor-move flex items-center justify-between border-b border-slate-700">
            <h3 className="font-bold text-sm text-slate-200">Risk Mindmap</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowMindmap(false)} 
                className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 text-slate-900 transition-colors"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <RiskMindmap district={selectedDistrict} />
          </div>
        </Rnd>
      )}
      <FloatingChat />
    </div>
  );
}

export default App;
