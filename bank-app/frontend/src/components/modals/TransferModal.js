import React, { useState } from 'react';
import { api } from '../../api';

export default function TransferModal({ account, allAccounts, isOpen, onClose, onSuccess, notify }) {
  const [destAccount, setDestAccount] = useState('');
  const [customDest, setCustomDest] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !account) return null;

  const currentBalance = Number(account.balance || 0);
  const transferNum = Number(amount || 0);
  const remainingBalance = currentBalance - transferNum;
  const isInsufficient = transferNum > currentBalance;

  // Filter out current account from available recipient options
  const otherAccounts = (allAccounts || []).filter(
    (a) => a.accountNumber !== account.accountNumber && a.status === 'ACTIVE'
  );

  const targetAccountNumber = isManualInput ? customDest.trim() : destAccount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetAccountNumber) {
      notify('Please select or enter a recipient account number', 'error');
      return;
    }
    if (targetAccountNumber === account.accountNumber) {
      notify('Source and destination accounts must be different', 'error');
      return;
    }
    if (!transferNum || transferNum <= 0) {
      notify('Please enter a valid transfer amount', 'error');
      return;
    }
    if (isInsufficient) {
      notify('Transfer amount exceeds available balance', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.transfer(account.accountNumber, targetAccountNumber, transferNum);
      notify(`Transfer of KES ${transferNum.toLocaleString()} completed successfully!`, 'success');
      setAmount('');
      setMemo('');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message || 'Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <span>🔁</span> Inter-Account Funds Transfer
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Transfer From (Debit)</label>
              <input
                className="form-input"
                disabled
                value={`${account.accountHolderName} • Available: KES ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Recipient (Credit)</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  onClick={() => setIsManualInput(!isManualInput)}
                >
                  {isManualInput ? '⟵ Select from accounts' : 'Enter custom account number ➔'}
                </button>
              </div>

              {isManualInput ? (
                <input
                  type="text"
                  required
                  placeholder="e.g. KE108492019"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={customDest}
                  onChange={(e) => setCustomDest(e.target.value.toUpperCase())}
                />
              ) : (
                <select
                  required
                  className="form-input"
                  value={destAccount}
                  onChange={(e) => setDestAccount(e.target.value)}
                >
                  <option value="">-- Choose recipient account --</option>
                  {otherAccounts.map((a) => (
                    <option key={a.accountNumber} value={a.accountNumber}>
                      {a.accountHolderName} ({a.accountNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Transfer Amount (KES)</label>
              <div className="input-currency-wrapper">
                <span className="input-currency-prefix">KES</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentBalance}
                  required
                  placeholder="0.00"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="quick-amount-chips">
                {[1000, 5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`amount-chip ${amount === preset.toString() ? 'active' : ''}`}
                    onClick={() => setAmount(preset.toString())}
                    disabled={preset > currentBalance}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Reference / Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Business supplies, Rent split, Invoice #102"
                className="form-input"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {isInsufficient ? (
              <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', color: '#fb7185', fontSize: 13, border: '1px solid rgba(244,63,94,0.3)' }}>
                ⚠️ Transfer amount exceeds your available balance of KES {currentBalance.toLocaleString()}
              </div>
            ) : (
              <div className="projection-banner">
                <div>
                  <div className="projection-label">Fee: <strong style={{ color: 'var(--success)' }}>FREE (KES 0.00)</strong></div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Instant Core Settlement</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="projection-label">Remaining Balance</div>
                  <div className="projection-value">
                    KES {Math.max(0, remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !transferNum || transferNum <= 0 || isInsufficient || !targetAccountNumber}
            >
              {loading ? 'Settling Transfer...' : 'Execute Instant Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
