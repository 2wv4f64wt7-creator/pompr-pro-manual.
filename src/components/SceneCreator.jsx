import React, { useState } from 'react';

export default function SceneCreator({ onClose, onSave }) {
  const [formData, setFormData] = useState({ name: '', description: '', lighting: '' });

  const handleSave = () => {
    const card = {
      ...formData,
      id: `S_USER_${Date.now()}`,
      category: "CUSTOM",
      meta: { created: new Date().toISOString(), type: "POMPR_SCENE_CARD" }
    };
    
    // Download JSON
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Scene_${formData.name || 'New'}.json`;
    link.click();

    onSave(card);
    onClose();
  };

  const s = { input: { width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', marginBottom: '15px' } };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '450px', background: '#0a0a0a', border: '1px solid #3b82f6', padding: '30px', borderRadius: '8px' }}>
        <h3 style={{ color: '#3b82f6', letterSpacing: '2px', fontSize: '12px', marginBottom: '20px' }}>NEW SCENE CARD</h3>
        <input style={s.input} placeholder="SCENE NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <textarea style={{ ...s.input, height: '80px' }} placeholder="DESCRIPTION" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        <input style={s.input} placeholder="LIGHTING" value={formData.lighting} onChange={e => setFormData({...formData, lighting: e.target.value})} />
        <button onClick={handleSave} style={{ width: '100%', padding: '15px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SAVE & DOWNLOAD JSON</button>
        <button onClick={onClose} style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '10px' }}>CANCEL</button>
      </div>
    </div>
  );
}