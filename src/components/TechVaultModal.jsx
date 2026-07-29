// -------------------------------------------------------------------
// FILE: TechVaultModal.jsx | VERSION: 2.9 (OMNI-DATA RECOVERY)
// -------------------------------------------------------------------
import React, { useRef } from 'react';

export default function TechVaultModal({ 
  onClose, isMatrixSilenced, setIsMatrixSilenced, exportData,
  onImportCharacters, onImportScenes, onImportActions, onImportMeta
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        
        // 1. DATA SNIFFER (GARY & SUBMERGED BATHROOM COMPATIBILITY)
        let cItems = json.characters || json.character_and_group_subjects || [];
        let sItems = json.scenes || json.historical_scenes || [];
        let aItems = json.actions || json.procedural_base_actions || [];
        const meta = json.meta || {};

        // 2. SINGLE CARD DETECTION (If the above are empty, check if root is a card)
        if (cItems.length === 0 && sItems.length === 0) {
           // Gary Check
           if (json.name && (json.outfit || json.details)) {
             cItems = [json];
           } 
           // Bathroom Check (maps description -> details)
           else if (json.name && (json.description || json.lighting)) {
             sItems = [{
               ...json,
               details: json.description // Map legacy key
             }];
           }
        }

        // 3. DISPATCH TO APP ENGINE
        if (cItems.length > 0) onImportCharacters(cItems);
        if (sItems.length > 0) onImportScenes(sItems);
        if (aItems.length > 0) onImportActions(aItems);
        if (meta) onImportMeta(meta);

        alert(
          `VAULT IMPORT REPORT:\n` +
          `- ${cItems.length} Characters Detected\n` +
          `- ${sItems.length} Scenes Detected\n` +
          `- ${aItems.length} Actions Detected\n` +
          `- Global Styles: ${meta.global_style ? 'Injected' : 'None'}`
        );
      } catch (err) {
        console.error("Reel Load Error:", err);
        alert('ERROR: Could not parse file. Ensure it is a valid .json card or reel.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POMPR_MASTER_BACKUP.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const vaultBtnStyle = { width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', marginTop: '10px' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '500px', background: '#0f0f0f', border: '1px solid #3b82f6', borderRadius: '12px', padding: '40px', position: 'relative', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
        {/* SILENCE MATRIX TOGGLE (HIDDEN IN CORNER) */}
        <div onClick={() => setIsMatrixSilenced(!isMatrixSilenced)} style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', cursor: 'crosshair', zIndex: 1001 }} />
        
        <h2 style={{ color: '#00d4ff', fontSize: '18px', letterSpacing: '4px', marginBottom: '30px', fontWeight: '900' }}>TECH VAULT SYSTEM</h2>
        
        <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '8px', padding: '20px', marginBottom: '15px' }}>
          <p style={{ color: '#90ee90', fontSize: '11px', fontWeight: 'bold', marginBottom: '15px' }}>IMPORT PRODUCTION REEL / CARD</p>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current.click()} style={{ width: '100%', padding: '15px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>BROWSE JSON FILES</button>
        </div>

        <button style={vaultBtnStyle} onClick={handleExport}>EXPORT MASTER BACKUP</button>
        <button style={{ ...vaultBtnStyle, color: '#ef4444', border: '1px solid #441111' }} onClick={() => { if(window.confirm('WIPE ALL CUSTOM DATA?')) { localStorage.clear(); window.location.reload(); } }}>FACTORY SYSTEM RESET</button>
        <button onClick={onClose} style={{ width: '100%', padding: '15px', background: '#222', color: '#fff', border: 'none', borderRadius: '6px', marginTop: '25px', fontWeight: 'bold', cursor: 'pointer' }}>CLOSE VAULT</button>
      </div>
    </div>
  );
}