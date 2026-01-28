// -------------------------------------------------------------------
// FILE: CastingModal.jsx
// VERSION: 10.14 (Producer Patch)
// RESTORED: Original "Fill-in-the-Blank" Form.
// ADDED: Export JSON Button.
// -------------------------------------------------------------------

import React, { useState, useEffect } from 'react';

export default function CastingModal({ onClose, onSave }) {
  const [isBiographerDirty, setIsBiographerDirty] = useState(false);
  
  // FORM STATE including refUrl
  const [formData, setFormData] = useState({
    name: "", category: "LIFE", age: "", gender: "", ethnicity: "",
    faceShape: "", noseShape: "", eyes: "", hair: "",
    skin: "", outfit: "", expression: "", refUrl: "" 
  });
  
  const [previewBio, setPreviewBio] = useState("");

  // Auto-generate bio unless manually edited
  useEffect(() => {
    if (!isBiographerDirty) {
      const bio = `Subject is a ${formData.age || "[Age]"} year old ${formData.gender || "[Gender]"}, ${formData.ethnicity || "[Ethnicity]"}. Features include a ${formData.faceShape || "[Face Shape]"} face and a ${formData.noseShape || "[Nose Shape]"} nose, paired with ${formData.eyes || "[Eye Detail]"} eyes and ${formData.hair || "[Hair Detail]"}. Skin texture is ${formData.skin || "[Skin Detail]"}. Wardrobe consists of ${formData.outfit || "[Outfit Detail]"}. Expression is ${formData.expression || "[Expression Detail]"}.`;
      setPreviewBio(bio);
    }
  }, [formData, isBiographerDirty]);

  // Logic to build the character object
  const buildCharacterObject = () => ({
    id: `C_USER_${Date.now()}`,
    category: formData.category,
    name: formData.name || "Unnamed Talent",
    details: previewBio,
    outfit: formData.outfit || "As described in casting sheet",
    isCustom: true,
    refUrl: formData.refUrl // Image consistency link
  });

  const handleSave = () => {
    onSave(buildCharacterObject());
    onClose();
  };

  const handleExport = () => {
    const charData = buildCharacterObject();
    const exportData = {
      ...charData,
      meta: { created: new Date().toISOString(), type: "POMPR_CHARACTER_CARD" }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${(formData.name || 'Character').replace(/\s+/g, '_')}_Card.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const inputStyle = { background:'#000', border:'1px solid #333', color:'#fff', padding:'12px', borderRadius:'4px', fontSize:'13px' };

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'40px'}}>
      <div style={{background:'#0D0D0D', border:'1px solid #333', width:'100%', maxWidth:'850px', borderRadius:'15px', padding:'40px', maxHeight:'90vh', overflowY:'auto'}}>
        <h2 style={{color:'#ff8a00', marginBottom:'30px', letterSpacing:'3px', fontWeight:'900'}}>NEW CASTING SHEET</h2>
        
        {/* ROW 1 */}
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'25px', marginBottom:'25px'}}>
          <input placeholder="CHARACTER NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={inputStyle}>
            {["CORP", "LIFE", "TECH", "LUXE", "UTIL", "VOID"].map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        {/* ROW 2 */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'25px', marginBottom:'25px'}}>
          <input placeholder="Age" onChange={(e) => setFormData({...formData, age: e.target.value})} style={inputStyle} />
          <input placeholder="Gender" onChange={(e) => setFormData({...formData, gender: e.target.value})} style={inputStyle} />
          <input placeholder="Ethnicity" onChange={(e) => setFormData({...formData, ethnicity: e.target.value})} style={inputStyle} />
        </div>

        {/* ROW 3 */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginBottom:'25px'}}>
          <input placeholder="Face Shape" onChange={(e) => setFormData({...formData, faceShape: e.target.value})} style={inputStyle} />
          <input placeholder="Nose Shape" onChange={(e) => setFormData({...formData, noseShape: e.target.value})} style={inputStyle} />
        </div>

        {/* ROW 4 */}
        <div style={{display:'grid', gap:'15px', marginBottom:'25px'}}>
          <input placeholder="Eyes" onChange={(e) => setFormData({...formData, eyes: e.target.value})} style={inputStyle} />
          <input placeholder="Hair" onChange={(e) => setFormData({...formData, hair: e.target.value})} style={inputStyle} />
          <input placeholder="Skin" onChange={(e) => setFormData({...formData, skin: e.target.value})} style={inputStyle} />
          <input placeholder="Outfit" onChange={(e) => setFormData({...formData, outfit: e.target.value})} style={inputStyle} />
          <input placeholder="Expression" onChange={(e) => setFormData({...formData, expression: e.target.value})} style={inputStyle} />
        </div>

        {/* CONSISTENCY SUITE INPUT */}
        <div style={{marginBottom:'25px', borderTop:'1px solid #222', paddingTop:'20px'}}>
             <label style={{color:'#0070f3', fontSize:'11px', fontWeight:'bold', letterSpacing:'1px', display:'block', marginBottom:'8px'}}>CONSISTENCY SUITE (OPTIONAL)</label>
             <input 
                placeholder="e.g. https://s.mj.run/..." 
                value={formData.refUrl}
                onChange={(e) => setFormData({...formData, refUrl: e.target.value})} 
                style={{...inputStyle, width: '100%', borderColor: formData.refUrl ? '#0070f3' : '#333'}} 
             />
             <div style={{color:'#555', fontSize:'10px', marginTop:'5px', fontStyle:'italic'}}>
                Paste a direct image link (Discord, Imgur, etc) to lock facial consistency.
             </div>
        </div>

        <textarea value={previewBio} readOnly style={{width:'100%', height:'120px', background:'#000', border:'1px solid #444', color:'#00FF88', padding:'15px', fontSize:'13px', fontStyle:'italic', marginBottom:'30px', borderRadius:'4px', lineHeight:'1.5'}} />
        
        {/* BUTTON ROW - UPDATED */}
        <div style={{display:'flex', gap:'15px'}}>
          <button onClick={handleSave} style={{flex:2, background:'#00FF88', color:'#000', padding:'15px', fontWeight:'900', border:'none', cursor:'pointer', borderRadius:'4px'}}>SAVE TO CASTING BOARD</button>
          <button onClick={handleExport} style={{flex:1, background:'transparent', border:'1px solid #00FF88', color:'#00FF88', padding:'15px', fontWeight:'900', cursor:'pointer', borderRadius:'4px'}}>EXPORT JSON</button>
          <button onClick={onClose} style={{flex:1, background:'#222', color:'#fff', padding:'15px', border:'none', cursor:'pointer', borderRadius:'4px'}}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}