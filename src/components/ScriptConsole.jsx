// -------------------------------------------------------------------
// FILE: ScriptConsole.jsx | VERSION: 2.3 (ENSEMBLE & RESIZE FIXED)
// July 29, 2026 Baseline
// -------------------------------------------------------------------
import React, { useState, useMemo } from 'react';
import ActionMatrixV2 from './ActionMatrixV2';

const ScriptConsole = (props) => {
  const {
    isManual, setIsManual, manualText, setManualText,
    dynamicPrompt, actor1, actor2, interaction, interactions = [], 
    setInteraction, seed, setSeed, globalParams, setGlobalParams,
    setAction, actions = [], engine1, isMatrixSilenced, onRandomix, onClearStage, activeReelMeta, scene
  } = props;

  const [promptTier, setPromptTier] = useState('FULL');
  const [copyFeedback, setCopyFeedback] = useState('COPY');
  const [isSymmetry, setIsSymmetry] = useState(false);
  const [povMode, setPovMode] = useState(0); 

  const autoDisplayString = useMemo(() => {
    if (!dynamicPrompt || (!actor1 && !actor2)) return "AWAITING DIRECTOR INPUT...";
    const wear1 = engine1 ? engine1.wearText : "wearing";
    const currentSubject = (isSymmetry && actor2) ? actor2 : actor1;
    const currentEnsemble = (isSymmetry && actor2) ? actor1 : actor2;

    let sT = currentSubject ? `SUBJECT: ${currentSubject.name} (${currentSubject.details}), ${wear1} ${currentSubject.outfit}.` : '';
    let eT = currentEnsemble ? `\nENSEMBLE: ${interaction} ${currentEnsemble.name} (${currentEnsemble.details}), wearing ${currentEnsemble.outfit}.` : '';

    let pT = '';
    if (povMode === 1 && actor1 && actor2) pT = `\nCAMERA: Over-the-shoulder shot from behind ${currentEnsemble.name}, focusing on ${currentSubject.name}.`;
    if (povMode === 2 && actor1 && actor2) pT = `\nCAMERA: Over-the-shoulder shot from behind ${currentSubject.name}, focusing on ${currentEnsemble.name}.`;

    if (promptTier === 'SHORT') {
      const sS = currentSubject ? `SUBJECT: ${currentSubject.name}.` : '';
      const eS = currentEnsemble ? `\nENSEMBLE: ${interaction} ${currentEnsemble.name}.` : '';
      return `${sS}${eS}${dynamicPrompt.action || ''}`.trim();
    }

    const base = `${sT}${eT}${dynamicPrompt.action || ''}${pT}${dynamicPrompt.scene || ''}${dynamicPrompt.cine || ''}`;
    return (promptTier === 'MEDIUM') ? base.trim() : `${base}${dynamicPrompt.style || ''}${dynamicPrompt.commercialTail || ''}`.trim();
  }, [dynamicPrompt, isSymmetry, povMode, actor1, actor2, interaction, engine1, promptTier]);

  const handleCleanCopy = async () => {
    const raw = isManual ? manualText : `${autoDisplayString}${seed ? ` --seed ${seed}` : ''}${globalParams ? ` ${globalParams}` : ''}`;
    const clean = decodeURIComponent(raw).replace(/\+/g, ' ');
    try {
      await navigator.clipboard.writeText(clean);
      setCopyFeedback('COPIED!');
      setTimeout(() => setCopyFeedback('COPY'), 2000);
    } catch (e) { setCopyFeedback('FAILED'); }
  };

  const renderColoredText = (text) => {
    if (!text) return null;
    const lines = text.split('\n').map((line, idx) => {
      let color = '#ccc'; 
      if (line.startsWith('SCENE:')) color = '#3b82f6';
      else if (line.startsWith('SUBJECT:') || line.startsWith('ENSEMBLE:')) color = '#f59e0b';
      else if (line.startsWith('ACTION:')) color = '#10b981';
      else if (line.startsWith('UTILITY:')) color = '#fff';
      else if (line.startsWith('CAMERA:')) color = '#a855f7';
      else if (line.startsWith('STYLE:')) color = '#8b5cf6';
      else if (line.startsWith('--no')) color = '#ef4444';
      return <div key={idx} style={{ color, marginBottom: '2px' }}>{line}</div>;
    });
    if (seed) lines.push(<div key="seed" style={{ color: '#555', marginTop: '10px', fontSize: '0.75rem' }}>--seed {seed}</div>);
    return lines;
  };

  const getNavBtnStyle = (active, color, disabled = false) => ({
    padding: '8px 15px', fontSize: '0.65rem', fontWeight: '900',
    border: `1px solid ${active ? color : '#333'}`,
    background: active ? color : '#111', color: disabled ? '#444' : '#fff', 
    borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#080808', color: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '10px', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#111', padding: '3px', borderRadius: '6px' }}>
            {['SHORT', 'MEDIUM', 'FULL'].map(t => (<button key={t} onClick={() => setPromptTier(t)} style={getNavBtnStyle(promptTier === t, '#3b82f6')}>{t}</button>))}
            <div style={{ width: '1px', background: '#333', margin: '0 5px' }} />
            <button disabled={!actor2} onClick={() => setIsSymmetry(!isSymmetry)} style={getNavBtnStyle(isSymmetry, '#ff8a00', !actor2)}>STAGE FLIPPED</button>
            <button disabled={!actor2} onClick={() => setPovMode(povMode === 2 ? 0 : povMode + 1)} style={getNavBtnStyle(povMode > 0, '#3b82f6', !actor2)}>POV: SHOT {povMode}</button>
          </div>
          <button onClick={() => { if(!isManual) setManualText(`${autoDisplayString}${seed ? `\n--seed ${seed}` : ''}`); setIsManual(!isManual); }} style={{ padding: '8px 15px', fontSize: '0.65rem', fontWeight: '900', borderRadius: '4px', cursor: 'pointer', background: isManual ? '#ef4444' : '#000', color: '#fff', border: '1px solid #fff' }}>{isManual ? 'MANUAL MODE' : 'AUTO MODE'}</button>
        </div>
        <div style={{ minHeight: '120px', maxHeight: '500px', backgroundColor: '#030303', border: '1px solid #111', borderRadius: '4px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', overflowY: 'auto', resize: 'vertical', lineHeight: '2.0' }}>
          {isManual ? (<textarea value={manualText} onChange={(e) => setManualText(e.target.value)} style={{ width: '100%', height: '100%', background: 'transparent', color: '#fff', border: 'none', outline: 'none', resize: 'none', lineHeight: '2.0' }} />) : renderColoredText(autoDisplayString)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleCleanCopy}>{copyFeedback}</button>
          <button style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => {
            const raw = isManual ? manualText : `${autoDisplayString}${seed ? ` --seed ${seed}` : ''}${globalParams ? ` ${globalParams}` : ''}`;
            const blob = new Blob([raw], { type: 'text/plain' });
            const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `POMPR_PROMPT.txt`; link.click();
          }}>EXPORT .TXT</button>
          <button onClick={onRandomix} style={{ flex: 1, background: '#2e1065', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>RANDOMIX</button>
          <button style={{ flex: 1, padding: '12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} onClick={onClearStage}>CLEAR STAGE</button>
        </div>
      </div>
      <div style={{ padding: '0.75rem 1.25rem', background: '#0a0a0a', display: 'flex', gap: '1rem', borderBottom: '1px solid #1a1a1a', flex: '0 0 auto' }}>
        <div style={{ flex: 0.35 }}><span style={{ fontSize: '0.55rem', color: '#444', display: 'block', marginBottom: '4px' }}>ENSEMBLE INTERACTION</span>
          <select style={{ width: '100%', background: '#111', color: '#ff8a00', border: '1px solid #222', padding: '8px', fontSize: '0.75rem' }} value={interaction} onChange={(e) => setInteraction(e.target.value)}>{interactions.map((i, idx) => <option key={idx} value={i}>{i}</option>)}</select>
        </div>
        <div style={{ flex: 0.65 }}><span style={{ fontSize: '0.55rem', color: '#666', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>GLOBAL SREF / TECH PARAMS <span style={{ color: '#3b82f6' }}>(OPTIONAL)</span></span>
          <input style={{ width: '100%', background: '#111', color: '#aaa', border: '1px solid #222', padding: '8px', fontSize: '0.75rem' }} placeholder="--cref URL --v 6.1" value={globalParams} onChange={(e) => setGlobalParams(e.target.value)} />
        </div>
      </div>
      <div style={{ flex: '1', position: 'relative', overflowY: 'auto', opacity: isMatrixSilenced ? 0.2 : 1, pointerEvents: isMatrixSilenced ? 'none' : 'auto' }}>
        <ActionMatrixV2 actions={actions} onSelectAction={(a) => { props.setAction(a); setIsManual(false); }} isHuman={engine1.isHuman} activeAction={props.action} />
      </div>
    </div>
  );
};
export default ScriptConsole;