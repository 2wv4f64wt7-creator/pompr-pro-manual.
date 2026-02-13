/* 
   POMPR-PRO COMPONENT: SCRIPT CONSOLE
   VERSION: V11.7 (REFINED DIRECTOR DECK)
   DEPENDENCIES: ActionMatrix.jsx
   
   CHANGELOG:
   - Fixed: Edit Mode now inherits current text (doesn't wipe it).
   - Fixed: Expanded AI Model list with auto-suffix injection (--v 6.1, etc).
   - Layout: Swapped Tech Specs (Right) and Director Tools (Left).
   - UI: Restored full interactivity.
*/

import React, { useState } from 'react';
import ActionMatrix from './ActionMatrix'; 

// --- EXPANDED AI MODEL LIST ---
const AI_MODELS = [
  { id: 'generic', label: 'Generic (SDXL/Flux)', suffix: '' },
  { id: 'mj7', label: 'Midjourney v7', suffix: '--v 7 --style raw' },
  { id: 'mj61', label: 'Midjourney v6.1', suffix: '--v 6.1 --style raw' },
  { id: 'mj6', label: 'Midjourney v6.0', suffix: '--v 6.0 --style raw' },
  { id: 'niji6', label: 'Niji Journey v6', suffix: '--niji 6' },
  { id: 'dalle3', label: 'DALL-E 3', suffix: '' },
  { id: 'seed', label: 'SeaArt / CivitAI', suffix: '' }
];

const ScriptConsole = (props) => {
  // --- DATA UNPACKING ---
  const {
    isManual, setIsManual, manualText, setManualText,
    fullDynamicString,
    seed, setSeed,
    sref, setSref,
    renderParams, setRenderParams,
    interaction, setInteraction, interactions = [],
    onRandomix, setAction, actions = []
  } = props;

  // --- STATE ---
  const [copyFeedback, setCopyFeedback] = useState("COPY");

  // --- HANDLERS ---

  // 1. SYNC TEXT ON EDIT
  const toggleEditMode = () => {
    if (!isManual) {
      // If turning ON manual mode, grab the current auto-text first
      setManualText(fullDynamicString);
      setIsManual(true);
    } else {
      // If turning OFF, just toggle (App.jsx handles the switch back to auto)
      setIsManual(false);
    }
  };

  // 2. MODEL SELECTOR (INJECT SUFFIX)
  const handleModelChange = (e) => {
    const selectedId = e.target.value;
    const modelData = AI_MODELS.find(m => m.id === selectedId) || AI_MODELS[0];
    
    // Update both ID (for logic) and Suffix (for text generation)
    setRenderParams({
      ...renderParams,
      id: selectedId,
      suffix: modelData.suffix
    });
  };

  // 3. COPY LOGIC
  const handleCopy = () => {
    const textToCopy = isManual ? manualText : fullDynamicString;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyFeedback("COPIED!");
      setTimeout(() => setCopyFeedback("COPY"), 2000);
    });
  };

  // 4. SAVE LOGIC
  const handleSave = () => {
    const textToSave = isManual ? manualText : fullDynamicString;
    if (!textToSave) return;
    const element = document.createElement("a");
    const file = new Blob([textToSave], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `POMPR_SCRIPT_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- RENDER HELPERS ---
  const renderColoredText = () => {
    if (!fullDynamicString) return <span style={{color:'#666', fontStyle:'italic'}}>Ready for input...</span>;

    return fullDynamicString.split('\n').map((line, idx) => {
      let color = '#ccc';
      if (line.startsWith('SCENE:') || line.startsWith('CINEMATOGRAPHY:')) color = '#3b82f6'; // Blue
      else if (line.startsWith('SUBJECT:') || line.startsWith('ENSEMBLE:')) color = '#f59e0b'; // Orange
      else if (line.startsWith('ACTION:')) color = '#10b981'; // Green
      else if (line.includes('--')) color = '#888'; // Tech Params

      return (
        <div key={idx} style={{ color, marginBottom: '4px', lineHeight: '1.4' }}>
          {line}
        </div>
      );
    });
  };

  // --- STYLES ---
  const styles = {
    container: {
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: '#0a0a0a', color: '#fff', borderLeft: '1px solid #333'
    },
    
    // --- DECK A: OUTPUT WINDOW (Flex 4) ---
    deckA: {
      flex: '4', display: 'flex', flexDirection: 'column', padding: '1rem',
      gap: '0.5rem', borderBottom: '1px solid #333', overflow: 'hidden'
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '0.8rem', color: '#888', letterSpacing: '1px', fontWeight: 'bold'
    },
    editBtn: {
      background: isManual ? '#b91c1c' : '#333',
      color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px',
      fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
    },
    displayBox: {
      flex: '1', backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px',
      padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', overflowY: 'auto',
      whiteSpace: 'pre-wrap'
    },
    manualArea: {
      flex: '1', backgroundColor: '#1a1a1a', border: '1px solid #b91c1c', borderRadius: '4px',
      padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', color: '#fff',
      resize: 'none', outline: 'none'
    },

    // --- DECK B: CONTROL PANEL (Fixed Height) ---
    deckB: {
      flex: '0 0 auto', padding: '0.75rem', backgroundColor: '#111',
      borderBottom: '1px solid #333', display: 'flex', gap: '1rem'
    },
    colLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    colRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '0.65rem', color: '#666', marginBottom: '3px', textTransform:'uppercase' },
    select: {
      background: '#222', border: '1px solid #444', color: '#fff', padding: '6px',
      borderRadius: '4px', fontSize: '0.75rem', outline: 'none'
    },
    input: {
      background: '#222', border: '1px solid #444', color: '#fff', padding: '6px',
      borderRadius: '4px', fontSize: '0.75rem', outline: 'none', width: '100%'
    },

    // --- DECK C: ACTION MATRIX (Flex 3) ---
    deckC: {
      flex: '3', minHeight: '0', display: 'flex', flexDirection: 'column'
    },

    // --- FOOTER CONTROLS ---
    btnGroup: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
    btn: {
      flex: 1, padding: '8px', border: '1px solid #444', borderRadius: '4px',
      background: '#222', color: '#fff', cursor: 'pointer', fontSize: '0.75rem',
      fontWeight: 'bold', textTransform: 'uppercase', transition: 'background 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* === DECK A: OUTPUT === */}
      <div style={styles.deckA}>
        <div style={styles.header}>
          <span>DIRECTOR'S LOG</span>
          <button style={styles.editBtn} onClick={toggleEditMode}>
            {isManual ? "UNLOCK: MANUAL" : "LOCKED: AUTO"}
          </button>
        </div>

        {isManual ? (
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            style={styles.manualArea}
            placeholder="Type custom prompt..."
          />
        ) : (
          <div style={styles.displayBox}>
            {renderColoredText()}
          </div>
        )}

        <div style={styles.btnGroup}>
          <button style={styles.btn} onClick={handleCopy}>{copyFeedback}</button>
          <button style={{...styles.btn, background:'#064e3b', borderColor:'#047857'}} onClick={handleSave}>SAVE .TXT</button>
          <button style={{...styles.btn, background:'#312e81', borderColor:'#3730a3'}} onClick={onRandomix}>RANDOMIX</button>
        </div>
      </div>

      {/* === DECK B: CONTROLS === */}
      <div style={styles.deckB}>
        
        {/* LEFT COLUMN: LOGIC (Model / Interaction) */}
        <div style={styles.colLeft}>
          <div style={styles.inputGroup}>
            <span style={styles.label}>AI Model Base</span>
            <select 
              style={styles.select} 
              value={renderParams.id || 'generic'} 
              onChange={handleModelChange}
            >
              {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <span style={styles.label}>Ensemble Action</span>
            <select 
              style={styles.select} 
              value={interaction || ""} 
              onChange={(e) => setInteraction(e.target.value)}
            >
              {interactions.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN: TECH (Sref / Seed) */}
        <div style={styles.colRight}>
          <div style={styles.inputGroup}>
            <span style={styles.label}>Style Ref (--sref)</span>
            <input 
              style={styles.input} 
              placeholder="URL or Code" 
              value={sref} 
              onChange={(e) => setSref(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <span style={styles.label}>Seed ID (--seed)</span>
            <input 
              style={styles.input} 
              placeholder="Randomize..." 
              value={seed} 
              onChange={(e) => setSeed(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* === DECK C: INTENSITY MATRIX === */}
      <div style={styles.deckC}>
        <ActionMatrix 
          actions={actions} 
          onSelectAction={setAction} 
        />
      </div>

    </div>
  );
};

export default ScriptConsole;