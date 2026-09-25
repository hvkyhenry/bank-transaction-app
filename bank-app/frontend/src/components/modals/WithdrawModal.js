import React, { useState } from 'react';
import { api } from '../../api';

export default function WithdrawModal({ account, isOpen, onClose, onSuccess, notify }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !account) return null;

  const currentBalance = Number(account.balance || 0);
  const withdrawNum = Number(amount || 0);
  const remainingBalance = currentBalance - withdrawNum;
  const isInsufficient = withdrawNum > currentBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawNum || withdrawNum <= 0) {
      notify('Please enter a valid withdrawal amount', 'error');
      return;
    }
    if (isInsufficient) {
      notify('Insufficient funds in account', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.withdraw(account.accountNumber, withdrawNum);
      notify(`Successfully withdrew KES ${withdrawNum.toLocaleString()} from account`, 'success');
      setAmount('');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message || 'Withdrawal failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChip = (val) => {
    setAmount(val.toString());
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <span>📤</span> Withdraw Cash / Funds
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Source Account</label>
              <input
                className="form-input"
                disabled
                value={`${account.accountHolderName} (${account.accountNumber})`}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Withdrawal Amount (KES)</label>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Available: <strong style={{ color: 'var(--text-primary)' }}>KES {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <div className="input-currency-wrapper">
                <span className="input-currency-prefix">KES</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentBalance}
                  autoFocus
                  required
                  placeholder="0.00"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="quick-amount-chips">
                {[1000, 2000, 5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`amount-chip ${amount === preset.toString() ? 'active' : ''}`}
                    onClick={() => handleChip(preset)}
                    disabled={preset > currentBalance}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {isInsufficient ? (
              <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', color: '#fb7185', fontSize: 13, border: '1px solid rgba(244,63,94,0.3)' }}>
                ⚠️ Amount exceeds your available balance of KES {currentBalance.toLocaleString()}
              </div>
            ) : (
              <div className="projection-banner">
                <div>
                  <div className="projection-label">Current Balance</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    KES {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>➔</div>
                <div style={{ textAlign: 'right' }}>
                  <div className="projection-label">Remaining Balance</div>
                  <div className="projection-value" style={{ color: remainingBalance >= 0 ? '#38bdf8' : '#fb7185' }}>
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
              className="btn-submit danger"
              disabled={loading || !withdrawNum || withdrawNum <= 0 || isInsufficient}
            >
              {loading ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
