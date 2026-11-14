import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Lake } from '../../types';
import { getRiskColor } from '../../utils';
import { fetchPolygons, IS_LIVE } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GlofMapProps {
  lakes: Lake[];
  selectedLakeId?: string;
  onLakeClick?: (lake: Lake) => void;
  height?: string | number;
  showLayers?: boolean;
  showFloodExtent?: boolean;
  simulationLakeId?: string;
}

const TILE_LAYERS = {
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    label: 'Terrain',
    maxZoom: 17,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    label: 'Satellite',
    maxZoom: 19,
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    label: 'Street',
    maxZoom: 19,
  },
};

export const GlofMap: React.FC<GlofMapProps> = ({
  lakes,
  selectedLakeId,
  onLakeClick,
  height = '100%',
  showLayers = true,
  simulationLakeId,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const outlineRef = useRef<L.GeoJSON | null>(null);
  const navigate = useNavigate();

  const [activeBase, setActiveBase] = useState<keyof typeof TILE_LAYERS>('terrain');
  const [layerVisibility, setLayerVisibility] = useState({
    lakes: true,
    riskZones: true,
    floodExtent: false,
    settlements: false,
  });

  // ── Initialize map ────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [32.1, 77.5],
      zoom: 8,
      zoomControl: false,
      attributionControl: true,
    });
    mapRef.current = map;

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer
    const layer = L.tileLayer(TILE_LAYERS.terrain.url, {
      attribution: TILE_LAYERS.terrain.attribution,
      maxZoom: TILE_LAYERS.terrain.maxZoom,
    });
    layer.addTo(map);
    tileLayerRef.current = layer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Switch base map ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const cfg = TILE_LAYERS[activeBase];
    const layer = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom });
    layer.addTo(mapRef.current);
    tileLayerRef.current = layer;
  }, [activeBase]);

  // ── Lake outlines from the segmentation model (live mode) ─
  useEffect(() => {
    if (!IS_LIVE || !mapRef.current || lakes.length === 0) return;
    let cancelled = false;
    const byId = Object.fromEntries(lakes.map(l => [l.id, l]));
    fetchPolygons().then(fc => {
      if (cancelled || !mapRef.current) return;
      outlineRef.current?.remove();
      outlineRef.current = L.geoJSON(fc as never, {
        filter: f => {
          const p = f.properties as { lakeId: string; which: string };
          return p.which === 'latest_year' && !!byId[p.lakeId];
        },
        style: f => {
          const lakeId = (f?.properties as { lakeId?: string } | undefined)?.lakeId;
          return {
            color: getRiskColor(lakeId ? byId[lakeId]?.riskLevel ?? 'LOW' : 'LOW'),
            weight: 2, fillOpacity: 0.4,
          };
        },
      }).addTo(mapRef.current);
    }).catch(error => console.warn('Could not load lake outlines.', error));
    return () => { cancelled = true; outlineRef.current?.remove(); };
  }, [lakes]);

  // ── Lake markers ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    if (!layerVisibility.lakes) return;

    lakes.forEach(lake => {
      const color = getRiskColor(lake.riskLevel);
      const isSelected = lake.id === selectedLakeId;
      const isSimLake = lake.id === simulationLakeId;

      const circle = L.circleMarker([lake.coordinates.lat, lake.coordinates.lng], {
        radius: isSelected ? 14 : isSimLake ? 12 : 9,
        fillColor: color,
        color: isSelected ? '#fff' : isSimLake ? '#f97316' : color,
        weight: isSelected ? 2.5 : isSimLake ? 2 : 1.5,
        opacity: 1,
        fillOpacity: 0.75,
      });

      // Risk zone ring (if enabled)
      if (layerVisibility.riskZones && (lake.riskLevel === 'HIGH' || lake.riskLevel === 'CRITICAL')) {
        L.circle([lake.coordinates.lat, lake.coordinates.lng], {
          radius: lake.currentArea * 1200,
          color,
          fillColor: color,
          fillOpacity: 0.06,
          weight: 1,
          dashArray: '4 6',
        }).addTo(mapRef.current!);
      }

      // Flood extent ring for simulation
      if (layerVisibility.floodExtent && isSimLake) {
        L.circle([lake.coordinates.lat, lake.coordinates.lng], {
          radius: 18000,
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '6 4',
        }).addTo(mapRef.current!).bringToBack();
      }

      // Popup
      const popupHtml = `
        <div style="font-family:Inter,sans-serif;min-width:220px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="font-weight:700;font-size:14px;color:#e2e8f0;">${lake.name}</div>
            <span style="font-size:10px;font-weight:600;letter-spacing:0.06em;padding:2px 8px;border-radius:99px;color:${color};background:${color}20;border:1px solid ${color}40;">${lake.riskLevel}</span>
          </div>
          <div style="color:#94a3b8;font-size:11px;margin-bottom:10px;">${lake.id}</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <tr><td style="color:#64748b;padding:3px 0;">Location</td><td style="color:#cbd5e1;text-align:right;">${lake.district}</td></tr>
            <tr><td style="color:#64748b;padding:3px 0;">Elevation</td><td style="color:#cbd5e1;text-align:right;">${lake.elevation.toLocaleString()} m</td></tr>
            <tr><td style="color:#64748b;padding:3px 0;">Area</td><td style="color:#cbd5e1;text-align:right;">${lake.currentArea.toFixed(2)} km²</td></tr>
            <tr><td style="color:#64748b;padding:3px 0;">Area Change</td><td style="color:${lake.areaChangePct > 5 ? '#f97316' : '#94a3b8'};text-align:right;">+${lake.areaChangePct.toFixed(1)}%</td></tr>
            <tr><td style="color:#64748b;padding:3px 0;">Risk Score</td><td style="color:${color};text-align:right;font-weight:600;">${lake.riskScore}/100</td></tr>
          </table>
          <button
            id="popup-nav-${lake.id}"
            style="margin-top:12px;width:100%;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.35);color:#06b6d4;border-radius:6px;padding:7px;font-size:12px;font-weight:500;cursor:pointer;font-family:Inter,sans-serif;"
          >
            View Lake Analysis →
          </button>
        </div>
      `;

      circle.bindPopup(popupHtml, { maxWidth: 280, closeButton: true });

      circle.on('click', () => {
        onLakeClick?.(lake);
        circle.openPopup();
      });

      circle.on('popupopen', () => {
        const btn = document.getElementById(`popup-nav-${lake.id}`);
        btn?.addEventListener('click', () => navigate(`/lakes/${lake.id}`));
      });

      circle.on('mouseover', () => {
        circle.setStyle({ radius: circle.options.radius! + 3, weight: 2.5 });
      });
      circle.on('mouseout', () => {
        if (!circle.isPopupOpen()) {
          circle.setStyle({ radius: isSelected ? 14 : 9, weight: isSelected ? 2.5 : 1.5 });
        }
      });

      circle.addTo(mapRef.current!);
      markersRef.current[lake.id] = circle;
    });
  }, [lakes, selectedLakeId, layerVisibility, simulationLakeId, onLakeClick, navigate]);

  // ── Fly to selected lake ──────────────────────────────
  useEffect(() => {
    if (!selectedLakeId || !mapRef.current) return;
    const lake = lakes.find(l => l.id === selectedLakeId);
    if (lake) {
      mapRef.current.flyTo([lake.coordinates.lat, lake.coordinates.lng], 11, { duration: 1.2 });
      setTimeout(() => markersRef.current[selectedLakeId]?.openPopup(), 1300);
    }
  }, [selectedLakeId, lakes]);

  const toggleLayer = (key: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {/* Map container */}
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {showLayers && (
        <>
          {/* Base map selector */}
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 500,
            background: 'rgba(13,22,41,0.92)', border: '1px solid var(--border)',
            borderRadius: 8, overflow: 'hidden', backdropFilter: 'blur(8px)',
          }}>
            {(Object.entries(TILE_LAYERS) as [keyof typeof TILE_LAYERS, typeof TILE_LAYERS[keyof typeof TILE_LAYERS]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveBase(key)}
                style={{
                  display: 'block', width: '100%', padding: '7px 14px',
                  background: activeBase === key ? 'rgba(6,182,212,0.15)' : 'transparent',
                  color: activeBase === key ? 'var(--cyan)' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  textAlign: 'left', fontFamily: 'Inter,sans-serif',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'all 0.15s',
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Layer selector */}
          <div style={{
            position: 'absolute', bottom: 40, left: 12, zIndex: 500,
            background: 'rgba(13,22,41,0.92)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)',
            minWidth: 170,
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>LAYERS</div>
            {([
              { key: 'lakes',      label: 'Glacial Lakes' },
              { key: 'riskZones',  label: 'Risk Zones' },
              { key: 'floodExtent',label: 'Flood Extent' },
              { key: 'settlements',label: 'Settlements' },
            ] as { key: keyof typeof layerVisibility; label: string }[]).map(({ key, label }) => (
              <label
                key={key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 6, cursor: 'pointer', fontSize: 12,
                  color: layerVisibility[key] ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <input
                  type="checkbox"
                  checked={layerVisibility[key]}
                  onChange={() => toggleLayer(key)}
                  style={{ accentColor: 'var(--cyan)', width: 13, height: 13 }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 40, right: 50, zIndex: 500,
            background: 'rgba(13,22,41,0.92)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>RISK LEGEND</div>
            {[
              { color: '#22c55e', label: 'Low Risk' },
              { color: '#f59e0b', label: 'Medium Risk' },
              { color: '#f97316', label: 'High Risk' },
              { color: '#ef4444', label: 'Critical' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ marginBottom: 5 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
