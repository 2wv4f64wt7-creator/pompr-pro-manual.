/* POMPR-PRO COMPONENT: SCRIPT CONSOLE
   VERSION: V13.1 (RUNTIME CRASH FIX)
   ARCHITECT NOTE: Eradicated all ghost variables causing ReferenceErrors.
*/

import React, { useState, useMemo } from 'react';
import ActionMatrixV2 from './ActionMatrixV2';

const ScriptConsole = (props) => {
  const {
    isManual,
    setIsManual,
    manualText,
    setManualText,
    fullDynamicString,
    dynamicPrompt,
    actor1,
    actor2,
    interaction,
    interactions = [],
    setInteraction,
    seed,
    setSeed,
    globalParams,
    setGlobalParams,
    onRandomix,
    setAction,
    actions = [],
  } = props;

  const [promptTier, setPromptTier] = useState('FULL');
  const [copyFeedback, setCopyFeedback] = useState('COPY');

  const [isSymmetry, setIsSymmetry] = useState(false);
  const [povMode, setPovMode] = useState(0);

  // --- DYNAMIC PRUNING, SYMMETRY, & CAMERA ENGINE ---
  const displayString = useMemo(() => {
    if (!dynamicPrompt || (!actor1 && !actor2 && !dynamicPrompt.subject))
      return fullDynamicString;

    const cine = dynamicPrompt.cine || '';
    const tail = dynamicPrompt.commercialTail
      ? `\n${dynamicPrompt.commercialTail}`
      : '';

    let activeSubjText = dynamicPrompt.subject || '';
    let activeEnsText = dynamicPrompt.ensemble || '';
    let shortSubj = actor1 ? `SUBJECT: ${actor1.name} (Ref #1).` : '';
    let shortEns = actor2
      ? `\nENSEMBLE: ${interaction} ${actor2.name} (Ref #2).`
      : '';

    let currentSubjectName = actor1 ? actor1.name : 'Subject';
    let currentEnsembleName = actor2 ? actor2.name : 'Ensemble';

    if (isSymmetry && actor1 && actor2) {
      activeSubjText = `SUBJECT: ${actor2.name} (${actor2.details}), wearing ${actor2.outfit}.`;
      activeEnsText = `\nENSEMBLE: ${interaction} ${actor1.name} (${actor1.details}), wearing ${actor1.outfit}.`;
      shortSubj = `SUBJECT: ${actor2.name} (Ref #1).`;
      shortEns = `\nENSEMBLE: ${interaction} ${actor1.name} (Ref #2).`;
      currentSubjectName = actor2.name;
      currentEnsembleName = actor1.name;
    }

    let povText = '';
    if (povMode !== 0) {
      if (actor1 && actor2) {
        if (povMode === 1)
          povText = `\nCAMERA: Over-the-shoulder shot from behind ${currentEnsembleName}, focusing on ${currentSubjectName}.`;
        else if (povMode === 2)
          povText = `\nCAMERA: Over-the-shoulder shot from behind ${currentSubjectName}, focusing on ${currentEnsembleName}.`;
      } else if (actor1) {
        if (povMode === 1)
          povText = `\nCAMERA: Over-the-shoulder shot from behind ${currentSubjectName}, looking forward at the environment.`;
        else if (povMode === 2)
          povText = `\nCAMERA: First-person POV from the exact perspective of ${currentSubjectName}.`;
      }
    }

    const core = `${activeSubjText}${activeEnsText}${
      dynamicPrompt.action || ''
    }${povText}${dynamicPrompt.scene || ''}`;

    let resultText = '';

    if (promptTier === 'SHORT') {
      const shortAct = dynamicPrompt.action || '';
      let shortScene = '';
      if (dynamicPrompt.scene) {
        const rawSceneName = dynamicPrompt.scene
          .replace('\nSCENE: ', '')
          .split(' (')[0]
          .trim();
        shortScene = `\nSCENE: ${rawSceneName}.`;
      }
      resultText =
        `${shortSubj}${shortEns}${shortAct}${povText}${shortScene}`.trim();
    } else if (promptTier === 'MEDIUM') {
      let prunedStyle = '';
      if (dynamicPrompt.style) {
        const rawTokens = dynamicPrompt.style
          .replace(/\n?STYLE:\s*/, '')
          .split(',');
        prunedStyle = `\nSTYLE: ${rawTokens.slice(0, 5).join(',').trim()}.`;
      }
      let prunedTail = tail;
      const noMatch = tail.match(/--no\s+(.*?)(?=\s--|$)/);
      if (noMatch)
        prunedTail = tail.replace(
          noMatch[0],
          `--no ${noMatch[1].split(',').slice(0, 3).join(',').trim()}`
        );
      resultText = `${core}${cine}${prunedStyle}${prunedTail}`.trim();
    } else {
      resultText = `${core}${cine}${
        dynamicPrompt.style ? `\n${dynamicPrompt.style}` : ''
      }${tail}`.trim();
    }

    return resultText;
  }, [
    dynamicPrompt,
    fullDynamicString,
    promptTier,
    actor1,
    actor2,
    interaction,
    isSymmetry,
    povMode,
  ]);

  const handleActionSelect = (act) => {
    if (act.category === 'UTILITY') {
      const currentText = isManual ? manualText : displayString;
      setIsManual(true);
      const isEmpty =
        !currentText ||
        currentText.trim() === '' ||
        currentText.includes('Awaiting director input');
      if (isEmpty) setManualText(act.desc);
      else setManualText(currentText.trim() + `\n\nUTILITY: ${act.desc}`);
    } else {
      setAction(act);
      setIsManual(false);
    }
  };

  const compileFinalOutput = () => {
    const baseText = isManual ? manualText : displayString;
    if (!baseText) return '';
    const seedInjection = seed ? ` --seed ${seed}` : '';
    const paramsInjection = globalParams ? ` ${globalParams}` : '';
    return `${baseText}${seedInjection}${paramsInjection}`.trim();
  };

  const handleCopy = () => {
    const finalString = compileFinalOutput();
    if (!finalString) return;
    navigator.clipboard.writeText(finalString).then(() => {
      setCopyFeedback('COPIED!');
      setTimeout(() => setCopyFeedback('COPY'), 2000);
    });
  };

  const handleSave = () => {
    const finalString = compileFinalOutput();
    if (!finalString) return;
    const element = document.createElement('a');
    const file = new Blob([finalString], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `POMPR_${promptTier}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderColoredText = () => {
    if (!displayString)
      return (
        <span style={{ color: '#444', fontStyle: 'italic' }}>
          Awaiting director input...
        </span>
      );
    return displayString.split('\n').map((line, idx) => {
      let color = '#ccc';
      if (line.startsWith('SCENE:')) color = '#3b82f6';
      else if (line.startsWith('SUBJECT:') || line.startsWith('ENSEMBLE:'))
        color = '#f59e0b';
      else if (line.startsWith('ACTION:')) color = '#10b981';
      else if (line.startsWith('STYLE:')) color = '#8b5cf6';
      else if (line.startsWith('NEGATIVE:') || line.startsWith('--no'))
        color = '#ef4444';
      else if (line.startsWith('CAMERA:')) color = '#a855f7';
      return (
        <div
          key={idx}
          style={{ color, marginBottom: '2px', lineHeight: '1.5' }}
        >
          {line}
        </div>
      );
    });
  };

  const hasMeta =
    dynamicPrompt && dynamicPrompt.style && dynamicPrompt.style.trim() !== '';

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#080808',
      color: '#fff',
      borderLeft: '1px solid #1a1a1a',
    },
    deckA: {
      flex: '1',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem',
      gap: '0.75rem',
      borderBottom: '1px solid #1a1a1a',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    tierToggle: {
      display: 'flex',
      gap: '4px',
      background: '#111',
      padding: '3px',
      borderRadius: '6px',
      alignItems: 'center',
    },
    tierBtn: (active, isM) => ({
      padding: '5px 12px',
      fontSize: '0.6rem',
      fontWeight: '900',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      background: active
        ? isM
          ? '#f59e0b'
          : '#3b82f6'
        : isM
        ? '#222'
        : 'transparent',
      color: active ? '#fff' : isM ? '#888' : '#444',
      transition: '0.2s ease',
      letterSpacing: '1px',
    }),
    povBtn: (mode) => ({
      padding: '5px 12px',
      fontSize: '0.6rem',
      fontWeight: '900',
      border: '1px solid #333',
      borderRadius: '4px',
      cursor: 'pointer',
      background: mode === 1 ? '#3b82f6' : mode === 2 ? '#f59e0b' : '#222',
      color: mode > 0 ? '#fff' : '#888',
      transition: '0.2s ease',
      letterSpacing: '1px',
      marginLeft: '4px',
    }),
    displayBox: {
      flex: '1',
      minHeight: 0,
      backgroundColor: '#030303',
      border: '1px solid #111',
      borderRadius: '4px',
      padding: '1.25rem',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
    },
    statusBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#111',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '0.65rem',
      border: '1px solid #222',
      color: '#888',
      fontWeight: 'bold',
      letterSpacing: '1px',
      flexShrink: 0,
    },
    clearBtn: {
      background: 'transparent',
      border: '1px solid #444',
      color: '#ef4444',
      fontSize: '0.55rem',
      padding: '2px 8px',
      borderRadius: '2px',
      cursor: 'pointer',
    },
    deckB: {
      flex: '0 0 auto',
      padding: '1rem',
      backgroundColor: '#0a0a0a',
      borderBottom: '1px solid #1a1a1a',
      display: 'flex',
      gap: '1.5rem',
      flexShrink: 0,
    },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: {
      fontSize: '0.55rem',
      color: '#333',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '4px',
    },
    select: {
      background: '#111',
      border: '1px solid #222',
      color: '#aaa',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
    },
    input: {
      background: '#111',
      border: '1px solid #222',
      color: '#aaa',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      width: '100%',
      boxSizing: 'border-box',
    },
    deckC: {
      flex: '1.2',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    btnGroup: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
    btnPrimary: {
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: '4px',
      background: '#3b82f6',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    btnSecondary: {
      flex: 1,
      padding: '12px',
      border: '1px solid #222',
      borderRadius: '4px',
      background: '#0a0a0a',
      color: '#666',
      cursor: 'pointer',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.deckA}>
        <div style={styles.headerRow}>
          <div style={styles.tierToggle}>
            <button
              style={styles.tierBtn(promptTier === 'SHORT')}
              onClick={() => setPromptTier('SHORT')}
            >
              SHORT
            </button>
            <button
              style={styles.tierBtn(promptTier === 'MEDIUM')}
              onClick={() => setPromptTier('MEDIUM')}
            >
              MEDIUM
            </button>
            <button
              style={styles.tierBtn(promptTier === 'FULL')}
              onClick={() => setPromptTier('FULL')}
            >
              FULL
            </button>

            <div
              style={{
                width: '1px',
                height: '20px',
                background: '#333',
                margin: '0 6px',
              }}
            ></div>

            {actor2 && (
              <button
                style={{
                  ...styles.tierBtn(isSymmetry, true),
                  border: '1px solid #333',
                }}
                onClick={() => setIsSymmetry(!isSymmetry)}
                title="Swaps Actor 1 & 2 Roles"
              >
                {isSymmetry ? 'STAGE FLIPPED' : 'FLIP STAGE'}
              </button>
            )}

            {actor1 && (
              <button
                style={styles.povBtn(povMode)}
                onClick={() =>
                  setPovMode(povMode === 0 ? 1 : povMode === 1 ? 2 : 0)
                }
                title="Toggle Camera Perspective"
              >
                {povMode === 0
                  ? 'SWAP POV'
                  : povMode === 1
                  ? 'POV: SHOT 1'
                  : 'POV: SHOT 2'}
              </button>
            )}
          </div>

          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              color: hasMeta ? '#8b5cf6' : '#444',
            }}
          >
            {hasMeta ? '🟢 META ACTIVE' : '⭕ NO META'}
          </div>

          <button
            style={{
              ...styles.tierBtn(isManual),
              background: isManual ? '#b91c1c' : '#111',
              color: '#fff',
            }}
            onClick={() => {
              if (!isManual) setManualText(displayString);
              setIsManual(!isManual);
            }}
            title={
              isManual
                ? 'Switch to Auto Mode to use color-blocks'
                : 'Switch to Manual Mode to edit text'
            }
          >
            {isManual ? 'MANUAL MODE' : 'AUTO MODE'}
          </button>
        </div>

        {isManual ? (
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            style={{
              ...styles.displayBox,
              backgroundColor: '#030303',
              color: '#ccc',
              border: '1px solid #333',
              resize: 'none',
              lineHeight: '1.5',
              outline: 'none',
            }}
          />
        ) : (
          <div style={styles.displayBox}>{renderColoredText()}</div>
        )}

        {seed && (
          <div style={styles.statusBar}>
            <span>
              ACTIVE SEED: <span style={{ color: '#fff' }}>{seed}</span>
            </span>
            <button style={styles.clearBtn} onClick={() => setSeed('')}>
              CLEAR SEED
            </button>
          </div>
        )}

        <div style={styles.btnGroup}>
          <button style={styles.btnPrimary} onClick={handleCopy}>
            {copyFeedback}
          </button>
          <button style={styles.btnSecondary} onClick={handleSave}>
            EXPORT .TXT
          </button>
          <button
            style={{
              ...styles.btnSecondary,
              background: '#2e1065',
              color: '#ddd',
              border: 'none',
            }}
            onClick={onRandomix}
          >
            RANDOMIX
          </button>
        </div>
      </div>

      <div style={styles.deckB}>
        <div style={{ ...styles.inputGroup, flex: 0.4 }}>
          <span style={styles.label}>ENSEMBLE</span>
          <select
            style={styles.select}
            value={interaction || 'With'}
            onChange={(e) => {
              setInteraction(e.target.value);
              setIsManual(false);
            }}
          >
            {interactions.map((i, idx) => (
              <option key={idx} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.inputGroup, flex: 0.6 }}>
          <span style={styles.label}>GLOBAL SREF / TECH PARAMS</span>
          <input
            style={styles.input}
            placeholder="e.g., --v 6.1 --sref URL --ar 16:9"
            value={globalParams}
            onChange={(e) => setGlobalParams(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.deckC}>
        <ActionMatrixV2 actions={actions} onSelectAction={handleActionSelect} />
      </div>
    </div>
  );
};

export default ScriptConsole;
