// -------------------------------------------------------------------
// FILE: App.jsx
// VERSION: 10.12
// ARCHITECT NOTE: Passed onRemoveActor2 to ScriptConsole. Removed footerSlot.
// -------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import reelData from './reels/default_reel.json';
import CastingModal from './CastingModal';
import SceneBuilderModal from './SceneBuilderModal';
import ReelColumn from './ReelColumn';
import ScriptConsole from './ScriptConsole';
import Header from './Header';
import TechVaultModal from './TechVaultModal';

export default function App() {
  const [customCharacters, setCustomCharacters] = useState(() => {
    try { return JSON.parse(localStorage.getItem('PPRO_CUSTOM_CAST') || '[]'); } catch { return []; }
  });
  const [customScenes, setCustomScenes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('PPRO_CUSTOM_SCENES') || '[]'); } catch { return []; }
  });

  const [characters, setCharacters] = useState([...customCharacters, ...reelData.characters].filter(Boolean));
  const [scenes, setScenes] = useState([...customScenes, ...reelData.scenes].filter(Boolean));
  
  // State Initialization: Null start
  const [scene, setScene] = useState(null);
  const [actor1, setActor1] = useState(null); 
  const [actor2, setActor2] = useState(null);
  
  const [activeSlot, setActiveSlot] = useState(1);
  const [action, setAction] = useState(reelData.actions[0]);
  const [interaction, setInteraction] = useState(reelData.interactions[0]);
  
  const [seed, setSeed] = useState("");
  const [sref, setSref] = useState("");
  const [renderParams, setRenderParams] = useState({ id: 'generic', prefix: '', suffix: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showCastModal, setShowCastModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_CAST', JSON.stringify(customCharacters));
    setCharacters([...customCharacters, ...reelData.characters].filter(Boolean));
  }, [customCharacters]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_SCENES', JSON.stringify(customScenes));
    setScenes([...customScenes, ...reelData.scenes].filter(Boolean));
  }, [customScenes]);

  const smartSetCustomCharacters = (newItems) => {
    setCustomCharacters(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const trulyNew = newItems.filter(c => !existingIds.has(c.id));
      return [...trulyNew, ...prev]; 
    });
  };

  const smartSetCustomScenes = (newItems) => {
    setCustomScenes(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const trulyNew = newItems.filter(s => !existingIds.has(s.id));
      return [...trulyNew, ...prev];
    });
  };

  const getDynamicPrompt = () => {
    const sceneText = scene ? `SCENE: ${scene.name} (${scene.desc}).` : "";
    const cineText = scene ? `CINEMATOGRAPHY: ${scene.lighting}, Cinematic Lens.` : "";

    if (!actor1) {
      return {
        subject: null, ensemble: null, action: null,
        scene: sceneText,
        cine: cineText,
        commercialTail: `${renderParams.suffix}`
      };
    }

    const ensembleText = actor2 ? `\nENSEMBLE: ${interaction} ${actor2.name} (${actor2.details}), wearing ${actor2.outfit}.` : "";
    let commercialFlags = "";
    const isMjOrNiji = ['mj61', 'mj7', 'niji6'].includes(renderParams.id);
    if (actor1.refUrl && isMjOrNiji) commercialFlags += ` --cref ${actor1.refUrl}`; 
    if (sref && sref.trim() !== "" && isMjOrNiji) commercialFlags += ` --sref ${sref}`;
    if (seed && seed.trim() !== "") commercialFlags += ` --seed ${seed}`;

    return {
      subject: `SUBJECT: ${actor1.name} (${actor1.details}), wearing ${actor1.outfit}.`,
      ensemble: ensembleText,
      action: `\nACTION: ${action.name} (${action.desc}).`,
      scene: scene ? `\n${sceneText}` : "",
      cine: scene ? `\n${cineText}` : "",
      commercialTail: `${commercialFlags}${renderParams.suffix}`
    };
  };

  const dp = getDynamicPrompt();
  const prefixStr = renderParams.prefix ? `${renderParams.prefix} ` : "";
  const subjectPart = dp.subject ? `${dp.subject}` : "";
  const ensemblePart = dp.ensemble ? `${dp.ensemble}` : "";
  const actionPart = dp.action ? `${dp.action}` : "";
  const fullDynamicString = `${prefixStr}${subjectPart}${ensemblePart}${actionPart}${dp.scene}\n${dp.cine}${dp.commercialTail}`;

  const triggerRandomix = () => {
    setIsRandomizing(true); setIsManual(false);
    setScene(scenes[Math.floor(Math.random() * scenes.length)]);
    if (Math.random() > 0.2) setActor1(characters[Math.floor(Math.random() * characters.length)]);
    else setActor1(null);
    setActor2(null);
    setSeed(Math.floor(Math.random() * 10000000).toString());
    setTimeout(() => setIsRandomizing(false), 150);
  };

  const exportAsset = (item) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${item.name.replace(/\s+/g, '_')}_Card.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const HEADER_HEIGHT = '96px';
  const laneStyle = { position: 'absolute', top: HEADER_HEIGHT, bottom: 0, overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.05)' };

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT, zIndex: 10 }}>
        <Header onOpenVault={() => setShowVault(true)} />
      </div>

      <div style={{ ...laneStyle, left: '0%', width: '30%' }}>
        <ReelColumn 
          title="SCENE RIG" items={scenes} 
          activeIds={scene ? [scene.id] : []} 
          colorTheme="blue"
          showCreateButton={true} onCreateClick={() => setShowSceneModal(true)} onExport={exportAsset}
          onSelect={(s) => { setIsManual(false); setScene(s.id === scene?.id ? null : s); }} 
        />
      </div>

      <div style={{ ...laneStyle, left: '30%', width: '30%' }}>
        <ReelColumn 
          title="CHARACTER" items={characters} activeIds={[actor1?.id, actor2?.id].filter(Boolean)} colorTheme="orange"
          showCreateButton={true} onCreateClick={() => setShowCastModal(true)} onExport={exportAsset}
          onSelect={(char) => {
            setIsManual(false);
            if (activeSlot === 1) { if (actor1 && actor1.id === char.id) setActor1(null); else setActor1(char); } 
            else { if (actor2 && actor2.id === char.id) setActor2(null); else setActor2(char); }
          }}
          headerSlot={
            <div style={{background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', display:'flex', gap:'5px', marginBottom:'15px'}}>
              <button onClick={() => setActiveSlot(1)} style={{flex:1, fontSize:'10px', padding: '8px', background: activeSlot===1 ? '#ff8a00':'transparent', color: activeSlot===1?'white':'#888', border:'none', cursor:'pointer', fontWeight:'900', borderRadius:'2px'}}>{actor1 ? "ACTOR 1" : "NO ACTOR"}</button>
              <button onClick={() => {setActiveSlot(2); if(!actor2 && actor1) setActor2(reelData.characters[1])}} style={{flex:1, fontSize:'10px', padding: '8px', background: activeSlot===2 ? '#ff8a00':'transparent', color: activeSlot===2?'white':'#888', border:'none', cursor:'pointer', fontWeight:'900', borderRadius:'2px'}}>ACTOR 2</button>
            </div>
          }
          /* FOOTER SLOT REMOVED HERE */
        />
      </div>

      <div style={{ ...laneStyle, left: '60%', width: '40%' }}>
        <ScriptConsole 
          isEditing={isEditing} setIsEditing={setIsEditing} isManual={isManual} setIsManual={setIsManual}
          manualText={manualText} setManualText={setManualText} dynamicPrompt={dp} fullDynamicString={fullDynamicString}
          actions={reelData.actions} action={action} setAction={(a) => { setAction(a); setIsManual(false); }}
          interactions={reelData.interactions} interaction={interaction} setInteraction={(i) => { setInteraction(i); setIsManual(false); }}
          actor1={actor1} actor2={actor2} actor2Active={!!actor2}
          onRemoveActor2={() => { setActor2(null); setActiveSlot(1); }} // <--- NEW PROP
          onRandomix={triggerRandomix} isRandomizing={isRandomizing} seed={seed} setSeed={setSeed} sref={sref} setSref={setSref}
          renderParams={renderParams} setRenderParams={setRenderParams}
        />
      </div>

      <div style={{ position: 'absolute', zIndex: 100 }}>
        {showCastModal && <CastingModal onClose={() => setShowCastModal(false)} onSave={(c) => setCustomCharacters([c])} />} 
        {showSceneModal && <SceneBuilderModal onClose={() => setShowSceneModal(false)} onSave={(s) => setCustomScenes([s])} />}
        {showVault && <TechVaultModal onClose={() => setShowVault(false)} customCharacters={customCharacters} setCustomCharacters={smartSetCustomCharacters} customScenes={customScenes} setCustomScenes={smartSetCustomScenes} fullCharacters={characters} fullScenes={scenes} />}
      </div>
    </div>
  );
}