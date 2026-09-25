import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function CustomerPortal({
  account,
  allAccounts,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onOpenLoan,
  onOpenStatement,
  onOpenCreateAccount,
  onRefresh,
  notify,
}) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dormantInfo, setDormantInfo] = useState(null);

  // Fetch transactions and loans when account changes
  useEffect(() => {
    if (!account) return;

    setLoadingTx(true);
    Promise.all([
      api.getTransactions(account.accountNumber).catch(() => []),
      api.getLoans(account.accountNumber).catch(() => []),
      api.checkDormant(account.accountNumber).catch(() => ({ dormant: false })),
    ])
      .then(([txList, loanList, dormantCheck]) => {
        setTransactions(txList || []);
        setLoans(loanList || []);
        setDormantInfo(dormantCheck);
      })
      .finally(() => {
        setLoadingTx(false);
      });
  }, [account]);

  if (!account) {
    return (
      <div className="content-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>🏦</div>
        <h2 style={{ marginBottom: 8 }}>Welcome to Apex Core Bank</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 24px' }}>
          No accounts found in the system yet. Open your first high-yield checking and transaction account in seconds!
        </p>
        <button className="btn-primary-action" style={{ margin: '0 auto' }} onClick={onOpenCreateAccount}>
          + Open Your First Account
        </button>
      </div>
    );
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify('Account number copied to clipboard', 'info');
  };

  const currentBalance = Number(account.balance || 0);

  // Format account number in groups of 4 for luxury card aesthetics
  const formattedCardNumber = account.accountNumber.replace(/(.{4})/g, '$1 ').trim();

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchQuery ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.relatedAccountNumber && tx.relatedAccountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'DEPOSITS' && (tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN')) ||
      (typeFilter === 'WITHDRAWALS' && (tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT')) ||
      (typeFilter === 'TRANSFERS' && (tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT')) ||
      (typeFilter === 'LOANS' && tx.type === 'LOAN_DISBURSEMENT');

    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Customer Greeting Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Retail Banking Portal
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-white)' }}>
            Welcome back, {account.accountHolderName}
          </h2>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            <span>ID: <strong>{account.nationalId}</strong></span>
            <span>•</span>
            <span>Tel: <strong>{account.phoneNumber}</strong></span>
          </div>
        </div>

        <button
          className="btn-secondary"
          onClick={onRefresh}
          style={{ width: 'auto', padding: '8px 14px' }}
          title="Refresh account balance & transactions"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Hero Section: Virtual Debit Card + Quick Actions */}
      <div className="customer-hero">
        {/* Virtual Bank Card */}
        <div className="virtual-debit-card">
          <div className="card-top">
            <div className="card-emblem">
              <span>🏛</span> APEX PLATINUM
            </div>
            <div className="card-chip"></div>
          </div>

          <div className="card-balance-block">
            <div className="balance-label">Available Balance</div>
            <div className="balance-amount">
              <span className="balance-currency">KES</span>
              {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card-bottom">
            <div className="card-holder-info">
              <div className="card-holder-name">{account.accountHolderName}</div>
              <div className="card-account-number-row">
                <span className="card-account-number">{formattedCardNumber}</span>
                <button className="copy-badge-btn" onClick={handleCopyAccount}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className={`card-status-badge ${account.status.toLowerCase()}`}>
              {account.status}
            </div>
          </div>
        </div>

        {/* Quick Action Services Hub */}
        <div className="quick-actions-card">
          <div>
            <div className="actions-header">
              <div>
                <h3>Banking Services</h3>
                <p>Execute instant transactions & liquidity operations</p>
              </div>
              <button
                className="btn-secondary"
                style={{ width: 'auto', padding: '6px 12px' }}
                onClick={() => onOpenStatement(account, transactions)}
              >
                📄 Statement
              </button>
            </div>

            <div className="action-buttons-grid">
              <button className="action-card-btn" onClick={onOpenDeposit}>
                <div className="action-icon deposit">📥</div>
                <div>
                  <strong>Deposit</strong>
                  <span>Top up balance</span>
                </div>
              </button>

              <button className="action-card-btn" onClick={onOpenWithdraw}>
                <div className="action-icon withdraw">📤</div>
                <div>
                  <strong>Withdraw</strong>
                  <span>Cash / payout</span>
                </div>
              </button>

              <button className="action-card-btn" onClick={onOpenTransfer}>
                <div className="action-icon transfer">🔁</div>
                <div>
                  <strong>Transfer</strong>
                  <span>Move money</span>
                </div>
              </button>

              <button className="action-card-btn" onClick={onOpenLoan}>
                <div className="action-icon loan">💰</div>
                <div>
                  <strong>Request Loan</strong>
                  <span>10% flat facility</span>
                </div>
              </button>
            </div>
          </div>

          <div className="secondary-actions-bar">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🛡 Free Core Transfers</span>
              <span>•</span>
              <span>⚡ 24/7 Real-Time Settlement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Activity Center */}
      <div className="content-section">
        <div className="section-tabs-header">
          <div className="tab-nav-group">
            <button
              className={`tab-item-btn ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <span>📜</span> Statements & Activity Logs
              <span className="tab-badge">{transactions.length}</span>
            </button>
            <button
              className={`tab-item-btn ${activeTab === 'loans' ? 'active' : ''}`}
              onClick={() => setActiveTab('loans')}
            >
              <span>💳</span> My Loans
              <span className="tab-badge">{loans.length}</span>
            </button>
            <button
              className={`tab-item-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <span>🛡</span> KYC & Account Details
            </button>
          </div>

          {activeTab === 'transactions' && (
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <span className="search-icon-placeholder">🔍</span>
                <input
                  type="text"
                  placeholder="Search statements..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="DEPOSITS">Deposits & Inflow</option>
                <option value="WITHDRAWALS">Withdrawals & Outflow</option>
                <option value="TRANSFERS">Transfers</option>
                <option value="LOANS">Loan Disbursements</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Transaction Ledger / Statements */}
        {activeTab === 'transactions' && (
          <div>
            {loadingTx ? (
              <div className="empty-state-box">
                <p>Loading transactions ledger...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">📄</div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No Transactions Found</h4>
                <p>
                  {searchQuery || typeFilter !== 'ALL'
                    ? 'No transactions match the selected filter criteria.'
                    : 'Start by making a deposit or requesting a loan facility above.'}
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Transaction Type & Description</th>
                      <th>Reference / Counterparty</th>
                      <th>Date & Time</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => {
                      const isCredit =
                        tx.type === 'DEPOSIT' ||
                        tx.type === 'TRANSFER_IN' ||
                        tx.type === 'LOAN_DISBURSEMENT';

                      const dateStr = new Date(tx.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const iconType = tx.type.toLowerCase();

                      return (
                        <tr key={tx.id}>
                          <td>
                            <div className="tx-type-cell">
                              <div className={`tx-icon-pill ${iconType}`}>
                                {isCredit ? '↙' : '↗'}
                              </div>
                              <div>
                                <div className="tx-desc-title">
                                  {tx.description || tx.type.replace('_', ' ')}
                                </div>
                                <div className="tx-desc-meta">{tx.type}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {tx.relatedAccountNumber ? (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                {tx.relatedAccountNumber}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {dateStr}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                              {isCredit ? '+' : '-'} KES {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }} className="tx-balance">
                            KES {Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Loans */}
        {activeTab === 'loans' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>Active Credit Facilities</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Borrow against your account with flat 10.00% interest rate and instant liquidity
                </p>
              </div>
              <button className="btn-primary-action" onClick={onOpenLoan}>
                + Apply for Loan
              </button>
            </div>

            {loans.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">💰</div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No Active Loans</h4>
                <p>You currently hold no active loan facilities. Need capital? Apply in seconds.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 20,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loan Facility #{loan.id}</span>
                      <span className="card-status-badge active" style={{ fontSize: 10 }}>{loan.status}</span>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Outstanding Balance</div>
                      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                        KES {Number(loan.outstandingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Principal:</span>
                        <div style={{ fontWeight: 600 }}>KES {Number(loan.principalAmount).toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Interest Rate:</span>
                        <div style={{ fontWeight: 600 }}>{loan.interestRate}% Flat</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Disbursed:</span>
                        <div>{new Date(loan.disbursedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account KYC & Security */}
        {activeTab === 'details' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Account Details & Standing</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-surface-elevated)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account Holder</span>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{account.accountHolderName}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account Number</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{account.accountNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>National ID Number</span>
                <div style={{ fontWeight: 600 }}>{account.nationalId}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Phone Number</span>
                <div style={{ fontWeight: 600 }}>{account.phoneNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account Status</span>
                <div style={{ marginTop: 2 }}>
                  <span className={`card-status-badge ${account.status.toLowerCase()}`}>{account.status}</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dormancy Evaluation</span>
                <div style={{ marginTop: 2 }}>
                  {dormantInfo && dormantInfo.dormant ? (
                    <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>⚠️ Inactive / Dormant</span>
                  ) : (
                    <span style={{ color: '#34d399', fontSize: 13, fontWeight: 700 }}>✓ In Good Standing</span>
                  )}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Account Created</span>
                <div style={{ fontSize: 13 }}>{new Date(account.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last Transaction</span>
                <div style={{ fontSize: 13 }}>
                  {account.lastTransactionAt ? new Date(account.lastTransactionAt).toLocaleString() : 'No activity yet'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
