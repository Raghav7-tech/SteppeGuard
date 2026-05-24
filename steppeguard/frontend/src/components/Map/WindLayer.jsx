import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function WindLayer({ windGrid }) {
  const map = useMap();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!windGrid || windGrid.length === 0) return;

    // Create canvas
    const canvas = L.DomUtil.create('canvas', 'leaflet-wind-layer');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 400; // Above tile layers, below markers
    canvas.style.opacity = '0.4'; // Subtle visibility

    // Add to overlay pane
    map.getPanes().overlayPane.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');

    // Setup particles
    const numParticles = 800;
    
    // Helper to find nearest wind grid point
    const getWindAt = (lat, lng) => {
      let nearest = null;
      let minDist = Infinity;
      for (const pt of windGrid) {
        const dist = Math.pow(pt.lat - lat, 2) + Math.pow(pt.lng - lng, 2);
        if (dist < minDist) {
          minDist = dist;
          nearest = pt;
        }
      }
      return nearest;
    };

    const initParticle = () => {
      const bounds = map.getBounds();
      // Increase spawn area slightly beyond view to prevent popping in
      const s = bounds.getSouth() - 2;
      const n = bounds.getNorth() + 2;
      const w = bounds.getWest() - 2;
      const e = bounds.getEast() + 2;
      
      const lat = s + Math.random() * (n - s);
      const lng = w + Math.random() * (e - w);
      
      const wind = getWindAt(lat, lng);
      // Wind dir is in meteorological degrees (0 is from North).
      const angle = (wind ? wind.wind_dir : 0) * (Math.PI / 180);
      const speed = wind ? wind.wind_speed : 0;
      
      return {
        lat,
        lng,
        age: 0,
        maxAge: Math.random() * 40 + 20,
        speed: speed,
        angle: angle
      };
    };

    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push(initParticle());
    }

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
    };

    resizeCanvas();
    map.on('move', resizeCanvas);
    map.on('resize', resizeCanvas);
    map.on('zoom', resizeCanvas);

    let lastTime = performance.now();

    const animate = (time) => {
      const dt = time - lastTime;
      if (dt > 50) { // ~50ms update loop
        lastTime = time;
        
        // Clear with fade to create trails
        ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'; // Subtle fade
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        // Semi-translucent white particles for subtlety as requested
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;

        const bounds = map.getBounds();

        for (let i = 0; i < particlesRef.current.length; i++) {
          let p = particlesRef.current[i];
          
          if (p.age > p.maxAge || !bounds.contains([p.lat, p.lng])) {
            particlesRef.current[i] = initParticle();
            p = particlesRef.current[i];
          }

          const startPos = map.latLngToContainerPoint([p.lat, p.lng]);
          
          // Move particle
          // speed is roughly m/s. We map it to degrees.
          // Direction: angle. Wind direction is FROM. So TO is angle + 180.
          const toAngle = p.angle + Math.PI;
          // Faster in areas where wind speed is stronger
          const latSpeed = Math.cos(toAngle) * (p.speed * 0.008);
          const lngSpeed = Math.sin(toAngle) * (p.speed * 0.008);
          
          p.lat += latSpeed;
          p.lng += lngSpeed;
          p.age++;

          const endPos = map.latLngToContainerPoint([p.lat, p.lng]);

          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
        }
        ctx.stroke();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      map.off('move', resizeCanvas);
      map.off('resize', resizeCanvas);
      map.off('zoom', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, windGrid]);

  return null;
}
