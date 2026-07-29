// -------------------------------------------------------------------
// FILE: src/components/SceneBuilderModal.jsx
// VERSION: 9.0 (UNIFIED EXPORT UPDATE)
// -------------------------------------------------------------------
import React, { useState, useEffect } from 'react';

export default function SceneBuilderModal({ onClose, onSave }) {
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    name: "", category: "LIFE", type: "Interior", location: "",
    lighting: "", atmosphere: "", specs: ""
  });
  const [previewDesc, setPreviewDesc] = useState("");

  useEffect(() => {
    if (!isDirty) {
      const desc = `${formData.type} Location: ${formData.location || "[Location details]"}. The atmosphere is ${formData.atmosphere || "[Vibe]"}. Technical Specs: Shot on ${formData.specs || "[Lens/Camera info]"}.`;
      setPreviewDesc(desc);
    }
  }, [formData, isDirty]);

  // THE UNIFIED HANDLER
  const handleUnifiedSave = () => {
    const newScene = {
      id: `S_USER_${Date.now()}`,
      category: formData.category,
      name: formData.name || "Unnamed Location",
      details: previewDesc, // Unified key for App.jsx
      lighting: formData.lighting || "Natural ambient",
      isCustom: true
    };
    
    // 1. Download
    const dataForExport = { ...newScene, description: previewDesc }; // Include description for legacy compatibility
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataForExport, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Scene_${formData.name.replace(/\s+/g, '_')}.json`);
    link.click();

    // 2. Save
    onSave(newScene);
    onClose();
  };

  const labelStyle = {fontSize:'9px', color:'#666', marginBottom:'5px', display:'block'};
  const inputStyle = {background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px', width:'100%', boxSizing:'border-box'};

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.96)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px'}}>
      <div style={{background:'#0D0D0D', border:'1px solid #333', width:'100%', maxWidth:'800px', borderRadius:'12px', padding:'40px', maxHeight:'90vh', overflowY:'auto'}}>
        
        <h2 style={{color:'#0070f3', letterSpacing:'3px', fontWeight:'900', marginBottom:'30px'}}>LOCATION SCOUT</h2>

        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px', marginBottom:'20px'}}>
          <div>
            <label style={labelStyle}>SCENE NAME</label>
            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., The Neon Workshop" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ARCHETYPE</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={inputStyle}>
              {["CORP", "LIFE", "TECH", "LUXE", "UTIL", "VOID"].map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
          <div>
            <label style={labelStyle}>ENVIRONMENT TYPE</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={inputStyle}>
              <option>Interior</option><option>Exterior</option><option>Studio / Void</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>ATMOSPHERE / VIBE</label>
            <input placeholder="e.g., Tense, cinematic..." onChange={(e) => setFormData({...formData, atmosphere: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'15px', marginBottom:'25px'}}>
          <div>
            <label style={labelStyle}>LOCATION DETAILS</label>
            <input placeholder="e.g., A busy cyber-cafe..." onChange={(e) => setFormData({...formData, location: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>LIGHTING RIG</label>
            <input placeholder="e.g., Neon bi-color..." onChange={(e) => setFormData({...formData, lighting: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>TECH SPECS (LENS/CAMERA)</label>
            <input placeholder="e.g., Wide Angle, Drone Shot..." onChange={(e) => setFormData({...formData, specs: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <textarea value={previewDesc} onChange={(e) => { setPreviewDesc(e.target.value); setIsDirty(true); }} style={{width:'100%', height:'100px', background:'#000', border:'1px solid #444', color:'#00FF88', padding:'15px', fontSize:'13px', fontStyle:'italic', borderRadius:'4px', lineHeight:'1.5', marginBottom:'30px'}} />

        {/* UNIFIED BUTTONS */}
        <div style={{display:'flex', gap:'20px'}}>
          <button onClick={handleUnifiedSave} style={{flex:3, background:'#0070f3', color:'#fff', padding:'18px', fontWeight:'900', border:'none', cursor:'pointer', borderRadius:'4px', letterSpacing:'1px'}}>SAVE & EXPORT .JSON CARD</button>
          <button onClick={onClose} style={{flex:1, background:'#222', color:'#fff', padding:'18px', border:'none', cursor:'pointer', borderRadius:'4px'}}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}