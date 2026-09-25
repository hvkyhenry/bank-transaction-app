import React from 'react';

export default function AccountList({ accounts }) {
  return (
    <div className="card wide">
      <h2>All Accounts</h2>
      {accounts.length === 0 ? (
        <p className="hint">No accounts yet. Create one to get started.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Account No.</th>
              <th>Holder</th>
              <th>Balance (KES)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id}>
                <td>{acc.accountNumber}</td>
                <td>{acc.accountHolderName}</td>
                <td>{Number(acc.balance).toLocaleString()}</td>
                <td>
                  <span className={`badge ${acc.status.toLowerCase()}`}>{acc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
