import React, { useState } from 'react';
import { api } from '../api';

export default function CreateAccount({ onCreated, notify }) {
  const [form, setForm] = useState({ accountHolderName: '', nationalId: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const account = await api.createAccount(form);
      notify(`Account created: ${account.accountNumber}`, 'success');
      setForm({ accountHolderName: '', nationalId: '', phoneNumber: '' });
      onCreated();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>1. Create Bank Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="accountHolderName"
          placeholder="Full Name"
          value={form.accountHolderName}
          onChange={handleChange}
          required
        />
        <input
          name="nationalId"
          placeholder="National ID"
          value={form.nationalId}
          onChange={handleChange}
          required
        />
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
