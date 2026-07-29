// -------------------------------------------------------------------
// FILE: ActionMatrixV2.jsx | VERSION: 2.14.3 (FULL UI RESTORATION)
// -------------------------------------------------------------------
import React, { useState, useMemo, useEffect } from 'react';

const ACTION_TYPES = ['POSE', 'MOVE', 'EMOTE', 'BUSY', 'SOCIAL', 'POWR', 'CUSTOM', 'UTILITY'];
const MOODS = ['CALM', 'HAPPY', 'FOCUSED', 'FEARFUL', 'ANGRY', 'POWERFUL'];

const UTILITY_ACTIONS = [
  { id: 'U_ANGLE_GRID', type: 'UTILITY', name: 'ANGLE-GRID', text: '2x2 grid, identical environment, four different cinematic camera angles, 16:9 ratio' },
  { id: 'U_LIGHT_STUDY', type: 'UTILITY', name: 'LIGHT-STUDY', text: '2x2 grid, identical environment, four dramatic lighting variations (Dawn, Noon, Dusk, Night).' },
  { id: 'U_REF_HEAD', type: 'UTILITY', name: '3D-HEAD', text: '3-panel head reference sheet with front view, side profile, and rear view, consistent proportions, neutral expression.' },
  { id: 'U_REF_BODY', type: 'UTILITY', name: '3D-BODY', text: 'full body character reference sheet with front, side, three-quarter, and back views, identical scale, neutral upright stance.' },
  { id: 'U_ENHANCE_X', type: 'UTILITY', name: 'ENHANCE-X', text: 'render in full frame, enhance with natural detail and texture, 8k resolution' }
];

const MOOD_MODIFIERS = {
  'CALM': { low: 'with relaxed posture', med: 'with smooth motions', high: 'exuding absolute tranquility' },
  'HAPPY': { low: 'with a slight smile', med: 'with a warm smile', high: 'with a broad smile' },
  'FOCUSED': { low: 'with steady eyes', med: 'eyes locked on the task', high: 'with total hyper-fixation' },
  'FEARFUL': { low: 'with a cautious expression', med: 'with widened eyes', high: 'with urgent eyes' },
  'ANGRY': { low: 'with a restrained expression', med: 'clenched jaw', high: 'visually dominant frustration' },
  'POWERFUL': { low: 'with steady posture', med: 'with strong posture', high: 'visually dominant presence' }
};

const GUARDRAILS = { 
  still: "The core action, facial expression, and physical details remain clear in a cinematic, frozen still-frame.",
  video: "Motion remains fluid and continuous, maintaining strict temporal consistency and stable physical anatomy." 
};

const getActionType = (action) => {
  if (!action) return 'POSE';
  const t = action.type || "";
  const n = action.name || "";
  const c = action.category || "";
  if (action.isCustom || (c !== '' && c !== 'ACTION' && c !== 'UTILITY')) return 'CUSTOM';
  if (t === 'UTILITY' || c === 'UTILITY') return 'UTILITY';
  if (t === 'MOVE' || n.includes('MOVE') || n.includes('RUN')) return 'MOVE';
  if (t === 'EMOTE' || n.includes('GAZE')) return 'EMOTE';
  if (t === 'BUSY' || n.includes('TASK')) return 'BUSY';
  if (t === 'SOCIAL' || n.includes('GEST')) return 'SOCIAL';
  if (t === 'POWR' || n.includes('FIGHT')) return 'POWR';
  return 'POSE';
};

export default function ActionMatrixV2({ actions = [], onSelectAction, isHuman, activeAction }) {
  const [activeTab, setActiveTab] = useState('POSE');
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [activeMood, setActiveMood] = useState('HAPPY');
  const [intensity, setIntensity] = useState(5);
  const [mediaType, setMediaType] = useState('still'); 
  const [activeBase, setActiveBase] = useState(null);

  useEffect(() => {
    if (activeAction) {
      setActiveBase(activeAction);
      setActiveTab(getActionType(activeAction));
    }
  }, [activeAction]);

  const isUtilityMode = activeTab === 'UTILITY';

  const filteredActions = useMemo(() => {
    if (isUtilityMode) return UTILITY_ACTIONS;
    return actions.filter(a => (a.text || a.desc) && getActionType(a) === activeTab);
  }, [actions, activeTab, isUtilityMode]);

  const triggerUpdate = (baseObj, mood, ei, media, customVal, isCustomMode, isUtilMode) => {
    if (!onSelectAction) return;
    let compiled = "";
    if (isUtilMode && baseObj) {
      compiled = baseObj.text || baseObj.desc;
    } else {
      let baseText = isCustomMode ? customVal : (baseObj ? (baseObj.text || baseObj.desc) : "Standing still");
      let eiBand = ei <= 3 ? 'low' : ei >= 8 ? 'high' : 'med';
      compiled = isHuman ? `${baseText}, ${MOOD_MODIFIERS[mood][eiBand]} (${GUARDRAILS[media]})` : `${baseText} (${GUARDRAILS[media]})`;
    }
    onSelectAction({ id: baseObj?.id || 'custom', name: isCustomMode ? 'Custom' : baseObj?.name, desc: compiled, category: isUtilMode ? 'UTILITY' : 'ACTION' });
  };

  const handleMediaToggle = (type) => {
    setMediaType(type);
    triggerUpdate(activeBase, activeMood, intensity, type, customText, isCustomInput, isUtilityMode);
  };

  const styles = {
    wrapper: { backgroundColor: '#161616', color: '#fff', padding: '15px', borderTop: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflow: 'hidden' },
    headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #222', flexShrink: 0 },
    headerTitle: { color: '#10b981', margin: 0, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' },
    scrollZone: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
    btn: (active, color) => ({ padding: '6px 12px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: active ? color : '#222', color: '#fff', whiteSpace: 'nowrap' }),
    label: { fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', fontWeight: 'bold' },
    inputBox: { width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }
  };

  return (
    <div style={styles.wrapper}>
      {/* RESTORED HEADER BAR */}
      <div style={styles.headerBar}>
        <h2 style={styles.headerTitle}>ACTION MATRIX 2.0</h2>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button style={styles.btn(mediaType === 'still', '#8b5cf6')} onClick={() => handleMediaToggle('still')}>STILL</button>
          <button style={styles.btn(mediaType === 'video', '#8b5cf6')} onClick={() => handleMediaToggle('video')}>VIDEO</button>
        </div>
      </div>

      <div style={styles.scrollZone}>
        <div><span style={styles.label}>1. BASE ACTION CATEGORY</span>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px' }}>
            {ACTION_TYPES.map(tab => (<button key={tab} style={styles.btn(activeTab === tab, '#3b82f6')} onClick={() => { setActiveTab(tab); setIsCustomInput(false); }}>{tab}</button>))}
          </div>
        </div>

        <div><span style={styles.label}>2. WHAT IS THE SUBJECT PHYSICALLY DOING?</span>
          {!isUtilityMode && (
            <div style={{ marginBottom: '10px' }}>
              <button style={styles.btn(isCustomInput, '#f59e0b')} onClick={() => setIsCustomInput(!isCustomInput)}>
                {isCustomInput ? 'CANCEL CUSTOM' : '+ TYPE CUSTOM ACTION'}
              </button>
            </div>
          )}
          {isCustomInput ? (
            <input style={styles.inputBox} placeholder="e.g. dancing in the rain... (Press Enter)" value={customText} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') triggerUpdate(null, activeMood, intensity, mediaType, customText, true, false); }} autoFocus />
          ) : (
            <div style={styles.flexRow}>
              {filteredActions.map(act => (<button key={act.id} style={styles.btn(activeBase?.id === act.id, '#10b981')} onClick={() => { setActiveBase(act); triggerUpdate(act, activeMood, intensity, mediaType, customText, false, isUtilityMode); }}>{act.name}</button>))}
            </div>
          )}
        </div>

        {isHuman && !isUtilityMode && (
          <div style={{ display: 'flex', gap: '20px', background: '#0d0d0d', padding: '15px', borderRadius: '4px', border: '1px solid #222' }}>
            <div style={{ flex: 1 }}><span style={styles.label}>3. MOOD</span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {MOODS.map(mood => (<button key={mood} style={styles.btn(activeMood === mood, '#f59e0b')} onClick={() => { setActiveMood(mood); triggerUpdate(activeBase, mood, intensity, mediaType, customText, isCustomInput, isUtilityMode); }}>{mood}</button>))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.label}>4. INTENSITY ({intensity})</span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.55rem', color: '#444' }}><span>LOW</span><span>MED</span><span>HIGH</span></div>
              </div>
              <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} onMouseUp={(e) => triggerUpdate(activeBase, activeMood, Number(e.target.value), mediaType, customText, isCustomInput, isUtilityMode)} style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}