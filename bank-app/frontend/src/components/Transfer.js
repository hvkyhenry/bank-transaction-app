import React, { useState } from 'react';
import { api } from '../api';

export default function Transfer({ onUpdated, notify }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.transfer(source, destination, parseFloat(amount));
      notify(`Transferred KES ${amount} from ${source} to ${destination}`, 'success');
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
      <h2>4. Transfer Funds</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Source Account Number"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />
        <input
          placeholder="Destination Account Number"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
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
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
}
