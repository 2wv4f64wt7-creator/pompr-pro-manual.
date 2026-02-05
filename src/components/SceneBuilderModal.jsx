// -------------------------------------------------------------------
// FILE: src/components/SceneBuilderModal.jsx
// VERSION: 8.0 (Refactored Location)
// -------------------------------------------------------------------

import React, { useState, useEffect } from 'react';

export default function SceneBuilderModal({ onClose, onSave }) {
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "LIFE",
    type: "Interior",
    location: "",
    lighting: "",
    atmosphere: "",
    specs: ""
  });
  const [previewDesc, setPreviewDesc] = useState("");

  // --- AUTO-BIOGRAPHER: SCENE STITCHING ---
  useEffect(() => {
    if (!isDirty) {
      const desc = `${formData.type} Location: ${formData.location || "[Location details]"}. The atmosphere is ${formData.atmosphere || "[Vibe]"}. Technical Specs: Shot on ${formData.specs || "[Lens/Camera info]"}.`;
      setPreviewDesc(desc);
    }
  }, [formData, isDirty]);

  const handleSave = () => {
    const newScene = {
      id: `S_USER_${Date.now()}`,
      category: formData.category,
      name: formData.name || "Unnamed Location",
      desc: previewDesc,
      lighting: formData.lighting || "Natural ambient",
      isCustom: true
    };
    onSave(newScene);
    onClose();
  };

  const exportScene = () => {
    const data = {
      name: formData.name,
      category: formData.category,
      description: previewDesc,
      lighting: formData.lighting
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Scene_${formData.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.96)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px'}}>
      <div style={{background:'#0D0D0D', border:'1px solid #333', width:'100%', maxWidth:'800px', borderRadius:'12px', padding:'40px', maxHeight:'90vh', overflowY:'auto'}}>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
          <h2 style={{color:'#0070f3', letterSpacing:'3px', fontWeight:'900', margin:0}}>LOCATION SCOUT</h2>
          <button onClick={exportScene} style={{background:'transparent', border:'1px solid #00FF88', color:'#00FF88', padding:'5px 15px', borderRadius:'4px', fontSize:'10px', cursor:'pointer'}}>EXPORT SCENE CARD</button>
        </div>

        {/* BASIC INFO */}
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px', marginBottom:'20px'}}>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>SCENE NAME</label>
            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., The Neon Workshop" style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}} />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>ARCHETYPE</label>
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}}>
              {["CORP", "LIFE", "TECH", "LUXE", "UTIL", "VOID"].map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* SPECS */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>ENVIRONMENT TYPE</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}}>
              <option>Interior</option>
              <option>Exterior</option>
              <option>Studio / Void</option>
            </select>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>ATMOSPHERE / VIBE</label>
            <input placeholder="e.g., Tense, cinematic, cozy..." onChange={(e) => setFormData({...formData, atmosphere: e.target.value})} style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}} />
          </div>
        </div>

        {/* DETAILS */}
        <div style={{display:'flex', flexDirection:'column', gap:'15px', marginBottom:'25px'}}>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>LOCATION DETAILS</label>
            <input placeholder="e.g., A busy cyber-cafe with rain streaking on large windows..." onChange={(e) => setFormData({...formData, location: e.target.value})} style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}} />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>LIGHTING RIG</label>
            <input placeholder="e.g., Neon bi-color lighting, deep shadows, volumetric fog..." onChange={(e) => setFormData({...formData, lighting: e.target.value})} style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}} />
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
            <label style={{fontSize:'9px', color:'#666'}}>TECH SPECS (LENS/CAMERA)</label>
            <input placeholder="e.g., Wide Angle, Drone Shot, 35mm Prime..." onChange={(e) => setFormData({...formData, specs: e.target.value})} style={{background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px'}} />
          </div>
        </div>

        {/* PREVIEW BOX */}
        <div style={{display:'flex', flexDirection:'column', gap:'5px', marginBottom:'30px'}}>
          <label style={{fontSize:'9px', color:'#00FF88'}}>AUTO-STITCHED DESCRIPTION</label>
          <textarea 
            value={previewDesc} 
            onChange={(e) => { setPreviewDesc(e.target.value); setIsDirty(true); }}
            style={{width:'100%', height:'100px', background:'#000', border:'1px solid #444', color:'#00FF88', padding:'15px', fontSize:'13px', fontStyle:'italic', borderRadius:'4px', lineHeight:'1.5'}} 
          />
        </div>

        <div style={{display:'flex', gap:'20px'}}>
          <button onClick={handleSave} style={{flex:2, background:'#0070f3', color:'#fff', padding:'18px', fontWeight:'900', border:'none', cursor:'pointer', borderRadius:'4px'}}>SAVE TO LOCATION RIG</button>
          <button onClick={onClose} style={{flex:1, background:'#222', color:'#fff', padding:'18px', border:'none', cursor:'pointer', borderRadius:'4px'}}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}