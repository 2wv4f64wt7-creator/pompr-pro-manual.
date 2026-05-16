// -------------------------------------------------------------------
// FILE: App.jsx
// VERSION: 11.14
// ARCHITECT NOTE: Added "Fighting" to the Master Fallback Interactions array.
// -------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import reelData from './reels/default_reel.json';

import CastingModal from './components/CastingModal'; 
import SceneBuilderModal from './components/SceneBuilderModal';
import ReelColumn from './components/ReelColumn'; 
import Header from './components/Header'; 
import ScriptConsole from './components/ScriptConsole';
import TechVaultModal from './components/TechVaultModal';

// ARCHITECT FIX: Added "Fighting" to the Master Fallback Array
const SAFE_INTERACTIONS = ["With", "Facing", "Ignoring", "Talking to", "Confronting", "Arguing with", "Fighting"];
const baseInteractions = reelData?.interactions?.length > 0 ? reelData.interactions : SAFE_INTERACTIONS;

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [customCharacters, setCustomCharacters] = useState(() => { try { return JSON.parse(localStorage.getItem('PPRO_CUSTOM_CAST') || '[]'); } catch { return []; } });
  const [customScenes, setCustomScenes] = useState(() => { try { return JSON.parse(localStorage.getItem('PPRO_CUSTOM_SCENES') || '[]'); } catch { return []; } });
  const [customActions, setCustomActions] = useState(() => { try { return JSON.parse(localStorage.getItem('PPRO_CUSTOM_ACTIONS') || '[]'); } catch { return []; } });
  const [customMeta, setCustomMeta] = useState(() => { try { return JSON.parse(localStorage.getItem('PPRO_CUSTOM_META')) || null; } catch { return null; } });

  const [characters, setCharacters] = useState([...customCharacters, ...reelData.characters].filter(Boolean));
  const [scenes, setScenes] = useState([...customScenes, ...reelData.scenes].filter(Boolean));
  const [actions, setActions] = useState([...customActions, ...reelData.actions].filter(Boolean));
  
  const [scene, setScene] = useState(null);
  const [actor1, setActor1] = useState(null); 
  const [actor2, setActor2] = useState(null);
  
  const [activeSlot, setActiveSlot] = useState(1);
  const [action, setAction] = useState(reelData.actions[0]);
  
  const [interaction, setInteraction] = useState(baseInteractions[0]);
  
  const [seed, setSeed] = useState("");
  const [globalParams, setGlobalParams] = useState(""); 

  const [isEditing, setIsEditing] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showCastModal, setShowCastModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_CAST', JSON.stringify(customCharacters));
    setCharacters([...customCharacters, ...reelData.characters].filter(Boolean));
  }, [customCharacters]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_SCENES', JSON.stringify(customScenes));
    setScenes([...customScenes, ...reelData.scenes].filter(Boolean));
  }, [customScenes]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_ACTIONS', JSON.stringify(customActions));
    setActions([...customActions, ...reelData.actions].filter(Boolean));
  }, [customActions]);

  useEffect(() => {
    if (customMeta) localStorage.setItem('PPRO_CUSTOM_META', JSON.stringify(customMeta));
    else localStorage.removeItem('PPRO_CUSTOM_META');
  }, [customMeta]);

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

  const smartSetCustomActions = (newItems) => {
    setCustomActions(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const trulyNew = newItems.filter(a => !existingIds.has(a.id));
      return [...trulyNew, ...prev];
    });
  };

  const getDynamicPrompt = () => {
    const sceneText = scene ? `SCENE: ${scene.name} (${scene.desc}).` : "";
    const cineText = scene ? `CINEMATOGRAPHY: ${scene.lighting}, Cinematic Lens.` : "";

    const activeMeta = customMeta || reelData?.meta || {};
    const globalStyleText = activeMeta.global_style ? `STYLE: ${activeMeta.global_style}.` : "";
    const globalNegativeText = activeMeta.global_negative || "";

    if (!actor1) {
      let emptyTailFlags = "";
      if (globalNegativeText) emptyTailFlags += ` --no ${globalNegativeText}`;
      return {
        subject: null, ensemble: null, action: null,
        scene: sceneText, cine: cineText, style: globalStyleText,
        commercialTail: emptyTailFlags.trim()
      };
    }

    const ensembleText = actor2 ? `\nENSEMBLE: ${interaction} ${actor2.name} (${actor2.details}), wearing ${actor2.outfit}.` : "";
    
    let commercialFlags = "";
    if (actor1.refUrl) commercialFlags += ` --cref ${actor1.refUrl}`; 
    if (globalNegativeText) commercialFlags += ` --no ${globalNegativeText}`;

    return {
      subject: `SUBJECT: ${actor1.name} (${actor1.details}), wearing ${actor1.outfit}.`,
      ensemble: ensembleText,
      action: `\nACTION: ${action.name} (${action.desc}).`,
      scene: scene ? `\n${sceneText}` : "",
      cine: scene ? `\n${cineText}` : "",
      style: globalStyleText ? `\n${globalStyleText}` : "",
      commercialTail: commercialFlags.trim()
    };
  };

  const dp = getDynamicPrompt();
  const subjectPart = dp.subject ? `${dp.subject}` : "";
  const ensemblePart = dp.ensemble ? `${dp.ensemble}` : "";
  const actionPart = dp.action ? `${dp.action}` : "";
  const stylePart = dp.style ? `${dp.style}` : "";
  
  const fullDynamicString = `${subjectPart}${ensemblePart}${actionPart}${dp.scene}\n${dp.cine}${stylePart}\n${dp.commercialTail}`;

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

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#0a0a0a', padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ border: '1px solid #333', backgroundColor: '#111', borderRadius: '8px', padding: '2.5rem 2rem', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: '#3b82f6', fontSize: '1.5rem', margin: '0 0 1rem 0', letterSpacing: '1px' }}>POMPR-PRO</h2>
          <p style={{ color: '#a3a3a3', fontSize: '1rem', lineHeight: '1.6', margin: '0' }}>The Director's Console is a professional production environment. Please open POMPR on a desktop or tablet for the full widescreen experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT, zIndex: 10 }}>
        <Header onOpenVault={() => setShowVault(true)} />
      </div>

      <div style={{ ...laneStyle, left: '0%', width: '30%' }}>
        <ReelColumn title="SCENE RIG" items={scenes} activeIds={scene ? [scene.id] : []} colorTheme="blue" showCreateButton={true} onCreateClick={() => setShowSceneModal(true)} onExport={exportAsset} onSelect={(s) => { setIsManual(false); setScene(s.id === scene?.id ? null : s); }} />
      </div>

      <div style={{ ...laneStyle, left: '30%', width: '30%' }}>
        <ReelColumn title="CHARACTER" items={characters} activeIds={[actor1?.id, actor2?.id].filter(Boolean)} colorTheme="orange" showCreateButton={true} onCreateClick={() => setShowCastModal(true)} onExport={exportAsset}
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
        />
      </div>

      <div style={{ ...laneStyle, left: '60%', width: '40%' }}>
        <ScriptConsole 
          isEditing={isEditing} setIsEditing={setIsEditing} isManual={isManual} setIsManual={setIsManual}
          manualText={manualText} setManualText={setManualText} dynamicPrompt={dp} fullDynamicString={fullDynamicString}
          actions={actions} action={action} setAction={(a) => { setAction(a); setIsManual(false); }}
          interactions={baseInteractions} interaction={interaction} setInteraction={setInteraction}
          actor1={actor1} actor2={actor2} actor2Active={!!actor2}
          onRandomix={triggerRandomix} isRandomizing={isRandomizing} 
          seed={seed} setSeed={setSeed} globalParams={globalParams} setGlobalParams={setGlobalParams}
        />
      </div>

      <div style={{ position: 'absolute', zIndex: 100 }}>
        {showCastModal && <CastingModal onClose={() => setShowCastModal(false)} onSave={(c) => smartSetCustomCharacters([c])} />} 
        {showSceneModal && <SceneBuilderModal onClose={() => setShowSceneModal(false)} onSave={(s) => smartSetCustomScenes([s])} />}
        {showVault && <TechVaultModal onClose={() => setShowVault(false)} setCustomCharacters={smartSetCustomCharacters} setCustomScenes={smartSetCustomScenes} setCustomActions={smartSetCustomActions} setCustomMeta={setCustomMeta} fullCharacters={characters} fullScenes={scenes} fullActions={actions} />}
      </div>
    </div>
  );
}