import React from 'react';
import { APP_PAGE_LIST } from '../navigation/appPages.js';

export default function AppNavBar({ page, onPageChange }) {
  return (
    <nav className="app-nav-bar" role="navigation" aria-label="Application pages">
      <span className="app-nav-brand">Planetary Mobility OS</span>
      {APP_PAGE_LIST.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={page === id ? 'is-active' : ''}
          onClick={() => onPageChange(id)}
          aria-current={page === id ? 'page' : undefined}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
