import React, { useState } from 'react';
import { resolveCopilotPrompt } from '../copilotActions.js';

const SUGGESTED_PROMPTS = [
  'Explain this network to me.',
  'Build a Mars logistics scenario for 1 million people.',
  'Show PETABOND deployment routes.',
  'Show only cargo routes.',
  'Moon logistics staging',
  'Why use remote Starbase hubs instead of dense cities for E2M?',
];

export default function MissionCopilotPanel({
  onApplyCopilotAction,
  copilotHistory = [],
  onRunPrompt,
}) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const runPrompt = (text) => {
    const trimmed = String(text ?? '').trim();
    if (!trimmed) return;
    const { response: reply, action } = resolveCopilotPrompt(trimmed);
    setResponse(reply);
    setPendingAction(action);
    setInput(trimmed);
    onRunPrompt?.(trimmed, reply);
  };

  const applyToMap = () => {
    if (!pendingAction) return;
    onApplyCopilotAction?.(pendingAction);
    setPendingAction(null);
  };

  return (
    <div className="pls-panel" data-testid="studio-copilot-panel">
      <h3 className="pls-h3">Mission Copilot</h3>
      <p className="pls-sub">Deterministic suggestions — optional, not the default experience.</p>
      {copilotHistory.length > 0 && (
        <details className="pls-copilot-history" data-testid="copilot-history">
          <summary>Recent prompts ({copilotHistory.length})</summary>
          <ul>
            {copilotHistory.slice(0, 6).map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="pls-btn pls-btn-ghost pls-btn-sm"
                  onClick={() => runPrompt(entry.prompt)}
                >
                  {entry.prompt}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="pls-prompt-list">
        {SUGGESTED_PROMPTS.map((p) => (
          <button key={p} type="button" className="pls-btn pls-btn-ghost pls-btn-sm" onClick={() => runPrompt(p)}>
            {p}
          </button>
        ))}
      </div>
      <textarea
        className="pls-input"
        rows={3}
        placeholder="Describe your mission…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        data-testid="copilot-input"
      />
      <button
        type="button"
        className="pls-btn pls-btn-primary"
        onClick={() => runPrompt(input || 'Explain this network')}
      >
        Ask Copilot
      </button>
      {response && (
        <div className="pls-copilot-response" data-testid="copilot-response">
          <p>{response}</p>
          <button
            type="button"
            className={`pls-btn pls-btn-sm ${pendingAction ? 'pls-btn-primary' : ''}`}
            data-testid="copilot-apply-map"
            disabled={!pendingAction}
            onClick={applyToMap}
          >
            Apply to Map
          </button>
        </div>
      )}
    </div>
  );
}
