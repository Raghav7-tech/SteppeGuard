import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Wind, Droplets, ThermometerSun, Flame, Truck, Phone, AlertCircle } from 'lucide-react';

export default function Dashboard({ districts, selectedDistrict }) {
  const topRisks = [...districts].sort((a, b) => b.fusion_score - a.fusion_score).slice(0, 5);
  const [officials, setOfficials] = useState([]);
  const [weather, setWeather] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [factors, setFactors] = useState([]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`http://localhost:8000/api/officials/${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => setOfficials(data.officials || []))
        .catch(err => console.error(err));
        
      fetch(`http://localhost:8000/api/weather/${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => setWeather(data))
        .catch(err => console.error(err));
        
      fetch(`http://localhost:8000/api/predictions?district_id=${selectedDistrict.district_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.predictions && data.predictions.length > 0) {
                setPredictions(data.predictions[0]);
            }
        })
        .catch(err => console.error(err));
        
      fetch(`http://localhost:8000/api/factors/${selectedDistrict.district_id}`)
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">SteppeGuard Dashboard</h2>
        <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <AlertTriangle size={16} /> Live Data Active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 text-slate-700 group-hover:text-red-500/20 transition-colors"><Flame size={48} /></div>
           <p className="text-slate-400 text-sm font-medium mb-1">Active Fires</p>
           <p className="text-3xl font-bold text-slate-100">{districts.reduce((sum, d) => sum + d.active_fire_points, 0)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 text-slate-700 group-hover:text-orange-500/20 transition-colors"><AlertTriangle size={48} /></div>
           <p className="text-slate-400 text-sm font-medium mb-1">Districts at Risk</p>
           <p className="text-3xl font-bold text-slate-100">{districts.filter(d => d.risk_level === 'CRITICAL' || d.risk_level === 'HIGH').length}</p>
        </div>
      </div>

      {selectedDistrict ? (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-100">{selectedDistrict.district_name}</h3>
              <p className="text-slate-400 text-sm">Detailed Analysis</p>
            </div>
            <div className={`px-3 py-1 rounded font-bold text-sm ${
                selectedDistrict.risk_level === 'CRITICAL' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                selectedDistrict.risk_level === 'HIGH' ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                'bg-green-500 text-white'
              }`}>
              {selectedDistrict.risk_level}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
               <Wind className="text-blue-400 mb-2" />
               <span className="text-lg font-bold">{weather ? `${weather.wind_speed_ms} m/s` : '-- m/s'}</span>
               <span className="text-xs text-slate-500 uppercase">Wind</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
               <ThermometerSun className="text-orange-400 mb-2" />
               <span className="text-lg font-bold">{weather ? `${weather.temperature_c}°C` : '--°C'}</span>
               <span className="text-xs text-slate-500 uppercase">Temp</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
               <Droplets className="text-cyan-400 mb-2" />
               <span className="text-lg font-bold">{weather ? `${weather.humidity_pct}%` : '--%'}</span>
               <span className="text-xs text-slate-500 uppercase">Humidity</span>
            </div>
          </div>

          <div className="h-48 mt-4">
            <h4 className="text-sm font-semibold text-slate-400 mb-2">48h Spread Probability</h4>
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
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="prob" stroke="#ef4444" fillOpacity={1} fill="url(#colorProb)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <Truck size={16} /> Nearest Control Officials
            </h4>
            <div className="space-y-3">
              {officials.length > 0 ? officials.map(off => (
                <div key={off.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-200 text-sm">{off.name}</h5>
                    <p className="text-xs text-slate-500">{off.type} • {off.distance_km} km away</p>
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1"><Phone size={12} /> {off.contact}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-orange-400">{off.response_time_mins}m ETA</div>
                    <div className="text-xs text-slate-500 mt-1">{off.personnel_available} personnel</div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500 italic">No official data available.</div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Possible Fire Eruption Reasons
            </h4>
            <div className="space-y-3">
              {factors.length > 0 ? factors.map((factor, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-200 text-sm">{factor.name}</h5>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${factor.probability * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${
                      factor.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      factor.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      factor.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {factor.severity}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{Math.round(factor.probability * 100)}% Prob</div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500 italic">No eruption factors available.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center h-64">
           <MapPinIcon className="w-12 h-12 text-slate-600 mb-4" />
           <h3 className="text-lg font-semibold text-slate-300">Select a District</h3>
           <p className="text-sm text-slate-500 max-w-xs mt-2">Click on a district marker on the map to view detailed risk analysis and 48-hour spread prediction.</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-4">Highest Risk Districts</h3>
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-medium">District</th>
                <th className="p-3 font-medium text-right">Fusion Score</th>
                <th className="p-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {topRisks.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-medium text-slate-200">{d.district_name}</td>
                  <td className="p-3 text-right font-mono">{d.fusion_score.toFixed(1)}</td>
                  <td className="p-3">
                     <div className={`mx-auto w-max px-2 py-0.5 rounded text-xs font-bold ${
                        d.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
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
