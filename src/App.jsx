// -------------------------------------------------------------------
// FILE: App.jsx | VERSION: 5.1.2 (SCL + NONHUMAN NORMALIZATION FIX)
// DESCRIPTION: Updated normalize() to automatically infer subject_mode: 
// "NONHUMAN" for vehicles, machinery, and objects when explicit metadata 
// is missing, ensuring ActionMatrixV2 correctly hides emotion/pose controls.
// -------------------------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';
import reelData from './reels/default_reel.json';
import { useSubjectEngine } from './hooks/useSubjectEngine';

import CastingModal from './components/CastingModal';
import SceneBuilderModal from './components/SceneBuilderModal';
import ReelColumn from './components/ReelColumn';
import Header from './components/Header';
import ScriptConsole from './components/ScriptConsole';
import TechVaultModal from './components/TechVaultModal';

const SAFE_INTERACTIONS = ["With", "Facing", "Ignoring", "Talking to", "Confronting", "Arguing with", "Fighting"];
const MOODS = ['CALM', 'HAPPY', 'FOCUSED', 'FEARFUL', 'ANGRY', 'POWERFUL'];

// --- SCL FEATURE FLAG & CONTROL PROFILES ---
const ENABLE_SCL = true;

const REEL_PROFILES = {
  ABSTRACT_MOTION: { type: 'MOTION', focus: ['trajectory', 'speed', 'temporal', 'flow'] },
  VEHICLE: { type: 'VEHICLE', focus: ['geometry', 'materials', 'tracking', 'environment'] },
  CHARACTER: { type: 'CHARACTER', focus: ['identity', 'wardrobe', 'pose', 'continuity'] },
  GENERAL: { type: 'GENERAL', focus: ['composition', 'lighting', 'fidelity'] }
};

const getReelProfile = (scene, action, motionMode) => {
  if (motionMode === 'VIDEO') return REEL_PROFILES.ABSTRACT_MOTION;
  if (scene?.category === 'VEHICLE' || action?.category === 'POWR') return REEL_PROFILES.VEHICLE;
  if (scene?.category === 'CHARACTER' || scene === null) return REEL_PROFILES.CHARACTER;
  return REEL_PROFILES.GENERAL;
};

const buildMasterControlContract = ({ actor1, actor2, scene, action, interaction, povMode, isStageFlipped, viewMode, motionMode, customMeta }) => {
  const resolveAlias = (char) => {
    if (!char) return null;
    const alias = typeof char.subject === "string" ? char.subject.trim() : "";
    const name = typeof char.name === "string" ? char.name.trim() : "";
    return alias || name || "Untitled";
  };

  let pPrimary = isStageFlipped ? actor2 : actor1;
  let pSecondary = isStageFlipped ? actor1 : actor2;

  if (!pPrimary && pSecondary) {
    pPrimary = pSecondary;
    pSecondary = null;
  }

  const pAlias = resolveAlias(pPrimary);
  const sAlias = resolveAlias(pSecondary);
  const profile = getReelProfile(scene, action, motionMode);

  let povText = "";
  if (povMode === 1 && pPrimary && pSecondary) {
    povText = `CINEMATOGRAPHY: Over-the-shoulder shot, ${pAlias} in foreground blurred, focus on ${sAlias}.`;
  } else if (povMode === 2 && pPrimary && pSecondary) {
    povText = `CINEMATOGRAPHY: Over-the-shoulder shot, ${sAlias} in foreground blurred, focus on ${pAlias}.`;
  }

  const sDetails = (scene && scene.details) ? ` (${scene.details})` : "";
  const voidDirective = !pPrimary ? " Empty environment, no people, uninhabited." : "";
  const sText = scene ? `SCENE: ${scene.name}${viewMode === 'FULL' ? sDetails : ""}. ${voidDirective}` : "";
  const cText = scene ? `CINEMATOGRAPHY: ${scene.lighting}, Cinematic Lens.` : "";
  const stT = (customMeta || reelData?.meta)?.global_style ? `STYLE: ${(customMeta || reelData?.meta).global_style}.` : "";

  let subT = pPrimary ? `SUBJECT: ${pAlias} (${viewMode === 'FULL' ? (pPrimary.details || pPrimary.desc || pPrimary.description || '') : pPrimary.category}), wearing ${pPrimary.outfit || ''}.` : "";
  let ensT = (pPrimary && pSecondary) ? ` ENSEMBLE: ${interaction} ${sAlias} (${viewMode === 'FULL' ? (pSecondary.details || pSecondary.desc || pSecondary.description || '') : pSecondary.category}), wearing ${pSecondary.outfit || ''}.` : "";
  
  let actT = pPrimary ? ` ACTION: ${action?.desc || action?.text || 'Standing still.'}` : "";
  if (motionMode === 'VIDEO' && profile.type === 'MOTION') {
    actT = pPrimary ? ` ACTION: High-speed temporal motion sequence, optical flow alignment, continuous trajectory physics. (${action?.desc || action?.text || 'Moving.'})` : "";
  }

  if (viewMode === 'SHORT' && pPrimary) {
    subT = `SUBJECT: ${pAlias} Ref #1, ${pPrimary.outfit || ''}.`;
    ensT = pSecondary ? ` ENSEMBLE: ${interaction} ${sAlias} Ref #2, ${pSecondary.outfit || ''}.` : "";
  }

  const cref = (pPrimary?.refUrl ? ` --cref ${pPrimary.refUrl}` : "") + (pSecondary?.refUrl ? ` --cref ${pSecondary.refUrl}` : "");

  return {
    subject: subT,
    ensemble: ensT,
    action: actT,
    scene: sText ? (pPrimary ? `\n${sText}` : sText) : "",
    cine: povText || (cText ? `\n${cText}` : ""),
    style: stT ? `\n${stT}` : "",
    utility: "",
    commercialTail: cref.trim()
  };
};

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [layoutMode, setLayoutMode] = useState('WORKSTATION');

  useEffect(() => {
    document.title = "POMPR | V2.1 SCL";
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width < 1024 && layoutMode === 'WORKSTATION') setLayoutMode('DIRECTING');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutMode]);

  const [showVault, setShowVault] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [isMatrixSilenced, setIsMatrixSilenced] = useState(false);

  const [customCharacters, setCustomCharacters] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_CAST') || '[]'));
  const [customScenes, setCustomScenes] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_SCENES') || '[]'));
  const [customActions, setCustomActions] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_ACTIONS') || '[]'));
  const [customMeta, setCustomMeta] = useState(() => JSON.parse(localStorage.getItem('PPRO_CUSTOM_META')) || null);

  const [characters, setCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [actions, setActions] = useState([]);

  const [scene, setScene] = useState(null);
  const [actor1, setActor1] = useState(null);
  const [actor2, setActor2] = useState(null);
  const [activeSlot, setActiveSlot] = useState(1);
  const [action, setAction] = useState(reelData.actions[0]);
  const [utilityText, setUtilityText] = useState("");
  const [interaction, setInteraction] = useState(reelData?.interactions?.[0] || SAFE_INTERACTIONS[0]);
  const [seed, setSeed] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [manualText, setManualText] = useState("");
  
  const [lastAppliedDp, setLastAppliedDp] = useState({});

  const [viewMode, setViewMode] = useState('FULL');
  const [isStageFlipped, setIsStageFlipped] = useState(false);
  const [povMode, setPovMode] = useState(0);
  const [motionMode, setMotionMode] = useState('STILL');

  const engine1 = useSubjectEngine(actor1);

  const normalize = (item, type) => {
    if (!item) return null;
    
    // Defensive Non-Human Inference Check for Reels without explicit subject_mode
    let mode = item.subject_mode;
    if (!mode && type === 'CHAR') {
      const inspectString = `${item.category || ''} ${item.name || ''} ${item.details || ''} ${item.description || ''}`.toLowerCase();
      const nonHumanKeywords = ['vehicle', 'car', 'truck', 'boat', 'ship', 'plane', 'aircraft', 'train', 'tank', 'mech', 'robot', 'drone', 'bike', 'motorcycle'];
      if (nonHumanKeywords.some(keyword => inspectString.includes(keyword))) {
        mode = "NONHUMAN";
      }
    }

    return { 
      ...item, 
      subject_mode: mode || item.subject_mode,
      id: item.id || `AUTO_${type}_${Date.now()}_${Math.random()}`, 
      name: item.name || "Untitled", 
      details: item.details || item.description || item.desc || "", 
      category: item.category || "USER" 
    };
  };

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_CAST', JSON.stringify(customCharacters));
    const combined = [...customCharacters, ...reelData.characters].filter(Boolean);
    setCharacters(combined.map(i => normalize(i, 'CHAR')));
  }, [customCharacters]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_SCENES', JSON.stringify(customScenes));
    const combined = [...customScenes, ...reelData.scenes].filter(Boolean);
    setScenes(combined.map(i => normalize(i, 'SCENE')));
  }, [customScenes]);

  useEffect(() => {
    localStorage.setItem('PPRO_CUSTOM_ACTIONS', JSON.stringify(customActions));
    setActions([...customActions, ...reelData.actions].filter(Boolean));
  }, [customActions]);

  const smartSetCharacters = (newItems) => setCustomCharacters(prev => [...(Array.isArray(newItems) ? newItems : [newItems]), ...prev]);
  const smartSetScenes = (newItems) => setCustomScenes(prev => [...(Array.isArray(newItems) ? newItems : [newItems]), ...prev]);

  const getDynamicPrompt = useCallback(() => {
    const statePayload = { actor1, actor2, scene, action, interaction, utilityText, povMode, isStageFlipped, viewMode, motionMode, customMeta };
    
    const dp = ENABLE_SCL ? buildMasterControlContract(statePayload) : (() => {
      let primary = isStageFlipped ? actor2 : actor1;
      let secondary = isStageFlipped ? actor1 : actor2;
      if (!primary && secondary) { primary = secondary; secondary = null; }
      const pAlias = primary?.subject || primary?.name || "Untitled";
      const sAlias = secondary?.subject || secondary?.name || "Untitled";
      return {
        subject: primary ? `SUBJECT: ${pAlias}` : "",
        ensemble: (primary && secondary) ? ` ENSEMBLE: ${interaction} ${sAlias}` : "",
        action: primary ? ` ACTION: ${action?.desc || action?.text || 'Standing still.'}` : "",
        scene: scene ? `SCENE: ${scene.name}` : "",
        cine: "",
        style: "",
        utility: (isManual && utilityText) ? `\n\nUTILITY: ${utilityText}` : "",
        commercialTail: ""
      };
    })();

    const utilT = (isManual && utilityText) ? `\n\nUTILITY: ${utilityText}` : "";
    return { ...dp, utility: utilT };
  }, [actor1, actor2, scene, action, interaction, utilityText, povMode, isStageFlipped, viewMode, isManual, motionMode, customMeta]);

  useEffect(() => {
    const currentDp = getDynamicPrompt();
    let hasChanges = false;
    const changedKeys = [];

    Object.keys(currentDp).forEach(key => {
      if (currentDp[key] !== lastAppliedDp[key]) {
        hasChanges = true;
        changedKeys.push(key);
      }
    });

    if (hasChanges) {
      if (isManual) {
        setManualText(prevText => {
          let newText = prevText;
          const prefixes = {
            subject: "SUBJECT:", ensemble: "ENSEMBLE:", action: "ACTION:",
            scene: "SCENE:", cine: "CINEMATOGRAPHY:", style: "STYLE:",
            utility: "UTILITY:", commercialTail: "--cref"
          };
          
          const allPrefixes = Object.values(prefixes).map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

          changedKeys.forEach(key => {
            const prefix = prefixes[key];
            const newGeneratedVal = currentDp[key] || "";

            if (prefix) {
              const safePrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(`\\s*${safePrefix}[\\s\\S]*?(?=(?:${allPrefixes})|$)`);
              
              if (newGeneratedVal) {
                if (regex.test(newText)) {
                  newText = newText.replace(regex, ` ${newGeneratedVal.trim()} `);
                } else {
                  newText = `${newText} ${newGeneratedVal.trim()} `;
                }
              } else {
                newText = newText.replace(regex, ' ');
              }
            }
          });

          newText = newText.replace(/[ \t]{2,}/g, ' ').trim();
          newText = newText.replace(/\s*(SCENE:|CINEMATOGRAPHY:|STYLE:|UTILITY:)/g, '\n$1');
          return newText.trim();
        });
      } else {
        setManualText(Object.values(currentDp).filter(Boolean).join('').trim());
      }
      
      setLastAppliedDp(currentDp);
    }
  }, [getDynamicPrompt, isManual, lastAppliedDp]);

  const handleClearStage = () => {
    setActor1(null);
    setActor2(null);
    setScene(null);
    setAction(reelData.actions[0]);
    setUtilityText("");
    setSeed("");
    setIsManual(false);
    setManualText("");
    setIsStageFlipped(false);
    setPovMode(0);
  };

  const triggerRandomix = () => {
    setIsManual(false);
    if (scenes.length > 0) setScene(scenes[Math.floor(Math.random() * scenes.length)]);
    let a1 = null;
    if (characters.length > 0) {
      a1 = characters[Math.floor(Math.random() * characters.length)];
      setActor1(a1);
      if (Math.random() > 0.7 && characters.length > 1) {
        setActor2(characters.filter(c => c.id !== a1.id)[Math.floor(Math.random() * (characters.length - 1))]);
      } else {
        setActor2(null);
      }
    }
    if (actions.length > 0) {
      const baseAct = actions[Math.floor(Math.random() * actions.length)];
      const randMood = MOODS[Math.floor(Math.random() * MOODS.length)];
      const randInt = Math.floor(Math.random() * 10) + 1;
      const isHuman = a1?.subject_mode !== "NONHUMAN";
      const cleanDesc = (baseAct.text || baseAct.desc || "").replace(/\[SUBJECT\]\s*/gi, '');
      const suffix = motionMode === 'VIDEO' ? 'Cinematic motion sequence.' : 'Cinematic frozen still-frame.';
      const compiled = isHuman ? `${randMood} ${baseAct.name} (${cleanDesc}, intensity level ${randInt}. ${suffix})` : `${baseAct.name} (${cleanDesc}. ${suffix})`;
      setAction({ ...baseAct, desc: compiled });
    }
    setSeed(Math.floor(Math.random() * 10000000).toString());
  };

  const config = (layoutMode === 'CASTING') ? { s: '50%', c: '50%', p: '0%', hud: true, op: 0 } : (layoutMode === 'DIRECTING') ? { s: '40px', c: '40px', p: 'calc(100% - 80px)', hud: false, op: 1 } : { s: '30%', c: '30%', p: '40%', hud: false, op: 1 };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#0a0a0a', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {isMobile && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#ff8a00', fontSize: '14px', letterSpacing: '2px', fontWeight: '900', marginBottom: '20px' }}>UNSUPPORTED VIEWPORT</h2>
          <p style={{ color: '#fff', fontSize: '11px', lineHeight: '1.6', opacity: 0.8 }}>POMPR V2.1 SCL requires a larger display. Please switch to a Laptop, Tablet (Landscape), or Desktop computer to access the workstation.</p>
        </div>
      )}

      <Header layoutMode={layoutMode} setLayoutMode={setLayoutMode} onOpenVault={() => setShowVault(true)} />
      
      <div style={{ flex: 1, display: 'flex', width: '100%', overflow: 'hidden' }}>
        <div style={{ transition: 'all 0.5s ease-in-out', width: config.s, borderRight: '1px solid #111', position: 'relative' }}>
          {layoutMode !== 'DIRECTING' ? (
             <ReelColumn 
               title="SCENE RIG" items={scenes} 
               activeIds={scene ? [scene.id] : []} 
               colorTheme="blue" onAddNew={() => setShowSceneModal(true)} 
               onSelect={(s) => setScene(s.id === scene?.id ? null : s)} 
               onExport={(item) => {}} 
             />
          ) : (
            <div onClick={()=>setLayoutMode('CASTING')} style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', fontSize: '10px', fontWeight: '900', color: '#3b82f6', background: '#000' }}>S C E N E</div>
          )}
        </div>
        
        <div style={{ transition: 'all 0.5s ease-in-out', width: config.c, borderRight: '1px solid #111', position: 'relative' }}>
          {layoutMode !== 'DIRECTING' ? (
            <ReelColumn 
              title="CHARACTER" items={characters} 
              activeIds={[actor1?.id, actor2?.id].filter(Boolean)} 
              colorTheme="orange" onAddNew={() => setShowCastModal(true)} 
              onSelect={(char) => { if (activeSlot === 1) setActor1(actor1?.id === char.id ? null : char); else setActor2(actor2?.id === char.id ? null : char); }} 
              onExport={(item) => {}}
              headerSlot={
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  <button onClick={() => setActiveSlot(1)} style={{ flex: 1, fontSize: '10px', padding: '8px', background: activeSlot === 1 ? '#ff8a00' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '900', borderRadius: '4px' }}>ACTOR 1</button>
                  <button onClick={() => setActiveSlot(2)} style={{ flex: 1, fontSize: '10px', padding: '8px', background: activeSlot === 2 ? '#ff8a00' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '900', borderRadius: '4px' }}>ACTOR 2</button>
                </div>
              }
            />
          ) : (
            <div onClick={()=>setLayoutMode('CASTING')} style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', fontSize: '10px', fontWeight: '900', color: '#f59e0b', background: '#000' }}>C H A R A C T E R</div>
          )}
        </div>
        
        <div style={{ transition: 'all 0.5s ease-in-out', width: config.p, opacity: config.op, pointerEvents: config.op === 0 ? 'none' : 'auto' }}>
          <ScriptConsole
            isManual={isManual} setIsManual={setIsManual} manualText={manualText} setManualText={setManualText}
            dynamicPrompt={getDynamicPrompt()} actions={actions} action={action} setAction={setAction}
            interactions={reelData.interactions || SAFE_INTERACTIONS} interaction={interaction} setInteraction={setInteraction}
            seed={seed} setSeed={setSeed} actor1={actor1} actor2={actor2} engine1={engine1}
            onRandomix={triggerRandomix} onClearStage={handleClearStage} viewMode={viewMode} setViewMode={setViewMode}
            isStageFlipped={isStageFlipped} setIsStageFlipped={setIsStageFlipped} povMode={povMode} setPovMode={setPovMode} 
            onSelectUtility={(txt) => { setUtilityText(txt); setIsManual(true); }} 
            motionMode={motionMode} setMotionMode={setMotionMode}
          />
        </div>
      </div>
      
      {showCastModal && <CastingModal onClose={() => setShowCastModal(false)} onSave={smartSetCharacters} />} 
      {showSceneModal && <SceneBuilderModal onClose={() => setShowSceneModal(false)} onSave={smartSetScenes} />}
      {showVault && <TechVaultModal onClose={() => setShowVault(false)} isMatrixSilenced={isMatrixSilenced} setIsMatrixSilenced={setIsMatrixSilenced} exportData={{ customCharacters, customScenes, customActions, activeReelMeta: customMeta }} onImportCharacters={smartSetCharacters} onImportScenes={smartSetScenes} onImportActions={setCustomActions} onImportMeta={setCustomMeta} />}
    </div>
  );
}