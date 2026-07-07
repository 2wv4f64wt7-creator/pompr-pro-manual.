// -------------------------------------------------------------------
// FILE: src/components/ReelColumn.jsx
// VERSION: 12.2 (READABILITY UPGRADE)
// ARCHITECT NOTE: Description text forced to solid white for maximum contrast.
// -------------------------------------------------------------------

import React, { useState } from 'react';

const DEFAULT_CATEGORIES = ['ALL', 'CORP', 'LIFE', 'TECH', 'LUXE', 'UTIL', 'VOID', 'GENERIC'];
const EXPANSION_COLOR = '#a855f7'; // Vibrant Purple for imported reels

export default function ReelColumn({ 
  title, items = [], activeIds = [], onSelect, onExport, 
  colorTheme = 'blue', showCreateButton, onCreateClick, headerSlot 
}) {
  const [filter, setFilter] = useState('ALL');

  const themeColors = {
    blue: { border: '#3b82f6', text: '#60a5fa', bg: 'rgba(59, 130, 246, 0.05)', hoverBg: 'rgba(59, 130, 246, 0.15)' },
    orange: { border: '#f59e0b', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.05)', hoverBg: 'rgba(245, 158, 11, 0.15)' }
  };
  const theme = themeColors[colorTheme];

  const categories = ['ALL', ...new Set(items.map(i => i.category || 'GENERIC'))];
  const filteredItems = filter === 'ALL' ? items : items.filter(i => i.category === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0a0a0a', padding: '1.25rem', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '2px', color: theme.text, textTransform: 'uppercase' }}>{title}</h2>
        {showCreateButton && (
          <button onClick={onCreateClick} style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '4px 10px', fontSize: '0.65rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ NEW</button>
        )}
      </div>

      {headerSlot}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {categories.map(c => {
          const isExpansion = !DEFAULT_CATEGORIES.includes(c);
          const activeColor = isExpansion ? EXPANSION_COLOR : theme.text;
          
          return (
            <button 
              key={c} onClick={() => setFilter(c)}
              style={{
                padding: '4px 10px', fontSize: '0.6rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s',
                background: filter === c ? activeColor : '#111', 
                color: filter === c ? '#fff' : (isExpansion ? activeColor : '#888'), 
                border: `1px solid ${filter === c ? activeColor : (isExpansion ? '#4c1d95' : '#333')}`
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '5px', paddingBottom: '3rem' }}>
        {filteredItems.map(item => {
          const isActive = activeIds.includes(item.id);
          const isExpansion = item.isCustom && !DEFAULT_CATEGORIES.includes(item.category);
          const tagName = item.category || 'CUSTOM';

          return (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              style={{
                background: isActive ? theme.hoverBg : theme.bg, 
                border: `1px solid ${isActive ? theme.border : '#222'}`, 
                borderRadius: '6px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
              }}
            >
              <div style={{ fontSize: '0.65rem', color: theme.text, fontWeight: 'bold', marginBottom: '4px' }}>
                {item.name} 
                {item.isCustom && (
                  <span style={{color: isExpansion ? EXPANSION_COLOR : '#888', fontSize: '0.55rem', marginLeft: '6px', letterSpacing: '0.5px'}}>
                    ({tagName})
                  </span>
                )}
              </div>
              {/* ARCHITECT FIX: Description text is now pure white (#fff) */}
              <div style={{ fontSize: '0.7rem', color: '#fff', lineHeight: '1.4' }}>{item.desc || item.details}</div>
              
              {onExport && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onExport(item); }}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem' }}
                  title="Export to File"
                >
                  ↓
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}