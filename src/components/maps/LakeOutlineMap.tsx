import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLakePolygons } from '../../services/api';
import type { LatLng } from '../../types';

export type OutlineMode = 'before' | 'after' | 'both';

/** Esri satellite imagery with the model's lake outline for the first and the latest observed year. */
export const LakeOutlineMap: React.FC<{ lakeId: string; center: LatLng; mode: OutlineMode }> = ({ lakeId, center, mode }) => {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.FeatureGroup | null>(null);
  const [years, setYears] = useState<{ first?: number; latest?: number }>({});
  const [polys, setPolys] = useState<Awaited<ReturnType<typeof fetchLakePolygons>> | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current, { center: [center.lat, center.lng], zoom: 15, zoomControl: true });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, Maxar, Earthstar Geographics', maxZoom: 19,
    }).addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, [center.lat, center.lng]);

  useEffect(() => {
    let off = false;
    fetchLakePolygons(lakeId).then(fc => {
      if (off) return;
      setPolys(fc);
      setYears({
        first: fc.features.find(f => f.properties.which === 'first_year')?.properties.year,
        latest: fc.features.find(f => f.properties.which === 'latest_year')?.properties.year,
      });
      setLoadError(false);
    }).catch(() => {
      setPolys(null);
      setLoadError(true);
    });
    return () => { off = true; };
  }, [lakeId]);

  useEffect(() => {
    if (!map.current || !polys) return;
    layer.current?.remove();
    const g = L.featureGroup();
    const add = (which: 'first_year' | 'latest_year', style: L.PathOptions) => {
      const feats = polys.features.filter(f => f.properties.which === which);
      if (feats.length) L.geoJSON({ type: 'FeatureCollection', features: feats } as never, { style: () => style }).addTo(g);
    };
    if (mode !== 'after') add('first_year', { color: '#06b6d4', weight: 2, dashArray: '6 4', fillOpacity: mode === 'before' ? 0.25 : 0 });
    if (mode !== 'before') add('latest_year', { color: '#f97316', weight: 2.5, fillOpacity: mode === 'after' ? 0.3 : 0.1 });
    g.addTo(map.current);
    layer.current = g;
    const b = g.getBounds();
    if (b.isValid()) map.current.fitBounds(b.pad(0.6), { maxZoom: 17 });
  }, [polys, mode]);

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <div ref={box} style={{ height: '100%', width: '100%' }} />
      {loadError && (
        <div role="alert" style={{
          position: 'absolute', top: 8, left: 10, zIndex: 500, fontSize: 11,
          color: '#fecaca', background: 'rgba(6,12,24,0.8)', padding: '4px 10px', borderRadius: 6,
        }}>
          Lake outlines could not be loaded.
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 8, left: 10, zIndex: 500, fontSize: 11, color: '#e2e8f0',
        background: 'rgba(6,12,24,0.75)', padding: '4px 10px', borderRadius: 6,
      }}>
        <span style={{ color: '#06b6d4' }}>- - {years.first ?? '—'}</span>{'  '}
        <span style={{ color: '#f97316' }}>— {years.latest ?? '—'}</span>{'  '}· AI-segmented outline
      </div>
    </div>
  );
};
