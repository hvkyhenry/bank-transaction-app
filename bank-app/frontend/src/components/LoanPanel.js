import React, { useState } from 'react';
import { api } from '../api';

export default function LoanPanel({ onUpdated, notify }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loan = await api.disburseLoan(accountNumber, parseFloat(amount));
      notify(
        `Loan #${loan.id} of KES ${loan.principalAmount} disbursed to ${accountNumber}`,
        'success'
      );
      onUpdated();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bonus">
      <h2>Bonus: Create Loan &amp; Disburse Funds</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Loan Amount (KES)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Disbursing...' : 'Disburse Loan'}
        </button>
      </form>
      <p className="hint">Defaults to a 10,000 KES loan, disbursed straight to the account balance.</p>
    </div>
  );
}
