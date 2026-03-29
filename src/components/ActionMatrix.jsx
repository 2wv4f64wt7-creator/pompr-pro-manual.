/* 
   POMPR-PRO COMPONENT: ACTION MATRIX
   VERSION: V11.8.2 (INTENSITY UI - DIV REFACTOR & SPACING)
   LOCATION: src/components/ActionMatrix.jsx
*/

import React, { useState, useMemo } from 'react';

// --- INTENSITY COLORS ---
const INTENSITY_COLORS = {
  LOW: '#6699FF',      // 1-2
  MINOR: '#66CC66',    // 3-4
  MODERATE: '#FFFF33', // 5-6
  VIGOROUS: '#FF6600', // 7-8
  INTENSE: '#FF0000'   // 9-10
};

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

const ActionMatrix = ({ actions = [], onSelectAction }) => {
  const [intensity, setIntensity] = useState(1);

  // --- FILTER LOGIC ---
  const filteredActions = useMemo(() => {
    if (!actions || actions.length === 0) return [];
    
    // Strict Deduplication
    const uniqueActions = Array.from(new Map(actions.map(item => [item.id, item])).values());

    // Filter by Intensity (Default to 5 if missing)
    return uniqueActions.filter(a => {
      const actLevel = a.intensity || 5; 
      return actLevel === parseInt(intensity); 
    });
  }, [actions, intensity]);

  // --- STYLES ---
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#161616',
      padding: '1rem',
      gap: '0.75rem',
      borderTop: '1px solid #333',
      boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: getColorByIntensity(intensity),
      alignItems: 'center',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    slider: {
      width: '100%',
      cursor: 'pointer',
      accentColor: getColorByIntensity(intensity),
      height: '4px',
      marginBottom: '0.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
      gridAutoRows: 'min-content', // Forces row height to fit the tallest text
      gap: '1rem', // INCREASED: Adds distinct padding between actions
      overflowY: 'auto',
      paddingRight: '5px',
      paddingBottom: '4rem' // Matches the bottom padding of Scene/Character columns
    },
    actionBtn: {
      backgroundColor: '#222',
      color: '#ddd',
      border: '1px solid #333',
      padding: '0.75rem 0.6rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start', 
      borderLeft: `3px solid ${getColorByIntensity(intensity)}`,
      transition: 'all 0.2s',
      minHeight: '60px',
      height: '100%', // Reverted to 100% since div safely expands, aligning all cards in a row
      boxSizing: 'border-box'
    },
    actionName: {
      fontWeight: 'bold',
      marginBottom: '6px', 
      whiteSpace: 'normal', 
      wordWrap: 'break-word',
      lineHeight: '1.2'
    },
    actionDesc: {
      fontSize: '0.65rem', 
      opacity: 0.8, 
      whiteSpace: 'normal', 
      wordWrap: 'break-word',
      lineHeight: '1.4'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span>Action Matrix</span>
        <span>Lvl {intensity}: {getIntensityLabel(intensity)}</span>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        value={intensity}
        onChange={(e) => setIntensity(Number(e.target.value))}
        style={styles.slider}
      />

      <div style={styles.grid}>
        {filteredActions.length > 0 ? (
          filteredActions.map((action) => (
            <div
              key={action.id}
              role="button"
              tabIndex={0}
              style={styles.actionBtn}
              onClick={() => onSelectAction(action)}
              title={action.desc}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
                e.currentTarget.style.borderColor = getColorByIntensity(intensity);
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#222';
                e.currentTarget.style.borderColor = '#333';
              }}
            >
              <span style={styles.actionName}>{action.name}</span>
              <span style={styles.actionDesc}>{action.desc}</span>
            </div>
          ))
        ) : (
          <div style={{color:'#555', fontSize:'0.8rem', textAlign:'center', marginTop:'1rem'}}>
            No Actions Found (Level {intensity})
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionMatrix;