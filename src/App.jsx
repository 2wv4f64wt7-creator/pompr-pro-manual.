// -------------------------------------------------------------------
// FILE: App.jsx | VERSION: 3.6 (ADAPTIVE AUTO-SNAP)
// -------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import reelData from './reels/default_reel.json';
import { useSubjectEngine } from './hooks/useSubjectEngine';

import CastingModal from './components/CastingModal'; 
import SceneBuilderModal from './components/SceneBuilderModal';
import ReelColumn from './components/ReelColumn'; 
import Header from './components/Header'; 
import ScriptConsole from './components/ScriptConsole';
import TechVaultModal from './components/TechVaultModal';

const SAFE_INTERACTIONS = ["With", "Facing", "Ignoring", "Talking to", "Confronting", "Arguing with", "Fighting"];
const baseInteractions = reelData?.interactions?.length > 0 ? reelData.interactions : SAFE_INTERACTIONS;

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [layoutMode, setLayoutMode] = useState('WORKSTATION'); 

  // 1. BRANDING & AUTO-SNAP LOGIC
  useEffect(() => {
    document.title = "POMPR | V2.1";
    
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // AUTO-SNAP: If window gets too small for 3 columns, move to Directing Mode
      if (width < 1024 && layoutMode === 'WORKSTATION') {
        setLayoutMode('DIRECTING');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutMode]);

  // 2. MODAL STATES
  const [showVault, setShowVault] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [isMatrixSilenced, setIsMatrixSilenced] = useState(false);

  // 3. DATA PERSISTENCE
  const [customCharacters, setCustomCharacters] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_CAST') || '[]'));
  const [customScenes, setCustomScenes] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_SCENES') || '[]'));
  const [customActions, setCustomActions] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_ACTIONS') || '[]'));
  const [customMeta, setCustomMeta] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_META')) || null);

  const [characters, setCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [actions, setActions] = useState([]);

  // 4. SELECTION STATE
  const [scene, setScene] = useState(null);
  const [actor1, setActor1] = useState(null); 
  const [actor2, setActor2] = useState(null);
  const [activeSlot, setActiveSlot] = useState(1);
  const [action, setAction] = useState(reelData.actions[0]);
  const [interaction, setInteraction] = useState(baseInteractions[0]);
  const [seed, setSeed] = useState("");
  const [globalParams, setGlobalParams] = useState(""); 
  const [isManual, setIsManual] = useState(false);
  const [manualText, setManualText] = useState("");

  const engine1 = useSubjectEngine(actor1);

  // 5. OMNI-NORMALIZATION
  const normalize = (item, type) => ({
    ...item,
    id: item.id || `AUTO_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: item.name || "Untitled",
    details: item.details || item.desc || item.description || "No details provided.",
    category: item.category || "USER"
  });

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_CAST', JSON.stringify(customCharacters));
    const combinedChars = [...customCharacters, ...reelData.characters];
    setCharacters(combinedChars.map(i => normalize(i, 'CHAR')));
  }, [customCharacters]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_SCENES', JSON.stringify(customScenes));
    const combinedScenes = [...customScenes, ...reelData.scenes];
    setScenes(combinedScenes.map(i => normalize(i, 'SCENE')));
  }, [customScenes]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_ACTIONS', JSON.stringify(customActions));
    setActions([...customActions, ...reelData.actions]);
  }, [customActions]);

  const smartSetCharacters = (newItems) => setCustomCharacters(prev => [...(Array.isArray(newItems) ? newItems : [newItems]), ...prev]);
  const smartSetScenes = (newItems) => setCustomScenes(prev => [...(Array.isArray(newItems) ? newItems : [newItems]), ...prev]);

  const exportAsset = (item) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${item.name.replace(/\s+/g, '_')}_Card.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getDynamicPrompt = () => {
    const sceneText = scene ? `SCENE: ${scene.name} (${scene.details}).` : "";
    const cineText = scene ? `CINEMATOGRAPHY: ${scene.lighting}, Cinematic Lens.` : "";
    const activeMeta = customMeta || reelData?.meta || {};
    const globalStyleText = activeMeta.global_style ? `STYLE: ${activeMeta.global_style}.` : "";
    const globalNegativeText = activeMeta.global_negative || "";
    if (!actor1) return { subject: null, scene: sceneText, cine: cineText, style: globalStyleText, commercialTail: globalNegativeText ? `--no ${globalNegativeText}` : "" };
    const moodTag = isMatrixSilenced ? "" : (action.mood ? ` [Mood: ${action.mood}]` : "");
    const ensembleText = actor2 ? `\nENSEMBLE: ${interaction} ${actor2.name} (${actor2.details}), wearing ${actor2.outfit}.` : "";
    let commercialFlags = (actor1.refUrl ? ` --cref ${actor1.refUrl}` : "") + (globalNegativeText ? ` --no ${globalNegativeText}` : "");
    return {
      subject: `SUBJECT: ${actor1.name} (${actor1.details}), ${engine1.wearText} ${actor1.outfit}.`,
      ensemble: ensembleText,
      action: `\nACTION: ${action.name} (${action.text ? action.text.replace('[SUBJECT]', actor1.name) : action.desc}).${moodTag}`,
      scene: scene ? `\n${sceneText}` : "",
      cine: scene ? `\n${cineText}` : "",
      style: globalStyleText ? `\n${globalStyleText}` : "",
      commercialTail: commercialFlags.trim()
    };
  };

  const config = (layoutMode === 'CASTING') ? { s: '50%', c: '50%', p: '0%', hud: true, op: 0 } : 
                 (layoutMode === 'DIRECTING') ? { s: '40px', c: '40px', p: 'calc(100% - 80px)', hud: false, op: 1 } :
                 { s: '30%', c: '30%', p: '40%', hud: false, op: 1 };

  const laneBase = { transition: 'all 0.5s ease-in-out', overflow: 'hidden', height: '100%', position: 'relative', borderRight: '1px solid #111' };
  const handleStyle = { position:'absolute', inset:0, zIndex:100, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', writingMode:'vertical-rl', fontSize:'10px', fontWeight:'900', background:'#000' };

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#0a0a0a', padding: '2rem', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ border: '1px solid #333', backgroundColor: '#111', borderRadius: '8px', padding: '2.5rem 2rem', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: '#3b82f6', fontSize: '1.5rem', margin: '0 0 1rem 0', letterSpacing: '1px', fontWeight: '900' }}>POMPR | V2.1</h2>
          <p style={{ color: '#a3a3a3', fontSize: '1rem', lineHeight: '1.6', margin: '0' }}>The Director's Console is a professional production environment. Please open POMPR on a desktop or tablet for the full widescreen experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <Header layoutMode={layoutMode} setLayoutMode={setLayoutMode} onOpenVault={() => setShowVault(true)} />
      
      <div style={{ flex: 1, display: 'flex', width: '100%', overflow: 'hidden' }}>
        <div style={{ ...laneBase, width: config.s, borderLeft: 'none' }}>
          {layoutMode === 'DIRECTING' && <div onClick={()=>setLayoutMode('CASTING')} style={{...handleStyle, color:'#3b82f6'}}>S C E N E</div>}
          <ReelColumn title="SCENE RIG" items={scenes} activeIds={scene ? [scene.id] : []} colorTheme="blue" onAddNew={() => setShowSceneModal(true)} onExport={exportAsset} onSelect={(s) => setScene(s.id === scene?.id ? null : s)} />
        </div>

        <div style={{ ...laneBase, width: config.c }}>
          {layoutMode === 'DIRECTING' && <div onClick={()=>setLayoutMode('CASTING')} style={{...handleStyle, color:'#f59e0b'}}>C H A R A C T E R</div>}
          <ReelColumn 
            title="CHARACTER" items={characters} activeIds={[actor1?.id, actor2?.id].filter(Boolean)} colorTheme="orange" onAddNew={() => setShowCastModal(true)} onExport={exportAsset}
            onSelect={(char) => { if (activeSlot === 1) setActor1(actor1?.id === char.id ? null : char); else setActor2(actor2?.id === char.id ? null : char); }}
            headerSlot={
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <button onClick={() => setActiveSlot(1)} style={{ flex: 1, fontSize: '10px', padding: '8px', background: activeSlot === 1 ? '#ff8a00' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '900', borderRadius: '4px' }}>ACTOR 1</button>
                <button onClick={() => setActiveSlot(2)} style={{ flex: 1, fontSize: '10px', padding: '8px', background: activeSlot === 2 ? '#ff8a00' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '900', borderRadius: '4px' }}>ACTOR 2</button>
              </div>
            }
          />
        </div>

        <div style={{ ...laneBase, width: config.p, opacity: config.op, pointerEvents: config.op === 0 ? 'none' : 'auto', borderRight: 'none' }}>
          <ScriptConsole
            isManual={isManual} setIsManual={setIsManual} manualText={manualText} setManualText={setManualText}
            dynamicPrompt={getDynamicPrompt()} actions={actions} action={action} setAction={setAction}
            interactions={baseInteractions} interaction={interaction} setInteraction={setInteraction}
            seed={seed} setSeed={setSeed} actor1={actor1} actor2={actor2} engine1={engine1} isMatrixSilenced={isMatrixSilenced}
            onRandomix={() => setSeed(Math.floor(Math.random() * 10000000).toString())} activeReelMeta={customMeta || reelData.meta} scene={scene}
          />
        </div>
      </div>

      {config.hud && (
        <div style={{ height: '80px', background:'#000', borderTop:'1px solid #222', display: 'flex', alignItems:'center', padding:'0 30px', justifyContent:'space-between' }}>
          <div style={{ color:'#666', fontSize:'11px', fontWeight:'900' }}>[ HUD: <span style={{color:'#fff'}}>LIVE PROMPT PREVIEW</span> ] <span style={{marginLeft:'20px', color:'#3b82f6'}}>{actor1?.name || '...'}</span> | <span style={{color:'#f59e0b'}}>{scene?.name || '...'}</span></div>
          <button onClick={()=>setLayoutMode('WORKSTATION')} style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'12px 24px', borderRadius:'4px', fontWeight:'900', fontSize:'10px', cursor:'pointer' }}>ENTER WORKSTATION</button>
        </div>
      )}

      {showCastModal && <CastingModal onClose={() => setShowCastModal(false)} onSave={smartSetCharacters} />} 
      {showSceneModal && <SceneBuilderModal onClose={() => setShowSceneModal(false)} onSave={smartSetScenes} />}
      {showVault && <TechVaultModal onClose={() => setShowVault(false)} isMatrixSilenced={isMatrixSilenced} setIsMatrixSilenced={setIsMatrixSilenced} exportData={{ customCharacters, customScenes, customActions, activeReelMeta: customMeta }} onImportCharacters={smartSetCharacters} onImportScenes={smartSetScenes} onImportActions={setCustomActions} onImportMeta={setCustomMeta} />}
    </div>
  );
}