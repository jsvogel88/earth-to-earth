import React from 'react';
import { LAYOUT_MODE_LIST } from '../layout/layoutModes.js';

export default function LayoutModeBar({ mode, onModeChange }) {
  return (
    <div className="layout-mode-bar" role="toolbar" aria-label="Viewport layout">
      {LAYOUT_MODE_LIST.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={mode === id ? 'is-active' : ''}
          onClick={() => onModeChange(id)}
          aria-pressed={mode === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
