// -------------------------------------------------------------------
// FILE: ActionMatrixV2.jsx | VERSION: 2.33 (CUSTOM FILTER REPAIR)
// -------------------------------------------------------------------
import React, { useState, useMemo, useEffect } from 'react';

const ACTION_TYPES = ['POSE', 'MOVE', 'EMOTE', 'BUSY', 'SOCIAL', 'POWR', 'CUSTOM', 'UTILITY'];
const MOODS = ['CALM', 'HAPPY', 'FOCUSED', 'FEARFUL', 'ANGRY', 'POWERFUL'];

const UTILITY_ACTIONS = [
  { id: 'U_ANGLE_GRID', type: 'UTILITY', name: 'ANGLE-GRID', text: '2x2 grid, identical environment, four different cinematic camera angles, 16:9 ratio' },
  { id: 'U_LIGHT_STUDY', type: 'UTILITY', name: 'LIGHT-STUDY', text: '2x2 grid, identical environment, four dramatic lighting variations (Dawn, Noon, Dusk, Night).' },
  { id: 'U_REF_HEAD', type: 'UTILITY', name: '3D-HEAD', text: '3-panel head reference sheet with front view, side profile, and rear view, consistent proportions.' },
  { id: 'U_REF_BODY', type: 'UTILITY', name: '3D-BODY', text: 'full body character reference sheet with front, side, and back views.' },
  { id: 'U_ENHANCE_X', type: 'UTILITY', name: 'ENHANCE-X', text: 'render in full frame, enhance with natural detail and texture, 8k resolution' }
];

const MOOD_MODS = {
  'CALM': { low: 'with relaxed posture', med: 'with smooth motions', high: 'exuding tranquility' },
  'HAPPY': { low: 'with a slight smile', med: 'with a warm smile', high: 'with a broad smile' },
  'FOCUSED': { low: 'with steady eyes', med: 'eyes locked on the task', high: 'total hyper-fixation' },
  'FEARFUL': { low: 'with a cautious expression', med: 'with widened eyes', high: 'with urgent eyes' },
  'ANGRY': { low: 'with a restrained expression', med: 'clenched jaw', high: 'visually dominant frustration' },
  'POWERFUL': { low: 'with steady posture', med: 'strong posture', high: 'visually dominant presence' }
};

export default function ActionMatrixV2({ actions = [], onSelectAction, onSelectUtility, isHuman, activeAction, motionMode }) {
  const [activeTab, setActiveTab] = useState('POSE');
  const [activeMood, setActiveMood] = useState('HAPPY');
  const [intensity, setIntensity] = useState(5);
  const [activeBase, setActiveBase] = useState(null);
  
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");

  useEffect(() => { if (activeAction) setActiveBase(activeAction); }, [activeAction]);

  const triggerUpdate = (baseObj, mood, ei, isUtil) => {
    if (isUtil && baseObj) {
      onSelectUtility(baseObj.text);
    } else if (baseObj) {
      let cleanDesc = (baseObj.text || baseObj.desc || "").replace(/\[SUBJECT\]\s*/gi, '');
      let suffix = motionMode === 'VIDEO' ? 'Cinematic motion sequence.' : 'Cinematic frozen still-frame.';
      let compiled = isHuman 
        ? `${mood} ${baseObj.name} (${cleanDesc}, ${MOOD_MODS[mood][ei <= 3 ? 'low' : ei >= 8 ? 'high' : 'med']}. ${suffix})`
        : `${baseObj.name} (${cleanDesc}. ${suffix})`;
      onSelectAction({ ...baseObj, desc: compiled });
    }
  };

  useEffect(() => {
    if (activeBase && activeTab !== 'UTILITY') {
      triggerUpdate(activeBase, activeMood, intensity, false);
    }
  }, [motionMode]);

  const filteredActions = useMemo(() => {
    if (activeTab === 'UTILITY') return UTILITY_ACTIONS;

    if (activeTab === 'CUSTOM') {
      const coreTypes = ['POSE', 'MOVE', 'EMOTE', 'BUSY', 'SOCIAL', 'POWR', 'UTILITY'];
      const coreCategories = ['CORE', 'DEFAULT', 'BASIC', 'ALL', 'USER', undefined, null, ''];

      return actions.filter(a => {
        // 1. Explicitly typed or categorized as CUSTOM
        if (a.type === 'CUSTOM' || a.category === 'CUSTOM') return true;
        
        // 2. Exclude default actions (standard type + missing/core category)
        const hasCoreType = coreTypes.includes(a.type);
        const isCoreCategory = !a.category || coreCategories.includes(a.category.toUpperCase().trim());
        if (hasCoreType && isCoreCategory) return false;

        // 3. Keep expansion reel actions (non-core category like ESSENTIAL_WORKERS)
        return true;
      });
    }

    return actions.filter(a => a.type === activeTab);
  }, [actions, activeTab]);

  const btnStyle = (active, color) => ({
    padding: '6px 12px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', borderRadius: '4px', 
    cursor: 'pointer', backgroundColor: active ? color : '#222', color: '#fff', whiteSpace: 'nowrap'
  });

  return (
    <div style={{ backgroundColor: '#161616', color: '#fff', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', minHeight: 0 }}>
        <div>
          <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>1. CATEGORY</span>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px' }}>
            {ACTION_TYPES.map(tab => (<button key={tab} style={btnStyle(activeTab === tab, '#3b82f6')} onClick={() => setActiveTab(tab)}>{tab}</button>))}
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>2. ACTION</span>
            <button 
              onClick={() => setIsAddingCustom(!isAddingCustom)} 
              style={{ background: isAddingCustom ? '#10b981' : '#333', border: 'none', color: '#fff', fontSize: '9px', fontWeight: '900', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}
            >
              + CUSTOM
            </button>
          </div>

          {isAddingCustom && (
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                value={customInputValue}
                autoFocus
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="TYPE ACTION AND PRESS ENTER..." 
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && customInputValue.trim()) { 
                    const manualObj = { id: `manual_${Date.now()}`, name: customInputValue, text: customInputValue };
                    triggerUpdate(manualObj, activeMood, intensity, false);
                    setCustomInputValue("");
                    setIsAddingCustom(false);
                  }
                }}
                style={{ 
                  background: '#000', border: '1px solid #10b981', color: '#fff', padding: '10px 12px', 
                  borderRadius: '4px', fontSize: '0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {filteredActions.map(act => (
              <button key={act.id} style={btnStyle(activeBase?.id === act.id, '#10b981')} onClick={() => { setActiveBase(act); triggerUpdate(act, activeMood, intensity, activeTab === 'UTILITY'); }}>
                {act.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isHuman && (
        <div style={{ flex: "0 0 auto", display: 'flex', gap: '20px', background: '#0d0d0d', padding: '15px', paddingBottom: '40px', borderRadius: '4px', border: '1px solid #222' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>3. MOOD</span>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {MOODS.map(mood => (<button key={mood} style={btnStyle(activeMood === mood, '#f59e0b')} onClick={() => { setActiveMood(mood); triggerUpdate(activeBase, mood, intensity, activeTab === 'UTILITY'); }}>{mood}</button>))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>4. INTENSITY ({intensity})</span>
            <input type="range" min="1" max="10" value={intensity} onChange={(e) => { setIntensity(e.target.value); triggerUpdate(activeBase, activeMood, e.target.value, activeTab === 'UTILITY'); }} style={{ width: '100%', accentColor: '#f59e0b' }} />
          </div>
        </div>
      )}
    </div>
  );
}