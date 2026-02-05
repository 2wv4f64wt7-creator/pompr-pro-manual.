// -------------------------------------------------------------------
// FILE: src/components/ReelColumn.jsx
// VERSION: 10.13 (Modularized)
// -------------------------------------------------------------------

import React, { useState, useEffect } from 'react';

export default function ReelColumn({ 
  title, 
  items, 
  activeIds = [], 
  onSelect, 
  colorTheme = 'blue', 
  showCreateButton = false,
  onCreateClick,
  headerSlot,
  footerSlot,
  onExport 
}) {
  const [filter, setFilter] = useState('ALL');

  const themes = {
    blue: { primary: '#3b82f6', bg: '#3b82f6', border: '#3b82f6' },
    orange: { primary: '#f59e0b', bg: '#f59e0b', border: '#f59e0b' }
  };
  const style = themes[colorTheme];

  const categoryColors = {
    ALL: '#ffffff', 
    STUDIO: '#cbd5e1', PHOTO: '#cbd5e1',
    TECH: '#22d3ee', CYBER: '#22d3ee', 
    HORROR: '#ef4444', 
    LIFE: '#fb923c', LIFESTYLE: '#fb923c', 
    UTIL: '#facc15', UTILITY: '#facc15', 
    LUXE: '#c084fc', LUXURY: '#c084fc', 
    USER: '#10b981', // Custom User Content
    ARMY: '#22c55e', NAVY: '#3b82f6', 
    CORP: '#cbd5e1', CORPORATE: '#cbd5e1', 
    AGENCY: '#e879f9', 
    ROMAN: '#fbbf24', FANTASY: '#fbbf24', 
    VOID: '#f472b6', ABSTRACT: '#f472b6'
  };

  const catLabels = {
    ALL: "All", 
    STUDIO: "Studio", TECH: "Tech", LIFE: "Life", LUXE: "Luxe",
    UTIL: "Util", HORROR: "Horror", CORP: "Corp", ARMY: "Army", 
    NAVY: "Navy", AGENCY: "Agency", ROMAN: "Roman", FANTASY: "Fantasy",
    USER: "Custom", VOID: "Void"
  };

  const getItemCategory = (item) => {
    if (!item) return 'OTHER';
    if (item.category) return item.category.toUpperCase();
    if (item.id && item.id.includes('USER')) return 'USER';
    if (item.id && item.id.includes('_')) {
      const parts = item.id.split('_');
      if (parts.length > 1) return parts[1];
    }
    return 'OTHER';
  };

  const formatLabel = (code) => {
    if (catLabels[code]) return catLabels[code];
    return code ? code.charAt(0).toUpperCase() + code.slice(1).toLowerCase() : "";
  };

  // --- SORTING LOGIC ---
  const PRESET_ORDER = ['ALL', 'CORP', 'LIFE', 'TECH', 'LUXE', 'UTIL', 'VOID'];
  
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const rawCategories = ['ALL', ...new Set(safeItems.map(item => getItemCategory(item)))];
  
  // Sort categories: Presets first in order, then others alphabetically
  const availableCategories = rawCategories.sort((a, b) => {
    const indexA = PRESET_ORDER.indexOf(a);
    const indexB = PRESET_ORDER.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both in preset
    if (indexA !== -1) return -1; // Only A in preset
    if (indexB !== -1) return 1;  // Only B in preset
    return a.localeCompare(b);    // Neither in preset, alpha sort
  });
  
  const filteredItems = filter === 'ALL' 
    ? safeItems 
    : safeItems.filter(item => getItemCategory(item) === filter);

  useEffect(() => {
    if (filter !== 'ALL' && !availableCategories.includes(filter)) {
      setFilter('ALL');
    }
  }, [items, availableCategories, filter]);

  return (
    <section style={{ 
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',  
      borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0, 0, 0, 0.4)', 
      backdropFilter: 'blur(24px)', overflow: 'hidden'        
    }}>
      
      {/* 1. HEADER */}
      <div style={{ flexShrink: 0, padding: '20px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ 
            color: style.primary, fontSize: '13px', fontWeight: '900', letterSpacing:'1.5px', margin: 0, 
            textTransform:'uppercase', textShadow: `0 0 10px ${style.primary}44` 
          }}>{title}</h2>
          {showCreateButton && (
            <button onClick={onCreateClick} style={{ 
              fontSize: '11px', background: 'rgba(255,255,255,0.1)', color: '#fff', 
              border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px', 
              cursor: 'pointer', fontWeight: 'bold'
            }}>+ NEW</button>
          )}
        </div>
        
        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
          {availableCategories.map(cat => {
            const isActive = filter === cat;
            const accentColor = categoryColors[cat] || '#ffffff'; 
            return (
              <button
                key={cat} onClick={() => setFilter(cat)}
                style={{
                  whiteSpace: 'nowrap',
                  background: isActive ? `${accentColor}1A` : '#222222',
                  color: isActive ? accentColor : '#e2e8f0', 
                  border: isActive ? `1px solid ${accentColor}` : '1px solid transparent',
                  padding: '6px 14px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', 
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {formatLabel(cat)}
              </button>
            );
          })}
        </div>
      </div>
      
      {headerSlot && <div style={{ flexShrink: 0, padding: '0 20px 10px 20px' }}>{headerSlot}</div>}

      {/* 2. THE LIST */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 20px 20px 20px', scrollbarWidth: 'thin', scrollbarColor: `${style.primary} transparent` }}>
        {filteredItems.map((item) => {
          if (!item) return null; 
          const isActive = activeIds.includes(item.id);
          const subhead = item.category 
            ? `${item.category} • ${item.details ? item.details.substring(0, 45) : (item.desc ? item.desc.substring(0,45) : '')}...` 
            : `${item.desc ? item.desc.substring(0, 40) : ''}...`;
          
          const catCode = getItemCategory(item);
          const badgeColor = categoryColors[catCode] || '#999';

          return (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)} 
              style={{ 
                padding: '16px', cursor: 'pointer', marginBottom: '10px', borderRadius: '6px',
                background: isActive ? style.bg : '#111', 
                border: isActive ? `1px solid ${style.primary}` : '1px solid #222', 
                borderLeft: isActive ? `4px solid white` : '1px solid #222',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.1s ease-in-out', position: 'relative'
              }}
            >
              {/* LEFT: INFO */}
              <div style={{ overflow: 'hidden', pointerEvents: 'none', flex: 1, marginRight: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: isActive ? 'white' : '#e2e8f0', display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  {item.name}
                  {item.category && (
                    <span style={{ fontSize: '9px', fontWeight: '900', color: isActive ? 'white' : badgeColor, border: `1px solid ${isActive ? 'rgba(255,255,255,0.5)' : badgeColor}`, padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.8)' : '#666', fontWeight:'500' }}>
                  {subhead}
                </div>
              </div>

              {/* RIGHT: DOWNLOAD BUTTON */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  if(onExport) onExport(item);
                }}
                title="Download JSON Card"
                style={{
                  background: 'transparent', border: 'none', color: isActive ? 'white' : '#666',
                  cursor: 'pointer', padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>

            </div>
          );
        })}
      </div>

      {footerSlot && <div style={{ flexShrink: 0 }}>{footerSlot}</div>}
    </section>
  );
}