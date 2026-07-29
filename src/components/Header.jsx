// -------------------------------------------------------------------
// FILE: Header.jsx | VERSION: 3.5 (TABLET SMART-NAV)
// -------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import logo from '../assets/POMPR_LOGO_WHT_HOR.svg';

export default function Header({ onOpenVault, layoutMode, setLayoutMode }) {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBtnStyle = (mode) => ({
    padding: '8px 14px', 
    fontSize: '10px', 
    fontWeight: '900', 
    letterSpacing: '1px',
    cursor: 'pointer', 
    border: 'none', 
    background: 'transparent',
    color: layoutMode === mode ? '#3b82f6' : '#444', 
    transition: '0.3s',
    textTransform: 'uppercase'
  });

  return (
    <div style={{ 
      height: '96px', 
      background: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 24px', 
      justifyContent: 'space-between', 
      borderBottom: '1px solid #1a1a1a' 
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={logo} alt="POMPR" style={{ height: '48px', width: 'auto', userSelect: 'none' }} />
        <div style={{ background: '#3b82f6', color: '#fff', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '3px', marginTop: '12px' }}>V2.1</div>
      </div>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={() => setLayoutMode('CASTING')} style={getBtnStyle('CASTING')}>CASTING</button>
        
        {/* WORKSTATION MODE: Hidden on iPad Mini / Portrait Tablets */}
        {!isNarrow && (
          <button onClick={() => setLayoutMode('WORKSTATION')} style={getBtnStyle('WORKSTATION')}>WORKSTATION</button>
        )}
        
        <button onClick={() => setLayoutMode('DIRECTING')} style={getBtnStyle('DIRECTING')}>DIRECTING</button>
        <span style={{color:'#222'}}>|</span>
        
        <button 
          onClick={onOpenVault} 
          style={{ 
            padding: '8px 14px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', 
            cursor: 'pointer', border: '1px solid #10b981', background: 'transparent', 
            color: '#10b981', borderRadius: '4px', transition: '0.3s' 
          }}
        >
          [ LOAD REEL ]
        </button>
      </div>

      <a 
        href="https://pompr.gumroad.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ color: '#3b82f6', fontWeight: '900', fontSize: '10px', textDecoration: 'none', letterSpacing: '1px' }}
      >
        [SHOP]
      </a>
    </div>
  );
}