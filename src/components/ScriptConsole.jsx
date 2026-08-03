// -------------------------------------------------------------------
// FILE: ScriptConsole.jsx | VERSION: 10.34 (iOS COPY HANDLER FIX)
// -------------------------------------------------------------------
import React, { useState, useRef } from 'react';
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
  const [consoleHeight, setConsoleHeight] = useState(160); 
  const isResizing = useRef(false);

  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleResizeAction);
    document.addEventListener('mouseup', stopResizing);
    document.addEventListener('touchmove', handleResizeAction, { passive: false });
    document.addEventListener('touchend', stopResizing);
  };

  const handleResizeAction = (e) => {
    if (!isResizing.current) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const container = document.getElementById('script-console-container');
    if (container) {
      const newHeight = clientY - container.getBoundingClientRect().top;
      if (newHeight > 120 && newHeight < 600) {
        setConsoleHeight(newHeight);
      }
    }
    if (e.touches) e.preventDefault();
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResizeAction);
    document.removeEventListener('mouseup', stopResizing);
    document.removeEventListener('touchmove', handleResizeAction);
    document.removeEventListener('touchend', stopResizing);
  };

  // FIX: Restored iOS/Mobile specific Copy Handler to prevent URL encoding issues
  const handleCopy = async () => {
    const text = isManual ? manualText : Object.values(dynamicPrompt).filter(Boolean).join('').trim();
    
    try {
      // Check for Web Share API support and if the user is likely on a mobile/tablet device
      if (navigator.share && (window.innerWidth < 1024 || /iPad|iPhone|iPod/.test(navigator.userAgent))) {
        await navigator.share({ text: text });
        setCopyStatus('SHARED!');
      } else {
        await navigator.clipboard.writeText(text);
        setCopyStatus('COPIED!');
      }
    } catch (err) {
      // Fallback for when Web Share API is dismissed or fails
      await navigator.clipboard.writeText(text).catch(e => console.error("Clipboard fallback failed", e));
      setCopyStatus('COPIED!');
    }
    
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

  const btnStyle = (active, activeColor = '#3b82f6') => ({
    background: active ? activeColor : '#1a1a1a',
    color: active ? '#fff' : '#666',
    border: 'none', padding: '6px 12px', fontSize: '9px', fontWeight: '900', borderRadius: '3px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif'
  });

  return (
    <div id="script-console-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#080808', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      <style>{`
        .handle-manual {
          position: absolute; bottom: 0; right: 0; width: 30px; height: 30px;
          background-image: linear-gradient(135deg, transparent 50%, #ffffff 50%, #ffffff 60%, transparent 60%, transparent 70%, #ffffff 70%);
          background-size: 16px 16px; background-repeat: no-repeat; background-position: bottom right;
          cursor: nwse-resize; z-index: 100; touch-action: none;
        }
      `}</style>

      <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', borderBottom: '1px solid #111', flexShrink: 0 }}>
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

      <div style={{ flex: 1, padding: '20px 30px', display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0 }}>
        <div style={{ 
          background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '25px', 
          height: `${consoleHeight}px`, flexShrink: 0, position: 'relative', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)', 
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          {isManual ? (
            <textarea 
              value={manualText} 
              onChange={(e) => setManualText(e.target.value)} 
              style={{ width: '100%', flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '16px', fontFamily: 'monospace', resize: 'none' }} 
            />
          ) : (
            <div style={{ fontSize: '15px', lineHeight: '1.5', color: '#d4d4d4', fontFamily: 'monospace', overflowY: 'auto' }}>
              <span style={{ color: '#f59e0b' }}>{dynamicPrompt.subject}</span><span style={{ color: '#f59e0b' }}>{dynamicPrompt.ensemble}</span><span style={{ color: '#10b981' }}>{dynamicPrompt.action}</span><span style={{ color: '#3b82f6' }}>{dynamicPrompt.scene}</span><span style={{ color: '#666' }}>{dynamicPrompt.cine}</span><span style={{ color: '#8b5cf6' }}>{dynamicPrompt.style}</span>
            </div>
          )}
          <div className="handle-manual" onMouseDown={startResizing} onTouchStart={startResizing} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexShrink: 0 }}>
          <button onClick={handleCopy} style={{ flex: 1, padding: '12px', borderRadius: '4px', border: 'none', fontWeight: '900', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize:'10px' }}>{copyStatus}</button>
          <button onClick={handleExport} style={{ flex: 1, padding: '12px', borderRadius: '4px', background: '#1a1a1a', color: '#fff', border: '1px solid #333', fontWeight: '900', fontSize:'10px', cursor: 'pointer' }}>EXPORT .TXT</button>
          <button onClick={onRandomix} style={{ flex: 1, padding: '12px', borderRadius: '4px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: '900', fontSize:'10px', cursor: 'pointer' }}>RANDOMIX</button>
          <button onClick={onClearStage} style={{ flex: 1, padding: '12px', borderRadius: '4px', background: '#b91c1c', color: '#fff', border: 'none', fontWeight: '900', fontSize:'10px', cursor: 'pointer' }}>CLEAR STAGE</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexShrink: 0, paddingBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '9px', color: '#444', fontWeight: '900', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>INTERACTION</label>
            <select value={interaction} onChange={(e) => setInteraction(e.target.value)} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #222', padding: '8px', borderRadius: '4px', fontSize: '10px' }}>
              {interactions.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '9px', color: '#3b82f6', fontWeight: '900', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>SREF / TECH PARAMS</label>
            <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="--cref URL" style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #222', padding: '8px', borderRadius: '4px', fontSize: '10px' }} />
          </div>
        </div>
      </div>

      <div style={{ height: '320px', borderTop: '1px solid #111', flexShrink: 0, background: '#161616' }}>
        <ActionMatrixV2 actions={actions} activeAction={action} onSelectAction={setAction} onSelectUtility={onSelectUtility} isHuman={engine1.isHuman} motionMode={motionMode} />
      </div>
    </div>
  );
}