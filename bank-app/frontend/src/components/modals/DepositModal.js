import React, { useState } from 'react';
import { api } from '../../api';

export default function DepositModal({ account, isOpen, onClose, onSuccess, notify }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !account) return null;

  const currentBalance = Number(account.balance || 0);
  const depositNum = Number(amount || 0);
  const projectedBalance = currentBalance + (depositNum > 0 ? depositNum : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!depositNum || depositNum <= 0) {
      notify('Please enter a valid deposit amount greater than 0', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.deposit(account.accountNumber, depositNum);
      notify(`Successfully deposited KES ${depositNum.toLocaleString()} into ${account.accountHolderName}'s account`, 'success');
      setAmount('');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message || 'Deposit failed', 'error');
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
            <span>📥</span> Deposit Funds
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Beneficiary Account</label>
              <input
                className="form-input"
                disabled
                value={`${account.accountHolderName} (${account.accountNumber})`}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Amount (KES)</label>
              <div className="input-currency-wrapper">
                <span className="input-currency-prefix">KES</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  autoFocus
                  required
                  placeholder="0.00"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="quick-amount-chips">
                {[1000, 5000, 10000, 25000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`amount-chip ${amount === preset.toString() ? 'active' : ''}`}
                    onClick={() => handleChip(preset)}
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="projection-banner">
              <div>
                <div className="projection-label">Current Balance</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  KES {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              <div style={{ textAlign: 'right' }}>
                <div className="projection-label">Projected Balance</div>
                <div className="projection-value">
                  KES {projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading || !depositNum || depositNum <= 0}>
              {loading ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
