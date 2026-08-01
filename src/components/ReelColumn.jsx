// -------------------------------------------------------------------
// FILE: ReelColumn.jsx | VERSION: 4.3 (PURPLE TAG WHITESPACE FIX)
// -------------------------------------------------------------------
import React, { useState } from 'react';

export default function ReelColumn({ title, items, activeIds, colorTheme, onSelect, headerSlot, onAddNew }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const themeColor = colorTheme === 'blue' ? '#3b82f6' : '#ff8a00';
  const expansionCategories = ['VOID', 'USER', 'CUSTOM', 'EXPANSION'];

  const categories = ['ALL', ...new Set(items.map(i => i.category).filter(Boolean))];
  const filteredItems = activeCategory === 'ALL' ? items : items.filter(i => i.category === activeCategory);

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
            // FIX: Added .trim() to catch hidden spaces
            const isExp = expansionCategories.some(ex => ex.toUpperCase() === (cat || "").trim().toUpperCase());
            return (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 12px', fontSize: '9px', fontWeight: '900', borderRadius: '4px', cursor: 'pointer',
                  background: activeCategory === cat ? (isExp ? '#7c3aed' : themeColor) : '#1a1a1a',
                  color: '#fff', whiteSpace: 'nowrap', border: 'none'
                }}
              >{cat}</button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' }}>
        {filteredItems.map((item) => {
          const isActive = activeIds.includes(item.id);
          // FIX: Added .trim() here as well for the individual item tags
          const isExp = expansionCategories.some(ex => ex.toUpperCase() === (item.category || "").trim().toUpperCase());
          const details = item.details || item.desc || "";

          return (
            <div key={item.id} onClick={() => onSelect(item)} title={details}
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
                    {isExp && ( <span style={{ background: '#7c3aed', color: '#fff', fontSize: '7px', padding: '2px 4px', borderRadius: '2px', fontWeight: '900' }}>EXP</span> )}
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#fff', opacity: 0.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}