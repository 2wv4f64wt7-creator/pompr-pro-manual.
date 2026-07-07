/* POMPR-PRO COMPONENT: ACTION MATRIX
   VERSION: V12.9 (CINEMATIC CAMERA EXPANSION & SLIDER UNLOCK)
   ARCHITECT NOTE: Utility tab now scales 1-10. Hardcoded 25 camera/utility actions.
*/

import React, { useState, useMemo } from 'react';

const CATEGORIES = ['ALL', 'MOVE', 'SOCIAL', 'TECH', 'FIGHT', 'AMBIENT', 'UTILITY', 'CUSTOM'];

// --- HARDCODED UTILITY COMMANDS (V12.9 - REVISED INTERPOLATION) ---
const UTILITY_ACTIONS = [
  // --- LEVEL 1: FIXED ORIGINAL SYSTEM UTILITIES ---
  { id: 'U_ANGLE_GRID', category: 'UTILITY', intensity: 1, name: 'ANGLE-GRID', desc: '2x2 grid, identical environment, four different cinematic camera angles, 16:9 ratio' },
  { id: 'U_LIGHT_STUDY', category: 'UTILITY', intensity: 1, name: 'LIGHT-STUDY', desc: '2x2 grid, identical environment, four dramatic lighting variations (Dawn, Noon, Dusk, Night).' },
  { id: 'U_REF_HEAD', category: 'UTILITY', intensity: 1, name: '3D-HEAD', desc: '3-panel head reference sheet with front view, side profile, and rear view, consistent proportions, neutral expression.' },
  { id: 'U_REF_BODY', category: 'UTILITY', intensity: 1, name: '3D-BODY', desc: 'full body character reference sheet with front, side, three-quarter, and back views, identical scale, neutral upright stance.' },
  { id: 'U_ENHANCE_X', category: 'UTILITY', intensity: 1, name: 'ENHANCE-X', desc: 'render in full frame, enhance with natural detail and texture, 8k resolution' },

  // --- LEVEL 2: BASIC OPTICAL SHIFTS ---
  { id: 'U_CAM_ZOOM_IN', category: 'UTILITY', intensity: 2, name: 'ZOOM-IN', desc: 'CAMERA OVERRIDE: Lens zooms in tightly on the subject, pulling focus attention and emphasizing internal emotions.' },
  { id: 'U_CAM_ZOOM_OUT', category: 'UTILITY', intensity: 2, name: 'ZOOM-OUT', desc: 'CAMERA OVERRIDE: Lens zooms out away from the subject, creating big narrative reveals and an epic structural scale.' },
  { id: 'U_MACRO_CLOSE', category: 'UTILITY', intensity: 2, name: 'MACRO-CLOSE-UP', desc: 'CAMERA OVERRIDE: Extreme macro close-up, shallow depth of field, sharp optical focus on subject, environment blurred out.' },
  
  // --- LEVEL 3-4: FIXED AXIS & TILT/PAN SEPARATIONS ---
  { id: 'U_CAM_PAN_LEFT', category: 'UTILITY', intensity: 3, name: 'PAN-LEFT', desc: 'CAMERA OVERRIDE: Camera stationary base pans left from its position to slowly reveal the surrounding environment.' },
  { id: 'U_CAM_PAN_RIGHT', category: 'UTILITY', intensity: 3, name: 'PAN-RIGHT', desc: 'CAMERA OVERRIDE: Camera stationary base pans right from its position for story transitions and scene extensions.' },
  { id: 'U_CAM_TILT_UP', category: 'UTILITY', intensity: 4, name: 'TILT-UP', desc: 'CAMERA OVERRIDE: Camera tilts upward vertically, establishing massive structures, heroes, or grand cinematic reveals.' },
  { id: 'U_CAM_TILT_DOWN', category: 'UTILITY', intensity: 4, name: 'TILT-DOWN', desc: 'CAMERA OVERRIDE: Camera tilts downward vertically from top to bottom, forcing scale reveals and emphasizing small details.' },

  // --- LEVEL 5-6: KINETIC PHYSICAL CARRIERS (TRACKS & PUSHES) ---
  { id: 'U_CAM_PUSH_IN', category: 'UTILITY', intensity: 5, name: 'PUSH-IN', desc: 'CAMERA OVERRIDE: Camera dolly physical push-in closer to the subject from its current position for epic, dramatic narrative reveals.' },
  { id: 'U_CAM_PULL_OUT', category: 'UTILITY', intensity: 5, name: 'PULL-OUT', desc: 'CAMERA OVERRIDE: Camera dolly physical pull-out away from the subject, ideal for emotional narrative moments and macro scene reveals.' },
  { id: 'U_CAM_TRUCK_LEFT', category: 'UTILITY', intensity: 6, name: 'TRUCK-LEFT', desc: 'CAMERA OVERRIDE: Camera tracks left horizontally on a rigid dolly system, maintaining dynamic cinematic spatial motion.' },
  { id: 'U_CAM_TRUCK_RIGHT', category: 'UTILITY', intensity: 6, name: 'TRUCK-RIGHT', desc: 'CAMERA OVERRIDE: Camera tracks right horizontally on a rigid dolly system, perfect for product showcases or side scene transitions.' },

  // --- LEVEL 7-8: ADVANCED CURVED, CIRCULAR, & JIB LIVES ---
  { id: 'U_CAM_ORBIT_LEFT', category: 'UTILITY', intensity: 7, name: 'ORBIT-LEFT', desc: 'CAMERA OVERRIDE: Camera tracks smoothly around the subject in a circular left orbit path, delivering hero arcs and dynamic profiles.' },
  { id: 'U_CAM_ORBIT_RIGHT', category: 'UTILITY', intensity: 7, name: 'ORBIT-RIGHT', desc: 'CAMERA OVERRIDE: Camera tracks smoothly around the subject in a circular right orbit path, built for high-end cinematic introductions.' },
  { id: 'U_CAM_ARC_SHOT', category: 'UTILITY', intensity: 8, name: 'ARC-SHOT', desc: 'CAMERA OVERRIDE: Camera sweeps in a fluid half-circle arc around the subject. Built for commercial-luxe aesthetics and emotional punch.' },
  { id: 'U_CAM_CRANE_UP', category: 'UTILITY', intensity: 8, name: 'CRANE-UP', desc: 'CAMERA OVERRIDE: Jib arm or crane lifts vertically upward away from ground plane, building epic panoramic establishing frames.' },
  { id: 'U_CAM_CRANE_DOWN', category: 'UTILITY', intensity: 8, name: 'CRANE-DOWN', desc: 'CAMERA OVERRIDE: Jib arm or crane drops vertically down toward the ground plane, formatting grand introductions and entryways.' },
  { id: 'U_ULTRA_WIDE', category: 'UTILITY', intensity: 8, name: 'ULTRA-WIDE-SHOT', desc: 'CAMERA OVERRIDE: Ultra-wide panoramic establishing shot, massive scale, vast environment, subject appears small in frame.' },

  // --- LEVEL 9-10: HIGH KINETIC FLIGHT & ORGANIC HANDHELD ---
  { id: 'U_CAM_TRACK_FWD', category: 'UTILITY', intensity: 9, name: 'TRACKING-FORWARD', desc: 'CAMERA OVERRIDE: Camera aggressively locks to and follows directly behind the subject moving forward through space.' },
  { id: 'U_CAM_TRACK_BWD', category: 'UTILITY', intensity: 9, name: 'TRACKING-BACKWARD', desc: 'CAMERA OVERRIDE: Camera retreats backward facing the subject as they advance, maintaining perfect tracking distances.' },
  { id: 'U_CAM_HANDHELD', category: 'UTILITY', intensity: 9, name: 'HANDHELD-MOVE', desc: 'CAMERA OVERRIDE: Intentional slight organic camera shake, raw handheld tracking motion, realistic documentary filmmaking texture.' },
  { id: 'U_CAM_DRONE_RISE', category: 'UTILITY', intensity: 10, name: 'DRONE-RISE', desc: 'CAMERA OVERRIDE: Low-altitude drone ascends vertically toward the sky, mapping sweeping landscape vistas and massive environmental scale.' },
  { id: 'U_CAM_DRONE_FLY', category: 'UTILITY', intensity: 10, name: 'DRONE-FLY-THROUGH', desc: 'CAMERA OVERRIDE: High-speed drone flight sequence charting directly through gaps, objects, or close architecture for transitions.' }
];

// --- INTENSITY HEATMAP COLORS ---
const INTENSITY_COLORS = { LOW: '#6699FF', MINOR: '#66CC66', MODERATE: '#FFFF33', VIGOROUS: '#FF6600', INTENSE: '#FF0000' };
const ACTION_GREEN = '#10b981'; 

const getColorByIntensity = (val) => {
  if (val <= 2) return INTENSITY_COLORS.LOW;
  if (val <= 4) return INTENSITY_COLORS.MINOR;
  if (val <= 6) return INTENSITY_COLORS.MODERATE;
  if (val <= 8) return INTENSITY_COLORS.VIGOROUS;
  return INTENSITY_COLORS.INTENSE;
};

const getIntensityLabel = (val) => {
  if (val <= 2) return 'LOW (Pose)';
  if (val <= 4) return 'MINOR (Casual)';
  if (val <= 6) return 'MODERATE (Active)';
  if (val <= 8) return 'VIGOROUS (Dynamic)';
  return 'INTENSE (Conflict)';
};

// --- SMART ROUTER ---
const doesActionMatchCategory = (action, category) => {
  if (category === 'ALL') return action.category !== 'UTILITY'; 
  if (category === 'UTILITY') return action.category === 'UTILITY';
  
  const t = action.type || "";
  const n = action.name || "";
  const c = action.category || "";
  
  if (category === 'MOVE') return t === 'V' || n.includes('MOVE') || n.includes('RUN');
  if (category === 'SOCIAL') return t === 'S' || n.includes('POSE') || n.includes('GAZE') || n.includes('GEST') || n.includes('COMMS');
  if (category === 'TECH') return t === 'U' || n.includes('TASK') || n.includes('PROP');
  if (category === 'FIGHT') return t === 'C' || n.includes('FIGHT');
  if (category === 'AMBIENT') return n.includes('RESLT') || t === 'A' || n.includes('AMBIENT');
  if (category === 'CUSTOM') return action.isCustom || (c !== '' && c !== 'ACTION' && c !== 'UTILITY');
  
  return false;
};

const ActionMatrix = ({ actions = [], onSelectAction }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [intensity, setIntensity] = useState(5); 

  // --- FILTER LOGIC ---
  const filteredActions = useMemo(() => {
    const combinedActions = [...actions, ...UTILITY_ACTIONS];
    const uniqueActions = Array.from(new Map(combinedActions.map(item => [item.id, item])).values());

    return uniqueActions.filter(a => {
      if (a.name.includes('REFERENCE SHEET') && a.category !== 'UTILITY') return false;

      const actLevel = a.intensity || 5; 
      const matchesIntensity = actLevel === parseInt(intensity);
      const matchesCategory = doesActionMatchCategory(a, activeCategory);
      return matchesIntensity && matchesCategory;
    });
  }, [actions, activeCategory, intensity]);

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#161616', padding: '1rem', gap: '0.75rem', borderTop: `1px solid ${ACTION_GREEN}`, boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)' },
    filterBar: { display: 'flex', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid #333', overflowX: 'auto', scrollbarWidth: 'none' },
    filterBtn: (active) => ({ 
      padding: '6px 12px', fontSize: '0.65rem', fontWeight: 'bold', 
      background: active ? ACTION_GREEN : '#222', color: active ? '#fff' : '#888', 
      border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', letterSpacing: '1px', whiteSpace: 'nowrap' 
    }),
    header: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '1px' },
    // ARCHITECT FIX: Slider is now 100% opacity and 'auto' pointerEvents across all tabs
    slider: { width: '100%', cursor: 'pointer', accentColor: getColorByIntensity(intensity), height: '4px', marginBottom: '0.5rem', opacity: 1, pointerEvents: 'auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gridAutoRows: 'min-content', gap: '1rem', overflowY: 'auto', paddingRight: '5px', paddingBottom: '4rem' },
    actionBtn: (act) => ({ backgroundColor: '#222', color: '#ddd', border: '1px solid #333', padding: '0.75rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', borderLeft: `3px solid ${getColorByIntensity(act.intensity || 5)}`, transition: 'all 0.2s', minHeight: '60px', height: '100%', boxSizing: 'border-box' }),
    actionName: { fontWeight: 'bold', marginBottom: '6px', whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.2' },
    actionDesc: { fontSize: '0.65rem', opacity: 0.8, whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterBar}>
        {CATEGORIES.map(cat => (
          <button key={cat} style={styles.filterBtn(activeCategory === cat)} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>
      <div style={styles.header}>
        <span style={{ color: ACTION_GREEN }}>{activeCategory === 'UTILITY' ? 'UTILITY COMMANDS' : 'ACTION MATRIX'}</span>
        <span style={{ color: getColorByIntensity(intensity) }}>{`Lvl ${intensity}: ${getIntensityLabel(intensity)}`}</span>
      </div>
      <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} style={styles.slider} />
      <div style={styles.grid}>
        {filteredActions.length > 0 ? (
          filteredActions.map((action) => (
            <div key={action.id} role="button" tabIndex={0} style={styles.actionBtn(action)} onClick={() => onSelectAction(action)} title={action.desc} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.borderColor = getColorByIntensity(action.intensity || 5); }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#222'; e.currentTarget.style.borderColor = '#333'; }}>
              <span style={styles.actionName}>{action.name}</span>
              <span style={styles.actionDesc}>{action.desc}</span>
            </div>
          ))
        ) : (
          <div style={{color:'#555', fontSize:'0.8rem', textAlign:'center', marginTop:'1rem', gridColumn: '1/-1'}}>
            No [{activeCategory}] actions found at Level {intensity}.
          </div>
        )}
      </div>
    </div>
  );
};
export default ActionMatrix;