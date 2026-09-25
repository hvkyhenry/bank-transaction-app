import React, { useState } from 'react';
import { api } from '../api';

export default function Deposit({ onUpdated, notify }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const account = await api.deposit(accountNumber, parseFloat(amount));
      notify(`Deposited KES ${amount} to ${account.accountNumber}. New balance: ${account.balance}`, 'success');
      setAmount('');
      onUpdated();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>2. Deposit Funds</h2>
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
          placeholder="Amount (KES)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>
    </div>
  );
}
