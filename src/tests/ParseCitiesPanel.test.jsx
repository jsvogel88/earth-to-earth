import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParseCitiesPanel from '../components/sidebar/ParseCitiesPanel.jsx';

function mockHook(overrides = {}) {
  return {
    parsedCities: [],
    previewCities: [],
    setPreviewCities: vi.fn(),
    setParseErrors: vi.fn(),
    lastParseResult: null,
    setLastParseResult: vi.fn(),
    addAll: vi.fn(() => []),
    remove: vi.fn(),
    removeAll: vi.fn(),
    exportJson: vi.fn(() => '{}'),
    importJson: vi.fn(() => []),
    showOnlyParsedCities: false,
    setShowOnlyParsedCities: vi.fn(),
    autoFitParsedBounds: true,
    setAutoFitParsedBounds: vi.fn(),
    hasMapPoints: false,
    mapPoints: [],
    parsedWorldCityIds: new Set(),
    parsedOverlayIds: new Set(),
    ...overrides,
  };
}

describe('ParseCitiesPanel', () => {
  it('renders textarea and action buttons', () => {
    render(<ParseCitiesPanel parsedCitiesHook={mockHook()} existingWorldCityIds={new Set()} />);
    expect(screen.getByLabelText(/city list to parse/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^parse$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add all/i })).toBeInTheDocument();
  });

  it('shows count badges after parse result', () => {
    const hook = mockHook({
      lastParseResult: {
        parsedCount: 3,
        failedCount: 1,
        duplicateCount: 0,
        alreadyAddedCount: 0,
        valid: [],
        invalid: [],
        duplicates: [],
        alreadyAdded: [],
        unresolved: [{ rawInput: 'Bad', status: 'unresolved' }],
        lines: [],
        totalLines: 4,
      },
    });
    render(<ParseCitiesPanel parsedCitiesHook={hook} existingWorldCityIds={new Set()} />);
    expect(screen.getByTitle('Parsed valid')).toBeInTheDocument();
  });

  it('renders Show Only Parsed Cities toggle', () => {
    render(
      <ParseCitiesPanel
        parsedCitiesHook={mockHook({ hasMapPoints: true, mapPoints: [{ id: 'p1' }] })}
        existingWorldCityIds={new Set()}
      />
    );
    expect(screen.getByLabelText(/show only parsed cities/i)).toBeInTheDocument();
  });

  it('clears input on Clear', () => {
    const hook = mockHook();
    render(<ParseCitiesPanel parsedCitiesHook={hook} existingWorldCityIds={new Set()} />);
    const textarea = screen.getByLabelText(/city list to parse/i);
    fireEvent.change(textarea, { target: { value: 'Tokyo' } });
    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));
    expect(textarea.value).toBe('');
    expect(hook.setLastParseResult).toHaveBeenCalledWith(null);
  });
});
