import React from 'react';

export default function StatementModal({ account, transactions, isOpen, onClose }) {
  if (!isOpen || !account) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentBalance = Number(account.balance || 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <span>📄</span> Official Bank Account Statement
          </h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--border-subtle)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              🖨 Print / PDF
            </button>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="printable-statement">
            <div className="statement-header">
              <div>
                <h2>🏦 APEX CORE BANK</h2>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                  Treasury & Retail Banking Division • Nairobi, Kenya
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#e0e7ff',
                  color: '#3730a3',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  OFFICIAL AUDIT LEDGER
                </span>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
                  Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="statement-customer-info">
              <div>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Account Holder</div>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>{account.accountHolderName}</strong>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  National ID: <strong>{account.nationalId}</strong>
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  Phone: <strong>{account.phoneNumber}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>Account Details</div>
                <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  {account.accountNumber}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                  Status: <strong style={{ color: account.status === 'ACTIVE' ? '#166534' : '#92400e' }}>{account.status}</strong>
                </div>
                <div style={{ fontSize: 15, marginTop: 6, fontWeight: 800, color: '#0369a1' }}>
                  Current Balance: KES {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <h4 style={{ color: '#0f172a', marginBottom: 12, fontSize: 15 }}>Transaction Ledger</h4>

            {(!transactions || transactions.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                No recorded transaction history for this period.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#0f172a' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 12 }}>Date & Time</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 12 }}>Type</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 12 }}>Description / Reference</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12 }}>Amount (KES)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12 }}>Balance (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' || tx.type === 'LOAN_DISBURSEMENT';
                    const formattedDate = new Date(tx.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 10px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formattedDate}
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600 }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            background: isCredit ? '#dcfce7' : '#fee2e2',
                            color: isCredit ? '#15803d' : '#b91c1c'
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 12 }}>
                          {tx.description || 'Standard transaction'}
                          {tx.relatedAccountNumber && (
                            <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>
                              Ref: {tx.relatedAccountNumber}
                            </span>
                          )}
                        </td>
                        <td style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontSize: 13,
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: isCredit ? '#15803d' : '#b91c1c'
                        }}>
                          {isCredit ? '+' : '-'} {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 13, fontFamily: 'monospace' }}>
                          {Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
