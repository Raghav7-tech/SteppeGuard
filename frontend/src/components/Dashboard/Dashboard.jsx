import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Wind, Droplets, ThermometerSun, Flame, Truck, Phone, AlertCircle, X } from 'lucide-react';

export default function Dashboard({ districts, selectedDistrict, onClose }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const topRisks = [...districts].sort((a, b) => b.fusion_score - a.fusion_score).slice(0, 5);
  const [officials, setOfficials] = useState([]);
  const [weather, setWeather] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [factors, setFactors] = useState([]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`${API_URL}/api/officials/${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => setOfficials(data.officials || []))
        .catch(err => console.error(err));
        
      fetch(`${API_URL}/api/weather/${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => setWeather(data))
        .catch(err => console.error(err));
        
      fetch(`${API_URL}/api/predictions?district_id=${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.predictions && data.predictions.length > 0) {
                setPredictions(data.predictions[0]);
            }
        })
        .catch(err => console.error(err));
        
      fetch(`${API_URL}/api/factors/${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => setFactors(data.factors || []))
        .catch(err => console.error(err));
    } else {
      setOfficials([]);
      setWeather(null);
      setPredictions(null);
      setFactors([]);
    }
  }, [selectedDistrict]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Command Center</h2>
        <div className="bg-zinc-900/80 text-amber-500 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/30 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Live Uplink
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-red-500/40 hover:bg-zinc-900/80 transition-all duration-300">
           <div className="absolute -top-2 -right-2 p-3 text-red-500/10 group-hover:text-red-500/20 transition-colors transform group-hover:scale-110 duration-500"><Flame size={80} /></div>
           <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Active Fires</p>
           <p className="text-4xl font-black text-white drop-shadow-md relative z-10">{districts.reduce((sum, d) => sum + d.active_fire_points, 0)}</p>
        </div>
        <div className="bg-zinc-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-300">
           <div className="absolute -top-2 -right-2 p-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors transform group-hover:scale-110 duration-500"><AlertTriangle size={80} /></div>
           <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">At Risk Sectors</p>
           <p className="text-4xl font-black text-white drop-shadow-md relative z-10">{districts.filter(d => d.risk_level === 'CRITICAL' || d.risk_level === 'HIGH').length}</p>
        </div>
      </div>

      {selectedDistrict ? (
        <div className="bg-zinc-900/70 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden transform transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">{selectedDistrict.district_name}</h3>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Sector Analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-md font-black text-xs uppercase tracking-widest border ${
                  selectedDistrict.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                  selectedDistrict.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                }`}>
                {selectedDistrict.risk_level}
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-md transition-colors border border-white/5"
                title="Close Info"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center p-4 bg-zinc-900/60 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-zinc-800/60 transition-all duration-300">
               <Wind className="text-blue-400 mb-2" size={24} />
               <span className="text-lg font-black text-white">{weather ? `${weather.wind_speed_ms} m/s` : '-- m/s'}</span>
               <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Wind</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-zinc-900/60 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-zinc-800/60 transition-all duration-300">
               <ThermometerSun className="text-amber-400 mb-2" size={24} />
               <span className="text-lg font-black text-white">{weather ? `${weather.temperature_c}°C` : '--°C'}</span>
               <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Temp</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-zinc-900/60 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:bg-zinc-800/60 transition-all duration-300">
               <Droplets className="text-cyan-400 mb-2" size={24} />
               <span className="text-lg font-black text-white">{weather ? `${weather.humidity_pct}%` : '--%'}</span>
               <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Humidity</span>
            </div>
          </div>

          <div className="h-48 mt-4">
            <h4 className="text-sm font-semibold text-zinc-400 mb-2">48h Spread Probability</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictions?.timeline || [
                  { time: 'Now', prob: 20 }, { time: '+12h', prob: 45 }, { time: '+24h', prob: 75 }, { time: '+48h', prob: 88 }
              ]}>
                <defs>
                  <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="prob" stroke="#ef4444" fillOpacity={1} fill="url(#colorProb)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
              <Truck size={16} /> Nearest Control Officials
            </h4>
            <div className="space-y-3">
              {officials.length > 0 ? officials.map(off => (
                <div key={off.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-zinc-200 text-sm">{off.name}</h5>
                    <p className="text-xs text-zinc-500">{off.type} • {off.distance_km} km away</p>
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1"><Phone size={12} /> {off.contact}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-orange-400">{off.response_time_mins}m ETA</div>
                    <div className="text-xs text-zinc-500 mt-1">{off.personnel_available} personnel</div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-zinc-500 italic">No official data available.</div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Possible Fire Eruption Reasons
            </h4>
            <div className="space-y-3">
              {factors.length > 0 ? factors.map((factor, idx) => (
                <div key={idx} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <div className="flex-1">
                    <h5 className="font-bold text-zinc-200 text-sm">{factor.name}</h5>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${factor.probability * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${
                      factor.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      factor.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      factor.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {factor.severity}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{Math.round(factor.probability * 100)}% Prob</div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-zinc-500 italic">No eruption factors available.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center h-64">
           <MapPinIcon className="w-12 h-12 text-zinc-600 mb-4" />
           <h3 className="text-lg font-semibold text-zinc-300">Select a District</h3>
           <p className="text-sm text-zinc-500 max-w-xs mt-2">Click on a district marker on the map to view detailed risk analysis and 48-hour spread prediction.</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Threat Matrix</h3>
        <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-zinc-500 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[10px]">Sector</th>
                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[10px] text-right">Score</th>
                <th className="px-4 py-3 font-bold uppercase tracking-widest text-[10px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topRisks.map((d) => (
                <tr key={d.id} className="hover:bg-zinc-800/40 transition-colors group">
                  <td className="px-4 py-3 font-bold text-zinc-300 group-hover:text-white transition-colors">{d.district_name}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-zinc-200">{d.fusion_score.toFixed(1)}</td>
                  <td className="px-4 py-3">
                     <div className={`mx-auto w-max px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        d.risk_level === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                     }`}>
                       {d.risk_level}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MapPinIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
