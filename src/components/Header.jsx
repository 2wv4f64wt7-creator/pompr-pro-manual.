// -------------------------------------------------------------------
// FILE: src/components/Header.jsx
// VERSION: 10.6 (Modularized)
// -------------------------------------------------------------------
import React from 'react';

export default function Header({ onOpenVault }) {
  const baseButtonStyle = {
    background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff', padding: '8px 24px', fontSize: '11px', fontWeight: '800',
    letterSpacing: '1.5px', textTransform: 'uppercase', borderRadius: '4px',
    cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', height: '36px' 
  };

  return (
    <header style={{ height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'transparent', backdropFilter: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 50, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/logo.svg" alt="POMPR-PRO" style={{ height: '24px', width: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
        <h1 style={{ display: 'none', fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: 'white' }}>POMPR-PRO</h1>
        <span style={{ background: '#10b981', color: 'black', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>V11 MODULAR</span>
      </div>
      <nav style={{ display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => window.open('https://bobaiese8.gumroad.com/', '_blank')}
          style={baseButtonStyle} 
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} 
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; }}
        >
          Shop
        </button>
      </nav>
      <button onClick={onOpenVault} style={{ ...baseButtonStyle, color: '#00C6FF', borderColor: 'rgba(0, 198, 255, 0.4)', boxShadow: '0 0 15px rgba(0, 198, 255, 0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 198, 255, 0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 198, 255, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 198, 255, 0.1)'; }}>Reel Loader</button>
    </header>
  );
}