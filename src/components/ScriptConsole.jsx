/* 
   POMPR-PRO COMPONENT: SCRIPT CONSOLE
   VERSION: V11.8 (MODEL-SPECIFIC UI LOGIC)
   DEPENDENCIES: ActionMatrix.jsx
   
   CHANGELOG:
   - Implemented conditional rendering for SREF/SEED fields.
   - Added Google Imagen 3 support.
   - Added visual feedback for disabled parameters.
*/

import React, { useState } from 'react';
import ActionMatrix from './ActionMatrix'; 

// --- EXPANDED AI MODEL LIST ---
const AI_MODELS = [
  { id: 'generic', label: 'Generic (SDXL/Flux)', suffix: '', hasParams: false },
  { id: 'mj7', label: 'Midjourney v7 (Alpha)', suffix: '--v 7 --style raw', hasParams: true },
  { id: 'mj61', label: 'Midjourney v6.1', suffix: '--v 6.1 --style raw', hasParams: true },
  { id: 'niji6', label: 'Niji Journey v6', suffix: '--niji 6', hasParams: true },
  { id: 'dalle3', label: 'DALL-E 3 / ChatGPT', suffix: '', hasParams: false },
  { id: 'google', label: 'Google Imagen 3', suffix: '', hasParams: false },
  { id: 'flux', label: 'Flux.1 (Replicate)', suffix: '', hasParams: false } 
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

  // Determine if current model supports parameters
  const selectedModel = AI_MODELS.find(m => m.id === (renderParams.id || 'generic')) || AI_MODELS[0];
  const showAdvanced = selectedModel.hasParams;

  // --- HANDLERS ---
  const toggleEditMode = () => {
    if (!isManual) {
      setManualText(fullDynamicString);
      setIsManual(true);
    } else {
      setIsManual(false);
    }
  };

  const handleModelChange = (e) => {
    const selectedId = e.target.value;
    const modelData = AI_MODELS.find(m => m.id === selectedId) || AI_MODELS[0];
    
    setRenderParams({
      ...renderParams,
      id: selectedId,
      suffix: modelData.suffix
    });

    // Clear params if switching to non-supported model
    if (!modelData.hasParams) {
      setSref("");
      setSeed("");
    }
  };

  const handleCopy = () => {
    const textToCopy = isManual ? manualText : fullDynamicString;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyFeedback("COPIED!");
      setTimeout(() => setCopyFeedback("COPY"), 2000);
    });
  };

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

  const renderColoredText = () => {
    if (!fullDynamicString) return <span style={{color:'#666', fontStyle:'italic'}}>Ready for input...</span>;

    return fullDynamicString.split('\n').map((line, idx) => {
      let color = '#ccc';
      if (line.startsWith('SCENE:') || line.startsWith('CINEMATOGRAPHY:')) color = '#3b82f6'; 
      else if (line.startsWith('SUBJECT:') || line.startsWith('ENSEMBLE:')) color = '#f59e0b'; 
      else if (line.startsWith('ACTION:')) color = '#10b981'; 
      else if (line.includes('--')) color = '#888'; 

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
    disabledBox: {
      padding: '1rem', border: '1px dashed #333', borderRadius: '4px',
      color: '#444', fontSize: '0.7rem', textAlign: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
    },
    deckC: {
      flex: '3', minHeight: '0', display: 'flex', flexDirection: 'column'
    },
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

        {/* RIGHT COLUMN: TECH (Sref / Seed) - CONDITIONALLY RENDERED */}
        <div style={styles.colRight}>
          {showAdvanced ? (
            <>
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
            </>
          ) : (
            <div style={styles.disabledBox}>
              Adv. Params Disabled<br/>for {selectedModel.label}
            </div>
          )}
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