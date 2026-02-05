// -------------------------------------------------------------------
// FILE: src/components/ScriptConsole.jsx
// VERSION: 10.12 (Modularized)
// -------------------------------------------------------------------

import React, { useState } from 'react';

export default function ScriptConsole({
  isEditing,
  setIsEditing,
  isManual,
  setIsManual,
  manualText,
  setManualText,
  dynamicPrompt = {},
  fullDynamicString = '',
  actions = [],
  action = {},
  setAction,
  interactions = [],
  interaction,
  setInteraction,
  actor1,
  actor2,
  actor2Active,
  onRandomix,
  isRandomizing,
  seed,
  setSeed,
  sref,
  setSref,
  renderParams = { id: 'generic', prefix: '', suffix: '' },
  setRenderParams,
}) {
  const [copyStatus, setCopyStatus] = useState('COPY PROMPT');
  const [actionFilter, setActionFilter] = useState('ALL');

  const engineOptions = [
    { id: 'generic', label: 'Generic / None', prefix: '', suffix: '' },
    { id: 'mj61', label: 'Midjourney v6.1', prefix: '/imagine prompt:', suffix: ' --v 6.1 --style raw' },
    { id: 'mj7', label: 'Midjourney v7.0', prefix: '/imagine prompt:', suffix: ' --v 7.0' },
    { id: 'niji6', label: 'Niji Journey 6', prefix: '/imagine prompt:', suffix: ' --niji 6' },
    { id: 'dalle3', label: 'DALL-E 3', prefix: 'Photo of', suffix: '' },
    { id: 'flux', label: 'Flux.1 Pro', prefix: '', suffix: ', hyper-realistic, 8k, uhd, highly detailed' },
    { id: 'runway', label: 'Runway Gen-3', prefix: '', suffix: ' --motion 5' },
    { id: 'luma', label: 'Luma Dream Machine', prefix: '', suffix: ' --video_quality high' },
  ];

  const safeActions = Array.isArray(actions) ? actions : [];
  const filteredActions = actionFilter === 'ALL'
      ? safeActions
      : safeActions.filter((a) => a.type === actionFilter);

  // --- HANDLERS ---

  const handleEngineChange = (e) => {
    const selectedId = e.target.value;
    const engine = engineOptions.find((opt) => opt.id === selectedId);
    if (engine)
      setRenderParams({
        id: engine.id,
        prefix: engine.prefix,
        suffix: engine.suffix,
      });
  };

  const handleToggleEdit = () => {
    if (!isEditing)
      isManual ? setIsManual(true) : setManualText(fullDynamicString);
    else setIsManual(true);
    setIsEditing(!isEditing);
  };

  const cleanTextForClipboard = (rawText) => {
    if (!rawText) return '';
    let clean = rawText;
    if (renderParams.prefix) clean = clean.split(renderParams.prefix).join('');
    clean = clean.replace(/\/imagine\s+prompt:/gi, '').replace(/\/imagine/gi, '');
    clean = clean.replace(/ACTION:\s*\(\)\.?/gi, '');
    ['SUBJECT:', 'ENSEMBLE:', 'ACTION:', 'SCENE:', 'CINEMATOGRAPHY:'].forEach(
      (l) => (clean = clean.split(l).join(' '))
    );
    return clean.replace(/\s+/g, ' ').trim();
  };

  const handleCopy = async () => {
    const rawSource = isManual || isEditing ? manualText : fullDynamicString;
    const textToCopy = cleanTextForClipboard(rawSource);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus('COPIED!');
    } catch (err) {
      setCopyStatus('ERROR');
    }
    setTimeout(() => setCopyStatus('COPY PROMPT'), 2000);
  };

  // --- NEW: SAVE FILE HANDLER ---
  const handleSave = () => {
    const rawSource = isManual || isEditing ? manualText : fullDynamicString;
    const textToSave = cleanTextForClipboard(rawSource);
    
    // Create Blob
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `pompr_script_${Date.now()}.txt`;
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
  };

  // --- COMPONENTS ---

  const FilterBtn = ({ label, code, color }) => (
    <button
      onClick={() => setActionFilter(code)}
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        border: actionFilter === code ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
        background: actionFilter === code ? color : 'rgba(255,255,255,0.05)',
        color: actionFilter === code ? 'white' : '#64748b',
        fontSize: '10px',
        fontWeight: '900',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  const badgeStyle = {
    display: 'inline-block',
    fontSize: '0.6em',
    fontWeight: '900',
    color: '#00C6FF',
    background: 'rgba(0, 198, 255, 0.15)',
    marginLeft: '8px',
    padding: '2px 5px',
    borderRadius: '4px',
    border: '1px solid rgba(0, 198, 255, 0.3)',
    verticalAlign: 'middle',
    letterSpacing: '0.5px',
    fontStyle: 'normal',
  };

  return (
    <section
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(24px)',
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: '30px 30px 10px 30px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ color: '#00C6FF', fontSize: '12px', fontWeight: '900', letterSpacing: '1px', margin: 0 }}>
          THE SCRIPT
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isManual && !isEditing && (
            <button
              onClick={() => setIsManual(false)}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid #fbbf24',
                padding: '6px 12px',
                fontSize: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              REVERT
            </button>
          )}
          <button
            onClick={handleToggleEdit}
            style={{
              background: isEditing ? '#f59e0b' : 'rgba(255,255,255,0.05)',
              color: 'white',
              border: 'none',
              padding: '6px 18px',
              fontSize: '10px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {isEditing ? 'LOCK' : 'EDIT'}
          </button>
        </div>
      </div>

      {/* DISPLAY */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 30px 20px 30px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isEditing ? (
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                background: 'transparent',
                color: '#fbbf24',
                border: 'none',
                outline: 'none',
                fontSize: '18px',
                lineHeight: '1.6',
                fontStyle: 'italic',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <div style={{ lineHeight: '1.6', fontSize: '18px', fontWeight: '500' }}>
              {isManual ? (
                <span style={{ color: 'white', whiteSpace: 'pre-wrap' }}>{manualText}</span>
              ) : (
                <>
                  {renderParams.prefix && (
                    <span style={{ color: '#d946ef', fontWeight: 'bold', marginRight: '8px' }}>
                      {renderParams.prefix}
                    </span>
                  )}

                  {dynamicPrompt.subject && (
                    <>
                      <span style={{ color: '#fbbf24' }}>
                        {dynamicPrompt.subject}
                        {actor1?.category && <span style={badgeStyle}>{actor1.category}</span>}
                      </span>

                      {(actor2Active || actor2) && dynamicPrompt.ensemble && (
                        <span style={{ color: '#fbbf24' }}>
                          {dynamicPrompt.ensemble}
                          {actor2?.category && <span style={badgeStyle}>{actor2.category}</span>}
                        </span>
                      )}
                      <br />

                      {action?.id !== 'NONE' && dynamicPrompt.action && (
                        <>
                          <span style={{ color: '#10b981' }}>{dynamicPrompt.action}</span>
                          <br />
                        </>
                      )}
                    </>
                  )}

                  <span style={{ color: '#3b82f6' }}>{dynamicPrompt.scene}</span>
                  <br />
                  <span style={{ color: '#94a3b8' }}>{dynamicPrompt.cine}</span>

                  <span style={{ color: '#d946ef', fontWeight: 'bold', display: 'block', marginTop: '10px', fontSize: '14px' }}>
                    {dynamicPrompt.commercialTail}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          flexShrink: 0,
          padding: '20px 30px 30px 30px',
          background: 'rgba(10, 10, 10, 0.9)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 2 }}>
            <h3 style={{ fontSize: '10px', color: '#666', marginBottom: '6px', fontWeight: '900' }}>
              RENDER ENGINE
            </h3>
            <select
              value={renderParams.id}
              onChange={handleEngineChange}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {engineOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '10px', color: '#666', marginBottom: '6px', fontWeight: '900' }}>SREF</h3>
            <input
              placeholder="Code"
              value={sref}
              onChange={(e) => setSref(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '10px', color: '#666', marginBottom: '6px', fontWeight: '900' }}>SEED</h3>
            <input
              placeholder="Random"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '10px', color: '#10b981', fontWeight: '900', margin: 0 }}>CHOREOGRAPHY</h3>
              <div style={{ display: 'flex', gap: '5px' }}>
                <FilterBtn label="ALL" code="ALL" color="#10b981" />
                <FilterBtn label="S" code="S" color="#10b981" />
                <FilterBtn label="V" code="V" color="#00C6FF" />
                <FilterBtn label="U" code="U" color="#f59e0b" />
                <FilterBtn label="C" code="C" color="#ef4444" />
              </div>
            </div>
            <select
              value={action?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setAction({ id: 'NONE', type: 'NONE', name: '', desc: '' });
                } else {
                  setAction(safeActions.find((a) => a.id === val));
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <option value="">(No Action / None)</option>
              {filteredActions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} [{a.type}]
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '10px', color: '#10b981', marginBottom: '6px', fontWeight: '900' }}>
              INTERACTION
            </h3>
            <select
              value={interaction || ''}
              onChange={(e) => setInteraction(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {Array.isArray(interactions) &&
                interactions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* --- BUTTON ROW (3 COLUMNS) --- */}
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* 1. COPY */}
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#000',
              border: 'none',
              padding: '16px',
              fontWeight: '900',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(255,255,255,0.1)',
            }}
          >
            {copyStatus}
          </button>

          {/* 2. SAVE (New Feature) */}
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              background: 'rgba(34, 211, 238, 0.1)', // #22d3ee at 10%
              color: '#22d3ee',
              border: '1px solid #22d3ee',
              padding: '16px',
              fontWeight: '900',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(34, 211, 238, 0.1)',
              transition: 'all 0.2s',
            }}
          >
            SAVE SCRIPT
          </button>

          {/* 3. RANDOMIX */}
          <button
            onClick={onRandomix}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '16px',
              fontWeight: '900',
              borderRadius: '6px',
              cursor: 'pointer',
              letterSpacing: '2px',
              fontSize: '13px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              transform: isRandomizing ? 'scale(0.98)' : 'scale(1)',
            }}
          >
            RANDOMIX
          </button>
        </div>
      </div>
    </section>
  );
}