// -------------------------------------------------------------------
// FILE: ScriptConsole.jsx | VERSION: 10.23 (RESIZE HANDLE FIX)
// -------------------------------------------------------------------
import React, { useState } from 'react';
import ActionMatrixV2 from './ActionMatrixV2';

export default function ScriptConsole({
  isManual, setIsManual, manualText, setManualText,
  dynamicPrompt = {}, actions = [], action = {}, setAction,
  interactions = [], interaction, setInteraction,
  actor1, actor2, engine1, onRandomix, onClearStage, seed, setSeed,
  viewMode, setViewMode, isStageFlipped, setIsStageFlipped, povMode, setPovMode, onSelectUtility,
  motionMode, setMotionMode
}) {
  const [copyStatus, setCopyStatus] = useState('COPY');

  const handleCopy = async () => {
    const text = isManual ? manualText : Object.values(dynamicPrompt).filter(Boolean).join('').trim();
    await navigator.clipboard.writeText(text);
    setCopyStatus('COPIED!');
    setTimeout(() => setCopyStatus('COPY'), 2000);
  };

  const handleExport = () => {
    const text = isManual ? manualText : Object.values(dynamicPrompt).filter(Boolean).join('').trim();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POMPR_SCRIPT_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const btnStyle = (active, color = '#3b82f6') => ({
    background: active ? color : '#1a1a1a',
    color: active ? '#fff' : '#666',
    border: 'none', padding: '6px 12px', fontSize: '9px', fontWeight: '900', borderRadius: '3px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#080808', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', borderBottom: '1px solid #111' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['SHORT', 'MEDIUM', 'FULL'].map(m => (<button key={m} onClick={() => setViewMode(m)} style={btnStyle(viewMode === m)}>{m}</button>))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMotionMode('STILL')} style={btnStyle(motionMode === 'STILL', '#10b981')}>STILL</button>
          <button onClick={() => setMotionMode('VIDEO')} style={btnStyle(motionMode === 'VIDEO', '#10b981')}>VIDEO</button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => actor2 && setIsStageFlipped(!isStageFlipped)} style={{...btnStyle(isStageFlipped), color: actor2 ? '#fff' : '#444'}}>STAGE FLIP</button>
          <button onClick={() => actor2 && setPovMode((povMode + 1) % 3)} style={{...btnStyle(povMode > 0), color: actor2 ? '#fff' : '#444'}}>
            {povMode === 0 ? 'POV OFF' : povMode === 1 ? 'POV: SHOT 01' : 'POV: SHOT 02'}
          </button>
        </div>
        <button onClick={() => setIsManual(!isManual)} style={{ ...btnStyle(true, isManual ? '#b91c1c' : '#f59e0b'), color: '#fff' }}>{isManual ? 'MANUAL MODE' : 'AUTO MODE'}</button>
      </div>

      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ 
          background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '30px', 
          flex: 1, position: 'relative', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)', overflow: 'visible',
          display: 'flex', flexDirection: 'column' // FIX: Allows the textarea to utilize flex properties properly
        }}>
          {isManual ? (
            <textarea 
              value={manualText} 
              onChange={(e) => setManualText(e.target.value)} 
              style={{ 
                width: '100%', flex: 1, minHeight: '180px', background: 'transparent', border: 'none', // FIX: Replaced height: 100% with flex: 1
                color: '#fff', outline: 'none', fontSize: '16px', fontFamily: 'monospace', 
                resize: 'vertical', overflow: 'auto' 
              }} 
            />
          ) : (
            <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#d4d4d4', fontFamily: 'monospace' }}>
              <span style={{ color: '#f59e0b' }}>{dynamicPrompt.subject}</span><span style={{ color: '#f59e0b' }}>{dynamicPrompt.ensemble}</span><span style={{ color: '#10b981' }}>{dynamicPrompt.action}</span><span style={{ color: '#3b82f6' }}>{dynamicPrompt.scene}</span><span style={{ color: '#666' }}>{dynamicPrompt.cine}</span><span style={{ color: '#8b5cf6' }}>{dynamicPrompt.style}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleCopy} style={{ flex: 1, padding: '14px', borderRadius: '4px', border: 'none', fontWeight: '900', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize:'11px' }}>{copyStatus}</button>
          <button onClick={handleExport} style={{ flex: 1, padding: '14px', borderRadius: '4px', background: '#1a1a1a', color: '#fff', border: '1px solid #333', fontWeight: '900', fontSize:'11px', cursor: 'pointer' }}>EXPORT .TXT</button>
          <button onClick={onRandomix} style={{ flex: 1, padding: '14px', borderRadius: '4px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: '900', fontSize:'11px', cursor: 'pointer' }}>RANDOMIX</button>
          <button onClick={onClearStage} style={{ flex: 1, padding: '14px', borderRadius: '4px', background: '#b91c1c', color: '#fff', border: 'none', fontWeight: '900', fontSize:'11px', cursor: 'pointer' }}>CLEAR STAGE</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#444', fontWeight: '900', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>INTERACTION</label>
            <select value={interaction} onChange={(e) => setInteraction(e.target.value)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #222', padding: '10px', borderRadius: '4px', fontSize: '11px' }}>
              {interactions.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '900', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>SREF / TECH PARAMS</label>
            <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="--cref URL" style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #222', padding: '10px', borderRadius: '4px', fontSize: '11px' }} />
          </div>
        </div>
      </div>

      <div style={{ height: '320px', borderTop: '1px solid #111', flexShrink: 0 }}>
        <ActionMatrixV2 actions={actions} activeAction={action} onSelectAction={setAction} onSelectUtility={onSelectUtility} isHuman={engine1.isHuman} motionMode={motionMode} />
      </div>
    </div>
  );
}