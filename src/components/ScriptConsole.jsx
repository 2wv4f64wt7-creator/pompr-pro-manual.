// -------------------------------------------------------------------
// FILE: ScriptConsole.jsx | VERSION: 3.3 (LABEL CLARIFICATION)
// -------------------------------------------------------------------
import React, { useState, useMemo } from 'react';
import ActionMatrixV2 from './ActionMatrixV2';

const ScriptConsole = (props) => {
  const {
    isManual, setIsManual, manualText, setManualText,
    dynamicPrompt, actor1, actor2, interaction, interactions = [], 
    setInteraction, seed, setSeed, globalParams, setGlobalParams,
    setAction, actions = [], engine1, isMatrixSilenced, onRandomix, activeReelMeta, scene
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
    const currentWearS = (isSymmetry && actor2) ? "wearing" : wear1;
    const currentWearE = (isSymmetry && actor2) ? wear1 : "wearing";

    let sT = currentSubject ? `SUBJECT: ${currentSubject.name} (${currentSubject.details}), ${currentWearS} ${currentSubject.outfit}.` : '';
    let eT = currentEnsemble ? `\nENSEMBLE: ${interaction} ${currentEnsemble.name} (${currentEnsemble.details}), ${currentWearE} ${currentEnsemble.outfit}.` : '';

    let pT = '';
    if (povMode === 1 && actor1 && actor2) pT = `\nCAMERA: Over-the-shoulder shot from behind ${currentEnsemble.name}, focusing on ${currentSubject.name}.`;
    if (povMode === 2 && actor1 && actor2) pT = `\nCAMERA: Over-the-shoulder shot from behind ${currentSubject.name}, focusing on ${currentEnsemble.name}.`;

    if (promptTier === 'SHORT') {
      const shortST = currentSubject ? `SUBJECT: ${currentSubject.name} (Ref #1).` : '';
      const shortET = currentEnsemble ? `\nENSEMBLE: ${interaction} ${currentEnsemble.name} (Ref #2).` : '';
      const shortScene = scene ? `\nSCENE: ${scene.name}.` : '';
      return `${shortST}${shortET}${dynamicPrompt.action || ''}${pT}${shortScene}`.trim();
    }

    const basePrompt = `${sT}${eT}${dynamicPrompt.action || ''}${pT}${dynamicPrompt.scene || ''}${dynamicPrompt.cine || ''}`;
    
    if (promptTier === 'MEDIUM') return basePrompt.trim();
    return `${basePrompt}${dynamicPrompt.style || ''}${dynamicPrompt.negative || ''}${dynamicPrompt.commercialTail || ''}`.trim();
  }, [dynamicPrompt, isSymmetry, povMode, actor1, actor2, interaction, engine1, promptTier, scene]);

  const handleActionSelect = (act) => {
    if (act.category === 'UTIL' || act.category === 'UTILITY') {
      const current = isManual ? manualText : autoDisplayString;
      setManualText(current.trim() + `\nUTILITY: ${act.desc || act.text}`);
      setIsManual(true);
    } 
    else {
      setAction(act);
      if (isManual) {
        const newActionLine = `ACTION: ${act.name} (${act.desc})`;
        setManualText(prevText => {
          const actionRegex = /^ACTION:.*$/m;
          if (actionRegex.test(prevText)) return prevText.replace(actionRegex, newActionLine);
          const lines = prevText.split('\n');
          lines.splice(2, 0, newActionLine);
          return lines.join('\n');
        });
      }
    }
  };

  const renderColoredText = (text, isPlain = false) => {
    return text.split('\n').map((line, idx) => {
      let color = isPlain ? '#fff' : '#ccc'; 
      if (!isPlain) {
        if (line.startsWith('SCENE:')) color = '#3b82f6';
        else if (line.startsWith('SUBJECT:') || line.startsWith('ENSEMBLE:')) color = '#f59e0b';
        else if (line.startsWith('ACTION:')) color = '#10b981';
        else if (line.startsWith('UTILITY:')) color = '#fff';
        else if (line.startsWith('CAMERA:')) color = '#a855f7';
        else if (line.startsWith('STYLE:')) color = '#8b5cf6';
        else if (line.startsWith('--no')) color = '#ef4444';
      }
      return <div key={idx} style={{ color, marginBottom: '2px' }}>{line}</div>;
    });
  };

  const getNavBtnStyle = (isToggled, isAvailable, activeColor) => ({
    padding: '8px 15px', fontSize: '0.65rem', fontWeight: '900',
    border: isAvailable ? `1px solid ${isToggled ? activeColor : '#666'}` : '1px solid #1a1a1a',
    background: isToggled ? activeColor : '#111',
    color: isAvailable ? '#fff' : '#444', borderRadius: '4px',
    cursor: isAvailable ? 'pointer' : 'not-allowed', transition: 'all 0.2s', opacity: isAvailable ? 1 : 0.5
  });

  const hasMeta = activeReelMeta && (activeReelMeta.global_style || activeReelMeta.global_negative);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#080808', color: '#fff' }}>
      
      <div style={{ padding: '1.25rem', borderBottom: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#111', padding: '3px', borderRadius: '6px' }}>
            {['SHORT', 'MEDIUM', 'FULL'].map(t => (
              <button key={t} onClick={() => setPromptTier(t)} style={getNavBtnStyle(promptTier === t, true, '#3b82f6')}>{t}</button>
            ))}
            <div style={{ width: '1px', height: '15px', background: '#333', margin: '0 5px' }} />
            <button disabled={!actor2} onClick={() => setIsSymmetry(!isSymmetry)} style={getNavBtnStyle(isSymmetry, !!actor2, '#ff8a00')}>STAGE FLIPPED</button>
            <button disabled={!actor2} onClick={() => setPovMode(povMode === 2 ? 0 : povMode + 1)} style={getNavBtnStyle(povMode > 0, !!actor2, povMode === 2 ? '#ff8a00' : '#3b82f6')}>POV: SHOT {povMode}</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6rem', fontWeight: '900', color: hasMeta ? '#10b981' : '#444' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasMeta ? '#10b981' : '#ef4444', border: '1px solid #000' }} />
            {hasMeta ? 'META ACTIVE' : 'NO META'}
          </div>

          <button 
            onClick={() => { if(!isManual) setManualText(autoDisplayString); setIsManual(!isManual); }} 
            style={{ 
              padding: '8px 15px', fontSize: '0.65rem', fontWeight: '900', borderRadius: '4px', cursor: 'pointer',
              background: isManual ? '#ef4444' : '#000', color: '#fff', border: isManual ? 'none' : '1px solid #fff' 
            }}>
            {isManual ? 'MANUAL MODE' : 'AUTO MODE'}
          </button>
        </div>

        <div style={{ minHeight: '220px', backgroundColor: '#030303', border: '1px solid #111', borderRadius: '4px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', overflowY: 'auto', resize: 'vertical', lineHeight: '2.0' }}>
          {isManual ? (
            <textarea 
              value={manualText} 
              onChange={(e) => setManualText(e.target.value)} 
              style={{ width: '100%', height: '100%', background: 'transparent', color: '#fff', border: 'none', outline: 'none', resize: 'none', lineHeight: '2.0' }} 
            />
          ) : renderColoredText(autoDisplayString)}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(isManual ? manualText : autoDisplayString); setCopyFeedback('COPIED!'); setTimeout(()=>setCopyFeedback('COPY'), 2000); }}>{copyFeedback}</button>
          <button style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => {
            const final = `${isManual ? manualText : autoDisplayString}${seed ? ` --seed ${seed}` : ''}${globalParams ? ` ${globalParams}` : ''}`;
            const blob = new Blob([final], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `POMPR_EXPORT.txt`;
            link.click();
          }}>EXPORT .TXT</button>
          <button onClick={onRandomix} style={{ flex: 1, background: '#2e1065', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>RANDOMIX</button>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1.25rem', background: '#0a0a0a', display: 'flex', gap: '1rem', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ flex: 0.35 }}>
           <span style={{ fontSize: '0.55rem', color: '#444', display: 'block', marginBottom: '4px' }}>ENSEMBLE INTERACTION</span>
           <select style={{ width: '100%', background: '#111', color: '#ff8a00', border: '1px solid #222', padding: '8px', fontSize: '0.75rem' }} value={interaction} onChange={(e) => setInteraction(e.target.value)}>
              {interactions.map((i, idx) => <option key={idx} value={i}>{i}</option>)}
           </select>
        </div>
        
        {/* UPDATED LABEL HERE */}
        <div style={{ flex: 0.65 }}>
           <span style={{ fontSize: '0.55rem', color: '#666', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
             GLOBAL SREF / TECH PARAMS <span style={{ color: '#3b82f6' }}>(OPTIONAL)</span>
           </span>
           <input style={{ width: '100%', background: '#111', color: '#aaa', border: '1px solid #222', padding: '8px', fontSize: '0.75rem' }} placeholder="--cref URL --v 6.1" value={globalParams} onChange={(e) => setGlobalParams(e.target.value)} />
        </div>
      </div>

      <div style={{ flex: '1', position: 'relative', opacity: isMatrixSilenced ? 0.2 : 1, pointerEvents: isMatrixSilenced ? 'none' : 'auto' }}>
        {isMatrixSilenced && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
             <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '12px', background: '#000', padding: '10px', border: '1px solid #ef4444' }}>
                ACTION MATRIX: BYPASSED
             </span>
          </div>
        )}
        <ActionMatrixV2 actions={actions} onSelectAction={handleActionSelect} isHuman={engine1.isHuman} />
      </div>
    </div>
  );
};

export default ScriptConsole;