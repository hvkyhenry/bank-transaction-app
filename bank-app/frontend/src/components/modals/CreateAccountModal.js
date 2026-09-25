import React, { useState } from 'react';
import { api } from '../../api';

export default function CreateAccountModal({ isOpen, onClose, onSuccess, notify }) {
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !nationalId.trim() || !phone.trim()) {
      notify('Please fill out all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const newAcc = await api.createAccount({
        accountHolderName: name.trim(),
        nationalId: nationalId.trim(),
        phoneNumber: phone.trim(),
      });

      notify(`Account created successfully! Number: ${newAcc.accountNumber}`, 'success');
      setName('');
      setNationalId('');
      setPhone('');
      onSuccess(newAcc);
      onClose();
    } catch (err) {
      notify(err.message || 'Account creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <span>🏛</span> Open New Bank Account
          </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Customer Name</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Jane Wanjiru Kimani"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">National ID / Passport Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 28491023"
                className="form-input"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Phone Number</label>
              <input
                type="tel"
                required
                placeholder="e.g. +254 712 345 678"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: 12,
              color: 'var(--text-secondary)'
            }}>
              ℹ️ A unique system account number (e.g. <strong style={{ color: 'var(--text-white)' }}>KE•••••••••</strong>) will be generated automatically with an initial balance of KES 0.00.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !name.trim() || !nationalId.trim() || !phone.trim()}
            >
              {loading ? 'Creating Account...' : 'Open Account Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
