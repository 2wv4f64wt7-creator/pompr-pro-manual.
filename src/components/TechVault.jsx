import React from 'react';

export default function TechVaultModal({ onClose, isMatrixSilenced, setIsMatrixSilenced }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '500px', background: '#0f0f0f', border: '1px solid #3b82f6', borderRadius: '12px', padding: '40px', position: 'relative', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
        <div onClick={() => setIsMatrixSilenced(!isMatrixSilenced)} style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', cursor: 'crosshair', zIndex: 10 }} />
        <h2 style={{ color: '#00d4ff', fontSize: '18px', letterSpacing: '4px', marginBottom: '30px', fontWeight: '900' }}>TECH VAULT SYSTEM</h2>
        <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '8px', padding: '20px', marginBottom: '15px' }}>
          <p style={{ color: '#90ee90', fontSize: '11px', fontWeight: 'bold', marginBottom: '15px' }}>IMPORT PRODUCTION REEL</p>
          <button style={{ width: '100%', padding: '15px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '12px' }}>BROWSE JSON FILES</button>
        </div>
        <button style={btnStyle}>EXPORT MASTER BACKUP</button>
        <button style={{ ...btnStyle, color: '#ff4444', border: '1px solid #441111', marginTop: '10px' }}>FACTORY SYSTEM RESET</button>
        <button onClick={onClose} style={{ width: '100%', padding: '15px', background: '#222', color: '#fff', border: 'none', borderRadius: '6px', marginTop: '25px', fontWeight: 'bold' }}>CLOSE VAULT</button>
        {isMatrixSilenced && <p style={{ position: 'absolute', bottom: '-40px', left: 0, right: 0, color: '#ff4444', fontSize: '10px', fontWeight: 'bold' }}>ACTION MATRIX MOOD: SILENCED</p>}
      </div>
    </div>
  );
}
const btnStyle = { width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' };