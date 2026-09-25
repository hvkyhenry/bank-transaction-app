import React, { useState, useEffect } from 'react';
import { api } from '../../api';

export default function DeleteDormantModal({ account, isOpen, onClose, onSuccess, notify }) {
  const [checking, setChecking] = useState(true);
  const [isDormant, setIsDormant] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && account) {
      setChecking(true);
      api.checkDormant(account.accountNumber)
        .then((res) => {
          setIsDormant(Boolean(res.dormant));
        })
        .catch(() => {
          setIsDormant(account.status === 'DORMANT');
        })
        .finally(() => {
          setChecking(false);
        });
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const hasBalance = Number(account.balance) > 0;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.deleteDormantAccount(account.accountNumber);
      notify(`Dormant account ${account.accountNumber} successfully purged`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      notify(err.message || 'Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <span>🛡</span> Dormant Account Deletion
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Target Account</label>
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontWeight: 700 }}>{account.accountHolderName}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                {account.accountNumber} • Balance: KES {Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {checking ? (
            <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Checking dormancy qualifications against core bank ledger...
            </div>
          ) : hasBalance ? (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              fontSize: 13,
              color: '#fb7185'
            }}>
              <strong>⛔ Cannot Delete Account</strong>
              <p style={{ marginTop: 4 }}>
                This account holds an active balance of <strong>KES {Number(account.balance).toLocaleString()}</strong>.
                Bank regulations strictly forbid deleting accounts with positive funds. Funds must be withdrawn first.
              </p>
            </div>
          ) : !isDormant ? (
            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              fontSize: 13,
              color: '#fbbf24'
            }}>
              <strong>⚠️ Ineligible for Dormancy Deletion</strong>
              <p style={{ marginTop: 4 }}>
                This account has recorded transaction activity within the last 90 days.
                Only accounts inactive for 90+ consecutive days and with zero balance can be deleted.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              fontSize: 13,
              color: '#f8fafc'
            }}>
              <strong style={{ color: '#fb7185' }}>⚠️ Confirmation Required</strong>
              <p style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                This account qualifies as <strong>DORMANT</strong> (90+ days inactive, zero balance).
                Deleting will permanently purge this account and its records from the system.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-submit danger"
            onClick={handleDelete}
            disabled={loading || checking || hasBalance || !isDormant}
          >
            {loading ? 'Purging...' : 'Delete Dormant Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
