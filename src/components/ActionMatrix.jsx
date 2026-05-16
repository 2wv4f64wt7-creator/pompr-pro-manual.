/* POMPR-PRO COMPONENT: ACTION MATRIX
   VERSION: V12.3 (UTILITY REF-SHEET OVERRIDE)
*/

import React, { useState, useMemo } from 'react';

const CATEGORIES = ['ALL', 'MOVE', 'SOCIAL', 'TECH', 'FIGHT', 'AMBIENT', 'UTILITY', 'CUSTOM'];

// --- HARDCODED UTILITY COMMANDS (UPDATED) ---
const UTILITY_ACTIONS = [
  { id: 'U_ANGLE_GRID', category: 'UTILITY', intensity: 1, name: 'ANGLE-GRID', desc: '2x2 grid, identical environment, four different cinematic camera angles, 16:9' },
  { id: 'U_LIGHT_STUDY', category: 'UTILITY', intensity: 3, name: 'LIGHT-STUDY', desc: '2x2 grid, identical environment, four dramatic lighting variations (Dawn, Noon, Dusk, Night)' },
  { id: 'U_REF_HEAD', category: 'UTILITY', intensity: 5, name: '!! HEAD REFERENCE SHEET !!', desc: '3-panel head reference sheet with front view, side profile, and rear view, consistent proportions, neutral expression, white background, even lighting, high detail clarity, no motion' },
  { id: 'U_REF_BODY', category: 'UTILITY', intensity: 7, name: '!! GENERATE REFERENCE SHEET !!', desc: 'full body character reference sheet with front, side, three-quarter, and back views, identical scale, neutral upright stance, white background, even lighting, high detail clarity, no motion' },
  { id: 'U_ENHANCE_X', category: 'UTILITY', intensity: 9, name: 'ENHANCE-X', desc: 'render in full frame, enhance with natural detail and texture, 8k resolution' }
];

// --- INTENSITY COLORS ---
const INTENSITY_COLORS = { LOW: '#6699FF', MINOR: '#66CC66', MODERATE: '#FFFF33', VIGOROUS: '#FF6600', INTENSE: '#FF0000' };

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
  const [intensity, setIntensity] = useState(1);

  // --- FILTER LOGIC ---
  const filteredActions = useMemo(() => {
    const combinedActions = [...actions, ...UTILITY_ACTIONS];
    const uniqueActions = Array.from(new Map(combinedActions.map(item => [item.id, item])).values());

    return uniqueActions.filter(a => {
      // Hide the old JSON reference sheets from normal tabs so they only exist in Utility
      if (a.name.includes('REFERENCE SHEET') && a.category !== 'UTILITY') return false;

      if (activeCategory === 'UTILITY') return a.category === 'UTILITY';

      const actLevel = a.intensity || 5; 
      const matchesIntensity = actLevel === parseInt(intensity);
      const matchesCategory = doesActionMatchCategory(a, activeCategory);
      return matchesIntensity && matchesCategory;
    });
  }, [actions, activeCategory, intensity]);

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#161616', padding: '1rem', gap: '0.75rem', borderTop: '1px solid #333', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)' },
    filterBar: { display: 'flex', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid #333', overflowX: 'auto', scrollbarWidth: 'none' },
    filterBtn: (active, isUtility) => ({ padding: '6px 12px', fontSize: '0.65rem', fontWeight: 'bold', background: active ? (isUtility ? '#10b981' : '#3b82f6') : '#222', color: active ? '#fff' : (isUtility ? '#10b981' : '#888'), border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', letterSpacing: '1px', whiteSpace: 'nowrap' }),
    header: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', color: getColorByIntensity(intensity), alignItems: 'center', textTransform: 'uppercase', letterSpacing: '1px' },
    slider: { width: '100%', cursor: 'pointer', accentColor: getColorByIntensity(intensity), height: '4px', marginBottom: '0.5rem', opacity: activeCategory === 'UTILITY' ? 0.2 : 1, pointerEvents: activeCategory === 'UTILITY' ? 'none' : 'auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gridAutoRows: 'min-content', gap: '1rem', overflowY: 'auto', paddingRight: '5px', paddingBottom: '4rem' },
    actionBtn: (act) => ({ backgroundColor: '#222', color: '#ddd', border: '1px solid #333', padding: '0.75rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', borderLeft: `3px solid ${getColorByIntensity(act.intensity || 5)}`, transition: 'all 0.2s', minHeight: '60px', height: '100%', boxSizing: 'border-box' }),
    actionName: { fontWeight: 'bold', marginBottom: '6px', whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.2' },
    actionDesc: { fontSize: '0.65rem', opacity: 0.8, whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterBar}>
        {CATEGORIES.map(cat => (
          <button key={cat} style={styles.filterBtn(activeCategory === cat, cat === 'UTILITY')} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>
      <div style={styles.header}>
        <span>{activeCategory === 'UTILITY' ? 'UTILITY COMMANDS' : 'Action Matrix'}</span>
        <span>{activeCategory === 'UTILITY' ? 'GLOBAL' : `Lvl ${intensity}: ${getIntensityLabel(intensity)}`}</span>
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