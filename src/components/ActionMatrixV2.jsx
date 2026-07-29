// -------------------------------------------------------------------
// FILE: ActionMatrixV2.jsx | VERSION: 2.13 (SPACE-SAVING FOOTER)
// -------------------------------------------------------------------
import React, { useState, useMemo } from 'react';

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
  'CALM': { low: 'with relaxed posture, a neutral expression, and soft attention.', med: 'with smooth, unhurried motions, calm eyes, and deeply settled shoulders.', high: 'exuding absolute tranquility, slow controlled breathing, and a deeply peaceful gaze.' },
  'HAPPY': { low: 'with a slight smile, relaxed shoulders, and pleasant anticipation.', med: 'with a warm smile, bright eyes, open posture, and visible enjoyment.', high: 'with a broad smile, lifted cheeks, animated eyes, and joyful, energetic body language.' },
  'FOCUSED': { low: 'with steady eyes and a quiet, attentive posture.', med: 'leaning slightly forward, eyes locked on the task, expression alert and controlled.', high: 'with intense, unwavering eye contact, rigid posture, and total hyper-fixation.' },
  'FEARFUL': { low: 'with a cautious expression, slight tension in shoulders, and alert eyes.', med: 'with widened eyes, raised shoulders, tense hands, and a defensive, nervous gaze.', high: 'with urgent eyes, tight grip, strained face, tense arms, and strong visual stress.' },
  'ANGRY': { low: 'with a restrained expression, tight jaw, and slight physical tension.', med: 'with tense shoulders, sharp eyes, clenched jaw, and rigid, defensive movements.', high: 'with a strained face, furious grip, expanded chest, and visually dominant frustration.' },
  'POWERFUL': { low: 'with steady posture, calm confidence, grounded stance, and a direct gaze.', med: 'with strong posture, lifted chin, firm hands, controlled expression, and clear authority.', high: 'with a commanding stance, intense gaze, expanded silhouette, and a visually dominant presence.' }
};

const GUARDRAILS = {
  still: "The core action, facial expression, and physical details remain clear in a cinematic, frozen still-frame without excessive motion blur.",
  video: "Motion remains fluid and continuous, maintaining strict temporal consistency and stable physical anatomy throughout the sequence."
};

const doesActionMatchTab = (action, activeTab) => {
  const t = action.type || "";
  const n = action.name || "";
  const c = action.category || "";
  if (activeTab === 'CUSTOM') return action.isCustom || (c !== '' && c !== 'ACTION' && c !== 'UTILITY');
  if (activeTab === 'POSE') return t === 'POSE' || t === 'S' || n.includes('POSE');
  if (activeTab === 'MOVE') return t === 'MOVE' || t === 'V' || n.includes('MOVE') || n.includes('RUN');
  if (activeTab === 'EMOTE') return t === 'EMOTE' || n.includes('GAZE') || n.includes('REACT');
  if (activeTab === 'BUSY') return t === 'BUSY' || t === 'U' || n.includes('TASK');
  if (activeTab === 'SOCIAL') return t === 'SOCIAL' || n.includes('COMMS') || n.includes('GEST');
  if (activeTab === 'POWR') return t === 'POWR' || t === 'C' || n.includes('FIGHT');
  return false;
};

export default function ActionMatrixV2({ actions = [], onSelectAction, isHuman }) {
  const [activeTab, setActiveTab] = useState('POSE');
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [activeMood, setActiveMood] = useState('HAPPY');
  const [intensity, setIntensity] = useState(5);
  const [mediaType, setMediaType] = useState('still'); 
  const [activeBase, setActiveBase] = useState(null);

  const isUtilityMode = activeTab === 'UTILITY';

  const filteredActions = useMemo(() => {
    if (isUtilityMode) return UTILITY_ACTIONS;
    const uniqueActions = Array.from(new Map(actions.map(item => [item.id, item])).values());
    return uniqueActions.filter(a => (a.text || a.desc) && doesActionMatchTab(a, activeTab));
  }, [actions, activeTab, isUtilityMode]);

  const triggerUpdate = (baseObj, mood, ei, media, customVal, isCustomMode, isUtilMode) => {
    if (!onSelectAction) return;
    let compiledText = "";
    if (isUtilMode && baseObj) {
      compiledText = baseObj.text || baseObj.desc;
    } else {
      let rawBaseText = isCustomMode && customVal.trim() !== "" ? `[SUBJECT] ${customVal}` : (baseObj ? (baseObj.text || baseObj.desc || "") : "");
      let baseText = rawBaseText.replace(/\[SUBJECT\]\s*/g, '');
      if (baseText) baseText = baseText.charAt(0).toUpperCase() + baseText.slice(1);
      const guardrailText = GUARDRAILS[media];
      if (isHuman) {
        let eiBand = 'med';
        if (ei <= 3) eiBand = 'low';
        if (ei >= 8) eiBand = 'high';
        const moodText = MOOD_MODIFIERS[mood][eiBand];
        compiledText = `${baseText}, ${moodText} ${guardrailText}`;
      } else {
        compiledText = `${baseText}. ${guardrailText}`;
      }
    }
    onSelectAction({
      id: isCustomMode ? 'USER_CUSTOM_ACT' : (baseObj ? baseObj.id : 'NO_ID'),
      name: isUtilMode ? (baseObj ? baseObj.name : "") : (isHuman ? `${mood} Action` : "Neutral Action"),
      desc: compiledText,
      category: isUtilMode ? 'UTILITY' : 'ACTION',
      intensity: ei
    });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsCustomInput(false);
    const newFiltered = tab === 'UTILITY' ? UTILITY_ACTIONS : actions.filter(a => doesActionMatchTab(a, tab) && (a.text || a.desc));
    if (newFiltered.length > 0) {
      setActiveBase(newFiltered[0]);
      triggerUpdate(newFiltered[0], activeMood, intensity, mediaType, customText, false, tab === 'UTILITY');
    }
  };

  const handleBaseClick = (act) => {
    setActiveBase(act);
    triggerUpdate(act, activeMood, intensity, mediaType, customText, isCustomInput, isUtilityMode);
  };

  const handleMoodClick = (mood) => {
    setActiveMood(mood);
    triggerUpdate(activeBase, mood, intensity, mediaType, customText, isCustomInput, isUtilityMode);
  };

  const handleSliderRelease = (e) => {
    const val = Number(e.target.value);
    setIntensity(val);
    triggerUpdate(activeBase, activeMood, val, mediaType, customText, isCustomInput, isUtilityMode);
  };

  const handleMediaClick = (media) => {
    setMediaType(media);
    triggerUpdate(activeBase, activeMood, intensity, media, customText, isCustomInput, isUtilityMode);
  };

  const styles = {
    wrapper: { backgroundColor: '#161616', color: '#fff', padding: '15px', borderTop: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', boxSizing: 'border-box', overflow: 'hidden' },
    headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#0d0d0d', borderBottom: '1px solid #222', flexShrink: 0 },
    headerTitle: { color: '#10b981', margin: 0, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' },
    scrollZone: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' },
    fixedFooter: { flexShrink: 0, backgroundColor: '#0d0d0d', borderTop: '1px solid #222', padding: '15px 15px 35px 15px', display: 'flex', gap: '30px', transition: '0.3s' },
    label: { fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', fontWeight: 'bold' },
    flexRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    scrollRow: { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', whiteSpace: 'nowrap' },
    btn: (active, color) => ({ padding: '6px 12px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: active ? color : '#222', color: active ? '#fff' : '#aaa', transition: '0.2s', whiteSpace: 'nowrap' }),
    inputBox: { width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' },
    slider: { width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerBar}>
        <h2 style={styles.headerTitle}>ACTION MATRIX 2.0</h2>
        <div style={{display: 'flex', gap: '4px'}}>
          <button style={styles.btn(mediaType === 'still', '#8b5cf6')} onClick={() => handleMediaClick('still')}>STILL</button>
          <button style={styles.btn(mediaType === 'video', '#8b5cf6')} onClick={() => handleMediaClick('video')}>VIDEO</button>
        </div>
      </div>

      <div style={styles.scrollZone}>
        <div>
          <span style={styles.label}>1. BASE ACTION CATEGORY</span>
          <div style={styles.scrollRow}>
            {ACTION_TYPES.map(tab => (
              <button key={tab} style={styles.btn(activeTab === tab, tab === 'UTILITY' ? '#10b981' : '#3b82f6')} onClick={() => handleTabClick(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span style={styles.label}>2. WHAT IS THE SUBJECT PHYSICALLY DOING?</span>
          {!isUtilityMode && (
            <div style={{ marginBottom: '10px' }}>
              <button style={styles.btn(isCustomInput, '#f59e0b')} onClick={() => setIsCustomInput(!isCustomInput)}>
                {isCustomInput ? 'CANCEL CUSTOM' : '+ TYPE CUSTOM ACTION'}
              </button>
            </div>
          )}
          {isCustomInput ? (
            <input 
              style={styles.inputBox} placeholder="e.g. splashing into red wine... (Press Enter)" value={customText} 
              onChange={(e) => setCustomText(e.target.value)} onBlur={() => triggerUpdate(activeBase, activeMood, intensity, mediaType, customText, true, false)} onKeyDown={(e) => { if (e.key === 'Enter') triggerUpdate(activeBase, activeMood, intensity, mediaType, customText, true, false); }} autoFocus 
            />
          ) : (
            <div style={styles.flexRow}>
              {filteredActions.length > 0 ? filteredActions.map(act => (
                <button key={act.id} style={styles.btn(activeBase?.id === act.id, '#10b981')} onClick={() => handleBaseClick(act)}>{act.name}</button>
              )) : <span style={{color: '#555', fontSize: '0.7rem'}}>No actions found.</span>}
            </div>
          )}
        </div>
      </div>

      {isHuman && !isUtilityMode && (
        <div style={{ ...styles.fixedFooter, display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          <div style={{ flex: 0.5 }}>
            <span style={styles.label}>3. MOOD</span>
            <div style={styles.scrollRow}>
              {MOODS.map(mood => (
                <button key={mood} style={styles.btn(activeMood === mood, '#f59e0b')} onClick={() => handleMoodClick(mood)}>{mood}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ ...styles.label, marginBottom: 0 }}>4. INTENSITY (EI: {intensity})</span>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.55rem', color: '#444', fontWeight: 'bold' }}>
                <span>LOW</span><span>MED</span><span>HIGH</span>
              </div>
            </div>
            <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} onMouseUp={handleSliderRelease} onTouchEnd={handleSliderRelease} style={{ ...styles.slider, marginTop: '8px' }} />
          </div>
        </div>
      )}

      {!isHuman && !isUtilityMode && (
        <div style={{ padding: '10px', backgroundColor: '#0d0d0d', borderTop: '1px solid #222', textAlign: 'center' }}>
          <span style={{ color: '#8b5cf6', fontSize: '0.55rem', fontWeight: '900', letterSpacing: '1.5px' }}>NON-HUMAN MODE: EMOTIVE PARAMETERS SILENCED</span>
        </div>
      )}
    </div>
  );
}