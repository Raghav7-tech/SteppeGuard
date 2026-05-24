import React, { useMemo, useState, useEffect } from 'react';
import { ReactFlow, Controls, Background, MarkerType } from '@xyflow/react';

export default function RiskMindmap({ district }) {
  const isCritical = district.risk_level === 'CRITICAL';
  const [factors, setFactors] = useState([]);

  useEffect(() => {
    if (district) {
      fetch(`https://steppeguard.onrender.com/api/factors/${district.district_id}`)
        .then(res => res.json())
        .then(data => setFactors(data.factors || []))
        .catch(err => console.error(err));
    }
  }, [district]);
  
  const nodes = useMemo(() => {
    const baseNodes = [
      {
        id: 'root',
        type: 'default',
        data: { 
          label: (
            <div className="flex flex-col items-center p-2">
              <span className="font-bold text-lg text-center">{district.district_name}</span>
              <span className={`text-xs px-2 py-1 mt-1 rounded ${isCritical ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white'}`}>
                {district.risk_level}
              </span>
            </div>
          )
        },
        position: { x: 350, y: 50 },
        style: { 
          background: '#0f172a', 
          color: '#f8fafc', 
          border: `2px solid ${isCritical ? '#ef4444' : '#f97316'}`,
          borderRadius: '12px',
          width: 150
        }
      },
      {
        id: 'wind',
        data: { label: 'Wind Conditions' },
        position: { x: 50, y: 150 },
        style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' }
      },
      {
        id: 'sar',
        data: { label: 'SAR Signal' },
        position: { x: 250, y: 150 },
        style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' }
      },
      {
        id: 'veg',
        data: { label: 'Vegetation State' },
        position: { x: 450, y: 150 },
        style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' }
      },
      {
        id: 'reasons',
        data: { label: 'Eruption Reasons' },
        position: { x: 650, y: 150 },
        style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' }
      },
      // Leaf nodes
      {
        id: 'wind_speed',
        data: { label: 'Speed: 12.5 m/s' },
        position: { x: 0, y: 250 },
        style: { background: '#020617', color: '#f8fafc', border: '1px solid #ef4444', borderRadius: '16px', fontSize: '10px' }
      },
      {
        id: 'sar_change',
        data: { label: `SAR Change: ${district.sar_change_mean}` },
        position: { x: 200, y: 250 },
        style: { background: '#020617', color: '#f8fafc', border: '1px solid #f97316', borderRadius: '16px', fontSize: '10px' }
      },
      {
        id: 'ndvi',
        data: { label: `NDVI: ${district.ndvi_mean}` },
        position: { x: 400, y: 250 },
        style: { background: '#020617', color: '#f8fafc', border: '1px solid #ef4444', borderRadius: '16px', fontSize: '10px' }
      }
    ];

    factors.forEach((f, idx) => {
      baseNodes.push({
        id: `factor_${idx}`,
        data: { label: `${f.name} (${Math.round(f.probability * 100)}%)` },
        position: { x: 550 + (idx * 140), y: 250 },
        style: { 
          background: '#020617', 
          color: '#f8fafc', 
          border: `1px solid ${f.severity === 'CRITICAL' ? '#ef4444' : f.severity === 'HIGH' ? '#f97316' : '#eab308'}`, 
          borderRadius: '16px', 
          fontSize: '10px', 
          width: 120 
        }
      });
    });

    return baseNodes;
  }, [district, isCritical, factors]);

  const edges = useMemo(() => {
    const baseEdges = [
      { id: 'e1', source: 'wind', target: 'root', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: 'e2', source: 'sar', target: 'root', animated: isCritical, style: { stroke: isCritical ? '#ef4444' : '#f97316', strokeWidth: 2 } },
      { id: 'e3', source: 'veg', target: 'root', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: 'e_reasons', source: 'reasons', target: 'root', animated: true, style: { stroke: '#eab308', strokeWidth: 2 } },
      { id: 'e4', source: 'wind_speed', target: 'wind', markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }, style: { stroke: '#64748b' } },
      { id: 'e5', source: 'sar_change', target: 'sar', markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }, style: { stroke: '#64748b' } },
      { id: 'e6', source: 'ndvi', target: 'veg', markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }, style: { stroke: '#64748b' } }
    ];

    factors.forEach((f, idx) => {
      baseEdges.push({
        id: `ef_${idx}`,
        source: `factor_${idx}`,
        target: 'reasons',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
        style: { stroke: '#64748b' }
      });
    });

    return baseEdges;
  }, [isCritical, factors]);

  return (
    <div className="h-full w-full relative bg-slate-950">
      <div className="absolute top-2 left-4 z-10 text-slate-300 font-bold text-sm tracking-widest uppercase">
        Causal Risk Chain
      </div>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={16} size={1} />
        <Controls showInteractive={false} className="bg-slate-900 border-slate-800 fill-slate-300" />
      </ReactFlow>
    </div>
  );
}

