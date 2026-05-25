import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import WindLayer from './WindLayer';

export default function MapContainerComponent({ districts, fires = [], windGrid = [], showWind = true, onSelectDistrict, selectedDistrictId }) {
  const center = [48.0, 66.9]; // Approx center of Kazakhstan

  const getMarkerColor = (risk) => {
    if (risk === 'CRITICAL') return '#ef4444'; // red-500
    if (risk === 'HIGH') return '#f97316'; // orange-500
    if (risk === 'MEDIUM') return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
        {showWind && <WindLayer windGrid={windGrid} />}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark Map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street View">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EAP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.Overlay checked name="Districts">
            <LayerGroup>
              {districts.map((d) => (
                <CircleMarker
                  key={d.id}
                  center={[d.lat, d.lng]}
                  radius={selectedDistrictId === d.district_id ? 15 : 10}
                  pathOptions={{ 
                     color: getMarkerColor(d.risk_level), 
                     fillColor: getMarkerColor(d.risk_level),
                     fillOpacity: 0.7 
                  }}
                  eventHandlers={{
                    click: () => onSelectDistrict(d.district_id),
                  }}
                >
                  <Popup className="bg-zinc-900 text-zinc-100 p-2 rounded shadow-lg border border-zinc-800">
                    <h3 className="font-bold text-lg">{d.district_name}</h3>
                    <p>Risk: <span style={{ color: getMarkerColor(d.risk_level) }}>{d.risk_level}</span></p>
                    <p>Fusion Score: {d.fusion_score}</p>
                    <p>Active Fires: {d.active_fire_points}</p>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
          
          <LayersControl.Overlay checked name="Live Fires">
            <LayerGroup>
              {fires.map((f) => (
                <CircleMarker
                  key={f.id}
                  center={[f.lat, f.lng]}
                  radius={4}
                  pathOptions={{ 
                     color: '#ff0000', 
                     fillColor: '#ff4400',
                     fillOpacity: 0.9,
                     weight: 2
                  }}
                >
                  <Popup className="bg-zinc-900 text-zinc-100 p-1 text-sm rounded border border-red-500">
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      🔥 Active Fire
                    </span>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-zinc-900/90 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
        <h4 className="text-sm font-semibold mb-2 text-zinc-300 uppercase tracking-wider">Risk Level</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> <span className="text-sm">CRITICAL</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div> <span className="text-sm">HIGH</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div> <span className="text-sm">MEDIUM</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> <span className="text-sm">LOW</span></div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-700">
             <div className="w-6 h-0.5 bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>
             <span className="text-sm text-zinc-300">Predicted Fire Spread Vector</span>
          </div>
        </div>
      </div>
    </div>
  );
}
