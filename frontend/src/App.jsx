import { useState, useEffect } from 'react';
import MapContainerComponent from './components/Map/MapContainer';
import Dashboard from './components/Dashboard/Dashboard';
import RiskMindmap from './components/Mindmap/RiskMindmap';
import FloatingChat from './components/Chat/FloatingChat';
import { Rnd } from 'react-rnd';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [isDashboardMinimized, setIsDashboardMinimized] = useState(false);
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
    fetch(`${API_URL}/api/observations?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setDistricts(data.observations);
      })
      .catch(err => console.error("Error fetching data", err));
      
      
    fetch(`${API_URL}/api/fires?confidence=nominal&timeframe_hours=168&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        console.log("Raw Fire API Response:", data);
        setFires(data.fires || []);
      })
      .catch(err => console.error("Error fetching fires", err));

    fetch(`${API_URL}/api/wind_grid`)
      .then(res => res.json())
      .then(data => setWindGrid(data.grid || []))
      .catch(err => console.error("Error fetching wind grid", err));
  }, []);

  const selectedDistrict = districts.find(d => d.district_id === selectedDistrictId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-50 font-sans relative">
      <div className="absolute inset-0 z-0">
         <MapContainerComponent 
           districts={districts} 
           fires={fires}
           windGrid={windGrid}
           showWind={showWind}
           onSelectDistrict={setSelectedDistrictId}
           selectedDistrictId={selectedDistrictId}
         />
         <div className="absolute top-6 left-6 z-[1000] glass-panel px-1.5 py-1.5 rounded-2xl flex items-center shadow-2xl border border-white/5">
           <button 
             onClick={() => setShowWind(!showWind)}
             className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs tracking-widest uppercase flex items-center gap-2 ${
               showWind 
                 ? 'bg-blue-600/90 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] border border-blue-500/50' 
                 : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
             }`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 0 2-4H2"/><path d="M9.8 8.6A2 2 0 1 1 11 12H2"/></svg>
             Wind Layer
           </button>
         </div>
      </div>

      {/* Floating Tactical Sidebar */}
      <div className={`absolute top-4 bottom-4 right-4 z-10 flex flex-col glass-panel rounded-3xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDashboardMinimized ? 'w-0 opacity-0 pointer-events-none translate-x-12' : 'w-[480px] opacity-100 shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 translate-x-0'}`}>
         <div className="p-6 w-full h-full overflow-y-auto custom-scrollbar">
            <Dashboard districts={districts} selectedDistrict={selectedDistrict} onClose={() => setSelectedDistrictId(null)} />
         </div>
      </div>
      
      {/* Sidebar Toggle */}
      <button 
         onClick={() => setIsDashboardMinimized(!isDashboardMinimized)}
         className={`absolute top-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform -translate-y-1/2 bg-zinc-900/90 p-3 rounded-full border border-white/10 text-white z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:scale-110 hover:bg-zinc-800 backdrop-blur-md ${isDashboardMinimized ? 'right-6' : 'right-[466px]'}`}
       >
         {isDashboardMinimized ? <ChevronLeft size={20} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" /> : <ChevronRight size={20} className="text-zinc-400" />}
       </button>
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
          className="z-50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 glass-panel overflow-hidden"
          dragHandleClassName="drag-handle"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div className="drag-handle bg-zinc-900/50 px-5 py-3 cursor-move flex items-center justify-between border-b border-white/10 backdrop-blur-md">
            <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-300">Tactical Mindmap</h3>
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
