// -------------------------------------------------------------------
// FILE: TechVaultModal.jsx | VERSION: 2.10 (DEFENSIVE UPLOAD HANDLER)
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

    // --- START OF FIX: DEFENSIVE VALIDATION ---
    // Check if the selection is actually a .json file
    const isJson = file.name.toLowerCase().endsWith('.json');
    if (!isJson) {
      alert(`UPLOAD ERROR: The selected item is not a .json file.\n\nIf you unzipped a reel, please open the folder and select the .json file inside.`);
      return;
    }

    // Check if the selection is a folder (folders report as size 0 in browsers)
    if (file.size === 0) {
      alert(`UPLOAD ERROR: The file appears to be empty or is a folder.\n\nPro-Tip: Ensure the Expansion Reel is fully unzipped and select the file directly, not the folder.`);
      return;
    }
    // --- END OF FIX ---

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        
        // BLACK BOX: DATA SNIFFER LOGIC (DO NOT ALTER)
        let cItems = json.characters || json.character_and_group_subjects || [];
        let sItems = json.scenes || json.historical_scenes || [];
        let aItems = json.actions || json.procedural_base_actions || [];
        const meta = json.meta || {};

        if (cItems.length === 0 && sItems.length === 0) {
           if (json.name && (json.outfit || json.details)) {
             cItems = [json];
           } 
           else if (json.name && (json.description || json.lighting)) {
             sItems = [{
               ...json,
               details: json.description 
             }];
           }
        }

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
        alert('ERROR: Could not read the file content. If this is a valid .json file, try moving it to your Desktop before uploading.');
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