import React from 'react';

export default function Navbar({
  currentMode,
  setMode,
  accounts,
  selectedAccount,
  onSelectAccount,
  onOpenCreateAccount,
}) {
  return (
    <header className="top-navbar">
      <div className="nav-brand">
        <div className="brand-icon-box">🏛</div>
        <div>
          <div className="brand-title">APEX CORE BANK</div>
          <div className="brand-badge">
            <span className="dot"></span> Core System Active • H2 Engine
          </div>
        </div>
      </div>

      <div className="nav-controls">
        {/* Mode Switcher */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${currentMode === 'customer' ? 'active' : ''}`}
            onClick={() => setMode('customer')}
          >
            <span>👤</span> Customer Banking
          </button>
          <button
            className={`mode-btn ${currentMode === 'admin' ? 'active' : ''}`}
            onClick={() => setMode('admin')}
          >
            <span>🏛</span> Admin Dashboard
          </button>
        </div>

        {/* Customer Account Switcher (Only shown in Customer Mode) */}
        {currentMode === 'customer' && accounts && accounts.length > 0 && (
          <div className="account-selector-widget">
            <div className="avatar-circle">
              {selectedAccount ? selectedAccount.accountHolderName.charAt(0) : '?'}
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Logged In Customer
              </div>
              <select
                className="account-selector-select"
                value={selectedAccount ? selectedAccount.accountNumber : ''}
                onChange={(e) => {
                  const acc = accounts.find((a) => a.accountNumber === e.target.value);
                  if (acc) onSelectAccount(acc);
                }}
              >
                {accounts.map((acc) => (
                  <option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountHolderName} ({acc.accountNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Quick New Account button */}
        <button
          className="btn-primary-action"
          onClick={onOpenCreateAccount}
          title="Open a new customer account"
        >
          <span>+</span> Open Account
        </button>
      </div>
    </header>
  );
}
