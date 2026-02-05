// -------------------------------------------------------------------
// FILE: src/components/TechVaultModal.jsx
// VERSION: 10.10 (Modularized)
// -------------------------------------------------------------------

import React, { useRef } from 'react';

export default function TechVaultModal({ 
  onClose, 
  setCustomCharacters, 
  setCustomScenes,
  fullCharacters,
  fullScenes 
}) {
  const fileInputRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let charCount = 0;
        let sceneCount = 0;

        // 1. DATA DETECTION
        const rawChars = data.characters || (data.details ? [data] : []);
        const rawScenes = data.scenes || (data.desc ? [data] : []);

        // 2. PROCESS CHARACTERS (PRESERVE IDS)
        if (rawChars.length > 0) {
          const processedChars = rawChars.map(c => ({
            ...c,
            // CRITICAL FIX: Only generate ID if missing. Trust the file's ID.
            id: c.id || `C_USER_IMP_${Math.random().toString(36).substr(2, 9)}`,
            isCustom: true
          }));
          setCustomCharacters(processedChars); // Send to App for merging
          charCount = processedChars.length;
        }

        // 3. PROCESS SCENES (PRESERVE IDS)
        if (rawScenes.length > 0) {
          const processedScenes = rawScenes.map(s => ({
            ...s,
            id: s.id || `S_USER_IMP_${Math.random().toString(36).substr(2, 9)}`,
            isCustom: true
          }));
          setCustomScenes(processedScenes); // Send to App for merging
          sceneCount = processedScenes.length;
        }

        if (charCount > 0 || sceneCount > 0) {
          alert(`VAULT IMPORT:\n- ${charCount} Characters Processed\n- ${sceneCount} Scenes Processed`);
          onClose();
        } else {
          alert("IMPORT WARNING: No valid characters or scenes found.");
        }

      } catch (err) {
        console.error("Vault Error:", err);
        alert("CRITICAL ERROR: Invalid JSON file structure.");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const bundle = {
      export_date: new Date().toISOString(),
      app_version: "10.10",
      characters: fullCharacters.filter(c => c.isCustom || c.id.includes('USER') || c.id.includes('IMP')),
      scenes: fullScenes.filter(s => s.isCustom || s.id.includes('USER') || s.id.includes('IMP'))
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `PPRO_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReset = () => {
    if (window.confirm("FACTORY RESET: This will delete ALL custom talent and scenes. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0D0D0D', border: '1px solid #00D4FF', width: '420px', borderRadius: '12px', padding: '40px', boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)' }}>
        <h2 style={{ color: '#00D4FF', fontSize: '14px', letterSpacing: '3px', marginBottom: '30px', textAlign: 'center', fontWeight: '900' }}>TECH VAULT SYSTEM</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ padding: '20px', background: '#111', border: '1px solid #222', borderRadius: '8px', textAlign: 'center' }}>
            <label style={{ color: '#00FF88', fontSize: '10px', fontWeight: 'bold', display: 'block', marginBottom: '15px', letterSpacing: '1px' }}>IMPORT PRODUCTION REEL</label>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} style={{ background: '#00FF88', color: 'black', border: 'none', padding: '12px 20px', borderRadius: '4px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', width: '100%' }}>BROWSE JSON FILES</button>
          </div>

          <button onClick={handleExport} style={{ width: '100%', padding: '15px', background: '#1A1A1A', color: 'white', border: '1px solid #333', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px' }}>EXPORT MASTER BACKUP</button>
          <button onClick={handleReset} style={{ width: '100%', padding: '15px', background: 'transparent', color: '#f44', border: '1px solid #400', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px' }}>FACTORY SYSTEM RESET</button>
          <button onClick={onClose} style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '11px', borderRadius: '4px' }}>CLOSE VAULT</button>
        </div>
      </div>
    </div>
  );
}