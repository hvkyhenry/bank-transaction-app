import React, { useState } from 'react';
import { api } from '../../api';

export default function LoanModal({ account, isOpen, onClose, onSuccess, notify }) {
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !account) return null;

  const currentBalance = Number(account.balance || 0);
  const principal = Number(amount || 0);
  const interestRate = 10.0; // Fixed 10% as defined in backend model
  const interestAmount = (principal * interestRate) / 100;
  const totalRepayment = principal + interestAmount;
  const projectedBalance = currentBalance + (principal > 0 ? principal : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!principal || principal <= 0) {
      notify('Please enter a valid loan amount', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.disburseLoan(account.accountNumber, principal);
      notify(`Loan of KES ${principal.toLocaleString()} disbursed straight to your balance!`, 'success');
      setAmount('10000');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message || 'Loan disbursement failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <span>💰</span> Apex Credit Line & Instant Loan
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Disbursement Target Account</label>
              <input
                className="form-input"
                disabled
                value={`${account.accountHolderName} (${account.accountNumber})`}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loan Principal Amount (KES)</label>
              <div className="input-currency-wrapper">
                <span className="input-currency-prefix">KES</span>
                <input
                  type="number"
                  step="500"
                  min="500"
                  required
                  placeholder="10000"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="quick-amount-chips">
                {[5000, 10000, 20000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`amount-chip ${amount === preset.toString() ? 'active' : ''}`}
                    onClick={() => setAmount(preset.toString())}
                  >
                    KES {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Terms Card */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              marginTop: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Facility Terms</span>
                <span>Immediate Liquidity</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Interest Rate:</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>10.00% Flat</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Interest Charge:</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>
                    KES {interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total Repayment:</span>
                  <strong style={{ display: 'block', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                    KES {totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Disbursement:</span>
                  <strong style={{ display: 'block', color: 'var(--success)' }}>Instant to Balance</strong>
                </div>
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
                <div className="projection-label">Balance After Disbursement</div>
                <div className="projection-value" style={{ color: '#34d399' }}>
                  KES {projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              style={{ background: 'var(--gold-gradient)', color: '#000', fontWeight: 800 }}
              disabled={loading || !principal || principal <= 0}
            >
              {loading ? 'Disbursing Funds...' : `Disburse KES ${principal.toLocaleString()} Now`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
