import { Risk3D } from "@/data/scenarios3d";
import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface MiniMapProps {
  playerPosition: [number, number, number];
  playerRotation: number;
  risks: Risk3D[];
  scenarioType?: string;
}

// Office layout constants (matching createRealisticOffice)
const OFFICE_LAYOUT = {
  worldW: 30,
  worldH: 24,
  walls: [
    { x: 0, z: -12, w: 30, d: 0.3 },   // North
    { x: 0, z: 12, w: 30, d: 0.3 },     // South
    { x: 15, z: 0, w: 0.3, d: 24 },     // East
    { x: -15, z: 0, w: 0.3, d: 24 },    // West
  ],
  partitions: [
    { x: 6.5, z: -6, w: 0.15, d: 8 },   // Meeting room wall
    { x: 6.5, z: -2, w: 0.08, d: 5 },   // Glass partition
  ],
  furniture: [
    { x: 10, z: -6, w: 3.5, d: 1.5, label: 'tavolo riunioni' },
    { x: 0, z: 10, w: 3, d: 0.8, label: 'reception' },
    { x: -14, z: 8, w: 0.8, d: 0.7, label: 'distributore' },
    { x: -5, z: 4, w: 0.9, d: 0.7, label: 'stampante' },
  ],
};

// Warehouse/Construction use larger area
const INDUSTRIAL_LAYOUT = {
  worldW: 40,
  worldH: 40,
  walls: [
    { x: 0, z: -20, w: 40, d: 0.5 },
    { x: 0, z: 20, w: 40, d: 0.5 },
    { x: 20, z: 0, w: 0.5, d: 40 },
    { x: -20, z: 0, w: 0.5, d: 40 },
  ],
  partitions: [],
  furniture: [],
};

const getLayout = (type?: string) => {
  if (type === 'office') return OFFICE_LAYOUT;
  return INDUSTRIAL_LAYOUT;
};

export const MiniMap = ({
  playerPosition,
  playerRotation,
  risks,
  scenarioType = 'office',
}: MiniMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layout = getLayout(scenarioType);
  const mapSize = 180;

  // Draw everything on canvas for better performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const worldW = layout.worldW;
    const worldH = layout.worldH;
    const scaleX = mapSize / worldW;
    const scaleZ = mapSize / worldH;

    const toMapX = (x: number) => (x + worldW / 2) * scaleX;
    const toMapZ = (z: number) => (z + worldH / 2) * scaleZ;

    // Clear
    ctx.clearRect(0, 0, mapSize, mapSize);

    // Background
    ctx.fillStyle = 'rgba(30,32,38,0.85)';
    ctx.fillRect(0, 0, mapSize, mapSize);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    const gridSpacing = mapSize / 6;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSpacing, 0);
      ctx.lineTo(i * gridSpacing, mapSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSpacing);
      ctx.lineTo(mapSize, i * gridSpacing);
      ctx.stroke();
    }

    // Walls
    ctx.fillStyle = 'rgba(200,200,210,0.9)';
    layout.walls.forEach(wall => {
      const mx = toMapX(wall.x) - (wall.w * scaleX) / 2;
      const mz = toMapZ(wall.z) - (wall.d * scaleZ) / 2;
      ctx.fillRect(mx, mz, wall.w * scaleX, wall.d * scaleZ);
    });

    // Partitions
    ctx.fillStyle = 'rgba(160,180,200,0.6)';
    layout.partitions.forEach(p => {
      const mx = toMapX(p.x) - (p.w * scaleX) / 2;
      const mz = toMapZ(p.z) - (p.d * scaleZ) / 2;
      ctx.fillRect(mx, mz, Math.max(p.w * scaleX, 1.5), p.d * scaleZ);
    });

    // Furniture
    ctx.fillStyle = 'rgba(120,120,130,0.5)';
    layout.furniture.forEach(f => {
      const mx = toMapX(f.x) - (f.w * scaleX) / 2;
      const mz = toMapZ(f.z) - (f.d * scaleZ) / 2;
      ctx.fillRect(mx, mz, f.w * scaleX, f.d * scaleZ);
    });

    // Risks (unfound only)
    risks.filter(r => !r.found).forEach(risk => {
      const rx = toMapX(risk.position[0]);
      const rz = toMapZ(risk.position[2]);
      const isManual = risk.isManual === true;
      const riskRadius = isManual ? 5 : 4;
      const color = isManual ? '#dc2626' : '#f97316';

      // Pulsing ring
      const t = Date.now() * 0.003;
      const pulseR = riskRadius + 3 + Math.sin(t) * 2;
      ctx.beginPath();
      ctx.arc(rx, rz, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = isManual ? 2 : 1;
      ctx.globalAlpha = 0.3 + Math.sin(t) * 0.15;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Main dot
      ctx.beginPath();
      ctx.arc(rx, rz, riskRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = isManual ? 0.9 : 0.7;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isManual ? 1.5 : 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // X mark for manual/critical
      if (isManual) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rx - 2.5, rz - 2.5);
        ctx.lineTo(rx + 2.5, rz + 2.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx + 2.5, rz - 2.5);
        ctx.lineTo(rx - 2.5, rz + 2.5);
        ctx.stroke();
      }
    });

    // Player marker
    const px = toMapX(playerPosition[0]);
    const pz = toMapZ(playerPosition[2]);

    // Direction circle
    ctx.beginPath();
    ctx.arc(px, pz, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(249,115,22,0.25)';
    ctx.fill();

    // Player triangle
    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(playerRotation);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(-4.5, 5);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Center dot
    ctx.beginPath();
    ctx.arc(px, pz, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

  }, [playerPosition, playerRotation, risks, layout, mapSize]);

  // Request animation frame for pulsing effect
  useEffect(() => {
    let animFrame: number;
    const animate = () => {
      // Trigger re-render for pulse animation
      const canvas = canvasRef.current;
      if (canvas) {
        // Force re-draw by dispatching a tiny state update
        canvas.dispatchEvent(new Event('redraw'));
      }
      animFrame = requestAnimationFrame(animate);
    };
    // Don't animate - the position updates already cause redraws
    // animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const manualUnfound = risks.filter(r => r.isManual && !r.found).length;
  const proceduralUnfound = risks.filter(r => !r.isManual && !r.found).length;

  return (
    <Card className="fixed bottom-20 left-4 z-20 p-2 bg-card/95 backdrop-blur-sm border-primary/20">
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold text-center text-muted-foreground uppercase tracking-wider">
          Mini-Mappa
        </div>

        <canvas
          ref={canvasRef}
          width={mapSize}
          height={mapSize}
          className="rounded border border-border"
          style={{ width: mapSize, height: mapSize }}
        />

        {/* Compact legend */}
        <div className="flex items-center justify-between gap-2 text-[9px] px-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-muted-foreground">Tu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-muted-foreground">Critico</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-muted-foreground">Generico</span>
          </div>
        </div>

        {/* Counter */}
        <div className="text-center pt-1 border-t border-border">
          <div className="text-xs font-semibold">
            {risks.filter(r => r.found).length}/{risks.length} 
            <span className="text-muted-foreground font-normal ml-1">trovati</span>
          </div>
          {(manualUnfound > 0 || proceduralUnfound > 0) && (
            <div className="flex justify-center gap-3 text-[9px] mt-0.5">
              {manualUnfound > 0 && (
                <span className="text-red-500 font-bold">🚨 {manualUnfound}</span>
              )}
              {proceduralUnfound > 0 && (
                <span className="text-orange-500 font-bold">⚠️ {proceduralUnfound}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
