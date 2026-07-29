// -------------------------------------------------------------------
// FILE: ReelColumn.jsx | VERSION: 3.6 (TABLET INTEGRITY UPDATE)
// July 29, 2026 Baseline
// -------------------------------------------------------------------
import React, { useState, useRef } from 'react';

export default function ReelColumn({ title, items, activeIds, colorTheme, onSelect, headerSlot, onAddNew, onExport }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const timerRef = useRef(null);
  const themeColor = colorTheme === 'blue' ? '#3b82f6' : '#ff8a00';

  const categories = ['ALL', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filteredItems = activeCategory === 'ALL' ? items : items.filter(i => i.category === activeCategory);

  // ROBUST TABLET HANDLER: Simulates long-press for iPads
  const startPress = (item) => {
    timerRef.current = setTimeout(() => {
      alert(`[ ${item.name.toUpperCase()} ]\n\n${item.details || item.desc}`);
    }, 600); // 600ms hold triggers the detail view
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a' }}>
      <div style={{ padding: '20px 20px 10px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: themeColor, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>{title}</h3>
            <button 
              onClick={onAddNew} 
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontSize: '9px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              + NEW
            </button>
        </div>
        {headerSlot}
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 12px', fontSize: '9px', fontWeight: '900', borderRadius: '4px', cursor: 'pointer',
                background: activeCategory === cat ? (cat === 'ALL' ? themeColor : '#2e1065') : '#1a1a1a',
                color: '#fff', whiteSpace: 'nowrap', 
                border: activeCategory === cat && cat !== 'ALL' ? '1px solid #8b5cf6' : '1px solid transparent'
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' }}>
        {filteredItems.map((item) => {
          const isActive = activeIds.includes(item.id);
          const displayDetails = item.details || item.desc || "";

          return (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              onTouchStart={() => startPress(item)}
              onTouchEnd={endPress}
              onMouseDown={() => startPress(item)} // Desktop long-press support
              onMouseUp={endPress}
              title={displayDetails} // Traditional Hover Tooltip
              style={{ 
                padding: '20px', 
                marginBottom: '10px', 
                cursor: 'pointer', 
                borderRadius: '8px', 
                background: isActive ? `${themeColor}11` : '#111', 
                border: isActive ? `1px solid ${themeColor}` : '1px solid #222', 
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: isActive ? '#fff' : themeColor, fontSize: '0.85rem', fontWeight: 'bold' }}>{item.name}</span>
                
                {/* ACTIVE DOWNLOAD ICON */}
                <button 
                   onClick={(e) => { e.stopPropagation(); onExport(item); }} 
                   style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#444', fontSize: '16px', padding: '4px' }}
                   onMouseOver={(e) => e.target.style.color = themeColor}
                   onMouseOut={(e) => e.target.style.color = '#444'}
                >
                   ↓
                </button>
              </div>

              {/* CLAMPED DESCRIPTION (2 LINES) */}
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem', 
                color: '#fff', 
                lineHeight: '1.5', 
                opacity: 0.8,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {displayDetails}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}