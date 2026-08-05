// -------------------------------------------------------------------
// FILE: ReelColumn.jsx | VERSION: 4.14 (JSON EXPORT ADDED)
// -------------------------------------------------------------------
import React, { useState } from 'react';

export default function ReelColumn({ title, items, activeIds, colorTheme, onSelect, headerSlot, onAddNew }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const themeColor = colorTheme === 'blue' ? '#3b82f6' : '#ff8a00';

  const coreCategories = ['ALL', 'PEOPLE', 'CORE', 'SCENE', 'USER', 'CUSTOM', 'VOID', 'CRAFT', 'DEFAULT', 'BASIC', 'CORP', 'LIFE', 'TECH', 'UTIL', 'LUXE'];
  
  const categories = ['ALL', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filteredItems = activeCategory === 'ALL' ? items : items.filter(i => i.category === activeCategory);

  const handleDownload = (e, item) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${item.name.replace(/\s+/g, '_')}_pompr.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>
      <div style={{ padding: '20px 20px 10px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: themeColor, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>{title}</h3>
          <button onClick={onAddNew} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontSize: '9px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>+ NEW</button>
        </div>
        
        {headerSlot}

        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => {
            const isExp = !coreCategories.includes((cat || "").toUpperCase().trim());
            return (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                style={{ 
                  padding: '6px 12px', fontSize: '9px', fontWeight: '900', borderRadius: '4px', cursor: 'pointer', 
                  background: activeCategory === cat ? (isExp ? '#7c3aed' : themeColor) : '#1a1a1a', 
                  color: '#fff', whiteSpace: 'nowrap', border: 'none' 
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' }}>
        {filteredItems.map((item) => {
          const isActive = activeIds.includes(item.id);
          const isExp = !coreCategories.includes((item.category || "").toUpperCase().trim());
          const details = item.details || item.desc || "";

          return (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)} 
              title={details}
              style={{ 
                padding: '20px', marginBottom: '10px', cursor: 'pointer', borderRadius: '8px', 
                background: isActive ? `${themeColor}11` : '#111', 
                border: isActive ? `1px solid ${themeColor}` : '1px solid #222', 
                position: 'relative' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: isActive ? '#fff' : themeColor, fontSize: '0.85rem', fontWeight: 'bold' }}>{item.name}</span>
                    {isExp && (
                      <span style={{ background: '#7c3aed', color: '#fff', fontSize: '7px', padding: '2px 4px', borderRadius: '2px', fontWeight: '900' }}>EXP</span>
                    )}
                </div>
                
                {/* JSON Export Button */}
                <button 
                  onClick={(e) => handleDownload(e, item)}
                  title="Download as JSON"
                  style={{ 
                    background: 'transparent', border: 'none', color: isActive ? themeColor : '#555', 
                    cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseOut={(e) => e.currentTarget.style.color = isActive ? themeColor : '#555'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#fff', opacity: 0.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}