import React, { useState } from 'react';
import { api } from '../api';

export default function DeleteAccount({ onUpdated, notify }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const checkDormant = async () => {
    setChecking(true);
    try {
      const res = await fetch(`http://localhost:8080/api/accounts/${accountNumber}/dormant-check`);
      const data = await res.json();
      notify(
        data.dormant
          ? `Account ${accountNumber} IS dormant and eligible for deletion`
          : `Account ${accountNumber} is NOT dormant`,
        data.dormant ? 'success' : 'error'
      );
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      const res = await api.deleteDormantAccount(accountNumber);
      notify(res.message, 'success');
      setAccountNumber('');
      onUpdated();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card">
      <h2>5. Delete Dormant Account</h2>
      <form onSubmit={handleDelete}>
        <input
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
        />
        <div className="button-row">
          <button type="button" onClick={checkDormant} disabled={checking || !accountNumber}>
            {checking ? 'Checking...' : 'Check Dormancy'}
          </button>
          <button type="submit" className="danger" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </form>
      <p className="hint">
        An account is dormant when it has had no transactions for 90+ days and holds a zero balance.
      </p>
    </div>
  );
}
